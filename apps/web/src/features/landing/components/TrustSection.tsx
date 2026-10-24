import { useTranslation } from "../../../shared/i18n";
import {
  ShieldCheck,
  CheckCheck,
  Star,
  ShieldAlert,
  MapPin,
  AlertCircle,
} from "lucide-react";

export function TrustSection() {
  const { t } = useTranslation("landing");

  const pillars = [
    {
      key: "verification",
      icon: ShieldCheck,
      title: t("trust.pillars.verification.title"),
      desc: t("trust.pillars.verification.desc"),
      tag: "ID Verified",
    },
    {
      key: "twoSided",
      icon: CheckCheck,
      title: t("trust.pillars.twoSided.title"),
      desc: t("trust.pillars.twoSided.desc"),
      tag: "2-Party Check",
    },
    {
      key: "ratings",
      icon: Star,
      title: t("trust.pillars.ratings.title"),
      desc: t("trust.pillars.ratings.desc"),
      tag: "Peer Reviews",
    },
    {
      key: "moderation",
      icon: ShieldAlert,
      title: t("trust.pillars.moderation.title"),
      desc: t("trust.pillars.moderation.desc"),
      tag: "Auto-Moderation",
    },
  ];

  return (
    <section id="trust" className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t("trust.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t("trust.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("trust.subtitle")}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.key}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2 py-0.5 rounded-md bg-muted">
                      {pillar.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Campus Safe Meetup Callout Box */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 text-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {t("trust.notice.title")}
                </h4>
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="h-3 w-3" />
                  In-Person Meetup
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("trust.notice.text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
