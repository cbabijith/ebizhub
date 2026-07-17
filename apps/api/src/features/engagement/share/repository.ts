import { db } from "../../../config/database.js";
import { shareLinks } from "../../../database/schema.js";
import { eq, and, isNull, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("hex"); // 64 hex chars, 256 bits of entropy
}

export class ShareLinksRepository {
  async create(data: {
    resourceType: string;
    resourceId: string;
    createdBy: string;
    expiresAt?: Date;
  }) {
    const token = generateToken();
    const [result] = await db
      .insert(shareLinks)
      .values({
        token,
        resourceType: data.resourceType as any,
        resourceId: data.resourceId,
        createdBy: data.createdBy,
        expiresAt: data.expiresAt ?? null,
        clickCount: 0,
      })
      .returning();
    return result;
  }

  async findByToken(token: string) {
    const [result] = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.token, token))
      .limit(1);
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.id, id))
      .limit(1);
    return result;
  }

  async incrementClickCount(id: string) {
    const [result] = await db
      .update(shareLinks)
      .set({
        clickCount: sql`${shareLinks.clickCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shareLinks.id, id))
      .returning();
    return result;
  }

  async softDelete(id: string) {
    const [result] = await db
      .update(shareLinks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shareLinks.id, id))
      .returning();
    return result;
  }
}
