/**
 * PUNKT 6 TEST: OpenRouter API-Aufruf
 * Test für Request an OpenRouter mit generiertem Context + Streaming Response
 * HINWEIS: Dieser Test simuliert den OpenRouter-Call ohne echte API-Anfrage
 */

// Simulierte OpenRouter Client-Klasse
class MockOpenRouterClient {
  constructor(model) {
    this.model = model;
  }

  async createStreamingCompletion(messages, options) {
    console.log('📡 MOCK OpenRouter API Call');
    console.log('============================');
    console.log(`🤖 Model: ${options.model}`);
    console.log(`📊 Max Tokens: ${options.maxTokens}`);
    console.log(`🌡️ Temperature: ${options.temperature}`);
    console.log(`📨 Messages: ${messages.length}`);
    
    messages.forEach((msg, index) => {
      console.log(`   Message ${index + 1} (${msg.role}): ${msg.content.length} chars`);
    });

    // Simuliere Streaming Response
    const mockResponse = this.generateMockButterResponse();
    
    return this.createMockStream(mockResponse);
  }

  generateMockButterResponse() {
    return `Hier sind die aktuellen Butter-Angebote in den deutschen Supermärkten:

🧈 **Lidl** (05.08. - 11.08.2025):
PRODUCT_CARD: {"name":"Landliebe Butter","price":"2,29","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p1"}

Die Landliebe Butter ist eine hochwertige, rahmig-frische Butter für 2,29€.

PRODUCT_CARD: {"name":"Kerrygold extra","price":"3,33","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p2"}

Kerrygold extra ist eine Premium-Butter aus Irland für 3,33€.

PRODUCT_CARD: {"name":"Lätta Original","price":"0,99","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p3"}

Die günstigste Option ist Lätta Original Margarine für nur 0,99€.

🧈 **Aldi** (05.08. - 12.08.2025):
PRODUCT_CARD: {"name":"FRAU ANTJE Butter","price":"1,89","market":"Aldi","dateRange":"05.08.2025 bis 12.08.2025","id":"p4"}

FRAU ANTJE Butter bietet ein ausgezeichnetes Preis-Leistungs-Verhältnis für 1,89€.

PRODUCT_CARD: {"name":"RAMA Original 100% pflanzlich","price":"1,29","market":"Aldi","dateRange":"05.08.2025 bis 12.08.2025","id":"p5"}

Für pflanzliche Alternative: RAMA Original 100% pflanzlich für 1,29€.

🧈 **Edeka** (05.08. - 10.08.2025):
PRODUCT_CARD: {"name":"Rama Streichfett","price":"1,19","market":"Edeka","dateRange":"05.08.2025 bis 10.08.2025","id":"p6"}

Bei Edeka gibt es Rama Streichfett für 1,19€.

**Empfehlung:** Für echte Butter ist FRAU ANTJE bei Aldi mit 1,89€ das beste Angebot. Für Margarine ist Lätta Original bei Lidl mit 0,99€ am günstigsten.`;
  }

  async* createMockStream(fullResponse) {
    const chunks = this.splitIntoChunks(fullResponse, 50); // 50 Zeichen pro Chunk
    
    for (let i = 0; i < chunks.length; i++) {
      await this.sleep(10); // 10ms Delay zwischen Chunks
      
      yield {
        choices: [{
          delta: {
            content: chunks[i]
          }
        }]
      };
    }
  }

  splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Mock OpenRouter Pool
const MockOpenRouterPool = {
  getClient: (model) => {
    console.log(`🔄 OpenRouter Pool: Getting client for model "${model}"`);
    return new MockOpenRouterClient(model);
  }
};

// Schritt 6.1: OpenRouter Request Setup
function setupOpenRouterRequest(systemMessage, contextMessage, userQuery, model = 'x-ai/grok-2-1212') {
  console.log('🎯 SCHRITT 6.1: OPENROUTER REQUEST SETUP');
  console.log('=========================================');
  
  // Client aus Pool holen
  const client = MockOpenRouterPool.getClient(model);
  
  // Messages Array erstellen (wie in route.ts:49-52)
  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: `${contextMessage}\n\nBenutzeranfrage: ${userQuery}` }
  ];
  
  // Request-Optionen (wie in route.ts:54-59)
  const requestOptions = {
    model: model || 'x-ai/grok-3-mini',
    maxTokens: 8000,
    temperature: 0.7,
    stream: true
  };
  
  console.log('📋 Request Setup Complete:');
  console.log(`   Model: ${requestOptions.model}`);
  console.log(`   System Message: ${systemMessage.length} chars`);
  console.log(`   User Message: ${contextMessage.length + userQuery.length + 20} chars`);
  console.log(`   Total Context: ~${Math.ceil((systemMessage.length + contextMessage.length + userQuery.length) / 4)} tokens`);
  console.log(`   Max Tokens: ${requestOptions.maxTokens}`);
  console.log(`   Temperature: ${requestOptions.temperature}`);
  
  return { client, messages, requestOptions };
}

