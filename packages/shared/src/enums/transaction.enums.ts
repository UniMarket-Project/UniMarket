export const TransactionStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const PaymentMethod = {
  CASH: "cash",
  TRANSFER: "transfer",
  OTHER: "other",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
