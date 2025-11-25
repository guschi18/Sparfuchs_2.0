# ShoppingListPanel Component Documentation

## Architektur & Zweck
**Zweck**: Slide-in Panel von rechts für Shopping List Management
**Pattern**: Modal-ähnliches Overlay mit Backdrop, Keyboard Navigation, Body-Scroll-Lock
**Kritische Entscheidung**: AnimatePresence für smooth Entry/Exit Animations

## Dependencies & Integration
- **Framer Motion**: motion, AnimatePresence für Slide-in/out
- **React**: useEffect für ESC-Key und Body-Scroll Management
- **Types**: ShoppingListItem aus `@/types`
- **isAppPrice**: Imported aus `@/lib/utils/helpers` für App-Preis-Erkennung
- **Parent**: page.tsx (App-Level Integration)

## Props Interface
```typescript
interface ShoppingListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  totalPrice: number;
  onToggleCheck: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearList: () => void;
  hideCompleted?: boolean;                // Filter erledigte Items
  onToggleHideCompleted?: () => void;     // Toggle Filter
}
```

## UI Structure
```
Backdrop (blur) → Panel (slide-in from right)
├── Header (Title + Close Button)
├── Content (scrollable)
│   ├── Empty State ("Deine Liste ist leer" / "Alle erledigt!")
│   └── Item List (filtered by hideCompleted)
│       └── Item (Checkbox + Details + Price + App-Preis-Badge + Remove Button)
└── Footer (only if items.length > 0)
    ├── Total Price
    ├── "Erledigte ausblenden" Toggle (if checked items exist)
    └── "Liste leeren" Button
```

## App-Preis-Kennzeichnung
- **Anzeige**: 📱 *App-Preis unterhalb des Preises
- **Bedingung**: Nur wenn `isAppPrice(item.notes)` true zurückgibt
- **Tooltip**: "Nur mit Supermarkt-App" beim Hover

## Geschäftslogik
- **Item Filtering**: visibleItems = hideCompleted ? unchecked only : all
- **Empty States**:
  - Keine Items: "Deine Liste ist leer"
  - Alle erledigt + hidden: "Alle Produkte erledigt!"
- **Toggle Button**: Erscheint nur wenn checked items existieren

## Keyboard & Focus Management
- **ESC Key**: Schließt Panel (useEffect mit addEventListener)
- **Body Scroll**: Wird geblockt wenn Panel offen (overflow: 'hidden')
- **Cleanup**: Event Listener und Scroll werden bei unmount restored

## Animations
```typescript
// Panel Slide-in
panelVariants: {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },  // Spring (damping: 25, stiffness: 150)
  exit: { x: '100%', opacity: 0 }
}

// Backdrop Fade
backdropVariants: { hidden: { opacity: 0 }, visible: { opacity: 1 } }

// Item Stagger
items: transition: { delay: index * 0.05 }
```

## Responsive Design
- **Width**: Full width mobile, 24rem (sm), 28rem (md) Desktop
- **Height**: Full viewport height
- **Padding**: Adaptive (p-4 mobile, p-6 desktop)
- **Grid**: Single column (items stacked)

## Accessibility
- **role="dialog"**: Semantic Modal Role
- **aria-modal="true"**: Modal Kontext
- **aria-labelledby**: Verknüpfung mit Header Title
- **aria-labels**: Alle Buttons haben aussagekräftige Labels
- **Keyboard**: Full Keyboard Navigation

## Performance Considerations
- **Layout Animation**: Framer Motion layout prop für smooth Item-Transitions
- **Backdrop Click**: onClick auf Backdrop schließt Panel
- **Conditional Rendering**: Footer nur wenn Items existieren
