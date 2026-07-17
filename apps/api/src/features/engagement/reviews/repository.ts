import { db } from "../../../config/database.js";
import { reviews, reviewReports, profiles } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc } from "drizzle-orm";

export class ReviewsRepository {
  async create(profileId: string, resourceType: "business" | "provider", resourceId: string, content: string, isVerifiedMember: boolean) {
    const [result] = await db
      .insert(reviews)
      .values({
        profileId,
        resourceType,
        resourceId,
        content,
        isVerifiedMember,
        status: "approved", // default status
      })
      .returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    return result;
  }

  async update(id: string, content: string) {
    const [result] = await db
      .update(reviews)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await db
      .update(reviews)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();
    return result;
  }

  async findActiveByResource(resourceType: "business" | "provider", resourceId: string) {
    return await db
      .select({
        id: reviews.id,
        content: reviews.content,
        isVerifiedMember: reviews.isVerifiedMember,
        status: reviews.status,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        author: {
          fullName: profiles.fullName,
          avatar: profiles.avatar,
        },
      })
      .from(reviews)
      .leftJoin(profiles, eq(reviews.profileId, profiles.id))
      .where(
        and(
          eq(reviews.resourceType, resourceType),
          eq(reviews.resourceId, resourceId),
          eq(reviews.status, "approved"),
          isNull(reviews.deletedAt)
        )
      )
      .orderBy(desc(reviews.createdAt));
  }

  async createReport(profileId: string, reviewId: string, reason: string) {
    const [result] = await db
      .insert(reviewReports)
      .values({
        profileId,
        reviewId,
        reason,
      })
      .returning();
    return result;
  }

  async findUniqueReport(profileId: string, reviewId: string) {
    const [result] = await db
      .select()
      .from(reviewReports)
      .where(
        and(
          eq(reviewReports.profileId, profileId),
          eq(reviewReports.reviewId, reviewId)
        )
      )
      .limit(1);
    return result;
  }

  async listReported() {
    return await db
      .select({
        id: reviewReports.id,
        reason: reviewReports.reason,
        status: reviewReports.status,
        createdAt: reviewReports.createdAt,
        reporter: {
          fullName: profiles.fullName,
        },
        review: {
          id: reviews.id,
          content: reviews.content,
          resourceType: reviews.resourceType,
          resourceId: reviews.resourceId,
          status: reviews.status,
          deletedAt: reviews.deletedAt,
        },
      })
      .from(reviewReports)
      .leftJoin(profiles, eq(reviewReports.profileId, profiles.id))
      .leftJoin(reviews, eq(reviewReports.reviewId, reviews.id))
      .orderBy(desc(reviewReports.createdAt));
  }

  async updateStatus(id: string, status: "pending" | "approved" | "rejected") {
    const [result] = await db
      .update(reviews)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, id))
      .returning();
    return result;
  }
}
