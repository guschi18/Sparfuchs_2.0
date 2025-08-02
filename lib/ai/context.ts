import { ProductDataService } from '../data/product-data';
import { SemanticSearchService } from './semantic-search';
import { Product } from '../../types';

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
          `- ${product.productName} (${product.supermarket}): ${product.price.toFixed(2).replace('.', ',')} € [${product.startDate} - ${product.endDate}] - Kategorie: ${product.category}`
        )
        .join('\n');

      return `Aktuelle Angebote für "${query}" (${products.length} von ${totalCount} Produkten gefunden):\n\nWICHTIG: Die Produkte sind bereits in der korrekten Markt-Reihenfolge sortiert (Lidl, Aldi, Edeka, Penny, Rewe). BITTE DIESE REIHENFOLGE IN DEINER ANTWORT BEIBEHALTEN!\n\n${productContext}`;
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
    const systemMessage = this.generateSystemContext(config);
    
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
}