'use client';

import { motion } from 'framer-motion';

interface ShoppingListButtonProps {
  itemCount: number;
  onClick: () => void;
  isOpen?: boolean;
}

/**
 * Shopping List Button Component
 *
 * Displays a button with badge showing the number of items in the shopping list.
 * Used in the header to open/close the shopping list panel.
 *
 * Features:
 * - Badge with item count
 * - Framer Motion animations
 * - Responsive design (desktop/mobile)
 * - Active state indication
 * - Pulse animation on count change
 */
export function ShoppingListButton({ itemCount, onClick, isOpen = false }: ShoppingListButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative flex items-center justify-center gap-2 w-14 h-14 p-0 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:w-auto sm:h-auto sm:px-4 sm:py-2 sm:rounded-lg sm:shadow-none transition-all duration-200 inter-font-medium text-sm sm:text-base"
      style={{
        backgroundColor: isOpen ? 'var(--sparfuchs-primary)' : 'var(--sparfuchs-surface)',
        color: isOpen ? 'white' : 'var(--sparfuchs-text)',
        border: `2px solid ${isOpen ? 'var(--sparfuchs-primary)' : 'var(--sparfuchs-border)'}`,
      }}
      whileHover={{
        scale: 1.05,
        borderColor: 'var(--sparfuchs-primary)',
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100
      }}
      aria-label={`Einkaufsliste öffnen (${itemCount} ${itemCount === 1 ? 'Artikel' : 'Artikel'})`}
    >
      {/* Icon */}
      <span className="text-2xl sm:text-xl" aria-hidden="true">
        📝
      </span>

      {/* Text (hidden on mobile) */}
      <span className="hidden sm:inline">
        Einkaufsliste
      </span>

      {/* Badge with count */}
      {itemCount > 0 && (
        <motion.span
          className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold"
          style={{
            backgroundColor: 'var(--sparfuchs-success)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={itemCount} // Re-animate on count change
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 200
          }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.span>
      )}

      {/* Pulse animation when items > 0 */}
      {itemCount > 0 && (
        <motion.span
          className="absolute inset-0 rounded-lg"
          style={{
            border: '2px solid var(--sparfuchs-success)',
            opacity: 0,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      )}
    </motion.button>
  );
}
