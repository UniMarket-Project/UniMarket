import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../shared/i18n';
import { Button } from '../../../shared/components/ui/Button';
import { Sheet } from '../../../shared/components/ui/Sheet';
import { LanguageSwitcher } from '../../../shared/components/LanguageSwitcher';
import {
  GraduationCap,
  Menu,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Grid,
  ArrowRight,
} from 'lucide-react';

export function LandingNavbar() {
  const { t } = useTranslation('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#how-it-works', label: t('nav.howItWorks'), icon: HelpCircle },
    { href: '#categories', label: t('nav.categories'), icon: Grid },
    { href: '#ways-to-trade', label: t('nav.waysToTrade'), icon: Sparkles },
    { href: '#trust', label: t('nav.trust'), icon: ShieldCheck },
    { href: '#faq', label: t('nav.faq'), icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              UniMarket
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-wider text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
              {t('nav.campusBadge')}
            </span>
          </div>
        </Link>

        {/* Desktop Anchor Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold text-muted-foreground">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions & Language Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <LanguageSwitcher />

          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-xs">
              {t('nav.signIn')}
            </Button>
          </Link>

          <Link to="/register">
            <Button size="sm" className="font-bold text-xs gap-1.5 shadow-sm">
              <span>{t('nav.getStarted')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="UniMarket AAU"
      >
        <div className="flex flex-col h-full justify-between space-y-6">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition-colors"
                >
                  <Icon className="h-4 w-4 text-emerald-600" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="space-y-3 pt-6 border-t border-border">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
              <Button variant="outline" className="w-full font-semibold">
                {t('nav.signIn')}
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
              <Button className="w-full font-bold gap-2">
                <span>{t('nav.getStarted')}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
