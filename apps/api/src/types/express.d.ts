import type { Role, UserType, VerificationStatus } from '@unimarket/shared';

export interface AuthContextUser {
  userId: string;
  email: string;
  role: Role;
  userType: UserType;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  suspensionUntil?: Date | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthContextUser;
      requestId?: string;
    }
  }
}
