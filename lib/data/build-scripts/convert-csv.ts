import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { 
  Product, 
  Recipe, 
  ProductsData, 
  CategoriesData, 
  MarketsData, 
  SearchIndex 
} from '../../../types';
import { generateIntentMappingsFromCategories } from './generate-intent-mappings';

const DATA_DIR = join(process.cwd(), 'data');
const OUTPUT_DIR = join(process.cwd(), 'lib', 'data');

export class CSVConverter {
  private products: Product[] = [];
  private recipes: Recipe[] = [];

  async convertAll(): Promise<void> {
    console.log('🔄 Starting CSV to JSON conversion...');
    
    // Load CSV files
    await this.loadProducts();
    await this.loadRecipes();
    
    // Generate optimized JSON files
    await this.generateProductsJSON();
    await this.generateCategoriesJSON();
    await this.generateMarketsJSON();
    await this.generateSearchIndex();
    
    // Generate intent mappings from categories (NEW!)
    await this.generateIntentMappings();
    
    console.log('✅ CSV conversion completed successfully!');
  }

  private async loadProducts(): Promise<void> {
    const csvPath = join(DATA_DIR, 'Angebote.csv');
    
    if (!existsSync(csvPath)) {
      throw new Error(`Products CSV not found: ${csvPath}`);
    }

    const csvContent = readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    this.products = records.map((record: any, index: number) => ({
      id: `product_${index + 1}`,
      productName: record.Produktname || '',
      category: record.Kategorie || '',
      subCategory: record.Unterkategorie || '',
      price: parseFloat(record.Preis_EUR) || 0,
      startDate: record.Startdatum || '',
      endDate: record.Enddatum || '',
      supermarket: record.Supermarkt || ''
    }));

    console.log(`📦 Loaded ${this.products.length} products`);
  }

  private async loadRecipes(): Promise<void> {
    const csvPath = join(DATA_DIR, 'More_Rezepte.csv');
    
    if (!existsSync(csvPath)) {
      console.log('⚠️ Recipes CSV not found, skipping...');
      return;
    }

    const csvContent = readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    this.recipes = records
      .filter((record: any) => record.Rezeptname && record.Rezeptname.trim())
      .map((record: any, index: number) => ({
        id: `recipe_${index + 1}`,
        recipeName: record.Rezeptname || '',
        overview: record.Overview || '',
        ingredients: record.Zutaten || '',
        preparation: record.Zubereitung || '',
        nutrition: record.Nährwerte || '',
        video: record.Video || undefined
      }));

    console.log(`🍳 Loaded ${this.recipes.length} recipes`);
  }

  private async generateProductsJSON(): Promise<void> {
    const productsData: ProductsData = {
      products: this.products,
      totalCount: this.products.length,
      lastUpdated: new Date().toISOString()
    };

    const outputPath = join(OUTPUT_DIR, 'products.json');
    writeFileSync(outputPath, JSON.stringify(productsData, null, 2));
    console.log(`📄 Generated products.json (${this.products.length} items)`);
  }

  private async generateCategoriesJSON(): Promise<void> {
    const categories: CategoriesData['categories'] = {};

    this.products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          subCategories: [],
          productCount: 0
        };
      }

      categories[product.category].productCount++;
      
      if (!categories[product.category].subCategories.includes(product.subCategory)) {
        categories[product.category].subCategories.push(product.subCategory);
      }
    });

    const categoriesData: CategoriesData = { categories };
    const outputPath = join(OUTPUT_DIR, 'categories.json');
    writeFileSync(outputPath, JSON.stringify(categoriesData, null, 2));
    
    const categoryCount = Object.keys(categories).length;
    console.log(`📂 Generated categories.json (${categoryCount} categories)`);
  }

  private async generateMarketsJSON(): Promise<void> {
    const markets: MarketsData['markets'] = {};

    this.products.forEach(product => {
      if (!markets[product.supermarket]) {
        markets[product.supermarket] = {
          productCount: 0,
          categories: []
        };
      }

      markets[product.supermarket].productCount++;
      
      if (!markets[product.supermarket].categories.includes(product.category)) {
        markets[product.supermarket].categories.push(product.category);
      }
    });

    const marketsData: MarketsData = { markets };
    const outputPath = join(OUTPUT_DIR, 'markets.json');
    writeFileSync(outputPath, JSON.stringify(marketsData, null, 2));
    
    const marketCount = Object.keys(markets).length;
    console.log(`🏪 Generated markets.json (${marketCount} markets)`);
  }

  private async generateSearchIndex(): Promise<void> {
    const searchIndex: SearchIndex = {
      byName: {},
      byCategory: {},
      byMarket: {},
      byPrice: {}
    };

    this.products.forEach(product => {
      // Index by name (split into words for better search)
      const nameWords = product.productName.toLowerCase().split(/\s+/);
      nameWords.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          if (!searchIndex.byName[word]) {
            searchIndex.byName[word] = [];
          }
          if (!searchIndex.byName[word].includes(product.id)) {
            searchIndex.byName[word].push(product.id);
          }
        }
      });

      // Index by category
      const categoryKey = product.category.toLowerCase();
      if (!searchIndex.byCategory[categoryKey]) {
        searchIndex.byCategory[categoryKey] = [];
      }
      searchIndex.byCategory[categoryKey].push(product.id);

      // Index by market
      const marketKey = product.supermarket.toLowerCase();
      if (!searchIndex.byMarket[marketKey]) {
        searchIndex.byMarket[marketKey] = [];
      }
      searchIndex.byMarket[marketKey].push(product.id);

      // Index by price range
      const priceRange = this.getPriceRange(product.price);
      if (!searchIndex.byPrice[priceRange]) {
        searchIndex.byPrice[priceRange] = [];
      }
      searchIndex.byPrice[priceRange].push(product.id);
    });

    const outputPath = join(OUTPUT_DIR, 'search-index.json');
    writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
    
    const indexSize = Object.keys(searchIndex.byName).length;
    console.log(`🔍 Generated search-index.json (${indexSize} search terms)`);
  }

  private getPriceRange(price: number): string {
    if (price < 1) return '0-1';
    if (price < 2) return '1-2';
    if (price < 5) return '2-5';
    if (price < 10) return '5-10';
    if (price < 20) return '10-20';
    return '20+';
  }

  /**
   * Generate intent mappings from categories (NEW!)
   */
  private async generateIntentMappings(): Promise<void> {
    try {
      const categoriesPath = join(OUTPUT_DIR, 'categories.json');
      const intentMappingsPath = join(OUTPUT_DIR, 'intent-mappings.json');
      
      await generateIntentMappingsFromCategories(categoriesPath, intentMappingsPath);
    } catch (error) {
      console.error('❌ Failed to generate intent mappings:', error);
      // Non-fatal error - continue with build
    }
  }
}

// Main execution
if (require.main === module) {
  const converter = new CSVConverter();
  converter.convertAll().catch(console.error);
}