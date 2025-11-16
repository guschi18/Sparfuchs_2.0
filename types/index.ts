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

export interface AppState {
  selectedMarkets: Market[];
  recipeMode: boolean;
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

// Offer data structure (from Angebote.txt JSONL)
export interface Offer {
  supermarket: string;
  brand: string | null;
  product_name: string;
  variant: string | null;
  pack_size: string | null;
  unit: string | null;
  pack_count: number | null;
  price: number | null;
  currency: string;
  promo_type: string | null;
  compare_price: string | null;
  uvp: number | null;
  discount_pct: number | null;
  valid_from: string;
  valid_to: string;
  special_validity: string | null;
  notes: string | null;
}

// Product card data for UI display
export interface ProductCard {
  id: string;
  name: string;
  price: string;
  market: string;
  dateRange: string;
  brand?: string;
  uvp?: string;
  discount_pct?: number;
  notes?: string;
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  selectedMarkets: string[];
  useSemanticSearch?: boolean;
}

export interface ChatResponse {
  content?: string;
  done?: boolean;
  error?: string;
}

// Shopping List types
export interface ShoppingListItem {
  id: string;                    // Unique identifier for the list item
  productId: string;             // Reference to original product
  name: string;                  // Product name
  price: string;                 // Price as string (e.g., "2.49")
  priceNumeric: number;          // Price as number for calculations
  market: string;                // Market name (Lidl, Aldi, etc.)
  dateRange: string;             // Validity period
  brand?: string;                // Optional brand
  uvp?: string;                  // Optional UVP (Unverbindliche Preisempfehlung)
  discount_pct?: number;         // Optional discount percentage
  notes?: string;                // Optional notes/restrictions
  checked: boolean;              // Whether item is checked off
  addedAt: number;               // Timestamp when added (Unix timestamp for storage)
}

export interface ShoppingListState {
  items: ShoppingListItem[];
  totalPrice: number;
  itemCount: number;
}