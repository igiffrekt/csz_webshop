import { ContactForm } from '@/components/contact';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kapcsolat | Dunamenti CSZ Kft.',
  description: 'Vegye fel velünk a kapcsolatot tűzvédelmi termékeinkkel kapcsolatban',
};

export default function ContactPage() {
  return (
    <main className="site-container py-8">
      <h1 className="text-3xl font-bold mb-8">Kapcsolat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-6">Írjon nekünk</h2>
            <ContactForm />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Elérhetőségeink</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Cím</p>
                  <p className="text-muted-foreground text-sm">
                    2521 Csolnok,<br />
                    Szénbányászok útja 32.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-muted-foreground text-sm">
                    <a href="tel:+3633506690" className="hover:text-primary">
                      +36 33 506 690
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-muted-foreground text-sm">
                    <a href="mailto:info@csz.hu" className="hover:text-primary">
                      info@csz.hu
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Nyitvatartás</p>
                  <p className="text-muted-foreground text-sm">
                    Hétfő - Péntek: 8:00 - 17:00<br />
                    Szombat - Vasárnap: Zárva
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-2">Gyors válaszidő</h3>
            <p className="text-sm text-muted-foreground">
              Megkeresésére általában 24 órán belül válaszolunk munkanapokon.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
