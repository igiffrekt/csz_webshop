import { getPageBySlug } from '@/lib/sanity-queries';
import { PortableText } from '@portabletext/react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('rolunk');

  return {
    title: page?.seo?.metaTitle || page?.title || 'Rólunk | Dunamenti CSZ Kft.',
    description: page?.seo?.metaDescription || 'Ismerje meg a Dunamenti CSZ Kft.-t',
  };
}

const fallbackContent = `
  <h2>A Dunamenti CSZ Kft.</h2>
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

export default async function AboutPage() {
  const page = await getPageBySlug('rolunk');

  return (
    <main className="site-container py-4 sm:py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{page?.title || 'Rólunk'}</h1>
      {page?.content ? (
        <div className="prose prose-lg max-w-none">
          <PortableText value={page.content} />
        </div>
      ) : (
        <div
          className="prose prose-lg max-w-none [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: fallbackContent }}
        />
      )}
    </main>
  );
}
