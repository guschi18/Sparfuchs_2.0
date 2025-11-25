import fs from 'fs';
import path from 'path';
import { createEmbedding } from '@/lib/ai/embeddings';
import { findTopN } from '@/lib/search/cosine';
import { SEMANTIC_SEARCH_CONFIG } from '@/lib/utils/constants';
import { toProductCard, normalizeText } from '@/lib/data/offers';
import type { OfferEmbedding, ProductCard } from '@/types';

// In-memory cache for the offer index
let offerIndexCache: OfferEmbedding[] | null = null;

/**
 * Loads the offer index from disk.
 * Caches the result in memory for subsequent requests.
 */
function loadOfferIndex(): OfferEmbedding[] {
    if (offerIndexCache) {
        return offerIndexCache;
    }

    try {
        const filePath = path.join(process.cwd(), 'storage', 'embeddings', 'offers.v1.json');
        if (!fs.existsSync(filePath)) {
            console.warn('⚠️ Semantic search index not found at:', filePath);
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent) as OfferEmbedding[];

        // Convert regular arrays to Float32Array for performance
        offerIndexCache = data.map(item => ({
            ...item,
            vector: new Float32Array(item.vector) as any // Type assertion to match interface if it expects number[]
        }));

        console.log(`📦 Loaded ${offerIndexCache.length} offers into semantic index`);
        return offerIndexCache;
    } catch (error) {
        console.error('❌ Error loading semantic index:', error);
        return [];
    }
}

/**
 * Performs a semantic search for offers.
 * 
 * @param query - The user's search query
 * @param selectedMarkets - List of markets to filter by (e.g. ['Aldi', 'Lidl'])
 * @param topN - Max number of results (default: from config)
 * @returns Promise resolving to ProductCard[]
 */
export async function semanticSearch(
    query: string,
    selectedMarkets: string[] = [],
    topN: number = SEMANTIC_SEARCH_CONFIG.TOP_N
): Promise<ProductCard[]> {
    // 1. Load Index
    const index = loadOfferIndex();
    if (index.length === 0) {
        return [];
    }

    // 2. Filter by Market (Pre-filtering for performance)
    let candidates = index;
    if (selectedMarkets.length > 0) {
        const normalizedMarkets = selectedMarkets.map(m => normalizeText(m));
        candidates = index.filter(item => {
            const itemMarket = normalizeText(item.market);
            return normalizedMarkets.some(m => itemMarket === m);
        });
    }

    if (candidates.length === 0) {
        return [];
    }

    try {
        // 3. Generate Query Embedding
        const queryVector = await createEmbedding(query);

        // 4. Perform Cosine Similarity Search
        const results = findTopN(
            queryVector,
            candidates,
            (item) => item.vector,
            topN,
            SEMANTIC_SEARCH_CONFIG.MIN_SCORE
        );

        // 5. Convert to ProductCards
        return results.map(result => toProductCard(result.item.metadata));

    } catch (error) {
        console.error('❌ Semantic search failed:', error);
        return []; // Fail gracefully
    }
}
