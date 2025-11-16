# useToast Hook Documentation

## Architektur & Zweck
**Zweck**: Custom Hook für Toast-Benachrichtigungen ohne externe Dependencies
**Pattern**: State Management Hook mit Convenience Methods
**Kritische Entscheidung**: Array-based Stack für multiple gleichzeitige Toasts

## Dependencies & Integration
- **React**: useState, useCallback
- **Types**: ToastMessage, ToastType aus `@/app/components/UI/Toast`
- **No External Deps**: Komplett selbst implementiert (kein react-hot-toast)

## Kritische Datenstrukturen
```typescript
interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;  // Auto-dismiss Zeit (default: 3000ms)
}
```

## Geschäftslogik
- **ID Generation**: Unique IDs mit Timestamp + Random für Collision-Avoidance
- **Stack Management**: Toasts werden in Array gespeichert, Multiple-Support
- **Auto-Dismiss**: Toast-Component handhabt Auto-Dismiss intern (nicht Hook)

## API Surface
```typescript
const { toasts, showToast, dismissToast, dismissAll, success, error, info } = useToast();

// Convenience Methods (useCallback wrapped)
success('Produkt hinzugefügt!');        // showToast(..., 'success')
error('Fehler aufgetreten', 5000);      // showToast(..., 'error', 5000)
info('Info-Nachricht');                 // showToast(..., 'info')
```

## Performance Considerations
- **useCallback**: Alle Methods stabilisiert für Performance
- **No Re-renders**: Array-Updates triggern nur notwendige Re-renders
- **Memory**: Toasts werden automatisch nach Auto-Dismiss aus State entfernt

## Integration Points
- **ToastContainer**: Nimmt toasts Array und dismissToast Handler
- **page.tsx**: Zentrale Toast-Verwaltung für gesamte App
- **Shopping List**: success/error Toasts bei Add/Clear Aktionen
