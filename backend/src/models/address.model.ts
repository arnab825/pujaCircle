import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

// Model for devotee venue addresses for in-person Puja ceremonies
export const addresses = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }),
  houseNo: varchar('house_no', { length: 100 }).notNull(),
  houseBuilding: varchar('house_building', { length: 255 }),
  street: varchar('street', { length: 255 }),
  locality: varchar('locality', { length: 255 }),
  villageTown: varchar('village_town', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
