import { prisma } from "../../platform/database/prisma.client.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../platform/errors/http-errors.js";
import { LIMITS, type CreateReportInput } from "@unimarket/shared";
import { eventBus } from "../../platform/events/event-bus.js";

export class ReportsService {
  public static async createReport(
    reporterId: string,
    input: CreateReportInput,
  ) {
    if (input.reportType === 'user' && input.targetId === reporterId) {
      throw new BadRequestError("You cannot report yourself");
    }

    // Check target exists
    if (input.reportType === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: input.targetId },
      });
      if (!user) throw new NotFoundError("Target user not found");
    } else if (input.reportType === 'listing') {
      const listing = await prisma.listing.findUnique({
        where: { id: input.targetId },
      });
      if (!listing) throw new NotFoundError("Target listing not found");
    } else if (input.reportType === 'transaction') {
      const txn = await prisma.transaction.findUnique({
        where: { id: input.targetId },
      });
      if (!txn) throw new NotFoundError("Target transaction not found");
    }

    // Check duplicate open report
    const existing = await prisma.report.findFirst({
      where: {
        reporterId,
        reportType: input.reportType,
        targetId: input.targetId,
      },
    });

    if (existing) {
      throw new ConflictError(
        "You have already submitted a report for this post. You cannot report the same item more than once.",
      );
    }

    const report = await prisma.$transaction(async (tx) => {
      let created;
      try {
        created = await tx.report.create({
          data: {
            reporterId,
            reportType: input.reportType,
            targetId: input.targetId,
            category: input.category,
            description: input.description,
            status: 'submitted',
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          throw new ConflictError(
            'You have already submitted a report for this post. You cannot report the same item more than once.',
          );
        }
        throw err;
      }

      if (input.reportType === 'listing') {
        const listing = await tx.listing.update({
          where: { id: input.targetId },
          data: { reportCount: { increment: 1 } },
        });

        // Auto-hide at 3 reports
        if (
          listing.reportCount >= LIMITS.REPORT_AUTO_HIDE_THRESHOLD &&
          listing.status === 'active'
        ) {
          await tx.listing.update({
            where: { id: input.targetId },
            data: { status: 'hidden' },
          });

          eventBus.emit("report.threshold_reached", {
            targetId: input.targetId,
            reportCount: listing.reportCount,
          });
        }
      }

      return created;
    });

    eventBus.emit("report.submitted", {
      reportId: report.id,
      reportType: report.reportType,
      targetId: report.targetId,
      reporterId,
    });

    return {
      report: {
        reportId: report.id,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
      },
    };
  }
}
