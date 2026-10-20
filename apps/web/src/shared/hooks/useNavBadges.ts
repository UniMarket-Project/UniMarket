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
