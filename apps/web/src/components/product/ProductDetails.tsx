'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const lightboxPrev = useCallback(() => {
    setSelectedImageIndex((i) => (i > 0 ? i - 1 : displayImages.length - 1));
  }, [displayImages.length]);

  const lightboxNext = useCallback(() => {
    setSelectedImageIndex((i) => (i < displayImages.length - 1 ? i + 1 : 0));
  }, [displayImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, lightboxPrev, lightboxNext]);

  return (
    <>
    {/* Lightbox */}
    {lightboxOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={() => setLightboxOpen(false)}
      >
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          onClick={() => setLightboxOpen(false)}
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {displayImages.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        <div
          className="relative w-[90vw] h-[90vh] max-w-[1200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={getImageUrl(selectedImage.url)}
            alt={selectedImage.alt || product.name}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      {/* Left: Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-[30px] bg-white cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
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
    </>
  );
}
