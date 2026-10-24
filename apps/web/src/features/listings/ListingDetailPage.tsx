import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/api-client";
import { useAuthStore } from "../auth/auth.store";
import { formatETB } from "../../shared/utils/cn";
import { Button } from "../../shared/components/ui/Button";
import { Badge, VerificationBadge } from "../../shared/components/ui/Badge";
import { Avatar } from "../../shared/components/ui/Avatar";
import { Modal } from "../../shared/components/ui/Modal";
import { Input } from "../../shared/components/ui/Input";
import {
  MapPin,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Handshake,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit3,
} from "lucide-react";
import { EditListingModal } from "./EditListingModal";

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hasReportedLocally, setHasReportedLocally] = useState(false);
  const [reportErrorMsg, setReportErrorMsg] = useState("");
  const [reportSuccessMsg, setReportSuccessMsg] = useState("");
  const [dealSuccessMsg, setDealSuccessMsg] = useState<string | null>(null);

  // Deal Form State
  const [dealAmount, setDealAmount] = useState<string>("");
  const [dealQuantity, setDealQuantity] = useState<number>(1);
  const [dealNotes, setDealNotes] = useState<string>("");

  // Report Form State
  const [reportCategory, setReportCategory] = useState<string>("spam");
  const [reportDescription, setReportDescription] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await api.get(`/listings/${id}`);
      return res.data.data.listing;
    },
    enabled: !!id,
  });

  // Fetch active transactions for current user to detect requested deal
  const { data: userDeals } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      return res.data.data.transactions || [];
    },
    enabled: isAuthenticated,
  });

  const existingDeal = (userDeals || []).find(
    (t: any) => t.listingId === id && t.status !== "cancelled",
  );

  // Deal Mutation
  const createDealMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        listingId: id,
        amount: dealAmount ? parseFloat(dealAmount) : undefined,
        quantity: dealQuantity,
        notes: dealNotes || undefined,
      };
      const res = await api.post("/transactions", payload);
      return res.data.data.transaction;
    },
    onSuccess: () => {
      setIsDealModalOpen(false);
      setDealSuccessMsg(
        "Deal request successfully submitted! The seller has been notified to accept.",
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
    },
  });

  // Message Mutation
  const startChatMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/messages", {
        recipientId: data?.createdBy.userId,
        listingId: id,
        content: `Hi ${data?.createdBy.firstName}! I am interested in your listing: "${data?.title}". Is it still available?`,
      });
      return res.data.data.message;
    },
    onSuccess: () => {
      navigate("/messages", {
        state: {
          partnerId: data?.createdBy.userId,
          listingId: id,
        },
      });
    },
  });

  // Report Mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      setReportErrorMsg("");
      setReportSuccessMsg("");
      if (reportDescription.trim().length < 20) {
        throw new Error("Please describe the issue in at least 20 characters.");
      }
      const res = await api.post("/reports", {
        reportType: "listing",
        targetId: id,
        category: reportCategory,
        description: reportDescription.trim(),
      });
      return res.data;
    },
    onSuccess: () => {
      setHasReportedLocally(true);
      setReportSuccessMsg(
        "Report submitted to campus moderation. Thank you for keeping UniMarket safe.",
      );
      setTimeout(() => {
        setIsReportModalOpen(false);
      }, 1500);
    },
    onError: (err: any) => {
      const errorData = err.response?.data?.error;
      if (
        errorData?.code === "ALREADY_EXISTS" ||
        err.response?.status === 409 ||
        errorData?.message?.toLowerCase().includes("already submitted")
      ) {
        setHasReportedLocally(true);
        setReportErrorMsg(
          "You have already submitted a report for this post. You cannot report the same item more than once.",
        );
      } else {
        setReportErrorMsg(
          errorData?.message ||
            err.message ||
            "Failed to submit report. Please describe the issue in at least 20 characters.",
        );
      }
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-muted-foreground mt-3">
          Loading listing details...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold">Listing Not Found</h2>
        <p className="text-xs text-muted-foreground">
          This item may have been removed or completed by the owner.
        </p>
        <Button onClick={() => navigate("/")}>Return to Marketplace</Button>
      </div>
    );
  }

  const images: string[] =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : ["https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"];

  const isOwner = user?.userId === data.createdBy.userId;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Photos Gallery */}
        <div className="md:col-span-7 space-y-3">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
            <img
              src={images[activeImageIndex]}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImageIndex === idx
                      ? "border-emerald-600 scale-105"
                      : "border-border opacity-70"
                  }`}
                >
                  <img
                    src={img}
                    alt="thumbnail"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Safe Campus Deal Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Campus Safety Guidelines</span>
            </div>
            <ul className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 space-y-1 list-disc list-inside">
              <li>
                Always meet in open campus locations (Library, Student Lounge,
                Cafeteria).
              </li>
              <li>
                Inspect items before transferring funds (Telebirr or Cash).
              </li>
              <li>
                Confirm completion in the app once handover is finished to build
                campus rating.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="md:col-span-5 space-y-6">
          {/* Header Badges & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-md">
                {data.transactionType}
              </span>
              <Badge variant="category">{data.category}</Badge>
              {data.quantityAvailable <= 0 ||
              data.availabilityStatus === "unavailable" ? (
                <span className="text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 rounded-md">
                  🔴 Sold Out / Unavailable
                </span>
              ) : null}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              {data.title}
            </h1>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatETB(data.price)}
              </span>
              {data.transactionType === "rent" && (
                <span className="text-xs text-muted-foreground">
                  / semester or day
                </span>
              )}
            </div>
          </div>

          {/* Location & Meta */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-2 text-xs text-muted-foreground">
            {data.location?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-foreground font-medium">
                  {data.location.address}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                Listed {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {data.quantityAvailable <= 0 ||
              data.availabilityStatus === "unavailable" ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    Sold Out / No longer available
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{data.quantityAvailable} available in stock</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground">Description</h3>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {data.description}
            </p>
          </div>

          {/* Seller Profile Summary */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={data.createdBy.avatarUrl}
                  name={`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                  size="md"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {data.createdBy.firstName} {data.createdBy.lastName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {data.createdBy.userType}
                  </p>
                </div>
              </div>

              {data.createdBy.averageRating > 0 && (
                <div className="text-right">
                  <div className="text-amber-500 font-extrabold text-sm">
                    ★ {data.createdBy.averageRating.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {data.createdBy.totalRatings} ratings
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <VerificationBadge status={data.createdBy.verificationStatus} />
              <Link
                to={`/users/${data.createdBy.userId}`}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                View Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          {!isOwner ? (
            <div className="space-y-2 pt-2">
              {dealSuccessMsg && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{dealSuccessMsg}</span>
                </div>
              )}

              {isAuthenticated ? (
                <>
                  {existingDeal && existingDeal.buyerId === user?.userId ? (
                    /* The user IS the buyer in this deal - show their private deal card */
                    <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/30 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {existingDeal.status === "pending"
                              ? "Deal Requested (Pending Acceptance)"
                              : existingDeal.status === "in_progress"
                                ? "Deal In Progress (Awaiting Handover)"
                                : "Deal Completed"}
                          </span>
                        </span>
                        <span className="text-xs font-extrabold text-foreground">
                          {formatETB(existingDeal.amount)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {existingDeal.status === "pending"
                          ? "You have requested this deal. Once the seller accepts, you can meet on campus to inspect and confirm."
                          : "Deal is active. Meet on campus to finalize item exchange."}
                      </p>
                      <Link to="/deals" className="block pt-1">
                        <Button
                          size="md"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                        >
                          View & Track in Deals &rarr;
                        </Button>
                      </Link>
                    </div>
                  ) : data.quantityAvailable <= 0 ||
                    data.availabilityStatus === "unavailable" ? (
                    /* Sold out to third parties - Keep confidential! */
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 p-4 space-y-2 text-center">
                      <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
                        Item Sold Out / Unavailable
                      </p>
                      <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                        This item has already been sold or is no longer
                        available. No deals can currently be initiated.
                      </p>
                    </div>
                  ) : (
                    /* In stock and available for deal request */
                    <Button
                      size="lg"
                      className="w-full gap-2 text-base font-bold shadow-md shadow-emerald-600/20"
                      onClick={() => {
                        setDealAmount(data.price ? String(data.price) : "");
                        setIsDealModalOpen(true);
                      }}
                    >
                      <Handshake className="h-5 w-5" />
                      <span>Initiate Deal Request</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 font-semibold"
                    onClick={() => startChatMutation.mutate()}
                    isLoading={startChatMutation.isPending}
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    <span>Chat with Seller</span>
                  </Button>
                </>
              ) : (
                <Link to="/login" className="block">
                  <Button size="lg" className="w-full">
                    Sign In to Deal or Message
                  </Button>
                </Link>
              )}

              <div className="text-center pt-2">
                {hasReportedLocally ? (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>You have reported this post</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setReportErrorMsg("");
                      setIsReportModalOpen(true);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Report this listing</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* OWNER CONSOLE */
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Your Listing (
                  {data.quantityAvailable <= 0 ||
                  data.availabilityStatus === "unavailable"
                    ? "🔴 Sold / Unavailable"
                    : "🟢 Active"}
                  )
                </span>
                <span className="text-xs text-muted-foreground">
                  {data.viewCount || 0} views
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {data.quantityAvailable <= 0 ||
                data.availabilityStatus === "unavailable"
                  ? "This item is marked as sold out or unavailable. You can restock quantity or update pricing."
                  : "This item is active on campus. You can update details, change pricing, or adjust stock."}
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  size="md"
                  className="w-full gap-1.5 font-bold"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Listing</span>
                </Button>
                <Link to="/my-listings" className="w-full">
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full text-xs font-semibold"
                  >
                    My Inventory
                  </Button>
                </Link>
              </div>
              {existingDeal && (
                <Link to="/deals" className="block pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs text-amber-700 dark:text-amber-300"
                  >
                    View Deal Request on This Item &rarr;
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Propose Deal Modal */}
      <Modal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Initiate Deal Request"
        description="Submit an official two-sided deal request. Both parties must confirm completion to earn campus reputation."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Deal Amount (ETB)"
            type="number"
            value={dealAmount}
            onChange={(e) => setDealAmount(e.target.value)}
            placeholder="Agree on amount in Ethiopian Birr"
          />

          <Input
            label="Quantity"
            type="number"
            min={1}
            max={data.quantityAvailable}
            value={dealQuantity}
            onChange={(e) => setDealQuantity(parseInt(e.target.value) || 1)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Handover Meeting Location & Notes
            </label>
            <textarea
              rows={3}
              value={dealNotes}
              onChange={(e) => setDealNotes(e.target.value)}
              placeholder="e.g. Meet in front of 4-Kilo Science Library at 3:30 PM on Tuesday"
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsDealModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createDealMutation.mutate()}
              isLoading={createDealMutation.isPending}
            >
              Send Deal Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportErrorMsg("");
          setReportSuccessMsg("");
        }}
        title="Report Listing"
        description="Help us keep UniMarket safe. Reports are monitored by campus administration."
      >
        <div className="space-y-4 pt-2">
          {reportErrorMsg && (
            <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{reportErrorMsg}</span>
            </div>
          )}

          {reportSuccessMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{reportSuccessMsg}</span>
            </div>
          )}

          {hasReportedLocally && !reportSuccessMsg && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You have already submitted a report for this post. You cannot
                report the same item more than once.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason Category
            </label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value)}
              disabled={hasReportedLocally}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="spam">Spam or Irrelevant</option>
              <option value="counterfeit">Counterfeit or Fake Item</option>
              <option value="fraud">Fraud or Suspicious Price</option>
              <option value="harassment">Harassment</option>
              <option value="prohibited_item">Prohibited Item</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Details
            </label>
            <textarea
              rows={3}
              value={reportDescription}
              onChange={(e) => {
                setReportDescription(e.target.value);
                if (reportErrorMsg) setReportErrorMsg("");
              }}
              disabled={hasReportedLocally}
              placeholder="Describe the issue for moderation (minimum 20 characters)..."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-muted-foreground text-right mt-1">
              {reportDescription.trim().length}/20 characters minimum
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsReportModalOpen(false);
                setReportErrorMsg("");
                setReportSuccessMsg("");
              }}
            >
              Close
            </Button>
            {!hasReportedLocally && (
              <Button
                variant="destructive"
                onClick={() => reportMutation.mutate()}
                isLoading={reportMutation.isPending}
                disabled={reportDescription.trim().length < 20}
              >
                Submit Report
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Listing Modal for Owner */}
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        listing={data}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["listing", id] });
        }}
      />
    </div>
  );
}
