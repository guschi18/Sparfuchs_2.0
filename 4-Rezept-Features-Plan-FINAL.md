# Smart Recipe Integration - Finaler Implementierungsplan v4.1

## Executive Summary

Spoonacular API Key = 9ef13a305d394bb48e11e4620096c1f8
Vercel KV Upstash aktiviert bei Verel
npm install @upstash/redis
KV_REST_API_READ_ONLY_TOKEN="AqVCAAIgcDL4G6gJBPlwDwbU-BWmFwd2e5SAETe9rOr_KmxSU7iHyg"
KV_REST_API_TOKEN="AaVCAAIncDJmNTFjZDE1NDQ1NGI0ZWYwODcyNmYyYzRlOWQ3ZDQ0ZXAyNDIzMDY"
KV_REST_API_URL="https://guided-lobster-42306.upstash.io"
KV_URL="rediss://default:AaVCAAIncDJmNTFjZDE1NDQ1NGI0ZWYwODcyNmYyYzRlOWQ3ZDQ0ZXAyNDIzMDY@guided-lobster-42306.upstash.io:6379"
REDIS_URL="rediss://default:AaVCAAIncDJmNTFjZDE1NDQ1NGI0ZWYwODcyNmYyYzRlOWQ3ZDQ0ZXAyNDIzMDY@guided-lobster-42306.upstash.io:6379"

Implementierung eines Rezept-Features für SparFuchs.de mit folgenden Kernentscheidungen:

| Aspekt | Entscheidung |
|--------|--------------|
| Rezept-API | Spoonacular (Free Tier: 150 req/Tag) |
| AI-Formatierung | **Keine** - Direkte Transformation |
| Ingredient Matching | **Batch-Embeddings** (1 API-Call für alle Zutaten) |
| Query-Sprache | DE→EN Übersetzung vor Spoonacular-Call |
| Monitoring | **Vercel KV** (Server-side) |
| Error-Handling | **Minimal** (generische Meldungen) |
| Recipe Toggle | **Nur auf Welcome Screen** |
| Fallback | Keiner (Fehler = Fehlermeldung) |

---

## Technische Architektur

### Data Flow (Optimiert)
```
User aktiviert Recipe Toggle (Welcome Screen)
       ↓
User stellt Frage: "Zwei warme Gerichte, proteinreich, mit Reis"
       ↓
POST /api/chat (recipeMode: true)
       ↓
Query-Übersetzung: DE → EN ("high protein rice dishes")
       ↓
Spoonacular API: Recipe Search
       ↓
Batch-Embedding: Alle Zutaten aller Rezepte in EINEM Call
       ↓
Vektor-Suche: Match gegen Angebots-Index (lokal, <10ms)
       ↓
Direkte Transformation → RECIPE_CARD: {...} (KEIN AI-Call)
       ↓
Vercel KV: Request-Counter increment
       ↓
ChatMessage rendert RecipeCard Komponenten
```

