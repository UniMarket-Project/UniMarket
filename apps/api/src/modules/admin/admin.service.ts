import { prisma } from "../../platform/database/prisma.client.js";
import { NotFoundError } from "../../platform/errors/http-errors.js";
import { decryptIdNumber } from "../../platform/security/crypto.js";
import { eventBus } from "../../platform/events/event-bus.js";
import { AuditService } from "../audit/audit.service.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { LIMITS } from "@unimarket/shared";
import type {
  AdminVerificationsQueryInput,
  ReviewVerificationInput,
  AdminReportsQueryInput,
  ResolveReportInput,
  SuspendUserInput,
  UnsuspendUserInput,
  AdminUsersQueryInput,
  ReviewProfileChangeRequestInput,
} from "@unimarket/shared";
import type { Prisma } from "@prisma/client";

export class AdminService {
  public static async getStats() {
    const [
      pendingVerifications,
      openReports,
      totalUsers,
      activeListings,
      completedDeals,
      pendingProfileChanges,
    ] = await Promise.all([
      prisma.userVerification.count({ where: { status: "pending" } }),
      prisma.report.count({
        where: { status: { in: ["submitted", "under_review"] } },
      }),
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.listing.count({ where: { status: "active", isDeleted: false } }),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.profileChangeRequest.count({ where: { status: "pending" } }),
    ]);

    return {
      pendingVerifications,
      openReports,
      totalUsers,
      activeListings,
      completedDeals,
      pendingProfileChanges,
    };
  }

