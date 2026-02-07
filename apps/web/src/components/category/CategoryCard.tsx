import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getImageUrl } from '@/lib/formatters';
import { ArrowRight, Folder } from 'lucide-react';

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description?: string;
    image?: { url: string; alt?: string | null };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/kategoriak/${category.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary-100">
        {category.image ? (
          <Image
            src={getImageUrl(category.image.url)}
            alt={category.image.alt || category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-secondary-700 via-secondary-800 to-secondary-900">
            <Folder className="h-12 w-12 text-secondary-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 via-secondary-900/0 to-transparent" />

        {/* Category name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg">{category.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-secondary-900 mb-1">{category.name}</h3>
        {category.description && (
          <p className="text-secondary-600 text-sm line-clamp-2 mb-3">{category.description}</p>
        )}

        <span className="inline-flex items-center gap-1.5 text-primary-500 font-medium text-sm group-hover:gap-3 transition-all duration-200">
          Böngészés
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