### Architektur-Diagramm
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  Welcome Screen          │  Chat Interface                  │
│  ├── MarketToggles       │  ├── ChatMessage                 │
│  ├── RecipeToggle ←────┐ │  │   ├── Text                    │
│  └── CentralInput      │ │  │   ├── ProductCard             │
│                        │ │  │   └── RecipeCard (NEU)        │
│  Mode wird fixiert ────┘ │  └── ChatInput                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    /api/chat (route.ts)                      │
├─────────────────────────────────────────────────────────────┤
│  if (recipeMode) {                                          │
│    1. translateQuery(DE→EN)                                 │
│    2. searchSpoonacular(englishQuery)                       │
│    3. batchMatchIngredients(allIngredients)                 │
│    4. transformToRecipeCards(recipes)  ← Direkt, kein AI    │
│    5. trackApiUsage(vercelKV)                               │
│    6. return stream(RECIPE_CARD: {...})                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│  Spoonacular API        │  OpenRouter API    │  Vercel KV   │
│  ├── Recipe Search      │  ├── Batch Embed   │  ├── Counter │
│  └── Nutrition Data     │  └── (nur 1 Call!) │  └── Stats   │
└─────────────────────────────────────────────────────────────┘
```

---

## Type Definitions

### Neue Types (types/index.ts)

```typescript
// ============================================
// RECIPE TYPES (NEU)
// ============================================

export interface RecipeCard {
  id: string;
  title: string;
  servings: number;
  readyInMinutes: number;
  imageUrl?: string;
  sourceUrl?: string;
  
  nutrition: RecipeNutrition;
  ingredients: RecipeIngredient[];
  instructions: string;
  
  cuisines?: string[];
  diets?: string[];
}

export interface RecipeNutrition {
  calories: number;      // per serving, default 0
  protein: number;       // grams, default 0
  fat: number;           // grams, default 0
  carbs: number;         // grams, default 0
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  original: string;            // "500g chicken breast"
  matchedOffer?: ProductCard;  // Gematchtes Angebot (aus types/index.ts)
  isAvailable: boolean;
}

export interface SavedRecipe {
  recipe: RecipeCard;
  savedAt: number;
  lastViewedAt?: number;
  notes?: string;
}

// ============================================
// EXISTING TYPES (zu verschieben aus ProductCard.tsx)
// ============================================

export interface ProductCard {
  id: string;
  name: string;
  price: string;
  market: string;
  dateRange: string;
  brand?: string;
  variant?: string;
  pack_size?: string;
  notes?: string;
}

// ============================================
// REQUEST TYPES (erweitern)
// ============================================

export interface ChatRequest {
  message: string;
  selectedMarkets: string[];
  useSemanticSearch?: boolean;
  recipeMode?: boolean;  // NEU
}
```

---

## Implementierungsphasen

### Phase 0: Type-Konsolidierung (PREREQUISITE) - 1h

**Ziel**: Alle shared Types nach `types/index.ts` verschieben

**Betroffene Dateien**:
- `types/index.ts` - ProductCard Interface hinzufügen
- `app/components/Chat/ProductCard.tsx` - Interface entfernen, Import hinzufügen
- `app/components/Chat/ChatMessage.tsx` - Import anpassen
- `lib/hooks/useShoppingList.ts` - Import prüfen

**Tasks**:
```bash
# 1. ProductCard Interface nach types/index.ts verschieben
# 2. Alle Imports aktualisieren
# 3. Build testen: npm run build
# 4. Keine funktionalen Änderungen!
```

**Erfolgskriterium**: `npm run build` erfolgreich, keine Type-Errors.

---

### Phase 1: Spoonacular API Setup - 2h

**Ziel**: API-Client mit Caching und Query-Übersetzung

**Neue Dateien**:
- `/lib/api/spoonacular.ts`
- `/lib/api/recipe-cache.ts`
- `/lib/api/query-translator.ts`

**1.1 Query-Übersetzer (DE→EN)**:
```typescript
// lib/api/query-translator.ts

const KEYWORD_MAP: Record<string, string> = {
  // Diäten
  'proteinreich': 'high-protein',
  'eiweißreich': 'high-protein',
  'vegetarisch': 'vegetarian',
  'vegan': 'vegan',
  'low carb': 'low-carb',
  'kohlenhydratarm': 'low-carb',
  
  // Zutaten
  'reis': 'rice',
  'hähnchen': 'chicken',
  'huhn': 'chicken',
  'nudeln': 'pasta',
  'kartoffeln': 'potato',
  'lachs': 'salmon',
  'rindfleisch': 'beef',
  'schweinefleisch': 'pork',
  'tofu': 'tofu',
  
  // Gerichte
  'suppe': 'soup',
  'salat': 'salad',
  'auflauf': 'casserole',
  'pfanne': 'stir fry',
  'eintopf': 'stew',
  
  // Attribute
  'warm': 'hot',
  'kalt': 'cold',
  'schnell': 'quick',
  'einfach': 'easy',
};

export function translateQueryToEnglish(germanQuery: string): string {
  let query = germanQuery.toLowerCase();
  
  // Sortiere nach Länge (längere zuerst, um "low carb" vor "carb" zu matchen)
  const sortedKeys = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);
  
  for (const german of sortedKeys) {
    const english = KEYWORD_MAP[german];
    query = query.replace(new RegExp(german, 'gi'), english);
  }
  
  return query.trim();
}

export function extractFiltersFromQuery(query: string): {
  diet?: string;
  includeIngredients?: string[];
} {
  const filters: { diet?: string; includeIngredients?: string[] } = {};
  const lowerQuery = query.toLowerCase();
  
  // Diät erkennen
  if (lowerQuery.includes('high-protein') || lowerQuery.includes('protein')) {
    filters.diet = 'high-protein';
  } else if (lowerQuery.includes('vegetarian')) {
    filters.diet = 'vegetarian';
  } else if (lowerQuery.includes('vegan')) {
    filters.diet = 'vegan';
  }
  
  // Zutaten extrahieren
  const ingredientKeywords = ['rice', 'chicken', 'pasta', 'potato', 'salmon', 'beef', 'pork', 'tofu'];
  const foundIngredients = ingredientKeywords.filter(ing => lowerQuery.includes(ing));
  if (foundIngredients.length > 0) {
    filters.includeIngredients = foundIngredients;
  }
  
  return filters;
}
```

**1.2 Spoonacular Client**:
```typescript
// lib/api/spoonacular.ts

import { RecipeCard, RecipeNutrition, RecipeIngredient } from '@/types';
import { translateQueryToEnglish, extractFiltersFromQuery } from './query-translator';
import { recipeCache } from './recipe-cache';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

