export interface DomainEventMap {
  'user.registered': { userId: string; email: string; userType: string };
  'verification.submitted': { verificationId: string; userId: string };
  'verification.decided': {
    verificationId: string;
    userId: string;
    status: 'verified' | 'unverified';
    reason?: string;
  };
  'deal.created': {
    transactionId: string;
    listingId?: string | null;
    requestId?: string | null;
    buyerId: string;
    sellerId: string;
  };
  'deal.accepted': {
    transactionId: string;
    listingId?: string | null;
    buyerId: string;
    sellerId: string;
    quantity: number;
  };
  'deal.cancelled': {
    transactionId: string;
    listingId?: string | null;
    cancelledById: string;
    reason: string;
    quantity: number;
  };
  'deal.completed': {
    transactionId: string;
    buyerId: string;
    sellerId: string;
  };
  'review.created': {
    ratingId: string;
    transactionId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
  };
  'report.submitted': {
    reportId: string;
    reportType: string;
    targetId: string;
    reporterId: string;
  };
  'report.threshold_reached': {
    targetId: string;
    reportCount: number;
  };
  'message.sent': {
    messageId: string;
    senderId: string;
    recipientId: string;
    listingId?: string | null;
    requestId?: string | null;
  };
  'user.suspended': {
    userId: string;
    adminId: string;
    suspensionUntil?: Date | null;
    reason: string;
  };
}

export type DomainEventName = keyof DomainEventMap;
