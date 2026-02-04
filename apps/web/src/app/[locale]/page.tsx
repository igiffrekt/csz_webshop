import {
  getStrapiProducts,
  getStrapiCategoryTree,
  transformStrapiProduct,
  transformStrapiCategory,
} from '@/lib/strapi';
import {
  HeroSection,
  TrustBadges,
  CategoryCards,
  ProductCollections,
  DealsSection,
  PromoBanners,
  BlogSection,
  FAQSection,
  InstagramSection,
} from '@/components/home';

export default async function HomePage() {
  // Fetch data from Strapi in parallel with error handling
  const [categoryTreeResult, productsResult] = await Promise.allSettled([
    getStrapiCategoryTree(),
    getStrapiProducts({ pageSize: 12 }),
  ]);

  // Transform Strapi data to match existing component interfaces
  const categoryTree =
    categoryTreeResult.status === 'fulfilled'
      ? categoryTreeResult.value.map(transformStrapiCategory)
      : [];

  // Categories with children for CategoryGrid
  const categoriesWithChildren = categoryTree;

  const allProducts =
    productsResult.status === 'fulfilled'
      ? productsResult.value.products.map(transformStrapiProduct)
      : [];

  // Use first 5 products as featured for hero
  const featuredProducts = allProducts.slice(0, 5);

  return (
    <>
      {/* Hero Section */}
      <HeroSection products={featuredProducts} categories={categoryTree} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Cards - Figma design */}
      <CategoryCards categories={categoriesWithChildren} products={allProducts} />

      {/* Product Collections (Tabbed) */}
      <ProductCollections products={allProducts} featuredProducts={featuredProducts} />

      {/* Daily Deals */}
      <DealsSection products={allProducts} />

      {/* Promotional Banners */}
      <PromoBanners />

      {/* Blog Section */}
      <BlogSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Instagram Section */}
      <InstagramSection />
    </>
  );
}
