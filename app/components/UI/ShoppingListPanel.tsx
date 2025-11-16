'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingListItem } from '@/types';
import { useEffect } from 'react';

interface ShoppingListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  totalPrice: number;
  onToggleCheck: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearList: () => void;
  hideCompleted?: boolean;
  onToggleHideCompleted?: () => void;
}

/**
 * Shopping List Panel Component
 *
 * Slide-in panel from right showing the shopping list with:
 * - List of items with checkboxes
 * - Remove buttons for each item
 * - Total price calculation
 * - Clear list button
 * - Close button
 * - Keyboard navigation (ESC to close)
 * - Backdrop click to close
 *
 * Features:
 * - Framer Motion slide-in animation
 * - Responsive design
 * - Accessibility support
 * - Empty state
 */
export function ShoppingListPanel({
  isOpen,
  onClose,
  items,
  totalPrice,
  onToggleCheck,
  onRemoveItem,
  onClearList,
  hideCompleted = false,
  onToggleHideCompleted,
}: ShoppingListPanelProps) {
  // Filter items based on hideCompleted state
  const visibleItems = hideCompleted
    ? items.filter(item => !item.checked)
    : items;
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Panel animation variants
  const panelVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 150
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 150
      }
    }
  };

  // Backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-96 md:w-[28rem] z-50 flex flex-col shadow-2xl"
            style={{
              backgroundColor: 'var(--sparfuchs-background)',
            }}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shopping-list-title"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 sm:p-6 border-b"
              style={{
                borderColor: 'var(--sparfuchs-border)',
              }}
            >
              <h2
                id="shopping-list-title"
                className="text-xl sm:text-2xl font-bold inter-font-semibold flex items-center gap-2"
                style={{ color: 'var(--sparfuchs-text)' }}
              >
                <span>📝</span>
                Einkaufsliste
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--sparfuchs-text)',
                }}
                whileHover={{
                  backgroundColor: 'var(--sparfuchs-surface)',
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Schließen"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {visibleItems.length === 0 ? (
                // Empty state
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-6xl mb-4">🛒</span>
                  <p
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--sparfuchs-text)' }}
                  >
                    {items.length === 0 ? 'Deine Liste ist leer' : 'Alle Produkte erledigt!'}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--sparfuchs-text-light)' }}
                  >
                    {items.length === 0
                      ? 'Füge Produkte aus den Angeboten hinzu'
                      : 'Zeige erledigte Produkte an, um sie zu sehen'}
                  </p>
                </motion.div>
              ) : (
                // List of items
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {visibleItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="p-3 sm:p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--sparfuchs-surface)',
                        borderColor: 'var(--sparfuchs-border)',
                        opacity: item.checked ? 0.6 : 1,
                      }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleCheck(item.id)}
                          className="mt-1 flex-shrink-0"
                          aria-label={item.checked ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
                        >
                          <div
                            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                            style={{
                              borderColor: item.checked ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-border)',
                              backgroundColor: item.checked ? 'var(--sparfuchs-success)' : 'transparent',
                            }}
                          >
                            {item.checked && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </button>

                        {/* Item details */}
                        <div className="flex-1 min-w-0">
                          {item.brand && (
                            <p
                              className="text-xs font-medium uppercase tracking-wide mb-1"
                              style={{
                                color: 'var(--sparfuchs-text-light)',
                                textDecoration: item.checked ? 'line-through' : 'none',
                              }}
                            >
                              {item.brand}
                            </p>
                          )}
                          <h3
                            className="font-semibold text-sm sm:text-base mb-1"
                            style={{
                              color: 'var(--sparfuchs-text)',
                              textDecoration: item.checked ? 'line-through' : 'none',
                            }}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-lg font-bold"
                              style={{ color: 'var(--sparfuchs-primary)' }}
                            >
                              {item.price} €
                            </span>
                            <span className="text-xs" style={{ color: 'var(--sparfuchs-text-light)' }}>
                              •
                            </span>
                            <span className="text-xs font-medium" style={{ color: 'var(--sparfuchs-text-light)' }}>
                              {item.market}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--sparfuchs-text-light)' }}>
                            📅 {item.dateRange}
                          </p>
                        </div>

                        {/* Remove button */}
                        <motion.button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 rounded transition-colors flex-shrink-0"
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`${item.name} entfernen`}
                        >
                          <svg
                            className="w-5 h-5"
                            style={{ color: '#ef4444' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="border-t p-4 sm:p-6 space-y-4"
                style={{
                  borderColor: 'var(--sparfuchs-border)',
                  backgroundColor: 'var(--sparfuchs-surface)',
                }}
              >
                {/* Total price */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: 'var(--sparfuchs-text)' }}
                  >
                    Gesamt:
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: 'var(--sparfuchs-primary)' }}
                  >
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>

                {/* Toggle hide completed button */}
                {onToggleHideCompleted && items.some(item => item.checked) && (
                  <motion.button
                    onClick={onToggleHideCompleted}
                    className="w-full py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--sparfuchs-text)',
                      border: '2px solid var(--sparfuchs-border)',
                    }}
                    whileHover={{
                      borderColor: 'var(--sparfuchs-primary)',
                      color: 'var(--sparfuchs-primary)',
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {hideCompleted ? '✓ Erledigte anzeigen' : '👁️ Erledigte ausblenden'}
                  </motion.button>
                )}

                {/* Clear list button */}
                <motion.button
                  onClick={onClearList}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                  }}
                  whileHover={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Liste leeren
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
