import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getStrapiCategory, getStrapiCategoryTree, getStrapiProducts, transformStrapiProduct } from '@/lib/strapi';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryFilters } from '@/components/category/CategoryFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { EmptyState } from '@/components/product/EmptyState';
import { Home, ChevronRight, Folder } from 'lucide-react';

interface Props {
  params: Promise<{ categorySlug: string; locale: string }>;
  searchParams: Promise<{ page?: string; alkategoria?: string; rendezes?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getStrapiCategory(categorySlug);

  if (!category) {
    return { title: 'Kategoria nem talalhato' };
  }

  return {
    title: category.name,
    description: category.description || `${category.name} - Tűzvédelmi eszközök`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const search = await searchParams;

  // Fetch category and category tree in parallel
  const [category, categoryTree] = await Promise.all([
    getStrapiCategory(categorySlug),
    getStrapiCategoryTree(),
  ]);

  if (!category) {
    notFound();
  }

  // Parse filter params
  const currentPage = search.page ? parseInt(search.page, 10) : 1;
  const subcategoryFilter = search.alkategoria;
  const sortParam = search.rendezes || 'createdAt:desc';

  // Determine which category slug to filter by
  const filterCategorySlug = subcategoryFilter || categorySlug;

  // Fetch products in this category (or subcategory if filtered)
  const productsResponse = await getStrapiProducts({
    category: filterCategorySlug,
    page: currentPage,
    pageSize: 12,
    sort: sortParam,
  });

  const products = productsResponse.products.map(transformStrapiProduct);
  const pagination = {
    page: currentPage,
    pageCount: productsResponse.totalPages,
    total: productsResponse.total,
  };
  const hasSubcategories = category.children && category.children.length > 0;

  // Transform children for CategoryCard component
  const transformedChildren = (category.children || []).map((child) => ({
    id: child.id,
    documentId: child.documentId,
    name: child.name,
    slug: child.slug,
    description: child.description,
    productCount: child.productCount,
    image: child.image
      ? {
          url: child.image.url.startsWith('http')
            ? child.image.url
            : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${child.image.url}`,
          alternativeText: child.image.alternativeText,
        }
      : undefined,
  }));

  // Transform subcategories for filter dropdown
  const filterSubcategories = (category.children || []).map((child) => ({
    name: child.name,
    slug: child.slug,
    productCount: child.productCount,
  }));

  // Transform category tree for category filter dropdown
  const filterCategories = categoryTree.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    productCount: cat.count,
    children: cat.children.map((child) => ({
      name: child.name,
      slug: child.slug,
      productCount: child.count,
    })),
  }));

  return (
    <div className="bg-secondary-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-secondary-200">
        <div className="site-container py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-secondary-500 hover:text-primary-500 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-secondary-400" />
            <Link
              href="/kategoriak"
              className="text-secondary-500 hover:text-primary-500 transition-colors"
            >
              Kategoriak
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
        <div className="site-container py-8 lg:py-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Folder className="h-7 w-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900">{category.name}</h1>
              {category.description && (
                <p className="text-secondary-600 mt-1 max-w-2xl">{category.description}</p>
              )}
              <p className="text-secondary-500 text-sm mt-2">{pagination.total} termek</p>
            </div>
          </div>
        </div>
      </div>

      <div className="site-container py-8">
        {/* Subcategories */}
        {hasSubcategories && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Alkategoriak</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {transformedChildren.map((child) => (
                <CategoryCard key={child.documentId} category={child} />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-secondary-900">Termékek</h2>
            <CategoryFilters
              categories={filterCategories}
              subcategories={filterSubcategories}
              categorySlug={categorySlug}
              categoryName={category.name}
            />
          </div>

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              {pagination.pageCount > 1 && (
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
