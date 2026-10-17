import type { Request, Response, NextFunction } from 'express';
import { Role, ErrorCode } from '@unimarket/shared';
import { ForbiddenError, UnauthorizedError } from '../errors/http-errors.js';

export function requireRole(allowedRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== allowedRole) {
      return next(new ForbiddenError(`Requires ${allowedRole} role`, ErrorCode.FORBIDDEN));
    }

    next();
  };
}
