import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/api-client";
import { Modal } from "../../shared/components/ui/Modal";
import { Input } from "../../shared/components/ui/Input";
import { Button } from "../../shared/components/ui/Button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Academic Books",
  "Electronics",
  "Dorm Essentials",
  "Stationery",
  "Services",
  "Transport",
  "Other",
];

export interface EditableListing {
  listingId: string;
  title: string;
  description?: string;
  category: string;
  transactionType: "sell" | "rent" | "lend" | "service";
  price: number | null;
  quantityAvailable: number;
  availabilityStatus: "available" | "unavailable";
  images?: string[];
  location?: { address?: string } | null;
}

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: EditableListing | null;
  onSuccess?: () => void;
}

export function EditListingModal({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: EditListingModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic Books");
  const [transactionType, setTransactionType] = useState<
    "sell" | "rent" | "lend" | "service"
  >("sell");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "available" | "unavailable"
  >("available");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      // Match category properly case-wise
      const matchedCat = CATEGORIES.find(
        (c) => c.toLowerCase() === (listing.category || "").toLowerCase(),
      );
      setCategory(matchedCat || listing.category || "Academic Books");
      setTransactionType(listing.transactionType || "sell");
      setPrice(
        listing.price !== null && listing.price !== undefined
          ? String(listing.price)
          : "",
      );
      setQuantity(
        listing.quantityAvailable !== undefined ? listing.quantityAvailable : 1,
      );
      setAvailabilityStatus(listing.availabilityStatus || "available");
      setAddress(listing.location?.address || "");
      setImageUrl(
        Array.isArray(listing.images) && listing.images.length > 0
          ? listing.images[0]
          : "",
      );
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [listing, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!listing) return;
      const payload: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        category,
        transactionType,
        price: price ? parseFloat(price) : null,
        quantityAvailable: quantity,
        availabilityStatus,
      };

      if (address.trim()) {
        payload.location = { address: address.trim() };
      }

      if (imageUrl.trim()) {
        payload.images = [imageUrl.trim()];
      }

      const res = await api.patch(`/listings/${listing.listingId}`, payload);
      return res.data.data.listing;
    },
    onSuccess: () => {
      setSuccessMsg("Listing updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["listing", listing?.listingId],
      });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.message ||
        "Failed to update listing. Title needs 5+ characters and description needs 20+ characters.";
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (title.trim().length < 5) {
      setErrorMsg("Listing title must be at least 5 characters long.");
      return;
    }

    if (description.trim().length < 20) {
      setErrorMsg(
        `Description must be at least 20 characters long (currently ${description.trim().length}).`,
      );
      return;
    }

    updateMutation.mutate();
  };

  if (!listing) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Listing Details"
      description="Update your item pricing, stock quantity, and availability status on the campus marketplace."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMsg && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div>
          <Input
            label="Listing Title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="e.g. Casio fx-991EX Calculator"
          />
          <p className="text-[11px] text-muted-foreground text-right mt-0.5">
            {title.trim().length}/5 characters minimum
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Listing Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="sell">Sell (Outright Purchase)</option>
              <option value="rent">Rent (Semester / Weekly)</option>
              <option value="lend">Lend (Free Peer Borrowing)</option>
              <option value="service">Service (Tutoring / Repair)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Price (ETB)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 500"
          />

          <Input
            label="Stock Quantity"
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setQuantity(val);
              if (val === 0) {
                setAvailabilityStatus("unavailable");
              }
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Availability
            </label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as any)}
              className={`w-full h-10 rounded-xl border px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                availabilityStatus === "available"
                  ? "border-emerald-500/40 bg-emerald-50/50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
              }`}
            >
              <option value="available">🟢 Available</option>
              <option value="unavailable">🔴 Sold / Unavailable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Item Description
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="Describe condition, edition, accessories included..."
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-muted-foreground text-right mt-0.5">
            {description.trim().length}/20 characters minimum
          </p>
        </div>

        <Input
          label="Pickup / Campus Location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. AAU 4-Kilo Science Library"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            className="font-bold px-6"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
