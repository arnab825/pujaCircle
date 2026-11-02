import { z } from 'zod';

// Date format: YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Time format: HH:mm (24-hour)
const timeRegex = /^\d{2}:\d{2}$/;

// Validation schema for priest full-day-off leave requests
export const markDayOffSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  reason: z.string().trim().max(255).optional(),
});

// Validation schema for priest partial blackout hours or custom working window
export const blockHoursSchema = z
  .object({
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
    endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
    reason: z.string().trim().max(255).optional(),
    exceptionType: z.enum(['BLOCK', 'CUSTOM_HOURS']).optional().default('BLOCK'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  });

export const calendarQuerySchema = z.object({
  priestId: z.string().uuid('Invalid Priest ID format').optional(),
  startDate: z.string().regex(dateRegex, 'startDate must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(dateRegex, 'endDate must be in YYYY-MM-DD format').optional(),
});

export type MarkDayOffInput = z.infer<typeof markDayOffSchema>;
export type BlockHoursInput = z.infer<typeof blockHoursSchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