export async function searchRecipes(
  germanQuery: string,
  options: { number?: number } = {}
): Promise<RecipeCard[]> {
  // 1. Übersetzen
  const englishQuery = translateQueryToEnglish(germanQuery);
  const filters = extractFiltersFromQuery(englishQuery);
  
  // 2. Cache prüfen
  const cacheKey = `${englishQuery}-${JSON.stringify(filters)}`;
  const cached = recipeCache.get(cacheKey);
  if (cached) return cached;
  
  // 3. API-Call
  const params = new URLSearchParams({
    query: englishQuery,
    number: String(options.number || 3),
    addRecipeInformation: 'true',
    addRecipeNutrition: 'true',
    instructionsRequired: 'true',
    fillIngredients: 'true',
    ...(filters.diet && { diet: filters.diet }),
    ...(filters.includeIngredients && { includeIngredients: filters.includeIngredients.join(',') }),
  });
  
  const response = await fetch(
    `${SPOONACULAR_BASE_URL}/complexSearch?${params}`,
    {
      headers: {
        'x-api-key': process.env.SPOONACULAR_API_KEY!,
      },
    }
  );
  
  if (response.status === 402) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
  
  if (!response.ok) {
    throw new Error(`Spoonacular API error: ${response.status}`);
  }
  
  const data = await response.json();
  const recipes = data.results.map(transformSpoonacularRecipe);
  
  // 4. Cache speichern (24h)
  recipeCache.set(cacheKey, recipes);
  
  return recipes;
}

function transformSpoonacularRecipe(raw: any): RecipeCard {
  return {
    id: `recipe-${raw.id}`,
    title: raw.title,
    servings: raw.servings || 4,
    readyInMinutes: raw.readyInMinutes || 30,
    imageUrl: raw.image,
    sourceUrl: raw.sourceUrl,
    
    nutrition: validateNutrition(raw.nutrition?.nutrients),
    ingredients: (raw.extendedIngredients || []).map((ing: any) => ({
      id: `ing-${ing.id}`,
      name: ing.name,
      amount: ing.amount || 0,
      unit: ing.unit || '',
      original: ing.original || ing.name,
      isAvailable: false,  // Wird später durch Matching gesetzt
    })),
    
    instructions: extractInstructions(raw),
    cuisines: raw.cuisines || [],
    diets: raw.diets || [],
  };
}

function validateNutrition(nutrients: any[] | undefined): RecipeNutrition {
  if (!nutrients || !Array.isArray(nutrients)) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
  
  const findNutrient = (name: string): number => {
    const nutrient = nutrients.find(n => n.name?.toLowerCase() === name.toLowerCase());
    return nutrient?.amount ?? 0;
  };
  
  return {
    calories: Math.round(findNutrient('Calories')),
    protein: Math.round(findNutrient('Protein')),
    fat: Math.round(findNutrient('Fat')),
    carbs: Math.round(findNutrient('Carbohydrates')),
  };
}

function extractInstructions(raw: any): string {
  // Versuche strukturierte Instructions
  if (raw.analyzedInstructions?.[0]?.steps) {
    return raw.analyzedInstructions[0].steps
      .map((step: any) => `${step.number}. ${step.step}`)
      .join('\n');
  }
  
  // Fallback: HTML-Instructions (ohne Tags)
  if (raw.instructions) {
    return raw.instructions.replace(/<[^>]*>/g, '').trim();
  }
  
  return 'Keine Zubereitungsanleitung verfügbar.';
}
```

**1.3 Recipe Cache**:
```typescript
// lib/api/recipe-cache.ts

import { LRUCache } from 'lru-cache';
import { RecipeCard } from '@/types';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Stunden

export const recipeCache = new LRUCache<string, RecipeCard[]>({
  max: 100,  // Max 100 verschiedene Queries
  ttl: CACHE_TTL,
});
```

**Environment Variable**:
```bash
# .env.local
SPOONACULAR_API_KEY=your_key_here
```

---

### Phase 2: Batch-Embedding Ingredient Matching - 3h

**Ziel**: Alle Zutaten in EINEM API-Call einbetten, dann lokal matchen

**Neue Dateien**:
- `/lib/api/ingredient-matcher.ts`
- `/lib/ai/batch-embeddings.ts`

**2.1 Batch-Embeddings**:
```typescript
// lib/ai/batch-embeddings.ts

/**
 * Generiert Embeddings für mehrere Texte in EINEM API-Call
 * OpenRouter/OpenAI unterstützen Arrays als Input
 */
export async function createBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
  if (texts.length === 0) return [];
  
  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
      input: texts,  // Array statt einzelner String!
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // OpenRouter gibt Array von Embeddings zurück, sortiert nach Index
  return data.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => new Float32Array(item.embedding));
}
```

**2.2 Ingredient Matcher**:
```typescript
// lib/api/ingredient-matcher.ts

import { RecipeCard, RecipeIngredient, ProductCard } from '@/types';
import { createBatchEmbeddings } from '@/lib/ai/batch-embeddings';
import { loadOfferIndex } from '@/lib/search/semantic';
import { cosineSimilarity } from '@/lib/search/cosine';

const MIN_SIMILARITY_SCORE = 0.5;  // Threshold für Match

/**
 * Normalisiert Zutat für besseres Matching
 */
function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(fresh|organic|raw|cooked|chopped|diced|frisch|bio|gehackt)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matched ALLE Zutaten aller Rezepte in einem Batch
 */
