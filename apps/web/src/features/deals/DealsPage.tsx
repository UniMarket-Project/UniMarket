import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/api-client";
import { useAuthStore } from "../auth/auth.store";
import { formatETB } from "../../shared/utils/cn";
import { Badge } from "../../shared/components/ui/Badge";
import { Avatar } from "../../shared/components/ui/Avatar";
import { Handshake } from "lucide-react";

export function DealsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");

  const { data, isLoading } = useQuery({
    queryKey: ["deals", activeTab],
    queryFn: async () => {
      const params: Record<string, string> = { limit: "50" };
      if (activeTab !== "all") params.status = activeTab;
      const res = await api.get("/transactions", { params });
      return res.data.data;
    },
  });

  const deals = data?.transactions || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold text-foreground">
          My Campus Deals
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Two-sided confirmation ensures secure handovers between campus peers.
        </p>

        {/* Status Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Deals" },
            { id: "pending", label: "Pending Action" },
            { id: "in_progress", label: "In Progress (Active)" },
            { id: "completed", label: "Completed Deals" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border bg-card p-6 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Handshake className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base">No deals found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You don't have any deals under this category. Visit the marketplace
            to propose a deal on any listing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal: any) => {
            const myId = user?.userId || (user as any)?.id;
            const buyerId = deal.buyer?.userId || deal.buyer?.id;
            const isBuyer = myId === buyerId;
            const counterparty = isBuyer ? deal.seller : deal.buyer;
            const myRole = isBuyer ? "Buyer" : "Seller";

            return (
              <div
                key={deal.transactionId}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header: Title, Status Badge, Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-muted text-foreground uppercase">
                        {myRole}
                      </span>
                      <h3 className="font-bold text-base text-foreground">
                        {deal.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Initiated {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatETB(deal.amount)}
                    </span>
                    <Badge
                      variant={
                        deal.status === "completed"
                          ? "verified"
                          : deal.status === "in_progress"
                            ? "deal"
                            : deal.status === "pending"
                              ? "pending"
                              : "default"
                      }
                    >
                      {deal.status === "in_progress"
                        ? "🤝 Meeting / In Progress"
                        : deal.status === "completed"
                          ? "✅ Completed"
                          : deal.status === "pending"
                            ? "⏳ Pending Acceptance"
                            : deal.status}
                    </Badge>
                  </div>
                </div>

                {/* Counterparty & Meeting Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <Avatar
                      src={counterparty.avatarUrl}
                      name={`${counterparty.firstName} ${counterparty.lastName}`}
                      size="sm"
                    />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        {isBuyer ? "Seller" : "Buyer"}:
                      </p>
                      <p className="font-bold text-sm">
                        {counterparty.firstName} {counterparty.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex flex-col justify-center">
                    <p className="text-[10px] text-muted-foreground">
                      Notes / Handover Details:
                    </p>
                    <p className="font-medium text-foreground truncate">
                      {deal.notes || "Public campus meeting agreed via chat."}
                    </p>
                  </div>
                </div>

                {/* Two-Sided Status Progress Indicator (For In Progress Deals) */}
                {deal.status === "in_progress" && (
                  <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
                      <span>Two-Sided Handover Confirmation:</span>
                      <span>
                        {deal.buyerConfirmed && deal.sellerConfirmed
                          ? "Both confirmed!"
                          : "Confirmation in progress"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div
                        className={`p-2 rounded-lg border text-center font-medium ${
                          deal.buyerConfirmed
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200"
                        }`}
                      >
                        Buyer Confirmed:{" "}
                        {deal.buyerConfirmed ? "✓ Yes" : "Pending"}
                      </div>

                      <div
                        className={`p-2 rounded-lg border text-center font-medium ${
                          deal.sellerConfirmed
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200"
                        }`}
                      >
                        Seller Confirmed:{" "}
                        {deal.sellerConfirmed ? "✓ Yes" : "Pending"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
