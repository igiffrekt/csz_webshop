import { formatPrice } from '@/lib/formatters';
import { getTranslations } from 'next-intl/server';
import type { Product } from '@csz/types';

interface ProductInfoProps {
  product: Product;
}

export async function ProductInfo({ product }: ProductInfoProps) {
  const t = await getTranslations('product');

  const inStock = product.stock > 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.basePrice;

  return (
    <div className="flex flex-col gap-4">
      {/* Badges */}
      <div className="flex gap-2">
        {product.isOnSale && (
          <span className="bg-[#FFBB36] text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
            {t('onSale')}
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {t('featured')}
          </span>
        )}
      </div>

      {/* Product name */}
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

      {/* SKU */}
      <p className="text-sm text-gray-500">
        {t('sku')}: {product.sku}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(product.basePrice)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(product.compareAtPrice!)}
          </span>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-600 font-medium">{t('inStock')}</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-600 font-medium">{t('outOfStock')}</span>
          </>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <div
          className="text-gray-600 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.shortDescription }}
        />
      )}
    </div>
  );
}
