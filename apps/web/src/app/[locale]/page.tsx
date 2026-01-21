import { getCategories, getFeaturedProducts, getProducts } from '@/lib/api';
import {
  HeroSection,
  TrustBadges,
  CategoryGrid,
  ProductCollections,
  DealsSection,
  PromoBanners,
  BlogSection,
  FAQSection,
  InstagramSection,
} from '@/components/home';

export default async function HomePage() {
  // Fetch data in parallel with error handling
  const [categoriesResult, featuredResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getFeaturedProducts(),
    getProducts({ pageSize: 12 }),
  ]);

  // Extract data with fallbacks for failed requests
  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value.data : [];
  const featuredProducts =
    featuredResult.status === 'fulfilled' ? featuredResult.value.data : [];
  const allProducts =
    productsResult.status === 'fulfilled' ? productsResult.value.data : [];

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Grid */}
      <CategoryGrid categories={categories} />

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
