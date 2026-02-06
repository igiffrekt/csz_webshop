import { getFAQs } from '@/lib/sanity-queries';
import { FAQAccordion } from '@/components/faq';
import { generateFAQJsonLd } from '@/lib/structured-data';
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

export const metadata: Metadata = {
  title: 'Gyakran Ismételt Kérdések | CSZ Tűzvédelem',
  description: 'Válaszok a tűzvédelmi termékekkel kapcsolatos leggyakoribb kérdésekre',
};

export default async function FAQPage() {
  const rawFaqs = await getFAQs();

  const faqs = (rawFaqs || []).map((faq: any, index: number) => ({
    id: index + 1,
    _id: faq._id,
    question: faq.question,
    answer: convertPortableTextToHtml(faq.answer),
    order: faq.order,
    category: faq.category,
    createdAt: '',
    updatedAt: '',
    publishedAt: '',
  }));

  // Fallback FAQs if none in CMS
  const displayFaqs = faqs.length > 0 ? faqs : [
    {
      id: 1,
      _id: 'faq-1',
      question: 'Milyen gyakran kell ellenőriztetni a tűzoltó készüléket?',
      answer: '<p>A tűzoltó készülékeket évente egyszer kötelező szakszervizzel ellenőriztetni. Az 5 évnél régebbi készülékeket pedig nagyjavításra kell vinni.</p>',
      order: 1,
      category: 'Karbantartás',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    },
    {
      id: 2,
      _id: 'faq-2',
      question: 'Hogyan válasszam ki a megfelelő tűzoltó készüléket?',
      answer: '<p>A választás függ a védendő terület méretétől és a várható tűzosztálytól. Irodákhoz és lakásokhoz 6 kg-os ABC poroltó ajánlott. Konyhai használatra habbal oltó készülék javasolt.</p>',
      order: 2,
      category: 'Termékinformáció',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    },
    {
      id: 3,
      _id: 'faq-3',
      question: 'Szállítanak Budapesten kívülre is?',
      answer: '<p>Igen, Magyarország teljes területére vállalunk szállítást. A szállítási költség a megrendelés súlyától függ.</p>',
      order: 3,
      category: 'Szállítás',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    },
    {
      id: 4,
      _id: 'faq-4',
      question: 'Hogyan igényelhetek árajánlatot nagyobb mennyiségre?',
      answer: '<p>Nagyobb mennyiségű rendeléshez használja az <a href="/ajanlatkeres">Árajánlat kérés</a> oldalt, ahol megadhatja a kívánt termékeket és mennyiségeket.</p>',
      order: 4,
      category: 'Rendelés',
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
    },
  ];

  const hasCategories = displayFaqs.some((faq: any) => faq.category);

  // Generate FAQ JSON-LD for SEO
  const faqJsonLd = generateFAQJsonLd(
    displayFaqs.map((faq: any) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  );

  return (
    <main className="site-container py-8 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <h1 className="text-3xl font-bold mb-8">Gyakran Ismételt Kérdések</h1>

      <p className="text-muted-foreground mb-8">
        Itt találja a leggyakrabban feltett kérdésekre adott válaszainkat.
        Ha nem találja a keresett információt, kérjük vegye fel velünk a kapcsolatot.
      </p>

      <FAQAccordion faqs={displayFaqs} groupByCategory={hasCategories} />

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Nem találta a választ?</h2>
        <p className="text-muted-foreground mb-4">
          Írjon nekünk és kollégáink készséggel segítenek.
        </p>
        <a
          href="/kapcsolat"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Kapcsolatfelvétel
        </a>
      </div>
    </main>
  );
}
