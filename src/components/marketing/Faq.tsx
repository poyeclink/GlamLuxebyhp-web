import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";

export type FaqItem = AccordionItem;

// El JSON-LD FAQPage le da a Google las mismas preguntas como rich result.
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <>
      <Accordion items={items} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
    </>
  );
}
