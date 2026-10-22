import { prisma } from "../../platform/database/prisma.client.js";
import type { Prisma } from "@prisma/client";

export class AuditService {
  public static async log(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, unknown> = {},
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details as Prisma.InputJsonValue,
      },
    });
  }
}
