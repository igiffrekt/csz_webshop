'use client';

import { ProductCardEnhanced } from './ProductCardEnhanced';
import type { Product } from '@csz/types';

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return null; // Parent handles empty state
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${
        columns === 4
          ? 'lg:grid-cols-3 xl:grid-cols-4'
          : 'lg:grid-cols-3'
      }`}
    >
      {products.map((product) => (
        <ProductCardEnhanced key={product.documentId} product={product} />
      ))}
    </div>
  );
}
