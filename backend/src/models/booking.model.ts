import { pgTable, uuid, integer, timestamp, pgEnum, text, varchar, index } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';
import { priestProfiles, priestServices } from './priest.model.js';
import { addresses } from './address.model.js';
import { pujaCatalog } from './catalog.model.js';

export const bookingStatusEnum = pgEnum('booking_status', [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'COMPLETED',
]);

export const paymentMethodEnum = pgEnum('payment_method', ['OFFLINE_CASH']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID_OFFLINE']);
export const cancelledByEnum = pgEnum('cancelled_by', ['USER', 'PRIEST', 'ADMIN']);

/**
 * [MODEL] Bookings Table
 * Represents devotee reservations with assigned verified priests.
 */
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingReference: varchar('booking_reference', { length: 50 }).notNull().unique(), // e.g. PC-2026-0812 - must be unique across all bookings
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  priestId: uuid('priest_id').references(() => priestProfiles.id, { onDelete: 'set null' }),
  priestServiceId: uuid('priest_service_id').references(() => priestServices.id, { onDelete: 'set null' }),
  pujaCatalogId: uuid('puja_catalog_id').references(() => pujaCatalog.id, { onDelete: 'set null' }),
  addressId: uuid('address_id').references(() => addresses.id, { onDelete: 'set null' }),
  serviceName: varchar('service_name', { length: 255 }).default('Puja Ceremony').notNull(),
  servicePrice: integer('service_price').notNull(), // Stored in whole Indian Rupees (INR). e.g. ₹1001 -> 1001
  totalPrice: integer('total_price').notNull(), // Stored in whole Indian Rupees (INR). e.g. ₹1001 -> 1001
  bookingDate: varchar('booking_date', { length: 10 }).notNull(), // Canonical ceremony calendar date in IST (YYYY-MM-DD)
  startTime: varchar('start_time', { length: 10 }).default('').notNull(), // HH:mm
  endTime: varchar('end_time', { length: 10 }).default('').notNull(), // HH:mm
  scheduledDate: timestamp('scheduled_date').defaultNow().notNull(), // Timestamp snapshot for chronological ordering & range querying
  status: bookingStatusEnum('status').default('PENDING').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').default('OFFLINE_CASH').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('PENDING').notNull(),
  specialInstructions: text('special_instructions'),
  notes: text('notes'), // Legacy column retained for schema compatibility
  completionCode: varchar('completion_code', { length: 10 }),
  rejectionReason: text('rejection_reason'),
  cancellationReason: text('cancellation_reason'),
  cancelledBy: cancelledByEnum('cancelled_by'),
  cancelledAt: timestamp('cancelled_at'),
  completedAt: timestamp('completed_at'),
  rating: integer('rating'),
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
}, (table) => [
  index('bookings_user_id_idx').on(table.userId),
  index('bookings_priest_id_idx').on(table.priestId),
  index('bookings_status_idx').on(table.status),
  index('bookings_booking_date_idx').on(table.bookingDate),
]);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
