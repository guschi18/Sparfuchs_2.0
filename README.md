# SparFuchs 2.0 - Next.js Migration

## Projektübersicht

SparFuchs 2.0 ist eine Migration der KI-gestützten Supermarkt-Angebots-App von Streamlit zu Next.js 15 mit TypeScript und Tailwind CSS. Die Anwendung ermöglicht es Benutzern, über natürliche Sprache nach Produkten und Angeboten in verschiedenen Supermärkten zu suchen.

**Original-Repository:** https://github.com/guschi18/sparfuchs-app

## Technologie-Stack

- **Framework:** Next.js 15 mit App Router
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4
- **KI-Service:** OpenRouter (nicht OpenAI direkt)
- **Datenverarbeitung:** csv-parse für CSV-Dateien
- **Ziel-Märkte:** Aldi, Lidl, Rewe, Edeka, Penny

## Phase 1 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **Repository-Setup**
   - Original sparfuchs-app Repository als Referenz geklont
   - Projektstruktur für Migration vorbereitet

2. **Next.js 15 Initialisierung**
   - Projekt mit TypeScript erstellt
   - App Router aktiviert
   - ESLint Konfiguration eingerichtet

3. **Tailwind CSS v4 Setup**
   - Automatisch durch create-next-app konfiguriert
   - Neue Tailwind v4 Syntax mit `@import "tailwindcss"`
   - Dark/Light Mode Unterstützung vorbereitet

4. **Projektstruktur erstellt**
   ```
   sparfuchs-nextjs/
   ├── app/
   │   ├── api/                    # Next.js API Routes
   │   │   ├── chat/               # Chat-Endpoint
   │   │   ├── data/               # Produktdaten-API
   │   │   └── offers/             # Angebots-API
   │   ├── components/
   │   │   ├── Chat/               # Chat-Interface
   │   │   ├── UI/                 # UI-Komponenten
   │   │   └── Layout/             # Layout-Komponenten
   │   └── page.tsx               # Hauptseite
   ├── lib/
   │   ├── ai/                    # OpenRouter Integration
   │   ├── data/                  # Datenverarbeitung
   │   └── utils/                 # Hilfsfunktionen
   ├── types/                     # TypeScript Definitionen
   └── data/                      # CSV-Dateien
   ```

5. **Dependencies installiert**
   - `openai`: OpenRouter API Client
   - `csv-parse`: CSV-Datenverarbeitung
   - `dotenv`: Environment Variables
   - `@types/csv-parse`: TypeScript-Typen

6. **Konfiguration**
   - TypeScript-Typen für Kernfunktionalitäten definiert
   - `.env.local` für Environment Variables erstellt
   - Development Server erfolgreich getestet

## Environment Variables

Erstelle eine `.env.local` Datei mit folgenden Variablen:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_TITLE=SparFuchs.de
```

## Phase 2 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **CSV → JSON Build-System**
   - Vollständig funktionsfähiges Konvertierungssystem implementiert
   - `lib/data/build-scripts/convert-csv.ts` - Haupt-Konvertierungslogik
   - `scripts/build-data.ts` - Build-Skript für npm scripts
   - **978 Produkte** und **2 Rezepte** erfolgreich konvertiert

2. **Optimierte JSON-Datenstrukturen**
   - `products.json` - Alle Produktdaten (978 Einträge)
   - `categories.json` - 21 Kategorien mit Unterkategorien
   - `markets.json` - 5 Supermärkte (Aldi, Lidl, Rewe, Edeka, Penny)
   - `search-index.json` - 2.662 Suchbegriffe für schnelle Produktsuche

3. **TypeScript-Integration**
   - Vollständige Type-Definitionen für alle Datenstrukturen
   - Erweiterte Interfaces für API-Responses und Datenmodelle

4. **API Routes implementiert**
   - `/api/data` - Produktsuche und -filterung
   - `/api/offers` - Erweiterte Angebotssuche mit Statistiken und Sortierung
   - `/api/meta` - Kategorien, Märkte und Metadaten-API

5. **Data Access Layer**
   - `ProductDataService` mit In-Memory Caching für optimale Performance
   - Serverless-optimierte Datenverarbeitung für Vercel
   - Erweiterte Suchfunktionen mit Fuzzy-Matching

6. **Environment Variables & Utilities**
   - Vollständige Konfiguration für lokale Entwicklung und Vercel Production
   - `.env.example` für Entwickler-Onboarding
   - Hilfsfunktionen für Preisformatierung, Textsuche, Validierung

### 📊 Verarbeitete Daten:
- **978 Produkte** aus Original-CSV erfolgreich konvertiert
- **21 Kategorien** automatisch identifiziert und strukturiert
- **5 Supermärkte** (Aldi, Lidl, Rewe, Edeka, Penny) indexiert
- **2.662 Suchbegriffe** im optimierten Search-Index

## Development Commands

```bash
# Development Server starten
npm run dev

