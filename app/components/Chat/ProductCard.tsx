'use client';

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";

export interface ProductData {
  name: string;
  price: string;
  market: string;
  dateRange: string;
  id: string;
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
    <Card className="mb-4 max-w-md shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <h4 className="text-lg font-semibold text-gray-800 leading-tight">
          {product.name}
        </h4>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-orange-600">
            {product.price} €
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMarketColor(product.market)}`}>
            {product.market}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center">
          <span className="mr-1">📅</span>
          <span>{product.dateRange}</span>
        </div>
      </CardBody>
    </Card>
  );
}