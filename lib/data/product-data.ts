import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  Product, 
  ProductsData, 
  CategoriesData, 
  MarketsData, 
  SearchIndex,
  ProductSearchResponse,
  CategoryFilterResponse,
  MarketFilterResponse
} from '../../types';

const DATA_DIR = join(process.cwd(), 'lib', 'data');

// In-memory cache for better performance
let productsCache: ProductsData | null = null;
let categoriesCache: CategoriesData | null = null;
let marketsCache: MarketsData | null = null;
let searchIndexCache: SearchIndex | null = null;

export class ProductDataService {
  // Load and cache data
  private static loadProducts(): ProductsData {
    if (!productsCache) {
      const filePath = join(DATA_DIR, 'products.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      productsCache = JSON.parse(fileContent);
    }
    if (!productsCache) {
      throw new Error('Failed to load products data');
    }
    return productsCache;
  }

  private static loadCategories(): CategoriesData {
    if (!categoriesCache) {
      const filePath = join(DATA_DIR, 'categories.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      categoriesCache = JSON.parse(fileContent);
    }
    if (!categoriesCache) {
      throw new Error('Failed to load categories data');
    }
    return categoriesCache;
  }

  private static loadMarkets(): MarketsData {
    if (!marketsCache) {
      const filePath = join(DATA_DIR, 'markets.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      marketsCache = JSON.parse(fileContent);
    }
    if (!marketsCache) {
      throw new Error('Failed to load markets data');
    }
    return marketsCache;
  }

  private static loadSearchIndex(): SearchIndex {
    if (!searchIndexCache) {
      const filePath = join(DATA_DIR, 'search-index.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      searchIndexCache = JSON.parse(fileContent);
    }
    if (!searchIndexCache) {
      throw new Error('Failed to load search index data');
    }
    return searchIndexCache;
  }

  // Public API methods
  static getAllProducts(limit?: number, offset?: number): ProductSearchResponse {
    const productsData = this.loadProducts();
    const products = productsData.products;

    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : products.length;
    
    return {
      products: products.slice(startIndex, endIndex),
      totalCount: products.length,
      hasMore: endIndex < products.length
    };
  }

  static getProductById(id: string): Product | null {
    const productsData = this.loadProducts();
    return productsData.products.find(p => p.id === id) || null;
  }

  static searchProducts(
    query: string, 
    options: {
      markets?: string[];
      categories?: string[];
      priceRange?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): ProductSearchResponse {
    const productsData = this.loadProducts();
    const searchIndex = this.loadSearchIndex();
    
    let matchingProductIds: Set<string> = new Set();

    // Enhanced search by name/query
    if (query) {
      const queryWords = query.toLowerCase().split(/\s+/);
      
      // GERMAN LANGUAGE SUPPORT: Add variations for common endings
      const expandedWords = [...queryWords];
      queryWords.forEach(word => {
        if (word === 'äpfel') expandedWords.push('apfel');
        if (word === 'apfel') expandedWords.push('äpfel');
        if (word === 'milch') expandedWords.push('vollmilch', 'frischmilch', 'landmilch');
      });
      
      // Enhanced search with expanded terms
      
      expandedWords.forEach(word => {
        let wordMatches = 0;
        
        // 1. Exact match in search index
        if (searchIndex.byName[word]) {
          searchIndex.byName[word].forEach(id => matchingProductIds.add(id));
          wordMatches += searchIndex.byName[word].length;
        }
        
        // 2. ENHANCED: Bidirectional substring matching for German compound words
        Object.keys(searchIndex.byName).forEach(indexWord => {
          // Match if search word is contained in index word (e.g., "apfel" in "apfelmix")
          // OR if index word is contained in search word (e.g., "milch" contains "mil")
          if ((indexWord.includes(word) && indexWord !== word) || 
              (word.length > 3 && indexWord.length > 3 && word.includes(indexWord))) {
            searchIndex.byName[indexWord].forEach(id => matchingProductIds.add(id));
            wordMatches += searchIndex.byName[indexWord].length;
          }
        });
        
        // 3. ENHANCED: Direct product name search for missing products
        const sizeBefore = matchingProductIds.size;
        productsData.products.forEach(product => {
          const searchText = `${product.productName} ${product.category} ${product.subCategory}`.toLowerCase();
          if (searchText.includes(word)) {
            matchingProductIds.add(product.id);
          }
        });
        const directMatches = matchingProductIds.size - sizeBefore;
        
        // Word search completed
      });
      
      // Search completed successfully
    } else {
      // If no query, start with all products
      productsData.products.forEach(p => matchingProductIds.add(p.id));
    }

    // Filter by markets
    if (options.markets && options.markets.length > 0) {
      const marketIds = new Set<string>();
      options.markets.forEach(market => {
        const marketKey = market.toLowerCase();
        if (searchIndex.byMarket[marketKey]) {
          searchIndex.byMarket[marketKey].forEach(id => marketIds.add(id));
        }
      });
      matchingProductIds = new Set([...matchingProductIds].filter(id => marketIds.has(id)));
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      const categoryIds = new Set<string>();
      options.categories.forEach(category => {
        const categoryKey = category.toLowerCase();
        if (searchIndex.byCategory[categoryKey]) {
          searchIndex.byCategory[categoryKey].forEach(id => categoryIds.add(id));
        }
      });
      matchingProductIds = new Set([...matchingProductIds].filter(id => categoryIds.has(id)));
    }

    // Filter by price range
    if (options.priceRange) {
      const priceIds = new Set(searchIndex.byPrice[options.priceRange] || []);
      matchingProductIds = new Set([...matchingProductIds].filter(id => priceIds.has(id)));
    }

    // Convert IDs to products
    const matchingProducts = [...matchingProductIds]
      .map(id => productsData.products.find(p => p.id === id))
      .filter(p => p !== undefined) as Product[];

    // Apply pagination
    const startIndex = options.offset || 0;
    const endIndex = options.limit ? startIndex + options.limit : matchingProducts.length;

    return {
      products: matchingProducts.slice(startIndex, endIndex),
      totalCount: matchingProducts.length,
      hasMore: endIndex < matchingProducts.length
    };
  }

  static getProductsByMarket(market: string, limit?: number): Product[] {
    const productsData = this.loadProducts();
    const products = productsData.products.filter(p => 
      p.supermarket.toLowerCase() === market.toLowerCase()
    );
    
    return limit ? products.slice(0, limit) : products;
  }

  static getProductsByCategory(category: string, limit?: number): Product[] {
    const productsData = this.loadProducts();
    const products = productsData.products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    
    return limit ? products.slice(0, limit) : products;
  }

  static getAllCategories(): CategoryFilterResponse {
    const categoriesData = this.loadCategories();
    
    return {
      categories: Object.keys(categoriesData.categories),
      subCategories: Object.fromEntries(
        Object.entries(categoriesData.categories).map(([key, value]) => [
          key, value.subCategories
        ])
      )
    };
  }

  static getAllMarkets(): MarketFilterResponse {
    const marketsData = this.loadMarkets();
    
    return {
      markets: Object.keys(marketsData.markets),
      productCounts: Object.fromEntries(
        Object.entries(marketsData.markets).map(([key, value]) => [
          key, value.productCount
        ])
      )
    };
  }

  static getStats() {
    const productsData = this.loadProducts();
    const categoriesData = this.loadCategories();
    const marketsData = this.loadMarkets();
    
    return {
      totalProducts: productsData.totalCount,
      totalCategories: Object.keys(categoriesData.categories).length,
      totalMarkets: Object.keys(marketsData.markets).length,
      lastUpdated: productsData.lastUpdated
    };
  }

  // Cache management
  static clearCache(): void {
    productsCache = null;
    categoriesCache = null;
    marketsCache = null;
    searchIndexCache = null;
  }
}