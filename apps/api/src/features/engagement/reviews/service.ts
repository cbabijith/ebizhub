import { ReviewsRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import { businesses, serviceProviders, members } from "../../../database/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const repo = new ReviewsRepository();

export class ReviewsService {
  async addReview(profileId: string, resourceType: "business" | "provider", resourceId: string, content: string) {
    // 1. Verify target exists and is active
    if (resourceType === "business") {
      const [biz] = await db
        .select()
        .from(businesses)
        .where(
          and(
            eq(businesses.id, resourceId),
            eq(businesses.status, "active"),
            isNull(businesses.deletedAt)
          )
        )
        .limit(1);
      if (!biz) {
        const err = new Error("Business not found");
        (err as any).status = 404;
        throw err;
      }
    } else {
      const [provider] = await db
        .select()
        .from(serviceProviders)
        .where(
          and(
            eq(serviceProviders.id, resourceId),
            eq(serviceProviders.status, "active"),
            isNull(serviceProviders.deletedAt)
          )
        )
        .limit(1);
      if (!provider) {
        const err = new Error("Service provider not found");
        (err as any).status = 404;
        throw err;
      }
    }

    // 2. Check if author is a verified community member
    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.profileId, profileId),
          eq(members.verificationStatus, "verified")
        )
      )
      .limit(1);
    
    const isVerifiedMember = !!member;

    return await repo.create(profileId, resourceType, resourceId, content, isVerifiedMember);
  }

  async updateReview(id: string, profileId: string, content: string) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Review not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this review");
      (err as any).status = 403;
      throw err;
    }

    return await repo.update(id, content);
  }

  async deleteReview(id: string, profileId: string) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Review not found");
      (err as any).status = 404;
      throw err;
    }

    if (existing.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this review");
      (err as any).status = 403;
      throw err;
    }

    return await repo.delete(id);
  }

  async getReviewsForResource(resourceType: "business" | "provider", resourceId: string) {
    return await repo.findActiveByResource(resourceType, resourceId);
  }

  async getReviewById(id: string) {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Review not found");
      (err as any).status = 404;
      throw err;
    }
    return existing;
  }

  async reportReview(profileId: string, reviewId: string, reason: string) {
    const review = await repo.findById(reviewId);
    if (!review || review.deletedAt) {
      const err = new Error("Review not found");
      (err as any).status = 404;
      throw err;
    }

    const existingReport = await repo.findUniqueReport(profileId, reviewId);
    if (existingReport) {
      const err = new Error("You have already reported this review");
      (err as any).status = 409;
      throw err;
    }

    return await repo.createReport(profileId, reviewId, reason);
  }

  async getReportedReviews() {
    return await repo.listReported();
  }

  async moderateReview(id: string, status: "pending" | "approved" | "rejected") {
    const existing = await repo.findById(id);
    if (!existing || existing.deletedAt) {
      const err = new Error("Review not found");
      (err as any).status = 404;
      throw err;
    }

    return await repo.updateStatus(id, status);
  }
}
