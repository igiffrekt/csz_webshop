import { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { SearchInput } from '@/components/product/SearchInput';
import { Pagination } from '@/components/product/Pagination';
import { EmptyState } from '@/components/product/EmptyState';
import { getTranslations } from 'next-intl/server';
import { Package } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('products');
  return {
    title: t('title'),
    description: 'Böngésszen tűzvédelmi eszközök széles választékában',
  };
}

interface Props {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
    fireClass?: string;
    cert?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations('products');

  // Fetch categories for filter dropdown
  let categories: Awaited<ReturnType<typeof getCategories>>['data'] = [];
  try {
    const categoriesResponse = await getCategories();
    categories = categoriesResponse.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }

  // Parse certification parameter (comma-separated string to array)
  const certifications = params.cert ? params.cert.split(',') : undefined;

  // Fetch products with all filters including fire class and certification
  let products: Awaited<ReturnType<typeof getProducts>>['data'] = [];
  let pagination: Awaited<ReturnType<typeof getProducts>>['meta']['pagination'] | null = null;

  try {
    const productsResponse = await getProducts({
      category: params.category,
      search: params.q,
      fireClass: params.fireClass,
      certification: certifications,
      page: params.page ? parseInt(params.page, 10) : 1,
      pageSize: 12,
    });

    products = productsResponse.data;
    pagination = productsResponse.meta.pagination;
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  const hasFilters = !!(params.category || params.q || params.fireClass || params.cert);

  return (
    <div className="bg-secondary-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900">{t('title')}</h1>
              {pagination && (
                <p className="text-secondary-600 mt-1">
                  {t('showing', { count: pagination.total })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Search */}
            <div className="w-full lg:w-80">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Keresés
              </label>
              <SearchInput />
            </div>

            {/* Filters */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Szűrők
              </label>
              <ProductFilters categories={categories} />
            </div>
          </div>
        </div>

        {/* Product grid or empty state */}
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
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>
    </div>
  );
}
