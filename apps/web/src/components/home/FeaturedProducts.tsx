import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Product } from "@csz/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations("home.featured");

  // Don't render section if no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <Button variant="ghost" asChild className="hidden sm:flex gap-2">
          <Link href="/termekek">
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.documentId} product={product} />
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center sm:hidden">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/termekek">
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
