'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import type { Product, ProductVariant, StrapiMedia } from '@csz/types';
import { getStrapiMediaUrl } from '@/lib/formatters';
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
    const images: Array<StrapiMedia & { variantId?: number }> = [];

    // Add product images first
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        images.push({ ...img });
      });
    }

    // Add variant images (if not already included)
    if (product.variants) {
      product.variants.forEach(variant => {
        if (variant.image) {
          // Check if this image URL is already in the list
          const alreadyExists = images.some(img => img.url === variant.image!.url);
          if (!alreadyExists) {
            images.push({ ...variant.image, variantId: variant.id });
          }
        }
      });
    }

    return images;
  }, [product.images, product.variants]);

  // Placeholder if no images
  const displayImages = allImages.length > 0 ? allImages : [
    { id: 0, documentId: 'placeholder', url: '/placeholder.svg', alternativeText: product.name, name: 'placeholder' } as StrapiMedia
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
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Left: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={getStrapiMediaUrl(selectedImage.url)}
            alt={selectedImage.alternativeText || product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Thumbnail strip */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={`${image.id}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={cn(
                  'relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                  index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={getStrapiMediaUrl(image.url)}
                  alt={image.alternativeText || `${product.name} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
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
