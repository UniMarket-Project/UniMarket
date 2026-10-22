import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api-client";
import { useAuthStore } from "../../features/auth/auth.store";

export function useNavBadges() {
  const { isAuthenticated } = useAuthStore();

  // 1. Unread chat messages
  const { data: messagesCount } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const res = await api.get("/messages/unread-count");
      return (res.data.data?.unreadCount || 0) as number;
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });
    // 2. Pending or active deals for current user
  const { data: dealsCount } = useQuery({
    queryKey: ["pending-deals-count"],
    queryFn: async () => {
      const res = await api.get("/transactions");
      const txs = res.data.data?.transactions || [];
      return txs.filter(
        (t: any) => t.status === "pending" || t.status === "in_progress",
      ).length as number;
    },
    enabled: isAuthenticated,
    refetchInterval: 20000,
  });
 // 3. Open campus student demands
  const { data: demandsCount } = useQuery({
    queryKey: ["active-demands-count"],
    queryFn: async () => {
      const res = await api.get("/requests?status=open&limit=1");
      return (res.data.data?.pagination?.total || 0) as number;
    },
    refetchInterval: 30000,
  });
 const unreadMessagesCount = messagesCount || 0;
const pendingDealsCount = dealsCount || 0;
const activeDemandsCount = demandsCount || 0;
  return {
    unreadMessagesCount,
    hasUnreadMessages: unreadMessagesCount > 0,
    pendingDealsCount,
    hasPendingDeals: pendingDealsCount > 0,
    activeDemandsCount,
    hasActiveDemands: activeDemandsCount > 0,
  };
}


