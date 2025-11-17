# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**<PRIORITY NUMBER 1>** Change as little code as necessary!

Work carefully with internal thinking and revision steps (do not output).
Output ONLY the following artifacts:

1) BRIEF PLAN (max. 5 bullet points)
2) SOLUTION (complete code)
3) TESTS (representative cases incl. edge cases; as list or unit tests)
4) SELF-CHECK (checklist: correctness, edge cases, complexity, readability, security)
5) RISKS & TODOs (brief)
6) SUMMARY (max. 5 sentences)

Perform at least two internal rounds of Solve→Critique→Improve.
If uncertainty exists or data is missing: state explicitly and name what is needed.
Do not output extensive thought processes; only the artifacts.
Keep as concise as necessary while explaining everything compactly.

## 0. Docs-Preflight (Verpflichtend vor jeder Implementierung)

**Offizielle Dokumentation hat IMMER Vorrang vor Modellwissen!**

Vor jedem Coding-Task:
1. **Betroffene Dependencies identifizieren**: Welche Technologien werden genutzt?
2. **`docs/dependency-docs.md` öffnen**: Zentrale Übersicht mit Links zu offiziellen Docs
3. **Offizielle Docs prüfen**: Verlinkte Dokumentationen konsultieren
4. **Bei Versionssprüngen**: Migration-Guide lesen, relevante Notizen in `dependency-docs.md` ergänzen

**Beispiele**:
- React Component → React Docs + Next.js Docs prüfen
- Styling → Tailwind Docs + HeroUI Docs konsultieren
- Testing → Jest Docs + React Testing Library
- API-Integration → OpenRouter Docs

⚠️ **KRITISCH - Versions-Regel**:
- Nutze Dokumentation zur **AKTUELL installierten Version** (siehe `package.json`)
- **NIEMALS Dependencies upgraden** ohne explizite Anweisung des Entwicklers
- Falls Docs die neueste Version zeigen: Version-Picker nutzen oder nach richtiger Version suchen

**Referenz**: Siehe `docs/dependency-docs.md` für alle Kern-Dependencies mit aktuellen Versionen und Links.

## Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the projectplan.md file with a summary of the changes you made and any other relevant information.

## <prompt-optimization> XML-Tag Usage
- **<context>**: Use XML-like tags in prompts for better structure recognition
- **<examples>**: `<new-feature>`, `<bug-fix>`, `<analysis>`, `<research>`, `<ui-update>`, `<data-processing>`
- **<benefit>**: Claude understands structured prompts better and works more efficiently
- **<usage>**: Categorize requests with tags for more precise responses

## Development Commands
All commands run from project root directory:
- `npm run dev` - Development server (default port 3000)
- `npm run build` - Production build
- `npm run lint` - Code quality check
- `npm run test` - Run Jest tests
- `npm run test:watch` - Jest in watch mode
- `npm run test:coverage` - Test coverage report
- `npm run generate:docs` - Generate documentation
- `npm run analyze:docs` - Generate analyzed documentation
- `npm run analyze:queries` - Analyze user search queries (Query-Logging System)

## Architecture Overview - Details in `docs/` folder

### Technology Stack
- **Framework**: Next.js 14.2.18 with App Router
- **Language**: TypeScript (strict mode, target: ES2017)
- **Styling**: Tailwind CSS v3.3.6
- **UI Library**: HeroUI v2.6.14 (HeroUI React components)
- **Animations**: Framer Motion v12.23.12
- **AI Integration**: OpenRouter API (google/gemini-2.5-flash-lite)
- **Data Processing**: CSV-Parse v6.1.0
- **Testing**: Jest v29.7.0 with React Testing Library
- **Build Analysis**: Next.js Bundle Analyzer

