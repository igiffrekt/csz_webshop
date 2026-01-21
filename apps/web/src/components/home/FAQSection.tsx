'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Milyen tűzoltó készülékeket kínálnak?',
    answer: 'Széles választékunkban megtalálhatók a poroltó, CO2, haboltó és vízköddel oltó készülékek különböző méretekben (1kg-tól 50kg-ig). Minden termékünk CE tanúsítvánnyal rendelkezik és megfelel az európai szabványoknak.',
  },
  {
    question: 'Milyen fizetési módokat fogadnak el?',
    answer: 'Elfogadunk bankkártyás fizetést (Visa, Mastercard), átutalást, és utánvétet is. Cégek részére lehetőség van halasztott fizetésre is előzetes egyeztetés alapján. Online fizetéseinket a Stripe biztonságos fizetési rendszere kezeli.',
  },
  {
    question: 'Hogyan követhetem a rendelésem állapotát?',
    answer: 'A rendelés leadása után e-mailben értesítjük a rendelés állapotáról. A fiókjába bejelentkezve nyomon követheti csomagja útját. A szállítási értesítőben megtalálja a futárszolgálat nyomkövetési számát is.',
  },
  {
    question: 'Mi a visszaküldési szabályzatuk?',
    answer: 'A termékeket 14 napon belül indoklás nélkül visszaküldheti. A visszaküldéshez kérjük, vegye fel velünk a kapcsolatot e-mailben vagy telefonon. A visszaküldés költségeit az ügyfél viseli, kivéve hibás termék esetén.',
  },
  {
    question: 'Milyen anyagokból készülnek a termékek?',
    answer: 'Tűzoltó készülékeink acél és alumínium hengerből készülnek, porszórt bevonattal a korrózióállóság érdekében. Az oltóanyagok (por, CO2, hab) megfelelnek az MSZ EN szabványoknak.',
  },
  {
    question: 'Vannak kedvezmények vagy akciók?',
    answer: 'Igen! Rendszeresen kínálunk akciókat és mennyiségi kedvezményeket. Iratkozzon fel hírlevelünkre, hogy elsőként értesüljön az aktuális ajánlatokról. Nagyobb mennyiségű rendelés esetén egyedi árajánlatot készítünk.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Second item open by default

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-3">
              GYIK
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Kérdése van? Itt a válasz.
            </h2>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className={cn(
      'border rounded-lg overflow-hidden transition-colors',
      isOpen ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'
    )}>
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-left"
        onClick={onToggle}
      >
        <span className={cn(
          'font-medium',
          isOpen ? 'text-gray-900' : 'text-gray-700'
        )}>
          {question}
        </span>
        <span className={cn(
          'flex-shrink-0 ml-4 w-6 h-6 rounded-full flex items-center justify-center transition-colors',
          isOpen ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-600'
        )}>
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </span>
      </button>

      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}
