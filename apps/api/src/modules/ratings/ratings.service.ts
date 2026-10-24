import { prisma } from "../../platform/database/prisma.client.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../platform/errors/http-errors.js";
import {
  ErrorCode,
  type CreateRatingInput,
  type UserRatingsQueryInput,
} from "@unimarket/shared";
import { eventBus } from "../../platform/events/event-bus.js";
import { UsersRepository } from "../users/users.repository.js";

export class RatingsService {
  public static async createRating(
    reviewerId: string,
    input: CreateRatingInput,
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
    });

    if (!transaction) throw new NotFoundError("Transaction not found");

    if (transaction.status !== "completed") {
      throw new ConflictError(
        "Cannot review a deal that is not completed",
        ErrorCode.INVALID_STATE,
      );
    }

    const isBuyer = reviewerId === transaction.buyerId;
    const isSeller = reviewerId === transaction.sellerId;

    if (!isBuyer && !isSeller) {
      throw new ForbiddenError("You can only review deals you participated in");
    }

    const revieweeId = isBuyer ? transaction.sellerId : transaction.buyerId;

    // Check if reviewer already submitted review for this transaction
    const existing = await prisma.ratingReview.findUnique({
      where: {
        transactionId_reviewerId: {
          transactionId: input.transactionId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new ConflictError(
        "You have already submitted a review for this transaction",
      );
    }

    const rating = await prisma.ratingReview.create({
      data: {
        transactionId: input.transactionId,
        reviewerId,
        revieweeId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });

    // Recalculate reviewee profile aggregates
    UsersRepository.recalculateStats(revieweeId).catch(() => {});

    eventBus.emit("review.created", {
      ratingId: rating.id,
      transactionId: rating.transactionId,
      reviewerId,
      revieweeId,
      rating: rating.rating,
    });

    return {
      rating: {
        ratingId: rating.id,
        transactionId: rating.transactionId,
        revieweeId: rating.revieweeId,
        rating: rating.rating,
        comment: rating.comment,
        reviewer: {
          userId: rating.reviewer.id,
          firstName: rating.reviewer.firstName,
          avatarUrl: rating.reviewer.profile?.avatarUrl ?? null,
        },
        createdAt: rating.createdAt.toISOString(),
      },
    };
  }

  public static async getUserRatings(
    userId: string,
    query: UserRatingsQueryInput,
  ) {
    const { page, limit, sortBy } = query;
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "highest") orderBy = { rating: "desc" };
    if (sortBy === "lowest") orderBy = { rating: "asc" };

    const [total, ratings, distributionRows, userProfile] = await Promise.all([
      prisma.ratingReview.count({ where: { revieweeId: userId } }),
      prisma.ratingReview.findMany({
        where: { revieweeId: userId },
        skip,
        take: limit,
        orderBy,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      }),
      prisma.ratingReview.groupBy({
        by: ["rating"],
        where: { revieweeId: userId },
        _count: { rating: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { averageRating: true, totalRatings: true },
      }),
    ]);

    const distribution: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
    distributionRows.forEach((row) => {
      distribution[String(row.rating)] = row._count.rating;
    });

    const reviews = ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewer: {
        userId: r.reviewer.id,
        firstName: r.reviewer.firstName,
        avatarUrl: r.reviewer.profile?.avatarUrl ?? null,
      },
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      averageRating: userProfile?.averageRating ?? 0,
      totalRatings: userProfile?.totalRatings ?? total,
      distribution,
      reviews,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + reviews.length < total,
      },
    };
  }
}
