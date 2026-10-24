import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../shared/api/api-client';
import { Avatar } from '../../shared/components/ui/Avatar';
import { Button } from '../../shared/components/ui/Button';
import { StarRating } from './StarRating';
import { MessageSquare, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export interface ReviewItem {
  ratingId: string;
  rating: number;
  comment?: string | null;
  reviewer: {
    userId: string;
    firstName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

export interface ReviewListProps {
  userId: string;
}

export function ReviewList({ userId }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const limit = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['user-ratings', userId, page, sortBy],
    queryFn: async () => {
      const res = await api.get(`/ratings/users/${userId}`, {
        params: { page, limit, sortBy },
      });
      return res.data.data;
    },
    enabled: !!userId,
  });

  const reviews: ReviewItem[] = data?.reviews || [];
  const pagination = data?.pagination || {
    page: 1,
    limit,
    total: reviews.length,
    hasMore: false,
  };

  const totalPages = Math.ceil((pagination.total || 0) / limit) || 1;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-2xl border border-border bg-card p-4 h-24 animate-pulse space-y-2"
          />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground space-y-2">
        <MessageSquare className="h-7 w-7 mx-auto text-muted-foreground/60" />
        <p className="font-semibold text-foreground">No campus reviews yet</p>
        <p>Complete a verified deal with this student to leave the first review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls: Sort Order */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold text-muted-foreground">
          Showing {reviews.length} of {pagination.total || reviews.length} reviews
        </span>

        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.ratingId}
            className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-2xs hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/users/${rev.reviewer.userId}`}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <Avatar
                  src={rev.reviewer.avatarUrl ?? undefined}
                  name={rev.reviewer.firstName}
                  size="sm"
                />
                <div>
                  <p className="font-bold text-xs text-foreground hover:underline">
                    {rev.reviewer.firstName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Link>

              <StarRating rating={rev.rating} size="sm" />
            </div>

            {rev.comment && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-1 border-l-2 border-emerald-500/40">
                "{rev.comment}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>

          <span className="text-xs text-muted-foreground font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
