export interface NavBadges {
  hasUnreadMessages: boolean;
  unreadMessagesCount: number;
  hasPendingDeals: boolean;
  pendingDealsCount: number;
  hasActiveDemands: boolean;
  [key: string]: any;
}

export const useNavBadges = (): NavBadges => ({
  hasUnreadMessages: false,
  unreadMessagesCount: 0,
  hasPendingDeals: false,
  pendingDealsCount: 0,
  hasActiveDemands: false,
});

export default useNavBadges;
