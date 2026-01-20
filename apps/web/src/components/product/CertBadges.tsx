import { getTranslations } from 'next-intl/server';
import { Shield, Award } from 'lucide-react';
import type { Certification } from '@csz/types';

interface CertBadgesProps {
  certifications: Certification[];
}

export async function CertBadges({ certifications }: CertBadgesProps) {
  const t = await getTranslations('product');

  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {t('certifications')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md text-green-800"
            title={cert.standard || cert.name}
          >
            {cert.name.includes('CE') ? (
              <Shield className="h-4 w-4" />
            ) : (
              <Award className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{cert.name}</span>
            {cert.standard && (
              <span className="text-xs text-green-600">({cert.standard})</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
