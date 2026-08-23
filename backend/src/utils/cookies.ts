import { CookieOptions } from 'express';
import { env } from '../config/env.js';

/**
 * Cookie Helper Skeleton
 */
export const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
