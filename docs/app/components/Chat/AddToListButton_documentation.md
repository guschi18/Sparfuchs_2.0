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
Colors: Border + Text (Surface/Gray)
Hover: Filter brightness 1.1
Scale: 1.0 (Hover 1.05, Tap 0.95)

// State 2: In List (toggled)
Icon: Checkmark (✓)
Colors: Success green background + White text
Border: Success green
Hover: Filter brightness 1.1
Scale: 1.0 (Hover 1.05, Tap 0.95)
```

## Responsive Design
- **Always**: Icon only (4x4)
- **Padding**: px-3 py-1.5
- **Font Size**: text-xs (mobile), text-sm (desktop)

## Animations
```typescript
// Initial appear
initial: { opacity: 0, scale: 0.9 }
animate: { opacity: 1, scale: 1 }

// Hover (wenn !disabled)
whileHover: { filter: 'brightness(1.1)' }
whileTap: { scale: 0.95 }
```

## Accessibility
- **aria-label**:
  - "Zur Einkaufsliste hinzufügen" (not in list)
  - "Von der Einkaufsliste entfernen" (in list)
- **disabled**: Native disabled attribute nur wenn explizit `disabled` Prop gesetzt


## Integration Points
- **ProductCard**: Rendered im CardHeader (flex-shrink-0)
- **page.tsx**: onAdd Handler triggert useShoppingList.addItem()
- **Toast**: Success Toast bei erfolgreichem Add
