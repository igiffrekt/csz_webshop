import { getTranslations } from 'next-intl/server';
import { FileText, Download } from 'lucide-react';
import { getStrapiMediaUrl } from '@/lib/formatters';
import type { StrapiMedia } from '@csz/types';

interface DocumentListProps {
  documents: StrapiMedia[];
}

export async function DocumentList({ documents }: DocumentListProps) {
  const t = await getTranslations('product');

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{t('documents')}</h2>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <a
              href={getStrapiMediaUrl(doc.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate">{doc.name}</span>
              <Download className="h-4 w-4 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
