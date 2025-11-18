'use client';

import { motion, Variants } from 'framer-motion';

interface WelcomeMessagesProps {
  onSuggestionClick: (suggestion: string) => void;
  disableAnimation?: boolean;
}

const WELCOME_SUGGESTIONS = [
  '🥛 Welche Milch ist diese Woche günstig?',
  '🍞 Zeige mir Angebote für Brot',
  '🍎 Welches Obst ist diese Woche günstig?',
  '🧈 Wo gibt es Butter im Angebot?',
  '🥩 Welches Fleisch ist diese Woche im Angebot?',
  '🥤 Wo ist Coca Cola im Angebot?'
];


export function WelcomeMessages({ onSuggestionClick, disableAnimation = false }: WelcomeMessagesProps) {
  // Animation configurations
  const containerAnimation: Variants = disableAnimation ? {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { duration: 0 }
    }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardAnimation: Variants = disableAnimation ? {
    hidden: { opacity: 1, y: 0, scale: 1 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0 }
    }
  } : {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
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

  const titleAnimation: Variants = disableAnimation ? {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0 }
    }
  } : {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="text-center space-y-6 sm:space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      <div className="space-y-4">
        <motion.h3 
          className="text-lg sm:text-xl font-semibold flex items-center justify-center gap-2"
          style={{ color: 'var(--sparfuchs-text)' }}
          variants={titleAnimation}
        >
          👋 Willkommen! Hier sind einige Vorschläge:
        </motion.h3>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {WELCOME_SUGGESTIONS.map((suggestion, index) => (
            <motion.button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-xs sm:text-sm hover:shadow-md inter-font"
              style={{
                background: 'var(--sparfuchs-surface)',
                borderColor: 'var(--sparfuchs-border)',
                color: 'var(--sparfuchs-text)'
              }}
              variants={cardAnimation}
              whileHover={{                 
                borderColor: 'var(--sparfuchs-primary)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

export function QuickSuggestions({ 
  suggestions, 
  onSuggestionClick 
}: { 
  suggestions: string[]; 
  onSuggestionClick: (suggestion: string) => void; 
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-xs transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}