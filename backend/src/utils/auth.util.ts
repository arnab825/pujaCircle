import { Request } from 'express';
import { AuthUserContext } from '@/types/express.js';

// Check if a user context or request belongs to an authenticated admin
export const isAdmin = (target: Request | AuthUserContext | undefined | null): boolean => {
  if (!target) return false;

  // Extract AuthUserContext whether passed as req or as user object directly
  const user = 'user' in target ? target.user : (target as AuthUserContext);
  return Boolean(user && user.role === 'ADMIN' && user.accountStatus !== 'BANNED');
};

// Normalize Indian phone numbers to E.164 standard (+91XXXXXXXXXX)
export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
};
