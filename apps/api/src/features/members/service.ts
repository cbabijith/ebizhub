import { MemberRepository } from "./repository.js";

const memberRepo = new MemberRepository();

export class MemberService {
  private calculateCompletionPercentage(profile: any): number {
    if (!profile) return 0;

    const fields = [
      profile.fullName,
      profile.phone,
      profile.avatar,
      profile.occupation,
      profile.company,
      profile.bio,
      profile.districtId,
      profile.panchayatId,
    ];

    const filledFieldsCount = fields.filter(
      (field) => field !== null && field !== undefined && String(field).trim() !== ""
    ).length;

    return Math.round((filledFieldsCount / fields.length) * 100);
  }

  async getOwnProfile(profileId: string) {
    const profile = await memberRepo.findMemberByProfileId(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);

    return {
      ...profile,
      completionPercentage,
    };
  }

  async updateOwnProfile(profileId: string, updateData: any) {
    // 1. Separate profiles data from members data
    const profileFields = ["fullName", "phone", "avatar"];
    const profileData: any = {};
    const memberData: any = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (profileFields.includes(key)) {
        profileData[key] = value;
      } else {
        memberData[key] = value;
      }
    }

    // 2. Perform the update inside repository transaction
    const updatedProfile = await memberRepo.updateMemberProfile(profileId, profileData, memberData);
    if (!updatedProfile) {
      throw new Error("Failed to update profile");
    }

    const completionPercentage = this.calculateCompletionPercentage(updatedProfile);

    return {
      ...updatedProfile,
      completionPercentage,
    };
  }

  async getPublicProfile(profileId: string) {
    const publicProfile = await memberRepo.findPublicProfileById(profileId);
    if (!publicProfile) {
      throw new Error("Public profile not found or inactive");
    }

    const completionPercentage = this.calculateCompletionPercentage(publicProfile);

    return {
      ...publicProfile,
      completionPercentage,
    };
  }
}
