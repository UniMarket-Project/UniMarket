// apps/api/src/modules/auth/auth.service.ts
import { prisma } from '../../platform/database/prisma.client.js';
import { hashPassword, comparePassword } from '../../platform/security/password.js';
import { signAccessToken } from '../../platform/security/jwt.js';
import { generateOpaqueToken, hashRefreshToken } from '../../platform/security/token-hash.js';
import { eventBus } from '../../platform/events/event-bus.js';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../platform/errors/http-errors.js';
import { ErrorCode, type RegisterInput, type LoginInput } from '@unimarket/shared';
import { AuthRepository } from './auth.repository.js';

export class AuthService {
  public static async register(input: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists', ErrorCode.EMAIL_TAKEN, { field: 'email' });
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
      select: { id: true },
    });
    if (existingPhone) {
      throw new ConflictError('An account with this phone number already exists', ErrorCode.PHONE_TAKEN, { field: 'phone' });
    }