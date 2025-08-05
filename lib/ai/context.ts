import { ProductDataService } from '../data/product-data';
import { SemanticSearchService } from './semantic-search';
import { Product } from '../../types';
import { formatDate } from '../utils/helpers';

export interface ContextConfig {
  selectedMarkets: string[];
  maxProducts: number;
  useSemanticSearch?: boolean;
  recipeMode?: boolean;
}

export class ContextGenerator {
  private static readonly DEFAULT_CONFIG: ContextConfig = {
    selectedMarkets: ['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe'],
    maxProducts: 50,
    useSemanticSearch: true,  // ✅ AKTIVIERT Intent-basierte Suche!
  };

  static generateSystemContext(config: ContextConfig = this.DEFAULT_CONFIG): string {
    const marketList = config.selectedMarkets.join(', ');

    return `Du bist SparFuchs, ein KI-Assistent für deutsche Supermarkt-Angebote.

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

SPEZIELLE ANTWORT-STRUKTUR (ZWINGEND EINHALTEN):
10. JEDE Antwort MUSS dieser exakten 3-Teil-Struktur folgen:
    a) EINLEITUNGSTEXT: Persönliche Begrüßung und Erklärung der Suche
    b) ÜBERGANGSTEXT: "Hier sind die aktuellen Angebote:"
    c) PRODUCT_CARDS: Alle Product Cards nacheinander ohne individuelle Beschreibungen
    d) ABSCHLUSSTEXT: Zusammenfassung oder zusätzliche Tipps

11. PRODUCT_CARD Format für jedes Produkt:
    PRODUCT_CARD: {"name": "Produktname", "price": "X,XX", "market": "Marktname", "dateRange": "von bis", "id": "product_id"}
    
12. WICHTIG: Product Cards stehen direkt nacheinander ohne zusätzliche Beschreibungstexte dazwischen

13. VOLLSTÄNDIGES Beispiel der Antwort-Struktur (EXAKTE Vorlage):
    "Hallo! Vielen Dank für deine Anfrage zu [Produkt]-Angeboten. Ich habe in den aktuellen Daten nach Produkten mit [Produkt] gesucht und die passenden Angebote für dich zusammengestellt.

    Hier sind die aktuellen Angebote:

    PRODUCT_CARD: {"name": "Produktname 1", "price": "X,XX", "market": "Lidl", "dateRange": "DD.MM.YYYY bis DD.MM.YYYY", "id": "product_id_1"}

    PRODUCT_CARD: {"name": "Produktname 2", "price": "Y,YY", "market": "Aldi", "dateRange": "DD.MM.YYYY bis DD.MM.YYYY", "id": "product_id_2"}

    PRODUCT_CARD: {"name": "Produktname 3", "price": "Z,ZZ", "market": "Edeka", "dateRange": "DD.MM.YYYY bis DD.MM.YYYY", "id": "product_id_3"}

    Diese Angebote bieten dir gute Optionen für [allgemeine Zusammenfassung oder Tipp]."

Du hast Zugang zu aktuellen Angebotsdaten von deutschen Supermärkten.`;
  }

