'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import type { Product, ProductVariant } from '@csz/types';

interface ImageItem {
  _key?: string;
  url: string;
  alt?: string | null;
  width?: number;
  height?: number;
}
import { getImageUrl } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { VariantSelector } from '@/components/product/VariantSelector';

interface ProductDetailsProps {
  product: Product;
  children?: React.ReactNode;
}

/**
 * Client component that manages both gallery and variant selection state.
 * When a variant with an image is selected, the gallery shows that variant's image.
 */
export function ProductDetails({ product, children }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const hasVariants = product.variants && product.variants.length > 0;

  // Build the full list of images: product images + variant images
  const allImages = useMemo(() => {
    const images: Array<ImageItem & { variantId?: string }> = [];

    // Add product images
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        images.push({ ...img });
      });
    }

    // Add variant images (if not already included)
    if (product.variants) {
      product.variants.forEach(variant => {
        if (variant.image) {
          const alreadyExists = images.some(img => img.url === variant.image!.url);
          if (!alreadyExists) {
            images.push({ ...variant.image, variantId: variant._id });
          }
        }
      });
    }

    return images;
  }, [product.images, product.variants]);

  // Placeholder if no images
  const displayImages = allImages.length > 0 ? allImages : [
    { _key: 'placeholder', url: '/placeholder.svg', alt: product.name } as ImageItem
  ];

  // When variant selection changes, switch to that variant's image
  useEffect(() => {
    if (selectedVariant?.image) {
      // Find the index of the variant's image in allImages
      const variantImageIndex = allImages.findIndex(
        img => img.url === selectedVariant.image!.url
      );
      if (variantImageIndex !== -1) {
        setSelectedImageIndex(variantImageIndex);
      }
    }
  }, [selectedVariant, allImages]);

  const selectedImage = displayImages[selectedImageIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      {/* Left: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-[30px] bg-white">
          <Image
            src={getImageUrl(selectedImage.url)}
            alt={selectedImage.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4 sm:p-8"
            priority
          />
        </div>

        {/* Thumbnail strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
            {displayImages.map((image, index) => (
              <button
                key={`${image._key || index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  'relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all bg-white snap-start',
                  index === selectedImageIndex ? 'border-[#FFBB36] ring-2 ring-[#FFBB36]/20' : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={getImageUrl(image.url)}
                  alt={image.alt || `${product.name} ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-contain p-1.5 sm:p-2"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product info and actions */}
      <div className="space-y-6">
        {/* Server-rendered product info passed as children */}
        {children}

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
    </div>
  );
}
