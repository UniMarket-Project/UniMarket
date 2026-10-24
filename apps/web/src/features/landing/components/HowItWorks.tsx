import { useTranslation } from "../../../shared/i18n";
import { UserCheck, PlusCircle, MessageSquare, Handshake } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation("landing");

  const steps = [
    {
      num: t("howItWorks.steps.step1.number"),
      icon: UserCheck,
      title: t("howItWorks.steps.step1.title"),
      desc: t("howItWorks.steps.step1.desc"),
    },
    {
      num: t("howItWorks.steps.step2.number"),
      icon: PlusCircle,
      title: t("howItWorks.steps.step2.title"),
      desc: t("howItWorks.steps.step2.desc"),
    },
    {
      num: t("howItWorks.steps.step3.number"),
      icon: MessageSquare,
      title: t("howItWorks.steps.step3.title"),
      desc: t("howItWorks.steps.step3.desc"),
    },
    {
      num: t("howItWorks.steps.step4.number"),
      icon: Handshake,
      title: t("howItWorks.steps.step4.title"),
      desc: t("howItWorks.steps.step4.desc"),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 bg-muted/30 border-y border-border/60"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <span>{t("howItWorks.badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t("howItWorks.title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Step Header with Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600/40 dark:text-emerald-500/30">
                      {step.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Step Connector Indicator */}
                <div className="pt-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Step {idx + 1} of 4
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
