import { getPageBySlug } from '@/lib/sanity-queries';
import type { Metadata } from 'next';

function convertPortableTextToHtml(blocks: any): string {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;
  if (!Array.isArray(blocks)) return '';
  return blocks.map((block: any) => {
    if (block._type !== 'block') return '';
    const children = (block.children || [])
      .map((child: any) => {
        let text = child.text || '';
        if (child.marks?.includes('strong')) text = `<strong>${text}</strong>`;
        if (child.marks?.includes('em')) text = `<em>${text}</em>`;
        return text;
      })
      .join('');
    switch (block.style) {
      case 'h1': return `<h1>${children}</h1>`;
      case 'h2': return `<h2>${children}</h2>`;
      case 'h3': return `<h3>${children}</h3>`;
      case 'h4': return `<h4>${children}</h4>`;
      case 'blockquote': return `<blockquote>${children}</blockquote>`;
      default: return `<p>${children}</p>`;
    }
  }).join('\n');
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('aszf');

  return {
    title: page?.seo?.metaTitle || 'Általános Szerződési Feltételek | Dunamenti CSZ Kft.',
    description: page?.seo?.metaDescription || 'Vásárlási feltételek és szabályzat',
  };
}

export default async function TermsPage() {
  const page = await getPageBySlug('aszf');

  const content = page?.content ? convertPortableTextToHtml(page.content) : `
    <h2>Általános Szerződési Feltételek</h2>
    <p>Érvényes: 2026. január 1-től</p>

    <h3>1. Általános rendelkezések</h3>
    <p>Jelen ÁSZF a Dunamenti CSZ Kft. webáruházában történő vásárlás feltételeit szabályozza.</p>

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
    <p>Dunamenti CSZ Kft. - info@csz-tuzvedelmi.hu</p>
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
