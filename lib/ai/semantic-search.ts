import { Product } from '../../types';
import { OpenRouterClient, OpenRouterPool } from './openrouter-client';

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
   * Hauptmethode: KI-basierte semantische Produktsuche
   */
  async findRelevantProducts(
    query: string,
    allProducts: Product[],
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult> {
    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();
    
    // Cache-Check
    if (options.useCache !== false) {
      const cached = this.getCachedResults(normalizedQuery);
      if (cached) {
        const filteredProducts = this.applyMarketFilter(cached, options.markets);
        return {
          products: filteredProducts.slice(0, options.maxResults || 50),
          searchTime: Date.now() - startTime,
          cacheHit: true,
          totalAnalyzed: cached.length
        };
      }
    }
    
    // KI-basierte Analyse
    const relevantProducts = await this.performSemanticAnalysis(
      normalizedQuery,
      allProducts,
      options
    );
    
    // Cache speichern
    this.cacheResults(normalizedQuery, relevantProducts);
    
    // Markt-Filterung anwenden
    const filteredProducts = this.applyMarketFilter(relevantProducts, options.markets);
    
    return {
      products: filteredProducts.slice(0, options.maxResults || 50),
      searchTime: Date.now() - startTime,
      cacheHit: false,
      totalAnalyzed: allProducts.length
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
   * KI-Antwort parsen und Produkt-IDs extrahieren
   */
  private parseKIResponse(response: any): string[] {
    try {
      const content = response.choices?.[0]?.message?.content || '';
      const cleanContent = content.trim().replace(/[^a-zA-Z0-9_,]/g, '');
      
      if (!cleanContent) {
        return [];
      }
      
      const ids = cleanContent.split(',').map((id: string) => id.trim()).filter((id: string) => id.startsWith('product_'));
      
      // Parsed AI response
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