'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingListButton } from '@/app/components/UI/ShoppingListButton';
import { WishlistButton } from '@/app/components/UI/WishlistButton';

interface HeaderProps {
  shoppingListCount?: number;
  onOpenShoppingList?: () => void;
  isShoppingListOpen?: boolean;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  isWishlistOpen?: boolean;
}

export function Header({
  shoppingListCount = 0,
  onOpenShoppingList,
  isShoppingListOpen = false,
  wishlistCount = 0,
  onOpenWishlist,
  isWishlistOpen = false
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // Mindest-Scroll bevor Header verschwindet
      
      // Nur auf Mobile (unter 640px = sm breakpoint)
      if (window.innerWidth >= 640) {
        setIsVisible(true);
        return;
      }

      // Am Seitenanfang immer sichtbar
      if (currentScrollY < scrollThreshold) {
        setIsVisible(true);
      } 
      // Nach oben scrollen = Header zeigen
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Nach unten scrollen = Header verstecken
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Mobile FABs - Outside of animated header so they stay visible */}
      {onOpenWishlist && (
        <div className="fixed bottom-6 left-6 z-50 sm:hidden">
          <WishlistButton
            itemCount={wishlistCount}
            onClick={onOpenWishlist}
            isOpen={isWishlistOpen}
          />
        </div>
      )}
      {onOpenShoppingList && (
        <div className="fixed bottom-6 right-6 z-50 sm:hidden">
          <ShoppingListButton
            itemCount={shoppingListCount}
            onClick={onOpenShoppingList}
            isOpen={isShoppingListOpen}
          />
        </div>
      )}

      <motion.header
        className="py-4 sm:py-5 sticky top-0 z-30 shadow-sm"
        style={{ background: 'var(--sparfuchs-background)' }}
        initial={{ y: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeInOut' 
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Desktop Buttons - Inside header, hidden on mobile */}
          {onOpenWishlist && (
            <div className="hidden sm:block absolute top-4 left-6 z-10">
              <WishlistButton
                itemCount={wishlistCount}
                onClick={onOpenWishlist}
                isOpen={isWishlistOpen}
              />
            </div>
          )}
          {onOpenShoppingList && (
            <div className="hidden sm:block absolute top-4 right-6 z-10">
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
    </motion.header>
    </>
  );
}