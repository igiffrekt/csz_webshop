import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getCategories } from '@/lib/api';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Grid3X3 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('categories');
  return {
    title: t('title'),
    description: 'Böngéssze tűzvédelmi eszköz kategóriáink között',
  };
}

export default async function CategoriesPage() {
  const t = await getTranslations('categories');
  const categoriesResponse = await getCategories();

  // Filter to top-level categories only (those without parent)
  const topLevelCategories = categoriesResponse.data.filter((cat) => !cat.parent);

  return (
    <div className="bg-secondary-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Grid3X3 className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900">{t('title')}</h1>
              <p className="text-secondary-600 mt-1">
                Válogasson professzionális tűzvédelmi termékeink között
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {topLevelCategories.length > 0 ? (
          <CategoryGrid categories={topLevelCategories} />
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary-600">{t('noCategories')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
