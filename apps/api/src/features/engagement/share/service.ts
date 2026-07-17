import { ShareLinksRepository } from "./repository.js";
import { db } from "../../../config/database.js";
import {
  businesses,
  serviceProviders,
  communityNews,
  events,
  jobs,
  offers,
} from "../../../database/schema.js";
import { eq, and, isNull, gte, or } from "drizzle-orm";

type ResourceType = "business" | "service-provider" | "news" | "event" | "job" | "offer";

const repo = new ShareLinksRepository();

async function assertResourceAvailable(resourceType: ResourceType, resourceId: string): Promise<void> {
  let found = false;

  if (resourceType === "business") {
    const [row] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(and(eq(businesses.id, resourceId), eq(businesses.status, "active"), isNull(businesses.deletedAt)))
      .limit(1);
    found = !!row;
  } else if (resourceType === "service-provider") {
    const [row] = await db
      .select({ id: serviceProviders.id })
      .from(serviceProviders)
      .where(and(eq(serviceProviders.id, resourceId), eq(serviceProviders.status, "active"), isNull(serviceProviders.deletedAt)))
      .limit(1);
    found = !!row;
  } else if (resourceType === "news") {
    const [row] = await db
      .select({ id: communityNews.id })
      .from(communityNews)
      .where(and(eq(communityNews.id, resourceId), eq(communityNews.status, "published"), isNull(communityNews.deletedAt)))
      .limit(1);
    found = !!row;
  } else if (resourceType === "event") {
    const [row] = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.id, resourceId),
          or(eq(events.status, "upcoming"), eq(events.status, "ongoing")),
          isNull(events.deletedAt)
        )
      )
      .limit(1);
    found = !!row;
  } else if (resourceType === "job") {
    const [row] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, resourceId), eq(jobs.status, "active"), isNull(jobs.deletedAt)))
      .limit(1);
    found = !!row;
  } else if (resourceType === "offer") {
    const [row] = await db
      .select({ id: offers.id })
      .from(offers)
      .where(
        and(
          eq(offers.id, resourceId),
          eq(offers.status, "active"),
          gte(offers.validTo, new Date()),
          isNull(offers.deletedAt)
        )
      )
      .limit(1);
    found = !!row;
  }

  if (!found) {
    const err = new Error(`Resource not found or unavailable`);
    (err as any).status = 404;
    throw err;
  }
}

export class ShareLinksService {
  async createShareLink(
    profileId: string,
    resourceType: ResourceType,
    resourceId: string,
    expiresAt?: Date
  ) {
    await assertResourceAvailable(resourceType, resourceId);

    return await repo.create({
      resourceType,
      resourceId,
      createdBy: profileId,
      expiresAt,
    });
  }

  async resolveToken(token: string) {
    const link = await repo.findByToken(token);

    if (!link || link.deletedAt) {
      const err = new Error("Share link not found");
      (err as any).status = 404;
      throw err;
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      const err = new Error("Share link has expired");
      (err as any).status = 410;
      throw err;
    }

    // Verify target still exists and is available
    await assertResourceAvailable(link.resourceType as ResourceType, link.resourceId);

    return {
      id: link.id,
      token: link.token,
      resourceType: link.resourceType,
      resourceId: link.resourceId,
      clickCount: link.clickCount,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    };
  }

  async recordClick(token: string) {
    const link = await repo.findByToken(token);

    if (!link || link.deletedAt) {
      const err = new Error("Share link not found");
      (err as any).status = 404;
      throw err;
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      const err = new Error("Share link has expired");
      (err as any).status = 410;
      throw err;
    }

    return await repo.incrementClickCount(link.id);
  }

  async softDeleteLink(id: string, profileId: string, role: string) {
    const link = await repo.findById(id);
    if (!link || link.deletedAt) {
      const err = new Error("Share link not found");
      (err as any).status = 404;
      throw err;
    }

    if (role !== "admin" && link.createdBy !== profileId) {
      const err = new Error("Forbidden: You do not own this share link");
      (err as any).status = 403;
      throw err;
    }

    return await repo.softDelete(id);
  }
}
