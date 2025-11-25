# WishlistButton Component Documentation

## Architektur & Zweck
**Zweck**: Header-Button zum Öffnen des Merkzettel-Panels mit Item-Count Badge
**Pattern**: Presentational Component mit Framer Motion Animations
**Kritische Entscheidung**: FAB auf Mobile (bottom-left), Header-integriert auf Desktop (top-left)

## Dependencies & Integration
- **Framer Motion**: Scale/Opacity Animations, Badge Pulse
- **Parent**: `Header.tsx`

## Props Interface
```typescript
interface WishlistButtonProps {
  itemCount: number;
  onClick: () => void;
  isOpen?: boolean;  // Active State
}
```

## UI Structure
```
button (relative)
├── Icon: 📋 emoji
├── Label: "Merkzettel" (hidden on mobile)
├── Badge (absolute -top-1 -right-1, wenn itemCount > 0)
└── Pulse Ring (infinite animation, wenn itemCount > 0)
```

## Animations
```typescript
// Button Entry
initial: { opacity: 0, y: -10 }
animate: { opacity: 1, y: 0 }

// Badge (re-animates on count change)
key={itemCount}
initial: { scale: 0 }
animate: { scale: 1 }

// Pulse Ring
animate: { scale: [1, 1.1, 1], opacity: [0.5, 0, 0] }
transition: { repeat: Infinity, repeatDelay: 1 }
```

## Styling
- **Active State**: Background → primary, Color → white
- **Hover**: scale: 1.05, borderColor → primary
- **Badge**: Background → success (#16a34a), max "99+"

## Responsive Design
- **Mobile**: w-14 h-14, rounded-full, shadow (FAB-Style)
- **Desktop**: sm:w-auto, sm:px-4 sm:py-2, sm:rounded-lg

