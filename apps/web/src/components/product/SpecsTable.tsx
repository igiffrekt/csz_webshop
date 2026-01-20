import { getTranslations } from 'next-intl/server';
import type { Specification } from '@csz/types';

interface SpecsTableProps {
  specifications: Specification[];
}

export async function SpecsTable({ specifications }: SpecsTableProps) {
  const t = await getTranslations('product');

  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{t('specifications')}</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y">
            {specifications.map((spec) => (
              <tr key={spec.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium bg-muted/30 w-1/3">
                  {spec.name}
                </td>
                <td className="px-4 py-3">
                  {spec.value}
                  {spec.unit && ` ${spec.unit}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
