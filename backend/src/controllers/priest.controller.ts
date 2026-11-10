import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../views/response.view.js';
import { priestService } from '../services/priest.service.js';
import { userService } from '../services/user.service.js';

/**
 * Controller managing verified priest directory, profile customizations,
 * ritual services, and availability schedules.
 */
export class PriestController {
  // GET /api/v1/priests
  async searchPriests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priests = await priestService.searchPriests(req.query as any);
      sendSuccess(res, 'Verified priests retrieved.', priests);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/priests/:id
  async getPriestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priest = await priestService.getPriestById(req.params.id);
      if (!priest) {
        sendError(res, `Priest profile ${req.params.id} not found.`, 404);
        return;
      }
      sendSuccess(res, `Priest profile ${req.params.id} retrieved.`, priest);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/priests/me/profile
  async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await priestService.getMyProfile(req.user!.id);
      sendSuccess(res, 'Priest profile details retrieved.', profile ?? req.user);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/priests/me/profile or PUT /api/v1/priests/:id
  async updatePriestProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetId = req.params.id || req.user!.id;
      const updated = await priestService.updatePriestProfile(targetId, req.body);
      sendSuccess(res, 'Priest profile updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/priests/me/change-password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.changePassword(req.user!.id, req.body);
      sendSuccess(res, 'Password updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/priests/me/services or GET /api/v1/priests/:id/services
  async getPriestServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const services = await priestService.getPriestServices(priestId);
      sendSuccess(res, 'Priest services retrieved.', services);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/priests/me/services or POST /api/v1/priests/:id/services
  async createPriestService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const service = await priestService.createPriestService(priestId, req.body);
      sendSuccess(res, 'Service offering created.', service, 201);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/priests/:id/services/:serviceId
  async updatePriestService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const updated = await priestService.updatePriestService(
        priestId,
        req.params.serviceId,
        req.body
      );
      sendSuccess(res, 'Service offering updated.', updated);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/priests/me/services/:serviceId or DELETE /api/v1/priests/:id/services/:serviceId
  async deletePriestService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      await priestService.deletePriestService(priestId, req.params.serviceId);
      sendSuccess(res, `Service ${req.params.serviceId} removed.`);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/priests/:id/services/:serviceId/toggle
  async togglePriestService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const result = await priestService.togglePriestService(priestId, req.params.serviceId);
      sendSuccess(res, 'Service status toggled.', result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/priests/me/exceptions or GET /api/v1/priests/:id/exceptions
  async getPriestExceptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const exceptions = await priestService.getPriestExceptions(priestId, req.query as any);
      sendSuccess(res, 'Priest availability exceptions retrieved.', exceptions);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/priests/:id/exceptions/:exceptionId
  async updatePriestException(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const updated = await priestService.updatePriestException(
        priestId,
        req.params.exceptionId,
        req.body
      );
      sendSuccess(res, 'Availability exception updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/priests/me/exceptions/:exceptionId or DELETE /api/v1/priests/:id/exceptions/:exceptionId
  async deletePriestException(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      await priestService.deletePriestException(priestId, req.params.exceptionId);
      sendSuccess(res, 'Availability exception deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/priests/me/working-hours or GET /api/v1/priests/:id/working-hours
  async getPriestWorkingHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const workingHours = await priestService.getWorkingHours(priestId);
      sendSuccess(res, 'Priest working hours retrieved.', workingHours);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/priests/me/working-hours or PUT /api/v1/priests/:id/working-hours
  async updatePriestWorkingHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.params.id || req.user!.id;
      const updated = await priestService.updateWorkingHours(priestId, req.body);
      sendSuccess(res, 'Priest working hours updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  }
}

export const priestController = new PriestController();
