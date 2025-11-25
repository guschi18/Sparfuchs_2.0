'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WishlistItem } from '@/types';
import { useEffect } from 'react';

interface WishlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onAddItem: (name: string) => boolean;
  onRemoveItem: (itemId: string) => void;
  onClearList: () => void;
  onSearchItem: (name: string) => void;
}

/**
 * Wishlist Panel Component (Merkzettel)
 *
 * Slide-in panel from left showing the wishlist with:
 * - Input field to add new items
 * - List of saved items as cards
 * - "Angebote suchen" button per item
 * - Remove button per item
 * - Clear list button
 *
 * Features:
 * - Framer Motion slide-in animation
 * - Responsive design
 * - Accessibility support
 * - Empty state
 */
export function WishlistPanel({
  isOpen,
  onClose,
  items,
  onAddItem,
  onRemoveItem,
  onClearList,
  onSearchItem,
}: WishlistPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputValue.trim()) {
      setError('Bitte gib einen Produktnamen ein');
      return;
    }

    const success = onAddItem(inputValue.trim());
    if (success) {
      setInputValue('');
    } else {
      setError('Dieses Produkt ist bereits auf deinem Merkzettel');
    }
  };

  const handleSearch = (item: WishlistItem) => {
    onSearchItem(item.name);
    onClose();
  };

  // Panel animation variants (from left)
  const panelVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 150
      }
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: {
        type: "spring" as const,
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
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
            className="fixed top-0 left-0 h-full w-full sm:w-96 md:w-[28rem] z-50 flex flex-col shadow-2xl"
            style={{
              backgroundColor: 'var(--sparfuchs-background)',
            }}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-title"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 sm:p-6 border-b"
              style={{
                borderColor: 'var(--sparfuchs-border)',
              }}
            >
              <h2
                id="wishlist-title"
                className="text-xl sm:text-2xl font-bold inter-font-semibold flex items-center gap-2"
                style={{ color: 'var(--sparfuchs-text)' }}
              >
                <span>📋</span>
                Merkzettel
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

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 border-b"
              style={{ borderColor: 'var(--sparfuchs-border)' }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError('');
                  }}
                  placeholder="z.B. Käse, Butter, Milch..."
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none"
                  style={{
                    backgroundColor: 'var(--sparfuchs-surface)',
                    borderColor: error ? '#dc2626' : 'var(--sparfuchs-border)',
                    color: 'var(--sparfuchs-text)',
                  }}
                  aria-label="Produkt hinzufügen"
                />
                <motion.button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--sparfuchs-primary)',
                    color: 'white',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  +
                </motion.button>
              </div>
              {error && (
                <p className="mt-2 text-sm" style={{ color: '#dc2626' }}>
                  {error}
                </p>
              )}
            </form>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {items.length === 0 ? (
                // Empty state
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-6xl mb-4">📋</span>
                  <p
                    className="text-lg font-medium mb-2"
                    style={{ color: 'var(--sparfuchs-text)' }}
                  >
                    Dein Merkzettel ist leer
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--sparfuchs-text-light)' }}
                  >
                    Füge Produkte hinzu, die du beobachten möchtest
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
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--sparfuchs-surface)',
                        borderColor: 'var(--sparfuchs-border)',
                      }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Item name */}
                        <h3
                          className="font-semibold text-lg flex-1"
                          style={{ color: 'var(--sparfuchs-text)' }}
                        >
                          {item.name}
                        </h3>

                        {/* Remove button */}
                        <motion.button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 rounded transition-colors flex-shrink-0"
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`${item.name} entfernen`}
                        >
                          <svg
                            className="w-5 h-5"
                            style={{ color: '#dc2626' }}
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

                      {/* Search button */}
                      <motion.button
                        onClick={() => handleSearch(item)}
                        className="w-full mt-3 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'var(--sparfuchs-primary)',
                          color: 'white',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Angebote suchen
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="border-t p-4 sm:p-6"
                style={{
                  borderColor: 'var(--sparfuchs-border)',
                  backgroundColor: 'var(--sparfuchs-surface)',
                }}
              >
                {/* Clear list button */}
                <motion.button
                  onClick={() => {
                    onClearList();
                  }}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '2px solid #dc2626',
                  }}
                  whileHover={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Merkzettel leeren
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

