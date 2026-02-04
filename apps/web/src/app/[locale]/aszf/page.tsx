import { getPageBySlug } from '@/lib/content-api';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('aszf');

  return {
    title: page?.seo?.metaTitle || 'Általános Szerződési Feltételek | CSZ Tűzvédelem',
    description: page?.seo?.metaDescription || 'Vásárlási feltételek és szabályzat',
  };
}

export default async function TermsPage() {
  const page = await getPageBySlug('aszf');

  const content = page?.content || `
    <h2>Általános Szerződési Feltételek</h2>
    <p>Érvényes: 2026. január 1-től</p>

    <h3>1. Általános rendelkezések</h3>
    <p>Jelen ÁSZF a CSZ Tűzvédelmi Kft. webáruházában történő vásárlás feltételeit szabályozza.</p>

    <h3>2. Megrendelés</h3>
    <p>A megrendelés a kosárba helyezett termékek megvásárlásával jön létre.</p>

    <h3>3. Fizetési módok</h3>
    <ul>
      <li>Bankkártya (Stripe)</li>
      <li>Banki átutalás</li>
    </ul>

    <h3>4. Szállítás</h3>
    <p>Szállítás kizárólag Magyarország területére.</p>

    <h3>5. Kapcsolat</h3>
    <p>CSZ Tűzvédelmi Kft. - info@csz-tuzvedelmi.hu</p>
  `;

  return (
    <main className="site-container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{page?.title || 'Általános Szerződési Feltételek'}</h1>
      <div
        className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
