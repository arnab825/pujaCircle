import { UserProfile, UpdateUserProfileRequest } from '@/types/user.types';
import { mockUsers } from '@/mocks/db';
import { delay } from '@/mocks/delay';

export const userApi = {
  getProfile: async (userId = 'user-devotee-1'): Promise<UserProfile> => {
    await delay(200);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
  },

  updateProfile: async (userId: string, data: UpdateUserProfileRequest): Promise<UserProfile> => {
    await delay(300);
    const index = mockUsers.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = { ...mockUsers[index], ...data };
    const user = mockUsers[index];
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
  },
};