export async function batchMatchIngredients(
  recipes: RecipeCard[],
  selectedMarkets: string[]
): Promise<RecipeCard[]> {
  // 1. Alle Zutaten sammeln
  const allIngredients: { recipeIdx: number; ingredientIdx: number; name: string }[] = [];
  
  recipes.forEach((recipe, recipeIdx) => {
    recipe.ingredients.forEach((ing, ingredientIdx) => {
      allIngredients.push({
        recipeIdx,
        ingredientIdx,
        name: normalizeIngredient(ing.name),
      });
    });
  });
  
  if (allIngredients.length === 0) return recipes;
  
  // 2. Offer-Index laden und nach Märkten filtern
  const offerIndex = await loadOfferIndex();
  const filteredOffers = offerIndex.filter(offer =>
    selectedMarkets.some(m => m.toLowerCase() === offer.market.toLowerCase())
  );
  
  if (filteredOffers.length === 0) return recipes;
  
  // 3. BATCH-Embedding für alle Zutaten (EIN API-Call!)
  const ingredientNames = allIngredients.map(i => i.name);
  const ingredientEmbeddings = await createBatchEmbeddings(ingredientNames);
  
  // 4. Für jede Zutat: Besten Match finden (lokal, schnell)
  const matchedRecipes = recipes.map(r => ({ ...r, ingredients: [...r.ingredients] }));
  
  allIngredients.forEach((item, idx) => {
    const ingredientVector = ingredientEmbeddings[idx];
    let bestMatch: { offer: typeof filteredOffers[0]; score: number } | null = null;
    
    for (const offer of filteredOffers) {
      const score = cosineSimilarity(ingredientVector, offer.vector);
      if (score >= MIN_SIMILARITY_SCORE && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { offer, score };
      }
    }
    
    // Match in Rezept eintragen
    const recipe = matchedRecipes[item.recipeIdx];
    const ingredient = recipe.ingredients[item.ingredientIdx];
    
    if (bestMatch) {
      ingredient.matchedOffer = {
        id: bestMatch.offer.id,
        name: bestMatch.offer.metadata.product_name,
        price: String(bestMatch.offer.metadata.price),
        market: bestMatch.offer.market,
        dateRange: bestMatch.offer.metadata.valid_from || '',
        brand: bestMatch.offer.metadata.brand,
        variant: bestMatch.offer.metadata.variant,
        pack_size: bestMatch.offer.metadata.pack_size,
        notes: bestMatch.offer.metadata.notes,
      };
      ingredient.isAvailable = true;
    }
  });
  
  return matchedRecipes;
}
```

**Performance-Analyse**:
```
3 Rezepte × 10 Zutaten = 30 Zutaten
├── Batch-Embedding: 1 API-Call (~500ms)
├── Vektor-Suche: 30 × ~1600 Offers = 48.000 Vergleiche (<50ms lokal)
└── Gesamt: ~550ms (statt 9+ Sekunden!)
```

---

### Phase 3: Vercel KV Monitoring - 2h

**Ziel**: Server-side Request-Tracking mit Vercel KV

**Setup**:
```bash
# 1. Vercel KV in Dashboard aktivieren
# 2. Environment Variables werden automatisch gesetzt:
#    - KV_REST_API_URL
#    - KV_REST_API_TOKEN
```

**Neue Datei**:
```typescript
// lib/api/recipe-monitor.ts

import { kv } from '@vercel/kv';

const DAILY_LIMIT = 150;
const WARNING_THRESHOLD = 120;

interface DailyStats {
  count: number;
  date: string;
}

function getTodayKey(): string {
  const today = new Date().toISOString().split('T')[0];
  return `spoonacular:daily:${today}`;
}

/**
 * Trackt API-Call und gibt aktuellen Count zurück
 */
export async function trackSpoonacularCall(): Promise<{ count: number; limitReached: boolean }> {
  const key = getTodayKey();
  
  // Atomic increment
  const count = await kv.incr(key);
  
  // TTL setzen (falls neu erstellt) - 48h für Sicherheit
  if (count === 1) {
    await kv.expire(key, 48 * 60 * 60);
  }
  
  // Warning loggen
  if (count >= WARNING_THRESHOLD) {
    console.warn(`⚠️ Spoonacular: ${count}/${DAILY_LIMIT} requests today`);
  }
  
  return {
    count,
    limitReached: count >= DAILY_LIMIT,
  };
}

/**
 * Prüft ob Limit erreicht BEVOR Call gemacht wird
 */
export async function checkSpoonacularLimit(): Promise<boolean> {
  const key = getTodayKey();
  const count = await kv.get<number>(key) || 0;
  return count >= DAILY_LIMIT;
}

/**
 * Holt aktuelle Stats (für Admin/Debug)
 */
export async function getSpoonacularStats(): Promise<DailyStats> {
  const key = getTodayKey();
  const count = await kv.get<number>(key) || 0;
  return {
    count,
    date: new Date().toISOString().split('T')[0],
  };
}
```

**Package Installation**:
```bash
npm install @vercel/kv
```

---

### Phase 4: Recipe Toggle Component - 1h

**Ziel**: Toggle NUR auf Welcome Screen

**Neue Datei**:
```typescript
// app/components/UI/RecipeToggle.tsx

