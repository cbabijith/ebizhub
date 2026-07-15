import { db } from "../../../config/database.js";
import { providerVerificationRequests, serviceProviders } from "../../../database/schema.js";
import { eq, and, desc } from "drizzle-orm";

export class VerificationRepository {
  async create(data: any) {
    return await db.transaction(async (tx) => {
      const [req] = await tx.insert(providerVerificationRequests).values(data).returning();
      // Update provider verification status to pending
      await tx
        .update(serviceProviders)
        .set({ verificationStatus: "pending" })
        .where(eq(serviceProviders.id, data.providerId));
      return req;
    });
  }

  async updateStatus(id: string, reviewerId: string, status: "approved" | "rejected", remarks: string | null, providerId: string) {
    return await db.transaction(async (tx) => {
      const [req] = await tx
        .update(providerVerificationRequests)
        .set({
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          remarks,
        })
        .where(eq(providerVerificationRequests.id, id))
        .returning();

      // Update provider verification status
      const verificationStatus = status === "approved" ? "verified" : "rejected";
      await tx
        .update(serviceProviders)
        .set({ verificationStatus, updatedAt: new Date() })
        .where(eq(serviceProviders.id, providerId));

      return req;
    });
  }

  async findPendingByProvider(providerId: string) {
    const [result] = await db
      .select()
      .from(providerVerificationRequests)
      .where(and(eq(providerVerificationRequests.providerId, providerId), eq(providerVerificationRequests.status, "pending")));
    return result;
  }

  async findHistoryByProvider(providerId: string) {
    return await db
      .select()
      .from(providerVerificationRequests)
      .where(eq(providerVerificationRequests.providerId, providerId))
      .orderBy(desc(providerVerificationRequests.createdAt));
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(providerVerificationRequests)
      .where(eq(providerVerificationRequests.id, id));
    return result;
  }
}
