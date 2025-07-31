import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient, OpenRouterPool } from '../../../lib/ai/openrouter-client';
import { ContextGenerator, ContextConfig } from '../../../lib/ai/context';
import { HallucinationDetector } from '../../../lib/ai/hallucination-detection';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatRequest {
  message: string;
  selectedMarkets?: string[];
  ingredients?: string[];
  model?: string;
  useSemanticSearch?: boolean;
}

export async function POST(request: NextRequest) {
  let message = '';
  try {
    const requestData: ChatRequest = await request.json();
    message = requestData.message;
    const { selectedMarkets, ingredients, model, useSemanticSearch } = requestData;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const config: ContextConfig = {
      selectedMarkets: selectedMarkets || ['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny'],
      maxProducts: 50,
    };

    const semanticSearchEnabled = useSemanticSearch !== false; // Default true, explicit false disables

    const { systemMessage, contextMessage } = await ContextGenerator.generateFullContext(
      message,
      config,
      ingredients || [],
      { useSemanticSearch: semanticSearchEnabled }
    );

    // Context generated successfully

    const client = OpenRouterPool.getClient(model || 'x-ai/grok-2-1212');

    const messages = [
      { role: 'system' as const, content: systemMessage },
      { role: 'user' as const, content: `${contextMessage}\n\nBenutzeranfrage: ${message}` },
    ];

    const stream = await client.createStreamingCompletion(messages, { 
      model: model || 'x-ai/grok-3-mini',
      maxTokens: 8000,
      temperature: 0.7,
      stream: true 
    });

    if (!stream || typeof (stream as any)[Symbol.asyncIterator] !== 'function') {
      throw new Error('Invalid streaming response from OpenRouter');
    }

    let fullResponse = '';
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream as any) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // Hallucination detection (ohne Warning-Ausgabe)
          const hallucinationCheck = HallucinationDetector.validateResponse(fullResponse);

          const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(endData));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ 
            error: 'Ein Fehler ist beim Streaming aufgetreten.' 
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Ein Fehler ist beim Chat aufgetreten. Bitte versuchen Sie es erneut.',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Chat API is running' });
}