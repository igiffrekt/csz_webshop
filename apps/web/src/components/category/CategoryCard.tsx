import Image from "next/image";
import Link from "next/link";
import { getStrapiMediaUrl } from "@/lib/formatters";
import type { Category } from "@csz/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/kategoriak/${category.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
        {category.image ? (
          <Image
            src={getStrapiMediaUrl(category.image.url)}
            alt={category.image.alternativeText || category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <span className="text-muted-foreground">Nincs kep</span>
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-medium group-hover:text-primary transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}
    </Link>
  );
}
