import { Link } from '@/i18n/navigation';
import { Facebook, Instagram, Linkedin, Youtube, Twitter, Phone, Mail, MapPin, Send } from 'lucide-react';

const productLinks = [
  { label: 'Tűzoltó készülékek', href: '/kategoriak/tuzolto-keszulekek' },
  { label: 'Tűzjelző rendszerek', href: '/kategoriak/tuzjelzo-rendszerek' },
  { label: 'Védőfelszerelések', href: '/kategoriak/vedofelszerelesek' },
  { label: 'Kiegészítők', href: '/kategoriak/kiegeszitok' },
  { label: 'Akciók', href: '/termekek?onSale=true' },
];

const companyLinks = [
  { label: 'Rólunk', href: '/rolunk' },
  { label: 'Csapatunk', href: '/csapat' },
  { label: 'Blog', href: '/blog' },
  { label: 'Karrier', href: '/karrier' },
  { label: 'Partnereink', href: '/partnerek' },
];

const resourceLinks = [
  { label: 'GYIK', href: '/gyik' },
  { label: 'Szállítás', href: '/szallitas' },
  { label: 'Visszaküldés', href: '/visszaterites' },
  { label: 'ÁSZF', href: '/aszf' },
  { label: 'Adatvédelem', href: '/adatvedelem' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="site-container py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pr-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                CSZ <span className="text-amber-400">Tűzvédelem</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed max-w-sm">
              Professzionális tűzvédelmi megoldások üzletek, irodák és otthonok számára. CE tanúsított termékek széles választéka.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-gray-900 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              Termékek
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
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

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              Cégünk
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
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

          {/* Resource links */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              Erőforrások
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
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
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="site-container py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              © {currentYear} CSZ Tűzvédelmi Kft. Minden jog fenntartva.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/aszf" className="hover:text-amber-400 transition-colors">
                ÁSZF
              </Link>
              <Link href="/adatvedelem" className="hover:text-amber-400 transition-colors">
                Adatvédelem
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
