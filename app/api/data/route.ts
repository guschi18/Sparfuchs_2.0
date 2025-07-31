import { NextRequest, NextResponse } from 'next/server';
import { ProductDataService } from '../../../lib/data/product-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const query = searchParams.get('q') || '';
    const markets = searchParams.get('markets')?.split(',').filter(Boolean) || [];
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const priceRange = searchParams.get('priceRange') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const productId = searchParams.get('id');

    // Handle single product request
    if (productId) {
      const product = ProductDataService.getProductById(productId);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    // Handle search/filter request
    if (query || markets.length > 0 || categories.length > 0 || priceRange) {
      const results = ProductDataService.searchProducts(query, {
        markets,
        categories,
        priceRange,
        limit,
        offset
      });
      return NextResponse.json(results);
    }

    // Handle get all products
    const results = ProductDataService.getAllProducts(limit, offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}