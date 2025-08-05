'use client';

import { motion } from 'framer-motion';

export function Header() {
  return (
    <header 
      className="py-6 sm:py-8"
      style={{ background: 'var(--sparfuchs-background)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
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
          style={{ color: 'var(--sparfuchs-text-light)' }}
        >
          Dein AI-Assistent für Supermarkt-Angebote
        </p>
      </div>
    </header>
  );
}