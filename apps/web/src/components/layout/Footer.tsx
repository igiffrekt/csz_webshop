import { Link } from '@/i18n/navigation';
import { Facebook, Youtube, Linkedin } from 'lucide-react';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  youtube: Youtube,
  tiktok: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.12z" />
    </svg>
  ),
  linkedin: Linkedin,
};

const defaultLinkColumns = [
  {
    _key: 'products',
    title: 'Termékek',
    links: [
      { _key: '1', label: 'Tűzoltó készülékek', href: '/kategoriak/tuzolto-keszulekek' },
      { _key: '2', label: 'Tűzjelző rendszerek', href: '/kategoriak/tuzjelzo-rendszerek' },
      { _key: '3', label: 'Védőfelszerelések', href: '/kategoriak/vedofelszerelesek' },
      { _key: '4', label: 'Kiegészítők', href: '/kategoriak/kiegeszitok' },
      { _key: '5', label: 'Akciók', href: '/termekek?onSale=true' },
    ],
  },
  {
    _key: 'company',
    title: 'Cégünk',
    links: [
      { _key: '1', label: 'Rólunk', href: '/rolunk' },
      { _key: '2', label: 'Kapcsolat', href: '/kapcsolat' },
      { _key: '3', label: 'Árajánlat kérés', href: '/ajanlatkeres' },
    ],
  },
  {
    _key: 'resources',
    title: 'Erőforrások',
    links: [
      { _key: '1', label: 'GYIK', href: '/gyik' },
      { _key: '2', label: 'Visszaküldés', href: '/visszaterites' },
      { _key: '3', label: 'ÁSZF', href: '/aszf' },
      { _key: '4', label: 'Adatvédelem', href: '/adatvedelem' },
    ],
  },
];

const defaultSocialLinks = [
  { _key: 'fb', platform: 'facebook', url: 'https://facebook.com' },
];

const defaultBottomBarLinks = [
  { _key: '1', label: 'ÁSZF', href: '/aszf' },
  { _key: '2', label: 'Adatvédelem', href: '/adatvedelem' },
];

const defaultCompanyDescription =
  'Immáron 40 éve kezdtük el tevékenységünket, a tűzvédelem terén. Az általunk kifejlesztett, és folyamatosan továbbfejlesztett tűzoltó szerelvények jelenleg is a tűzvédelmi piac fontos részei. Ennek kiegészítéseként, 20 éve kezdtük el a szerelvényekhez tartozó tűzcsapszekrények gyártását.';

interface FooterLink {
  _key: string;
  label: string;
  href: string;
}

interface FooterLinkColumn {
  _key: string;
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink {
  _key: string;
  platform: string;
  url: string;
}

export interface FooterData {
  companyDescription?: string | null;
  socialLinks?: FooterSocialLink[] | null;
  linkColumns?: FooterLinkColumn[] | null;
  bottomBarLinks?: FooterLink[] | null;
  copyrightText?: string | null;
}

export function Footer({ data }: { data?: FooterData | null }) {
  const currentYear = new Date().getFullYear();
  const companyDescription = data?.companyDescription || defaultCompanyDescription;
  const socialLinks = data?.socialLinks?.length ? data.socialLinks : defaultSocialLinks;
  const linkColumns = data?.linkColumns?.length ? data.linkColumns : defaultLinkColumns;
  const bottomLinks = data?.bottomBarLinks?.length ? data.bottomBarLinks : defaultBottomBarLinks;
  const copyrightText = data?.copyrightText || `© ${currentYear} Dunamenti CSZ Kft. Minden jog fenntartva.`;

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="site-container py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pr-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                Dunamenti <span className="text-amber-400">CSZ</span> Kft.
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-sm">
              {companyDescription}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => {
                const Icon = platformIcons[social.platform];
                if (!Icon) return null;
                return (
                  <a
                    key={social._key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-gray-900 transition-colors"
                    aria-label={social.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Dynamic link columns */}
          {linkColumns.map((column) => (
            <div key={column._key}>
              <h4 className="font-semibold text-white mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {(column.links || []).map((link) => (
                  <li key={link._key}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="site-container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>{copyrightText}</p>
            <div className="flex items-center gap-6">
              {bottomLinks.map((link) => (
                <Link
                  key={link._key}
                  href={link.href}
                  className="hover:text-amber-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
