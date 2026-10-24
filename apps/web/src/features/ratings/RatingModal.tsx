import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api/api-client';
import { Modal } from '../../shared/components/ui/Modal';
import { Button } from '../../shared/components/ui/Button';
import { StarRating } from './StarRating';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { getErrorMessage } from '../../shared/utils/errors';

export interface DealForReview {
  transactionId: string;
  title?: string;
  counterparty?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealForReview | null;
  onSuccess?: () => void;
}

export function RatingModal({
  isOpen,
  onClose,
  deal,
  onSuccess,
}: RatingModalProps) {
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Reset state when opening/closing or deal changes
  useEffect(() => {
    if (isOpen) {
      setRating(5);
      setComment('');
      setErrorMessage(null);
      setAlreadyExists(false);
      setSubmittedSuccess(false);
    }
  }, [isOpen, deal?.transactionId]);

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!deal?.transactionId) return;
      const res = await api.post('/ratings', {
        transactionId: deal.transactionId,
        rating,
        comment: comment.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setSubmittedSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['user-ratings'] });
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    },
    onError: (err: any) => {
      const code = err.response?.data?.error?.code;
      const rawMessage = err.response?.data?.error?.message || '';

      // Gracefully handle ALREADY_EXISTS or 409 Conflict error
      if (
        code === 'ALREADY_EXISTS' ||
        err.response?.status === 409 ||
        rawMessage.toLowerCase().includes('already submitted')
      ) {
        setAlreadyExists(true);
        setErrorMessage('You have already submitted a review for this deal.');
      } else {
        setErrorMessage(
          getErrorMessage(err, 'Failed to submit review. Please try again.')
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (comment.length > 1000) {
      setErrorMessage('Comment cannot exceed 1000 characters.');
      return;
    }

    reviewMutation.mutate();
  };

  const counterpartyName = deal?.counterparty
    ? `${deal.counterparty.firstName || ''} ${deal.counterparty.lastName || ''}`.trim()
    : 'counterparty';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Your Experience"
      description={`Share peer feedback for ${counterpartyName} to help keep the campus marketplace safe and trusted.`}
    >
      {submittedSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-base text-foreground">Review Submitted!</h4>
          <p className="text-xs text-muted-foreground">
            Thank you for building campus trust and strengthening the student community.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Deal Context Snippet */}
          {deal?.title && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
              <span className="text-muted-foreground">Deal: </span>
              <span className="font-semibold text-foreground">{deal.title}</span>
            </div>
          )}

          {/* Graceful ALREADY_EXISTS Notification */}
          {alreadyExists && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 p-3.5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Review Already Recorded</p>
                <p>
                  You have already submitted a review for this transaction. Thank you for your feedback!
                </p>
              </div>
            </div>
          )}

          {/* Generic Error Notification */}
          {errorMessage && !alreadyExists && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Star Rating Input (1-5 Stars) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Star Rating (1 - 5)
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                interactive={!alreadyExists}
                size="lg"
                onChange={(val) => {
                  setRating(val);
                  setErrorMessage(null);
                }}
              />
              <span className="text-sm font-bold text-amber-500">
                {rating === 1 && '1 Star - Poor'}
                {rating === 2 && '2 Stars - Fair'}
                {rating === 3 && '3 Stars - Good'}
                {rating === 4 && '4 Stars - Very Good'}
                {rating === 5 && '5 Stars - Excellent'}
              </span>
            </div>
          </div>

          {/* Comment Textarea (<= 1000 characters) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Review Feedback (Optional)
              </label>
              <span
                className={`text-[10px] font-medium ${
                  comment.length > 1000 ? 'text-red-600 font-bold' : 'text-muted-foreground'
                }`}
              >
                {comment.length} / 1000
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={1000}
              disabled={alreadyExists}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Share details on handover punctuality, item condition, or communication..."
              className="w-full rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={onClose}>
              {alreadyExists ? 'Close' : 'Cancel'}
            </Button>
            {!alreadyExists && (
              <Button
                type="submit"
                className="font-bold shadow-xs px-5"
                isLoading={reviewMutation.isPending}
              >
                Submit Review
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}

export default RatingModal;
