import { CommunityAnalyticsRepository } from "./repository.js";

export class CommunityAnalyticsService {
  private repo = new CommunityAnalyticsRepository();

  async track(params: {
    entityType: string;
    entityId: string;
    profileId?: string;
    ip?: string;
    device?: string;
  }) {
    let memberId: string | undefined;
    if (params.profileId) {
      const member = await this.repo.findMemberByProfileId(params.profileId);
      if (member) {
        memberId = member.id;
      }
    }

    return this.repo.trackInteraction({
      entityType: params.entityType,
      entityId: params.entityId,
      memberId,
      ip: params.ip,
      device: params.device,
    });
  }
}
