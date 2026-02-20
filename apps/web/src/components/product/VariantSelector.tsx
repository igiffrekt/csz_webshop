'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@csz/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelect?: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants,
  selectedVariant: controlledVariant,
  onSelect,
}: VariantSelectorProps) {
  // Support both controlled and uncontrolled modes
  const [internalVariant, setInternalVariant] = useState<ProductVariant | null>(null);
  const selectedVariant = controlledVariant !== undefined ? controlledVariant : internalVariant;

  const handleSelect = (variant: ProductVariant) => {
    if (onSelect) {
      onSelect(variant);
    } else {
      setInternalVariant(variant);
    }
  };
  if (!variants || variants.length === 0) {
    return null;
  }

  // Group variants by attributeLabel if present
  const label = variants[0]?.attributeLabel || 'Valasszon';

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?._id === variant._id;

          return (
            <button
              key={variant._id}
              type="button"
              onClick={() => handleSelect(variant)}
              className={cn(
                'px-4 py-2.5 sm:py-2 text-sm font-medium rounded-full border transition-colors min-h-[44px] sm:min-h-0',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {variant.name || variant.attributeValue}
              {variant.price !== variants[0]?.price && (
                <span className="ml-1 text-xs opacity-75">
                  ({formatPrice(variant.price)})
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedVariant && (
        <p className="text-sm text-muted-foreground">
          Készleten: {selectedVariant.stock} db
        </p>
      )}
    </div>
  );
}
