'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@csz/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onSelect?: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, onSelect }: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!variants || variants.length === 0) {
    return null;
  }

  const handleSelect = (variant: ProductVariant) => {
    setSelectedId(variant.id);
    onSelect?.(variant);
  };

  // Group variants by attributeLabel if present
  const label = variants[0]?.attributeLabel;

  return (
    <div className="mt-4">
      {label && (
        <h3 className="text-sm font-medium mb-2">{label}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Button
            key={variant.id}
            variant={selectedId === variant.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSelect(variant)}
            className={cn(
              'min-w-[80px]',
              variant.stock === 0 && 'opacity-50'
            )}
            disabled={variant.stock === 0}
          >
            {variant.attributeValue || variant.name}
            <span className="ml-2 text-xs">
              {formatPrice(variant.price)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
