import { createTestUser, type CreateTestUserOptions } from './user.factory.js';
import { signAccessToken } from '../../src/platform/security/jwt.js';
import type { Role, UserType, VerificationStatus } from '@unimarket/shared';

export interface AuthenticatedUserResult {
  user: Awaited<ReturnType<typeof createTestUser>>['user'];
  password: string;
  token: string;
  authHeader: string;
}

export async function createAuthenticatedUser(
  options: CreateTestUserOptions = {}
): Promise<AuthenticatedUserResult> {
  const { user, password } = await createTestUser(options);

  const { accessToken } = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as Role,
    userType: user.userType as UserType,
    verificationStatus: user.verificationStatus as VerificationStatus,
  });

  return {
    user,
    password,
    token: accessToken,
    authHeader: `Bearer ${accessToken}`,
  };
}