  static async generateProductContext(
    query: string,
    config: ContextConfig = this.DEFAULT_CONFIG
  ): Promise<string> {
    try {
      let products: Product[];
      let totalCount: number;
      let searchMethod: string;

      // Determine search method

      // Entscheide zwischen semantischer und traditioneller Suche
      if (config.useSemanticSearch) {
        // Attempting semantic search
        try {
          const allProducts = ProductDataService.getAllProducts();
          const semanticSearchService = SemanticSearchService.getInstance();
          
          const semanticResults = await semanticSearchService.findRelevantProducts(
            query,
            allProducts.products,
            {
              markets: config.selectedMarkets,
              maxResults: config.maxProducts,
              useCache: true
            }
          );
          
          products = semanticResults.products;
          totalCount = semanticResults.totalAnalyzed;
          searchMethod = semanticResults.cacheHit ? 'Semantic (cached)' : 'Semantic (AI)';
          
          // Intent-Detection Info hinzufügen
          if (semanticResults.intent) {
            searchMethod += ` + Intent("${semanticResults.intent.primaryIntent}")`;
            console.log(`🎯 [CONTEXT] Intent detected: "${semanticResults.intent.primaryIntent}" | Confidence: ${(semanticResults.intent.confidence * 100).toFixed(1)}%`);
          }
          
          // Reduction Stats loggen
          if (semanticResults.reductionStats && semanticResults.reductionStats.reductionPercent > 0) {
            console.log(`📊 [PERFORMANCE] Products reduced: ${semanticResults.reductionStats.before} → ${semanticResults.reductionStats.after} (-${semanticResults.reductionStats.reductionPercent}%)`);
          }
          
          // Semantic search completed
          
          // Semantic search analysis completed
          
          // Fallback bei wenigen Ergebnissen
          if (products.length === 0) {
            // No semantic results, using fallback
            throw new Error('No semantic results - fallback needed');
          }
          
        } catch (error) {
          // Semantic search failed, using fallback
          
          // Automatischer Fallback zur traditionellen Suche
          const searchResults = ProductDataService.searchProducts(query, {
            markets: config.selectedMarkets,
            limit: config.maxProducts,
          });
          
          products = searchResults.products;
          totalCount = searchResults.totalCount;
          searchMethod = 'Traditional (fallback)';
          
          // Traditional fallback completed
          
          // Traditional fallback analysis completed
        }
      } else {
        // Direkte traditionelle Suche
        const searchResults = ProductDataService.searchProducts(query, {
          markets: config.selectedMarkets,
          limit: config.maxProducts,
        });
        
        products = searchResults.products;
        totalCount = searchResults.totalCount;
        searchMethod = 'Traditional';
        
        // Traditional search completed
        
        // Traditional search analysis completed
      }

      if (products.length === 0) {
        return 'Keine passenden Produkte in den aktuellen Angeboten gefunden.';
      }

      // Sort products by market order (as defined in selectedMarkets)
      const sortedProducts = products.sort((a, b) => {
        const indexA = config.selectedMarkets.indexOf(a.supermarket);
        const indexB = config.selectedMarkets.indexOf(b.supermarket);
        
        // If market not found in selectedMarkets, put it at the end
        const finalIndexA = indexA === -1 ? 999 : indexA;
        const finalIndexB = indexB === -1 ? 999 : indexB;
        
        return finalIndexA - finalIndexB;
      });

      const productContext = sortedProducts
        .map((product: Product) => 
          `PRODUCT_CARD: ${JSON.stringify({
            name: product.productName,
            price: product.price.toFixed(2).replace('.', ','),
            market: product.supermarket,
            dateRange: `${formatDate(product.startDate)} bis ${formatDate(product.endDate)}`,
            id: product.id
          })}`
        )
        .join('\n');

      return `PRODUKTDATEN für "${query}" (${products.length} von ${totalCount} Produkten gefunden):

🎯 KRITISCHE ANWEISUNGEN FÜR DEINE ANTWORT:
1. BEGINNE mit persönlicher Begrüßung: "Hallo! Vielen Dank für deine Anfrage!"
2. VERWENDE GENAU den Übergangstext: "Hier sind die aktuellen Angebote:"
3. ZEIGE alle PRODUCT_CARDS direkt nacheinander OHNE individuelle Beschreibungen dazwischen
4. BEHALTE die Markt-Reihenfolge bei: Lidl, Aldi, Edeka, Penny, Rewe
5. SCHLIESSE mit einem allgemeinen hilfreichen Kommentar ab

VERWENDE DIESE PRODUCT_CARDS IN DEINER ANTWORT (in genau dieser Reihenfolge):

${productContext}

🔥 WICHTIG: Keine individuellen Beschreibungen nach jeder Product Card - nur die Cards nacheinander und dann ein abschließender Kommentar!

FOLGE EXAKT DEM VEREINFACHTEN BEISPIEL-TEMPLATE AUS DEN SYSTEM-ANWEISUNGEN!`;
    } catch (error) {
      console.error('Error generating product context:', error);
      return 'Fehler beim Laden der Produktdaten.';
    }
  }

  static async generateRecipeContext(
    query: string, 
    ingredients: string[],
    config: ContextConfig = this.DEFAULT_CONFIG
  ): Promise<string> {
    if (!config.recipeMode) {
      return '';
    }

    const ingredientPromises = ingredients.map(ingredient =>
      this.generateProductContext(ingredient, { ...config, maxProducts: 10 })
    );

    try {
      const ingredientContexts = await Promise.all(ingredientPromises);
      
      return `Zutaten-Suche für Rezept "${query}":\n\n${ingredientContexts.join('\n\n')}`;
    } catch (error) {
      console.error('Error generating recipe context:', error);
      return 'Fehler beim Laden der Rezept-Zutaten.';
    }
  }

