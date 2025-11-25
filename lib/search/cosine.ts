/**
 * Calculates the cosine similarity between two vectors.
 * Vectors must be of the same length.
 * 
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Cosine similarity score (-1 to 1)
 */
export function cosineSimilarity(vecA: Float32Array | number[], vecB: Float32Array | number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface ScoredResult<T> {
    item: T;
    score: number;
}

/**
 * Finds the top N most similar vectors to a query vector.
 * 
 * @param queryVec - Query vector
 * @param items - Array of items containing vectors
 * @param getVector - Function to extract vector from an item
 * @param topN - Number of results to return
 * @param minScore - Minimum similarity score (optional)
 * @returns Array of items with their similarity scores, sorted by score descending
 */
export function findTopN<T>(
    queryVec: Float32Array | number[],
    items: T[],
    getVector: (item: T) => Float32Array | number[],
    topN: number,
    minScore: number = 0
): ScoredResult<T>[] {
    const results: ScoredResult<T>[] = [];

    // Calculate scores for all items
    // Optimization: We could use a min-heap for topN if N is small and items is huge,
    // but for ~2000 items, a full sort is fast enough (< 5ms).
    for (const item of items) {
        const vector = getVector(item);
        const score = cosineSimilarity(queryVec, vector);

        if (score >= minScore) {
            results.push({ item, score });
        }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Return top N
    return results.slice(0, topN);
}
