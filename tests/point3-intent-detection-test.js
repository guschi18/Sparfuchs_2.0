/**
 * PUNKT 3 TEST: Intent-Detection (Lokal, Token-frei)
 * Test für Query-Analyse und Intent-Mapping für "Wo ist Butter im Angebot"
 */

const fs = require('fs');
const path = require('path');

// Mock der Intent-Detection aus lib/ai/intent-detection.ts
const INTENT_MAPPINGS = {
  'butter': {
    patterns: ['butter', 'streichfett', 'margarine', 'butterfett'],
    includeCategories: [
      'Milchprodukte (Butter)',
      'Butter/Margarine', 
      'Milchprodukte/Butter',
      'Butter & Margarine'
    ],
    excludeCategories: [
      'Backwaren',
      'Gebäck', 
      'Süßwaren',
      'Kekse',
      'Buttergebäck',
      'Desserts'
    ],
    keywords: ['streichfett', 'margarine', 'butterfett', 'kräuterbutter'],
    priority: 10
  },
  'milch': {
    patterns: ['milch', 'trinkmilch', 'vollmilch', 'frischmilch', 'landmilch'],
    includeCategories: [
      'Milchprodukte',
      'Getränke',
      'Milchprodukte/Getränke',
      'Milch & Milchprodukte'
    ],
    excludeCategories: [
      'Joghurt',
      'Desserts',
      'Speisequark',
      'Pudding',
      'Fruchtbuttermilch',
      'Süßwaren'
    ],
    keywords: ['vollmilch', 'frischmilch', 'landmilch', 'trinkmilch', 'kuhmilch'],
    priority: 10
  }
};

