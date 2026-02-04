import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getStrapiProduct, getStrapiProducts, transformStrapiProduct } from '@/lib/strapi';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDetails } from '@/components/product/ProductDetails';
import { CertBadges } from '@/components/product/CertBadges';
import { SpecsTable } from '@/components/product/SpecsTable';
import { DocumentList } from '@/components/product/DocumentList';
import { ProductCardEnhanced } from '@/components/product/ProductCardEnhanced';
import { getStrapiMediaUrl } from '@/lib/formatters';
import { getTranslations } from 'next-intl/server';
import { Home, ChevronRight, Truck, Shield, Headphones, Award } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const strapiProduct = await getStrapiProduct(slug);
    if (!strapiProduct) {
      return { title: 'Termék nem található' };
    }
    const product = transformStrapiProduct(strapiProduct);

    return {
      title: product.name,
      description: product.description?.slice(0, 160) || `${product.name} - Tűzvédelmi eszköz`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160) || undefined,
        images: product.images?.[0] ? [product.images[0].url] : undefined,
      },
    };
  } catch {
    return {
      title: 'Termék nem található',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('product');

  let product: ReturnType<typeof transformStrapiProduct> | null = null;
  let relatedProducts: ReturnType<typeof transformStrapiProduct>[] = [];

  try {
    const [strapiProduct, strapiRelated] = await Promise.all([
      getStrapiProduct(slug),
      getStrapiProducts({ pageSize: 5 }),
    ]);

    if (!strapiProduct) {
      notFound();
    }

    product = transformStrapiProduct(strapiProduct);
    relatedProducts = strapiRelated.products
      .filter((p) => p.slug !== slug)
      .slice(0, 4)
      .map(transformStrapiProduct);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0]?.url,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'HUF',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const category = product.categories?.[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="site-container py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-gray-500 hover:text-[#FFBB36] transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-300" />
              <Link
                href="/termekek"
                className="text-gray-500 hover:text-[#FFBB36] transition-colors"
              >
                Termékek
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                  <Link
                    href={`/kategoriak/${category.slug}`}
                    className="text-gray-500 hover:text-[#FFBB36] transition-colors"
                  >
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 text-gray-300" />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <main className="site-container py-8 lg:py-12">
          {/* Main product section */}
          <div className="bg-[#f6f6f6] rounded-[30px] p-6 lg:p-10">
            <ProductDetails product={product}>
              <ProductInfo product={product} />

              {/* Certification badges */}
              {product.certifications && product.certifications.length > 0 && (
                <CertBadges certifications={product.certifications} />
              )}
            </ProductDetails>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
                  <div className="w-10 h-10 bg-[#FFBB36] rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Gyors szállítás</p>
                    <p className="text-xs text-gray-500">1-3 munkanap</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Biztonságos fizetés</p>
                    <p className="text-xs text-gray-500">SSL titkosítás</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Szakértői támogatás</p>
                    <p className="text-xs text-gray-500">Hétfő-Péntek</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Minőségi garancia</p>
                    <p className="text-xs text-gray-500">CE tanúsítvány</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full description */}
          {product.description && (
            <section className="bg-[#f6f6f6] rounded-[30px] p-6 lg:p-10 mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('description')}</h2>
              <div
                className="text-gray-600 leading-relaxed prose prose-gray max-w-none [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_li]:marker:text-gray-500 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-semibold [&_h4]:text-gray-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-semibold [&_strong]:text-gray-800 [&_a]:text-inherit [&_a]:no-underline"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          )}

          {/* Specifications table */}
          {product.specifications && product.specifications.length > 0 && (
            <section className="bg-[#f6f6f6] rounded-[30px] p-6 lg:p-10 mt-8">
              <SpecsTable specifications={product.specifications} />
            </section>
          )}

          {/* Downloadable documents */}
          {product.documents && product.documents.length > 0 && (
            <section className="bg-[#f6f6f6] rounded-[30px] p-6 lg:p-10 mt-8">
              <DocumentList documents={product.documents} />
            </section>
          )}

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <div className="text-center mb-8">
                <span className="text-gray-500 text-sm uppercase tracking-wider">
                  Ajánljuk még
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">
                  Kapcsolódó termékek
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCardEnhanced key={relatedProduct.documentId} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
