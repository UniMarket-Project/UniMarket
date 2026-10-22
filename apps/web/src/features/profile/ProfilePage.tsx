import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { Avatar } from '../../shared/components/ui/Avatar';
import { VerificationBadge } from '../../shared/components/ui/Badge';
import { Button } from '../../shared/components/ui/Button';
import { ListingCard } from '../listings/ListingCard';
import { RatingDistribution } from '../ratings/RatingDistribution';
import { ReviewList } from '../ratings/ReviewList';
import { Star, MapPin, Package, MessageSquare } from 'lucide-react';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();

  const targetUserId = id || currentUser?.userId;

  // 1. Fetch Profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const res = await api.get(`/users/${targetUserId}`);
      return res.data.data;
    },
    enabled: !!targetUserId,
  });

  // 2. Fetch User Listings
  const { data: listingsData } = useQuery({
    queryKey: ['user-listings', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const res = await api.get(`/users/${targetUserId}/listings`);
      return res.data.data.listings || res.data.data.items || [];
    },
    enabled: !!targetUserId,
  });

  // 3. Fetch User Ratings Summary (Average, Total, Distribution)
  const { data: ratingsSummaryData } = useQuery({
    queryKey: ['user-ratings-summary', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const res = await api.get(`/ratings/users/${targetUserId}`, {
        params: { limit: 1 },
      });
      return res.data.data;
    },
    enabled: !!targetUserId,
  });

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-xs text-muted-foreground">
        <div className="animate-spin h-7 w-7 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
        Loading campus profile...
      </div>
    );
  }

  // Profile data is returned under user property from public profile endpoint
  const targetUser = profileData?.user || profileData?.profile;
  const isMe = currentUser?.userId === (targetUserId || targetUser?.userId);

  const profile =
    targetUser ||
    (isMe && currentUser
      ? {
          userId: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          userType: currentUser.userType,
          verificationStatus: currentUser.verificationStatus,
          avatarUrl: currentUser.avatarUrl,
          bio: currentUser.bio,
          address: currentUser.address,
          averageRating: currentUser.averageRating || 0,
          totalRatings: currentUser.totalRatings || 0,
          totalTransactions: currentUser.totalTransactions || 0,
        }
      : null);

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">User profile not found.</p>
        <p className="text-xs text-muted-foreground">
          This user may have deleted their account or the ID is invalid.
        </p>
      </div>
    );
  }

  const listings = listingsData || [];
  const averageRating =
    ratingsSummaryData?.averageRating ?? profile.averageRating ?? 0;
  const totalRatings =
    ratingsSummaryData?.totalRatings ?? profile.totalRatings ?? 0;
  const distribution = ratingsSummaryData?.distribution || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Profile Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar
            src={profile.avatarUrl}
            name={`${profile.firstName} ${profile.lastName}`}
            size="xl"
            className="ring-4 ring-emerald-500/20"
          />

          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  Campus Member ({profile.userType})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <VerificationBadge status={profile.verificationStatus} />
                {isMe ? (
                  <Link to="/my-listings">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Package className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Manage My Items</span>
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to="/messages"
                    state={{
                      partnerId: profile.userId,
                      partner: profile,
                    }}
                  >
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Message</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {profile.address && (
              <p className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground pt-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{profile.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Reputation Metric Counters */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border text-center">
          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-lg">
              <Star className="h-4 w-4 fill-amber-500" />
              <span>{averageRating ? Number(averageRating).toFixed(1) : '5.0'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Campus Rating</p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-foreground font-extrabold text-lg">{totalRatings}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Reviews</p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
              {profile.totalTransactions || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Completed Deals</p>
          </div>
        </div>
      </div>

      {/* Active Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Listings by {profile.firstName} ({listings.length})
          </h2>
          {isMe && (
            <Link to="/create-listing">
              <Button size="sm">Add Listing</Button>
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No active listings currently posted.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((l: any) => (
              <ListingCard key={l.listingId} listing={l} />
            ))}
          </div>
        )}
      </div>

      {/* Ratings & Reviews Section (FE-17: Distribution & Paginated Reviews) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Campus Peer Reviews ({totalRatings})
        </h2>

        {/* Rating Breakdown & Distribution */}
        {totalRatings > 0 && (
          <RatingDistribution
            averageRating={Number(averageRating) || 0}
            totalRatings={totalRatings}
            distribution={distribution}
          />
        )}

        {/* Paginated Reviews List with Sorting */}
        {targetUserId && <ReviewList userId={targetUserId} />}
      </div>
    </div>
  );
}

export default ProfilePage;
