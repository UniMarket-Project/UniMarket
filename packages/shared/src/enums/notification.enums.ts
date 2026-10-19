export const NotificationType = {
  VERIFICATION_RESULT: "verification_result",
  NEW_MESSAGE: "new_message",
  REQUEST_RESPONSE: "request_response",
  DEAL_UPDATE: "deal_update",
  RATING_RECEIVED: "rating_received",
  REPORT_RESOLVED: "report_resolved",
  ACCOUNT_WARNING: "account_warning",
  ACCOUNT_SUSPENDED: "account_suspended",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
