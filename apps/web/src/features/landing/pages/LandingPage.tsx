import { SEO } from "../../../shared/components/SEO";
import { Hero } from "../components/Hero";
import { CategoryShowcase } from "../components/CategoryShowcase";
import { WaysToTrade } from "../components/WaysToTrade";
import { HowItWorks } from "../components/HowItWorks";
import { TrustSection } from "../components/TrustSection";
import { ForWhom } from "../components/ForWhom";
import { FaqSection } from "../components/FaqSection";
import { FinalCta } from "../components/FinalCta";
import { useTranslation } from "../../../shared/i18n";

export function LandingPage() {
  const { t } = useTranslation("landing");

  return (
    <>
      <SEO
        title={t("hero.title") ? `UniMarket – ${t("hero.title")}` : undefined}
        description={t("hero.subtitle") || undefined}
      />
      <div className="flex flex-col w-full overflow-x-hidden">
        <Hero />
        <CategoryShowcase />
        <WaysToTrade />
        <HowItWorks />
        <TrustSection />
        <ForWhom />
        <FaqSection />
        <FinalCta />
      </div>
    </>
  );
}