'use client';

import { motion } from 'framer-motion';

interface RecipeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function RecipeToggle({ enabled, onChange }: RecipeToggleProps) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer select-none"
      style={{
        borderColor: enabled ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-border)',
        backgroundColor: enabled ? 'rgba(40, 167, 69, 0.1)' : 'var(--sparfuchs-surface)',
      }}
      onClick={() => onChange(!enabled)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <span className="text-2xl">🍳</span>
      
      {/* Text */}
      <div className="flex-1">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--sparfuchs-text)' }}>
          Rezept-Modus
        </h4>
        <p className="text-xs" style={{ color: 'var(--sparfuchs-text-light)' }}>
          Suche nach Rezepten statt Produkten
        </p>
      </div>
      
      {/* Toggle Switch */}
      <div
        className="relative w-12 h-6 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: enabled ? 'var(--sparfuchs-success)' : 'var(--sparfuchs-border)',
        }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ left: enabled ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.div>
  );
}
```

**Integration in page.tsx** (nur Welcome Screen):
```typescript
// app/page.tsx - Nur im Welcome Screen Block

{!chatStarted && (
  <motion.div key="welcome-screen" ...>
    <div className="max-w-2xl w-full px-6 mt-4 sm:mt-6">
      {/* Market Toggles */}
      <div className="mb-4">
        <MarketToggles ... />
      </div>
      
      {/* Recipe Toggle - NEU */}
      <div className="mb-4">
        <RecipeToggle
          enabled={recipeMode}
          onChange={setRecipeMode}
        />
      </div>
      
      {/* Central Input */}
      <div className="mb-6">
        <CentralInput ... />
      </div>
      
      {/* Welcome Messages */}
      ...
    </div>
  </motion.div>
)}
```

---

### Phase 5: RecipeCard Component - 3h

**Ziel**: UI-Komponente für Rezept-Darstellung (folgt ProductCard Pattern)

**Neue Datei**:
```typescript
// app/components/Chat/RecipeCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody, Divider, Badge, Button } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecipeCard as RecipeCardType, RecipeIngredient } from '@/types';

interface RecipeCardProps {
  recipe: RecipeCardType;
  onAddAllToList?: (ingredients: RecipeIngredient[]) => void;
  onSaveRecipe?: (recipe: RecipeCardType) => void;
  isSaved?: boolean;
}

export function RecipeCard({ recipe, onAddAllToList, onSaveRecipe, isSaved = false }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const availableIngredients = recipe.ingredients.filter(ing => ing.isAvailable);
  const availableCount = availableIngredients.length;
  const totalCount = recipe.ingredients.length;
  
  const handleAddAll = () => {
    if (onAddAllToList && availableIngredients.length > 0) {
      onAddAllToList(availableIngredients);
    }
  };
  
  return (
    <Card className="w-full border border-black shadow-md">
      {/* Header mit Bild */}
      <CardHeader className="p-0 flex-col items-start">
        {recipe.imageUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            {/* Save Button Overlay */}
            <motion.button
              onClick={() => onSaveRecipe?.(recipe)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: isSaved ? 'var(--sparfuchs-success)' : 'rgba(255,255,255,0.9)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">{isSaved ? '❤️' : '🤍'}</span>
            </motion.button>
          </div>
        )}
        
        <div className="p-4 w-full">
          <h3 className="text-xl font-bold text-gray-800">{recipe.title}</h3>
          
          {/* Meta Info */}
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>👥 {recipe.servings} Portionen</span>
            <span>⏱️ {recipe.readyInMinutes} Min</span>
          </div>
        </div>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="p-4">
        {/* Nutrition Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge color="success" variant="flat">
            {recipe.nutrition.calories} kcal
          </Badge>
          <Badge color="primary" variant="flat">
            {recipe.nutrition.protein}g Protein
          </Badge>
          <Badge color="default" variant="flat">
            {recipe.nutrition.fat}g Fett
          </Badge>
          <Badge color="default" variant="flat">
            {recipe.nutrition.carbs}g Kohlenhydrate
          </Badge>
        </div>
        
        {/* Zutaten */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">
            Zutaten ({availableCount}/{totalCount} verfügbar)
          </h4>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.id}
                className="flex justify-between items-center text-sm py-1 border-b border-gray-100"
              >
                <span className={ing.isAvailable ? 'text-gray-800' : 'text-gray-400'}>
                  {ing.amount > 0 && `${ing.amount} ${ing.unit} `}
                  {ing.name}
                </span>
                {ing.isAvailable && ing.matchedOffer ? (
                  <span className="text-green-600 text-xs font-medium">
                    ✓ {ing.matchedOffer.market} • {ing.matchedOffer.price}€
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">nicht verfügbar</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Zubereitung (collapsible) */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? '▼' : '▶'} Zubereitung {isExpanded ? 'ausblenden' : 'anzeigen'}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {recipe.instructions}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardBody>
      
      <Divider />
      
      {/* Action Buttons */}
      <div className="p-4 flex gap-2">
        <Button
          color="primary"
          className="flex-1"
          onPress={handleAddAll}
          isDisabled={availableCount === 0}
        >
          🛒 Zutaten hinzufügen ({availableCount}/{totalCount})
        </Button>
      </div>
    </Card>
  );
}
```

---

### Phase 6: API Route Integration - 3h

**Ziel**: `/api/chat/route.ts` erweitern für Recipe Mode

**Modifikationen in `app/api/chat/route.ts`**:

```typescript
// app/api/chat/route.ts - ERWEITERT

import { searchRecipes } from '@/lib/api/spoonacular';
import { batchMatchIngredients } from '@/lib/api/ingredient-matcher';
import { checkSpoonacularLimit, trackSpoonacularCall } from '@/lib/api/recipe-monitor';
import type { ChatRequest, RecipeCard } from '@/types';

// ... bestehender Code ...

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body: ChatRequest = await request.json();
    const { message, selectedMarkets, recipeMode } = body;
    
    // ... bestehende Validierung ...
    
    // NEUER BRANCH: Recipe Mode
    if (recipeMode) {
      return handleRecipeMode(message, validSelectedMarkets);
    }
    
    // ... bestehender Product Search Code ...
  } catch (error) {
    // ... bestehende Error Handling ...
  }
}

