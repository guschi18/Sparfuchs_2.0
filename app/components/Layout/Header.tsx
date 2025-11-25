'use client';

import { motion } from 'framer-motion';
import { ShoppingListButton } from '@/app/components/UI/ShoppingListButton';

interface HeaderProps {
  shoppingListCount?: number;
  onOpenShoppingList?: () => void;
  isShoppingListOpen?: boolean;
}

export function Header({
  shoppingListCount = 0,
  onOpenShoppingList,
  isShoppingListOpen = false
}: HeaderProps) {
  return (
    <header
      className="py-4 sm:py-5 sticky top-0 z-30 shadow-sm"
      style={{ background: 'var(--sparfuchs-background)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Shopping List Button - Responsive Positioning: FAB on mobile, Header-integrated on desktop */}
        {onOpenShoppingList && (
          <div className="fixed bottom-6 right-6 z-50 sm:absolute sm:top-4 sm:right-6 sm:bottom-auto sm:z-10">
            <ShoppingListButton
              itemCount={shoppingListCount}
              onClick={onOpenShoppingList}
              isOpen={isShoppingListOpen}
            />
          </div>
        )}

        {/* Centered Content */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* Shopping Cart Emoji with Animation */}
            <motion.span
              className="text-3xl"
              animate={{
                x: [0, 3, -3, 0],
                y: [0, -1, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🛒
            </motion.span>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold inter-font-semibold"
              style={{ color: 'var(--sparfuchs-text)' }}
            >
              SparFuchs<span style={{ color: 'var(--sparfuchs-primary)' }}>.de</span>
            </h1>
          </div>

          <p
            className="text-base sm:text-lg lg:text-xl inter-font"
            style={{ color: 'var(--sparfuchs-text)' }}
          >
            Dein AI-Assistent für Supermarkt-Angebote
          </p>
        </div>
      </div>
    </header>
  );
}