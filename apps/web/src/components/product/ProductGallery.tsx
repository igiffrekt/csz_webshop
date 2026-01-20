'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getStrapiMediaUrl } from '@/lib/formatters';
import type { StrapiMedia } from '@csz/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: StrapiMedia[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : [
    { id: 0, documentId: 'placeholder', url: '/placeholder.svg', alternativeText: productName, name: 'placeholder' } as StrapiMedia
  ];

  const selectedImage = displayImages[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={getStrapiMediaUrl(selectedImage.url)}
          alt={selectedImage.alternativeText || productName}
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
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                index === selectedIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={getStrapiMediaUrl(image.url)}
                alt={image.alternativeText || `${productName} ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
