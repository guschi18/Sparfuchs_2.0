# Projektplan

## 🎯 Framer Motion Übergang Welcome → Chat Interface

### Ziel
Flüssige, moderne Animationen beim Übergang vom Welcome Screen zum Chat Interface mit gestaffelten Delays und Spring-Animationen.

### 📋 Todo Liste

#### Phase 1: Basis Setup ✅
- [x] AnimatePresence für Page Transitions in page.tsx implementieren
- [x] Wrapper Komponenten mit motion.div erstellen
- [x] Spring-Animation Konfiguration definieren

#### Phase 2: Welcome Screen Animationen ✅
- [x] WelcomeMessages: Gestaffelte Animationen für Suggestion Cards (delay 0.1s - 0.4s)
- [x] MarketToggles: Einfliegen von oben mit leichter Verzögerung
- [x] CentralInput: Zentrale Animation von unten mit Fokus-Effekt

#### Phase 3: Chat Interface Übergang ✅
- [x] Page Transition: Sanfte Skalierung (scale: 0.95 → 1) 
- [x] Messages Area: Einblenden mit y-Transform (y: 20 → 0)
- [x] Chat Input: Von unten einblenden mit Spring-Animation
- [x] Reset Button: Verzögertes Erscheinen


### 🎨 Animation Details
- **Easing**: Spring-Animationen mit `type: "spring", damping: 20, stiffness: 100`
- **Delays**: Gestaffelt 0.1s - 0.4s für Welcome Elemente
- **Transform**: y: 20 → 0 für Einfliegen von unten
- **Scale**: 0.95 → 1 für Page Transitions
- **Opacity**: 0 → 1 für sanfte Ein-/Ausblendungen

---

## 🎯 Review & Zusammenfassung

### ✅ Erfolgreich implementiert

**Phase 1 - Basis Setup:**
- `AnimatePresence` mit `mode="wait"` für flüssige Page Transitions
- Spring-Animation Konfigurationen (`damping: 20, stiffness: 100`)
- motion.div Wrapper für Welcome Screen und Chat Interface

**Phase 2 - Welcome Screen Animationen:**
- **WelcomeMessages**: Gestaffelte Card-Animationen (0.1s staggerChildren)
  - Titel: von oben einfliegen mit 0.2s delay
  - Cards: von unten (y: 20) mit scale und Spring-Animation
  - Hover: y: -2, scale: 1.05 mit Spring-Feedback
- **MarketToggles**: Einfliegen von oben (-15px) mit 0.08s stagger
  - Hover/Tap Interaktionen für besseres Feedback
- **CentralInput**: Zentrale Animation mit Fokus-Effekt
  - Container: y: 30 mit 0.3s delay
  - Input: whileFocus scale: 1.02
  - Button: Hover mit Glow-Effekt und Skalierung

**Phase 3 - Chat Interface Übergang:**
- **Page Transition**: Sanfte Skalierung (0.95 → 1) beim Wechsel
- **Messages Area**: slideFromBottom Animation (y: 20 → 0)
- **Chat Input**: Von unten (y: 30) mit 0.2s delay
- **Reset Button**: Verzögertes Erscheinen (0.4s delay) mit Hover-Animationen

### 🛠️ Technische Details

**Animierte Komponenten:**
- `app/page.tsx`: AnimatePresence + Page Transitions
- `app/components/UI/WelcomeMessages.tsx`: Gestaffelte Card-Animationen
- `app/components/UI/MarketToggles.tsx`: Market-Toggle Animationen  
- `app/components/UI/CentralInput.tsx`: Input & Button Animationen

**Animation-Features:**
- Spring-Physics für natürliche Bewegungen
- Gestaffelte Animationen (staggerChildren)
- Hover/Tap/Focus Interaktionen
- Smooth Page Transitions mit AnimatePresence
- Responsive & Performance-optimierte Animationen

### ✨ Ergebnis

**Flüssiger Übergang Welcome → Chat:**
1. Welcome Elements fliegen gestaffelt ein (0.1s - 0.4s delays)
2. Bei Chat-Start: Smooth fade/scale transition 
3. Chat Interface erscheint progressiv (Messages → Input → Reset)
4. Alle Interaktionen haben responsive Hover/Tap Feedback


**Status: ✅ Kern-Animationen vollständig implementiert & getestet!**

