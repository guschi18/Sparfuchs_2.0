import { ProductDataService } from '../data/product-data';

export interface HallucinationCheckResult {
  isValid: boolean;
  invalidReferences: string[];
  validReferences: string[];
  confidence: number;
}

export class HallucinationDetector {
  private static readonly PRODUCT_NAME_REGEX = /"([^"]+)"/g;
  private static readonly PRICE_REGEX = /(\d+[,.]?\d*)\s*€/g;
  private static readonly MARKET_NAMES = ['aldi', 'lidl', 'rewe', 'edeka', 'penny'];

  static validateResponse(aiResponse: string): HallucinationCheckResult {
    const productReferences = this.extractProductReferences(aiResponse);
    const priceReferences = this.extractPriceReferences(aiResponse);
    const marketReferences = this.extractMarketReferences(aiResponse);

    const validProducts: string[] = [];
    const invalidProducts: string[] = [];

    productReferences.forEach(productName => {
      const searchResults = ProductDataService.searchProducts(productName, { limit: 5 });
      
      const exactMatch = searchResults.products.some(product => 
        product.productName.toLowerCase().includes(productName.toLowerCase()) ||
        productName.toLowerCase().includes(product.productName.toLowerCase())
      );
      
      if (exactMatch) {
        validProducts.push(productName);
      } else {
        invalidProducts.push(productName);
      }
    });

    const validMarkets = marketReferences.filter(market => 
      this.MARKET_NAMES.includes(market.toLowerCase())
    );

    const totalReferences = productReferences.length + priceReferences.length + marketReferences.length;
    const validReferences = validProducts.length + priceReferences.length + validMarkets.length;
    
    const confidence = totalReferences > 0 ? validReferences / totalReferences : 1.0;

    return {
      isValid: invalidProducts.length === 0 && confidence >= 0.8,
      invalidReferences: invalidProducts,
      validReferences: [...validProducts, ...validMarkets],
      confidence,
    };
  }

  private static extractProductReferences(text: string): string[] {
    const matches: string[] = [];
    let match;

    while ((match = this.PRODUCT_NAME_REGEX.exec(text)) !== null) {
      matches.push(match[1]);
    }

    const words = text.split(' ');
    const productWords = words.filter(word => 
      word.length > 3 && 
      /[A-ZÄÖÜ]/.test(word[0]) &&
      !this.MARKET_NAMES.includes(word.toLowerCase())
    );

    return [...new Set([...matches, ...productWords])];
  }

  private static extractPriceReferences(text: string): string[] {
    const matches: string[] = [];
    let match;

    while ((match = this.PRICE_REGEX.exec(text)) !== null) {
      matches.push(match[0]);
    }

    return matches;
  }

  private static extractMarketReferences(text: string): string[] {
    const markets: string[] = [];
    const textLower = text.toLowerCase();

    this.MARKET_NAMES.forEach(market => {
      if (textLower.includes(market)) {
        markets.push(market);
      }
    });

    return markets;
  }

  static async validateProductPrices(
    aiResponse: string,
    userQuery: string,
    selectedMarkets: string[] = ['Aldi', 'Lidl', 'Rewe', 'Edeka', 'Penny']
  ): Promise<boolean> {
    const productReferences = this.extractProductReferences(aiResponse);
    const priceReferences = this.extractPriceReferences(aiResponse);

    if (productReferences.length === 0 || priceReferences.length === 0) {
      return true;
    }

    for (const productName of productReferences) {
      const searchResults = ProductDataService.searchProducts(productName, {
        markets: selectedMarkets,
        limit: 10,
      });

      if (searchResults.products.length === 0) {
        continue;
      }

      const actualPrices = searchResults.products.map(p => p.price);
      const mentionedPrices = priceReferences.map(price => 
        parseFloat(price.replace('€', '').replace(',', '.').trim())
      );

      const priceMatches = mentionedPrices.some(mentionedPrice =>
        actualPrices.some(actualPrice => Math.abs(actualPrice - mentionedPrice) < 0.1)
      );

      if (!priceMatches) {
        // Price mismatch detected
        return false;
      }
    }

    return true;
  }

  static generateWarningMessage(checkResult: HallucinationCheckResult): string {
    if (checkResult.isValid) {
      return '';
    }

    const invalidProducts = checkResult.invalidReferences.join(', ');
    
    return `⚠️ Hinweis: Die Antwort enthält möglicherweise Produkte, die nicht in den aktuellen Angeboten verfügbar sind: ${invalidProducts}. Bitte überprüfe die Verfügbarkeit in den jeweiligen Märkten.`;
  }
}