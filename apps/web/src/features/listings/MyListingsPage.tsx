import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../shared/api/api-client";
import { useAuthStore } from "../auth/auth.store";
import { formatETB } from "../../shared/utils/cn";
import { Button } from "../../shared/components/ui/Button";
import { Badge } from "../../shared/components/ui/Badge";
import { EditListingModal, EditableListing } from "./EditListingModal";
import {
  Package,
  PlusCircle,
  Edit3,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
} from "lucide-react";

export function MyListingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [editingListing, setEditingListing] = useState<EditableListing | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-listings", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const res = await api.get(`/users/${user.userId}/listings`);
      return res.data.data.listings || res.data.data.items || [];
    },
    enabled: !!user?.userId,
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({
      listingId,
      currentStatus,
    }: {
      listingId: string;
      currentStatus: string;
    }) => {
      const nextStatus =
        currentStatus === "available" ? "unavailable" : "available";
      await api.patch(`/listings/${listingId}`, {
        availabilityStatus: nextStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  const listings: any[] = data || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <Package className="h-4 w-4" />
              <span>Seller Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Items & Listings
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
              Manage your active offerings, update prices, adjust inventory, or
              mark items as sold. Your items are visible to all students on
              campus.
            </p>
          </div>

          <Link to="/create-listing" className="shrink-0">
            <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40">
              <PlusCircle className="h-4 w-4" />
              <span>List New Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Listing Cards List */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-muted-foreground mt-3">
            Loading your listings...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-600 font-semibold">
            Failed to load your listings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["my-listings"] })
            }
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              You don't have any items listed yet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Sell textbooks you've completed, dorm gear you no longer need, or
              offer academic tutoring to other students.
            </p>
          </div>
          <Link to="/create-listing" className="inline-block">
            <Button size="sm" className="gap-1.5 font-bold">
              <PlusCircle className="h-4 w-4" />
              <span>Post Your First Item</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing {listings.length}{" "}
              {listings.length === 1 ? "item" : "items"} in your inventory
            </span>
            <span>Click Edit to change price, stock, or photos</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {listings.map((item) => {
              const imgUrl =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400";
              const isAvailable =
                item.availabilityStatus === "available" &&
                item.quantityAvailable > 0;

              return (
                <div
                  key={item.listingId}
                  className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:shadow transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      <img
                        src={imgUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                          {item.transactionType}
                        </span>
                        <Badge variant="category">{item.category}</Badge>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isAvailable
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                Available ({item.quantityAvailable} in stock)
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Sold Out / Unavailable</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatETB(item.price)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{item.viewCount || 0} views</span>
                        </span>
                        <span>
                          Listed {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <button
                      onClick={() =>
                        toggleAvailabilityMutation.mutate({
                          listingId: item.listingId,
                          currentStatus: item.availabilityStatus,
                        })
                      }
                      disabled={toggleAvailabilityMutation.isPending}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                      title={
                        isAvailable
                          ? "Mark as Sold/Unavailable"
                          : "Mark as Available"
                      }
                    >
                      {item.availabilityStatus === "available" ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                          <span>Mark Unavailable</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-slate-400" />
                          <span>Mark Available</span>
                        </>
                      )}
                    </button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs font-semibold"
                      onClick={() => {
                        setEditingListing(item);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </Button>

                    <Link to={`/listings/${item.listingId}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingListing(null);
        }}
        listing={editingListing}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["my-listings"] });
        }}
      />
    </div>
  );
}
