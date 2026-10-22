import { useTranslation } from "../../../shared/i18n";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../shared/components/ui/Accordion";
import { HelpCircle } from "lucide-react";

export function FaqSection() {
  const { t } = useTranslation("landing");

  const faqs = [
    { id: "q1", q: t("faq.items.q1"), a: t("faq.items.a1") },
    { id: "q2", q: t("faq.items.q2"), a: t("faq.items.a2") },
    { id: "q3", q: t("faq.items.q3"), a: t("faq.items.a3") },
    { id: "q4", q: t("faq.items.q4"), a: t("faq.items.a4") },
    { id: "q5", q: t("faq.items.q5"), a: t("faq.items.a5") },
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t("faq.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t("faq.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("faq.subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" defaultValue="q1" className="bg-card">
          {faqs.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left font-semibold text-sm sm:text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
