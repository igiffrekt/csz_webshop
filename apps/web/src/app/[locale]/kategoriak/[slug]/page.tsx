import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getProducts } from "@/lib/api";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { CategoryCard } from "@/components/category/CategoryCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";
import { EmptyState } from "@/components/product/EmptyState";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Kategoria nem talalhato" };
  }

  return {
    title: category.name,
    description:
      category.description || `${category.name} - Tuzvedelmi eszkozok`,
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
    <main className="container mx-auto px-4 py-8">
      <CategoryHeader category={category} />

      {/* Subcategories */}
      {hasSubcategories && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Alkategoriak</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.children!.map((child) => (
              <CategoryCard key={child.documentId} category={child} />
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Termekek {pagination && `(${pagination.total})`}
        </h2>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pageCount}
                totalItems={pagination.total}
              />
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}
