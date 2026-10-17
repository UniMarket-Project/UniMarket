import type { Request, Response, NextFunction } from 'express';
import { ErrorCode, type Role, type UserType, type VerificationStatus } from '@unimarket/shared';
import { verifyAccessToken } from '../security/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../errors/http-errors.js';
import { prisma } from '../database/prisma.client.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid', ErrorCode.UNAUTHENTICATED);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token is missing', ErrorCode.UNAUTHENTICATED);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Token expired or invalid', ErrorCode.TOKEN_EXPIRED);
    }

    // Check user in database
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

    if (!user || user.isDeleted) {
      throw new UnauthorizedError('User account not found', ErrorCode.UNAUTHENTICATED);
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account suspended', ErrorCode.ACCOUNT_SUSPENDED, {
        suspensionUntil: user.suspensionUntil,
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      userType: user.userType as UserType,
      verificationStatus: user.verificationStatus as VerificationStatus,
      isActive: user.isActive,
      suspensionUntil: user.suspensionUntil,
    };

    next();
  } catch (error) {
    next(error);
  }
}
