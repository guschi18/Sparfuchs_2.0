/**
 * PUNKT 4 TEST: Produktsuche (Hybrid-Ansatz)
 * Test für Intent-basierte Vorfilterung + traditionelle/KI-Suche
 */

const fs = require('fs');
const path = require('path');

// Intent-Daten aus Punkt 3
const BUTTER_INTENT = {
  "primaryIntent": "butter",
  "includeCategories": [
    "Milchprodukte (Butter)",
    "Butter/Margarine",
    "Milchprodukte/Butter",
    "Butter & Margarine"
  ],
  "excludeCategories": [
    "Backwaren",
    "Gebäck",
    "Süßwaren",
    "Kekse",
    "Buttergebäck",
    "Desserts"
  ],
  "keywords": [
    "streichfett",
    "margarine",
    "butterfett",
    "kräuterbutter"
  ],
  "confidence": 0.4444444444444444
};

// Lade echte Produktdaten
function loadRealProductData() {
  try {
    const productsPath = path.join(__dirname, '..', 'lib', 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    console.log(`📊 Loaded ${productsData.products.length} products from products.json`);
    return productsData.products;
  } catch (error) {
    console.log('❌ Could not load real product data, using mock data');
    // Mock-Daten für Test
    return [
      { id: 'p1', productName: 'Kerrygold Butter', category: 'Milchprodukte', subCategory: 'Butter', supermarket: 'Lidl', price: 2.49 },
      { id: 'p2', productName: 'Rama Margarine', category: 'Milchprodukte', subCategory: 'Margarine', supermarket: 'Aldi', price: 1.29 },
      { id: 'p3', productName: 'Lätta Halbfettmargarine', category: 'Milchprodukte', subCategory: 'Margarine', supermarket: 'Edeka', price: 1.59 },
      { id: 'p4', productName: 'BISCOTTO Buttergebäck', category: 'Backwaren', subCategory: 'Gebäck', supermarket: 'Penny', price: 2.99 },
      { id: 'p5', productName: 'Müller Milch', category: 'Milchprodukte', subCategory: 'Milch', supermarket: 'Rewe', price: 1.09 },
      { id: 'p6', productName: 'Nutella Brotaufstrich', category: 'Süßwaren', subCategory: 'Aufstriche', supermarket: 'Lidl', price: 3.49 },
      { id: 'p7', productName: 'Landliebe Butter', category: 'Milchprodukte', subCategory: 'Butter', supermarket: 'Aldi', price: 2.19 },
      { id: 'p8', productName: 'Kräuterbutter TK', category: 'Milchprodukte', subCategory: 'Butter', supermarket: 'Edeka', price: 1.99 }
    ];
  }
}

// Schritt 4.1: Intent-basierte Vorfilterung
function intentBasedPrefiltering(products, intent) {
  console.log('🎯 SCHRITT 4.1: INTENT-BASIERTE VORFILTERUNG');
  console.log('===============================================');
  
  if (!intent) {
    console.log('❌ Kein Intent - alle Produkte beibehalten');
    return { filteredProducts: products, reductionStats: { before: products.length, after: products.length, reductionPercent: 0 } };
  }
  
  const originalCount = products.length;
  console.log(`📊 Original Product Count: ${originalCount}`);
  console.log(`🎯 Intent: "${intent.primaryIntent}"`);
  console.log(`✅ Include Categories: ${intent.includeCategories.join(', ')}`);
  console.log(`❌ Exclude Categories: ${intent.excludeCategories.join(', ')}`);
  
  const filteredProducts = products.filter(product => {
    // Positive Kategorien-Filter
    const matchesIncludeCategory = intent.includeCategories.some(includeCategory => 
      product.category.toLowerCase().includes(includeCategory.toLowerCase()) ||
      product.subCategory.toLowerCase().includes(includeCategory.toLowerCase()) ||
      includeCategory.toLowerCase().includes(product.category.toLowerCase()) ||
      includeCategory.toLowerCase().includes(product.subCategory.toLowerCase())
    );
    
    // Negative Kategorien-Filter  
    const matchesExcludeCategory = intent.excludeCategories.some(excludeCategory =>
      product.category.toLowerCase().includes(excludeCategory.toLowerCase()) ||
      product.subCategory.toLowerCase().includes(excludeCategory.toLowerCase()) ||
      excludeCategory.toLowerCase().includes(product.category.toLowerCase()) ||
      excludeCategory.toLowerCase().includes(product.subCategory.toLowerCase())
    );
    
    const isRelevant = matchesIncludeCategory && !matchesExcludeCategory;
    
    if (isRelevant) {
      console.log(`   ✅ INCLUDED: "${product.productName}" (${product.category}/${product.subCategory}) - ${product.supermarket}`);
    } else if (matchesExcludeCategory) {
      console.log(`   ❌ EXCLUDED: "${product.productName}" (${product.category}/${product.subCategory}) - REASON: Matches exclude category`);
    } else if (!matchesIncludeCategory) {
      console.log(`   ⚪ FILTERED: "${product.productName}" (${product.category}/${product.subCategory}) - REASON: No include category match`);
    }
    
    return isRelevant;
  });

  const finalCount = filteredProducts.length;
  const reductionPercent = originalCount > 0 ? 
    Math.round(((originalCount - finalCount) / originalCount) * 100) : 0;

  console.log(`\n📊 VORFILTERUNG ERGEBNIS:`);
  console.log(`   Original: ${originalCount} Produkte`);
  console.log(`   Gefiltert: ${finalCount} Produkte`);
  console.log(`   Reduktion: -${reductionPercent}% (${originalCount} → ${finalCount})`);

  return {
    filteredProducts,
    reductionStats: {
      before: originalCount,
      after: finalCount,
      reductionPercent
    }
  };
}

// Schritt 4.2: Traditionelle Suche auf vorgefiltertem Set
function traditionalSearch(products, query) {
  console.log('\n🎯 SCHRITT 4.2: TRADITIONELLE SUCHE');
  console.log('====================================');
  
  console.log(`🔍 Query: "${query}"`);
  console.log(`📊 Search on ${products.length} pre-filtered products`);
  
  const queryWords = query.toLowerCase().split(/\s+/);
  const enhancedQuery = expandQuery(query.toLowerCase());
  
  console.log(`🔍 Query Words: ${JSON.stringify(queryWords)}`);
  console.log(`🔍 Enhanced Query: ${JSON.stringify(enhancedQuery)}`);
  
  const matchingProducts = products.filter(product => {
    const searchText = `${product.productName} ${product.category} ${product.subCategory}`.toLowerCase();
    
    // Multi-Level-Matching
    const matches = {
      directMatch: queryWords.some(word => searchText.includes(word)),
      synonymMatch: enhancedQuery.some(term => searchText.includes(term)),
      umlautMatch: queryWords.some(word => {
        const normalized = word.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue');
        return searchText.includes(normalized);
      }),
      substringMatch: queryWords.some(word => {
        if (word.length > 3) {
          return searchText.includes(word.substring(0, Math.max(3, word.length - 1)));
        }
        return false;
      })
    };
    
    const isMatch = matches.directMatch || matches.synonymMatch || matches.umlautMatch || matches.substringMatch;
    
    if (isMatch) {
      const matchTypes = [];
      if (matches.directMatch) matchTypes.push('direct');
      if (matches.synonymMatch) matchTypes.push('synonym');
      if (matches.umlautMatch) matchTypes.push('umlaut');
      if (matches.substringMatch) matchTypes.push('substring');
      
      console.log(`   ✅ MATCH: "${product.productName}" (${matchTypes.join(', ')})`);
    }
    
    return isMatch;
  });

  console.log(`\n📊 TRADITIONELLE SUCHE ERGEBNIS:`);
  console.log(`   Input: ${products.length} Produkte`);
  console.log(`   Output: ${matchingProducts.length} Produkte`);
  
  return matchingProducts;
}

// Query-Erweiterung für bessere Suche
function expandQuery(query) {
  const expansions = {
    'butter': ['kräuterbutter', 'butterkäse', 'margarine', 'streichfett'],
    'margarine': ['butter', 'streichfett', 'pflanzenmargarine'],
    'milch': ['vollmilch', 'frischmilch', 'landmilch', 'weidemilch', 'biomilch'],
  };

  const words = query.split(/\s+/);
  const expandedTerms = [];
  
  words.forEach(word => {
    if (expansions[word]) {
      expandedTerms.push(...expansions[word]);
    }
  });
  
  return expandedTerms;
}

// Schritt 4.3: Markt-Sortierung (Business Rule)
function applyMarketSorting(products, selectedMarkets = ['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe']) {
  console.log('\n🎯 SCHRITT 4.3: MARKT-SORTIERUNG');
  console.log('==================================');
  
  console.log(`🏪 Market Order: ${selectedMarkets.join(' → ')}`);
  
  const sortedProducts = products.sort((a, b) => {
    const indexA = selectedMarkets.indexOf(a.supermarket);
    const indexB = selectedMarkets.indexOf(b.supermarket);
    
    const finalIndexA = indexA === -1 ? 999 : indexA;
    const finalIndexB = indexB === -1 ? 999 : indexB;
    
    return finalIndexA - finalIndexB;
  });
  
  console.log('📊 Sorted Products:');
  sortedProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.productName} - ${product.supermarket} (${product.price.toFixed(2)}€)`);
  });
  
  return sortedProducts;
}

// HAUPT-TEST AUSFÜHRUNG
function testProductSearch() {
  console.log('🧪 PUNKT 4: PRODUKTSUCHE TEST - START');
  console.log('======================================\n');
  
  // Test-Parameter
  const query = "Wo ist Butter im Angebot";
  const selectedMarkets = ['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe'];
  
  console.log(`📝 Test Query: "${query}"`);
  console.log(`🏪 Selected Markets: ${selectedMarkets.join(', ')}`);
  console.log('');
  
  // Lade Produktdaten
  const allProducts = loadRealProductData();
  
  // SCHRITT 4.1: Intent-basierte Vorfilterung
  const prefilterResult = intentBasedPrefiltering(allProducts, BUTTER_INTENT);
  
  // SCHRITT 4.2: Traditionelle Suche
  const searchResults = traditionalSearch(prefilterResult.filteredProducts, query);
  
  // SCHRITT 4.3: Markt-Sortierung
  const finalResults = applyMarketSorting(searchResults, selectedMarkets);
  
  // GESAMT-STATISTIKEN
  console.log('\n📊 GESAMT-STATISTIKEN:');
  console.log('======================');
  console.log(`Original Products: ${allProducts.length}`);
  console.log(`After Intent Filter: ${prefilterResult.filteredProducts.length} (-${prefilterResult.reductionStats.reductionPercent}%)`);
  console.log(`After Traditional Search: ${searchResults.length}`);
  console.log(`Final Results: ${finalResults.length}`);
  
  const totalReduction = allProducts.length > 0 ? 
    Math.round(((allProducts.length - finalResults.length) / allProducts.length) * 100) : 0;
  console.log(`Total Reduction: ${allProducts.length} → ${finalResults.length} (-${totalReduction}%)`);
  
  // Performance-Bewertung
  console.log('\n🎯 PERFORMANCE-BEWERTUNG:');
  console.log('=========================');
  if (prefilterResult.reductionStats.reductionPercent >= 80) {
    console.log('✅ Intent-Filterung: EXCELLENT (≥80% Reduktion)');
  } else if (prefilterResult.reductionStats.reductionPercent >= 50) {
    console.log('✅ Intent-Filterung: GOOD (≥50% Reduktion)');
  } else {
    console.log('⚠️ Intent-Filterung: NEEDS IMPROVEMENT (<50% Reduktion)');
  }
  
  if (finalResults.length > 0 && finalResults.length <= 50) {
    console.log('✅ Final Result Count: OPTIMAL (1-50 Produkte für KI)');
  } else if (finalResults.length > 50) {
    console.log('⚠️ Final Result Count: TOO MANY (>50 Produkte - KI wird langsam)');
  } else {
    console.log('❌ Final Result Count: NO RESULTS (0 Produkte)');
  }
  
  return {
    allProducts: allProducts.length,
    filteredProducts: prefilterResult.filteredProducts.length,
    searchResults: searchResults.length,
    finalResults: finalResults.length,
    reductionPercent: prefilterResult.reductionStats.reductionPercent,
    totalReduction,
    products: finalResults
  };
}

// TEST AUSFÜHRUNG
const result = testProductSearch();

console.log('\n🎯 PUNKT 4 ZUSAMMENFASSUNG:');
console.log('===========================');
if (result.finalResults > 0) {
  console.log('✅ Produktsuche funktioniert korrekt');
  console.log('✅ Intent-Filterung reduziert Suchraum erfolgreich');
  console.log('✅ Traditionelle Suche findet relevante Produkte');
  console.log('✅ Markt-Sortierung wird angewendet');
  console.log('\n➡️ BEREIT FÜR PUNKT 5: Kontext-Generierung für AI');
  
  console.log('\n📋 Daten für Punkt 5:');
  console.log(`Gefundene Produkte: ${result.finalResults}`);
  console.log('Erste 3 Produkte für Context:');
  result.products.slice(0, 3).forEach((product, index) => {
    console.log(`  ${index + 1}. ${product.productName} - ${product.supermarket} (${product.price.toFixed(2)}€)`);
  });
} else {
  console.log('❌ FEHLER: Keine Produkte gefunden - System muss repariert werden');
}