import { formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, X } from 'lucide-react';
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
          <Badge variant="destructive">{t('onSale')}</Badge>
        )}
        {product.isFeatured && (
          <Badge variant="secondary">{t('featured')}</Badge>
        )}
      </div>

      {/* Product name */}
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {/* SKU */}
      <p className="text-sm text-muted-foreground">
        {t('sku')}: {product.sku}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">
          {formatPrice(product.basePrice)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compareAtPrice!)}
          </span>
        )}
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">{t('inStock')}</span>
          </>
        ) : (
          <>
            <X className="h-4 w-4 text-red-600" />
            <span className="text-red-600">{t('outOfStock')}</span>
          </>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-muted-foreground">{product.shortDescription}</p>
      )}

      {/* Add to cart button (placeholder - functional in Phase 4) */}
      <Button size="lg" className="w-full sm:w-auto" disabled={!inStock}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        {t('addToCart')}
      </Button>
    </div>
  );
}