/**
 * NEU: Recipe Mode Handler
 */
async function handleRecipeMode(query: string, markets: string[]) {
  try {
    // 1. Rate Limit prüfen
    const limitReached = await checkSpoonacularLimit();
    if (limitReached) {
      return createErrorResponse('Rezept-Limit für heute erreicht. Bitte versuche es morgen erneut.');
    }
    
    // 2. Rezepte suchen
    const recipes = await searchRecipes(query, { number: 3 });
    
    // 3. API-Call tracken
    await trackSpoonacularCall();
    
    // 4. Keine Rezepte gefunden
    if (recipes.length === 0) {
      return createStreamResponse('Leider habe ich keine passenden Rezepte gefunden. Versuche es mit anderen Begriffen.');
    }
    
    // 5. Zutaten matchen (Batch!)
    const matchedRecipes = await batchMatchIngredients(recipes, markets);
    
    // 6. Response erstellen (DIREKT, ohne AI)
    return createRecipeStreamResponse(matchedRecipes, query);
    
  } catch (error) {
    console.error('Recipe Mode Error:', error);
    return createErrorResponse('Fehler bei der Rezeptsuche. Bitte versuche es erneut.');
  }
}

/**
 * Erstellt Stream-Response mit RECIPE_CARD Zeilen
 */
function createRecipeStreamResponse(recipes: RecipeCard[], query: string) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Intro-Text
      const intro = `Ich habe ${recipes.length} Rezepte für "${query}" gefunden:\n\n`;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: intro })}\n\n`));
      
      // Jedes Rezept als RECIPE_CARD
      recipes.forEach((recipe) => {
        const cardLine = `RECIPE_CARD: ${JSON.stringify(recipe)}\n`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cardLine })}\n\n`));
      });
      
      // Done Signal
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders,
    },
  });
}

function createErrorResponse(message: string) {
  return createStreamResponse(message);
}

function createStreamResponse(message: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: message })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      ...corsHeaders,
    },
  });
}
```

---

### Phase 7: ChatMessage RECIPE_CARD Parsing - 2h

**Ziel**: ChatMessage Component erweitern

**Modifikationen in `app/components/Chat/ChatMessage.tsx`**:

```typescript
// app/components/Chat/ChatMessage.tsx - ERWEITERT

import { RecipeCard } from './RecipeCard';
import type { RecipeCard as RecipeCardType, RecipeIngredient } from '@/types';

interface ChatMessageProps {
  message: Message & { isStreaming?: boolean };
  selectedMarkets: string[];
  onAddToList?: (product: ProductData) => void;
  isInList?: (productId: string) => boolean;
  // NEU: Recipe Handlers
  onAddAllIngredientsToList?: (ingredients: RecipeIngredient[]) => void;
  onSaveRecipe?: (recipe: RecipeCardType) => void;
  isSavedRecipe?: (recipeId: string) => boolean;
}

// In parseMessageContent() erweitern:
const parseMessageContent = (content: string) => {
  const parts: (string | ProductData | RecipeCardType)[] = [];
  
  // ... bestehender Code ...
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // BESTEHEND: Product Card
    if (line.startsWith('PRODUCT_CARD: ')) {
      // ... bestehender Code ...
    }
    // NEU: Recipe Card
    else if (line.startsWith('RECIPE_CARD: ')) {
      if (currentTextBuffer.trim()) {
        parts.push(currentTextBuffer.trim());
        currentTextBuffer = '';
      }
      
      try {
        const jsonString = line.substring('RECIPE_CARD: '.length);
        const recipeData: RecipeCardType = JSON.parse(jsonString);
        parts.push(recipeData);
      } catch (error) {
        console.error('Failed to parse RECIPE_CARD:', error);
        currentTextBuffer += line + '\n';
      }
    }
    else {
      currentTextBuffer += line + '\n';
    }
  }
  
  // ...
};