# CSV zu JSON Datenkonvertierung
npm run data:build

# Daten aktualisieren
npm run data:update

# Projekt für Produktion bauen (inkl. Datenverarbeitung)
npm run build

# Produktion Server starten
npm run start

# Linting ausführen
npm run lint
```

## Phase 3 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **OpenRouter API Client Setup**
   - `lib/ai/openrouter-client.ts` - Vollständig funktionsfähiger OpenRouter Client
   - Vercel-optimiertes Timeout-Handling (55s unter 60s Limit)
   - Connection Pooling für bessere Performance
   - Multi-Model Support (Grok, Claude, GPT, Gemini, Llama)

2. **Context Generation System**
   - `lib/ai/context.ts` - Intelligente Kontext-Generierung
   - System-Prompts für deutsche Supermarkt-Angebote
   - Produkt-Kontext basierend auf Suchanfragen
   - Rezept-Modus mit Zutaten-Matching

3. **Hallucination Detection**
   - `lib/ai/hallucination-detection.ts` - Validierung von KI-Antworten
   - Produktname-Extraktion und Preisvalidierung
   - Warnung bei nicht verfügbaren Produktreferenzen
   - Konfidenz-Scoring für KI-Antworten

4. **Streaming Response System**
   - `/api/chat/route.ts` - Vollständige Chat-API implementiert
   - Server-Sent Events für Echtzeit-Streaming
   - Hallucination Detection in Streaming-Pipeline integriert
   - Graceful Error Handling mit Benutzer-Feedback

5. **Advanced Error Handling**
   - `lib/ai/error-handling.ts` - Robuste Fehlerbehandlung
   - Automatische Retry-Logik mit Fallback-Modellen
   - Spezielle Behandlung für Vercel Serverless Limits
   - Benutzerfreundliche Fehlermeldungen auf Deutsch

6. **Edge Runtime Evaluation**
   - `lib/ai/edge-runtime.ts` - Bewertung für zukünftige Migration
   - Empfehlung: Node.js Runtime für OpenAI SDK Kompatibilität
   - Migrationspfad für statische APIs dokumentiert

### 🚀 KI-Features:
- **Multi-Model Support** - 6 verschiedene KI-Modelle verfügbar
- **Streaming Responses** - Echtzeit-Chat-Erlebnis
- **Hallucination Detection** - Validierung gegen 978 Produkte
- **Intelligent Context** - Produkt- und Rezept-spezifische Kontexte
- **Robust Error Handling** - Fallback-Mechanismen für hohe Verfügbarkeit

## Phase 4 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **Chat-Interface Components**
   - `ChatContainer.tsx` - Hauptcontainer mit State Management
   - `ChatMessage.tsx` - Individuelle Nachrichten mit Zeitstempel
   - `ChatInput.tsx` - Eingabefeld mit Auto-Resize und Enter-Handling
   - Streaming Response Integration mit Server-Sent Events
   - Hallucination Warning Display

2. **Market Selection System**
   - `MarketToggles.tsx` - Interaktive Supermarkt-Auswahl
   - 5 Märkte mit individuellen Farben (Aldi, Lidl, Rewe, Edeka, Penny)
   - "Alle/Keine" Schnellauswahl
   - Mindestens ein Markt muss ausgewählt bleiben
   - Live-Zähler der ausgewählten Märkte

3. **Recipe Mode Toggle**
   - `RecipeToggle.tsx` - Umschaltung zwischen Normal- und Rezept-Modus
   - Animierter Toggle-Switch mit Status-Anzeige
   - Kontextuelle Tipps für Rezept-Suche
   - Emoji-unterstützte Benutzerführung

4. **Loading States & Spinners**
   - `LoadingSpinner.tsx` - Universelle Loading-Komponente
   - `TypingIndicator` - "SparFuchs tippt..." Animation
   - `SearchingIndicator` - Produktsuche-Status mit Query-Anzeige
   - Verschiedene Größen (sm/md/lg) und Nachrichten

5. **Welcome & Suggestions System**
   - `WelcomeMessages.tsx` - Interaktive Startseite
   - 6 Normal-Anfrage Beispiele + 6 Rezept-Beispiele
   - Klickbare Suggestion-Buttons
   - Feature-Übersicht und Markt-Information
   - Responsive Grid-Layout

6. **Layout Components**
   - `Header.tsx` - Sticky Header mit Logo und Markt-Indikatoren
   - `Footer.tsx` - Informative Footer mit Features und Märkten
   - Responsive Design für Mobile/Desktop
   - Marken-konsistente Farbgebung

### 🎨 UI-Features:
- **Responsive Sidebar** - 320px Sidebar mit Settings und Chat-Area
- **Interactive Welcome** - Klickbare Beispiel-Anfragen starten Chat
- **Real-time Chat** - Streaming Messages mit Typing-Indikatoren
- **Market Visual Feedback** - Farbkodierte Markt-Auswahl
- **German UX** - Vollständig deutsche Benutzeroberfläche
- **Accessibility** - Keyboard-Navigation und Screen-Reader Support

## Phase 5 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **Streamlit-inspiriertes Design System**
   - SparFuchs Brand Colors in `globals.css` definiert
   - Orange Primary Theme (#ff6b35) als Hauptfarbe
   - Konsistente Farbpalette für alle UI-Elemente
   - Custom CSS Properties für Design-Tokens

2. **Chat-Interface Redesign**
   - `ChatContainer.tsx` - Streamlit-Style mit weißem Hintergrund
   - `ChatMessage.tsx` - Rundliche Nachrichten-Bubbles mit Schatten
   - `ChatInput.tsx` - Fokus-Effekte und Hover-Animationen
   - Orange Farbe für User-Messages, helles Grau für AI-Messages

3. **Market-Toggle Buttons**
   - `MarketToggles.tsx` - Vollständig redesigned mit Markt-Farben
   - Individuelle Farben pro Markt (Aldi: Blau, Lidl: Gelb, etc.)
   - Hover-Effekte und Scale-Animationen
   - Checkmark-Icons für ausgewählte Märkte

4. **Recipe-Toggle Enhancement**
   - `RecipeToggle.tsx` - Animierter Toggle-Switch
   - Grüne Erfolgsfarbe für aktivierten Modus
   - Erweiterte Info-Box mit Tipps
   - Smooth Transitions und Schatten-Effekte

5. **Responsive Design System**
   - Mobile-First Approach mit Breakpoints
   - Sidebar → Top-Navigation auf Mobile
   - Responsive Typografie (lg:text-xl, etc.)
   - Touch-optimierte Button-Größen

6. **Layout & Navigation**
   - `Header.tsx` - Sticky Header mit SparFuchs Branding
   - Markt-Indikatoren im Header (Desktop) vs "5 Märkte" (Mobile)
   - `WelcomeMessages.tsx` - Größere, ansprechendere Suggestion-Cards
   - Hover-Effekte auf allen interaktiven Elementen

### 🎨 Design-Features:
- **Brand Identity** - Orange Fox-Theme mit professionellem Look
- **Streamlit-Look** - Heller, sauberer Stil mit Cards und Schatten
- **Micro-Interactions** - Hover-Effekte, Transitions, Scale-Animationen
- **Responsive Design** - Optimiert für Mobile, Tablet und Desktop
- **Custom Scrollbars** - Subtile, moderne Scrollbar-Gestaltung
- **Accessibility** - Kontrastreiche Farben und Touch-Targets

## Phase 6 - Abgeschlossen ✅

### Durchgeführte Arbeiten:

1. **Session State Management**
   - `useSessionState.ts` - localStorage-basierte Session-Persistierung
   - Automatische Session-ID Generierung für Chat-Tracking
   - Market-Auswahl und Recipe-Mode State-Management
   - User-Preferences mit autoScroll, showTimestamps, compactMode
   - Session-Reset und Clear-Funktionalität

2. **Chat History Management**
   - `useChatHistory.ts` - Persistente Message-Historie
   - Message-CRUD Operationen (Add, Update, Remove)
   - Session-übergreifende Chat-Historie mit 100-Message Limit
   - Export-Funktionalität für Chat-Verläufe als JSON
   - Previous Session Messages Retrieval

3. **Advanced Input Handling**
   - `useInputHandling.ts` - Comprehensive Input-Validierung
   - Auto-Resize Textarea mit Max-Height Limiting
   - Word/Character Count mit konfigurierbaren Limits
   - Paste-Event Handling mit Truncation
   - Enter/Shift+Enter Handling für Submit/Newline

4. **Real-time Updates System**
   - `useRealTimeUpdates.ts` - Streaming mit Connection-Management
   - Automatic Retry-Logic mit Exponential Backoff
   - Stream-Timeout Handling (60s) für Vercel-Kompatibilität
   - Connection-Status Monitoring mit Error-Recovery
   - Abort-Controller für Stream-Cancellation

5. **Form Validation Framework**
   - `useFormValidation.ts` - Flexible Validation-Rules Engine
   - Chat-Input Security-Checks (XSS-Prevention)
   - Multi-Field Form-State Management
   - Real-time Validation-Feedback mit Error-Messages
   - Custom Validation-Rules für spezifische Use-Cases

6. **Component Integration**
   - `ChatContainer.tsx` - Vollständige Hook-Integration
   - Loading-States für Session- und History-Loading
   - Connection-Status Display mit Error-Notifications
   - `ChatInput.tsx` - Enhanced mit Validation-Feedback
   - Character-Counter und Real-time Validation-Display

### ⚡ State-Features:
- **Persistent Sessions** - Automatische localStorage-Synchronisation
- **Cross-Session History** - Message-Historie über Sessions hinweg
- **Real-time Validation** - Instant-Feedback bei Input-Änderungen
- **Connection Resilience** - Automatische Retry-Mechanismen
- **Security-First** - XSS/Injection-Prevention auf Input-Level
- **Performance-Optimized** - Debounced Updates und Lazy-Loading

## Nächste Phasen (Geplant)

- **Phase 7:** Testing & Optimierung
- **Phase 8:** Vercel Deployment & Optimierung

## Wichtige Hinweise

- **KRITISCH:** Verwendet ausschließlich OpenRouter, nicht OpenAI direkt
- **VERCEL HOSTING:** Alle Komponenten sind für Serverless Functions optimiert
- **CSV → JSON STRATEGIE:** Build-time Datenkonvertierung für beste Performance
- OpenAI SDK dient nur als Client-Interface für OpenRouter API
- UI-Design soll identisch zur Streamlit-Version bleiben
- Fokus auf Einfachheit und minimale Code-Änderungen

## Projektstand

✅ **Phase 1 abgeschlossen** - Grundsetup und Projektstruktur  
✅ **Phase 2 abgeschlossen** - Datenmanagement & Backend komplett  
✅ **Phase 3 abgeschlossen** - KI-Integration (OpenRouter) vollständig implementiert  
✅ **Phase 4 abgeschlossen** - UI-Komponenten Migration komplett  
✅ **Phase 5 abgeschlossen** - Tailwind CSS Styling & Responsive Design komplett  
✅ **Phase 6 abgeschlossen** - State Management & Interaktionen komplett  
⏸️ **Phase 7 vorbereitet** - Bereit für Testing & Optimierung

Das Frontend ist vollständig funktionsfähig mit kompletter React Component-Architektur, persistentem State-Management, Streamlit-inspiriertem Design, responsivem Layout und robuster OpenRouter KI-Chat-Funktionalität mit Real-time Updates.
