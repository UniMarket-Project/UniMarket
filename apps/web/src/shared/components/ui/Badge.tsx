import { cn } from '../../utils/cn';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'pending' | 'unverified' | 'outline' | 'deal' | 'category';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    unverified: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    outline: 'border border-border text-foreground',
    deal: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    category: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function VerificationBadge({ status }: { status: 'verified' | 'pending' | 'unverified' | string }) {
  if (status === 'verified') {
    return (
      <Badge variant="verified">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Verified Campus ID</span>
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="pending">
        <Clock className="h-3 w-3 text-amber-600" />
        <span>Pending Review</span>
      </Badge>
    );
  }
  return (
    <Badge variant="unverified">
      <AlertTriangle className="h-3 w-3 text-slate-500" />
      <span>Unverified</span>
    </Badge>
  );
}
