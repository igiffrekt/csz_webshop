import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getProduct, getProducts } from '@/lib/api';
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
  const response = await getProduct(slug);

  if (!response) {
    return {
      title: 'Termék nem található',
    };
  }

  const product = response.data;

  return {
    title: product.name,
    description: product.shortDescription || `${product.name} - Tűzvédelmi eszköz`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images?.[0] ? [getStrapiMediaUrl(product.images[0].url)] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('product');

  const [productResponse, relatedResponse] = await Promise.allSettled([
    getProduct(slug),
    getProducts({ pageSize: 4 }),
  ]);

  const response = productResponse.status === 'fulfilled' ? productResponse.value : null;
  const relatedProducts =
    relatedResponse.status === 'fulfilled'
      ? relatedResponse.value.data.filter((p) => p.slug !== slug).slice(0, 4)
      : [];

  if (!response) {
    notFound();
  }

  const product = response.data;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images?.[0] ? getStrapiMediaUrl(product.images[0].url) : undefined,
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

      <div className="bg-secondary-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-secondary-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-4 w-4 text-secondary-400" />
              <Link
                href="/termekek"
                className="text-secondary-500 hover:text-primary-500 transition-colors"
              >
                Termékek
              </Link>
              {category && (
                <>
                  <ChevronRight className="h-4 w-4 text-secondary-400" />
                  <Link
                    href={`/kategoriak/${category.slug}`}
                    className="text-secondary-500 hover:text-primary-500 transition-colors"
                  >
                    {category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 text-secondary-400" />
              <span className="text-secondary-900 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8 lg:py-12">
          {/* Main product section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            <ProductDetails product={product}>
              <ProductInfo product={product} />

              {/* Certification badges */}
              {product.certifications && product.certifications.length > 0 && (
                <CertBadges certifications={product.certifications} />
              )}
            </ProductDetails>

            {/* Trust badges */}
            <div className="mt-8 pt-8 border-t border-secondary-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900 text-sm">Gyors szállítás</p>
                    <p className="text-xs text-secondary-500">1-3 munkanap</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900 text-sm">Biztonságos fizetés</p>
                    <p className="text-xs text-secondary-500">SSL titkosítás</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900 text-sm">Szakértői támogatás</p>
                    <p className="text-xs text-secondary-500">Hétfő-Péntek</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900 text-sm">Minőségi garancia</p>
                    <p className="text-xs text-secondary-500">CE tanúsítvány</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full description */}
          {product.description && (
            <section className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 mt-6">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">{t('description')}</h2>
              <div
                className="text-secondary-600 leading-relaxed prose prose-secondary max-w-none [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-secondary-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-semibold [&_h4]:text-secondary-800 [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-semibold [&_strong]:text-secondary-800 [&_a]:text-primary-500 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          )}

          {/* Specifications table */}
          {product.specifications && (
            <section className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 mt-6">
              <SpecsTable specifications={product.specifications} />
            </section>
          )}

          {/* Downloadable documents */}
          {product.documents && product.documents.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 mt-6">
              <DocumentList documents={product.documents} />
            </section>
          )}

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Kapcsolódó termékek
              </h2>
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
