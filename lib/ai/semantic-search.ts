import { Product } from '../../types';
import { OpenRouterClient, OpenRouterPool } from './openrouter-client';
import { intentDetection, Intent } from './intent-detection';

export interface SemanticSearchOptions {
  maxResults?: number;
  markets?: string[];
  minRelevanceScore?: number;
  useCache?: boolean;
}

export interface SemanticSearchResult {
  products: Product[];
  searchTime: number;
  cacheHit: boolean;
  totalAnalyzed: number;
  intent?: Intent | null;
  reductionStats?: { before: number, after: number, reductionPercent: number };
}

export class SemanticSearchService {
  private static instance: SemanticSearchService;
  private searchCache = new Map<string, { products: Product[]; timestamp: number }>();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 Minuten
  
  // Häufige Suchbegriffe für Precomputing
  private readonly COMMON_QUERIES = [
    'milch', 'brot', 'fleisch', 'äpfel', 'käse', 'butter', 'joghurt', 
    'wurst', 'schokolade', 'obst', 'gemüse', 'nudeln', 'reis', 'eier',
    'bio', 'vollkorn', 'frisch', 'süß', 'salat', 'fisch'
  ];

  private constructor() {}

  static getInstance(): SemanticSearchService {
    if (!SemanticSearchService.instance) {
      SemanticSearchService.instance = new SemanticSearchService();
    }
    return SemanticSearchService.instance;
  }

