'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQ } from '@/lib/content-api';

interface FAQAccordionProps {
  faqs: FAQ[];
  groupByCategory?: boolean;
}

export function FAQAccordion({ faqs, groupByCategory = false }: FAQAccordionProps) {
  if (!groupByCategory) {
    return (
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.documentId} value={faq.documentId}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  // Group FAQs by category
  const grouped = faqs.reduce((acc, faq) => {
    const category = faq.category || 'Általános';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryFaqs]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <Accordion type="single" collapsible className="w-full">
            {categoryFaqs.map((faq) => (
              <AccordionItem key={faq.documentId} value={faq.documentId}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
