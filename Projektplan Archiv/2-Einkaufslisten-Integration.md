# Projektplan: Einkaufslisten-Integration

## 🎯 Ziel
Integration einer Einkaufslisten-Funktion in SparFuchs mit Header-Button + Produktkarten-Actions

## 📋 Übersicht
- **Feature**: Einkaufsliste für Supermarkt-Angebote
- **Zugang**: Header-Button (Badge mit Anzahl) + "Zur Liste"-Button in Produktkarten
- **UI**: Slide-in Panel von rechts
- **Persistenz**: LocalStorage (für ersten MVP)
- **Status**: ⏳ Planung

---

## ✅ Todo-Liste

### Phase 1: Datenstruktur & State Management ✅ ABGESCHLOSSEN
- [x] Shopping List Type Definitions erstellen (`types/index.ts`)
- [x] ShoppingList Context/Hook erstellen (`lib/hooks/useShoppingList.ts`)
- [x] LocalStorage Service implementieren (`lib/utils/localStorage.ts`)

### Phase 2: UI-Komponenten ✅ ABGESCHLOSSEN
- [x] ShoppingListButton für Header erstellen (`app/components/UI/ShoppingListButton.tsx`)
- [x] ShoppingListPanel erstellen (`app/components/UI/ShoppingListPanel.tsx`)
- [x] AddToListButton für ProductCard erstellen (`app/components/Chat/AddToListButton.tsx`)
- [x] Toast-Benachrichtigung integrieren

### Phase 3: Integration ✅ ABGESCHLOSSEN
- [x] Header.tsx erweitern (ShoppingListButton hinzufügen)
- [x] ProductCard.tsx erweitern (AddToListButton hinzufügen)
- [x] app/page.tsx: ShoppingList State & Provider integrieren
- [x] Panel Open/Close State Management


### Phase 4: Dokumentation ✅ ABGESCHLOSSEN
- [x] Dokumentation erstellen (`docs/app/components/UI/ShoppingListPanel_documentation.md`)
- [x] Schau in dem Ordner Prompts für Docsneu.md und Docsanpassen.md
- [x] CLAUDE.md aktualisieren

---

## 🏗️ Technische Architektur

### 1. Type Definitions (`types/index.ts`)
```typescript
export interface ShoppingListItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  market: string;
  dateRange: string;
  brand?: string;
  checked: boolean;
  addedAt: Date;
}

export interface ShoppingList {
  items: ShoppingListItem[];
  totalPrice: number;
}
```

### 2. Custom Hook (`lib/hooks/useShoppingList.ts`)
```typescript
export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  // Methoden:
  // - addItem(product: ProductData)
  // - removeItem(id: string)
  // - toggleCheck(id: string)
  // - clearList()
  // - getTotalPrice()
  // - getItemCount()

  // LocalStorage sync mit useEffect
}
```

### 3. UI-Komponenten

#### Header Button (`app/components/UI/ShoppingListButton.tsx`)
- Badge mit Anzahl der Produkte
- Click öffnet Panel
- Framer Motion Animation

#### Shopping List Panel (`app/components/UI/ShoppingListPanel.tsx`)
- Slide-in von rechts (Framer Motion)
- Liste aller Produkte
- Checkboxen für erledigte Items
- Gesamtpreis-Anzeige
- "Liste leeren" Button
- Close Button (X)

#### Add to List Button (`app/components/Chat/AddToListButton.tsx`)
- Kleiner Button in ProductCard
- Icon: "+" oder "🛒"
- Toast-Feedback bei Klick

### 4. State Management (`app/page.tsx`)
```typescript
const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
const [isPanelOpen, setIsPanelOpen] = useState(false);
```

---

## 📐 UI/UX Details

### Header Layout (Desktop)
```
┌──────────────────────────────────────────────────────┐
│  🛒 SparFuchs.de                    📝 Einkaufsliste (3) │
└──────────────────────────────────────────────────────┘
```

### Header Layout (Mobile)
```
┌─────────────────────────┐
│  🛒 SparFuchs.de   📝(3) │
└─────────────────────────┘
```

### Produktkarte mit Button
```
┌───────────────────────────────┐
│ EDEKA               [+ Liste] │
│ Apfel Braeburn                │
│ 2.49 € | 📅 01.11-07.11      │
└───────────────────────────────┘
```

### Shopping List Panel (Slide-in)
```
                    ┌─────────────────────────┐
                    │ 📝 Einkaufsliste    [X] │
                    │─────────────────────────│
                    │ ☑ Äpfel - Lidl          │
                    │   2.49 € | 01.11-07.11  │
                    │   [Entfernen]           │
                    │─────────────────────────│
                    │ ☐ Milch - Aldi          │
                    │   1.19 € | 01.11-07.11  │
                    │   [Entfernen]           │
                    │─────────────────────────│
                    │ Gesamt: 3.68 €          │
                    │                         │
                    │ [Liste leeren]          │
                    │ [Teilen] (optional)     │
                    └─────────────────────────┘
```