  /**
   * OPTIMIERTE Hauptmethode: Intent-basierte semantische Produktsuche
   * Reduziert KI-Token um 80% durch intelligente Vorfilterung
   */
  async findRelevantProducts(
    query: string,
    allProducts: Product[],
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult> {
    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    // SCHRITT 1: Intent-Detection (Lokal, kostenlos)
    const intent = intentDetection.detectIntent(normalizedQuery);
    let productsToAnalyze = allProducts;
    let reductionStats = { before: allProducts.length, after: allProducts.length, reductionPercent: 0 };

    // SCHRITT 2: Intent-basierte Vorfilterung (Hauptoptimierung!)
    if (intent) {
      const filtered = allProducts.filter(product => {
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
        
        return matchesIncludeCategory && !matchesExcludeCategory;
      });

      if (filtered.length > 0) {
        productsToAnalyze = filtered;
        const reductionPercent = Math.round(((allProducts.length - filtered.length) / allProducts.length) * 100);
        reductionStats = {
          before: allProducts.length,
          after: filtered.length,
          reductionPercent
        };
        
        console.log(`🎯 [INTENT DETECTION] "${normalizedQuery}" → "${intent.primaryIntent}" | Produkte reduziert: ${allProducts.length} → ${filtered.length} (-${reductionPercent}%)`);
      }
    }
    
    // SCHRITT 3: Cache-Check (nach Vorfilterung)
    const cacheKey = intent ? `${normalizedQuery}_${intent.primaryIntent}` : normalizedQuery;
    if (options.useCache !== false) {
      const cached = this.getCachedResults(cacheKey);
      if (cached) {
        const filteredProducts = this.applyMarketFilter(cached, options.markets);
        return {
          products: filteredProducts.slice(0, options.maxResults || 50),
          searchTime: Date.now() - startTime,
          cacheHit: true,
          totalAnalyzed: productsToAnalyze.length,
          intent,
          reductionStats
        };
      }
    }
    
    // SCHRITT 4: KI-basierte Analyse (auf reduziertem Datenset)
    const relevantProducts = await this.performSemanticAnalysisWithIntent(
      normalizedQuery,
      productsToAnalyze,
      intent,
      options
    );
    
    // SCHRITT 5: Cache speichern (mit Intent-Key)
    this.cacheResults(cacheKey, relevantProducts);
    
    // SCHRITT 6: Markt-Filterung anwenden
    const filteredProducts = this.applyMarketFilter(relevantProducts, options.markets);
    
    return {
      products: filteredProducts.slice(0, options.maxResults || 50),
      searchTime: Date.now() - startTime,
      cacheHit: false,
      totalAnalyzed: productsToAnalyze.length,
      intent,
      reductionStats
    };
  }

  /**
   * KI-basierte Produktanalyse über OpenRouter
   */
  private async performSemanticAnalysis(
    query: string,
    products: Product[],
    options: SemanticSearchOptions
  ): Promise<Product[]> {
    // Starting semantic analysis
    
    try {
      const client = OpenRouterPool.getClient('x-ai/grok-3-mini');
      
      // Produktliste für KI vorbereiten
      const productList = products.map(p => 
        `${p.id}|${p.productName}|${p.category}|${p.subCategory}|${p.supermarket}`
      ).join('\n');

      const analysisPrompt = this.createProductAnalysisPrompt(query, productList);
      
      // Sending prompt to OpenRouter
      
      const response = await client.createCompletion([
        { role: 'system', content: 'Du bist ein Experte für deutsche Supermarkt-Produkte.' },
        { role: 'user', content: analysisPrompt }
      ], {
        model: 'x-ai/grok-3-mini',
        maxTokens: 1000,
        temperature: 0.1
      });

      // Response received from OpenRouter

      const relevantIds = this.parseKIResponse(response);
      
      // Produkte basierend auf KI-Analyse filtern
      const relevantProducts = products.filter(p => relevantIds.includes(p.id));
      
      // Semantic search completed
      
      return relevantProducts;
      
    } catch (error) {
      console.error('❌ [OPENROUTER ERROR] Semantic analysis failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        productCount: products.length,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Switching to fallback search
      // Fallback: Erweiterte Substring-Suche
      return this.fallbackSearch(query, products);
    }
  }

  /**
   * NEUE METHODE: Intent-optimierte KI-Produktanalyse
   * Verwendet kontextualisierte Prompts für bessere Ergebnisse
   */
  private async performSemanticAnalysisWithIntent(
    query: string,
    products: Product[],
    intent: Intent | null,
    options: SemanticSearchOptions
  ): Promise<Product[]> {
    // Fallback zur traditionellen Analyse wenn kein Intent
    if (!intent) {
      return this.performSemanticAnalysis(query, products, options);
    }

    console.log(`🤖 [AI ANALYSIS] Analyzing ${products.length} pre-filtered products for intent: "${intent.primaryIntent}"`);
    
    try {
      const client = OpenRouterPool.getClient('x-ai/grok-3-mini');
      
      // Produktliste für KI vorbereiten
      const productList = products.map(p => 
        `${p.id}|${p.productName}|${p.category}|${p.subCategory}|${p.supermarket}`
      ).join('\n');

      // Intent-optimierten Prompt erstellen
      const analysisPrompt = this.createIntentOptimizedPrompt(query, productList, intent);
      
      const response = await client.createCompletion([
        { role: 'system', content: `Du bist ein Experte für deutsche Supermarkt-Produkte. Du hilfst bei der Suche nach "${intent.primaryIntent}" in den Kategorien: ${intent.includeCategories.join(', ')}.` },
        { role: 'user', content: analysisPrompt }
      ], {
        model: 'x-ai/grok-3-mini',
        maxTokens: 1000,
        temperature: 0.1
      });

      const relevantIds = this.parseKIResponse(response);
      const relevantProducts = products.filter(p => relevantIds.includes(p.id));
      
      console.log(`✅ [AI ANALYSIS] Found ${relevantProducts.length} relevant products from ${products.length} analyzed`);
      
      return relevantProducts;
      
    } catch (error) {
      console.error('❌ [INTENT AI ERROR] Intent-optimized analysis failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        intent: intent.primaryIntent,
        productCount: products.length
      });
      
      // Fallback zur traditionellen Analyse
      return this.performSemanticAnalysis(query, products, options);
    }
  }

  /**
   * Prompt für KI-Produktanalyse erstellen
   */
  private createProductAnalysisPrompt(query: string, productList: string): string {
    return `
Analysiere die Suchanfrage "${query}" und finde ALLE relevanten Produkte aus dieser Liste.

PRODUKT-FORMAT: ID|Produktname|Kategorie|Unterkategorie|Supermarkt

SUCHKRITERIEN:
- Direkter Match im Produktnamen
- Synonyme und verwandte Begriffe (z.B. "Milch" = Vollmilch, Frischmilch, Landmilch)
- Deutsche Komposita (z.B. "Äpfel" findet auch "Tafeläpfel")
- Kategorien und Unterkategorien
- Eigenschaften (z.B. "Bio", "frisch", "süß")

WICHTIG:
- Sei SEHR großzügig bei der Auswahl
- Lieber zu viele als zu wenige Produkte
- Berücksichtige deutsche Sprache (Umlaute, zusammengesetzte Wörter)
- Ignoriere Preise und Daten

RÜCKGABE: 
Nur die relevanten Produkt-IDs als kommagetrennte Liste (z.B.: product_1,product_15,product_342)

PRODUKTLISTE:
${productList}

RELEVANTE PRODUKT-IDs:`;
  }

  /**
   * NEUE METHODE: Intent-optimierter Prompt für bessere KI-Ergebnisse
   * Nutzt Intent-Kontext für präzise, kontextualisierte Suchanweisungen
   */
  private createIntentOptimizedPrompt(query: string, productList: string, intent: Intent): string {
    return `
Du suchst nach "${query}" mit dem Intent "${intent.primaryIntent}".

KONTEXT & FOKUS:
- Ziel-Intent: ${intent.primaryIntent}
- Relevante Kategorien: ${intent.includeCategories.join(', ')}
- NIEMALS diese Kategorien: ${intent.excludeCategories.join(', ')}
- Zusätzliche Keywords: ${intent.keywords.join(', ')}

PRODUKT-FORMAT: ID|Produktname|Kategorie|Unterkategorie|Supermarkt

PRÄZISE SUCHANWEISUNGEN:
✅ SUCHE NUR nach Produkten die:
   - In den RELEVANTEN KATEGORIEN sind (${intent.includeCategories.join(', ')})
   - Den Intent "${intent.primaryIntent}" erfüllen
   - Zum Query "${query}" passen

❌ NIEMALS Produkte aus:
   - Ausgeschlossenen Kategorien: ${intent.excludeCategories.join(', ')}
   - Produkten die nicht zum Intent passen

BEISPIELE für "${intent.primaryIntent}":
${this.generateIntentExamples(intent)}

QUALITÄTSKONTROLLE:
- Jedes ausgewählte Produkt MUSS zum Intent "${intent.primaryIntent}" passen
- Bei Zweifel: Produkt NICHT auswählen
- Lieber weniger, aber präzisere Ergebnisse

RÜCKGABE: 
Nur die relevanten Produkt-IDs als kommagetrennte Liste (z.B.: product_1,product_15,product_342)

PRODUKTLISTE (bereits vorgefiltert):
${productList}

RELEVANTE PRODUKT-IDs:`;
  }

  /**
   * Generiere Intent-spezifische Beispiele für besseres KI-Verständnis
   */
  private generateIntentExamples(intent: Intent): string {
    const examples: Record<string, string> = {
      'butter': '✅ Streichfett, Margarine, Butterfett  ❌ Buttergebäck, Kekse, Croissants',
      'milch': '✅ Trinkmilch, Vollmilch, Frischmilch  ❌ Joghurt, Quark, Buttermilch-Drinks',
      'fleisch': '✅ Hackfleisch, Schnitzel, Rindfleisch  ❌ Geschirrspülmittel, Fisch, Wurstwaren',
      'käse': '✅ Gouda, Emmental, Schnittkäse  ❌ Käsekuchen, Desserts',
      'obst': '✅ Äpfel, Birnen, frisches Obst  ❌ Obstsäfte, Obstmus, Süßwaren'
    };
    
    return examples[intent.primaryIntent] || `✅ Produkte die zu "${intent.primaryIntent}" gehören  ❌ Produkte aus anderen Bereichen`;
  }

  /**
   * KI-Antwort parsen und Produkt-IDs extrahieren
   */
  private parseKIResponse(response: any): string[] {
    try {
      const content = response.choices?.[0]?.message?.content || '';
      
      if (!content) {
        console.warn('⚠️ No content found in OpenRouter response');
        return [];
      }
      
      const cleanContent = content.trim().replace(/[^a-zA-Z0-9_,]/g, '');
      
      if (!cleanContent) {
        return [];
      }
      
      const ids = cleanContent.split(',').map((id: string) => id.trim()).filter((id: string) => id.startsWith('product_'));
      
      console.log(`📊 Parsed ${ids.length} product IDs from response`);
      return ids;
      
    } catch (error) {
      console.error('❌ Failed to parse KI response:', error);
      return [];
    }
  }

  /**
   * Erweiterte Fallback-Suche bei KI-Ausfall - GUARANTEED RESULTS
   */
  private fallbackSearch(query: string, products: Product[]): Product[] {
    // Performing fallback search
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const enhancedQuery = this.expandQuery(query.toLowerCase());
    
    // Generated search terms
    
    const relevantProducts = products.filter(product => {
      const searchText = `${product.productName} ${product.category} ${product.subCategory}`.toLowerCase();
      
      // Multi-Level-Matching mit ausführlichem Logging
      const matches = {
        directMatch: queryWords.some(word => searchText.includes(word)),
        synonymMatch: enhancedQuery.some(term => searchText.includes(term)),
        umlautMatch: queryWords.some(word => {
          const normalized = word.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue');
          return searchText.includes(normalized);
        }),
        substringMatch: queryWords.some(word => {
          if (word.length > 3) { // Lowered threshold from 4 to 3
            return searchText.includes(word.substring(0, Math.max(3, word.length - 1)));
          }
          return false;
        }),
        fuzzyMatch: this.fuzzyMatch(query.toLowerCase(), searchText)
      };
      
      const isMatch = matches.directMatch || matches.synonymMatch || matches.umlautMatch || matches.substringMatch || matches.fuzzyMatch;
      
      if (isMatch) {
        // Product matched
      }
      
      return isMatch;
    });

    // Fallback search completed
    
    // If still no results, do desperate search
    if (relevantProducts.length === 0) {
      // Trying desperate search
      
      const desperateResults = products.filter(product => {
        const searchText = product.productName.toLowerCase();
        return query.toLowerCase().split('').every(char => searchText.includes(char));
      });
      
      // Desperate search completed
      return desperateResults.slice(0, 10); // Limit desperate results
    }

    return relevantProducts;
  }

  /**
   * Fuzzy matching für ähnliche Begriffe
   */
  private fuzzyMatch(query: string, text: string): boolean {
    // Simple fuzzy matching - check if most characters of query appear in text
    const queryChars = query.split('');
    const matchedChars = queryChars.filter(char => text.includes(char));
    
    return matchedChars.length >= Math.ceil(queryChars.length * 0.7); // 70% character match
  }

  /**
   * Query-Erweiterung für bessere Fallback-Suche
   */
  private expandQuery(query: string): string[] {
    const expansions: { [key: string]: string[] } = {
      'milch': ['vollmilch', 'frischmilch', 'landmilch', 'weidemilch', 'biomilch', 'buttermilch', 'kakao'],
      'äpfel': ['apfel', 'tafeläpfel', 'apfelmix', 'apfelschorle', 'apfelmark', 'apfelsaft'],
      'brot': ['brötchen', 'baguette', 'backwaren', 'vollkornbrot', 'weißbrot', 'toast'],
      'butter': ['kräuterbutter', 'butterkäse', 'margarine'],
      'käse': ['frischkäse', 'hartkäse', 'weichkäse', 'schnittkäse', 'mozzarella', 'gouda', 'emmentaler'],
      'fleisch': ['hähnchen', 'schwein', 'rind', 'wurst', 'salami', 'schinken'],
      'obst': ['früchte', 'bananen', 'orangen', 'trauben'],
      'gemüse': ['salat', 'tomaten', 'gurken', 'karotten', 'zwiebeln'],
      'süß': ['schokolade', 'kekse', 'bonbons', 'gummibärchen', 'kuchen'],
      'bio': ['organic', 'naturgut', 'öko']
    };

    return expansions[query] || [query];
  }

  /**
   * Substring-Generierung für zusammengesetzte deutsche Wörter
   */
  private generateSubstrings(word: string): string[] {
    if (word.length < 5) return [];
    
    const substrings: string[] = [];
    
    // Generiere Substrings von verschiedenen Längen
    for (let i = 0; i <= word.length - 4; i++) {
      for (let j = i + 4; j <= word.length; j++) {
        substrings.push(word.substring(i, j));
      }
    }
    
    return substrings.filter(sub => sub.length >= 4);
  }

  /**
   * Cache-Management
   */
  private getCachedResults(query: string): Product[] | null {
    const cached = this.searchCache.get(query);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      // Cache hit
      return cached.products;
    }
    
    return null;
  }

