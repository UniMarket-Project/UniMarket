import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../shared/utils/cn';

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      onMouseLeave={() => interactive && setHoverRating(null)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rating selector' : `Rating: ${rating} out of ${maxRating} stars`}
    >
      {Array.from({ length: maxRating }, (_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= currentRating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={starValue === rating}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              className="p-1 rounded-md hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Star
                className={cn(
                  starSizes[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                )}
              />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={cn(
              starSizes[size],
              isFilled
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            )}
          />
        );
      })}
    </div>
  );
}

export default StarRating;
