'use client';

import { motion } from 'framer-motion';

interface AddToListButtonProps {
  onAdd: () => void;
  isInList: boolean;
  disabled?: boolean;
}

/**
 * Add to List Button Component
 *
 * Small button to add a product to the shopping list.
 * Displayed in ProductCard component.
 *
 * Features:
 * - Icon-based design (space-efficient)
 * - Disabled state when already in list
 * - Visual feedback on hover/click
 * - Framer Motion animations
 * - Accessibility support
 */
export function AddToListButton({ onAdd, isInList, disabled = false }: AddToListButtonProps) {
  const isDisabled = disabled;

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      disabled={isDisabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all"
      style={{
        backgroundColor: isInList
          ? 'var(--sparfuchs-success)'
          : 'var(--sparfuchs-surface)',
        color: isInList ? 'white' : 'var(--sparfuchs-text)',
        border: `1.5px solid ${isInList ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-border)'}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
      }}
      whileHover={!isDisabled ? { filter: 'brightness(1.1)' } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 150
      }}
      aria-label={isInList ? 'Von der Einkaufsliste entfernen' : 'Zur Einkaufsliste hinzufügen'}
    >
      {/* Icon */}
      {isInList ? (
        // Checkmark icon when in list
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        // Plus icon when not in list
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
    </motion.button>
  );
}