  static async generateFullContext(
    userQuery: string,
    config: ContextConfig = this.DEFAULT_CONFIG,
    ingredients: string[] = [],
    options: { useSemanticSearch?: boolean } = {}
  ): Promise<{ systemMessage: string; contextMessage: string }> {
    // WICHTIG: Intent-Detection für bessere System-Prompts
    const intent = await this.detectUserIntent(userQuery);
    const systemMessage = this.generateIntentAwareSystemContext(config, intent);
    
    // Semantische Suche aktivieren falls gewünscht
    const enhancedConfig = {
      ...config,
      useSemanticSearch: options.useSemanticSearch || config.useSemanticSearch || false
    };
    
    let contextMessage: string;
    
    if (config.recipeMode && ingredients.length > 0) {
      contextMessage = await this.generateRecipeContext(userQuery, ingredients, enhancedConfig);
    } else {
      contextMessage = await this.generateProductContext(userQuery, enhancedConfig);
    }

    return {
      systemMessage,
      contextMessage,
    };
  }

  /**
   * NEUE METHODE: Intent-Detection für System-Context
   */
  private static async detectUserIntent(userQuery: string) {
    // Dynamischer Import um Circular Dependencies zu vermeiden
    const { intentDetection } = await import('./intent-detection');
    return intentDetection.detectIntent(userQuery);
  }

  /**
   * NEUE METHODE: Intent-bewusster System-Context
   * Enthält spezifische Anweisungen basierend auf erkanntem Intent
   */
  private static generateIntentAwareSystemContext(config: ContextConfig, intent: any): string {
    const baseSystemMessage = this.generateSystemContext(config);
    
    if (!intent) {
      return baseSystemMessage;
    }

    // Intent-spezifische Anweisungen hinzufügen
    const intentInstructions = this.generateIntentSpecificInstructions(intent);
    
    return `${baseSystemMessage}

🎯 SPEZIELLE INTENT-ANWEISUNGEN für "${intent.primaryIntent}":
${intentInstructions}

KRITISCH: Diese Intent-Anweisungen haben HÖCHSTE PRIORITÄT und überschreiben allgemeine Regeln!`;
  }

  /**
   * NEUE METHODE: Generiere Intent-spezifische Anweisungen
   */
  private static generateIntentSpecificInstructions(intent: any): string {
    const intentInstructions: Record<string, string> = {
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
- 🎯 PRIORITÄT: Milch zum Trinken, nicht für Desserts`,

      'fleisch': `
🥩 FLEISCH-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Hackfleisch, Schnitzel, Rindfleisch, Schweinefleisch, echtes Fleisch
- ❌ NIEMALS erwähnen: Geschirrspülmittel, Putzmittel, Haushaltsartikel, Fisch
- ❌ ABSOLUTES VERBOT: Reinigungsprodukte bei Fleisch-Anfragen
- ✅ BEVORZUGE: Frisches Fleisch, Hackfleisch, Fleisch zum Kochen
- 🎯 PRIORITÄT: Echte Fleischprodukte für Mahlzeiten`,

      'käse': `
🧀 KÄSE-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Gouda, Emmental, Schnittkäse, echtem Käse
- ❌ NIEMALS erwähnen: Käsekuchen, süße Desserts, Käse-Aromen
- ✅ BEVORZUGE: Käse-Produkte zum Essen/Kochen
- 🎯 PRIORITÄT: Echter Käse für herzhafte Gerichte`,

      'obst': `
🍎 OBST-SUCHE ERKANNT:
- ✅ SUCHE NUR nach: Frisches Obst, Äpfel, Birnen, Bananen
- ❌ NIEMALS erwähnen: Obstsäfte, Süßwaren, Obstmus, verarbeitete Produkte
- ✅ BEVORZUGE: Frisches, unverarbeitetes Obst
- 🎯 PRIORITÄT: Frische Früchte zum direkten Verzehr`
    };

    return intentInstructions[intent.primaryIntent] || `
🎯 INTENT "${intent.primaryIntent}" ERKANNT:
- ✅ FOKUS auf Kategorien: ${intent.includeCategories.join(', ')}
- ❌ NIEMALS Produkte aus: ${intent.excludeCategories.join(', ')}
- 🎯 PRIORITÄT: Produkte die genau zum Intent passen`;
  }
}