import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

/**
 * Enums for User Roles & Account Moderation Status
 */
export const roleEnum = pgEnum('user_role', ['USER', 'PRIEST', 'ADMIN']);
export const accountStatusEnum = pgEnum('account_status', ['ACTIVE', 'BANNED']);

/**
 * [MODEL] Users Table
 * Maps public profile data in PostgreSQL to Supabase auth.users identifier (UUID).
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase auth.users.id
  name: varchar('name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  role: roleEnum('role').default('USER').notNull(),
  accountStatus: accountStatusEnum('account_status').default('ACTIVE').notNull(),
  banReason: text('ban_reason'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
