import { z } from "zod";
import { LIMITS } from "../constants/limits.js";

export const uploadPurposeEnum = z.enum([
  "listing_image",
  "avatar",
  "verification_document",
]);

export const presignUploadSchema = z
  .object({
    purpose: uploadPurposeEnum,
    contentType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
    sizeBytes: z
      .number()
      .int()
      .min(1)
      .max(LIMITS.MAX_IMAGE_SIZE_BYTES, {
        message: `File size cannot exceed ${LIMITS.MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB`,
      }),
  })
  .refine(
    (data) => {
      if (
        data.contentType === "application/pdf" &&
        data.purpose !== "verification_document"
      ) {
        return false;
      }
      return true;
    },
    {
      message: "PDF format is only permitted for verification documents",
      path: ["contentType"],
    },
  );

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
