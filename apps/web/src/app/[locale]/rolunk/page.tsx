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
  const page = await getPageBySlug('rolunk');

  return {
    title: page?.seo?.metaTitle || page?.title || 'Rólunk | CSZ Tűzvédelem',
    description: page?.seo?.metaDescription || 'Ismerje meg a CSZ Tűzvédelmi Kft.-t',
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug('rolunk');

  // Show fallback content if page not in CMS yet
  const content = page?.content ? convertPortableTextToHtml(page.content) : `
    <h2>A CSZ Tűzvédelmi Kft.</h2>
    <p>Cégünk több mint 20 éve foglalkozik tűzvédelmi eszközök forgalmazásával és karbantartásával.</p>
    <p>Fő tevékenységeink:</p>
    <ul>
      <li>Tűzoltó készülékek értékesítése</li>
      <li>Tűzvédelmi felszerelések</li>
      <li>Karbantartási szolgáltatások</li>
      <li>Szakmai tanácsadás</li>
    </ul>
    <p>Célunk, hogy ügyfeleink számára a legmagasabb minőségű tűzvédelmi megoldásokat biztosítsuk.</p>
  `;

  return (
    <main className="site-container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{page?.title || 'Rólunk'}</h1>
      <div
        className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