### Project Structure & Documentation Map
```
/
├── app/              # Next.js App Router pages & components
│   ├── api/          # API routes (chat endpoint with streaming)
│   ├── components/   # React Components (Chat, Layout, UI, Error)
│   ├── page.tsx      # Main chat interface page
│   ├── layout.tsx    # Root layout with metadata
│   └── globals.css   # Global styles & CSS variables
├── lib/              # Services & Utilities
│   ├── ai/           # AI Integration (OpenRouter)
│   ├── data/         # Data Management (Offers, Synonyms)
│   ├── hooks/        # Custom React Hooks
│   └── utils/        # Helper functions & constants
├── types/            # TypeScript Type Definitions
├── scripts/          # Build, documentation & analysis scripts
│   ├── Queries/      # Query-Logging System
│   └── Synonyms/     # Synonym Management System
├── docs/             # Comprehensive documentation (100% coverage)
├── Angebote/         # Offers data directory (JSONL format)
├── Prompts/          # AI prompts & optimization guides
└── public/           # Static assets
```

## 📋 Documentation Reference Map

### 🏠 **App Components** - Details in `docs/app/components/`

**Chat Components** (`docs/app/components/Chat/`):
- Main Container: `ChatContainer_documentation.md`
- User Input: `ChatInput_documentation.md`
- Message Display: `ChatMessage_documentation.md` (with market sorting, shopping list integration)
- Product Cards: `ProductCard_documentation.md` (no redundant market badge, shopping list integration)
- **Add To List Button**: `AddToListButton_documentation.md` (compact button, icon-based, disabled state)

**Error Handling** (`docs/app/components/Error/`):
- Chat Error Boundary: `ChatErrorBoundary_documentation.md`
- General Error Boundary: `ErrorBoundary_documentation.md`
- UI Error Boundary: `UIErrorBoundary_documentation.md`

**Layout Components** (`docs/app/components/Layout/`):
- Header: `Header_documentation.md` (with shopping list button integration)
- Footer: `Footer_documentation.md`

**UI Components** (`docs/app/components/UI/`):
- Central Input: `CentralInput_documentation.md`
- Input Tips: `InputTip_documentation.md`
- Market Toggles: `MarketToggles_documentation.md`
- Welcome Messages: `WelcomeMessages_documentation.md`
- Loading Spinner: `LoadingSpinner_documentation.md`
- Console Component: `Konsole_documentation.md`
- **Shopping List Button**: `ShoppingListButton_documentation.md` (header button with badge & pulse animation)
- **Shopping List Panel**: `ShoppingListPanel_documentation.md` (slide-in panel, filter, ESC key support)
- **Toast System**: `Toast_documentation.md` (custom toasts, bottom-right, auto-dismiss)

**Special Components** (`docs/app/components/`):
- Performance Reporter: `Performance/PerformanceReporter_documentation.md`
- Structured Data (SEO): `SEO/StructuredData_documentation.md`

### 🤖 **AI Integration** - Details in `docs/lib/ai/`
- **OpenRouter Client**: `openrouter_documentation.md`
  - Streaming chat completions with SSE
  - Model: google/gemini-2.5-flash-lite
  - Environment: OPENROUTER_API_KEY required

### 📊 **Data Management** - Details in `docs/lib/data/`
- **Offers System**: `offers_documentation.md`
  - 121 categories, ~240 brand synonyms
  - 26.9% coverage (619/2299 terms)
  - Semantic search with synonym expansion
  - Integration with Query-Logging & Synonym-Management Systems

### 🎣 **Custom Hooks** - Details in `docs/lib/hooks/`
- Chat History Management: `useChatHistory_documentation.md`
- Form Validation: `useFormValidation_documentation.md`
- Input Handling: `useInputHandling_documentation.md`
- Real-time Updates: `useRealTimeUpdates_documentation.md`
- Session State: `useSessionState_documentation.md`
- **Shopping List Management**: `useShoppingList_documentation.md` (CRUD, LocalStorage, useMemo/useCallback optimized)
- **Toast Notifications**: `useToast_documentation.md` (success/error/info toasts, no external deps)

### 🛠️ **Utilities & Services** - Details in `docs/lib/utils/`
- Application Constants: `constants_documentation.md`
- Environment Variables: `env_documentation.md`
- Helper Functions: `helpers_documentation.md`
- Performance Utilities: `performance_documentation.md`
- **LocalStorage Service**: `localStorage_documentation.md` (SSR-safe, MemoryStorage fallback, shopping list API)

