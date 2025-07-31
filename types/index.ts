// Core types for SparFuchs application

export interface Market {
  id: string;
  name: string;
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Product data structure based on CSV schema
export interface Product {
  id: string;
  productName: string;
  category: string;
  subCategory: string;
  price: number;
  startDate: string;
  endDate: string;
  supermarket: string;
}

// Recipe data structure based on CSV schema
export interface Recipe {
  id: string;
  recipeName: string;
  overview: string;
  ingredients: string;
  preparation: string;
  nutrition: string;
  video?: string;
}

// Optimized data structures for JSON files
export interface ProductsData {
  products: Product[];
  totalCount: number;
  lastUpdated: string;
}

export interface CategoriesData {
  categories: {
    [key: string]: {
      subCategories: string[];
      productCount: number;
    };
  };
}

export interface MarketsData {
  markets: {
    [key: string]: {
      productCount: number;
      categories: string[];
    };
  };
}

export interface SearchIndex {
  byName: { [key: string]: string[] }; // productName -> product IDs
  byCategory: { [key: string]: string[] }; // category -> product IDs
  byMarket: { [key: string]: string[] }; // market -> product IDs
  byPrice: { [priceRange: string]: string[] }; // price range -> product IDs
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  headers: {
    'HTTP-Referer': string;
    'X-Title': string;
  };
}

export interface AppState {
  selectedMarkets: Market[];
  recipeMode: boolean;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

// API Response types
export interface ProductSearchResponse {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
}

export interface CategoryFilterResponse {
  categories: string[];
  subCategories: { [key: string]: string[] };
}

export interface MarketFilterResponse {
  markets: string[];
  productCounts: { [market: string]: number };
}