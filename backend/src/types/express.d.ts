/**
 * Express Request Type Augmentation Skeleton
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phoneNumber: string;
        role: 'USER' | 'PRIEST' | 'ADMIN';
      };
    }
  }
}

export {};
