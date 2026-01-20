import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Product } from "@csz/types";
import { formatPrice, getStrapiMediaUrl } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const t = useTranslations("products");

  // Get primary image or placeholder
  const imageUrl = product.images?.[0]
    ? getStrapiMediaUrl(product.images[0].url)
    : "/placeholder.jpg";
  const imageAlt = product.images?.[0]?.alternativeText || product.name;

  // Check if has certifications (CE marking)
  const hasCertifications = product.certifications && product.certifications.length > 0;

  return (
    <Link
      href={`/termekek/${product.slug}`}
      className={cn(
        "group block rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20",
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.basePrice)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        {product.stock <= 0 && (
          <p className="text-sm text-destructive">{t("outOfStock")}</p>
        )}
      </div>
    </Link>
  );
}
