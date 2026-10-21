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
      
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          phone: input.phone,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          userType: input.userType,
          universityCode: input.universityCode ?? 'AAU',
        },
      });

      await tx.userProfile.create({
        data: {
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    eventBus.emit('user.registered', {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    const { accessToken, expiresIn } = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      userType: user.userType,
      verificationStatus: user.verificationStatus,
    });

    const rawRefreshToken = generateOpaqueToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role,
        verificationStatus: user.verificationStatus,
        universityCode: (user as any).universityCode ?? 'AAU',
      },
      accessToken,
      expiresIn,
      refreshToken: rawRefreshToken,
    };
  }


  public static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    const passwordValid = await comparePassword(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is suspended', ErrorCode.ACCOUNT_SUSPENDED, {
        suspensionUntil: user.suspensionUntil,
      });
    }

    const { accessToken, expiresIn } = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      userType: user.userType,
      verificationStatus: user.verificationStatus,
    });

    const rawRefreshToken = generateOpaqueToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        role: user.role,
        verificationStatus: user.verificationStatus,
        universityCode: (user as any).universityCode ?? 'AAU',
      },
      accessToken,
      expiresIn,
      refreshToken: rawRefreshToken,
    };
  }