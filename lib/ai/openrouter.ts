/**
 * OpenRouter AI Client für Chat Completions mit Streaming
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash-lite';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Ruft OpenRouter Chat Completions API auf
 * @param options - Chat-Optionen
 * @param onChunk - Callback für Streaming-Chunks (nur wenn stream=true)
 * @returns Response oder void bei Streaming
 */
export async function createChatCompletion(
  options: ChatCompletionOptions,
  onChunk?: (chunk: string) => void
): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY ist nicht gesetzt');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appTitle = process.env.NEXT_PUBLIC_APP_TITLE || 'SparFuchs.de';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': appUrl,
      'X-Title': appTitle,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 6000,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API Fehler: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return response;
}

/**
 * Parst Server-Sent Events (SSE) Stream
 * @param response - Fetch Response
 * @param onChunk - Callback für jeden Content-Chunk
 */
export async function parseStreamingResponse(
  response: Response,
  onChunk: (content: string) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body ist nicht lesbar');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Behalte letzte unvollständige Zeile im Buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || line.trim() === 'data: [DONE]') continue;

        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6); // Entferne "data: " Prefix
            const data = JSON.parse(jsonStr);

            // Extrahiere Content aus Delta
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (parseError) {
            console.error('Fehler beim Parsen von SSE-Zeile:', parseError);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