### 📝 **Type Definitions** - Details in `docs/types/`
- Core App Types: `index_documentation.md`

### 📚 **Dependency Documentation** - Details in `docs/`
- **Dependency Docs Reference**: `dependency-docs.md`
  - Zentrale Übersicht aller Kern-Dependencies (8 Libraries)
  - Aktuelle Versionen: Next.js (^14.2.18), React (^18.3.1), Tailwind (^3.3.6), HeroUI (^2.6.14), Framer Motion (^12.23.12), OpenRouter, Jest (^29.7.0), ESLint (^8.57.1)
  - Offizielle Docs-Links + Migration Guides
  - Verpflichtender Docs-Preflight vor jeder Implementierung

### ⚙️ **Configuration Files** - Details in `docs/`
- Next.js Config: `next.config_documentation.md`
- Tailwind Config: `tailwind.config_documentation.md`
- ESLint Config: `eslint.config_documentation.md`
- PostCSS Config: `postcss.config_documentation.md`
- TypeScript: `next-env.d_documentation.md`

### 📚 **App Pages** - Details in `docs/app/`
- Main Page: `page_documentation.md` (Chat interface, shopping list integration, default market order: Lidl→Aldi→Edeka→Penny→Rewe)
- Root Layout: `layout_documentation.md`
- Global Styles: `globals_documentation.md`

### 🔧 **Scripts & Systems** - Details in `docs/scripts/` & `scripts/`
- **Documentation Generator**: `scripts/generate-analyzed-docs_documentation.md`
- **Query-Logging System**: `scripts/Queries/README.md`
  - Automatic tracking of user searches
  - Analysis: `npm run analyze:queries`
- **Synonym Management System**: `scripts/Synonyms/README.md`
  - Weekly workflow for coverage improvement
  - Smart brand mapping (83 top brands)
  - Coverage analysis & CSV reports

## Quick Reference

### Core Application Features
**SparFuchs** is a smart supermarket deals comparison application with AI-powered chat interface:
- Multi-market product search (5 markets: Lidl, Aldi, Edeka, Penny, Rewe)
- Real-time AI chat powered by OpenRouter (Gemini 2.5 Flash Lite)
- Streaming responses for progressive UI updates
- Market toggle filters (default order: Lidl→Aldi→Edeka→Penny→Rewe)
- Product cards grouped by market (no redundant badges)
- **Shopping List Feature**: Add products to persistent shopping list with LocalStorage
  - Header button with badge & pulse animation
  - Slide-in panel with checkboxes & "Hide completed" filter
  - Toast notifications for user feedback
  - SSR-safe with 300ms debounced writes
- Semantic search with 121 categories & ~240 brand synonyms
- Query-logging for search optimization
- Welcome screen with suggestion chips

### Key Design Patterns
- **State Management**: Simple useState (no complex libraries) - see `docs/app/page_documentation.md`
- **LocalStorage Persistence**: SSR-safe with MemoryStorage fallback - see `docs/lib/utils/localStorage_documentation.md`
- **Animation**: Framer Motion with spring configs - see `docs/app/globals_documentation.md`
- **Responsive**: Mobile-first approach with Tailwind
- **Client-Side**: Main components use `'use client'` directive
- **SSR Safety**: Client check with `isClient` state before rendering
- **Streaming**: Server-Sent Events for AI responses - see `docs/lib/ai/openrouter_documentation.md`
- **Error Handling**: Multiple boundary layers - see `docs/app/components/Error/`
- **Performance**: Loading states, smooth animations, optimized re-renders, debounced writes

### API Integration
**Chat Endpoint**: `/api/chat` (POST with streaming response)
- **Request**: `{ message: string, selectedMarkets: string[], useSemanticSearch: boolean }`
- **Response**: Server-Sent Events with `data:` prefix
- **AI Model**: google/gemini-2.5-flash-lite via OpenRouter
- Details: `docs/lib/ai/openrouter_documentation.md`

