import OpenAI from 'openai';
import { env } from '../utils/env';

export interface OpenRouterConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export class OpenRouterClient {
  private client: OpenAI;
  private defaultConfig: OpenRouterConfig;
  private requestTimeout: number;

  constructor(config: OpenRouterConfig = {}) {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is required');
    }

    this.requestTimeout = 55000; // 55 seconds - unter Vercel Pro Limit (60s)

    this.client = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: this.requestTimeout,
      defaultHeaders: {
        'HTTP-Referer': env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': env.NEXT_PUBLIC_APP_TITLE || 'SparFuchs.de',
      },
    });

    this.defaultConfig = {
      model: 'x-ai/grok-3-mini',
      temperature: 0.7,
      stream: true,
      ...config,
    };
  }

  async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: OpenRouterConfig = {}
  ) {
    const finalConfig = { ...this.defaultConfig, ...config };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Vercel limit reached')), this.requestTimeout);
    });

    try {
      const requestPromise = this.client.chat.completions.create({
        model: finalConfig.model!,
        messages,
        max_tokens: finalConfig.maxTokens,
        temperature: finalConfig.temperature,
        stream: finalConfig.stream,
      });

      const response = await Promise.race([requestPromise, timeoutPromise]);
      return response;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es mit einer kürzeren Anfrage.');
      }
      
      throw new Error(`OpenRouter request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createStreamingCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: OpenRouterConfig = {}
  ) {
    return this.createChatCompletion(messages, { ...config, stream: true });
  }

  async createNonStreamingCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: OpenRouterConfig = {}
  ) {
    return this.createChatCompletion(messages, { ...config, stream: false });
  }

  /**
   * Spezialisierte Methode für Produktanalyse (semantische Suche)
   */
  async createCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: OpenRouterConfig = {}
  ) {
    const finalConfig = { 
      ...this.defaultConfig, 
      ...config, 
      stream: false,  // Für Produktanalyse immer non-streaming
      temperature: 0.1  // Niedrige Temperatur für präzise Ergebnisse
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - Vercel limit reached')), this.requestTimeout);
    });

    try {
      const requestPromise = this.client.chat.completions.create({
        model: finalConfig.model!,
        messages,
        max_tokens: finalConfig.maxTokens,
        temperature: finalConfig.temperature,
        stream: false,
      });

      const response = await Promise.race([requestPromise, timeoutPromise]);
      return response;
    } catch (error) {
      console.error('OpenRouter Completion Error:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Die Produktanalyse hat zu lange gedauert.');
      }
      
      throw new Error(`OpenRouter completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels() {
    return [
      'x-ai/grok-3-mini',
      'x-ai/grok-2-1212',
      'anthropic/claude-3-5-sonnet-20241022',
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'meta-llama/llama-3.2-90b-vision-instruct',
      'google/gemini-2.0-flash-exp',
    ];
  }
}

export class OpenRouterPool {
  private static clients: Map<string, OpenRouterClient> = new Map();
  private static maxClients = 3;

  static getClient(model?: string): OpenRouterClient {
    const clientKey = model || 'default';
    
    if (!this.clients.has(clientKey)) {
      if (this.clients.size >= this.maxClients) {
        const firstKey = this.clients.keys().next().value;
        if (firstKey) {
          this.clients.delete(firstKey);
        }
      }
      
      this.clients.set(clientKey, new OpenRouterClient({ model }));
    }
    
    return this.clients.get(clientKey)!;
  }

  static clearPool(): void {
    this.clients.clear();
  }
}

export const openRouterClient = new OpenRouterClient();