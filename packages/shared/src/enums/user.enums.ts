export const UserType = {
  STUDENT: "student",
  STAFF: "staff",
  PROVIDER: "provider",
  BUSINESS: "business",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export const Role = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const VerificationStatus = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
} as const;

export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const AvailabilityStatus = {
  AVAILABLE: "available",
  BUSY: "busy",
  UNAVAILABLE: "unavailable",
} as const;

export type AvailabilityStatus =
  (typeof AvailabilityStatus)[keyof typeof AvailabilityStatus];
