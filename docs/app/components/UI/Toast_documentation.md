# Toast Component Documentation

## Architektur & Zweck
**Zweck**: Custom Toast-Notification System ohne externe Dependencies
**Pattern**: Container + Individual Toast Components mit Auto-Dismiss
**Kritische Entscheidung**: Bottom-Right Positionierung (kein Konflikt mit Header Button)

## Dependencies & Integration
- **Framer Motion**: AnimatePresence, motion für Slide-in Animations
- **React**: useEffect für Auto-Dismiss Timer
- **No External Deps**: Komplett selbst implementiert

## Datenstrukturen
```typescript
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;  // default: 3000ms
}
```

## Component Structure
```
ToastContainer (fixed bottom-right)
└── AnimatePresence (mode: popLayout)
    └── Toast[] (individual toasts)
        ├── Icon (based on type)
        ├── Message Text
        └── Close Button
```

## Toast Types & Styling
```typescript
// Success (green)
bgColor: '#10b981', icon: Checkmark

// Error (red)
bgColor: '#ef4444', icon: X

// Info (blue)
bgColor: '#3b82f6', icon: Info Circle
```

## Auto-Dismiss Logic
```typescript
// In Toast Component
useEffect(() => {
  const timer = setTimeout(() => {
    onDismiss(toast.id);
  }, duration);
  return () => clearTimeout(timer);
}, [toast.id, duration, onDismiss]);
```

## Animations
```typescript
// Individual Toast
initial: { opacity: 0, y: -50, scale: 0.9 }
animate: { opacity: 1, y: 0, scale: 1 }
exit: { opacity: 0, scale: 0.9, duration: 0.2 }

// Hover
whileHover: { scale: 1.02 }
whileTap: { scale: 0.98 }
```

## User Interactions
- **Click Toast**: Dismissed (onDismiss called)
- **Click Close Button**: Dismissed (stopPropagation)
- **Auto-Dismiss**: Nach duration ms (default 3000)

## Positioning
- **Fixed**: bottom-4 right-4
- **Z-Index**: z-[100] (über allen anderen Elements)
- **Stacking**: flex-col gap-2 (neue Toasts oben)

## Accessibility
- **role="alert"**: Semantic Alert Role
- **aria-live="polite"**: Screen Reader Announcements
- **aria-atomic="true"**: Komplette Nachricht wird announced
- **Close Button**: aria-label="Schließen"

## Integration Points
- **useToast Hook**: State Management (toasts array)
- **page.tsx**: ToastContainer am Root-Level
- **Shopping List**: success/error Toasts bei Actions
