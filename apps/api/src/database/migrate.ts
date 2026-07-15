import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ezhavaclub";

const migrationClient = postgres(connectionString, { max: 1 });
const db = drizzle(migrationClient);

console.log("Running migrations...");

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations successfully applied!");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await migrationClient.end();
}
