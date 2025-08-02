## Environment Variables Required

### Local Development (.env.local)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_TITLE=SparFuchs.de
```

### Vercel Production (Dashboard)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_TITLE=SparFuchs.de
```

## Standard Workflow 
1. First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md. 
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and i will verify the plan. 
4. Then, begin working on the todo items, marking them as complete as you go. 
5. Please every step of the way just give me a high level explanation of what changes you made 
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity. 
7. Finally, add a review section to the projectplan.md file with a summary of the changes you made and any other relevant information.

## Important Migration Notes
- **CRITICAL:** Use OpenRouter, not OpenAI directly. OpenAI SDK is only used as client interface
- **VERCEL HOSTING:** All code must be Serverless Function compatible
- **DATA STRATEGY:** CSV → JSON build-time conversion implemented (978 products → 4 JSON files)
- **WEEKLY UPDATES:** Replace CSV files manually, run `npm run data:build`, then deploy
- Maintain identical UI/UX from original Streamlit version
- Focus on simplicity and minimal code changes
- All AI interactions must go through OpenRouter API with proper headers and timeout handling
- Implement proper error handling and fallback mechanisms for Vercel Serverless limits
- **PERFORMANCE:** ProductDataService with in-memory caching optimized for cold starts

## Phase 2 Status - COMPLETED ✅
- **products** successfully converted from CSV to optimized JSON
- **categories** and **5 markets** (Aldi, Lidl, Rewe, Edeka, Penny) indexed
- **2,662 search terms** in optimized search index
- **3 API routes** implemented: `/api/data`, `/api/offers`, `/api/meta`
- **Data Access Layer** with caching for Serverless optimization
- **Environment configuration** for local development and Vercel production

## Phase 3 Status - COMPLETED ✅
- **OpenRouter Client** with Vercel-optimized timeout handling (55s)
- **Context Generation** system for intelligent AI prompts
- **Hallucination Detection** validating responses against 978 products
- **Streaming Chat API** (`/api/chat/route.ts`) with real-time responses
- **Advanced Error Handling** with automatic retry and fallback models
- **Connection Pooling** (OpenRouterPool) for efficient client management
- **Multi-Model Support** (6 models: Grok, Claude, GPT, Gemini, Llama)
- **Edge Runtime Evaluation** for future performance optimization
- **German Language Support** with user-friendly error messages

## Phase 4 Status - COMPLETED ✅
- **Chat Components** (ChatContainer, ChatMessage, ChatInput) with streaming integration
- **Market Selection UI** interactive 5-market toggles with visual feedback
- **Recipe Mode Toggle** with animated switch and contextual tips
- **Loading States** comprehensive spinner system with typing indicators
- **Welcome System** interactive suggestions and example queries (12 examples)
- **Layout Structure** responsive Header/Footer with sticky positioning
- **Main Page Integration** sidebar layout with chat area and settings
- **German UX** fully localized interface with accessibility support
- **State Management** React hooks for markets, recipe mode, and chat state

## Phase 5 Status - COMPLETED ✅
- **Streamlit-inspired Design System** with SparFuchs brand colors and CSS properties
- **Orange Fox Theme** (#ff6b35) as primary color with consistent palette
- **Chat Interface Redesign** rounded message bubbles with shadows and animations
- **Market-specific Colors** individual colors per market (Aldi: Blue, Lidl: Yellow, etc.)
- **Enhanced Market Toggles** with hover effects, scale animations, and checkmark icons
- **Recipe Toggle Enhancement** animated switch with green success color and info boxes
- **Responsive Design System** mobile-first approach with breakpoints and touch optimization
- **Micro-interactions** hover effects, transitions, and scale animations throughout
- **Custom Scrollbars** and accessibility improvements with contrast-rich colors

## Phase 6 Status - COMPLETED ✅
- **Session State Management** localStorage-based persistence with `useSessionState` hook
- **Chat History System** cross-session message history with 100-message limit via `useChatHistory`
- **Advanced Input Handling** auto-resize textarea with validation through `useInputHandling`
- **Real-time Updates** streaming connection management with retry logic via `useRealTimeUpdates`
- **Form Validation Engine** comprehensive validation rules with XSS prevention using `useFormValidation`
- **Hook Integration** seamless integration of all 5 custom hooks into ChatContainer and ChatInput
- **Session Persistence** automatic session ID generation with market/recipe mode state restoration
- **Message Management** CRUD operations for chat messages with JSON export functionality
- **Input Validation** configurable limits, special character detection, and security checks
- **Connection Handling** automatic retry, timeout management, and connection status tracking

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.