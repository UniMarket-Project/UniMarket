export interface UserSummary {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  role: string;
  isActive: boolean;
}

export interface ListingSummary {
  id: string;
  title: string;
  transactionType: string;
  price: { amount: number; currency: string };
  images: string[];
  availabilityStatus: string;
  createdAt: string;
}

export interface TransactionObject {
  id: string;
  listingId?: string;
  requestId?: string;
  buyerId: string;
  sellerId: string;
  title: string;
  transactionType: string;
  status: string;
  amount: { amount: number; currency: string };
  quantity: number;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  createdAt: string;
}