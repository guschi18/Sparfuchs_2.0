# Projektplan#2
# SparFuchs App Migration Plan: Streamlit → Next.js 15

## Projektübersicht
Migration der KI-gestützten Supermarkt-Angebots-App von Streamlit zu Next.js 15 mit Tailwind CSS, unter Beibehaltung der bestehenden UI und Funktionalität.

**Quelle:** https://github.com/guschi18/sparfuchs-app

## Todo Liste

### Phase 1: Repository Setup & Grundstruktur
- [x] Fork des sparfuchs-app Repository
- [x] Next.js 15 Projektinitialisierung mit TypeScript
- [x] Tailwind CSS Setup und Konfiguration
- [x] Projektstruktur nach Next.js Best Practices erstellen
- [x] Package.json mit erforderlichen Dependencies

### Phase 2: Datenmanagement & Backend (CSV → JSON Strategie)
- [x] Build-Script für CSV → JSON Konvertierung erstellen
- [x] JSON-Dateien in optimierter Struktur generieren (products.json, categories.json, markets.json)
- [x] Search-Index für schnelle Produktsuche erstellen
- [x] TypeScript-Interfaces für Datenstrukturen erweitern
- [x] API Routes für statische JSON-Daten implementieren
- [x] Serverless Functions für Datenfilterung optimieren
- [x] In-Memory Caching für wiederholte Zugriffe
- [x] Market-Filter und Kategorien-APIs
- [x] Environment Variables Setup (.env.local)
- [x] Utility Functions von Python zu TypeScript portieren

### Phase 3: KI-Integration (OpenRouter für Vercel)
- [x] OpenRouter API Client Setup (kein OpenAI!)
- [x] Context Generation Logic portieren
- [x] Hallucination Detection System implementieren
- [x] Streaming Response Handling für Serverless Functions
- [x] OpenRouter Timeout-Handling für Vercel Limits (10s/60s)
- [x] Error Handling und Fallback-Mechanismen für Serverless
- [x] Connection Pooling für OpenRouter API optimieren
- [x] Multi-Model Support (Grok, Claude, etc.)
- [x] Edge Runtime Integration evaluieren

### Phase 4: UI-Komponenten Migration
- [x] Chat-Interface als React Components
- [x] Markt-Auswahl Toggles (Aldi, Lidl, Rewe, Edeka, Penny)
- [x] Rezept-Modus Toggle
- [x] Loading States und Spinner
- [x] Welcome Messages und Follow-up Suggestions
- [x] Logo Display und Footer

### Phase 5: Styling mit Tailwind CSS
- [x] Streamlit-Design nachbauen mit Tailwind
- [x] Chat-Container und Message-Styling
- [x] Button-Styles für Market-Toggles
- [x] Responsive Design für Mobile/Desktop


### Phase 6: State Management & Interaktionen
- [x] React Hooks für Session State
- [x] Chat History Management
- [x] User Input Handling
- [x] Real-time Message Updates
- [x] Form Validation

### Phase 7: Testing & Optimierung
- [x] Unit Tests für React Components
- [x] API Route Testing
- [x] Performance Optimierung
- [x] SEO Meta Tags
- [x] Error Boundary Implementation

### Phase 8: Vercel Deployment & Optimierung
- [ ] vercel.json Konfiguration für Serverless Functions
- [ ] Environment Variables für Vercel Dashboard setup
- [ ] Build-Optimierung für statische JSON-Generierung
- [ ] Package.json Scripts erweitern (data:build, deploy:preview, etc.)
- [ ] ISR (Incremental Static Regeneration) für Daten-Updates
- [ ] Bundle Size Optimierung für Vercel
- [ ] Edge Functions für bessere Performance evaluieren
- [ ] Performance-Monitoring und Analytics
- [ ] Production Deployment Testing

## Technische Details

### Technologie-Stack
- **Framework:** Next.js 15 mit App Router
- **Hosting:** Vercel (Serverless Functions)
- **Styling:** Tailwind CSS v4
- **Sprache:** TypeScript
- **KI-API:** OpenRouter (nicht OpenAI!)
- **Datenverarbeitung:** CSV → JSON (Build-time)
- **HTTP Client:** fetch (native)
- **Deployment:** Vercel mit Edge Functions

