/**
 * Intent-Detection Service für Sparfuchs Produktsuche
 * 
 * Erkennt Benutzer-Intent und mappt auf relevante Produktkategorien
 * für präzisere KI-Suche ohne zusätzliche Token-Kosten.
 */

export interface Intent {
  primaryIntent: string;
  includeCategories: string[];
  excludeCategories: string[];
  keywords: string[];
  confidence: number;
}

export interface IntentMapping {
  patterns: string[];
  includeCategories: string[];
  excludeCategories: string[];
  keywords: string[];
  priority: number;
}

/**
 * Statische Intent-Mappings für häufige Suchanfragen
 */
const INTENT_MAPPINGS: Record<string, IntentMapping> = {
  // BUTTER - Streichfett/Margarine (NICHT Backwaren!)
  'butter': {
    patterns: ['butter', 'streichfett', 'margarine', 'butterfett'],
    includeCategories: [
      'Milchprodukte (Butter)',
      'Butter/Margarine', 
      'Milchprodukte/Butter',
      'Butter & Margarine'
    ],
    excludeCategories: [
      'Backwaren',
      'Gebäck', 
      'Süßwaren',
      'Kekse',
      'Buttergebäck',
      'Desserts'
    ],
    keywords: ['streichfett', 'margarine', 'butterfett', 'kräuterbutter'],
    priority: 10
  },

  // MILCH - Trinkmilch (NICHT Joghurt/Desserts!)
  'milch': {
    patterns: ['milch', 'trinkmilch', 'vollmilch', 'frischmilch', 'landmilch'],
    includeCategories: [
      'Milchprodukte',
      'Getränke',
      'Milchprodukte/Getränke',
      'Milch & Milchprodukte'
    ],
    excludeCategories: [
      'Joghurt',
      'Desserts',
      'Speisequark',
      'Pudding',
      'Fruchtbuttermilch',
      'Süßwaren'
    ],
    keywords: ['vollmilch', 'frischmilch', 'landmilch', 'trinkmilch', 'kuhmilch'],
    priority: 10
  },

  // FLEISCH - Echtes Fleisch (NICHT Haushaltsartikel!)
  'fleisch': {
    patterns: ['fleisch', 'hackfleisch', 'rindfleisch', 'schweinefleisch', 'geflügel'],
    includeCategories: [
      'Fleisch',
      'Fleisch/Rind',
      'Fleisch/Schwein', 
      'Fleisch/Geflügel',
      'Fleisch & Geflügel',
      'Fleisch & Rind',
      'Fleisch & Schwein'
    ],
    excludeCategories: [
      'Haushaltsartikel',
      'Reinigung',
      'Fisch',
      'Meeresfrüchte',
      'Geschirrspülmittel',
      'Putzmittel'
    ],
    keywords: ['hackfleisch', 'rindfleisch', 'schweinefleisch', 'hähnchen', 'geflügel', 'schnitzel'],
    priority: 10
  },

  // KÄSE - Käseprodukte
  'käse': {
    patterns: ['käse', 'cheese', 'gouda', 'emmental', 'cheddar'],
    includeCategories: [
      'Milchprodukte',
      'Käse',
      'Milchprodukte/Käse'
    ],
    excludeCategories: [
      'Süßwaren',
      'Desserts'
    ],
    keywords: ['gouda', 'emmental', 'cheddar', 'butterkäse', 'schnittkäse'],
    priority: 8
  },

  // ÄPFEL/OBST - Frisches Obst
  'obst': {
    patterns: ['äpfel', 'apfel', 'birnen', 'obst', 'früchte'],
    includeCategories: [
      'Obst',
      'Lebensmittel',
      'Frisches Obst'
    ],
    excludeCategories: [
      'Süßwaren',
      'Getränke',
      'Säfte'
    ],
    keywords: ['äpfel', 'birnen', 'bananen', 'orangen', 'frisches obst'],
    priority: 7
  }
};

export class IntentDetectionService {
  private static instance: IntentDetectionService;

  static getInstance(): IntentDetectionService {
    if (!IntentDetectionService.instance) {
      IntentDetectionService.instance = new IntentDetectionService();
    }
    return IntentDetectionService.instance;
  }

  /**
   * Hauptmethode: Intent aus Suchanfrage erkennen
   */
  detectIntent(query: string): Intent | null {
    if (!query || typeof query !== 'string') {
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch: { intent: string; mapping: IntentMapping; confidence: number } | null = null;

    // Durchsuche alle Intent-Mappings
    for (const [intentKey, mapping] of Object.entries(INTENT_MAPPINGS)) {
      const confidence = this.calculateConfidence(normalizedQuery, mapping);
      
      if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { intent: intentKey, mapping, confidence };
      }
    }

    // Nur Intent zurückgeben wenn Confidence hoch genug
    // FIXED: Threshold von 70% auf 40% reduziert (realistischer)
    if (bestMatch && bestMatch.confidence >= 0.4) {
      return {
        primaryIntent: bestMatch.intent,
        includeCategories: bestMatch.mapping.includeCategories,
        excludeCategories: bestMatch.mapping.excludeCategories,
        keywords: bestMatch.mapping.keywords,
        confidence: bestMatch.confidence
      };
    }

    return null;
  }

  /**
   * Confidence-Score für Intent-Matching berechnen
   */
  private calculateConfidence(query: string, mapping: IntentMapping): number {
    let score = 0;
    
    // FIXED: Korrekte maxScore-Berechnung
    // MaxScore = Beste mögliche Pattern-Übereinstimmung + alle Keywords
    const maxScore = mapping.priority + (mapping.keywords.length * 2);

    // Prüfe Pattern-Matches - nur das beste Match zählt
    let bestPatternScore = 0;
    for (const pattern of mapping.patterns) {
      let patternScore = 0;
      
      if (query === pattern) {
        // Exakte Übereinstimmung = höchste Punktzahl
        patternScore = mapping.priority;
      } else if (query.includes(pattern)) {
        // Teilübereinstimmung = reduzierte Punktzahl
        patternScore = mapping.priority * 0.8;
      } else if (pattern.includes(query) && query.length > 2) {
        // Query ist Teil des Patterns
        patternScore = mapping.priority * 0.6;
      }
      
      bestPatternScore = Math.max(bestPatternScore, patternScore);
    }
    score += bestPatternScore;

    // Prüfe Keyword-Matches - alle Keywords können matchen
    for (const keyword of mapping.keywords) {
      if (query.includes(keyword)) {
        score += 2;
      }
    }

    // Normalisiere auf 0-1 Skala
    return maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  }

  /**
   * Debug-Methode: Alle verfügbaren Intents anzeigen
   */
  getAvailableIntents(): string[] {
    return Object.keys(INTENT_MAPPINGS);
  }

  /**
   * Debug-Methode: Intent-Details abrufen
   */
  getIntentDetails(intentKey: string): IntentMapping | null {
    return INTENT_MAPPINGS[intentKey] || null;
  }

  /**
   * Neue Intent-Mappings zur Laufzeit hinzufügen
   */
  addIntentMapping(intentKey: string, mapping: IntentMapping): void {
    INTENT_MAPPINGS[intentKey] = mapping;
  }
}

// Export für einfache Nutzung
export const intentDetection = IntentDetectionService.getInstance();