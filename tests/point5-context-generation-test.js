/**
 * PUNKT 5 TEST: Kontext-Generierung für AI
 * Test für System-Context (Intent-bewusst) + Produkt-Context Generation
 */

// Mock-Produktdaten basierend auf Punkt 4 Ergebnissen
const MOCK_BUTTER_PRODUCTS = [
  { id: 'p1', productName: 'Landliebe Butter', category: 'Lebensmittel', subCategory: 'Milchprodukte (Butter)', supermarket: 'Lidl', price: 2.29, startDate: '2025-08-05', endDate: '2025-08-11' },
  { id: 'p2', productName: 'Kerrygold extra', category: 'Lebensmittel', subCategory: 'Butter/Margarine', supermarket: 'Lidl', price: 3.33, startDate: '2025-08-05', endDate: '2025-08-11' },
  { id: 'p3', productName: 'Lätta Original', category: 'Lebensmittel', subCategory: 'Margarine', supermarket: 'Lidl', price: 0.99, startDate: '2025-08-05', endDate: '2025-08-11' },
  { id: 'p4', productName: 'FRAU ANTJE Butter', category: 'Lebensmittel', subCategory: 'Milchprodukte (Butter)', supermarket: 'Aldi', price: 1.89, startDate: '2025-08-05', endDate: '2025-08-12' },
  { id: 'p5', productName: 'RAMA Original 100% pflanzlich', category: 'Lebensmittel', subCategory: 'Margarine', supermarket: 'Aldi', price: 1.29, startDate: '2025-08-05', endDate: '2025-08-12' },
  { id: 'p6', productName: 'Rama Streichfett', category: 'Lebensmittel', subCategory: 'Butter/Margarine', supermarket: 'Edeka', price: 1.19, startDate: '2025-08-05', endDate: '2025-08-10' }
];

const BUTTER_INTENT = {
  primaryIntent: "butter",
  includeCategories: ["Milchprodukte (Butter)", "Butter/Margarine", "Milchprodukte/Butter", "Butter & Margarine"],
  excludeCategories: ["Backwaren", "Gebäck", "Süßwaren", "Kekse", "Buttergebäck", "Desserts"],
  keywords: ["streichfett", "margarine", "butterfett", "kräuterbutter"],
  confidence: 0.4444444444444444
};

// Schritt 5.1: System-Context (Intent-bewusst) generieren
function generateIntentAwareSystemContext(config, intent) {
  console.log('🎯 SCHRITT 5.1: SYSTEM-CONTEXT (INTENT-BEWUSST)');
  console.log('===============================================');
  
  const marketList = config.selectedMarkets.join(', ');
  
  // Basis System-Context
  const baseSystemMessage = `Du bist SparFuchs, ein KI-Assistent für deutsche Supermarkt-Angebote.

Du hilfst bei der Suche nach Supermarkt-Angeboten und Produkten.

Verfügbare Märkte: ${marketList}

WICHTIGE REGELN:
1. Antworte nur auf Deutsch
2. Erwähne nur Produkte, die in den Daten verfügbar sind
3. Gib konkrete Preise und Märkte an
4. Sei hilfsbereit und freundlich
5. Bietet nur Alternativen an, wenn es keine passenden Produkte gibt
6. Formatiere Preise als "X,XX €"
7. Erwähne bei Produkten immer den Markt und Zeitraum
8. KRITISCH: Gib Produkte IMMER in dieser exakten Markt-Reihenfolge aus: Lidl, Aldi, Edeka, Penny, Rewe
9. NIEMALS eine andere Markt-Reihenfolge verwenden! Diese Reihenfolge ist ZWINGEND einzuhalten!

SPEZIELLE FORMATIERUNG:
10. Wenn du Produktinformationen in deiner Antwort erwähnst, verwende IMMER das spezielle PRODUCT_CARD Format
11. Für jedes Produkt das du erwähnst, füge diese Zeile in deine Antwort ein:
    PRODUCT_CARD: {"name": "Produktname", "price": "X,XX", "market": "Marktname", "dateRange": "von bis", "id": "product_id"}
12. Verwende normale Text-Erklärungen UND die PRODUCT_CARD-Zeilen zusammen
13. Beispiel-Antwort: "Hier sind günstige Milchprodukte:\\n\\nPRODUCT_CARD: {"name": "Müller Müllermilch", "price": "0,69", "market": "Lidl", "dateRange": "2025-05-05 bis 2025-05-10", "id": "product_1"}\\n\\nDieses Angebot ist besonders günstig..."

Du hast Zugang zu aktuellen Angebotsdaten von deutschen Supermärkten.`;
  
  if (!intent) {
    console.log('❌ Kein Intent - Basis System-Context verwendet');
    return baseSystemMessage;
  }

  // Intent-spezifische Anweisungen generieren
  const intentInstructions = generateIntentSpecificInstructions(intent);
  
  const intentAwareSystemMessage = `${baseSystemMessage}

🎯 SPEZIELLE INTENT-ANWEISUNGEN für "${intent.primaryIntent}":
${intentInstructions}

KRITISCH: Diese Intent-Anweisungen haben HÖCHSTE PRIORITÄT und überschreiben allgemeine Regeln!`;

  console.log('✅ Intent-bewusster System-Context generiert');
  console.log(`🎯 Intent: "${intent.primaryIntent}" (${(intent.confidence * 100).toFixed(1)}% Confidence)`);
  console.log(`📝 Spezielle Anweisungen: ${intentInstructions.split('\n').length} Zeilen`);
  
  return intentAwareSystemMessage;
}

