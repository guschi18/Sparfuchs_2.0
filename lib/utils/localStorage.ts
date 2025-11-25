/**
 * LocalStorage Service
 *
 * Production-ready localStorage wrapper with:
 * - Type safety
 * - SSR safety (Next.js compatible)
 * - Error handling (QuotaExceeded, SecurityError, etc.)
 * - Fallback to in-memory storage
 * - JSON serialization/deserialization
 */

import { ShoppingListItem, WishlistItem } from '@/types';

// Storage keys
export const STORAGE_KEYS = {
  SHOPPING_LIST: 'sparfuchs_shopping_list',
  WISHLIST: 'sparfuchs_wishlist',
} as const;

// In-memory fallback when localStorage is unavailable
class MemoryStorage {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Storage abstraction layer
class StorageService {
  private storage: Storage | MemoryStorage;
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
    this.storage = this.isAvailable
      ? window.localStorage
      : new MemoryStorage();
  }

  /**
   * Check if localStorage is available
   * Handles SSR, private browsing, and security restrictions
   */
  private checkAvailability(): boolean {
    // SSR check
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      // localStorage not available (private mode, security restrictions, etc.)
      return false;
    }
  }

  /**
   * Get item from storage with type safety
   */
  getItem<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in storage with error handling
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        // Handle quota exceeded
        if (error.name === 'QuotaExceededError') {
          console.error('[StorageService] Storage quota exceeded');
          // Could implement cleanup strategy here
        } else {
          console.error(`[StorageService] Error writing ${key}:`, error);
        }
      }
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Error removing ${key}:`, error);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('[StorageService] Error clearing storage:', error);
    }
  }

  /**
   * Check if storage is using fallback
   */
  isUsingFallback(): boolean {
    return !this.isAvailable;
  }
}

// Singleton instance
let storageService: StorageService | null = null;

/**
 * Get storage service instance (singleton)
 */
function getStorageService(): StorageService {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
}

/**
 * Shopping List specific storage operations
 */
export const shoppingListStorage = {
  /**
   * Get shopping list from storage
   */
  get(): ShoppingListItem[] {
    const service = getStorageService();
    return service.getItem<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST) || [];
  },

  /**
   * Save shopping list to storage
   */
  set(items: ShoppingListItem[]): boolean {
    const service = getStorageService();
    return service.setItem(STORAGE_KEYS.SHOPPING_LIST, items);
  },

  /**
   * Clear shopping list from storage
   */
  clear(): void {
    const service = getStorageService();
    service.removeItem(STORAGE_KEYS.SHOPPING_LIST);
  },

  /**
   * Add item to shopping list
   */
  addItem(item: ShoppingListItem): boolean {
    const items = this.get();
    items.push(item);
    return this.set(items);
  },

  /**
   * Remove item from shopping list by ID
   */
  removeItem(itemId: string): boolean {
    const items = this.get();
    const filtered = items.filter(item => item.id !== itemId);
    return this.set(filtered);
  },

  /**
   * Update item in shopping list
   */
  updateItem(itemId: string, updates: Partial<ShoppingListItem>): boolean {
    const items = this.get();
    const updated = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    return this.set(updated);
  },

  /**
   * Check if storage is using fallback
   */
  isUsingFallback(): boolean {
    const service = getStorageService();
    return service.isUsingFallback();
  }
};

/**
 * Wishlist specific storage operations
 */
export const wishlistStorage = {
  /**
   * Get wishlist from storage
   */
  get(): WishlistItem[] {
    const service = getStorageService();
    return service.getItem<WishlistItem[]>(STORAGE_KEYS.WISHLIST) || [];
  },

  /**
   * Save wishlist to storage
   */
  set(items: WishlistItem[]): boolean {
    const service = getStorageService();
    return service.setItem(STORAGE_KEYS.WISHLIST, items);
  },

  /**
   * Clear wishlist from storage
   */
  clear(): void {
    const service = getStorageService();
    service.removeItem(STORAGE_KEYS.WISHLIST);
  },

  /**
   * Check if storage is using fallback
   */
  isUsingFallback(): boolean {
    const service = getStorageService();
    return service.isUsingFallback();
  }
};

/**
 * Generic storage operations (for future use)
 */
export const storage = {
  get: <T>(key: string): T | null => {
    const service = getStorageService();
    return service.getItem<T>(key);
  },

  set: <T>(key: string, value: T): boolean => {
    const service = getStorageService();
    return service.setItem(key, value);
  },

  remove: (key: string): void => {
    const service = getStorageService();
    service.removeItem(key);
  },

  clear: (): void => {
    const service = getStorageService();
    service.clear();
  },

  isUsingFallback: (): boolean => {
    const service = getStorageService();
    return service.isUsingFallback();
  }
};
