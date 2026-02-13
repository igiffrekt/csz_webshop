import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getProduct, getProducts, getCategory } from '@/lib/sanity-queries';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDetails } from '@/components/product/ProductDetails';
import { ProductDetailTabs } from '@/components/product/ProductDetailTabs';
import { ProductCardEnhanced } from '@/components/product/ProductCardEnhanced';
import { Home, ChevronRight, Truck, Shield, Headphones, Award } from 'lucide-react';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string; locale: string }>;
}

function getSlugString(slug: any): string {
  if (typeof slug === 'string') return slug;
  return slug?.current || '';
}

function adaptProduct(p: any) {
  return {
    ...p,
    id: 0,
    _id: p._id,
    slug: getSlugString(p.slug),
    images: (p.images || []).map((img: any) => ({
      id: 0,
      _id: '',
      url: img.url,
      alt: img.alt || null,
      name: '',
      width: img.width,
      height: img.height,
    })),
    categories: (p.categories || []).map((cat: any) => ({
      id: 0,
      _id: cat._id,
      name: cat.name,
      slug: getSlugString(cat.slug),
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    })),
    specifications: (p.specifications || []).map((spec: any, i: number) => ({
      id: i,
      name: spec.name,
      value: spec.value,
      unit: spec.unit,
    })),
    certifications: (p.certifications || []).map((cert: any, i: number) => ({
      id: i,
      name: cert.name,
      standard: cert.standard,
      expiryDate: cert.expiryDate,
      certificate: cert.certificate ? {
        id: 0,
        _id: '',
        url: cert.certificate,
        alt: null,
        name: cert.name,
      } : undefined,
    })),
    documents: (p.documents || []).map((doc: any) => ({
      id: 0,
      _id: '',
      url: doc.url,
      alt: null,
      name: doc.name,
    })),
    variants: p.variants || [],
    description: p.description ? convertPortableTextToHtml(p.description) : undefined,
    shortDescription: p.shortDescription,
    createdAt: '',
    updatedAt: '',
    publishedAt: '',
  };
}

function convertPortableTextToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => {
      if (block._type !== 'block') return '';
      const text = (block.children || [])
        .map((child: any) => {
          let t = child.text || '';
          if (child.marks?.includes('strong')) t = `<strong>${t}</strong>`;
          if (child.marks?.includes('em')) t = `<em>${t}</em>`;
          return t;
        })
        .join('');
      if (block.style === 'h2') return `<h2>${text}</h2>`;
      if (block.style === 'h3') return `<h3>${text}</h3>`;
      if (block.style === 'h4') return `<h4>${text}</h4>`;
      if (block.listItem === 'bullet') return `<li>${text}</li>`;
      if (block.listItem === 'number') return `<li>${text}</li>`;
      return `<p>${text}</p>`;
    })
    .join('\n');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;

  try {
    const product = await getProduct(productSlug);
    if (!product) {
      return { title: 'Termék nem található' };
    }

    const description = product.shortDescription || product.name;

    return {
      title: product.name,
      description: typeof description === 'string' ? description.slice(0, 160) : `${product.name} - Tűzvédelmi eszköz`,
      openGraph: {
        title: product.name,
        description: typeof description === 'string' ? description.slice(0, 160) : undefined,
        images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
      },
    };
  } catch {
    return {
      title: 'Termék nem található',
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];
  let category: any = null;

  try {
    const [sanityProduct, sanityCategory, sanityRelated] = await Promise.all([
      getProduct(productSlug),
      getCategory(categorySlug),
      getProducts({ category: categorySlug, pageSize: 5 }),
    ]);

    if (!sanityProduct) {
      notFound();
    }

    product = adaptProduct(sanityProduct);
    category = sanityCategory ? {
      name: sanityCategory.name,
      slug: getSlugString(sanityCategory.slug),
    } : null;
    relatedProducts = sanityRelated.data
      .filter((p: any) => getSlugString(p.slug) !== productSlug)
      .slice(0, 4)
      .map(adaptProduct);
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
    description: product.shortDescription || product.description,
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

  // Use category from URL or fallback to product's first category
  const displayCategory = category || product.categories?.[0];

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
              {displayCategory && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                  <Link
                    href={`/kategoriak/${displayCategory.slug}`}
                    className="text-gray-500 hover:text-[#FFBB36] transition-colors"
                  >
                    {displayCategory.name}
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

          <ProductDetailTabs
            description={product.description}
            specifications={product.specifications}
            certifications={product.certifications}
            documents={product.documents}
          />

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
                {relatedProducts.map((relatedProduct: any) => (
                  <ProductCardEnhanced key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
