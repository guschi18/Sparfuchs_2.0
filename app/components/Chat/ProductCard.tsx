'use client';

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { AddToListButton } from './AddToListButton';

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
  onAddToList?: (product: ProductData) => void;
  isInList?: boolean;
}

export function ProductCard({ product, onAddToList, isInList = false }: ProductCardProps) {
  const handleAddToList = () => {
    if (onAddToList) {
      onAddToList(product);
    }
  };

  return (
    <Card className="w-full border border-black shadow-md hover:shadow-lg transition-shadow">
       <div className="text-sm text-gray-600 flex items-center pt-1 pl-2 flex-nowrap">
          <span className="mr-1 flex-shrink-0">📅</span>
          <span className="flex-shrink-0 whitespace-nowrap">{product.dateRange}</span>
          {/* Add to List Button */}
          {onAddToList && (
            <div className="flex-shrink-0 ml-auto">
              <AddToListButton
                onAdd={handleAddToList}
                isInList={isInList}
              />
            </div>
          )}
        </div>
        
      <CardHeader className="pb-2">        
        <div className="flex items-start justify-between w-full gap-2">          
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {product.brand && (
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {product.brand}
              </span>
            )}
            <h4 className="text-lg font-semibold text-gray-800 leading-tight">
              {product.name}
            </h4>
          </div>

          
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="pt-3">
        <div className="mb-2">
          <span className="text-2xl font-bold text-green-600">
            {product.price} €
          </span>          
        </div>

       

      
      </CardBody>
    </Card>
  );
}