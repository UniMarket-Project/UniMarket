import { prisma } from '../../src/platform/database/prisma.client.js';
import bcrypt from 'bcryptjs';
import type { Role, UserType, VerificationStatus } from '@unimarket/shared';

export interface CreateTestUserOptions {
  email?: string;
  phone?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userType?: UserType;
  role?: Role;
  verificationStatus?: VerificationStatus;
  bio?: string;
  address?: string;
  universityCode?: string;
}

export async function createTestUser(options: CreateTestUserOptions = {}) {
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  const password = options.password || 'Password123!';
  const passwordHash = await bcrypt.hash(password, 8);

  const email = options.email || `test.student.${uniqueSuffix}@aau.edu.et`;
  const phone = options.phone || `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      firstName: options.firstName || 'Test',
      lastName: options.lastName || 'User',
      userType: options.userType || 'student',
      role: options.role || 'user',
      verificationStatus: options.verificationStatus || 'verified',
      profile: {
        create: {
          bio: options.bio || 'Test student profile bio',
          address: options.address || 'AAU 4-Kilo Dorms, Block 12',
          averageRating: 5.0,
          totalRatings: 0,
        },
      },
      ...(options.verificationStatus === 'verified'
        ? {
            verifications: {
              create: {
                type: 'student_id',
                idNumberEncrypted: 'mock-encrypted-id',
                idNumberHash: `mock-hash-${uniqueSuffix}`,
                universityCode: options.universityCode || 'AAU',
                status: 'verified',
                verifiedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      verifications: true,
    },
  });

  return { user, password };
}
