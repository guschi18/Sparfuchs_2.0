# Header Component Documentation

## Architektur & Zweck
**Zweck**: App-Header mit Logo, Subtitle, Wishlist Button und Shopping List Button
**Pattern**: Stateless Presentational Component mit conditional List Integration
**Kritische Entscheidung**: Absolute Positioning für Buttons (Wishlist links, ShoppingList rechts)

## Dependencies & Integration
- **Framer Motion**: Animated Shopping Cart Emoji
- **ShoppingListButton**: Imported aus `@/app/components/UI/ShoppingListButton`
- **WishlistButton**: Imported aus `@/app/components/UI/WishlistButton`
- **Parent**: page.tsx (App Root)

## Props Interface
```typescript
interface HeaderProps {
  shoppingListCount?: number;           // Item Count für Badge
  onOpenShoppingList?: () => void;      // Handler zum Öffnen des Panels
  isShoppingListOpen?: boolean;         // Active State für Button
  wishlistCount?: number;               // Merkzettel Item Count
  onOpenWishlist?: () => void;          // Handler zum Öffnen des Merkzettels
  isWishlistOpen?: boolean;             // Active State für Wishlist Button
}
```

## UI Structure
```
header (relative positioning)
└── container (max-w-4xl, centered)
    ├── WishlistButton (absolute top-left / FAB bottom-left, conditional)
    ├── ShoppingListButton (absolute top-right / FAB bottom-right, conditional)
    └── centered content
        ├── Animated 🛒 emoji
        ├── Title: "SparFuchs" (Text: var(--sparfuchs-text)) + ".de" (Text: var(--sparfuchs-primary))
        └── Subtitle: "Dein AI-Assistent für Supermarkt-Angebote" (Text: var(--sparfuchs-primary))
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

## Color Scheme
- **Title**: `var(--sparfuchs-text)` (#2A2A2A) mit orange ".de" in `var(--sparfuchs-primary)` (#ff6b35)
- **Subtitle**: `var(--sparfuchs-text)` (#2A2A2A)
- **Background**: `var(--sparfuchs-background)` (#E8E0D0)

## Backwards Compatibility
- **Alle Props optional**: Header funktioniert ohne List Props
- **Conditional Rendering**: Buttons nur wenn entsprechende Handler übergeben

## Integration Points
- **page.tsx**: Übergibt Shopping List und Wishlist State und Handlers
- **ShoppingListButton**: Details siehe `docs/app/components/UI/ShoppingListButton_documentation.md`
- **WishlistButton**: Details siehe `docs/app/components/UI/WishlistButton_documentation.md`
