'use client';

import { useState } from 'react';
import type { Product, ProductVariant } from '@csz/types';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { VariantSelector } from '@/components/product/VariantSelector';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="space-y-6">
      {hasVariants && (
        <VariantSelector
          variants={product.variants!}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />
      )}

      <AddToCartButton
        product={product}
        variant={selectedVariant}
        requiresVariant={hasVariants}
      />
    </div>
  );
}
