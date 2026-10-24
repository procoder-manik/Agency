import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type DB = PostgresJsDatabase<typeof schema>;
const g = globalThis as unknown as { __pg?: ReturnType<typeof postgres>; __db?: DB };

export function pg() {
  if (!g.__pg) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and add your PostgreSQL connection string.");
    g.__pg = postgres(url, { max: Number(process.env.PG_POOL_MAX || 5), idle_timeout: 20, prepare: false, onnotice: () => {} });
  }
  return g.__pg;
}

/** Lazily-created Drizzle client (so builds without a database still work). */
export function db(): DB {
  if (!g.__db) g.__db = drizzle(pg(), { schema });
  return g.__db;
}

export { schema };
