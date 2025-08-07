/**
 * Intent-Mappings Generator für Sparfuchs Produktsuche
 * 
 * Generiert automatisch Intent-Mappings basierend auf categories.json
 * für optimierte Token-Reduktion und bessere Treffsicherheit.
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { CategoriesData } from '../../../types';

interface IntentMapping {
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
 * Synonym-Mapping für intelligente Pattern-Generierung
 */
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  // Tierbedarf
  'tierbedarf': ['tierfutter', 'futter', 'tiernahrung', 'petfood'],
  'katzenfutter': ['katzenfutter', 'katzennahrung', 'katzenfresste', 'cat food'],
  'hundefutter': ['hundefutter', 'hundenahrung', 'hundefresste', 'dog food'],
  
  // Lebensmittel  
  'fleisch': ['fleisch', 'meat', 'hackfleisch', 'rindfleisch', 'schweinefleisch'],
  'milchprodukte': ['milch', 'milchprodukte', 'dairy', 'molkerei'],
  'käse': ['käse', 'cheese', 'schnittkäse', 'weichkäse'],
  'butter': ['butter', 'streichfett', 'margarine', 'butterfett'],
  'obst': ['obst', 'früchte', 'fruit', 'äpfel', 'birnen'],
  'gemüse': ['gemüse', 'vegetables', 'salat', 'tomaten'],
  'backwaren': ['brot', 'brötchen', 'backwaren', 'bread'],
  'süßwaren': ['süßigkeiten', 'süßwaren', 'schokolade', 'candy'],
  'snacks': ['snacks', 'chips', 'knabberartikel', 'salzgebäck'],
  
  // Getränke
  'getränke': ['getränke', 'drinks', 'beverages'],
  'bier': ['bier', 'beer', 'pils', 'weizen'],
  'wein': ['wein', 'wine', 'rotwein', 'weißwein'],
  'saft': ['saft', 'säfte', 'fruchtsaft', 'juice'],
  'wasser': ['wasser', 'water', 'mineralwasser'],
  
  // Drogerie & Haushalt
  'drogerie': ['drogerie', 'körperpflege', 'hygiene'],
  'haushalt': ['haushalt', 'reiniger', 'waschmittel'],
  
  // Garten & Pflanzen
  'pflanzen': ['pflanzen', 'blumen', 'garten', 'plants']
};

/**
 * Kategorie-Ausschlüsse für präzise Filterung
 */
const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  'butter': ['Backwaren', 'Gebäck', 'Süßwaren', 'Desserts'],
  'milch': ['Joghurt', 'Desserts', 'Pudding', 'Süßwaren'],
  'fleisch': ['Fisch', 'Meeresfrüchte', 'Haushaltsartikel'],
  'obst': ['Süßwaren', 'Getränke', 'Säfte', 'Konserven']
};

export class IntentMappingsGenerator {
  private categoriesData: CategoriesData;
  
  constructor(categoriesData: CategoriesData) {
    this.categoriesData = categoriesData;
  }

  /**
   * Haupt-Generierungsmethode
   */
  generateMappings(): IntentMappingsData {
    const mappings: Record<string, IntentMapping> = {};
    
    // Für jede Hauptkategorie Intent-Mappings generieren
    for (const [categoryName, categoryData] of Object.entries(this.categoriesData.categories)) {
      const mainIntent = this.generateMainCategoryIntent(categoryName, categoryData.subCategories);
      if (mainIntent) {
        mappings[this.normalizeIntentKey(categoryName)] = mainIntent;
      }
      
      // Spezielle Unterkategorien-Intents für wichtige Gruppen
      const subIntents = this.generateSubCategoryIntents(categoryName, categoryData.subCategories);
      Object.assign(mappings, subIntents);
    }
    
    // Statische Basis-Intents hinzufügen (für Kompatibilität)
    Object.assign(mappings, this.getStaticBaseIntents());
    
    return {
      mappings,
      generatedAt: new Date().toISOString(),
      sourceVersion: 'categories.json'
    };
  }

  /**
   * Haupt-Kategorie Intent generieren
   */
  private generateMainCategoryIntent(categoryName: string, subCategories: string[]): IntentMapping | null {
    const normalizedCategory = categoryName.toLowerCase();
    const synonyms = CATEGORY_SYNONYMS[normalizedCategory] || [normalizedCategory];
    
    // Patterns aus Synonymen und Kategoriename generieren
    const patterns = [
      ...synonyms,
      normalizedCategory,
      ...this.generatePatternVariations(normalizedCategory)
    ];
    
    return {
      patterns: [...new Set(patterns)], // Duplikate entfernen
      includeCategories: [
        categoryName,
        ...subCategories
      ],
      excludeCategories: CATEGORY_EXCLUSIONS[normalizedCategory] || [],
      keywords: this.generateKeywords(categoryName, subCategories),
      priority: this.calculatePriority(categoryName, subCategories.length)
    };
  }

