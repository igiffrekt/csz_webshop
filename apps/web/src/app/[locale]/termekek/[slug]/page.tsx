import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDetails } from '@/components/product/ProductDetails';
import { CertBadges } from '@/components/product/CertBadges';
import { SpecsTable } from '@/components/product/SpecsTable';
import { DocumentList } from '@/components/product/DocumentList';
import { getStrapiMediaUrl } from '@/lib/formatters';
import { getTranslations } from 'next-intl/server';

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
  const response = await getProduct(slug);

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
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb - simple for now */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/termekek" className="hover:underline">Termékek</a>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </nav>

        {/* Main product section - unified client component for gallery + variant selection */}
        <ProductDetails product={product}>
          <ProductInfo product={product} />

          {/* Certification badges */}
          {product.certifications && product.certifications.length > 0 && (
            <CertBadges certifications={product.certifications} />
          )}
        </ProductDetails>

        {/* Full description */}
        {product.description && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">{t('description')}</h2>
            <div
              className="text-muted-foreground leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Specifications table */}
        {product.specifications && (
          <SpecsTable specifications={product.specifications} />
        )}

        {/* Downloadable documents */}
        {product.documents && (
          <DocumentList documents={product.documents} />
        )}
      </main>
    </>
  );
}