// Schritt 6.2: OpenRouter API Call
async function performOpenRouterCall(client, messages, requestOptions) {
  console.log('\n🎯 SCHRITT 6.2: OPENROUTER API CALL');
  console.log('===================================');
  
  try {
    console.log('🚀 Sending request to OpenRouter...');
    
    const stream = await client.createStreamingCompletion(messages, requestOptions);
    
    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
      throw new Error('Invalid streaming response from OpenRouter');
    }
    
    console.log('✅ Stream received from OpenRouter');
    return { success: true, stream };
    
  } catch (error) {
    console.log('❌ OpenRouter API Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Schritt 6.3: Stream Processing
async function processOpenRouterStream(stream) {
  console.log('\n🎯 SCHRITT 6.3: STREAM PROCESSING');
  console.log('==================================');
  
  let fullResponse = '';
  let chunkCount = 0;
  const startTime = Date.now();
  
  try {
    console.log('📡 Processing streaming chunks...');
    
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        chunkCount++;
        
        // Log ersten und letzten Chunk
        if (chunkCount === 1) {
          console.log(`   📦 First Chunk: "${content.substring(0, 30)}..."`);
        }
      }
    }
    
    const endTime = Date.now();
    const streamDuration = endTime - startTime;
    
    console.log(`✅ Stream processing complete:`);
    console.log(`   Chunks processed: ${chunkCount}`);
    console.log(`   Total response length: ${fullResponse.length} chars`);
    console.log(`   Stream duration: ${streamDuration}ms`);
    console.log(`   📦 Last Chunk: "...${fullResponse.substring(fullResponse.length - 30)}"`);
    
    return { success: true, fullResponse, chunkCount, streamDuration };
    
  } catch (error) {
    console.log('❌ Stream processing error:', error.message);
    return { success: false, error: error.message };
  }
}

