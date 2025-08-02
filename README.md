# SparFuchs 2.0

KI-gestützte Supermarkt-Angebots-App mit natürlicher Sprachsuche für deutsche Supermärkte.

## Technologie-Stack

- **Next.js 14** mit App Router
- **TypeScript** mit vollständiger Type-Sicherheit
- **Tailwind CSS** für modernes, responsives Design
- **OpenRouter** für KI-Chat-Funktionalität
- **HeroUI** für UI-Komponenten

## Ziel-Märkte

5 deutsche Supermärkte:
- **Lidl** 
- **Aldi** 
- **Edeka** 
- **Penny** 
- **Rewe** 

## Quick Start

```bash
# Dependencies installieren
npm install

# Environment Variables konfigurieren
cp .env.example .env.local
# OPENROUTER_API_KEY hinzufügen

# Daten verarbeiten (CSV → JSON)
npm run data:build

# Development Server starten
npm run dev
```

## Environment Variables

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_TITLE=SparFuchs.de
```

## Development Commands

```bash
# Core Development
npm run dev          # Development Server
npm run build        # Production Build (inkl. Datenverarbeitung)
npm run start        # Production Server
npm run lint         # Code Linting

# Data Management
npm run data:build   # CSV → JSON Konvertierung
npm run data:update  # Daten aktualisieren
npm run data:validate # Datenintegrität prüfen

# Testing & Performance
npm test             # Jest Tests
npm run test:coverage # Coverage Report
npm run analyze      # Bundle Analyzer
npm run cache:warm   # Production Cache
```

## Architektur

### Data Flow
1. **CSV Processing**: `data/Angebote.csv` → Optimierte JSON-Strukturen
2. **In-Memory Caching**: `ProductDataService` für serverless Performance
3. **AI Context**: Smart product context für OpenRouter API
4. **Streaming Chat**: Real-time responses mit hallucination detection

### Projektstruktur

```
app/
├── api/                    # Next.js API Routes
│   ├── chat/route.ts      # Streaming Chat mit OpenRouter
│   ├── data/route.ts      # Produktsuche
│   └── offers/route.ts    # Erweiterte Filterung
├── components/            # React Components
│   ├── Chat/             # Chat Interface
│   ├── UI/               # Market Toggles, Spinners
│   └── Layout/           # Header, Footer
└── page.tsx              # Hauptseite

lib/
├── ai/                   # OpenRouter Integration
│   ├── context.ts        # System Prompts
│   ├── openrouter-client.ts # API Client
│   └── hallucination-detection.ts
├── data/                 # Datenmanagement
│   ├── product-data.ts   # Hauptservice mit Caching
│   └── *.json           # Generierte Produktdaten
└── hooks/                # React State Management
```

## Features

### 🤖 KI-Chat
- **Multi-Model Support** 
- **Streaming Responses** für Real-time Experience
- **Hallucination Detection** gegen Produkte validiert

### 🎨 UI/UX
- **Responsive Design** (Mobile-First)
- **Market Toggles** mit individuellen Farben
- **Session Persistence** mit localStorage

### 📊 Datenverarbeitung
- **21 Kategorien** automatisch erkannt
- **2.662 Suchbegriffe** im optimierten Index
- **Deutsche Compound Words** Support
- **Fuzzy Search** mit semantic matching

## Produktionsdeployment

```bash
# Vollständiger Production Build
npm run production:build

# Vercel Deployment
vercel deploy --prod
```

### Vercel Optimierungen
- **Serverless Functions** mit 60s Timeout
- **Build-time Processing** für beste Performance
- **In-Memory Caching** für API Routes
- **Edge-optimized** JSON Datenstrukturen

## Wichtige Hinweise

- **OpenRouter Only**: Verwendet ausschließlich OpenRouter API (nicht OpenAI direkt)
- **German Language**: Vollständig deutsche Benutzeroberfläche
- **Market Order**: Feste Reihenfolge (Lidl → Aldi → Edeka → Penny → Rewe)
- **Data Freshness**: `npm run data:build` nach CSV-Updates erforderlich

## Projektstand

✅ **Migration komplett** - Vollständig funktionsfähige Next.js App  
✅ **AI Integration** - OpenRouter 
✅ **UI Components** - Responsive Chat-Interface  
✅ **State Management** - Persistent Sessions  
✅ **Production Ready** - Vercel-optimiert