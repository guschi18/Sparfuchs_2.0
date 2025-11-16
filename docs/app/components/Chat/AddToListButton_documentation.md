# AddToListButton Component Documentation

## Architektur & Zweck
**Zweck**: Compact Button in ProductCard zum Hinzufügen zur Shopping List
**Pattern**: Stateless Presentational Component mit Icon-Wechsel
**Kritische Entscheidung**: Disabled wenn bereits in Liste (Visual Feedback)

## Dependencies & Integration
- **Framer Motion**: motion, whileHover, whileTap
- **Parent**: ProductCard Component
- **Icons**: SVG Plus (+) oder Checkmark (✓)

## Props Interface
```typescript
interface AddToListButtonProps {
  onAdd: () => void;       // Callback zum Hinzufügen
  isInList: boolean;       // Bereits in Liste? (disabled + checkmark)
  disabled?: boolean;      // Manual disable
}
```

## UI States
```typescript
// State 1: Not in List (actionable)
Icon: Plus (+)
Text: "Liste"
Colors: Border + Text
Hover: Primary color + scale 1.05

// State 2: In List (disabled)
Icon: Checkmark (✓)
Text: "In Liste"
Colors: Success green
Cursor: not-allowed
No Hover: undefined
```

## Responsive Design
- **Mobile**: Icon only (4x4)
- **Desktop**: Icon + Text
- **Padding**: px-3 py-1.5
- **Font Size**: text-xs (mobile), text-sm (desktop)

## Animations
```typescript
// Initial appear
initial: { opacity: 0, scale: 0.9 }
animate: { opacity: 1, scale: 1 }

// Hover (wenn !disabled)
whileHover: {
  scale: 1.05,
  borderColor: 'primary',
  backgroundColor: 'primary',
  color: 'white'
}
whileTap: { scale: 0.95 }
```

## Accessibility
- **aria-label**:
  - "Zur Einkaufsliste hinzufügen" (not in list)
  - "Bereits in der Einkaufsliste" (in list)
- **disabled**: Native disabled attribute bei isInList || disabled

## Integration Points
- **ProductCard**: Rendered im CardHeader (flex-shrink-0)
- **page.tsx**: onAdd Handler triggert useShoppingList.addItem()
- **Toast**: Success Toast bei erfolgreichem Add
