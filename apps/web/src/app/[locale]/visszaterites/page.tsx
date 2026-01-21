import { getPageBySlug } from '@/lib/content-api';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('visszaterites');

  return {
    title: page?.seo?.metaTitle || 'Visszatérítési szabályzat | CSZ Tűzvédelem',
    description: page?.seo?.metaDescription || 'Elállási jog és visszatérítési feltételek',
  };
}

export default async function RefundPage() {
  const page = await getPageBySlug('visszaterites');

  const content = page?.content || `
    <h2>Visszatérítési szabályzat</h2>

    <h3>Elállási jog</h3>
    <p>A fogyasztó a szerződéstől a termék kézhezvételétől számított 14 napon belül indokolás nélkül elállhat.</p>

    <h3>Elállási nyilatkozat</h3>
    <p>Az elállási szándékát egyértelmű nyilatkozattal jelezheti e-mailben vagy postai úton.</p>

    <h3>Visszaküldés</h3>
    <ul>
      <li>A terméket eredeti állapotában kell visszaküldeni</li>
      <li>A visszaküldés költsége a vásárlót terheli</li>
      <li>Sérült vagy használt termék nem fogadható vissza</li>
    </ul>

    <h3>Visszatérítés</h3>
    <p>A visszatérítés a termék visszaérkezésétől számított 14 napon belül történik, az eredeti fizetési módon.</p>

    <h3>Kapcsolat</h3>
    <p>Visszatérítéssel kapcsolatos kérdések: info@csz-tuzvedelmi.hu</p>
  `;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{page?.title || 'Visszatérítési szabályzat'}</h1>
      <div
        className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