// In Render erweitern:
// Nach Product Card Rendering, VOR return:
if ('nutrition' in part && 'ingredients' in part) {
  // Es ist ein Recipe
  return (
    <RecipeCard
      key={`recipe-${index}`}
      recipe={part as RecipeCardType}
      onAddAllToList={onAddAllIngredientsToList}
      onSaveRecipe={onSaveRecipe}
      isSaved={isSavedRecipe ? isSavedRecipe((part as RecipeCardType).id) : false}
    />
  );
}
```

---

### Phase 8: Shopping List Integration für Rezept-Zutaten - 2h

**Ziel**: Bulk-Add für Rezept-Zutaten

**In `app/page.tsx`**:

```typescript
// app/page.tsx - ERWEITERT

import type { RecipeIngredient, RecipeCard as RecipeCardType } from '@/types';

// Neuer State
const [recipeMode, setRecipeMode] = useState(false);

// Handler für Bulk-Add
const handleAddAllIngredientsToList = useCallback((ingredients: RecipeIngredient[]) => {
  let addedCount = 0;
  
  ingredients.forEach((ingredient) => {
    if (ingredient.isAvailable && ingredient.matchedOffer) {
      const success = addItem(ingredient.matchedOffer);
      if (success) addedCount++;
    }
  });
  
  if (addedCount > 0) {
    success(`${addedCount} Zutaten zur Einkaufsliste hinzugefügt!`);
  }
}, [addItem, success]);

// In handleSendMessage erweitern:
const handleSendMessage = async (message: string) => {
  // ... bestehender Code ...
  
  body: JSON.stringify({
    message: message.trim(),
    selectedMarkets: selectedMarkets,
    useSemanticSearch: true,
    recipeMode: recipeMode,  // NEU
  }),
  
  // ...
};

// Props an ChatMessage weitergeben:
<ChatMessage
  // ... bestehende Props ...
  onAddAllIngredientsToList={handleAddAllIngredientsToList}
  onSaveRecipe={handleSaveRecipe}
  isSavedRecipe={isSavedRecipe}
/>
```

---

### Phase 9: Recipe Storage (useSavedRecipes Hook) - 2h

**Ziel**: Rezepte in localStorage speichern

**Neue Dateien**:
- `/lib/hooks/useSavedRecipes.ts`
- `/lib/utils/localStorage.ts` erweitern

**9.1 localStorage erweitern**:
```typescript
// lib/utils/localStorage.ts - ERWEITERN

export const STORAGE_KEYS = {
  SHOPPING_LIST: 'sparfuchs_shopping_list',
  WISHLIST: 'sparfuchs_wishlist',
  SAVED_RECIPES: 'sparfuchs_saved_recipes',  // NEU
} as const;

// NEU: Recipe Storage
export const savedRecipesStorage = {
  get(): SavedRecipe[] {
    const service = getStorageService();
    return service.getItem<SavedRecipe[]>(STORAGE_KEYS.SAVED_RECIPES) || [];
  },
  
  set(recipes: SavedRecipe[]): boolean {
    const service = getStorageService();
    return service.setItem(STORAGE_KEYS.SAVED_RECIPES, recipes);
  },
  
  clear(): void {
    const service = getStorageService();
    service.removeItem(STORAGE_KEYS.SAVED_RECIPES);
  },
};
```

**9.2 useSavedRecipes Hook**:
```typescript
// lib/hooks/useSavedRecipes.ts

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RecipeCard, SavedRecipe } from '@/types';
import { savedRecipesStorage } from '@/lib/utils/localStorage';

export function useSavedRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load on mount
  useEffect(() => {
    const stored = savedRecipesStorage.get();
    setRecipes(stored);
    setIsLoaded(true);
  }, []);
  
  // Debounced save
  const saveToStorage = useCallback((recipesToSave: SavedRecipe[]) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      savedRecipesStorage.set(recipesToSave);
    }, 300);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);
  
  const saveRecipe = useCallback((recipe: RecipeCard): boolean => {
    const exists = recipes.some(r => r.recipe.id === recipe.id);
    if (exists) return false;
    
    const newSaved: SavedRecipe = {
      recipe,
      savedAt: Date.now(),
    };
    const newRecipes = [...recipes, newSaved];
    setRecipes(newRecipes);
    saveToStorage(newRecipes);
    return true;
  }, [recipes, saveToStorage]);
  
  const removeRecipe = useCallback((recipeId: string) => {
    const filtered = recipes.filter(r => r.recipe.id !== recipeId);
    setRecipes(filtered);
    saveToStorage(filtered);
  }, [recipes, saveToStorage]);
  
  const isSaved = useCallback((recipeId: string): boolean => {
    return recipes.some(r => r.recipe.id === recipeId);
  }, [recipes]);
  
  const clearAll = useCallback(() => {
    setRecipes([]);
    savedRecipesStorage.clear();
  }, []);
  
  const recipeCount = useMemo(() => recipes.length, [recipes]);
  
  return {
    recipes,
    recipeCount,
    isLoaded,
    saveRecipe,
    removeRecipe,
    isSaved,
    clearAll,
  };
}
```

**Integration in page.tsx**:
```typescript
// app/page.tsx

