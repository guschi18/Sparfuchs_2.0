'use client';

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";

export interface ProductData {
  name: string;
  price: string;
  market: string;
  dateRange: string;
  id: string;
  brand?: string;
  uvp?: string;
  discount_pct?: number;
  notes?: string;
}

interface ProductCardProps {
  product: ProductData;
}

export function ProductCard({ product }: ProductCardProps) {
  // Markt-spezifische Farben
  const getMarketColor = (market: string): string => {
    const marketColors: { [key: string]: string } = {
      'Lidl': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'Aldi': 'bg-blue-100 border-blue-300 text-blue-800', 
      'Edeka': 'bg-green-100 border-green-300 text-green-800',
      'Penny': 'bg-orange-100 border-orange-300 text-orange-800',
      'Rewe': 'bg-red-100 border-red-300 text-red-800'
    };
    return marketColors[market] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <Card className="w-full border border-black shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          {product.brand && (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.brand}
            </span>
          )}
          <h4 className="text-lg font-semibold text-gray-800 leading-tight">
            {product.name}
          </h4>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="pt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-orange-600">
              {product.price} €
            </span>
            {product.uvp && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 line-through">
                  UVP {product.uvp} €
                </span>
                {product.discount_pct && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-300">
                    -{product.discount_pct}%
                  </span>
                )}
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMarketColor(product.market)}`}>
            {product.market}
          </span>
        </div>

        <div className="text-sm text-gray-600 flex items-center mb-2">
          <span className="mr-1">📅</span>
          <span>{product.dateRange}</span>
        </div>

        {product.notes && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <span className="mr-1">⚠️</span>
            {product.notes}
          </div>
        )}
      </CardBody>
    </Card>
  );
}