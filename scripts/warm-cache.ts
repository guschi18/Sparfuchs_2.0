#!/usr/bin/env tsx

import { ProductDataService } from '../lib/data/product-data';
import { SemanticSearchService } from '../lib/ai/semantic-search';

/**
 * Cache-Warming Script für Production
 * Berechnet häufige Suchbegriffe vor und speichert sie im Cache
 */
async function warmSemanticSearchCache() {
  console.log('🔥 Starting Semantic Search Cache Warming');
  console.log('=========================================');

  try {
    // Alle Produkte laden
    const allProducts = ProductDataService.getAllProducts();
    console.log(`📦 Loaded ${allProducts.products.length} products`);

    // Semantic Search Service initialisieren
    const semanticSearchService = SemanticSearchService.getInstance();

    // Häufige deutsche Suchbegriffe
    const commonSearchTerms = [
      // Lebensmittel-Grundkategorien
      'milch', 'brot', 'butter', 'käse', 'fleisch', 'wurst',
      'obst', 'gemüse', 'nudeln', 'reis', 'mehl', 'zucker',
      'eier', 'joghurt', 'quark', 'sahne',
      
      // Spezifische Produkte
      'äpfel', 'bananen', 'tomaten', 'gurken', 'zwiebeln',
      'hähnchen', 'schwein', 'rind', 'lachs', 'thunfisch',
      'schokolade', 'kekse', 'chips', 'nüsse',
      
      // Getränke
      'wasser', 'saft', 'cola', 'bier', 'wein', 'kaffee', 'tee',
      
      // Eigenschaften
      'bio', 'glutenfrei', 'laktosefrei', 'vegan', 'vollkorn',
      'frisch', 'tiefkühl', 'konserve',
      
      // Marken-Suchen
      'aldi', 'lidl', 'rewe', 'edeka', 'penny',
      
      // Kategorien
      'süßwaren', 'backwaren', 'tiefkühlkost', 'getränke',
      'molkereiprodukte', 'fleischwaren'
    ];

    console.log(`🎯 Warming cache for ${commonSearchTerms.length} terms...`);

    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Cache für jeden Begriff vorberechnen
    for (let i = 0; i < commonSearchTerms.length; i++) {
      const term = commonSearchTerms[i];
      const progress = Math.round(((i + 1) / commonSearchTerms.length) * 100);
      
      try {
        console.log(`[${progress}%] 🔄 Warming: "${term}"`);
        
        const results = await semanticSearchService.findRelevantProducts(
          term,
          allProducts.products,
          {
            markets: ['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny'],
            maxResults: 20,
            useCache: false // Force fresh computation
          }
        );

        console.log(`✅ "${term}" -> ${results.products.length} products (${results.searchTime}ms)`);
        successCount++;

        // Kurze Pause um API-Limits zu vermeiden
        if (i < commonSearchTerms.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Failed to warm "${term}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    const totalTime = Date.now() - startTime;
    const cacheStats = semanticSearchService.getCacheStats();

    console.log('\n🎉 Cache Warming Complete!');
    console.log('==========================');
    console.log(`✅ Successfully warmed: ${successCount} terms`);
    console.log(`❌ Failed: ${errorCount} terms`);
    console.log(`💾 Cache size: ${cacheStats.size} entries`);
    console.log(`⏱️ Total time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📊 Average time per term: ${Math.round(totalTime / commonSearchTerms.length)}ms`);

    // Cache-Inhalt anzeigen
    console.log('\n💾 Cached Terms:');
    cacheStats.entries.slice(0, 10).forEach(term => {
      console.log(`   - ${term}`);
    });
    
    if (cacheStats.entries.length > 10) {
      console.log(`   ... and ${cacheStats.entries.length - 10} more`);
    }

    // Erfolgs-Rate berechnen
    const successRate = Math.round((successCount / commonSearchTerms.length) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (successRate < 80) {
      console.warn('⚠️ Low success rate detected. Check OpenRouter API connectivity.');
      process.exit(1);
    }

    console.log('🚀 Cache is ready for production!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Cache warming failed:', error);
    process.exit(1);
  }
}

/**
 * Test Cache Performance
 */
async function testCachePerformance() {
  console.log('\n🏃 Testing Cache Performance');
  console.log('============================');

  const testTerms = ['milch', 'brot', 'äpfel'];
  const semanticSearchService = SemanticSearchService.getInstance();
  const allProducts = ProductDataService.getAllProducts();

  for (const term of testTerms) {
    console.log(`\n⚡ Testing "${term}"`);
    
    // Erste Anfrage (Cache Miss)
    const startTime1 = Date.now();
    const result1 = await semanticSearchService.findRelevantProducts(
      term,
      allProducts.products,
      { useCache: false }
    );
    const time1 = Date.now() - startTime1;

    // Zweite Anfrage (Cache Hit)
    const startTime2 = Date.now();
    const result2 = await semanticSearchService.findRelevantProducts(
      term,
      allProducts.products,
      { useCache: true }
    );
    const time2 = Date.now() - startTime2;

    console.log(`   First call (no cache): ${time1}ms -> ${result1.products.length} products`);
    console.log(`   Second call (cached):  ${time2}ms -> ${result2.products.length} products`);
    console.log(`   Performance improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
  }
}

// Hauptfunktion
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'warm':
      await warmSemanticSearchCache();
      break;
    
    case 'test':
      await testCachePerformance();
      break;
    
    default:
      console.log('Usage:');
      console.log('  npm run cache:warm  - Warm the semantic search cache');
      console.log('  npm run cache:test  - Test cache performance');
      break;
  }
}

// Script ausführen wenn direkt aufgerufen
if (require.main === module) {
  main().catch(console.error);
}

export { warmSemanticSearchCache, testCachePerformance };