### Dependency Migration
| Python (Original) | Node.js (Migration) | Zweck |
|-------------------|---------------------|--------|
| pandas | Build-Script (CSV → JSON) | Datenverarbeitung zur Build-Zeit |
| python-dotenv | dotenv | Environment Variables |
| openai (als OpenRouter Client) | openai (npm) + OpenRouter config | OpenRouter API Client |
| httpx | fetch (native) | HTTP Requests |
| pathlib | path (Node.js) | Dateipfad-Handling |
| streamlit | Next.js 15 + Vercel | Web Framework + Hosting |

### OpenRouter Konfiguration
- **Base URL:** `https://openrouter.ai/api/v1`
- **API Key:** `OPENROUTER_API_KEY` (Environment Variable)
- **Headers:** 
  - `HTTP-Referer`: Domain der App
  - `X-Title`: "SparFuchs.de"
- **Modelle:** Grok, Claude, GPT, etc. (Multi-Model Support)

### Vorgeschlagene Dateistruktur (Vercel-optimiert)
```
sparfuchs-nextjs/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── data/
│   │   │   └── route.ts
│   │   └── offers/
│   │       └── route.ts
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── UI/
│   │   │   ├── MarketToggles.tsx
│   │   │   ├── RecipeToggle.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── ai/
│   │   ├── openrouter-client.ts
│   │   ├── context.ts
│   │   └── hallucination-detection.ts
│   ├── data/
│   │   ├── products.json           # Konvertierte Produktdaten
│   │   ├── categories.json         # Kategorien-Index
│   │   ├── markets.json           # Markt-spezifische Daten
│   │   ├── search-index.json      # Optimierter Suchindex
│   │   ├── product-data.ts        # Data Access Layer
│   │   └── build-scripts/         # CSV → JSON Konvertierung
│   │       └── convert-csv.ts
│   └── utils/
│       ├── helpers.ts
│       └── constants.ts
├── public/
│   ├── logo.png
│   └── favicon.ico
├── data/
│   └── (Original CSV Dateien)
├── types/
│   └── index.ts
├── scripts/
│   └── build-data.ts              # Build-time Datenverarbeitung
├── vercel.json                    # Vercel-Konfiguration
├── next.config.js                 # Vercel-optimiert
├── package.json
└── tsconfig.json
```

## Kernfunktionalitäten (aus Original-App)

### Hauptfeatures
- **KI-gestützte Produktsuche** über natürliche Sprache (via OpenRouter)
- **Multi-Markt-Suche** (Aldi, Lidl, Rewe, Edeka, Penny)
- **Semantische Suche** und Preisvergleich
- **Chat-Interface** für Benutzerinteraktion
- **Rezept-Integration** mit Angebots-Matching
- **Halluzinations-Erkennung** für KI-Antworten
- **Multi-Model Support** über OpenRouter

### OpenRouter Integration Details
- **Client-Setup:** OpenAI SDK als Interface zu OpenRouter
- **Fallback-Mechanismen:** Mehrere Initialisierungsmethoden
- **Error Handling:** Robuste Fehlerbehandlung mit retry-Logik
- **Model Selection:** Dynamische Modellauswahl (aktuell: Grok 3 Mini Beta)
- **Custom Headers:** Referer und Title für OpenRouter

### UI-Komponenten zu migrieren
- Logo-Display
- Chat-Container mit Nachrichten-Historie
- Markt-Auswahl Toggles
- Rezept-Modus Toggle
- Chat-Input-Feld
- Loading-Spinner
- Welcome-Nachrichten und Follow-up Vorschläge
- Footer-Bereich

### Datenfluss
1. Benutzer gibt Suchanfrage ein
2. Ausgewählte Märkte und Rezept-Modus beeinflussen Kontext
3. OpenRouter-KI verarbeitet Anfrage mit Kontext
4. Generiert Antwort mit Error Handling
5. Prüft auf halluzinierte Produktreferenzen
6. Zeigt Antwort im Chat-Interface an

## Implementierungsreihenfolge

