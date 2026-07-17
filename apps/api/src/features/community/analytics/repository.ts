import { db } from "../../../config/database.js";
import { communityInteractionLogs, members } from "../../../database/schema.js";
import { eq, and, sql } from "drizzle-orm";

export class CommunityAnalyticsRepository {
  async trackInteraction(data: {
    entityType: string;
    entityId: string;
    memberId?: string;
    ip?: string;
    device?: string;
  }) {
    const [result] = await db
      .insert(communityInteractionLogs)
      .values({
        entityType: data.entityType as any,
        entityId: data.entityId,
        memberId: data.memberId || null,
        ip: data.ip || null,
        device: data.device || null,
      })
      .returning();
    return result;
  }

  async findMemberByProfileId(profileId: string) {
    const [result] = await db
      .select()
      .from(members)
      .where(eq(members.profileId, profileId));
    return result;
  }
}
