# WishlistPanel Component Documentation

## Architektur & Zweck
**Zweck**: Slide-in Panel für Merkzettel mit Eingabefeld und Produktkarten
**Pattern**: Controlled Modal mit Backdrop und Keyboard Support
**Kritische Entscheidung**: Panel von links (im Gegensatz zu ShoppingListPanel von rechts)

## Dependencies & Integration
- **Framer Motion**: Slide-in Animation, Item-Stagger
- **Types**: `WishlistItem` aus `@/types`
- **Parent**: `app/page.tsx`

## Props Interface
```typescript
interface WishlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onAddItem: (name: string) => boolean;
  onRemoveItem: (itemId: string) => void;
  onClearList: () => void;
  onSearchItem: (name: string) => void;  // Triggert Chat-Suche
}
```

## UI Structure
```
dialog (fixed left-0, slide from left)
├── Header: "📋 Merkzettel" + Close Button
├── Input Form: Textbox + "+" Button
├── Content (scrollable):
│   └── Items[] → Card mit Name + "Angebote suchen" + Delete
└── Footer: "Merkzettel leeren" Button (wenn items > 0)
```

## Animations
```typescript
// Panel (von links)
panelVariants: { hidden: { x: '-100%' }, visible: { x: 0 } }

// Items (staggered)
itemVariants: { hidden: { x: -20 }, visible: { x: 0 } }
transition: { delay: index * 0.05 }
```

## Geschäftslogik
- **Add Flow**: Input → Trim → onAddItem → Clear Input oder Error Message
- **Search Flow**: Klick "Angebote suchen" → onSearchItem(name) → onClose()
- **Validation**: Leerer Input zeigt Error, Duplikat zeigt Error

## Accessibility
- **role="dialog"**, **aria-modal="true"**
- **ESC Key**: Schließt Panel
- **Backdrop Click**: Schließt Panel
- **Body Scroll Lock**: Während Panel offen

## Responsive Design
- **Width**: w-full (mobile), sm:w-96, md:w-[28rem]
- **Padding**: p-4 (mobile), sm:p-6

