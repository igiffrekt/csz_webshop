import {
  getCategoryTree,
  getProducts,
  getHomepage,
  getFAQs,
} from '@/lib/sanity-queries'
import {
  HeroSection,
  TrustBadges,
  CategoryCards,
  ProductCollections,
  DealsSection,
  PromoBanners,
  FAQSection,
  InstagramSection,
} from '@/components/home'

export default async function HomePage() {
  const [categoryTree, productsResult, homepageResult, faqsResult] = await Promise.allSettled([
    getCategoryTree(),
    getProducts({ pageSize: 12 }),
    getHomepage(),
    getFAQs(),
  ])

  const homepage = homepageResult.status === 'fulfilled' ? homepageResult.value : null

  const categories =
    categoryTree.status === 'fulfilled'
      ? (categoryTree.value || []).map((cat: any) => ({
          _id: cat._id,
          name: cat.name,
          slug: typeof cat.slug === 'string' ? cat.slug : cat.slug?.current,
          description: cat.description,
          image: cat.image ? { url: cat.image.url } : null,
          count: cat.productCount || 0,
          children: (cat.children || []).map((child: any) => ({
            _id: child._id,
            name: child.name,
            slug: typeof child.slug === 'string' ? child.slug : child.slug?.current,
            count: child.productCount || 0,
          })),
        }))
      : []

  const allProducts =
    productsResult.status === 'fulfilled'
      ? (productsResult.value.data || []).map((p: any) => ({
          ...p,
          _id: p._id,
          slug: typeof p.slug === 'string' ? p.slug : p.slug?.current,
          images: (p.images || []).map((img: any) => ({
            ...img,
            id: 0,
            _id: '',
            name: '',
            alt: img.alt || null,
          })),
          categories: (p.categories || []).map((cat: any) => ({
            ...cat,
            id: 0,
            _id: cat._id,
            slug: typeof cat.slug === 'string' ? cat.slug : cat.slug?.current,
            createdAt: '',
            updatedAt: '',
            publishedAt: '',
          })),
          id: 0,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        }))
      : []

  const sanityFeatured = (homepage?.featuredProducts || []).filter(
    (p: any) => p && p._id
  )
  const featuredProducts =
    sanityFeatured.length > 0
      ? sanityFeatured.map((p: any) => ({
          ...p,
          slug: typeof p.slug === 'string' ? p.slug : p.slug?.current,
          images: p.images ? [{ ...p.images, id: 0, _id: '', name: '' }] : [],
          id: 0,
          createdAt: '',
          updatedAt: '',
          publishedAt: '',
        }))
      : allProducts.slice(0, 5)

  const faqs =
    faqsResult.status === 'fulfilled'
      ? (faqsResult.value || []).map((f: any) => ({
          question: f.question,
          answer: f.answer,
        }))
      : []

  return (
    <>
      <HeroSection products={featuredProducts} categories={categories} heroData={homepage?.heroSection} />
      <TrustBadges trustBadges={homepage?.trustBadges} />
      <CategoryCards categories={categories} products={allProducts} sectionTitle={homepage?.categoriesSection?.title} sectionSubtitle={homepage?.categoriesSection?.subtitle} />
      <ProductCollections products={allProducts} featuredProducts={featuredProducts} />
      <DealsSection products={allProducts} sectionTitle={homepage?.dealsSection?.title} sectionSubtitle={homepage?.dealsSection?.subtitle} />
      <PromoBanners sanityBanners={homepage?.promoBanners} />
      <FAQSection sanityFaqs={faqs} sectionTitle={homepage?.faqSection?.title} sectionSubtitle={homepage?.faqSection?.subtitle} />
      <InstagramSection />
    </>
  )
}