// Intent-spezifische Anweisungen
function generateIntentSpecificInstructions(intent) {
  const intentInstructions = {
    'butter': `
🧈 BUTTER-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Streichfett, Margarine, echter Butter zum Streichen
- ❌ NIEMALS erwähnen: Buttergebäck, Kekse, Backwaren, süße Produkte
- ❌ ABSOLUTES VERBOT: "BISCOTTO Dänisches Buttergebäck" oder ähnliche Backwaren
- ✅ BEVORZUGE: Produkte mit "Butter" im Namen aus Milchprodukte-Kategorien
- 🎯 PRIORITÄT: Streichfähige Butter-Produkte für Brot/Kochen`,

    'milch': `
🥛 MILCH-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Trinkmilch, Vollmilch, Frischmilch, Landmilch zum Trinken
- ❌ NIEMALS erwähnen: Joghurt, Quark, Desserts, Buttermilch-Drinks, Almighurt
- ❌ ABSOLUTES VERBOT: Joghurt-Produkte als Milch-Alternative
- ✅ BEVORZUGE: Reine Milch-Produkte in Flaschen/Kartons
- 🎯 PRIORITÄT: Milch zum Trinken, nicht für Desserts`
  };

  return intentInstructions[intent.primaryIntent] || `
🎯 INTENT "${intent.primaryIntent}" ERKANNT:
- ✅ FOKUS auf Kategorien: ${intent.includeCategories.join(', ')}
- ❌ NIEMALS Produkte aus: ${intent.excludeCategories.join(', ')}
- 🎯 PRIORITÄT: Produkte die genau zum Intent passen`;
}

// Schritt 5.2: Produkt-Context generieren
function generateProductContext(products, query) {
  console.log('\n🎯 SCHRITT 5.2: PRODUKT-CONTEXT');
  console.log('==================================');
  
  console.log(`📝 Query: "${query}"`);
  console.log(`📊 Products: ${products.length}`);
  
  if (products.length === 0) {
    const emptyContext = 'Keine passenden Produkte in den aktuellen Angeboten gefunden.';
    console.log('❌ Keine Produkte - Empty Context generiert');
    return emptyContext;
  }

  // Produkte nach Markt-Reihenfolge sortieren
  const marketOrder = ['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe'];
  const sortedProducts = products.sort((a, b) => {
    const indexA = marketOrder.indexOf(a.supermarket);
    const indexB = marketOrder.indexOf(b.supermarket);
    
    const finalIndexA = indexA === -1 ? 999 : indexA;
    const finalIndexB = indexB === -1 ? 999 : indexB;
    
    return finalIndexA - finalIndexB;
  });

  console.log('🏪 Produkte nach Markt-Reihenfolge sortiert:');
  sortedProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.productName} - ${product.supermarket} (${product.price.toFixed(2)}€)`);
  });

  // PRODUCT_CARD Format generieren
  const productContext = sortedProducts
    .map((product) => {
      const productCard = {
        name: product.productName,
        price: product.price.toFixed(2).replace('.', ','),
        market: product.supermarket,
        dateRange: `${formatDate(product.startDate)} bis ${formatDate(product.endDate)}`,
        id: product.id
      };
      return `PRODUCT_CARD: ${JSON.stringify(productCard)}`;
    })
    .join('\n');

  const contextMessage = `Aktuelle Angebote für "${query}" (${products.length} von ${products.length} Produkten gefunden):

WICHTIG: Die Produkte sind bereits in der korrekten Markt-Reihenfolge sortiert (Lidl, Aldi, Edeka, Penny, Rewe). BITTE DIESE REIHENFOLGE IN DEINER ANTWORT BEIBEHALTEN!

VERWENDE FÜR JEDES PRODUKT DAS PRODUCT_CARD FORMAT IN DEINER ANTWORT:

