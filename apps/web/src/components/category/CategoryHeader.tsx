import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getImageUrl } from "@/lib/formatters";
import type { Category } from "@csz/types";

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
        <Link href="/kategoriak" className="hover:underline">
          Kategoriak
        </Link>
        {category.parent && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/kategoriak/${category.parent.slug}`}
              className="hover:underline"
            >
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span>{category.name}</span>
      </nav>

      {/* Header with optional image */}
      <div className="flex items-start gap-6">
        {category.image && (
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={getImageUrl(category.image.url)}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
