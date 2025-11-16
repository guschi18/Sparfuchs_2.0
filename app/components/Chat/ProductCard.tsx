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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between w-full gap-2">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {product.brand && (
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {product.brand}
              </span>
            )}
            <h4 className="text-lg font-semibold text-gray-800 leading-tight">
              {product.name}
            </h4>
          </div>

          {/* Add to List Button */}
          {onAddToList && (
            <div className="flex-shrink-0">
              <AddToListButton
                onAdd={handleAddToList}
                isInList={isInList}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="pt-3">
        <div className="mb-2">
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