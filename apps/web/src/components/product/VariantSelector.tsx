'use client';

import { useState, useMemo, useCallback } from 'react';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@csz/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  onSelect?: (variant: ProductVariant) => void;
  initialSelection?: Record<string, string>;
}

export function VariantSelector({
  variants,
  selectedVariant: controlledVariant,
  onSelect,
  initialSelection,
}: VariantSelectorProps) {
  const [internalVariant, setInternalVariant] = useState<ProductVariant | null>(null);
  const selectedVariant = controlledVariant !== undefined ? controlledVariant : internalVariant;

  // Detect multi-dimension mode
  const isMultiDimension = useMemo(
    () => variants.some((v) => v.attributes && v.attributes.length > 0),
    [variants],
  );

  // Extract dimensions: ordered list of { label, values[] }
  const dimensions = useMemo(() => {
    if (!isMultiDimension) return [];
    const dimMap = new Map<string, string[]>();
    for (const v of variants) {
      if (!v.attributes) continue;
      for (const attr of v.attributes) {
        if (!dimMap.has(attr.label)) {
          dimMap.set(attr.label, []);
        }
        const vals = dimMap.get(attr.label)!;
        if (!vals.includes(attr.value)) {
          vals.push(attr.value);
        }
      }
    }
    return Array.from(dimMap.entries()).map(([label, values]) => ({ label, values }));
  }, [variants, isMultiDimension]);

  // Track per-dimension selection
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (initialSelection && Object.keys(initialSelection).length > 0) return initialSelection;
    // Derive from selectedVariant if available
    if (selectedVariant?.attributes?.length) {
      const sel: Record<string, string> = {};
      for (const attr of selectedVariant.attributes) {
        sel[attr.label] = attr.value;
      }
      return sel;
    }
    return {};
  });

  // Find matching variant for a given selection
  const findVariant = useCallback(
    (sel: Record<string, string>): ProductVariant | null => {
      if (!dimensions.length) return null;
      // All dimensions must be selected
      if (Object.keys(sel).length < dimensions.length) return null;
      return (
        variants.find((v) => {
          if (!v.attributes || v.attributes.length !== dimensions.length) return false;
          return v.attributes.every((attr) => sel[attr.label] === attr.value);
        }) || null
      );
    },
    [variants, dimensions],
  );

  // Check if a value for a given dimension is available (at least one variant exists with current other selections + this value)
  const isValueAvailable = useCallback(
    (dimLabel: string, value: string): boolean => {
      const testSelection = { ...selection, [dimLabel]: value };
      // Check if at least one variant matches all selected dimensions in testSelection
      return variants.some((v) => {
        if (!v.attributes) return false;
        return Object.entries(testSelection).every(([label, val]) =>
          v.attributes!.some((a) => a.label === label && a.value === val),
        );
      });
    },
    [selection, variants],
  );

  const handleDimensionSelect = (dimLabel: string, value: string) => {
    const newSelection = { ...selection, [dimLabel]: value };
    setSelection(newSelection);

    const matched = findVariant(newSelection);
    if (matched) {
      if (onSelect) {
        onSelect(matched);
      } else {
        setInternalVariant(matched);
      }
    }
  };

  const handleLegacySelect = (variant: ProductVariant) => {
    if (onSelect) {
      onSelect(variant);
    } else {
      setInternalVariant(variant);
    }
  };

  if (!variants || variants.length === 0) {
    return null;
  }

  // Multi-dimension rendering
  if (isMultiDimension && dimensions.length > 0) {
    return (
      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.label} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{dim.label}</label>
            <div className="flex flex-wrap gap-2">
              {dim.values.map((value) => {
                const isSelected = selection[dim.label] === value;
                const available = isValueAvailable(dim.label, value);

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!available}
                    onClick={() => handleDimensionSelect(dim.label, value)}
                    className={cn(
                      'px-4 py-2.5 sm:py-2 text-sm font-medium rounded-full border transition-colors min-h-[44px] sm:min-h-0',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : available
                          ? 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                          : 'border-input bg-muted text-muted-foreground opacity-40 cursor-not-allowed',
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {selectedVariant && (
          <p className="text-sm text-muted-foreground">Készleten: {selectedVariant.stock} db</p>
        )}
      </div>
    );
  }

  // Legacy single-dimension rendering
  const label = variants[0]?.attributeLabel || 'Válasszon';

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?._id === variant._id;

          return (
            <button
              key={variant._id}
              type="button"
              onClick={() => handleLegacySelect(variant)}
              className={cn(
                'px-4 py-2.5 sm:py-2 text-sm font-medium rounded-full border transition-colors min-h-[44px] sm:min-h-0',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {variant.attributeValue || variant.name}
              {variant.price !== variants[0]?.price && (
                <span className="ml-1 text-xs opacity-75">({formatPrice(variant.price)})</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedVariant && (
        <p className="text-sm text-muted-foreground">Készleten: {selectedVariant.stock} db</p>
      )}
    </div>
  );
}
