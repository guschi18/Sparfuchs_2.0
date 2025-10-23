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

## Architecture Overview - Details in `docs/` folder

### Technology Stack
- **Framework**: Next.js 14.2.18 with App Router
- **Language**: TypeScript (strict mode, target: ES2017)
- **Styling**: Tailwind CSS v3.3.6
- **UI Library**: HeroUI v2.6.14 (HeroUI React components)
- **Animations**: Framer Motion v12.23.12
- **Data Processing**: CSV-Parse v6.1.0
- **Testing**: Jest v29.7.0 with React Testing Library
- **Build Analysis**: Next.js Bundle Analyzer

### Project Structure & Documentation Map
```
/
├── app/              # Next.js App Router pages & components
│   ├── components/   # React Components
│   ├── page.tsx      # Main chat interface page
│   ├── layout.tsx    # Root layout with metadata
│   └── globals.css   # Global styles & CSS variables
├── lib/              # Services & Utilities
│   ├── hooks/        # Custom React Hooks
│   └── utils/        # Helper functions & constants
├── types/            # TypeScript Type Definitions
├── scripts/          # Build & documentation scripts
├── docs/             # Comprehensive documentation
├── Angebote/         # Offers data directory
├── Prompts/          # AI prompts & optimization guides
└── public/           # Static assets
```

## 📋 Documentation Reference Map

### 🏠 **App Components** - Details in `docs/app/components/`

**Chat Components** (`docs/app/components/Chat/`):
- Main Container: `ChatContainer_documentation.md`
- User Input: `ChatInput_documentation.md`
- Message Display: `ChatMessage_documentation.md`
- Product Cards: `ProductCard_documentation.md`

**Error Handling** (`docs/app/components/Error/`):
- Chat Error Boundary: `ChatErrorBoundary_documentation.md`
- General Error Boundary: `ErrorBoundary_documentation.md`
- UI Error Boundary: `UIErrorBoundary_documentation.md`

**Layout Components** (`docs/app/components/Layout/`):
- Header: `Header_documentation.md`
- Footer: `Footer_documentation.md`

**UI Components** (`docs/app/components/UI/`):
- Central Input: `CentralInput_documentation.md`
- Input Tips: `InputTip_documentation.md`
- Market Toggles: `MarketToggles_documentation.md`
- Welcome Messages: `WelcomeMessages_documentation.md`
- Loading Spinner: `LoadingSpinner_documentation.md`
- Console Component: `Konsole_documentation.md`

**Special Components** (`docs/app/components/`):
- Performance Reporter: `Performance/PerformanceReporter_documentation.md`
- Structured Data (SEO): `SEO/StructuredData_documentation.md`

### 🎣 **Custom Hooks** - Details in `docs/lib/hooks/`
- Chat History Management: `useChatHistory_documentation.md`
- Form Validation: `useFormValidation_documentation.md`
- Input Handling: `useInputHandling_documentation.md`
- Real-time Updates: `useRealTimeUpdates_documentation.md`
- Session State: `useSessionState_documentation.md`

### 🛠️ **Utilities & Services** - Details in `docs/lib/utils/`
- Application Constants: `constants_documentation.md`
- Environment Variables: `env_documentation.md`
- Helper Functions: `helpers_documentation.md`
- Performance Utilities: `performance_documentation.md`

### 📝 **Type Definitions** - Details in `docs/types/`
- Core App Types: `index_documentation.md`

### ⚙️ **Configuration Files** - Details in `docs/`
- Next.js Config: `next.config_documentation.md`
- Tailwind Config: `tailwind.config_documentation.md`
- ESLint Config: `eslint.config_documentation.md`
- PostCSS Config: `postcss.config_documentation.md`
- TypeScript: `next-env.d_documentation.md`

### 📚 **App Pages** - Details in `docs/app/`
- Main Page: `page_documentation.md` (Chat interface with market selection)
- Root Layout: `layout_documentation.md`
- Global Styles: `globals_documentation.md`

### 🔧 **Scripts** - Details in `docs/scripts/`
- Documentation Generator: `generate-analyzed-docs_documentation.md`

### 📖 **Prompts & Configuration** - Details in `docs/Prompts/` & `docs/.claude/`
- Claude Optimization: `Prompts/Claude optimieren_documentation.md`
- Documentation Adjustments: `Prompts/Docs anpassen_documentation.md`
- New Documentation: `Prompts/Docs neu_documentation.md`
- Settings: `.claude/settings.local_documentation.md`

## Quick Reference

### Core Application Features
**SparFuchs** is a smart supermarket deals comparison application with AI-powered chat interface:
- Multi-market product search (Aldi, Lidl, Rewe, Edeka, Penny)
- Real-time AI chat for product queries and price comparisons
- Streaming responses for better UX
- Market toggle filters
- Product card displays with pricing information
- Welcome screen with suggestion chips

