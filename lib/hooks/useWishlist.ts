'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { WishlistItem } from '@/types';
import { wishlistStorage } from '@/lib/utils/localStorage';

/**
 * Custom Hook for Wishlist Management (Merkzettel)
 *
 * Features:
 * - CRUD operations for wishlist items
 * - LocalStorage persistence with debouncing
 * - SSR-safe initialization
 * - Type-safe operations
 */

export interface UseWishlistReturn {
  // State
  items: WishlistItem[];
  itemCount: number;
  isLoaded: boolean;
  isUsingFallback: boolean;

  // Operations
  addItem: (name: string) => boolean;
  removeItem: (itemId: string) => void;
  clearList: () => void;
  hasItem: (name: string) => boolean;
}

// Debounce delay for localStorage writes (ms)
const STORAGE_DEBOUNCE_DELAY = 300;

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Debounced storage write
   * Prevents excessive writes during rapid updates
   */
  const saveToStorage = useCallback((itemsToSave: WishlistItem[]) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const success = wishlistStorage.set(itemsToSave);
      if (!success) {
        console.error('[useWishlist] Failed to save to storage');
      }
    }, STORAGE_DEBOUNCE_DELAY);
  }, []);

  /**
   * Load items from storage on mount (SSR-safe)
   */
  useEffect(() => {
    try {
      const storedItems = wishlistStorage.get();
      setItems(storedItems);
    } catch (error) {
      console.error('[useWishlist] Error loading from storage:', error);
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
   * Computed: Number of items in list
   */
  const itemCount = useMemo(() => {
    return items.length;
  }, [items]);

  /**
   * Check if storage is using fallback
   */
  const isUsingFallback = useMemo(() => {
    return wishlistStorage.isUsingFallback();
  }, []);

  /**
   * Add item to wishlist
   * Returns true if successful, false if already exists
   */
  const addItem = useCallback((name: string): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    // Check if item already exists (case-insensitive)
    const exists = items.some(
      item => item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      console.warn('[useWishlist] Item already in list:', trimmedName);
      return false;
    }

    // Create new wishlist item
    const newItem: WishlistItem = {
      id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      addedAt: Date.now(),
    };

    // Optimistic update
    const newItems = [...items, newItem];
    setItems(newItems);

    // Save to storage (debounced)
    saveToStorage(newItems);

    return true;
  }, [items, saveToStorage]);

  /**
   * Remove item from wishlist
   */
  const removeItem = useCallback((itemId: string) => {
    // Optimistic update
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);

    // Save to storage (debounced)
    saveToStorage(newItems);
  }, [items, saveToStorage]);

  /**
   * Clear all items from wishlist
   */
  const clearList = useCallback(() => {
    // Optimistic update
    setItems([]);

    // Clear storage immediately (no debounce for clear)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    wishlistStorage.clear();
  }, []);

  /**
   * Check if item name is already in wishlist (case-insensitive)
   */
  const hasItem = useCallback((name: string): boolean => {
    return items.some(
      item => item.name.toLowerCase() === name.trim().toLowerCase()
    );
  }, [items]);

  return {
    // State
    items,
    itemCount,
    isLoaded,
    isUsingFallback,

    // Operations
    addItem,
    removeItem,
    clearList,
    hasItem,
  };
}

