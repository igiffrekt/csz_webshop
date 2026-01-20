import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function ProductNotFound() {
  const t = await getTranslations('product');

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">{t('notFound')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('notFoundDescription')}
      </p>
      <Link href="/termekek">
        <Button>{t('backToProducts')}</Button>
      </Link>
    </main>
  );
}
