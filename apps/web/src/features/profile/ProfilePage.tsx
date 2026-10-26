import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../../shared/api/api-client";
import { useAuthStore } from "../auth/auth.store";
import { Avatar } from "../../shared/components/ui/Avatar";
import { VerificationBadge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { Input } from "../../shared/components/ui/Input";
import { Modal } from "../../shared/components/ui/Modal";
import { ImageUpload } from "../../shared/components/ui/ImageUpload";
import { ListingCard } from "../listings/ListingCard";
import {
  Star,
  MapPin,
  Package,
  MessageSquare,
  Camera,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { getErrorMessage } from "../../shared/utils/errors";

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser } = useAuthStore();

  const targetUserId = id || currentUser?.userId;

  // Modals state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatarInputUrl, setAvatarInputUrl] = useState("");

  // Edit / Change Request Form State
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [changeEvidenceUrl, setChangeEvidenceUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Fetch Profile
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const res = await api.get(`/users/${targetUserId}`);
      return res.data.data;
    },
    enabled: !!targetUserId,
  });

  // 2. Fetch User Listings
  const { data: listingsData } = useQuery({
    queryKey: ["user-listings", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const res = await api.get(`/users/${targetUserId}/listings`);
      return res.data.data.listings || res.data.data.items || [];
    },
    enabled: !!targetUserId,
  });

  // 3. Fetch User Reviews
  const { data: ratingsData } = useQuery({
    queryKey: ["user-ratings", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const res = await api.get(`/ratings/users/${targetUserId}`);
      return res.data.data.reviews || [];
    },
    enabled: !!targetUserId,
  });

  // 4. Fetch User's Pending Profile Change Requests (if viewing own profile)
  const isMe = currentUser?.userId === (targetUserId || profileData?.user?.id);
  const { data: changeRequestsData } = useQuery({
    queryKey: ["my-change-requests"],
    queryFn: async () => {
      if (!isMe) return [];
      const res = await api.get("/users/me/change-request");
      return res.data.data.requests || [];
    },
    enabled: isMe && currentUser?.verificationStatus === "verified",
  });

  const pendingRequest = changeRequestsData?.find(
    (r: any) => r.status === "pending",
  );

  // Direct Avatar Update Mutation (allowed anytime, verified or not)
  const updateAvatarMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await api.patch("/users/me", { avatarUrl: url });
      return res.data.data;
    },
    onSuccess: () => {
      updateUser({ avatarUrl: avatarInputUrl });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", targetUserId],
      });
      setIsAvatarModalOpen(false);
      setStatusMsg({
        type: "success",
        text: "Profile picture updated successfully!",
      });
      setTimeout(() => setStatusMsg(null), 4000);
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Failed to update profile picture."));
    },
  });

  // Direct Profile Update Mutation (unverified accounts)
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      location?: { address: string };
    }) => {
      const res = await api.patch("/users/me", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", targetUserId],
      });
      setIsEditModalOpen(false);
      setStatusMsg({
        type: "success",
        text: "Profile details updated successfully!",
      });
      setTimeout(() => setStatusMsg(null), 4000);
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Failed to update profile."));
    },
  });

  // Profile Change Request Mutation (verified accounts requiring admin review)
  const submitChangeRequestMutation = useMutation({
    mutationFn: async (payload: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      address?: string;
      reason: string;
      evidenceUrl: string;
    }) => {
      const res = await api.post("/users/me/change-request", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-change-requests"] });
      setIsEditModalOpen(false);
      setChangeReason("");
      setChangeEvidenceUrl("");
      setStatusMsg({
        type: "success",
        text: "Your profile change request has been submitted to campus administrators for review!",
      });
      setTimeout(() => setStatusMsg(null), 5000);
    },
    onError: (err) => {
      alert(getErrorMessage(err, "Failed to submit profile change request."));
    },
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
        <p className="text-sm font-semibold text-foreground">
          User profile not found.
        </p>
        <p className="text-xs text-muted-foreground">
          This user may have deleted their account or the ID is invalid.
        </p>
      </div>
    );
  }

  const listings = listingsData || [];
  const reviews = ratingsData || [];

  const handleOpenEditModal = () => {
    setEditFirstName(profile.firstName || "");
    setEditLastName(profile.lastName || "");
    setEditBio(profile.bio || "");
    setEditAddress(profile.address || "");
    setChangeReason("");
    setChangeEvidenceUrl("");
    setIsEditModalOpen(true);
  };

  const handleOpenAvatarModal = () => {
    setAvatarInputUrl(profile.avatarUrl || "");
    setIsAvatarModalOpen(true);
  };

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInputUrl) {
      alert("Please upload an image or provide an image URL.");
      return;
    }
    updateAvatarMutation.mutate(avatarInputUrl);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (profile.verificationStatus === "verified") {
      // Verified users must submit a change request with reason and evidence
      if (!changeReason.trim()) {
        alert("Please provide the reason why you need to change your verified details.");
        return;
      }
      if (!changeEvidenceUrl.trim()) {
        alert("Please upload supporting evidence (e.g. updated student ID or legal document).");
        return;
      }

      submitChangeRequestMutation.mutate({
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        bio: editBio.trim() || undefined,
        address: editAddress.trim() || undefined,
        reason: changeReason.trim(),
        evidenceUrl: changeEvidenceUrl.trim(),
      });
    } else {
      // Unverified users can directly update their information
      updateProfileMutation.mutate({
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        bio: editBio.trim() || undefined,
        location: editAddress.trim() ? { address: editAddress.trim() } : undefined,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Toast Alert Message */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* Pending Change Request Banner for Current User */}
      {isMe && pendingRequest && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Pending Profile Change Request Under Review
              </p>
              <p className="text-xs mt-0.5 leading-relaxed">
                You requested changes to your verified account details on{" "}
                <strong>{new Date(pendingRequest.createdAt).toLocaleDateString()}</strong>.
                Campus administrators are reviewing your submission.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 whitespace-nowrap">
            Awaiting Admin Review
          </span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Camera Setup / Edit Icon */}
          <div className="relative group">
            <Avatar
              src={profile.avatarUrl}
              name={`${profile.firstName} ${profile.lastName}`}
              size="xl"
              className="ring-4 ring-emerald-500/20"
            />
            {isMe && (
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-2 ring-card transition-transform hover:scale-110"
                title={profile.avatarUrl ? "Change Profile Picture" : "Set Up Profile Picture"}
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenEditModal}
                      className="gap-1.5 text-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Edit Profile</span>
                    </Button>
                    <Link to="/my-listings">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                      >
                        <Package className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Manage Items</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/messages"
                    state={{
                      partnerId: profile.userId,
                      partner: profile,
                    }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                    >
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
              <span>
                {profile.averageRating
                  ? profile.averageRating.toFixed(1)
                  : "5.0"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              Campus Rating
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-foreground font-extrabold text-lg">
              {profile.totalRatings || reviews.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              Reviews
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40">
            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
              {profile.totalTransactions || 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
              Completed Deals
            </p>
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

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Campus Peer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No reviews yet. Complete a deal with this member to leave the first review!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev: any) => (
              <div
                key={rev.ratingId}
                className="rounded-2xl border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={rev.reviewer.avatarUrl}
                      name={rev.reviewer.firstName}
                      size="sm"
                    />
                    <div>
                      <p className="font-bold text-xs">
                        {rev.reviewer.firstName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    {"★".repeat(rev.rating)}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Modal: Edit/Set Up Profile Picture (Always permitted directly) */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Profile Picture"
        description="Upload a photo from your device or provide a direct web image link. Profile photos can be changed at any time."
      >
        <form onSubmit={handleSaveAvatar} className="space-y-5 pt-2">
          <ImageUpload
            label="Upload Avatar Photo"
            purpose="avatar"
            value={avatarInputUrl}
            onChange={(url) => setAvatarInputUrl(url)}
            helperText="JPG, PNG, or WebP (up to 5 MB). Click or drag a file to upload from your device."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAvatarModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateAvatarMutation.isPending || !avatarInputUrl}
            >
              {updateAvatarMutation.isPending ? "Saving..." : "Save Picture"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Edit Profile / Submit Change Request */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          profile.verificationStatus === "verified"
            ? "Request Profile Details Change"
            : "Edit Profile Details"
        }
        description={
          profile.verificationStatus === "verified"
            ? "Because your campus account is verified, changes to personal credentials require administrative review with valid evidence."
            : "Update your personal profile information displayed to other campus members."
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {/* Verified Account Notice */}
          {profile.verificationStatus === "verified" && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified Campus Identity Protected</span>
              </div>
              <p className="leading-relaxed text-emerald-800 dark:text-emerald-300">
                To prevent fraud and maintain campus marketplace trust, verified accounts
                cannot modify names or identity details directly. Please provide a clear explanation
                and upload supporting evidence (such as your updated student ID, campus portal screenshot, or legal document).
              </p>
            </div>
          )}

          {/* Pending Request Warning */}
          {profile.verificationStatus === "verified" && pendingRequest && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs">
              <p className="font-bold">⚠️ Existing Request Pending Review</p>
              <p className="mt-0.5">
                You already have a change request submitted on{" "}
                {new Date(pendingRequest.createdAt).toLocaleDateString()}. Please wait for administrators to complete review before submitting another.
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
              disabled={!!(profile.verificationStatus === "verified" && pendingRequest)}
            />
            <Input
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
              disabled={!!(profile.verificationStatus === "verified" && pendingRequest)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Bio / About You</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Tell other students about your courses, hobbies, or services..."
              disabled={!!(profile.verificationStatus === "verified" && pendingRequest)}
            />
          </div>

          <Input
            label="Campus Address / Hall / Dorm"
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="e.g. 4 Kilo Campus, Block 5, Room 204"
            disabled={!!(profile.verificationStatus === "verified" && pendingRequest)}
          />

          {/* Extra Fields Required Only for Verified Users */}
          {profile.verificationStatus === "verified" && (
            <>
              <div className="space-y-1 pt-2 border-t border-border">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Reason for Change <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-muted-foreground">Required for Admin Review</span>
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Explain why you are modifying your verified information (e.g. Legal name correction, change of campus hall)..."
                  disabled={!!pendingRequest}
                />
              </div>

              <div className="space-y-1">
                <ImageUpload
                  label="Supporting Evidence Document / Photo *"
                  purpose="verification_document"
                  value={changeEvidenceUrl}
                  onChange={(url) => setChangeEvidenceUrl(url)}
                  helperText="Upload official proof (student ID card, portal screenshot, or legal document)."
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                profile.verificationStatus === "verified"
                  ? !!pendingRequest ||
                    submitChangeRequestMutation.isPending ||
                    !changeReason.trim() ||
                    !changeEvidenceUrl.trim()
                  : updateProfileMutation.isPending
              }
            >
              {profile.verificationStatus === "verified"
                ? submitChangeRequestMutation.isPending
                  ? "Submitting..."
                  : "Submit for Admin Review"
                : updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
