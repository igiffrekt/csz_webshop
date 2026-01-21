import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCategory, getProducts } from '@/lib/api';
import { CategoryCard } from '@/components/category/CategoryCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { EmptyState } from '@/components/product/EmptyState';
import { Home, ChevronRight, Folder } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Kategória nem található' };
  }

  return {
    title: category.name,
    description: category.description || `${category.name} - Tűzvédelmi eszközök`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  // Fetch products in this category
  const productsResponse = await getProducts({
    category: slug,
    page: search.page ? parseInt(search.page, 10) : 1,
    pageSize: 12,
  });

  const { data: products, meta } = productsResponse;
  const { pagination } = meta;
  const hasSubcategories = category.children && category.children.length > 0;

  return (
    <div className="bg-secondary-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-secondary-500 hover:text-primary-500 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-secondary-400" />
            <Link
              href="/kategoriak"
              className="text-secondary-500 hover:text-primary-500 transition-colors"
            >
              Kategóriák
            </Link>
            {category.parent && (
              <>
                <ChevronRight className="h-4 w-4 text-secondary-400" />
                <Link
                  href={`/kategoriak/${category.parent.slug}`}
                  className="text-secondary-500 hover:text-primary-500 transition-colors"
                >
                  {category.parent.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-secondary-400" />
            <span className="text-secondary-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Folder className="h-7 w-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900">{category.name}</h1>
              {category.description && (
                <p className="text-secondary-600 mt-1 max-w-2xl">{category.description}</p>
              )}
              {pagination && (
                <p className="text-secondary-500 text-sm mt-2">{pagination.total} termék</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subcategories */}
        {hasSubcategories && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Alkategóriák</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.children!.map((child) => (
                <CategoryCard key={child.documentId} category={child} />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <h2 className="text-xl font-bold text-secondary-900 mb-6">Termékek</h2>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {pagination && pagination.pageCount > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pageCount}
                    totalItems={pagination.total}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}
