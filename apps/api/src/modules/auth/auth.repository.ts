// apps/api/src/modules/auth/auth.repository.ts
import { prisma } from "../../platform/database/prisma.client.js";
import type { Prisma } from "@prisma/client";

export class AuthRepository {
  public static async createRefreshToken(
    data: Prisma.RefreshTokenUncheckedCreateInput,
  ) {
    return prisma.refreshToken.create({ data });
  }
}
