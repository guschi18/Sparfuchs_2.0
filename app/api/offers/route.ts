import { NextRequest, NextResponse } from 'next/server';
import { ProductDataService } from '../../../lib/data/product-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract specific offer parameters
    const market = searchParams.get('market');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'price'; // price, name, category
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // asc, desc
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    
    // Get base products
    let products = ProductDataService.getAllProducts().products;

    // Apply filters
    if (market) {
      products = products.filter(p => 
        p.supermarket.toLowerCase() === market.toLowerCase()
      );
    }

    if (category) {
      products = products.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase()) ||
        p.subCategory.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      products = products.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      products = products.filter(p => p.price <= max);
    }

    // Apply sorting
    products.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = a.price - b.price;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply limit
    const limitedProducts = products.slice(0, limit);

    // Calculate statistics
    const stats = {
      totalFound: products.length,
      returned: limitedProducts.length,
      priceRange: products.length > 0 ? {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
        avg: products.reduce((sum, p) => sum + p.price, 0) / products.length
      } : null,
      marketBreakdown: products.reduce((acc, p) => {
        acc[p.supermarket] = (acc[p.supermarket] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      offers: limitedProducts,
      stats,
      filters: {
        market,
        category,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Offers API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}