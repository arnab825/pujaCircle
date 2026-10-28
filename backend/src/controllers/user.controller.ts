import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../views/response.view.js';
import { userService } from '../services/user.service.js';

// Controller managing devotee profile details, personal address records, and credentials
export class UserController {
  // GET /api/v1/users/profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.id);
      sendSuccess(res, 'Profile retrieved successfully.', profile ?? req.user);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await userService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, 'Profile updated successfully.', updated ?? req.user);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/users/change-password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.changePassword(req.user!.id, req.body);
      sendSuccess(res, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
