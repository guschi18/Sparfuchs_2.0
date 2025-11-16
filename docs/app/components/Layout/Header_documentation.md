# Header Component Documentation

## Architektur & Zweck
**Zweck**: App-Header mit Logo, Subtitle und Shopping List Button
**Pattern**: Stateless Presentational Component mit conditional Shopping List Integration
**Kritische Entscheidung**: Absolute Positioning für ShoppingListButton (top-right, no layout shift)

## Dependencies & Integration
- **Framer Motion**: Animated Shopping Cart Emoji
- **ShoppingListButton**: Imported aus `@/app/components/UI/ShoppingListButton`
- **Parent**: page.tsx (App Root)

## Props Interface
```typescript
interface HeaderProps {
  shoppingListCount?: number;           // Item Count für Badge
  onOpenShoppingList?: () => void;      // Handler zum Öffnen des Panels
  isShoppingListOpen?: boolean;         // Active State für Button
}
```

## UI Structure
```
header (relative positioning)
└── container (max-w-4xl, centered)
    ├── ShoppingListButton (absolute top-right, conditional)
    └── centered content
        ├── Animated 🛒 emoji
        ├── Title: "SparFuchs.de"
        └── Subtitle: "Dein AI-Assistent für Supermarkt-Angebote"
```

## Animations
```typescript
// Shopping Cart Emoji (infinite wobble)
animate: {
  x: [0, 3, -3, 0],
  y: [0, -1, 1, 0]
}
transition: { duration: 2, repeat: Infinity }
```

## Responsive Design
- **Padding**: py-6 (mobile), py-8 (desktop)
- **Title Font**: text-3xl (mobile) → text-4xl (sm) → text-5xl (lg)
- **Subtitle Font**: text-base (mobile) → text-lg (sm) → text-xl (lg)

## Backwards Compatibility
- **Alle Props optional**: Header funktioniert ohne Shopping List Props
- **Conditional Rendering**: ShoppingListButton nur wenn onOpenShoppingList übergeben

## Integration Points
- **page.tsx**: Übergibt Shopping List State und Handlers
- **ShoppingListButton**: Details siehe `docs/app/components/UI/ShoppingListButton_documentation.md`
