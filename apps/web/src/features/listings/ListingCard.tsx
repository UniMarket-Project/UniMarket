import { Link } from 'react-router-dom';
import { formatETB, cn } from '../../shared/utils/cn';
import { Badge } from '../../shared/components/ui/Badge';
import { formatImageUrl } from '../../shared/utils/media';
import { ShieldCheck, MapPin } from 'lucide-react';

export interface ListingItem {
  listingId: string;
  title: string;
  category: string;
  transactionType: 'sell' | 'rent' | 'lend' | 'exchange' | 'service' | 'food' | 'transport';
  price: number | null;
  currency: string;
  images: string[];
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  location?: { address?: string | null } | null;
  createdBy: {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    verificationStatus: 'unverified' | 'pending' | 'verified';
    averageRating: number;
    totalRatings: number;
    totalTransactions: number;
  };
  viewCount?: number;
  createdAt: string;
}

export function ListingCard({ listing }: { listing: ListingItem }) {
  const defaultImage =
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
  const coverImage = formatImageUrl(
    listing.images && listing.images.length > 0 ? listing.images[0] : defaultImage
  );

  const typeLabels: Record<string, { label: string; color: string }> = {
    sell: { label: 'For Sale', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    rent: { label: 'For Rent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    lend: { label: 'Lending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    exchange: { label: 'Exchange', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    service: { label: 'Service', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    transport: { label: 'Transport', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  };

  const typeConfig = typeLabels[listing.transactionType] || { label: listing.transactionType, color: 'bg-slate-100 text-slate-800' };

  const availabilityConfig: Record<string, { label: string; color: string }> = {
    available: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' },
    busy: { label: 'In Use', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' },
    unavailable: { label: 'Unavailable', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
  };

  const availability = availabilityConfig[listing.availabilityStatus] || availabilityConfig.available;

  return (
    <Link
      to={`/listings/${listing.listingId}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200"
    >
      {/* Thumbnail with overlay badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={coverImage}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Transaction Type Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
        </div>

        {/* Top Right Badges: Category & Availability */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          <Badge variant="category" className="bg-black/60 text-white backdrop-blur-sm">
            {listing.category}
          </Badge>
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md border backdrop-blur-sm shadow-xs', availability.color)}>
            {availability.label}
          </span>
        </div>

        {/* Price Tag in bottom left of image */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-extrabold text-sm shadow">
          {formatETB(listing.price)}
          {listing.transactionType === 'rent' && <span className="text-[10px] font-normal text-slate-300"> /day</span>}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-emerald-600 transition-colors">
          {listing.title}
        </h3>

        {/* Location snippet */}
        {listing.location?.address && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2 line-clamp-1">
            <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
            <span>{listing.location.address}</span>
          </p>
        )}

        {/* Seller Info Footer */}
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{listing.createdBy.firstName}</span>
            {listing.createdBy.verificationStatus === 'verified' && (
              <span title="Verified Campus Student">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              </span>
            )}
          </div>

          {listing.createdBy.averageRating > 0 ? (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold text-[11px]">
              ★ {listing.createdBy.averageRating.toFixed(1)}
              <span className="text-muted-foreground font-normal">({listing.createdBy.totalRatings})</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">New member</span>
          )}
        </div>
      </div>
    </Link>
  );
}
