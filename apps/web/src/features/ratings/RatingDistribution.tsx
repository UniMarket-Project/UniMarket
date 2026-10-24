import { Star } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export interface RatingDistributionProps {
  averageRating: number;
  totalRatings: number;
  distribution?: Record<string | number, number>;
  className?: string;
}

export function RatingDistribution({
  averageRating,
  totalRatings,
  distribution = {},
  className,
}: RatingDistributionProps) {
  const starsList = [5, 4, 3, 2, 1];

  const total = totalRatings > 0 ? totalRatings : 0;

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left: Overall Average Score */}
        <div className="flex flex-col items-center justify-center sm:min-w-[130px] text-center p-3 rounded-2xl bg-muted/30">
          <span className="text-4xl font-black text-foreground">
            {averageRating ? averageRating.toFixed(1) : '0.0'}
          </span>
          <div className="flex items-center gap-0.5 text-amber-400 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1.5 font-medium">
            {total} {total === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5">
          {starsList.map((star) => {
            const count = distribution[String(star)] || distribution[star] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-2.5 text-xs">
                {/* Star Label */}
                <div className="flex items-center gap-1 w-12 text-muted-foreground font-medium shrink-0">
                  <span>{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </div>

                {/* Bar */}
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Count & Percentage */}
                <div className="w-12 text-right text-[11px] text-muted-foreground shrink-0 font-medium">
                  {count} <span className="text-[10px] text-muted-foreground/70">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingDistribution;