### Market Configuration
Default market order (Lidl first): `['Lidl', 'Aldi', 'Edeka', 'Penny', 'Rewe']`
- Market colors defined in `lib/utils/constants.ts`
- Frontend sorting in `ChatMessage` component
- Details: `docs/lib/utils/constants_documentation.md`

### Common Development Tasks
- **New Components**: Create in `app/components/[Category]/` + add documentation in `docs/app/components/[Category]/`
- **New Hooks**: Add to `lib/hooks/` + document in `docs/lib/hooks/`
- **New Utilities**: Add to `lib/utils/` + document in `docs/lib/utils/`
- **Styling Changes**: Modify CSS variables in `app/globals.css` - see `docs/app/globals_documentation.md`
- **Type Updates**: Update `types/index.ts` + regenerate documentation
- **Synonym Updates**: Weekly workflow in `scripts/Synonyms/` - see `scripts/Synonyms/README.md`
- **Query Analysis**: Run `npm run analyze:queries` after 1-2 weeks - see `scripts/Queries/README.md`

### Testing Strategy
- **Framework**: Jest with React Testing Library
- **Config**: `jest.config.js` with jsdom environment
- **Coverage**: `npm run test:coverage`
- **Types**: Component tests, hook tests, utility tests

### Data Management
- **Source**: `Angebote/latest/Angebote.txt` (JSONL format, ~1574 offers)
- **Processing**: CSV-Parse for data loading
- **Search**: Synonym-based semantic search
- **Systems**:
  - Query-Logging (`scripts/Queries/`)
  - Synonym-Management (`scripts/Synonyms/`)
- Details: `docs/lib/data/offers_documentation.md`

### Build & Deployment
- **Build**: `npm run build` or `npm run production:build`
- **Analysis**: `npm run analyze` or `npm run build:analyze`
- **Output**: Static `.next` folder
- **Compression**: Enabled in next.config.mjs

### Environment Variables
Required variables in `.env.local`:
- `OPENROUTER_API_KEY` - OpenRouter API key (required)
- `NEXT_PUBLIC_APP_URL` - App URL (optional, default: localhost:3000)
- `NEXT_PUBLIC_APP_TITLE` - App title (optional, default: SparFuchs.de)

Details: `docs/lib/utils/env_documentation.md`

### Important File Paths
- Main Page: `app/page.tsx:23` (selectedMarkets default order, shopping list integration)
- Chat API: `app/api/chat/route.ts:1`
- OpenRouter Client: `lib/ai/openrouter.ts:1`
- Offers System: `lib/data/offers.ts:1`
- Shopping List Hook: `lib/hooks/useShoppingList.ts:1`
- LocalStorage Service: `lib/utils/localStorage.ts:1`
- Constants: `lib/utils/constants.ts:1`
- Global Styles: `app/globals.css:1`
- Type Definitions: `types/index.ts:1`

### Code Style Guidelines
1. **TypeScript Strict Mode**: Always maintain strict type checking
2. **'use client' Directive**: Required for components using hooks/interactivity
3. **Animations**: Use Framer Motion with consistent spring configs
4. **Naming**: PascalCase for components, camelCase for functions/variables
5. **Comments**: Document complex logic, avoid obvious comments
6. **Error Messages**: User-friendly German language messages
7. **Loading States**: Always provide visual feedback during async operations
8. **Accessibility**: Maintain semantic HTML and ARIA labels

### Performance Optimization
- **Code Splitting**: Automatic via Next.js App Router
- **Image Optimization**: Use Next.js Image component when applicable
- **CSS**: Tailwind with PurgeCSS for minimal bundle
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Lazy Loading**: Implement for heavy components
- **Memoization**: React.memo, useMemo, useCallback where appropriate
- **Streaming**: AI responses via SSE for progressive rendering

### Documentation Standards
All major components and utilities must have corresponding documentation in the `docs/` folder following the pattern: `[filename]_documentation.md`

**Last Updated**: 2025-11-06
**Project Version**: 0.1.0
**Next.js Version**: 14.2.18
**AI Model**: google/gemini-2.5-flash-lite (OpenRouter)
**Documentation Coverage**: 100% (48/48 files)
**Latest Feature**: Shopping List Integration with LocalStorage persistence
