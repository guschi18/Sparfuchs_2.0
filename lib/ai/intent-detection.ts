/**
 * Intent-Detection Service für Sparfuchs Produktsuche
 * 
 * Erkennt Benutzer-Intent und mappt auf relevante Produktkategorien
 * für präzisere KI-Suche ohne zusätzliche Token-Kosten.
 * 
 * UPGRADED: Jetzt mit automatisch generierten Intent-Mappings!
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

interface IntentMappingsData {
  mappings: Record<string, IntentMapping>;
  generatedAt: string;
  sourceVersion: string;
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
  private dynamicMappings: Record<string, IntentMapping> | null = null;

  static getInstance(): IntentDetectionService {
    if (!IntentDetectionService.instance) {
      IntentDetectionService.instance = new IntentDetectionService();
    }
    return IntentDetectionService.instance;
  }

  /**
   * Lädt dynamische Intent-Mappings (generiert aus categories.json)
   */
  private loadDynamicMappings(): Record<string, IntentMapping> {
    if (this.dynamicMappings) {
      return this.dynamicMappings;
    }

    try {
      const mappingsPath = join(process.cwd(), 'lib', 'data', 'intent-mappings.json');
      const fileContent = readFileSync(mappingsPath, 'utf-8');
      const mappingsData: IntentMappingsData = JSON.parse(fileContent);
      
      this.dynamicMappings = mappingsData.mappings;
      console.log(`🎯 Loaded ${Object.keys(this.dynamicMappings).length} dynamic intent mappings`);
      
      return this.dynamicMappings;
    } catch (error) {
      console.warn('⚠️ Dynamic intent mappings not found, using static fallback');
      return {};
    }
  }

  /**
   * Kombiniert statische und dynamische Intent-Mappings
   */
  private getAllMappings(): Record<string, IntentMapping> {
    const dynamicMappings = this.loadDynamicMappings();
    
    // Dynamische Mappings haben Vorrang, statische als Fallback
    return {
      ...INTENT_MAPPINGS, // Statische Basis-Mappings
      ...dynamicMappings  // Dynamische Mappings überschreiben statische
    };
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

    // Durchsuche alle Intent-Mappings (statische + dynamische)
    const allMappings = this.getAllMappings();
    for (const [intentKey, mapping] of Object.entries(allMappings)) {
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
    const allMappings = this.getAllMappings();
    return Object.keys(allMappings);
  }

  /**
   * Debug-Methode: Intent-Details abrufen
   */
  getIntentDetails(intentKey: string): IntentMapping | null {
    const allMappings = this.getAllMappings();
    return allMappings[intentKey] || null;
  }

  /**
   * Debug-Methode: Statistiken über Intent-Mappings
   */
  getIntentStats(): { static: number; dynamic: number; total: number; lastGenerated?: string } {
    const staticCount = Object.keys(INTENT_MAPPINGS).length;
    const dynamicMappings = this.loadDynamicMappings();
    const dynamicCount = Object.keys(dynamicMappings).length;
    
    return {
      static: staticCount,
      dynamic: dynamicCount,
      total: staticCount + dynamicCount,
      lastGenerated: this.dynamicMappings ? 'loaded' : 'not available'
    };
  }

  /**
   * Neue Intent-Mappings zur Laufzeit hinzufügen
   */
  addIntentMapping(intentKey: string, mapping: IntentMapping): void {
    // Füge zu den dynamischen Mappings hinzu (falls geladen)
    if (this.dynamicMappings) {
      this.dynamicMappings[intentKey] = mapping;
    } else {
      // Fallback: zu statischen Mappings hinzufügen
      INTENT_MAPPINGS[intentKey] = mapping;
    }
  }

  /**
   * Cache für dynamische Mappings leeren (z.B. nach Update)
   */
  clearDynamicCache(): void {
    this.dynamicMappings = null;
    console.log('🔄 Dynamic intent mappings cache cleared');
  }
}

// Export für einfache Nutzung
export const intentDetection = IntentDetectionService.getInstance();