---

## 🎨 Styling Guidelines

### Farben (aus globals.css)
- Panel Background: `var(--sparfuchs-surface)`
- Border: `var(--sparfuchs-border)`
- Text: `var(--sparfuchs-text)`
- Button Primary: `var(--sparfuchs-primary)` (#FF6B35)
- Success/Checked: `#10b981` (green-500)

### Animationen (Framer Motion)
```typescript
// Panel Slide-in
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 }
};

// Button Hover
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Badge Pulse bei neuem Item
animate={{ scale: [1, 1.2, 1] }}
```

---

## 📦 Dateistruktur

```
/
├── types/index.ts (erweitert)
├── lib/
│   ├── hooks/
│   │   └── useShoppingList.ts (neu)
│   └── utils/
│       └── localStorage.ts (erweitert)
├── app/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ProductCard.tsx (erweitert)
│   │   │   └── AddToListButton.tsx (neu)
│   │   ├── Layout/
│   │   │   └── Header.tsx (erweitert)
│   │   └── UI/
│   │       ├── ShoppingListButton.tsx (neu)
│   │       └── ShoppingListPanel.tsx (neu)
│   └── page.tsx (erweitert)
└── docs/
    ├── lib/hooks/useShoppingList_documentation.md (neu)
    └── app/components/UI/
        ├── ShoppingListButton_documentation.md (neu)
        └── ShoppingListPanel_documentation.md (neu)
```

---

## 🔧 Implementierungsdetails

### LocalStorage Keys
- `sparfuchs_shopping_list` - Array von ShoppingListItems

### Error Handling
- Try-catch bei LocalStorage Operations (QuotaExceededError)
- Fallback: In-Memory State wenn LocalStorage nicht verfügbar

### Performance
- `useMemo` für Gesamtpreis-Berechnung
- `useCallback` für Event Handler
- Debounce bei LocalStorage Writes (300ms)

### Accessibility
- ARIA Labels für Buttons
- Keyboard Navigation (ESC zum Schließen)
- Screen Reader Support
- Focus Management beim Öffnen/Schließen

---

## 🚀 Rollout-Strategie

### MVP (Minimum Viable Product)
1. ✅ Basic Add/Remove Funktionalität
2. ✅ LocalStorage Persistenz
3. ✅ Header Button mit Badge
4. ✅ Slide-in Panel
5. ✅ Gesamtpreis-Anzeige

### V2 (Erweiterungen)
- [ ] Teilen-Funktion (Share API / Copy to Clipboard)
- [ ] Sortierung nach Märkten
- [ ] Export als PDF/Text
- [ ] Produktmengen (z.B. 2x Äpfel)
- [ ] Notizen zu Produkten

### V3 (Advanced)
- [ ] Backend-Synchronisierung
- [ ] Multi-Device Support
- [ ] Einkaufslisten-Historie
- [ ] Favoriten/Vorlagen

---

## ⚠️ Wichtige Hinweise

1. **Simplicity First**: Minimale Code-Änderungen, bestehende Patterns beibehalten
2. **No Breaking Changes**: Keine Änderungen an existierenden Interfaces
3. **Mobile First**: Responsive Design für alle Bildschirmgrößen
4. **Performance**: Keine zusätzlichen Dependencies (außer evtl. react-hot-toast)
5. **Testing**: Jest Tests für alle neuen Hooks/Components

---

## 📊 Aufwandsschätzung

| Phase | Aufwand | Dateien |
|-------|---------|---------|
| Phase 1: Datenstruktur | 1-2h | 3 |
| Phase 2: UI-Komponenten | 3-4h | 4 |
| Phase 3: Integration | 2-3h | 3 |
| Phase 4: Features & Polish | 2-3h | - |
| Phase 5: Testing & Docs | 2-3h | 5 |
| **Gesamt** | **10-15h** | **15** |

---

## ✅ Definition of Done

- [ ] Alle Todo-Items abgeschlossen
- [ ] Code funktioniert auf Desktop & Mobile
- [ ] LocalStorage Persistenz funktioniert
- [ ] Keine Console Errors
- [ ] Tests geschrieben & bestehen
- [ ] Dokumentation erstellt
- [ ] CLAUDE.md aktualisiert
- [ ] Code Review durchgeführt

---

## 🎬 Nächste Schritte

1. ✅ Plan mit Nutzer besprechen & freigeben lassen
2. ⏳ Phase 1 starten: Type Definitions
3. ⏳ Phase 2: UI-Komponenten bauen
4. ⏳ Phase 3: Integration
5. ⏳ Phase 4: Polish
6. ⏳ Phase 5: Testing & Docs

---

**Erstellt am**: 2025-11-06
**Status**: Warte auf Freigabe
**Nächster Review**: Nach Phase 1
