'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ImageAsset {
  _key?: string;
  url: string;
  alt?: string | null;
  width?: number;
  height?: number;
}

interface ProductGalleryProps {
  images: ImageAsset[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : [
    { _key: 'placeholder', url: '/placeholder.svg', alt: productName } as ImageAsset
  ];

  const selectedImage = displayImages[selectedIndex];

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:rounded-lg bg-gray-100">
        <Image
          src={getImageUrl(selectedImage.url)}
          alt={selectedImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={image._key || index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors snap-start min-w-[64px] sm:min-w-[80px]',
                index === selectedIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
              )}
            >
              <Image
                src={getImageUrl(image.url)}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
