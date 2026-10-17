import type { Request, Response, NextFunction } from 'express';
import type { Role, UserType, VerificationStatus } from '@unimarket/shared';
import { verifyAccessToken } from '../security/jwt.js';
import { prisma } from '../database/prisma.client.js';

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        userType: true,
        verificationStatus: true,
        isActive: true,
        suspensionUntil: true,
        isDeleted: true,
      },
    });

    if (user && !user.isDeleted && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role as Role,
        userType: user.userType as UserType,
        verificationStatus: user.verificationStatus as VerificationStatus,
        isActive: user.isActive,
        suspensionUntil: user.suspensionUntil,
      };
    }
  } catch {
    // Ignore invalid token on optional auth
  }

  next();
}
