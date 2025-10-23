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