### State Management Pattern
```typescript
// Simple useState-based state management - no complex state libraries
const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['Aldi', 'Lidl', ...]);
const [chatStarted, setChatStarted] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
```

### Message Interface
```typescript
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}
```

### Key Design Patterns
- **Animation**: Framer Motion with spring configs (damping: 20, stiffness: 100)
- **Responsive**: Mobile-first approach with Tailwind utilities
- **Client-Side**: All main components use `'use client'` directive
- **SSR Safety**: Client check with `isClient` state before rendering
- **Streaming**: Server-Sent Events for AI responses
- **Error Handling**: Multiple error boundary layers (Chat, UI, General)
- **Performance**: Loading states, smooth animations, optimized re-renders

### CSS Variables Pattern (globals.css)
```css
--sparfuchs-background: /* Main background */
--sparfuchs-surface: /* Card/surface backgrounds */
--sparfuchs-primary: /* Primary brand color */
--sparfuchs-text: /* Main text color */
--sparfuchs-text-light: /* Secondary text color */
--sparfuchs-border: /* Border color */
```

### Animation Configurations
```typescript
// Spring animation config
const springConfig = {
  type: "spring" as const,
  damping: 20,
  stiffness: 100
};

// Page transitions
const pageTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: springConfig
};

// Slide animations
const slideFromBottom = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: springConfig
};
```

### API Integration
- **Chat Endpoint**: `/api/chat` (POST with streaming response)
- **Request Format**: `{ message: string, selectedMarkets: string[], useSemanticSearch: boolean }`
- **Response Format**: Server-Sent Events with `data:` prefix
- **Error Handling**: Status checks + try-catch with user-friendly error messages

### Market Constants
Available markets defined in `lib/utils/constants.ts`:
- Aldi (Blue: #00a8e6)
- Lidl (Yellow: #ffcc00)
- Rewe (Red: #cc0000)
- Edeka (Blue: #005ca4)
- Penny (Orange: #ff6900)

### Common Development Tasks
- **New Components**: Create in `app/components/[Category]/` + add documentation in `docs/app/components/[Category]/`
- **New Hooks**: Add to `lib/hooks/` + document in `docs/lib/hooks/`
- **New Utilities**: Add to `lib/utils/` + document in `docs/lib/utils/`
- **Styling Changes**: Modify CSS variables in `app/globals.css` for theme consistency
- **Type Updates**: Update `types/index.ts` + regenerate documentation
- **API Changes**: Update `/api/chat` route (currently removed - needs reimplementation)

### Testing Strategy
- **Framework**: Jest with React Testing Library
- **Config**: `jest.config.js` with jsdom environment
- **Coverage**: Available via `npm run test:coverage`
- **Testing Types**: Component tests, hook tests, utility tests

### Current Application State
⚠️ **Note**: The AI chat API (`/api/chat`) has been removed. The application currently shows a placeholder error message:
```
"Die Chat-Funktion ist derzeit deaktiviert, da die frühere KI entfernt wurde."
```
Future development should reimplement the chat API with new AI service integration.

### Data Sources
- **Offers Data**: Located in `/Angebote/` directory
- **Format**: CSV files processed with csv-parse
- **Markets**: Aldi, Lidl, Rewe, Edeka, Penny

### Build & Deployment
- **Build Command**: `npm run build` or `npm run production:build`
- **Build Analysis**: `npm run analyze` or `npm run build:analyze`
- **Output**: Static `.next` folder for deployment
- **Compression**: Enabled in next.config.mjs

### Environment Variables
Managed in `.env.local` - see `docs/lib/utils/env_documentation.md` for details.

### Important File Paths
- Main Page: `app/page.tsx:1`
- Root Layout: `app/layout.tsx:1`
- Global Styles: `app/globals.css:1`
- Constants: `lib/utils/constants.ts:1`
- Type Definitions: `types/index.ts:1`
- Package Config: `package.json:1`
- Next Config: `next.config.mjs:1`
- Tailwind Config: `tailwind.config.js:1`

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
- **Bundle Analysis**: Available via `@next/bundle-analyzer`
- **Lazy Loading**: Implement for heavy components
- **Memoization**: Use React.memo, useMemo, useCallback where appropriate

### Documentation Standards
All major components and utilities should have corresponding documentation in the `docs/` folder following the pattern: `[filename]_documentation.md`

Run `npm run generate:docs` or `npm run analyze:docs` to generate/update documentation files.

**Last Updated**: 2025-10-22
**Project Version**: 0.1.0
**Next.js Version**: 14.2.18
