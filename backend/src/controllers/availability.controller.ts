import { Request, Response, NextFunction } from 'express';
import { availabilityService } from '@/services/availability.service.js';
import { sendSuccess, sendError } from '@/views/response.view.js';

export class AvailabilityController {
  /**
   * POST /day-off
   * Mark a date as full day off (leave)
   */
  async markFullDayOff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Prioritize authenticated priest user id
      const priestId = req.user?.id || req.body.priestId;
      const { date, reason } = req.body;

      if (!priestId) {
        sendError(res, 'Authentication required or priestId must be provided', 401);
        return;
      }

      const result = await availabilityService.markFullDayOff(priestId, date, reason);
      sendSuccess(res, 'Day marked as off successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /block-hours
   * Block specific hours or set custom working hours on a date
   */
  async blockHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Prioritize authenticated priest user id
      const priestId = req.user?.id || req.body.priestId;
      const { date, startTime, endTime, reason, exceptionType } = req.body;

      if (!priestId) {
        sendError(res, 'Authentication required or priestId must be provided', 401);
        return;
      }

      const result = await availabilityService.blockHours(
        priestId,
        date,
        startTime,
        endTime,
        reason,
        exceptionType
      );
      sendSuccess(res, 'Hours configured successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /calendar
   * Get 3-month availability calendar
   */
  async getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = req.query.priestId as string || req.user?.id;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!priestId) {
        sendError(res, 'priestId is required to view availability calendar', 400);
        return;
      }

      const calendar = await availabilityService.calculateMonthAvailability(
        priestId,
        startDate,
        endDate
      );
      sendSuccess(res, 'Availability calendar fetched successfully', calendar);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /slots
   * Get available slots for a priest on a specific date
   */
  async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const priestId = (req.query.priestId as string) || req.user?.id;
      const date = req.query.date as string;
      const duration = parseInt(req.query.duration as string, 10) || 120;

      if (!priestId || !date) {
        sendError(res, 'priestId and date query parameters are required', 400);
        return;
      }

      const slots = await availabilityService.getDaySlots(priestId, date, duration);
      sendSuccess(res, 'Slots retrieved successfully', slots);
    } catch (error) {
      next(error);
    }
  }
}

export const availabilityController = new AvailabilityController();
