import { prisma } from '../../src/platform/database/prisma.client.js';

/**
 * Truncates and resets all test database tables between test suites.
 * Uses deleteMany in reverse dependency order for maximum compatibility
 * across standard Postgres and remote connection poolers.
 */
export async function truncateTestDatabase(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.ratingReview.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.request.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userVerification.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}
