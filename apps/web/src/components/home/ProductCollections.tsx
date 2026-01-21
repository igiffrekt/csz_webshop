'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCardEnhanced } from '@/components/product/ProductCardEnhanced';
import type { Product } from '@csz/types';

interface ProductCollectionsProps {
  products: Product[];
  featuredProducts?: Product[];
}

const tabs = [
  { id: 'all', label: 'Összes termék' },
  { id: 'latest', label: 'Legújabb' },
  { id: 'bestsellers', label: 'Legnépszerűbb' },
  { id: 'featured', label: 'Kiemelt termékek' },
] as const;

export function ProductCollections({
  products,
  featuredProducts = [],
}: ProductCollectionsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'featured':
        return featuredProducts.length > 0
          ? featuredProducts
          : products.filter((p) => p.isFeatured);
      case 'latest':
        // Sort by createdAt descending
        return [...products].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'bestsellers':
        // For now, show products with high stock (implying they sell well)
        return [...products].sort((a, b) => (b.stock || 0) - (a.stock || 0));
      default:
        return products;
    }
  };

  const displayProducts = getFilteredProducts().slice(0, 8);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <span className="text-amber-600 font-medium text-sm uppercase tracking-wider">
            Termékeink
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            Termékkínálatunk
          </h2>
        </div>

        {/* Tabs - styled like reference */}
        <div className="flex flex-wrap justify-center gap-1 mb-10 bg-white rounded-lg p-1 max-w-xl mx-auto shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-amber-400 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCardEnhanced
              key={product.documentId}
              product={product}
              showCountdown={true}
            />
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-10">
          <Link
            href="/termekek"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Összes termék megtekintése
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