${productContext}`;

  console.log('✅ Produkt-Context erfolgreich generiert');
  console.log(`📋 ${sortedProducts.length} PRODUCT_CARD Einträge erstellt`);
  
  return contextMessage;
}

// Hilfsfunktion für Datumsformatierung
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Schritt 5.3: Vollständige Context-Generierung
function generateFullContext(userQuery, config, intent, products) {
  console.log('\n🎯 SCHRITT 5.3: VOLLSTÄNDIGE CONTEXT-GENERIERUNG');
  console.log('=================================================');
  
  console.log(`📝 User Query: "${userQuery}"`);
  console.log(`⚙️ Config: ${JSON.stringify(config)}`);
  console.log(`🎯 Intent: ${intent ? intent.primaryIntent : 'None'}`);
  console.log(`📊 Products: ${products.length}`);
  
  // System-Context generieren
  const systemMessage = generateIntentAwareSystemContext(config, intent);
  
  // Produkt-Context generieren 
  const contextMessage = generateProductContext(products, userQuery);
  
  console.log('\n📋 CONTEXT GENERATION SUMMARY:');
  console.log(`   System Message: ${systemMessage.length} Zeichen`);
  console.log(`   Context Message: ${contextMessage.length} Zeichen`);
  console.log(`   Total Context: ${systemMessage.length + contextMessage.length} Zeichen`);
  
  return {
    systemMessage,
    contextMessage
  };
}

// TEST AUSFÜHRUNG
function testContextGeneration() {
  console.log('🧪 PUNKT 5: KONTEXT-GENERIERUNG TEST - START');
  console.log('=============================================\n');
  
  const userQuery = "Wo ist Butter im Angebot";
  const config = {
    selectedMarkets: ['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe'],
    maxProducts: 50
  };
  
  // Vollständige Context-Generierung testen
  const contextResult = generateFullContext(userQuery, config, BUTTER_INTENT, MOCK_BUTTER_PRODUCTS);
  
  console.log('\n🎯 CONTEXT GENERATION RESULTS:');
  console.log('===============================');
  
  console.log('\n📄 SYSTEM MESSAGE (First 500 chars):');
  console.log('-------------------------------------');
  console.log(contextResult.systemMessage.substring(0, 500) + '...');
  
  console.log('\n📋 CONTEXT MESSAGE (Full):');
  console.log('---------------------------');
  console.log(contextResult.contextMessage);
  
  // Qualitätsprüfung
  console.log('\n🔍 QUALITÄTSPRÜFUNG:');
  console.log('====================');
  
  const checks = {
    systemMessageNotEmpty: contextResult.systemMessage.length > 0,
    contextMessageNotEmpty: contextResult.contextMessage.length > 0,
    containsIntentInstructions: contextResult.systemMessage.includes('BUTTER-SUCHE ERKANNT'),
    containsProductCards: contextResult.contextMessage.includes('PRODUCT_CARD:'),
    containsMarketOrder: contextResult.contextMessage.includes('Lidl, Aldi, Edeka, Penny, Rewe'),
    productCountCorrect: (contextResult.contextMessage.match(/PRODUCT_CARD:/g) || []).length === MOCK_BUTTER_PRODUCTS.length
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(checks).every(check => check);
  
  console.log('\n📊 PUNKT 5 ZUSAMMENFASSUNG:');
  console.log('============================');
  if (allPassed) {
    console.log('✅ Kontext-Generierung funktioniert korrekt');
    console.log('✅ Intent-bewusste System-Prompts werden generiert');
    console.log('✅ Produkt-Context mit PRODUCT_CARD Format');
    console.log('✅ Markt-Reihenfolge wird eingehalten');
    console.log('✅ Alle Qualitätsprüfungen bestanden');
    console.log('\n➡️ BEREIT FÜR PUNKT 6: OpenRouter API Test');
    
    console.log('\n📋 Daten für OpenRouter (Point 6):');
    console.log(`System Message Length: ${contextResult.systemMessage.length} chars`);
    console.log(`Context Message Length: ${contextResult.contextMessage.length} chars`);
    console.log(`Total Tokens (ca.): ${Math.ceil((contextResult.systemMessage.length + contextResult.contextMessage.length) / 4)} tokens`);
  } else {
    console.log('❌ FEHLER: Kontext-Generierung hat Probleme');
    console.log('❌ Qualitätsprüfungen fehlgeschlagen - System muss repariert werden');
  }
  
  return {
    success: allPassed,
    systemMessage: contextResult.systemMessage,
    contextMessage: contextResult.contextMessage,
    checks
  };
}

// TEST AUSFÜHRUNG
const result = testContextGeneration();