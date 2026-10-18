export const RequestType = {
  PRODUCT: "product",
  SERVICE: "service",
  EXCHANGE: "exchange",
} as const;

export type RequestType = (typeof RequestType)[keyof typeof RequestType];

export const RequestStatus = {
  OPEN: "open",
  MATCHED: "matched",
  CLOSED: "closed",
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];
