import { UserProfile, UpdateUserProfileRequest } from '@/types/user.types';
import { mockDb } from '@/mocks/db';
import { delay } from '@/mocks/delay';

export const userApi = {
  getProfile: async (userId = 'usr_mock_1'): Promise<UserProfile> => {
    await delay();
    const user = mockDb.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user };
  },

  updateProfile: async (userId: string, data: UpdateUserProfileRequest): Promise<UserProfile> => {
    await delay();
    const index = mockDb.users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');
    mockDb.users[index] = { ...mockDb.users[index], ...data };
    return { ...mockDb.users[index] };
  },
};
