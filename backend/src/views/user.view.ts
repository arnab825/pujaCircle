import { User } from '@/models/user.model.js';
import { AuthUserContext } from '@/types/express.js';

export interface UserViewModel {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: 'USER' | 'PRIEST' | 'ADMIN';
  accountStatus: 'ACTIVE' | 'BANNED';
  avatarUrl?: string;
  createdAt?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * [VIEW] User Presentation Serializer
 * Sanitizes user database records before returning to frontend callers.
 */
export const toUserView = (user: User | AuthUserContext, approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'): UserViewModel => {
  return {
    id: user.id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    email: user.email || undefined,
    role: user.role,
    accountStatus: user.accountStatus,
    avatarUrl: user.avatarUrl || undefined,
    ...('createdAt' in user && user.createdAt ? { createdAt: user.createdAt.toISOString() } : {}),
    ...(approvalStatus ? { approvalStatus } : {}),
  };
};
