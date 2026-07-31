import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

/** True when a real Neon DATABASE_URL is configured. */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  // Placeholder from .env.local.example
  if (url.includes('ep-your-neon-endpoint')) return false;
  return true;
}

/**
 * Singleton Neon HTTP + Drizzle client for Route Handlers / Server Actions.
 * Throws if DATABASE_URL is missing — check isDatabaseConfigured() first.
 */
export function getDb(): Db {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add your Neon connection string to .env.local'
    );
  }
  if (!_db) {
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

/** @deprecated Prefer getDb() — kept for brief import style `import { db }`. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
