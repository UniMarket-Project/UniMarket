import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n";
import {
  ShoppingBag,
  Calendar,
  Share2,
  Wrench,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export function WaysToTrade() {
  const { t } = useTranslation("landing");

  const tradeModes = [
    {
      icon: ShoppingBag,
      title: t("waysToTrade.items.buy.title"),
      desc: t("waysToTrade.items.buy.desc"),
      href: "/browse?type=sell",
      badge: "Direct Purchase",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      icon: Calendar,
      title: t("waysToTrade.items.rent.title"),
      desc: t("waysToTrade.items.rent.desc"),
      href: "/browse?type=rent",
      badge: "Weekly or Semester",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      icon: Share2,
      title: t("waysToTrade.items.lend.title"),
      desc: t("waysToTrade.items.lend.desc"),
      href: "/browse?type=lend",
      badge: "Free Peer Sharing",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    },
    {
      icon: Wrench,
      title: t("waysToTrade.items.services.title"),
      desc: t("waysToTrade.items.services.desc"),
      href: "/browse?type=service",
      badge: "Student Skills",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      icon: HelpCircle,
      title: t("waysToTrade.items.requests.title"),
      desc: t("waysToTrade.items.requests.desc"),
      href: "/requests",
      badge: "Demand Board",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
  ];

  return (
    <section id="ways-to-trade" className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <span>{t("waysToTrade.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t("waysToTrade.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("waysToTrade.subtitle")}
          </p>
        </div>

        {/* Trade Modes Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tradeModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Link
                key={mode.title}
                to={mode.href}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950 dark:group-hover:text-emerald-300 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${mode.color}`}
                    >
                      {mode.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore {mode.title}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
