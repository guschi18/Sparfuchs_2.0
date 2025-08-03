'use client';

import { motion, Variants } from 'framer-motion';

interface MarketTogglesProps {
  selectedMarkets: string[];
  onMarketChange: (markets: string[]) => void;
}

const AVAILABLE_MARKETS = [
  { id: 'Lidl', name: 'Lidl' },
  { id: 'Aldi', name: 'Aldi' },
  { id: 'Edeka', name: 'Edeka' },
  { id: 'Penny', name: 'Penny' },
  { id: 'Rewe', name: 'Rewe' },
];

export function MarketToggles({ selectedMarkets, onMarketChange }: MarketTogglesProps) {
  const toggleMarket = (marketId: string) => {
    if (selectedMarkets.includes(marketId)) {
      // Entfernen, wenn bereits ausgewählt (aber mindestens einer muss ausgewählt bleiben)
      if (selectedMarkets.length > 1) {
        onMarketChange(selectedMarkets.filter(id => id !== marketId));
      }
    } else {
      // Hinzufügen, wenn nicht ausgewählt
      onMarketChange([...selectedMarkets, marketId]);
    }
  };

  // Animation configurations
  const containerAnimation: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemAnimation: Variants = {
    hidden: { opacity: 0, y: -15, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-3 sm:gap-4"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      {AVAILABLE_MARKETS.map((market) => {
        const isSelected = selectedMarkets.includes(market.id);
        const isDisabled = selectedMarkets.length === 1 && isSelected;
        
        return (
          <motion.label
            key={market.id}
            className="flex items-center gap-3 cursor-pointer select-none group"
            style={{ opacity: isDisabled ? 0.6 : 1 }}
            variants={itemAnimation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => !isDisabled && toggleMarket(market.id)}
                disabled={isDisabled}
                className="sr-only"
                aria-label={`${market.name} auswählen`}
              />
              <div
                className="w-6 h-6 rounded-lg border-2 transition-all duration-200 ease-in-out flex items-center justify-center group-hover:scale-105"
                style={{
                  borderColor: isSelected ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-text-light)',
                  backgroundColor: isSelected ? 'var(--sparfuchs-success)' : 'transparent',
                  boxShadow: isSelected ? '0 0 0 2px rgba(40, 167, 69, 0.2)' : 'none',
                }}
              >
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-white animate-in zoom-in-50 duration-200"
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
            </div>
            <span
              className="font-medium text-sm sm:text-base transition-colors duration-200 group-hover:opacity-80"
              style={{ color: isSelected ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-text-light)' }}
            >
              {market.name}
            </span>
          </motion.label>
        );
      })}
    </motion.div>
  );
}