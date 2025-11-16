'use client';

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '@/app/components/UI/Toast';

/**
 * Custom Hook for Toast Notifications
 *
 * Provides methods to show/dismiss toast notifications.
 *
 * Features:
 * - Add toast with custom duration
 * - Auto-dismiss after duration
 * - Manual dismiss
 * - Multiple toasts support
 * - Type-safe
 *
 * Usage:
 * ```tsx
 * const { toasts, showToast, dismissToast } = useToast();
 *
 * // Show success toast
 * showToast('Produkt hinzugefügt!', 'success');
 *
 * // Show error toast
 * showToast('Fehler aufgetreten', 'error', 5000);
 * ```
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Show a new toast notification
   */
  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  /**
   * Dismiss a toast by ID
   */
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Dismiss all toasts
   */
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Convenience methods
   */
  const success = useCallback((message: string, duration?: number) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    // Convenience methods
    success,
    error,
    info,
  };
}
