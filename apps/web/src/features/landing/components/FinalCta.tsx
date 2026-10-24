import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n";
import { ArrowRight, Compass, ShieldCheck } from "lucide-react";

export function FinalCta() {
  const { t } = useTranslation("landing");

  return (
    <section className="py-12 sm:py-20 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-xl">
          {/* Subtle background radial light */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Addis Ababa University Pilot</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {t("finalCta.title")}
            </h2>

            <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              {t("finalCta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-emerald-950 shadow-md hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t("finalCta.getStarted")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/browse"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900/60 border border-emerald-400/40 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800/80 transition-all"
              >
                <Compass className="h-4 w-4 text-emerald-300" />
                <span>{t("finalCta.browseCampus")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
