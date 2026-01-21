import { Link } from '@/i18n/navigation';
import { Facebook, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, Send } from 'lucide-react';

const productLinks = [
  { label: 'Tűzoltó készülékek', href: '/kategoriak/tuzolto-keszulekek' },
  { label: 'Tűzjelző rendszerek', href: '/kategoriak/tuzjelzo-rendszerek' },
  { label: 'Védőfelszerelések', href: '/kategoriak/vedofelszerelesek' },
  { label: 'Kiegészítők', href: '/kategoriak/kiegeszitok' },
  { label: 'Akciók', href: '/termekek?onSale=true' },
];

const companyLinks = [
  { label: 'Rólunk', href: '/rolunk' },
  { label: 'Kapcsolat', href: '/kapcsolat' },
  { label: 'GYIK', href: '/gyik' },
  { label: 'Blog', href: '/blog' },
  { label: 'Árajánlat kérés', href: '/ajanlatkeres' },
];

const supportLinks = [
  { label: 'Szállítási információk', href: '/szallitas' },
  { label: 'Visszaküldés', href: '/visszaterites' },
  { label: 'ÁSZF', href: '/aszf' },
  { label: 'Adatvédelem', href: '/adatvedelem' },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:pr-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                CSZ <span className="text-primary-500">Tűzvédelem</span>
              </span>
            </Link>
            <p className="text-secondary-400 text-sm mt-4 leading-relaxed max-w-xs">
              Professzionális tűzvédelmi megoldások üzletek, irodák és otthonok számára. CE tanúsított termékek.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-3">
              <a
                href="tel:+3612345678"
                className="flex items-center gap-3 text-secondary-400 hover:text-primary-500 transition-colors group"
              >
                <Phone className="h-4 w-4 group-hover:text-primary-500" />
                <span className="text-sm">+36 1 234 5678</span>
              </a>
              <a
                href="mailto:info@csz-tuzvedelmi.hu"
                className="flex items-center gap-3 text-secondary-400 hover:text-primary-500 transition-colors group"
              >
                <Mail className="h-4 w-4 group-hover:text-primary-500" />
                <span className="text-sm">info@csz-tuzvedelmi.hu</span>
              </a>
              <div className="flex items-start gap-3 text-secondary-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-sm">1234 Budapest, Példa utca 123.</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-secondary-800 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Termékek
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 text-sm hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Cégünk
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 text-sm hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Támogatás
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 text-sm hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Hírlevél
            </h4>
            <p className="text-secondary-400 text-sm mb-4 leading-relaxed">
              Iratkozzon fel hírlevelünkre az akciókért és újdonságokért.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email cím"
                className="flex-1 px-4 py-2.5 bg-secondary-800 border border-secondary-700 rounded-lg text-sm placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                aria-label="Feliratkozás"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Payment methods hint */}
            <p className="text-secondary-500 text-xs mt-4">
              Biztonságos fizetés: Stripe, Bankkártya
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-800">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-secondary-400">
            <p>
              © {currentYear} CSZ Tűzvédelmi Kft. Minden jog fenntartva.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/aszf" className="hover:text-primary-500 transition-colors">
                ÁSZF
              </Link>
              <Link href="/adatvedelem" className="hover:text-primary-500 transition-colors">
                Adatvédelem
              </Link>
              <Link href="/cookie" className="hover:text-primary-500 transition-colors">
                Cookie szabályzat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