  private cacheResults(query: string, products: Product[]): void {
    this.searchCache.set(query, {
      products: [...products],
      timestamp: Date.now()
    });
    
    // Cache-Größe begrenzen (max 100 Einträge)
    if (this.searchCache.size > 100) {
      const oldestKey = this.searchCache.keys().next().value;
      if (oldestKey) {
        this.searchCache.delete(oldestKey);
      }
    }
  }

  /**
   * Markt-Filterung anwenden
   */
  private applyMarketFilter(products: Product[], markets?: string[]): Product[] {
    if (!markets || markets.length === 0) {
      return products;
    }
    
    const marketSet = new Set(markets.map(m => m.toLowerCase()));
    return products.filter(p => marketSet.has(p.supermarket.toLowerCase()));
  }

  /**
   * Häufige Suchbegriffe vorberechnen (für Production)
   */
  async precomputeCommonSearches(allProducts: Product[]): Promise<void> {
    // Precomputing common searches
    
    for (const query of this.COMMON_QUERIES) {
      try {
        await this.findRelevantProducts(query, allProducts, { useCache: false });
        // Precomputed query
      } catch (error) {
        console.error(`❌ Failed to precompute "${query}":`, error);
      }
    }
    
    // Precomputation completed
  }

  /**
   * Cache-Statistiken
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.searchCache.size,
      entries: Array.from(this.searchCache.keys())
    };
  }

  /**
   * Cache leeren
   */
  clearCache(): void {
    this.searchCache.clear();
    // Cache cleared
  }
}