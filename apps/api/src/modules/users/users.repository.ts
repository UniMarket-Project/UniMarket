import { prisma } from "../../platform/database/prisma.client.js";
import type { Prisma } from "@prisma/client";

export class UsersRepository {
  public static async findByIdWithProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  public static async updateProfile(
    userId: string,
    data: Prisma.UserProfileUpdateInput,
  ) {
    return prisma.userProfile.update({
      where: { userId },
      data,
    });
  }

  public static async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  public static async recalculateStats(userId: string) {
    const ratingsAggregate = await prisma.ratingReview.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const dealsCount = await prisma.transaction.count({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: "completed",
      },
    });

    const reviewsCount = ratingsAggregate._count.rating || 0;
    const avgRating = Number((ratingsAggregate._avg.rating || 0).toFixed(1));

    return prisma.userProfile.update({
      where: { userId },
      data: {
        averageRating: avgRating,
        totalRatings: reviewsCount,
        totalReviews: reviewsCount,
        totalTransactions: dealsCount,
      },
    });
  }
}
