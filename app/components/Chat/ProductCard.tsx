'use client';

import { Card, CardHeader, CardBody, Divider } from "@heroui/react";
import { AddToListButton } from './AddToListButton';
import { isAppPrice } from '@/lib/utils/helpers';

export interface ProductData {
  name: string;
  price: string;
  market: string;
  dateRange: string;
  id: string;
  brand?: string;
  variant?: string;
  pack_size?: string;
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
    <Card
      isPressable
      onPress={handleAddToList}
      disableRipple={true}
      className="w-full border border-black shadow-md hover:shadow-lg transition-shadow"
    >
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
          <div className="flex flex-col gap-1 flex-1 min-w-0 items-center text-center">
            {product.brand && (
              <span className="text-sm font-medium text-gray-800 uppercase tracking-wide">
                {product.brand}
              </span>
            )}
            <h4 className="text-lg font-semibold text-gray-800 leading-tight">
              {product.name}
            </h4>

            {/* Size and Variant Display - Size first, then Variant */}
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
              {product.pack_size && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {product.pack_size}
                </span>
              )}
              {product.variant && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {product.variant}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="pt-3">
        <div className="mb-2 text-center">
          <span className="text-2xl font-bold text-green-600">
            {product.price} €
          </span>
          {isAppPrice(product.notes) && (
            <div className="mt-1 text-sm text-gray-600" title="Nur mit Supermarkt-App">
              📱 *App-Preis
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}