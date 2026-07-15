import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema.js";
import { env } from "./env.js";

export const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
