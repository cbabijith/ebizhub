import { db } from "../../config/database.js";
import { branches } from "../../database/schema.js";
import { eq } from "drizzle-orm";

export async function validateBranch(branchId?: string) {
  if (!branchId) return;

  // Validate format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(branchId)) {
    const err = new Error("Invalid branch ID format");
    (err as any).status = 400;
    throw err;
  }

  const [exists] = await db.select().from(branches).where(eq(branches.id, branchId));
  if (!exists) {
    const err = new Error("Branch not found");
    (err as any).status = 404;
    throw err;
  }
}
