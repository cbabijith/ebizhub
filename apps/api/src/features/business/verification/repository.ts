import { db } from "../../../config/database.js";
import { businesses, verificationRequests } from "../../../database/schema.js";
import { eq, and } from "drizzle-orm";

export class VerificationRepository {
  async reviewBusiness(
    businessId: string,
    reviewerId: string,
    status: "verified" | "rejected",
    remarks: string | null
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update business table status
      await tx
        .update(businesses)
        .set({
          verificationStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, businessId));

      // 2. Insert verification request log
      const [log] = await tx
        .insert(verificationRequests)
        .values({
          businessId,
          submittedBy: reviewerId, // For simplicity in MVP, we track who reviewed/acted on it here
          status: status === "verified" ? "approved" : "rejected",
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          remarks,
        })
        .returning();

      return log;
    });
  }

  async getPendingRequests() {
    return await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.status, "pending"));
  }

  async submitRequest(businessId: string, ownerId: string) {
    return await db.transaction(async (tx) => {
      await tx
        .update(businesses)
        .set({ verificationStatus: "pending", updatedAt: new Date() })
        .where(eq(businesses.id, businessId));

      const [log] = await tx
        .insert(verificationRequests)
        .values({
          businessId,
          submittedBy: ownerId,
          status: "pending",
        })
        .returning();
      return log;
    });
  }

  async getVerificationHistory(businessId: string) {
    return await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.businessId, businessId))
      .orderBy(verificationRequests.createdAt);
  }
}

