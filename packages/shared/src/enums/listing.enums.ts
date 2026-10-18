export const ListingType = {
  SELL: "sell",
  RENT: "rent",
  LEND: "lend",
  EXCHANGE: "exchange",
  SERVICE: "service",
  FOOD: "food",
  TRANSPORT: "transport",
} as const;

export type ListingType = (typeof ListingType)[keyof typeof ListingType];

export const ListingStatus = {
  ACTIVE: "active",
  HIDDEN: "hidden",
  REMOVED: "removed",
} as const;

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];
