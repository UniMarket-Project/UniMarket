import { prisma } from "../../platform/database/prisma.client.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../platform/errors/http-errors.js";
import type { UpdateProfileInput, SubmitProfileChangeRequestInput } from "@unimarket/shared";
import type { Prisma } from "@prisma/client";
import { UsersRepository } from "./users.repository.js";

export class UsersService {
  public static async getMe(userId: string) {
    const user = await UsersRepository.findByIdWithProfile(userId);
    if (!user || user.isDeleted) {
      throw new NotFoundError("User not found");
    }

    return {
      user: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role,
        verificationStatus: user.verificationStatus,
        universityCode: (user as any).universityCode ?? "AAU",
        avatarUrl: user.profile?.avatarUrl ?? null,
        bio: user.profile?.bio ?? null,
        availabilityStatus: user.profile?.availabilityStatus ?? "available",
        location: {
          latitude: user.profile?.latitude,
          longitude: user.profile?.longitude,
          address: user.profile?.address,
        },
        joinedAt: user.createdAt.toISOString(),
        profile: {
          averageRating: user.profile?.averageRating ?? 0,
          totalRatings: user.profile?.totalRatings ?? 0,
          totalTransactions: user.profile?.totalTransactions ?? 0,
          totalReviews: user.profile?.totalReviews ?? 0,
        },
      },
    };
  }

  public static async updateMe(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true, verificationStatus: true },
    });
    if (!user || user.isDeleted) {
      throw new NotFoundError("User not found");
    }

    // If account is verified, user CANNOT modify personal details directly without admin approval.
    // Avatar picture and availability status can be freely set/edited anytime.
    if (user.verificationStatus === "verified") {
      const hasRestrictedChanges =
        input.firstName !== undefined ||
        input.lastName !== undefined ||
        input.bio !== undefined ||
        input.location !== undefined;

      if (hasRestrictedChanges) {
        throw new ForbiddenError(
          "Your account is verified. Verified members cannot change personal details (name, bio, location) directly without administrator approval. Please submit a Profile Change Request with reason and supporting evidence.",
        );
      }
    }

    // Update user first/last name if provided
    if (input.firstName || input.lastName) {
      await UsersRepository.updateUser(userId, {
        ...(input.firstName ? { firstName: input.firstName } : {}),
        ...(input.lastName ? { lastName: input.lastName } : {}),
      });
    }

    // Update profile
    await UsersRepository.updateProfile(userId, {
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      ...(input.availabilityStatus
        ? { availabilityStatus: input.availabilityStatus }
        : {}),
      ...(input.location
        ? {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
            address: input.location.address,
          }
        : {}),
    });

    return this.getMe(userId);
  }

  public static async submitProfileChangeRequest(
    userId: string,
    input: SubmitProfileChangeRequestInput,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true, verificationStatus: true },
    });
    if (!user || user.isDeleted) {
      throw new NotFoundError("User not found");
    }

    if (user.verificationStatus !== "verified") {
      throw new ForbiddenError(
        "Only verified accounts require an administrative profile change request. You can update your profile directly.",
      );
    }

    const existingPending = await prisma.profileChangeRequest.findFirst({
      where: { userId, status: "pending" },
    });
    if (existingPending) {
      throw new ConflictError(
        "You already have a profile change request pending administrator review.",
      );
    }

    const requestedData = {
      ...(input.firstName ? { firstName: input.firstName } : {}),
      ...(input.lastName ? { lastName: input.lastName } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.address ? { address: input.address } : {}),
    };

    const request = await prisma.profileChangeRequest.create({
      data: {
        userId,
        requestedData,
        reason: input.reason,
        evidenceUrl: input.evidenceUrl,
        status: "pending",
      },
    });

    return {
      requestId: request.id,
      status: request.status,
      submittedAt: request.createdAt.toISOString(),
    };
  }

  public static async getMyChangeRequests(userId: string) {
    const requests = await prisma.profileChangeRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      requests: requests.map((r) => ({
        requestId: r.id,
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

  public static async getPublicProfile(userId: string) {
    const user = await UsersRepository.findByIdWithProfile(userId);
    if (!user || user.isDeleted) {
      throw new NotFoundError("User not found");
    }

    // Return strictly sanitized public data
    return {
      user: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        verificationStatus: user.verificationStatus,
        avatarUrl: user.profile?.avatarUrl ?? null,
        bio: user.profile?.bio ?? null,
        availabilityStatus: user.profile?.availabilityStatus ?? "available",
        joinedAt: user.createdAt.toISOString(),
        profile: {
          averageRating: user.profile?.averageRating ?? 0,
          totalRatings: user.profile?.totalRatings ?? 0,
          totalTransactions: user.profile?.totalTransactions ?? 0,
        },
      },
    };
  }

  public static async getUserListings(
    userId: string,
    page = 1,
    limit = 20,
    includeAll = false,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      createdById: userId,
      isDeleted: false,
      ...(includeAll ? {} : { status: "active" }),
    };

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            include: { profile: true },
          },
        },
      }),
    ]);

    const items = listings.map((l) => ({
      listingId: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      transactionType: l.transactionType,
      price: l.price ? Number(l.price) : null,
      currency: l.currency,
      quantityAvailable: l.quantityAvailable,
      status: l.status,
      viewCount: l.viewCount,
      images: Array.isArray(l.images) ? (l.images as string[]) : [],
      availabilityStatus: l.availabilityStatus,
      location: l.address ? { address: l.address } : null,
      createdBy: {
        userId: l.createdBy.id,
        firstName: l.createdBy.firstName,
        lastName: l.createdBy.lastName,
        avatarUrl: l.createdBy.profile?.avatarUrl ?? null,
        verificationStatus: l.createdBy.verificationStatus,
        averageRating: l.createdBy.profile?.averageRating ?? 0,
        totalRatings: l.createdBy.profile?.totalRatings ?? 0,
        totalTransactions: l.createdBy.profile?.totalTransactions ?? 0,
      },
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + items.length < total,
      },
    };
  }
}