1. **Setup:** Projekt initialisieren und Grundstruktur erstellen
2. **Daten:** CSV-Verarbeitung und API-Routes implementieren
3. **OpenRouter:** OpenRouter-Client und Context-Generation
4. **UI:** React-Komponenten für Chat und Controls
5. **Styling:** Tailwind CSS für visuelles Design
6. **Integration:** Alles zusammenfügen und testen
7. **Optimierung:** Performance und UX-Verbesserungen

## Environment Variables
```
# Lokale Entwicklung (.env.local)
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_TITLE=SparFuchs.de

# Vercel Production (Dashboard)
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_APP_TITLE=SparFuchs.de
```

## Notizen
- UI-Design soll identisch zur Streamlit-Version bleiben
- **NUR OpenRouter verwenden, NICHT OpenAI direkt**
- **Vercel Hosting mit Serverless Functions**
- **CSV → JSON Build-time Konvertierung** (keine Runtime-DB nötig)
- Fokus auf Einfachheit und minimale Code-Änderungen
- TypeScript für bessere Type-Safety
- Vercel-optimierte Performance (Edge Functions, ISR)
- Modulare Struktur für einfache Wartung

---

## Review Bereich - Projektplan#2 Implementierung

### Durchgeführte Änderungen (Projektplan#2)
- [x] **UI Farben/Design erneuert:** Neue Grün-Palette (#86C232) als Primary-Color implementiert
- [x] **Favicon angepasst:** Einkaufswagen-Logo als SVG-Favicon erstellt und eingebunden
- [x] **More-Rezeptfinder entfernt:** Vollständige Entfernung aller Rezept-Funktionalitäten
- [x] **Chateingabe Direktfunktion:** Chat öffnet nicht mehr neues Fenster, sendet direkt an Bot
- [x] **Vorschläge funktional:** Suggestion-Buttons kopieren Text und senden automatisch an KI

### Technische Details der Implementierung

#### 1. UI Farben/Design
- `app/globals.css`: CSS Custom Properties aktualisiert
- Neue Farbpalette: Primary #86C232, Surface-Dunkel #222629, Text #1B1B1B
- Alle Komponenten verwenden weiterhin CSS-Variablen (keine Breaking Changes)

#### 2. Favicon
- `public/favicon.svg`: Neues Einkaufswagen-Symbol erstellt
- `app/layout.tsx`: Favicon-Referenz von .ico auf .svg aktualisiert

#### 3. More-Rezeptfinder Entfernung
- `RecipeToggle.tsx`: Komponente komplett entfernt
- `WelcomeMessages.tsx`: Rezept-Vorschläge und Hinweistexte entfernt
- `useSessionState.ts`: recipeMode aus Interface und State entfernt
- `ChatContainer.tsx`: recipeMode Props entfernt
- `api/chat/route.ts`: recipeMode aus Request-Interface entfernt
- `lib/ai/context.ts`: recipeMode aus ContextConfig entfernt, System-Prompt vereinfacht
- `data/More_Rezepte.csv`: CSV-Datei entfernt
- `__tests__/`: RecipeToggle-Tests entfernt

#### 4. Chat-Input Direktfunktion
- `page.tsx`: initialMessage State und Handler implementiert
- `ChatContainer.tsx`: initialMessage Prop hinzugefügt mit useEffect für Auto-Send
- Chat startet jetzt direkt mit der eingegebenen/ausgewählten Nachricht

#### 5. Vorschläge funktional
- `page.tsx`: handleSuggestionClick implementiert mit setInitialMessage + startChat
- WelcomeMessages-Buttons waren bereits korrekt implementiert (onClick Handler vorhanden)
- Vollständiger Flow: Button → setInitialMessage → startChat → ChatContainer → Auto-Send

### Erkenntnisse
- **Simplicity First:** Alle Änderungen minimal und isoliert implementiert
- **Architektur beibehalten:** Bestehende Hook- und Komponenten-Struktur unverändert
- **Breaking Changes vermieden:** CSS-Variablen und Props-Interfaces erweitert, nicht ersetzt
- **User Experience verbessert:** Direkter Chat-Flow ohne Umwege oder zusätzliche Fenster

### Nächste Schritte
- **Testing:** Funktionalität in Entwicklungsumgebung testen
- **Deployment:** Changes auf Vercel deployen und Live-Test durchführen
- **Optimierung:** Bei Bedarf weitere UI/UX-Verbesserungen basierend auf User-Feedback