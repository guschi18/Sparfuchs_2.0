'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ShoppingListItem, ProductCard } from '@/types';
import { shoppingListStorage } from '@/lib/utils/localStorage';

/**
 * Custom Hook for Shopping List Management
 *
 * Features:
 * - CRUD operations for shopping list items
 * - LocalStorage persistence with debouncing
 * - Computed values (totalPrice, itemCount) with useMemo
 * - Optimized event handlers with useCallback
 * - SSR-safe initialization
 * - Type-safe operations
 */

export interface UseShoppingListReturn {
  // State
  items: ShoppingListItem[];
  totalPrice: number;
  itemCount: number;
  isLoaded: boolean;
  isUsingFallback: boolean;

  // Operations
  addItem: (product: ProductCard) => boolean;
  removeItem: (itemId: string) => void;
  toggleCheck: (itemId: string) => void;
  clearList: () => void;
  isInList: (productId: string) => boolean;
}

// Debounce delay for localStorage writes (ms)
const STORAGE_DEBOUNCE_DELAY = 300;

export function useShoppingList(): UseShoppingListReturn {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Debounced storage write
   * Prevents excessive writes during rapid updates
   */
  const saveToStorage = useCallback((itemsToSave: ShoppingListItem[]) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const success = shoppingListStorage.set(itemsToSave);
      if (!success) {
        console.error('[useShoppingList] Failed to save to storage');
      }
    }, STORAGE_DEBOUNCE_DELAY);
  }, []);

  /**
   * Load items from storage on mount (SSR-safe)
   */
  useEffect(() => {
    try {
      const storedItems = shoppingListStorage.get();
      setItems(storedItems);
    } catch (error) {
      console.error('[useShoppingList] Error loading from storage:', error);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Computed: Total price of all items
   * Memoized for performance
   */
  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.priceNumeric, 0);
  }, [items]);

  /**
   * Computed: Number of items in list
   * Memoized for performance
   */
  const itemCount = useMemo(() => {
    return items.length;
  }, [items]);

  /**
   * Check if storage is using fallback
   */
  const isUsingFallback = useMemo(() => {
    return shoppingListStorage.isUsingFallback();
  }, []);

  /**
   * Convert ProductCard to ShoppingListItem
   */
  const productToListItem = useCallback((product: ProductCard): ShoppingListItem => {
    // Parse price string to number
    const priceStr = product.price.replace(',', '.');
    const priceNumeric = parseFloat(priceStr) || 0;

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      priceNumeric,
      market: product.market,
      dateRange: product.dateRange,
      brand: product.brand,
      variant: product.variant,
      pack_size: product.pack_size,
      notes: product.notes,
      checked: false,
      addedAt: Date.now(),
    };
  }, []);

  /**
   * Add item to shopping list
   * Returns true if successful, false if already exists
   */
  const addItem = useCallback((product: ProductCard): boolean => {
    // Check if product already in list
    const exists = items.some(item => item.productId === product.id);
    if (exists) {
      console.warn('[useShoppingList] Product already in list:', product.id);
      return false;
    }

    // Create new list item
    const newItem = productToListItem(product);

    // Optimistic update
    const newItems = [...items, newItem];
    setItems(newItems);

    // Save to storage (debounced)
    saveToStorage(newItems);

    return true;
  }, [items, productToListItem, saveToStorage]);

  /**
   * Remove item from shopping list
   */
  const removeItem = useCallback((itemId: string) => {
    // Optimistic update
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);

    // Save to storage (debounced)
    saveToStorage(newItems);
  }, [items, saveToStorage]);

  /**
   * Toggle checked state of item
   */
  const toggleCheck = useCallback((itemId: string) => {
    // Optimistic update
    const newItems = items.map(item =>
      item.id === itemId
        ? { ...item, checked: !item.checked }
        : item
    );
    setItems(newItems);

    // Save to storage (debounced)
    saveToStorage(newItems);
  }, [items, saveToStorage]);

  /**
   * Clear all items from shopping list
   */
  const clearList = useCallback(() => {
    // Optimistic update
    setItems([]);

    // Clear storage immediately (no debounce for clear)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    shoppingListStorage.clear();
  }, []);

  /**
   * Check if product is already in shopping list
   */
  const isInList = useCallback((productId: string): boolean => {
    return items.some(item => item.productId === productId);
  }, [items]);

  return {
    // State
    items,
    totalPrice,
    itemCount,
    isLoaded,
    isUsingFallback,

    // Operations
    addItem,
    removeItem,
    toggleCheck,
    clearList,
    isInList,
  };
}
