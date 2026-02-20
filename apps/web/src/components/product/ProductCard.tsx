import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Product } from "@csz/types";
import { formatPrice, getImageUrl } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const t = useTranslations("products");

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].url) : "/placeholder.jpg";
  const imageAlt = product.images?.[0]?.alt || product.name;

  // Check if has certifications (CE marking)
  const hasCertifications = product.certifications && product.certifications.length > 0;

  // Get primary category for URL
  const category = product.categories?.[0];
  const productUrl = category
    ? `/${category.slug}/${product.slug}`
    : `/termekek/${product.slug}`;

  return (
    <Link
      href={productUrl}
      className={cn(
        "group block rounded-lg border border-border bg-card overflow-hidden card-hover",
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isOnSale && (
            <Badge variant="destructive" className="text-xs">
              {t("onSale")}
            </Badge>
          )}
          {hasCertifications && (
            <Badge variant="secondary" className="text-xs">
              CE
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm sm:text-base">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold text-foreground">
            {formatPrice(product.basePrice)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Variant pills */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            {product.variants.slice(0, 2).map((v) => (
              <span
                key={v._id}
                className="inline-block text-[10px] sm:text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 truncate max-w-[110px] sm:max-w-[130px]"
                title={v.name || v.attributeValue || ''}
              >
                {v.attributeValue || v.name}
              </span>
            ))}
            {product.variants.length > 2 && (
              <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground flex-shrink-0">
                +{product.variants.length - 2}
              </span>
            )}
          </div>
        )}

      </div>
    </Link>
  );
}
