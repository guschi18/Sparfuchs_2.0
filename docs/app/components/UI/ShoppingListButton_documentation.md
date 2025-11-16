# ShoppingListButton Component Documentation

## Architektur & Zweck
**Zweck**: Header-Button mit Badge zur Anzeige Shopping List Item-Count
**Pattern**: Presentational Component mit Framer Motion Animations
**Kritische Entscheidung**: Responsive Design (Text hidden auf Mobile, nur Icon + Badge)

## Dependencies & Integration
- **Framer Motion**: motion, whileHover, whileTap Animations
- **Parent**: Header Component (app/components/Layout/Header.tsx)
- **Triggers**: onClick öffnet ShoppingListPanel

## Props Interface
```typescript
interface ShoppingListButtonProps {
  itemCount: number;       // Anzahl Produkte in Liste
  onClick: () => void;     // Panel öffnen Handler
  isOpen?: boolean;        // Active State für Visual Feedback
}
```

## UI Features
- **Badge**: Animated Count Badge (top-right, max "99+")
- **Pulse Animation**: Infinite pulse-ring wenn items > 0
- **Active State**: Primary color wenn Panel offen
- **Responsive**:
  - Mobile: Icon (📝) + Badge
  - Desktop: Icon + "Einkaufsliste" Text + Badge

## Animations
```typescript
// Badge erscheint mit Spring
animate: { scale: 1 }, key: itemCount  // Re-animiert bei Count-Änderung

// Pulse Ring (infinite)
animate: { scale: [1, 1.1, 1], opacity: [0.5, 0, 0] }
repeat: Infinity, repeatDelay: 1s

// Button Hover/Tap
whileHover: { scale: 1.05 }
whileTap: { scale: 0.95 }
```

## Styling
- **Colors**: CSS Variables (--sparfuchs-*)
- **Active**: Primary background + white text
- **Inactive**: Surface background + text color
- **Badge**: Success color (#10b981) mit Shadow

## Accessibility
- **aria-label**: "Einkaufsliste öffnen (X Artikel)"
- **Keyboard**: Voll keyboard-accessible (button element)
