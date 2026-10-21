// apps/api/src/modules/auth/auth.repository.ts
import { prisma } from "../../platform/database/prisma.client.js";
import type { Prisma } from "@prisma/client";

export class AuthRepository {
  public static async createRefreshToken(
    data: Prisma.RefreshTokenUncheckedCreateInput,
  ) {
    return prisma.refreshToken.create({ data });
  }

  public static async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  public static async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  public static async revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
