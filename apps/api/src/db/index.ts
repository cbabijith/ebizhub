import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ezhavaclub";

// Disable prefetch as it is not supported by Supabase connection pooling (if pooling is used)
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
