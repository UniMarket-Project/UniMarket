import { prisma } from "../../platform/database/prisma.client.js";
import { ConflictError } from "../../platform/errors/http-errors.js";
import {
  encryptIdNumber,
  hashIdNumber,
} from "../../platform/security/crypto.js";
import { eventBus } from "../../platform/events/event-bus.js";
import type {
  SubmitStudentVerificationInput,
  SubmitProviderVerificationInput,
} from "@unimarket/shared";

export class VerificationService {
  public static async submitStudent(
    userId: string,
    input: SubmitStudentVerificationInput,
  ) {
    const idHash = hashIdNumber(input.studentId);

    // Check if user already has pending or verified verification
    const existing = await prisma.userVerification.findFirst({
      where: {
        userId,
        status: { in: ["pending", "verified"] },
      },
    });

    if (existing) {
      throw new ConflictError(
        "A verification request is already pending or has been approved",
      );
    }

    const encrypted = encryptIdNumber(input.studentId);

    const record = await prisma.$transaction(async (tx) => {
      const ver = await tx.userVerification.create({
        data: {
          userId,
          type: "student_id",
          idNumberEncrypted: encrypted,
          idNumberHash: idHash,
          universityCode: input.universityCode,
          documentUrl: input.documentUrl,
          status: "pending",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { verificationStatus: "pending" },
      });

      return ver;
    });

    eventBus.emit("verification.submitted", {
      verificationId: record.id,
      userId,
    });

    return {
      verificationId: record.id,
      status: "pending",
      expiresAt: null,
    };
  }

  public static async submitProvider(
    userId: string,
    input: SubmitProviderVerificationInput,
  ) {
    const idHash = hashIdNumber(input.nationalId);

    const existing = await prisma.userVerification.findFirst({
      where: {
        userId,
        status: { in: ["pending", "verified"] },
      },
    });

    if (existing) {
      throw new ConflictError(
        "A verification request is already pending or has been approved",
      );
    }

    const encrypted = encryptIdNumber(input.nationalId);

    const record = await prisma.$transaction(async (tx) => {
      const ver = await tx.userVerification.create({
        data: {
          userId,
          type: "national_id",
          idNumberEncrypted: encrypted,
          idNumberHash: idHash,
          businessName: input.businessName,
          businessCategory: input.businessCategory,
          documentUrl: input.documentUrl,
          status: "pending",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { verificationStatus: "pending" },
      });

      return ver;
    });

    eventBus.emit("verification.submitted", {
      verificationId: record.id,
      userId,
    });

    return {
      verificationId: record.id,
      status: "pending",
      expiresAt: null,
    };
  }

  public static async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { verificationStatus: true },
    });

    const verifications = await prisma.userVerification.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        rejectionReason: true,
        submittedAt: true,
        verifiedAt: true,
        expiresAt: true,
      },
    });

    return {
      verificationStatus: user?.verificationStatus ?? "unverified",
      verifications: verifications.map((v) => ({
        verificationId: v.id,
        type: v.type,
        status: v.status,
        rejectionReason: v.rejectionReason,
        submittedAt: v.submittedAt.toISOString(),
        verifiedAt: v.verifiedAt?.toISOString() ?? null,
        expiresAt: v.expiresAt?.toISOString() ?? null,
      })),
    };
  }
}
