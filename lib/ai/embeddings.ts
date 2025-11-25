import { cacheEmbedding, getCachedEmbedding } from '@/lib/search/embedding-cache';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-large';

if (!OPENROUTER_API_KEY && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ OPENROUTER_API_KEY is missing. Semantic search will not work.');
}

/**
 * Generates an embedding for the given text using OpenRouter.
 * Uses local LRU cache to avoid redundant API calls.
 */
export async function createEmbedding(text: string): Promise<Float32Array> {
    // 1. Check Cache
    const cached = getCachedEmbedding(text);
    if (cached) {
        return cached;
    }

    // 2. API Call
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': 'https://sparfuchs.de', // Optional: for OpenRouter rankings
                // 'X-Title': 'SparFuchs',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: text,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();

        if (!data.data || !data.data[0] || !data.data[0].embedding) {
            throw new Error('Invalid response format from Embedding API');
        }

        const embedding = new Float32Array(data.data[0].embedding);

        // 3. Update Cache
        cacheEmbedding(text, embedding);

        return embedding;

    } catch (error) {
        console.error('❌ Embedding Generation Failed:', error);
        throw error;
    }
}
