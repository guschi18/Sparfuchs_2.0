import { LRUCache } from 'lru-cache';
import { SEMANTIC_SEARCH_CONFIG } from '@/lib/utils/constants';

// Cache for query embeddings to save API calls and latency
// Key: Normalized query string
// Value: Float32Array (embedding vector)
const embeddingCache = new LRUCache<string, Float32Array>({
    max: SEMANTIC_SEARCH_CONFIG.CACHE_SIZE,
    // Optional: TTL can be added if we think embeddings might change (unlikely for same model)
    // ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export const cacheStats = {
    hits: 0,
    misses: 0,
};

/**
 * Retrieves a cached embedding for a query if available.
 */
export function getCachedEmbedding(query: string): Float32Array | undefined {
    const normalizedQuery = query.trim().toLowerCase();
    const cached = embeddingCache.get(normalizedQuery);

    if (cached) {
        cacheStats.hits++;
        return cached;
    }

    cacheStats.misses++;
    return undefined;
}

/**
 * Stores an embedding in the cache.
 */
export function cacheEmbedding(query: string, embedding: number[] | Float32Array): void {
    const normalizedQuery = query.trim().toLowerCase();
    // Ensure we store as Float32Array for performance in cosine similarity
    const vector = embedding instanceof Float32Array ? embedding : new Float32Array(embedding);
    embeddingCache.set(normalizedQuery, vector);
}

/**
 * Returns current cache statistics.
 */
export function getCacheStats() {
    return {
        ...cacheStats,
        size: embeddingCache.size,
    };
}
