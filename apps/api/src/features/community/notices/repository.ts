import { db } from "../../../config/database.js";
import { notices } from "../../../database/schema.js";
import { eq, and, isNull, desc, sql, SQL, or, gt } from "drizzle-orm";

export class NoticeRepository {
  async findNotices(params: {
    noticeType?: string;
    priority?: string;
    branchId?: string;
    status?: string;
    limit: number;
    offset: number;
  }) {
    const conditions: SQL[] = [isNull(notices.deletedAt)];

    if (params.noticeType) {
      conditions.push(eq(notices.noticeType, params.noticeType as any));
    }
    if (params.priority) {
      conditions.push(eq(notices.priority, params.priority as any));
    }
    if (params.branchId) {
      conditions.push(eq(notices.branchId, params.branchId));
    }
    if (params.status) {
      conditions.push(eq(notices.status, params.status as any));
      if (params.status === "active") {
        conditions.push(or(isNull(notices.expiresAt), gt(notices.expiresAt, new Date())) as SQL);
      }
    }

    return db
      .select()
      .from(notices)
      .where(and(...conditions))
      .orderBy(desc(notices.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(notices)
      .where(and(eq(notices.id, id), isNull(notices.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(notices).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(notices)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(notices.id, id), isNull(notices.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(notices)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        status: "archived",
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(notices.id, id), isNull(notices.deletedAt)))
      .returning();
    return result;
  }
}