// Schritt 6.4: Response Validation
function validateOpenRouterResponse(response) {
  console.log('\n🎯 SCHRITT 6.4: RESPONSE VALIDATION');
  console.log('===================================');
  
  const checks = {
    responseNotEmpty: response.length > 0,
    containsProductCards: response.includes('PRODUCT_CARD:'),
    containsMarketNames: ['Lidl', 'Aldi', 'Edeka'].some(market => response.includes(market)),
    containsPrices: response.includes('€'),
    containsGermanText: response.includes('Hier sind') || response.includes('Angebote'),
    noHallucinations: !response.includes('FAKE_PRODUCT') && !response.includes('999,99€'),
    properFormat: response.includes('"market":') && response.includes('"price":')
  };
  
  console.log('🔍 Response Validation Results:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const productCardCount = (response.match(/PRODUCT_CARD:/g) || []).length;
  console.log(`   📊 Product Cards Found: ${productCardCount}`);
  
  const allPassed = Object.values(checks).every(check => check);
  
  return { allPassed, checks, productCardCount };
}

// HAUPT-TEST AUSFÜHRUNG
async function testOpenRouterAPI() {
  console.log('🧪 PUNKT 6: OPENROUTER API TEST - START');
  console.log('========================================\n');
  
  // Test-Daten aus Punkt 5
  const systemMessage = `Du bist SparFuchs, ein KI-Assistent für deutsche Supermarkt-Angebote.

Du hilfst bei der Suche nach Supermarkt-Angeboten und Produkten.

Verfügbare Märkte: Lidl, Aldi, Edeka, Penny, Rewe

🎯 SPEZIELLE INTENT-ANWEISUNGEN für "butter":
🧈 BUTTER-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Streichfett, Margarine, echter Butter zum Streichen
- ❌ NIEMALS erwähnen: Buttergebäck, Kekse, Backwaren, süße Produkte
- ❌ ABSOLUTES VERBOT: "BISCOTTO Dänisches Buttergebäck" oder ähnliche Backwaren

VERWENDE FÜR JEDES PRODUKT DAS PRODUCT_CARD FORMAT IN DEINER ANTWORT.`;

  const contextMessage = `Aktuelle Angebote für "Wo ist Butter im Angebot" (6 von 6 Produkten gefunden):

VERWENDE FÜR JEDES PRODUKT DAS PRODUCT_CARD FORMAT IN DEINER ANTWORT:

PRODUCT_CARD: {"name":"Landliebe Butter","price":"2,29","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p1"}
PRODUCT_CARD: {"name":"Kerrygold extra","price":"3,33","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p2"}
PRODUCT_CARD: {"name":"Lätta Original","price":"0,99","market":"Lidl","dateRange":"05.08.2025 bis 11.08.2025","id":"p3"}
PRODUCT_CARD: {"name":"FRAU ANTJE Butter","price":"1,89","market":"Aldi","dateRange":"05.08.2025 bis 12.08.2025","id":"p4"}
PRODUCT_CARD: {"name":"RAMA Original 100% pflanzlich","price":"1,29","market":"Aldi","dateRange":"05.08.2025 bis 12.08.2025","id":"p5"}
PRODUCT_CARD: {"name":"Rama Streichfett","price":"1,19","market":"Edeka","dateRange":"05.08.2025 bis 10.08.2025","id":"p6"}`;

  const userQuery = "Wo ist Butter im Angebot";
  
  // SCHRITT 6.1: Request Setup
  const { client, messages, requestOptions } = setupOpenRouterRequest(
    systemMessage, 
    contextMessage, 
    userQuery, 
    'x-ai/grok-2-1212'
  );
  
  // SCHRITT 6.2: API Call
  const apiResult = await performOpenRouterCall(client, messages, requestOptions);
  
  if (!apiResult.success) {
    console.log('\n❌ PUNKT 6 FEHLGESCHLAGEN: OpenRouter API Call failed');
    return { success: false, error: apiResult.error };
  }
  
  // SCHRITT 6.3: Stream Processing
  const streamResult = await processOpenRouterStream(apiResult.stream);
  
  if (!streamResult.success) {
    console.log('\n❌ PUNKT 6 FEHLGESCHLAGEN: Stream processing failed');
    return { success: false, error: streamResult.error };
  }
  
  // SCHRITT 6.4: Response Validation
  const validation = validateOpenRouterResponse(streamResult.fullResponse);
  
  // ZUSAMMENFASSUNG
  console.log('\n📊 PUNKT 6 ZUSAMMENFASSUNG:');
  console.log('============================');
  
  if (validation.allPassed) {
    console.log('✅ OpenRouter API-Aufruf erfolgreich');
    console.log('✅ Streaming Response korrekt verarbeitet');
    console.log('✅ Response enthält alle erwarteten Elemente');
    console.log(`✅ ${validation.productCardCount} PRODUCT_CARD Einträge gefunden`);
    console.log('✅ Keine Halluzinationen erkannt');
    console.log('✅ Deutsche Lokalisierung korrekt');
    console.log('\n➡️ BEREIT FÜR PUNKT 7: Response-Streaming Test');
    
    console.log('\n📋 Response Preview (First 200 chars):');
    console.log(streamResult.fullResponse.substring(0, 200) + '...');
    
  } else {
    console.log('❌ FEHLER: OpenRouter Response hat Qualitätsprobleme');
    console.log('❌ Einige Validierungsprüfungen fehlgeschlagen');
  }
  
  return {
    success: validation.allPassed,
    response: streamResult.fullResponse,
    validation,
    streamResult
  };
}

// TEST AUSFÜHRUNG
testOpenRouterAPI().then(result => {
  if (result.success) {
    console.log('\n🎉 PUNKT 6 ERFOLGREICH ABGESCHLOSSEN!');
  } else {
    console.log('\n💥 PUNKT 6 BENÖTIGT REPARATUR!');
  }
}).catch(error => {
  console.error('\n💥 PUNKT 6 KRITISCHER FEHLER:', error);
});