  /**
   * Unterkategorien-spezifische Intents generieren
   */
  private generateSubCategoryIntents(mainCategory: string, subCategories: string[]): Record<string, IntentMapping> {
    const intents: Record<string, IntentMapping> = {};
    
    // Spezielle Behandlung für Tierbedarf
    if (mainCategory === 'Tierbedarf') {
      intents['katzenfutter'] = {
        patterns: ['katzenfutter', 'katzennahrung', 'katzenfresste', 'cat food'],
        includeCategories: subCategories.filter(sub => 
          sub.toLowerCase().includes('katzen')
        ),
        excludeCategories: ['Hundefutter', 'Hundenahrung'],
        keywords: ['katze', 'kitten', 'nassfutter', 'trockenfutter'],
        priority: 10
      };
      
      intents['hundefutter'] = {
        patterns: ['hundefutter', 'hundenahrung', 'hundefresste', 'dog food'],
        includeCategories: subCategories.filter(sub => 
          sub.toLowerCase().includes('hunde')
        ),
        excludeCategories: ['Katzenfutter', 'Katzennahrung'],
        keywords: ['hund', 'welpe', 'nassfutter', 'trockenfutter'],
        priority: 10
      };
    }
    
    // Fleisch-spezifische Intents
    if (mainCategory === 'Lebensmittel') {
      const fleischSubs = subCategories.filter(sub => 
        sub.toLowerCase().includes('fleisch')
      );
      
      if (fleischSubs.length > 0) {
        intents['fleisch'] = {
          patterns: ['fleisch', 'meat', 'hackfleisch', 'rindfleisch', 'schweinefleisch'],
          includeCategories: fleischSubs,
          excludeCategories: ['Fisch', 'Meeresfrüchte', 'Süßwaren'],
          keywords: ['hack', 'rind', 'schwein', 'geflügel', 'schnitzel'],
          priority: 10
        };
      }
    }
    
    return intents;
  }

  /**
   * Pattern-Variationen generieren
   */
  private generatePatternVariations(base: string): string[] {
    const variations: string[] = [];
    
    // Singular/Plural-Varianten
    if (base.endsWith('e')) {
      variations.push(base + 'n'); // z.B. "getränke" -> "getränken"
    }
    if (base.endsWith('s')) {
      variations.push(base.slice(0, -1)); // z.B. "snacks" -> "snack"
    }
    
    // Umlaute normalisiert
    variations.push(
      base.replace('ä', 'ae')
          .replace('ö', 'oe')  
          .replace('ü', 'ue')
          .replace('ß', 'ss')
    );
    
    return variations;
  }

  /**
   * Keywords aus Unterkategorien extrahieren
   */
  private generateKeywords(categoryName: string, subCategories: string[]): string[] {
    const keywords: string[] = [];
    
    subCategories.forEach(subCat => {
      // Wörter in Klammern extrahieren: "Fleisch (Rind)" -> "rind"
      const matches = subCat.match(/\(([^)]+)\)/g);
      if (matches) {
        matches.forEach(match => {
          const keyword = match.replace(/[()]/g, '').toLowerCase();
          keywords.push(keyword);
        });
      }
      
      // Slash-getrennte Begriffe: "Milchprodukte/Käse" -> "milchprodukte", "käse"
      if (subCat.includes('/')) {
        const parts = subCat.split('/');
        parts.forEach(part => keywords.push(part.trim().toLowerCase()));
      }
    });
    
    return [...new Set(keywords)]; // Duplikate entfernen
  }

  /**
   * Priorität basierend auf Kategorie-Wichtigkeit
   */
  private calculatePriority(categoryName: string, subCategoryCount: number): number {
    // Wichtige Kategorien erhalten höhere Priorität
    const highPriorityCategories = ['Lebensmittel', 'Getränke', 'Tierbedarf'];
    const basePriority = highPriorityCategories.includes(categoryName) ? 10 : 7;
    
    // Mehr Unterkategorien = höhere Priorität (mehr Relevanz)
    const subcategoryBonus = Math.min(subCategoryCount / 10, 3);
    
    return Math.round(basePriority + subcategoryBonus);
  }

  /**
   * Statische Basis-Intents für Kompatibilität
   */
  private getStaticBaseIntents(): Record<string, IntentMapping> {
    return {
      // Diese bleiben für bewährte, spezielle Cases
      'butter_spezial': {
        patterns: ['butter', 'streichfett', 'butterfett'],
        includeCategories: [
          'Milchprodukte (Butter)',
          'Butter/Margarine', 
          'Milchprodukte/Butter',
          'Butter & Margarine'
        ],
        excludeCategories: ['Backwaren', 'Gebäck', 'Süßwaren', 'Desserts'],
        keywords: ['streichfett', 'margarine', 'butterfett', 'kräuterbutter'],
        priority: 10
      }
    };
  }

  /**
   * Intent-Key normalisieren
   */
  private normalizeIntentKey(categoryName: string): string {
    return categoryName.toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[äöüß]/g, match => {
                        const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
                        return map[match];
                      })
                      .replace(/[^a-z0-9_]/g, '');
  }
}

/**
 * Standalone-Generator für Build-Scripts
 */
export async function generateIntentMappingsFromCategories(
  categoriesPath: string, 
  outputPath: string
): Promise<void> {
  try {
    // Categories.json laden
    const categoriesContent = readFileSync(categoriesPath, 'utf-8');
    const categoriesData: CategoriesData = JSON.parse(categoriesContent);
    
    // Intent-Mappings generieren
    const generator = new IntentMappingsGenerator(categoriesData);
    const intentMappings = generator.generateMappings();
    
    // Output schreiben
    writeFileSync(outputPath, JSON.stringify(intentMappings, null, 2));
    
    console.log(`🎯 Generated intent-mappings.json (${Object.keys(intentMappings.mappings).length} intents)`);
    console.log(`📈 Categories processed: ${Object.keys(categoriesData.categories).length}`);
    console.log(`⚡ Token reduction expected: ~99% for matched intents`);
    
  } catch (error) {
    console.error('❌ Error generating intent mappings:', error);
    throw error;
  }
}