import { useSavedRecipes } from '@/lib/hooks/useSavedRecipes';

// Im Component:
const { saveRecipe, removeRecipe, isSaved: isSavedRecipe } = useSavedRecipes();

const handleSaveRecipe = useCallback((recipe: RecipeCardType) => {
  if (isSavedRecipe(recipe.id)) {
    removeRecipe(recipe.id);
  } else {
    const saved = saveRecipe(recipe);
    if (saved) {
      success('Rezept gespeichert!');
    }
  }
}, [saveRecipe, removeRecipe, isSavedRecipe, success]);
```

---

### Phase 10: Testing & Polish - 3h

**Ziel**: Feature testen und UI feinschliff

**Test-Checkliste**:
```markdown
## Funktionale Tests
- [ ] Recipe Toggle aktivieren
- [ ] Deutsche Query eingeben ("proteinreiche Gerichte mit Reis")
- [ ] 3 Rezepte werden angezeigt
- [ ] Nährwerte sind sichtbar (nicht 0/0/0/0)
- [ ] Zutaten zeigen verfügbare Matches
- [ ] "Zutaten hinzufügen" Button funktioniert
- [ ] Toast erscheint nach Add
- [ ] Rezept speichern (Herz-Button)
- [ ] Zubereitung ein-/ausklappen

## Edge Cases
- [ ] Query ohne Ergebnis → Meldung
- [ ] Alle Zutaten unavailable → Button disabled
- [ ] Rate Limit erreicht → Meldung
- [ ] Netzwerk-Fehler → Meldung

## Mobile
- [ ] RecipeCard responsive
- [ ] Toggle funktioniert
- [ ] Scroll-Verhalten OK
```

**UI Polish**:
- Loading Skeleton während Suche
- Smooth Animations für RecipeCard
- Mobile-optimierte Ingredient-Liste

---

## Datei-Übersicht

### Neue Dateien
| Datei | Lines (ca.) | Phase |
|-------|-------------|-------|
| `lib/api/spoonacular.ts` | 120 | 1 |
| `lib/api/recipe-cache.ts` | 15 | 1 |
| `lib/api/query-translator.ts` | 60 | 1 |
| `lib/api/ingredient-matcher.ts` | 90 | 2 |
| `lib/ai/batch-embeddings.ts` | 35 | 2 |
| `lib/api/recipe-monitor.ts` | 50 | 3 |
| `app/components/UI/RecipeToggle.tsx` | 55 | 4 |
| `app/components/Chat/RecipeCard.tsx` | 180 | 5 |
| `lib/hooks/useSavedRecipes.ts` | 80 | 9 |
| **Gesamt NEU** | **~685** | |

### Zu modifizierende Dateien
| Datei | Änderungen | Phase |
|-------|------------|-------|
| `types/index.ts` | +80 lines (Recipe Types + ProductCard konsolidieren) | 0 |
| `app/components/Chat/ProductCard.tsx` | -15 lines (Interface entfernen) | 0 |
| `app/api/chat/route.ts` | +100 lines (Recipe Mode Handler) | 6 |
| `app/components/Chat/ChatMessage.tsx` | +40 lines (RECIPE_CARD Parsing) | 7 |
| `app/page.tsx` | +50 lines (State + Handlers) | 4, 8 |
| `lib/utils/localStorage.ts` | +15 lines (savedRecipesStorage) | 9 |
| **Gesamt MOD** | **~300** | |

---

## Environment Variables

```bash
# .env.local - HINZUFÜGEN

# Spoonacular API
SPOONACULAR_API_KEY=your_key_here

# Vercel KV (automatisch gesetzt nach Aktivierung)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

---

## Zeitplan (Optimiert)

| Woche | Phasen | Stunden |
|-------|--------|---------|
| **1** | Phase 0 (Types) + Phase 1 (Spoonacular) + Phase 2 (Batch-Matching) | 6h |
| **2** | Phase 3 (Monitoring) + Phase 4 (Toggle) + Phase 5 (RecipeCard) | 6h |
| **3** | Phase 6 (API Route) + Phase 7 (Parsing) + Phase 8 (Shopping List) | 7h |
| **4** | Phase 9 (Storage) + Phase 10 (Testing) | 5h |
| **Total** | | **~24h** |

---

## Success Criteria

- [ ] Recipe Toggle funktioniert auf Welcome Screen
- [ ] Deutsche Queries werden korrekt übersetzt
- [ ] Rezepte zeigen Nährwerte (nicht 0)
- [ ] Batch-Embedding < 1 Sekunde für alle Zutaten
- [ ] Mind. 50% Zutaten werden gematcht
- [ ] "Alle Zutaten hinzufügen" funktioniert
- [ ] Rezepte können gespeichert werden
- [ ] Vercel KV trackt API-Calls korrekt
- [ ] Response Zeit < 3 Sekunden gesamt
- [ ] Keine Build-Fehler nach Type-Konsolidierung