function detectIntent(query) {
  console.log('🎯 PUNKT 3: INTENT-DETECTION TEST');
  console.log('=======================================');
  
  if (!query || typeof query !== 'string') {
    console.log('❌ Invalid query input');
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();
  console.log(`🔍 Original Query: "${query}"`);
  console.log(`🔍 Normalized Query: "${normalizedQuery}"`);
  
  let bestMatch = null;

  // Durchsuche alle Intent-Mappings
  for (const [intentKey, mapping] of Object.entries(INTENT_MAPPINGS)) {
    console.log(`\n🔍 Testing Intent: "${intentKey}"`);
    
    const confidence = calculateConfidence(normalizedQuery, mapping);
    console.log(`   Confidence Score: ${confidence.toFixed(3)}`);
    console.log(`   Patterns: ${JSON.stringify(mapping.patterns)}`);
    
    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { intent: intentKey, mapping, confidence };
      console.log(`   ✅ New Best Match!`);
    } else if (confidence > 0) {
      console.log(`   📊 Match found but not better than current best`);
    } else {
      console.log(`   ❌ No match`);
    }
  }

  // Nur Intent zurückgeben wenn Confidence hoch genug
  if (bestMatch && bestMatch.confidence >= 0.7) {
    const intent = {
      primaryIntent: bestMatch.intent,
      includeCategories: bestMatch.mapping.includeCategories,
      excludeCategories: bestMatch.mapping.excludeCategories,
      keywords: bestMatch.mapping.keywords,
      confidence: bestMatch.confidence
    };
    
    console.log('\n✅ INTENT DETECTED:');
    console.log(`   Primary Intent: "${intent.primaryIntent}"`);
    console.log(`   Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
    console.log(`   Include Categories: ${JSON.stringify(intent.includeCategories)}`);
    console.log(`   Exclude Categories: ${JSON.stringify(intent.excludeCategories)}`);
    console.log(`   Keywords: ${JSON.stringify(intent.keywords)}`);
    
    return intent;
  }

  console.log('\n❌ NO INTENT DETECTED (Confidence too low)');
  if (bestMatch) {
    console.log(`   Best Match: "${bestMatch.intent}" with ${(bestMatch.confidence * 100).toFixed(1)}% confidence`);
    console.log(`   Required Confidence: 70.0%`);
  }
  
  return null;
}

function calculateConfidence(query, mapping) {
  let score = 0;
  let maxScore = 0;

  // Prüfe Pattern-Matches
  for (const pattern of mapping.patterns) {
    maxScore += mapping.priority;
    
    if (query === pattern) {
      // Exakte Übereinstimmung = höchste Punktzahl
      score += mapping.priority;
      console.log(`     Exact match: "${pattern}" = ${mapping.priority} points`);
    } else if (query.includes(pattern)) {
      // Teilübereinstimmung = reduzierte Punktzahl
      const points = mapping.priority * 0.8;
      score += points;
      console.log(`     Contains match: "${pattern}" = ${points} points`);
    } else if (pattern.includes(query) && query.length > 2) {
      // Query ist Teil des Patterns
      const points = mapping.priority * 0.6;
      score += points;
      console.log(`     Substring match: "${pattern}" contains "${query}" = ${points} points`);
    }
  }

  // Prüfe Keyword-Matches
  for (const keyword of mapping.keywords) {
    maxScore += 2;
    if (query.includes(keyword)) {
      score += 2;
      console.log(`     Keyword match: "${keyword}" = 2 points`);
    }
  }

  // Normalisiere auf 0-1 Skala
  const confidence = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  console.log(`     Total Score: ${score}/${maxScore} = ${confidence.toFixed(3)}`);
  
  return confidence;
}

// Simuliere Produktfilterung basierend auf Intent
function simulateIntentBasedFiltering(products, intent) {
  console.log('\n🎯 INTENT-BASIERTE PRODUKTFILTERUNG');
  console.log('=====================================');
  
  if (!intent) {
    console.log('❌ Kein Intent - alle Produkte beibehalten');
    return { filteredProducts: products, reductionStats: { before: products.length, after: products.length, reductionPercent: 0 } };
  }
  
  const originalCount = products.length;
  console.log(`📊 Original Product Count: ${originalCount}`);
  
  const filteredProducts = products.filter(product => {
    // Positive Kategorien-Filter
    const matchesIncludeCategory = intent.includeCategories.some(includeCategory => 
      product.category.toLowerCase().includes(includeCategory.toLowerCase()) ||
      product.subCategory.toLowerCase().includes(includeCategory.toLowerCase())
    );
    
    // Negative Kategorien-Filter  
    const matchesExcludeCategory = intent.excludeCategories.some(excludeCategory =>
      product.category.toLowerCase().includes(excludeCategory.toLowerCase()) ||
      product.subCategory.toLowerCase().includes(excludeCategory.toLowerCase())
    );
    
    const isRelevant = matchesIncludeCategory && !matchesExcludeCategory;
    
    if (isRelevant) {
      console.log(`   ✅ "${product.productName}" (${product.category}/${product.subCategory})`);
    } else if (matchesExcludeCategory) {
      console.log(`   ❌ EXCLUDED: "${product.productName}" (${product.category}/${product.subCategory})`);
    }
    
    return isRelevant;
  });

  const finalCount = filteredProducts.length;
  const reductionPercent = originalCount > 0 ? 
    Math.round(((originalCount - finalCount) / originalCount) * 100) : 0;

  console.log(`📊 Filtered Product Count: ${finalCount}`);
  console.log(`📊 Reduction: ${originalCount} → ${finalCount} (-${reductionPercent}%)`);

  return {
    filteredProducts,
    reductionStats: {
      before: originalCount,
      after: finalCount,
      reductionPercent
    }
  };
}

// TEST AUSFÜHRUNG
console.log('🧪 INTENT DETECTION TEST - START\n');

// Test 1: Standard Case - "Wo ist Butter im Angebot"
console.log('TEST 1: Standard Case - "Wo ist Butter im Angebot"');
const testResult1 = detectIntent("Wo ist Butter im Angebot");

console.log('\n');

// Test 2: Direkt "butter"
console.log('TEST 2: Direct "butter"');
const testResult2 = detectIntent("butter");

console.log('\n');

// Test 3: "margarine" (sollte auch butter-intent triggern)
console.log('TEST 3: "margarine"');
const testResult3 = detectIntent("margarine");

console.log('\n');

// Test 4: "milch" (anderer Intent)
console.log('TEST 4: "milch"');
const testResult4 = detectIntent("milch");

console.log('\n');

// Test 5: Unbekannter Begriff
console.log('TEST 5: Unknown term "xyz"');
const testResult5 = detectIntent("xyz");

console.log('\n');

// Simuliere Produktfilterung mit erkanntem Intent
if (testResult1) {
  // Mock-Produkte für Filterungstest
  const mockProducts = [
    { id: 'p1', productName: 'Kerrygold Butter', category: 'Milchprodukte', subCategory: 'Butter' },
    { id: 'p2', productName: 'Rama Margarine', category: 'Milchprodukte', subCategory: 'Margarine' },
    { id: 'p3', productName: 'BISCOTTO Buttergebäck', category: 'Backwaren', subCategory: 'Gebäck' },
    { id: 'p4', productName: 'Müller Milch', category: 'Milchprodukte', subCategory: 'Milch' },
    { id: 'p5', productName: 'Nutella Brotaufstrich', category: 'Süßwaren', subCategory: 'Aufstriche' }
  ];
  
  const filterResult = simulateIntentBasedFiltering(mockProducts, testResult1);
}

console.log('\n📊 TEST ZUSAMMENFASSUNG:');
console.log('========================');
console.log(`Test 1 ("Wo ist Butter im Angebot"): ${testResult1 ? `✅ ${testResult1.primaryIntent} (${(testResult1.confidence * 100).toFixed(1)}%)` : '❌ No Intent'}`);
console.log(`Test 2 ("butter"): ${testResult2 ? `✅ ${testResult2.primaryIntent} (${(testResult2.confidence * 100).toFixed(1)}%)` : '❌ No Intent'}`);
console.log(`Test 3 ("margarine"): ${testResult3 ? `✅ ${testResult3.primaryIntent} (${(testResult3.confidence * 100).toFixed(1)}%)` : '❌ No Intent'}`);
console.log(`Test 4 ("milch"): ${testResult4 ? `✅ ${testResult4.primaryIntent} (${(testResult4.confidence * 100).toFixed(1)}%)` : '❌ No Intent'}`);
console.log(`Test 5 ("xyz"): ${testResult5 ? `✅ ${testResult5.primaryIntent}` : '❌ No Intent (Expected)'}`);

if (testResult1 && testResult1.primaryIntent === 'butter') {
  console.log('\n🎯 ERFOLGREICH: Intent-Detection erkennt "butter" korrekt');
  console.log('✅ Include Categories definiert');
  console.log('✅ Exclude Categories definiert');
  console.log('➡️ NÄCHSTER SCHRITT: Test Point 4 - Produktsuche mit Intent-Filter');
} else {
  console.log('\n❌ FEHLER: Intent-Detection funktioniert nicht korrekt');
}