import cron from "node-cron";
import { prisma } from "../database/prisma.client.js";
import { logger } from "../logger/logger.js";

/**
 * Nightly at midnight: Expire stale transactions (older than 30 days)
 * Restores quantity to listing for in_progress transactions
 */
export async function expireStaleTransactions(): Promise<number> {
  logger.info("[Scheduler] Running transaction expiry job");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const staleTransactions = await prisma.transaction.findMany({
    where: {
      status: { in: ["pending", "in_progress"] },
      createdAt: { lt: thirtyDaysAgo },
    },
    include: { listing: true },
  });

  let expiredCount = 0;

  for (const tx of staleTransactions) {
    await prisma.$transaction(async (prismaClient) => {
      // Restore quantity if transaction had reserved items from a listing
      if (tx.status === "in_progress" && tx.listingId && tx.listing) {
        await prismaClient.listing.update({
          where: { id: tx.listingId },
          data: {
            quantityAvailable: { increment: tx.quantity },
            availabilityStatus: "available",
          },
        });
      }

      await prismaClient.transaction.update({
        where: { id: tx.id },
        data: {
          status: "cancelled",
          cancelReason: "Expired automatically after 30 days",
        },
      });
    });

    expiredCount++;
  }

  logger.info({ count: expiredCount }, "[Scheduler] Expired stale transactions");
  return expiredCount;
}

/**
 * Nightly at 1:00 AM: Archive expired listings
 */
export async function archiveExpiredListings(): Promise<number> {
  logger.info("[Scheduler] Running listing archive job");
  const now = new Date();
  const archived = await prisma.listing.updateMany({
    where: {
      status: "active",
      expiresAt: { lt: now },
    },
    data: {
      status: "removed",
      isDeleted: true,
      deletedAt: now,
    },
  });

  logger.info({ count: archived.count }, "[Scheduler] Archived expired listings");
  return archived.count;
}

/**
 * Nightly at 2:00 AM: Expire yearly verifications
 */
export async function expireYearlyVerifications(): Promise<number> {
  logger.info("[Scheduler] Running verification renewal expiry job");
  const now = new Date();
  const expiredVers = await prisma.userVerification.findMany({
    where: {
      status: "verified",
      expiresAt: { lt: now },
    },
    select: { id: true, userId: true },
  });

  for (const ver of expiredVers) {
    await prisma.$transaction([
      prisma.userVerification.update({
        where: { id: ver.id },
        data: { status: "unverified" },
      }),
      prisma.user.update({
        where: { id: ver.userId },
        data: { verificationStatus: "unverified" },
      }),
    ]);
  }

  logger.info({ count: expiredVers.length }, "[Scheduler] Expired verifications");
  return expiredVers.length;
}

/**
 * Hourly: Lift expired user suspensions
 */
export async function liftExpiredSuspensions(): Promise<number> {
  logger.info("[Scheduler] Running suspension lift check");
  const now = new Date();
  const lifted = await prisma.user.updateMany({
    where: {
      isActive: false,
      suspensionUntil: { lte: now, not: null },
    },
    data: {
      isActive: true,
      suspensionUntil: null,
    },
  });

  if (lifted.count > 0) {
    logger.info({ count: lifted.count }, "[Scheduler] Lifted user suspensions");
  }

  return lifted.count;
}

export function startBackgroundJobs(): void {
  logger.info("[Scheduler] Initializing cron jobs");

  // Nightly at midnight: Expire stale transactions
  cron.schedule("0 0 * * *", async () => {
    try {
      await expireStaleTransactions();
    } catch (err) {
      logger.error({ err }, "[Scheduler] Error in transaction expiry job");
    }
  });

  // Nightly at 1:00 AM: Archive expired listings
  cron.schedule("0 1 * * *", async () => {
    try {
      await archiveExpiredListings();
    } catch (err) {
      logger.error({ err }, "[Scheduler] Error in listing archive job");
    }
  });

  // Nightly at 2:00 AM: Expire yearly verifications
  cron.schedule("0 2 * * *", async () => {
    try {
      await expireYearlyVerifications();
    } catch (err) {
      logger.error({ err }, "[Scheduler] Error in verification expiry job");
    }
  });

  // Hourly: Lift expired suspensions
  cron.schedule("0 * * * *", async () => {
    try {
      await liftExpiredSuspensions();
    } catch (err) {
      logger.error({ err }, "[Scheduler] Error in suspension lift job");
    }
  });
}
