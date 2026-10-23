import { Link } from 'react-router-dom';
import { useTranslation } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  ShieldCheck,
  MapPin,
  Handshake,
  Star,
  ArrowRight,
  BookOpen,
  Flame,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Campus Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-800 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
              {t('hero.title')}
            </h1>

            {/* Subcopy */}
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-7 font-bold text-base gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all"
                >
                  <span>{t('hero.getStarted')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/browse" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-7 font-semibold text-base border-border hover:bg-muted/60"
                >
                  {t('hero.browseListings')}
                </Button>
              </Link>
            </div>

            {/* Trust Strip */}
            <div className="pt-6 border-t border-border/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t('hero.trustStrip.verified')}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t('hero.trustStrip.campus')}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
                  <Handshake className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t('hero.trustStrip.confirm')}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>{t('hero.trustStrip.rate')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mock Composition (Pure Components, No Stock Photos) */}
          <div className="lg:col-span-5 relative">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-3xl blur-2xl -z-10" />

            <div className="space-y-3.5 relative">
              {/* Floating Verified Badge */}
              <div className="absolute -top-3 -right-2 sm:-right-4 z-20 bg-background/95 border border-emerald-500/40 rounded-full px-3 py-1 shadow-lg flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 backdrop-blur-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{t('hero.mock.verifiedPill')}</span>
              </div>

              {/* Mock Card 1: Academic Textbook */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {t('hero.mock.card1.category')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {t('hero.mock.card1.title')}
                      </h4>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 shrink-0">
                    {t('hero.mock.card1.price')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>{t('hero.mock.card1.seller')}</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    ★ 4.9 <span className="text-[10px] text-muted-foreground font-normal">(18 deals)</span>
                  </span>
                </div>
              </div>

              {/* Mock Card 2: Dorm Rental */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-2.5 translate-x-1 sm:translate-x-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="verified" className="text-[10px] py-0 px-1.5">
                          {t('hero.mock.card2.type')}
                        </Badge>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {t('hero.mock.card2.title')}
                      </h4>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-foreground shrink-0">
                    {t('hero.mock.card2.price')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  <span>📍 {t('hero.mock.card2.location')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Available
                  </span>
                </div>
              </div>

              {/* Mock Card 3: Student Request Board Demand */}
              <div className="rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded">
                      {t('hero.mock.card3.type')}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                      {t('hero.mock.card3.badge')}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">AAU 4-Kilo</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wrench className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-xs font-bold text-foreground truncate">
                      {t('hero.mock.card3.title')}
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg shrink-0">
                    {t('hero.mock.card3.cta')} &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
