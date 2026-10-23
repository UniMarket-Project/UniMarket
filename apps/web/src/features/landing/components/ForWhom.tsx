import { useTranslation } from '../../../shared/i18n';
import {
  GraduationCap,
  Briefcase,
  Store,
  Users,
  CheckCircle2,
} from 'lucide-react';

export function ForWhom() {
  const { t } = useTranslation('landing');

  const audiences = [
    {
      key: 'students',
      icon: GraduationCap,
      title: t('forWhom.roles.students.title'),
      desc: t('forWhom.roles.students.desc'),
      bulletPoints: [
        'Affordable semester course textbooks',
        'Dorm furniture & appliances',
        'Student-to-student peer tutoring',
      ],
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      key: 'staff',
      icon: Briefcase,
      title: t('forWhom.roles.staff.title'),
      desc: t('forWhom.roles.staff.desc'),
      bulletPoints: [
        'Academic mentoring & tutoring',
        'Department surplus equipment',
        'Safe campus-only community',
      ],
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      key: 'providers',
      icon: Store,
      title: t('forWhom.roles.providers.title'),
      desc: t('forWhom.roles.providers.desc'),
      bulletPoints: [
        'Phone & laptop hardware diagnostics',
        'Printing, copying & stationery supplies',
        'Direct connection to student demand',
      ],
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
  ];

  return (
    <section id="for-whom" className="py-12 sm:py-16 bg-muted/30 border-y border-border/60">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-bold">
            <Users className="h-3.5 w-3.5" />
            <span>{t('forWhom.badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {t('forWhom.title')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t('forWhom.subtitle')}
          </p>
        </div>

        {/* 3 Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <div
                key={aud.key}
                className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-base sm:text-lg text-foreground">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {aud.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-2">
                  {aud.bulletPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

