import { NextRequest, NextResponse } from 'next/server';
import { ProductDataService } from '../../../lib/data/product-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'categories':
        const categories = ProductDataService.getAllCategories();
        return NextResponse.json(categories);

      case 'markets':
        const markets = ProductDataService.getAllMarkets();
        return NextResponse.json(markets);

      case 'stats':
        const stats = ProductDataService.getStats();
        return NextResponse.json(stats);

      default:
        // Return all metadata
        const allData = {
          categories: ProductDataService.getAllCategories(),
          markets: ProductDataService.getAllMarkets(),
          stats: ProductDataService.getStats()
        };
        return NextResponse.json(allData);
    }

  } catch (error) {
    console.error('Meta API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}