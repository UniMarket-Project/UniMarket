export const ReportType = {
  USER: "user",
  LISTING: "listing",
  TRANSACTION: "transaction",
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export const ReportCategory = {
  FRAUD: "fraud",
  HARASSMENT: "harassment",
  COUNTERFEIT: "counterfeit",
  SPAM: "spam",
  PROHIBITED_ITEM: "prohibited_item",
  OTHER: "other",
} as const;

export type ReportCategory =
  (typeof ReportCategory)[keyof typeof ReportCategory];

export const ReportStatus = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];
