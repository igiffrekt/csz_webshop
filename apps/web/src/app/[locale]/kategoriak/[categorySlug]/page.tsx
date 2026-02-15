import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getCategory, getCategoryTree, getProducts } from '@/lib/sanity-queries';
import { CategoryCard } from '@/components/category/CategoryCard';
import { CategoryFilters } from '@/components/category/CategoryFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { EmptyState } from '@/components/product/EmptyState';
import { Home, ChevronRight, Folder } from 'lucide-react';

function getSlugString(slug: any): string {
  if (typeof slug === 'string') return slug;
  return slug?.current || '';
}

interface Props {
  params: Promise<{ categorySlug: string; locale: string }>;
  searchParams: Promise<{ page?: string; alkategoria?: string; rendezes?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) {
    return { title: 'Kategória nem található' };
  }
  return {
    title: category.name,
    description: category.description || `${category.name} - Tűzvédelmi eszközök`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const search = await searchParams;

  const [category, categoryTree] = await Promise.all([
    getCategory(categorySlug),
    getCategoryTree(),
  ]);

  if (!category) {
    notFound();
  }

  const currentPage = search.page ? parseInt(search.page, 10) : 1;
  const subcategoryFilter = search.alkategoria;
  const filterCategorySlug = subcategoryFilter || categorySlug;

  const productsResponse = await getProducts({
    category: filterCategorySlug,
    page: currentPage,
    pageSize: 12,
  });

  const products = productsResponse.data.map((p: any) => ({
    id: 0,
    _id: p._id,
    name: p.name,
    slug: getSlugString(p.slug),
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    stock: p.stock,
    images: p.images,
    categories: (p.categories || []).map((c: any) => ({
      id: 0,
      _id: c._id,
      name: c.name,
      slug: getSlugString(c.slug),
    })),
  }));

  const pagination = productsResponse.meta.pagination;
  const hasSubcategories = category.children && category.children.length > 0;

  const transformedChildren = (category.children || []).map((child: any) => ({
    id: child._id,
    _id: child._id,
    name: child.name,
    slug: getSlugString(child.slug),
    description: child.description,
    productCount: child.productCount,
    image: child.image ? { url: child.image.url, alt: child.image.alt } : undefined,
  }));

  const filterSubcategories = (category.children || []).map((child: any) => ({
    name: child.name,
    slug: getSlugString(child.slug),
    productCount: child.productCount,
  }));

  const filterCategories = (categoryTree || []).map((cat: any) => ({
    name: cat.name,
    slug: getSlugString(cat.slug),
    productCount: cat.productCount,
    children: (cat.children || []).map((child: any) => ({
      name: child.name,
      slug: getSlugString(child.slug),
      productCount: child.productCount,
    })),
  }));

  return (
    <div className="bg-secondary-50 min-h-screen">
      <div className="bg-white border-b border-secondary-200">
        <div className="site-container py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-secondary-500 hover:text-primary-500 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-secondary-400" />
            <Link href="/kategoriak" className="text-secondary-500 hover:text-primary-500 transition-colors">
              Kategóriák
            </Link>
            {category.parent && (
              <>
                <ChevronRight className="h-4 w-4 text-secondary-400" />
                <Link
                  href={`/kategoriak/${getSlugString(category.parent.slug)}`}
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
              <p className="text-secondary-500 text-sm mt-2">{pagination.total} termék</p>
            </div>
          </div>
        </div>
      </div>

      <div className="site-container py-8">
        {hasSubcategories && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Alkategóriák</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {transformedChildren.map((child: any) => (
                <CategoryCard key={child._id} category={child} />
              ))}
            </div>
          </section>
        )}

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
