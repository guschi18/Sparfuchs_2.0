# SparFuchs 2.0

🧠 **KI-gestützte Supermarkt-Angebots-App** mit natürlicher Sprachsuche für deutsche Supermärkte. Powered by **Grok-3 Mini** über OpenRouter für intelligente Produktsuche und Chat-Funktionalität.

## 🚀 Technologie-Stack

- **Next.js 14** mit App Router & TypeScript
- **Grok-3 Mini** über **OpenRouter** für KI-Chat und Semantic Search
- **Tailwind CSS** für modernes, responsives Design
- **Intent Detection System** für 99% Token-Reduktion
- **HeroUI** für UI-Komponenten
- **Server-Sent Events** für Real-time Streaming

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

## ✨ Features

### 🧠 **Intelligente KI-Suche**
- **Grok-3 Mini Integration** über OpenRouter API
- **Intent Detection** reduziert Token-Verbrauch um 99% (978 → 8 Produkte)
- **Dual-Field Architecture**: Content + Reasoning fields optimal genutzt
- **Streaming Responses** für Real-time Chat Experience
- **Hallucination Detection** validiert gegen echte Produktdatenbank

### 🎯 **Erweiterte Produktsuche**
- **Semantic Search** mit KI-basierter Relevanz-Bewertung
- **Traditional Search** mit bidirektionalem Substring-Matching
- **Deutsche Compound Words** vollständig unterstützt
- **Fuzzy Matching** für fehlertolerante Suche
- **Multi-Level Fallback** garantiert immer Ergebnisse

### 🎨 **Moderne UI/UX**
- **Responsive Design** (Mobile-First mit Tailwind CSS)
- **Market Toggles** mit individuellen Supermarkt-Farben
- **Session Persistence** überlebt Browser-Neustarts
- **Recipe Mode** für Multi-Ingredient Suchen
- **Export-Funktion** für Chat-Historie

### 📊 **Optimierte Datenverarbeitung**
- **978 echte Produkte** aus 5 deutschen Supermärkten
- **21 Kategorien** mit intelligenter Auto-Erkennung
- **2.662 Suchbegriffe** im vorberechneten Index
- **Build-time Processing** für maximale Performance
- **In-Memory Caching** für Vercel Serverless Functions

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

## 🎯 **Grok-3 Optimierungen (Latest)**

### **Response Architecture verstanden:**
- **Content Field**: Finale Antworten für Chat & Produktsuche (93 chars)
- **Reasoning Field**: Interner Denkprozess (3.061 chars) - wird intelligent ignoriert
- **Streaming Optimiert**: 2.195 Chunks (790 Content + 1.402 Reasoning)
- **Performance-optimiert**: Debug-Logging entfernt, Production-ready

### **Intent Detection System:**
```
🎯 "Wo ist Butter im Angebot?" → Intent: "butter" (44.4% Confidence)
📊 Produkte reduziert: 978 → 8 (-99% Token-Ersparnis)
🤖 KI analysiert nur 8 vorgefilterte Produkte
✅ Gefunden: 8 relevante Butter-Produkte
```

## ⚠️ **Wichtige Hinweise**

- **🚫 OpenRouter Exclusive**: Niemals OpenAI API direkt verwenden!
- **🇩🇪 German Only**: Vollständig deutsche Benutzeroberfläche
- **🏪 Market Order Fixed**: Lidl → Aldi → Edeka → Penny → Rewe (NIEMALS ändern!)
- **📊 Data Pipeline**: `npm run data:build` nach CSV-Updates erforderlich
- **🔄 Grok-3 Ready**: System versteht Content/Reasoning Dual-Field Architecture

## 🎉 **Projektstand (Vollständig)**

✅ **Next.js Migration** - App Router + TypeScript komplett  
✅ **Grok-3 Integration** - Dual-Field Response Architecture optimiert  
✅ **Intent Detection** - 99% Token-Reduktion implementiert  
✅ **UI/UX Components** - Mobile-First Responsive Design  
✅ **State Management** - Persistent Sessions + Export-Funktion  
✅ **Performance Optimiert** - Vercel Serverless + In-Memory Caching  
✅ **Production Ready** - Debug-Code entfernt, Performance-optimiert

**🚀 SparFuchs 2.0 ist production-ready mit optimaler Grok-3 Performance!**