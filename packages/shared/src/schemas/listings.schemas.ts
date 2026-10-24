import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { ListingType } from "../enums/listing.enums.js";
import { AvailabilityStatus } from "../enums/user.enums.js";
import { locationSchema, paginationQuerySchema } from "./common.schemas.js";

export const createListingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LIMITS.TITLE_MIN_LENGTH)
      .max(LIMITS.TITLE_MAX_LENGTH),
    description: z
      .string()
      .trim()
      .min(LIMITS.DESCRIPTION_MIN_LENGTH)
      .max(LIMITS.DESCRIPTION_MAX_LENGTH),
    category: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .transform((val) => val.toLowerCase()),
    transactionType: z.nativeEnum(ListingType),
    price: z.number().min(0).nullable().optional(),
    currency: z.string().default("ETB"),
    quantityAvailable: z.number().int().min(1).default(1),
    images: z
      .array(z.string().url())
      .max(LIMITS.MAX_LISTING_IMAGES)
      .default([]),
    location: locationSchema.nullable().optional(),
    availabilityStatus: z
      .nativeEnum(AvailabilityStatus)
      .default(AvailabilityStatus.AVAILABLE),
    rentalStartDate: z.string().nullable().optional(),
    rentalEndDate: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).default({}),
  })
  .refine(
    (data) => {
      if (
        data.transactionType === ListingType.SELL ||
        data.transactionType === ListingType.SERVICE
      ) {
        return (
          data.price !== null && data.price !== undefined && data.price >= 0
        );
      }
      return true;
    },
    {
      message: "Price is required for sell and service listings",
      path: ["price"],
    },
  )
  .refine(
    (data) => {
      if (
        data.transactionType === ListingType.RENT &&
        data.rentalStartDate &&
        data.rentalEndDate
      ) {
        return new Date(data.rentalEndDate) >= new Date(data.rentalStartDate);
      }
      return true;
    },
    {
      message: "Rental end date must be on or after rental start date",
      path: ["rentalEndDate"],
    },
  );

export const updateListingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(LIMITS.TITLE_MIN_LENGTH)
      .max(LIMITS.TITLE_MAX_LENGTH)
      .optional(),
    description: z
      .string()
      .trim()
      .min(LIMITS.DESCRIPTION_MIN_LENGTH)
      .max(LIMITS.DESCRIPTION_MAX_LENGTH)
      .optional(),
    category: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .transform((val) => val.toLowerCase())
      .optional(),
    transactionType: z.nativeEnum(ListingType).optional(),
    price: z.number().min(0).nullable().optional(),
    currency: z.string().optional(),
    quantityAvailable: z.number().int().min(0).optional(),
    images: z.array(z.string().url()).max(LIMITS.MAX_LISTING_IMAGES).optional(),
    location: locationSchema.nullable().optional(),
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
    rentalStartDate: z.string().nullable().optional(),
    rentalEndDate: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine(
    (data) => {
      if (data.rentalStartDate && data.rentalEndDate) {
        return new Date(data.rentalEndDate) >= new Date(data.rentalStartDate);
      }
      return true;
    },
    {
      message: "Rental end date must be on or after rental start date",
      path: ["rentalEndDate"],
    },
  );

export const listingQuerySortBy = z
  .enum(["newest", "price_asc", "price_desc"])
  .default("newest");

export const listingsQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().trim().optional(),
    category: z.string().trim().optional(),
    transactionType: z.nativeEnum(ListingType).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    universityCode: z.string().trim().optional(),
    sortBy: listingQuerySortBy,
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    },
  );

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingsQueryInput = z.infer<typeof listingsQuerySchema>;
