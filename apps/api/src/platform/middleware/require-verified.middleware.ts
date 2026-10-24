import type { Request, Response, NextFunction } from 'express';
import { VerificationStatus, Role, ErrorCode } from '@unimarket/shared';
import { ForbiddenError, UnauthorizedError } from '../errors/http-errors.js';

export function requireVerified(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Admins bypass verification requirements
  if (req.user.role === Role.ADMIN) {
    return next();
  }

  if (req.user.verificationStatus !== VerificationStatus.VERIFIED) {
    return next(
      new ForbiddenError(
        'Campus ID verification required to perform this action. Please verify your account first.',
        ErrorCode.VERIFICATION_REQUIRED,
        { verificationStatus: req.user.verificationStatus }
      )
    );
  }

  next();
}
