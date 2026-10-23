import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import { ShoppingBag } from "lucide-react";

export function Footer() {
  const { t } = useTranslation("landing");

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-foreground tracking-tight">
                Uni<span className="text-emerald-600">Market</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  to="/browse"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.browse")}
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.demands")}
                </Link>
              </li>
              <li>
                <a
                  href="#categories"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("nav.categories")}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("nav.howItWorks")}
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Safety & Account
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#trust"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.safetyTips")}
                </a>
              </li>
              <li>
                <a
                  href="#trust"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.moderation")}
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.signIn")}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t("footer.register")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Addis Ababa University Pilot
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
