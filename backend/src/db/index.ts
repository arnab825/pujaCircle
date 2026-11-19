import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/models/index.js';
import { env } from '@/config/env.js';

/**
 * PostgreSQL Connection Pool via postgres.js
 * In production/serverless, max connections can be tailored; default is 10.
 * SSL is enforced in production or when connecting to cloud providers (Supabase/Neon/AWS).
 */
const requiresSsl =
  env.NODE_ENV === 'production' ||
  env.DATABASE_URL.includes('supabase') ||
  env.DATABASE_URL.includes('pooler') ||
  env.DATABASE_URL.includes('sslmode=require');

export const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Ensures compatibility with Supabase connection poolers
  ssl: requiresSsl ? 'require' : false,
});

/**
 * Drizzle ORM Database Instance
 * Provides type-safe queries and relations across all PujaCircle tables.
 */
export const db = drizzle(queryClient, { schema });

export type AppDatabase = typeof db;
