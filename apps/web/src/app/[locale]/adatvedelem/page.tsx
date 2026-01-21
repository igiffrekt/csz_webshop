import { getPageBySlug } from '@/lib/content-api';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('adatvedelem');

  return {
    title: page?.seo?.metaTitle || 'Adatvédelmi tájékoztató | CSZ Tűzvédelem',
    description: page?.seo?.metaDescription || 'Adatvédelmi irányelvek és személyes adatok kezelése',
  };
}

export default async function PrivacyPage() {
  const page = await getPageBySlug('adatvedelem');

  const content = page?.content || `
    <h2>Adatvédelmi tájékoztató</h2>
    <p>Utoljára frissítve: 2026. január</p>

    <h3>1. Bevezetés</h3>
    <p>A CSZ Tűzvédelmi Kft. elkötelezett az Ön személyes adatainak védelme mellett.</p>

    <h3>2. Milyen adatokat gyűjtünk</h3>
    <ul>
      <li>Név és elérhetőségi adatok</li>
      <li>Szállítási és számlázási cím</li>
      <li>Vásárlási előzmények</li>
    </ul>

    <h3>3. Adatok felhasználása</h3>
    <p>Adatait kizárólag a megrendelések teljesítésére és ügyfélszolgálati célokra használjuk.</p>

    <h3>4. Kapcsolat</h3>
    <p>Adatvédelmi kérdésekkel kapcsolatban: info@csz-tuzvedelmi.hu</p>
  `;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{page?.title || 'Adatvédelmi tájékoztató'}</h1>
      <div
        className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
