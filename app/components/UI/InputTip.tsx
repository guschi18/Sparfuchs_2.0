'use client';

import { motion, Variants } from 'framer-motion';

interface InputTipProps {
  text: string;
  variant: 'main' | 'chat';
  className?: string;
}

export function InputTip({ text, variant, className = '' }: InputTipProps) {
  // Animation configuration with performance optimization
  const tipAnimation: Variants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        delay: variant === 'main' ? 0.5 : 0.2, // Staggered timing for different variants
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth easing
        type: "tween" as const // Use tween for better performance than spring
      }
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Einheitlicher Text für alle Varianten
  const getUnifiedText = (): { full: string; mobile: string } => {
    const unifiedText = "**Enter** zum Senden, **Shift+Enter** für neue Zeile";
    return {
      full: unifiedText,
      mobile: unifiedText // Gleicher Text für Desktop und Mobile
    };
  };

  const textVariants = getUnifiedText();

  // Parse text with markdown-style bold formatting
  const parseText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold" style={{ color: 'var(--sparfuchs-text)' }}>
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  // Variant-specific styles
  const variantStyles = {
    main: {
      marginTop: '-8px', // Negativer Margin für minimalen Abstand zum Eingabefeld
      marginBottom: '32px' // Mehr Abstand zum Senden Button
    },
    chat: {
      marginTop: '-8px', // Negativer Margin für minimalen Abstand zum Eingabefeld
      marginBottom: '32px' // Mehr Abstand zum Senden Button
    }
  };

  return (
    <motion.div
      className={`text-center max-w-full ${className}`}
      style={{
        background: 'transparent', // Fließend in das Beige integriert
        color: 'var(--sparfuchs-text-light)',
        borderRadius: '8px',
        border: 'none', // Kein Border für fließende Integration
        willChange: 'transform, opacity', // GPU acceleration hint
        backfaceVisibility: 'hidden', // Prevent flickering
        ...variantStyles[variant]
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={tipAnimation}
      layout // Smooth layout changes
    >
      <div className="p-1 sm:p-1">
        {/* Desktop Text - nur auf Desktop sichtbar */}
        <span className="hidden sm:block inter-font text-xs sm:text-sm leading-relaxed">
          {parseText(textVariants.full)}
        </span>
        
        {/* Mobile Text - komplett entfernt */}
      </div>
    </motion.div>
  );
}