  public static async getProfileChangeRequests(status?: string) {
    const where: Prisma.ProfileChangeRequestWhereInput = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const requests = await prisma.profileChangeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            userType: true,
            verificationStatus: true,
            universityCode: true,
            profile: {
              select: {
                avatarUrl: true,
                bio: true,
                address: true,
              },
            },
          },
        },
      },
    });

    return {
      requests: requests.map((r) => ({
        requestId: r.id,
        user: {
          userId: r.user.id,
          email: r.user.email,
          phone: r.user.phone,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
          userType: r.user.userType,
          verificationStatus: r.user.verificationStatus,
          universityCode: r.user.universityCode,
          avatarUrl: r.user.profile?.avatarUrl ?? null,
          currentBio: r.user.profile?.bio ?? null,
          currentAddress: r.user.profile?.address ?? null,
        },
        requestedData: r.requestedData,
        reason: r.reason,
        evidenceUrl: r.evidenceUrl,
        status: r.status,
        rejectionReason: r.rejectionReason,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
      })),
    };
  }

  public static async reviewProfileChangeRequest(
    adminId: string,
    requestId: string,
    input: ReviewProfileChangeRequestInput,
  ) {
    const request = await prisma.profileChangeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundError("Profile change request not found");
    }

    const isApproved = input.status === "approved";
    const requested = request.requestedData as Record<string, any>;

    const updated = await prisma.$transaction(async (tx) => {
      if (isApproved) {
        // Apply user table changes
        const userUpdates: Record<string, any> = {};
        if (requested.firstName) userUpdates.firstName = requested.firstName;
        if (requested.lastName) userUpdates.lastName = requested.lastName;
        if (requested.phone) userUpdates.phone = requested.phone;
        if (requested.universityCode) userUpdates.universityCode = requested.universityCode;

        if (Object.keys(userUpdates).length > 0) {
          await tx.user.update({
            where: { id: request.userId },
            data: userUpdates,
          });
        }

        // Apply profile table changes
        const profileUpdates: Record<string, any> = {};
        if (requested.bio !== undefined) profileUpdates.bio = requested.bio;
        if (requested.address !== undefined) profileUpdates.address = requested.address;

        if (Object.keys(profileUpdates).length > 0) {
          await tx.userProfile.upsert({
            where: { userId: request.userId },
            update: profileUpdates,
            create: {
              userId: request.userId,
              ...profileUpdates,
            },
          });
        }
      }

      // Update change request status
      const updatedReq = await tx.profileChangeRequest.update({
        where: { id: requestId },
        data: {
          status: isApproved ? "approved" : "rejected",
          rejectionReason: input.rejectionReason ?? null,
          reviewedByAdminId: adminId,
          reviewedAt: new Date(),
        },
      });

      // Send notification to user
      await tx.notification.create({
        data: {
          userId: request.userId,
          type: "verification_result",
          title: isApproved
            ? "Profile Change Request Approved"
            : "Profile Change Request Rejected",
          message: isApproved
            ? "Your requested profile updates have been approved by administrator and applied to your account."
            : `Your profile change request was rejected. Reason: ${input.rejectionReason || "Details could not be verified"}.`,
        },
      });

      return updatedReq;
    });

    await AuditService.log(
      adminId,
      isApproved ? "PROFILE_CHANGE_APPROVED" : "PROFILE_CHANGE_REJECTED",
      "USER_PROFILE_CHANGE",
      requestId,
      { status: input.status, reason: input.rejectionReason },
    );

    return { request: updated };
  }

  public static async getVerifications(query: AdminVerificationsQueryInput) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserVerificationWhereInput = {};
    if (status) where.status = status;

    const [total, records] = await Promise.all([
      prisma.userVerification.count({ where }),
      prisma.userVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            include: { profile: true },
          },
        },
      }),
    ]);

    const items = records.map((v) => {
      let decryptedId: string | null = null;
      try {
        decryptedId = decryptIdNumber(v.idNumberEncrypted);
      } catch {
        decryptedId = "Error decrypting ID";
      }

      return {
        verificationId: v.id,
        user: {
          userId: v.user.id,
          firstName: v.user.firstName,
          lastName: v.user.lastName,
          email: v.user.email,
          userType: v.user.userType,
          avatarUrl: v.user.profile?.avatarUrl ?? null,
          verificationStatus: v.user.verificationStatus,
        },
        type: v.type,
        studentId: v.type === "student_id" ? decryptedId : null,
        nationalId: v.type === "national_id" ? decryptedId : null,
        universityCode: v.universityCode,
        businessName: v.businessName,
        businessCategory: v.businessCategory,
        documentUrl: v.documentUrl,
        status: v.status,
        rejectionReason: v.rejectionReason,
        createdAt: v.submittedAt.toISOString(),
      };
    });

    return {
      verifications: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  public static async reviewVerification(
    adminId: string,
    verificationId: string,
    input: ReviewVerificationInput,
  ) {
    const verification = await prisma.userVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification)
      throw new NotFoundError("Verification request not found");

    const isApproved = input.status === "verified";
    const expiresAt = isApproved
      ? new Date(
          Date.now() + LIMITS.VERIFICATION_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
        )
      : null;

    const updated = await prisma.$transaction(async (tx) => {
      const ver = await tx.userVerification.update({
        where: { id: verificationId },
        data: {
          status: isApproved ? "verified" : "unverified",
          rejectionReason: input.rejectionReason ?? null,
          verifiedAt: isApproved ? new Date() : null,
          expiresAt,
        },
      });

      await tx.user.update({
        where: { id: verification.userId },
        data: {
          verificationStatus: isApproved ? "verified" : "unverified",
        },
      });

      return ver;
    });

    await AuditService.log(
      adminId,
      isApproved ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
      "USER_VERIFICATION",
      verificationId,
      { status: input.status, reason: input.rejectionReason },
    );

    eventBus.emit("verification.decided", {
      verificationId,
      userId: verification.userId,
      status: isApproved ? "verified" : "unverified",
      reason: input.rejectionReason,
    });

    return { verification: updated };
  }

  public static async getReports(query: AdminReportsQueryInput) {
    const { page, limit, status, reportType, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;
    if (category) where.category = category;

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            include: { profile: true },
          },
        },
      }),
    ]);

    const items = await Promise.all(
      reports.map(async (r) => {
        let reportCountOnTarget = 1;
        let targetUser: {
          userId: string;
          firstName: string;
          lastName: string;
          email: string;
          warningCount: number;
          totalReports: number;
        } | null = null;
        let targetListing: {
          listingId: string;
          title: string;
          status: string;
          reportCount: number;
        } | null = null;

        if (r.reportType === "listing") {
          const l = await prisma.listing.findUnique({
            where: { id: r.targetId },
            select: {
              id: true,
              title: true,
              status: true,
              reportCount: true,
              createdById: true,
            },
          });
          if (l) {
            reportCountOnTarget = l.reportCount;
            targetListing = {
              listingId: l.id,
              title: l.title,
              status: l.status,
              reportCount: l.reportCount,
            };
            // Also fetch the listing owner
            const owner = await prisma.user.findUnique({
              where: { id: l.createdById },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                warningCount: true,
              },
            });
            if (owner) {
              const totalUserReports = await prisma.report.count({
                where: { targetId: owner.id, reportType: "user" },
              });
              targetUser = {
                userId: owner.id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                email: owner.email,
                warningCount: owner.warningCount,
                totalReports: totalUserReports,
              };
            }
          }
        } else if (r.reportType === "user") {
          const u = await prisma.user.findUnique({
            where: { id: r.targetId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              warningCount: true,
            },
          });
          if (u) {
            const totalUserReports = await prisma.report.count({
              where: { targetId: u.id, reportType: "user" },
            });
            reportCountOnTarget = totalUserReports;
            targetUser = {
              userId: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              warningCount: u.warningCount,
              totalReports: totalUserReports,
            };
          }
        }

        return {
          reportId: r.id,
          reporter: {
            userId: r.reporter.id,
            firstName: r.reporter.firstName,
            lastName: r.reporter.lastName,
            avatarUrl: r.reporter.profile?.avatarUrl ?? null,
            verificationStatus: r.reporter.verificationStatus,
          },
          reportType: r.reportType,
          targetId: r.targetId,
          targetUser,
          targetListing,
          category: r.category,
          description: r.description,
          status: r.status,
          reportCountOnTarget,
          actionTaken: (r as any).actionTaken ?? (r as any).action ?? null,
          adminNotes: r.adminNotes,
          createdAt: r.createdAt.toISOString(),
        };
      }),
    );

    return {
      reports: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }

  public static async resolveReport(
    adminId: string,
    reportId: string,
    input: ResolveReportInput,
  ) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundError("Report not found");

    let targetUserId: string | null = null;
    let targetListingId: string | null = null;

    if (report.reportType === "user") {
      targetUserId = report.targetId;
    } else if (report.reportType === "listing") {
      targetListingId = report.targetId;
      const listing = await prisma.listing.findUnique({
        where: { id: report.targetId },
        select: { createdById: true },
      });
      if (listing) {
        targetUserId = listing.createdById;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Execute moderation action
      if (
        input.action === "remove_listing" &&
        report.reportType === "listing"
      ) {
        await tx.listing.update({
          where: { id: report.targetId },
          data: { status: "removed", isDeleted: true, deletedAt: new Date() },
        });
      } else if (
        input.action === "restore_listing" &&
        report.reportType === "listing"
      ) {
        await tx.listing.update({
          where: { id: report.targetId },
          data: { status: "active", reportCount: 0 },
        });
      } else if (input.action === "warn_user" && targetUserId) {
        await tx.user.update({
          where: { id: targetUserId },
          data: { warningCount: { increment: 1 } },
        });
      } else if (input.action === "suspend_user" && targetUserId) {
        const suspensionUntil = input.suspensionDays
          ? new Date(Date.now() + input.suspensionDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        await tx.user.update({
          where: { id: targetUserId },
          data: { isActive: false, suspensionUntil },
        });

        await AuthRepository.revokeAllUserTokens(targetUserId);
      }

      return tx.report.update({
        where: { id: reportId },
        data: {
          status: input.status,
          action: input.action,
          adminNotes: input.adminNotes,
          resolvedById: adminId,
          resolvedAt: new Date(),
        },
      });
    });

    await AuditService.log(adminId, "report_resolved", "REPORT", reportId, {
      status: input.status,
      action: input.action,
      notes: input.adminNotes,
    });

    // ─────────────────────────────────────────────────────────────────
    // AUTOMATIC ESCALATION RULES
    // ─────────────────────────────────────────────────────────────────
    let autoActionTaken: string | null = null;
    let userReportCount = 0;
    let listingReportCount = 0;

    // Rule 1: If listing is reported at least 3 times (by 3 distinct accounts), auto take down
    if (targetListingId) {
      const distinctReporters = await prisma.report.groupBy({
        by: ["reporterId"],
        where: { targetId: targetListingId, reportType: "listing" },
      });
      listingReportCount = distinctReporters.length;

      if (listingReportCount >= 3) {
        await prisma.listing.update({
          where: { id: targetListingId },
          data: { status: "removed", isDeleted: true, deletedAt: new Date() },
        });
        autoActionTaken = `Listing reported by ${listingReportCount} campus accounts. Automatically taken down from marketplace.`;
      }
    }

    // Rule 2 & 3: User report count escalation
    if (targetUserId && input.action !== "none") {
      const [directUserReports, userListingIds] = await Promise.all([
        prisma.report.count({
          where: { targetId: targetUserId, reportType: "user" },
        }),
        prisma.listing.findMany({
          where: { createdById: targetUserId },
          select: { id: true },
        }),
      ]);

      const listingReports = await prisma.report.count({
        where: {
          reportType: "listing",
          targetId: { in: userListingIds.map((l) => l.id) },
        },
      });

      userReportCount = directUserReports + listingReports;

      // When total report count reaches 10: Ban user permanently and remove all listings
      if (userReportCount >= 10) {
        const permanentDate = new Date("2099-01-01");
        await prisma.user.update({
          where: { id: targetUserId },
          data: { isActive: false, suspensionUntil: permanentDate },
        });

        // Remove all listings of that user
        await prisma.listing.updateMany({
          where: { createdById: targetUserId, isDeleted: false },
          data: { status: "removed", isDeleted: true, deletedAt: new Date() },
        });

        await AuthRepository.revokeAllUserTokens(targetUserId);

        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: "account_suspended",
            title: "Account Permanently Banned",
            message: `Your UniMarket account has been permanently banned due to reaching ${userReportCount} campus moderation reports. All active listings have been removed.`,
            data: { totalReports: userReportCount },
          },
        });

        autoActionTaken = `User report count reached ${userReportCount} (>= 10). Account permanently banned and all listings removed.`;
      }
      // If report count is 3 or a multiple of 3: Notify and suspend for 2 weeks
      else if (userReportCount > 0 && userReportCount % 3 === 0) {
        const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: targetUserId },
          data: { isActive: false, suspensionUntil: twoWeeks },
        });

        await AuthRepository.revokeAllUserTokens(targetUserId);

        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: "account_suspended",
            title: "Account Suspended for 2 Weeks",
            message: `Your UniMarket account has been suspended for 14 days due to reaching ${userReportCount} campus reports (rule: suspension at 3 or multiple of 3 reports).`,
            data: {
              totalReports: userReportCount,
              suspensionUntil: twoWeeks.toISOString(),
            },
          },
        });

        autoActionTaken = `User report count is ${userReportCount} (multiple of 3). Account suspended for 2 weeks and user notified.`;
      }
    }

    return {
      report: updated,
      moderationSummary: {
        autoActionTaken:
          autoActionTaken ||
          `Moderation action applied. Total user reports: ${userReportCount}.`,
        userReportCount,
        listingReportCount,
      },
    };
  }

  public static async suspendUser(
    adminId: string,
    userId: string,
    input: SuspendUserInput,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const suspensionUntil = input.suspensionDays
      ? new Date(Date.now() + input.suspensionDays * 24 * 60 * 60 * 1000)
      : null;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        suspensionUntil,
      },
    });

    await AuthRepository.revokeAllUserTokens(userId);

    await AuditService.log(adminId, "USER_SUSPENDED", "user", userId, {
      reason: input.reason,
      suspensionDays: input.suspensionDays,
    });

    eventBus.emit("user.suspended", {
      userId,
      adminId,
      reason: input.reason,
      suspensionUntil,
    });

    return {
      user: {
        userId: updated.id,
        isActive: updated.isActive,
        suspensionUntil: updated.suspensionUntil
          ? updated.suspensionUntil.toISOString()
          : null,
      },
    };
  }

  public static async unsuspendUser(
    adminId: string,
    userId: string,
    input: UnsuspendUserInput,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        suspensionUntil: null,
      },
    });

    await AuditService.log(adminId, "USER_UNSUSPENDED", "user", userId, {
      reason: input.reason,
    });

    return {
      user: {
        userId: updated.id,
        isActive: updated.isActive,
      },
    };
  }

  public static async listUsers(query: AdminUsersQueryInput) {
    const { page, limit, q, verificationStatus, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { isDeleted: false };
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (isActive !== undefined) where.isActive = isActive;
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { profile: true },
      }),
    ]);

    const items = users.map((u) => ({
      userId: u.id,
      email: u.email,
      phone: u.phone,
      firstName: u.firstName,
      lastName: u.lastName,
      userType: u.userType,
      role: u.role,
      verificationStatus: u.verificationStatus,
      warningCount: u.warningCount,
      suspensionUntil: u.suspensionUntil
        ? u.suspensionUntil.toISOString()
        : null,
      isActive: u.isActive,
      avatarUrl: u.profile?.avatarUrl ?? null,
      joinedAt: u.createdAt.toISOString(),
      profile: {
        averageRating: u.profile?.averageRating ?? 0,
        totalRatings: u.profile?.totalRatings ?? 0,
        totalTransactions: u.profile?.totalTransactions ?? 0,
      },
    }));

    return {
      users: items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }
}
