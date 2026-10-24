import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n";
import { Button } from "../../../shared/components/ui/Button";
import {
  BookOpen,
  Laptop,
  Home,
  PenTool,
  Wrench,
  Bus,
  ArrowRight,
} from "lucide-react";

export function CategoryShowcase() {
  const { t } = useTranslation("landing");

  const categories = [
    {
      id: "Academic Books",
      icon: BookOpen,
      title: t("categories.items.academicBooks.title"),
      desc: t("categories.items.academicBooks.desc"),
      href: "/browse?category=Academic%20Books",
      color:
        "from-emerald-500/10 to-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    },
    {
      id: "Electronics",
      icon: Laptop,
      title: t("categories.items.electronics.title"),
      desc: t("categories.items.electronics.desc"),
      href: "/browse?category=Electronics",
      color: "from-blue-500/10 to-blue-500/5 text-blue-700 dark:text-blue-300",
    },
    {
      id: "Dorm Essentials",
      icon: Home,
      title: t("categories.items.dormEssentials.title"),
      desc: t("categories.items.dormEssentials.desc"),
      href: "/browse?category=Dorm%20Essentials",
      color:
        "from-amber-500/10 to-amber-500/5 text-amber-700 dark:text-amber-300",
    },
    {
      id: "Stationery",
      icon: PenTool,
      title: t("categories.items.stationery.title"),
      desc: t("categories.items.stationery.desc"),
      href: "/browse?category=Stationery",
      color:
        "from-purple-500/10 to-purple-500/5 text-purple-700 dark:text-purple-300",
    },
    {
      id: "Services",
      icon: Wrench,
      title: t("categories.items.services.title"),
      desc: t("categories.items.services.desc"),
      href: "/browse?category=Services",
      color: "from-teal-500/10 to-teal-500/5 text-teal-700 dark:text-teal-300",
    },
    {
      id: "Transport",
      icon: Bus,
      title: t("categories.items.transport.title"),
      desc: t("categories.items.transport.desc"),
      href: "/browse?category=Transport",
      color: "from-sky-500/10 to-sky-500/5 text-sky-700 dark:text-sky-300",
    },
  ];

  return (
    <section
      id="categories"
      className="py-12 sm:py-16 bg-muted/30 border-y border-border/60"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <span>{t("categories.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t("categories.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("categories.subtitle")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Browse items</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-2">
          <Link to="/browse">
            <Button
              variant="outline"
              size="md"
              className="gap-2 font-bold text-xs sm:text-sm"
            >
              <span>{t("categories.exploreAll")}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
