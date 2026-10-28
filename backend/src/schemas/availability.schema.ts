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

// Validation schema for priest partial blackout hours
export const blockHoursSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format'),
  reason: z.string().trim().max(255).optional(),
});

export type MarkDayOffInput = z.infer<typeof markDayOffSchema>;
export type BlockHoursInput = z.infer<typeof blockHoursSchema>;
