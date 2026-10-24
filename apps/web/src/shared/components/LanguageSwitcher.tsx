import { useTranslation } from "../i18n";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "am" : "en";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ${className}`}
      title={currentLang === "en" ? "Switch to Amharic" : "Switch to English"}
      aria-label="Change language"
    >
      <Globe className="h-3.5 w-3.5 text-emerald-600" />
      <span>{currentLang === "en" ? "EN" : "አማ"}</span>
    </button>
  );
}
