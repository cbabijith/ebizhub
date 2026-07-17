import { db } from "../../../config/database.js";
import { events, eventRegistrations, newsCategories, members } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc, asc, gte, lte, or, count, ne, SQL } from "drizzle-orm";

export class EventRepository {
  async findEvents(params: {
    status?: string;
    categoryId?: string;
    branchId?: string;
    limit: number;
    offset: number;
  }) {
    const conditions: SQL[] = [isNull(events.deletedAt)];

    if (params.status) {
      if (params.status === "upcoming") {
        conditions.push(gte(events.startDate, new Date()));
      } else if (params.status === "ongoing") {
        conditions.push(and(lte(events.startDate, new Date()), gte(events.endDate, new Date())) as any);
      } else if (params.status === "completed") {
        conditions.push(lte(events.endDate, new Date()));
      } else {
        conditions.push(eq(events.status, params.status as any));
      }
    }

    if (params.categoryId) {
      conditions.push(eq(events.categoryId, params.categoryId));
    }

    if (params.branchId) {
      conditions.push(eq(events.branchId, params.branchId));
    }

    return db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        banner: events.banner,
        categoryId: events.categoryId,
        categoryName: newsCategories.name,
        organizerId: events.organizerId,
        branchId: events.branchId,
        venue: events.venue,
        latitude: events.latitude,
        longitude: events.longitude,
        startDate: events.startDate,
        endDate: events.endDate,
        registrationStart: events.registrationStart,
        registrationEnd: events.registrationEnd,
        maxParticipants: events.maxParticipants,
        entryFee: events.entryFee,
        contactPhone: events.contactPhone,
        contactEmail: events.contactEmail,
        status: events.status,
        createdAt: events.createdAt,
      })
      .from(events)
      .leftJoin(newsCategories, eq(events.categoryId, newsCategories.id))
      .where(and(...conditions))
      .orderBy(asc(events.startDate))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(events).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(events)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(events.id, id), isNull(events.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(events)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        status: "cancelled",
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(events.id, id), isNull(events.deletedAt)))
      .returning();
    return result;
  }

  // --- Registration Operations ---
  async getRegistrationCount(eventId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          isNull(eventRegistrations.deletedAt),
          ne(eventRegistrations.status, "rejected"),
          ne(eventRegistrations.status, "cancelled")
        )
      );
    return result?.count || 0;
  }

  async getRegistration(eventId: string, memberId: string) {
    const [result] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.memberId, memberId),
          isNull(eventRegistrations.deletedAt)
        )
      );
    return result;
  }

  async createRegistration(data: any) {
    const [result] = await db.insert(eventRegistrations).values(data).returning();
    return result;
  }

  async updateRegistrationStatus(id: string, status: string, userId: string) {
    const [result] = await db
      .update(eventRegistrations)
      .set({
        status: status as any,
        updatedBy: userId,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(eventRegistrations.id, id), isNull(eventRegistrations.deletedAt)))
      .returning();
    return result;
  }

  async getRegistrationsForEvent(eventId: string) {
    return db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), isNull(eventRegistrations.deletedAt)));
  }

  async findMemberByProfileId(profileId: string) {
    const [result] = await db
      .select()
      .from(members)
      .where(eq(members.profileId, profileId));
    return result;
  }
}
