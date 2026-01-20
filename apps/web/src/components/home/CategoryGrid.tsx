import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Category } from "@csz/types";
import { getStrapiMediaUrl } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const t = useTranslations("home.categories");

  // Don't render section if no categories
  if (!categories || categories.length === 0) {
    return null;
  }

  // Filter to top-level categories only (those without parent)
  const topLevelCategories = categories.filter((cat) => !cat.parent);

  if (topLevelCategories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Section header */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
        {t("title")}
      </h2>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {topLevelCategories.map((category) => (
          <CategoryCard key={category.documentId} category={category} />
        ))}
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const imageUrl = category.image
    ? getStrapiMediaUrl(category.image.url)
    : null;
  const imageAlt = category.image?.alternativeText || category.name;

  // Count children as subcategories indicator
  const subcategoryCount = category.children?.length || 0;

  return (
    <Link
      href={`/kategoriak/${category.slug}`}
      className={cn(
        "group relative block rounded-lg border border-border bg-card overflow-hidden",
        "transition-all hover:shadow-lg hover:border-primary/20",
        "aspect-[4/3]"
      )}
    >
      {/* Background image or gradient */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-muted" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-xl font-bold text-white group-hover:text-primary-foreground transition-colors">
          {category.name}
        </h3>
        {subcategoryCount > 0 && (
          <p className="text-sm text-white/80 mt-1">
            {subcategoryCount} alkategória
          </p>
        )}
        {category.description && (
          <p className="text-sm text-white/70 mt-2 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
