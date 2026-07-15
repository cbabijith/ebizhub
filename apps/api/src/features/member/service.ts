import { MemberRepository } from "./repository.js";

const memberRepo = new MemberRepository();

export class MemberService {
  private calculateCompletionPercentage(profile: any): number {
    if (!profile) return 0;

    let score = 0;

    // 1. Photo / Avatar: 20%
    if (profile.avatar && String(profile.avatar).trim() !== "") {
      score += 20;
    }

    // 2. Bio: 10%
    if (profile.bio && String(profile.bio).trim() !== "") {
      score += 10;
    }

    // 3. Occupation: 10%
    if (profile.occupation && String(profile.occupation).trim() !== "") {
      score += 10;
    }

    // 4. District: 10%
    if (profile.districtId !== null && profile.districtId !== undefined) {
      score += 10;
    }

    // 5. Skills (at least 1 skill): 20%
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      score += 20;
    }

    // 6. Company: 10%
    if (profile.company && String(profile.company).trim() !== "") {
      score += 10;
    }

    // 7. Address / Panchayat: 20%
    if (profile.panchayatId !== null && profile.panchayatId !== undefined) {
      score += 20;
    }

    return score;
  }

  async getOwnProfile(profileId: string) {
    const profile = await memberRepo.findMemberByProfileId(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);

    return {
      profile,
      completion: completionPercentage,
    };
  }

  async updateOwnProfile(profileId: string, updateData: any) {
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

    const updatedProfile = await memberRepo.updateMemberProfile(profileId, profileData, memberData);
    if (!updatedProfile) {
      throw new Error("Failed to update profile");
    }

    const completionPercentage = this.calculateCompletionPercentage(updatedProfile);

    return {
      profile: updatedProfile,
      completion: completionPercentage,
    };
  }

  async getPublicProfile(profileId: string) {
    const publicProfile = await memberRepo.findPublicProfileById(profileId);
    if (!publicProfile) {
      throw new Error("Public profile not found or inactive");
    }

    const completionPercentage = this.calculateCompletionPercentage(publicProfile);

    return {
      profile: publicProfile,
      completion: completionPercentage,
    };
  }

  async addSkill(profileId: string, skill: string) {
    const memberRecord = await memberRepo.getMemberRecordByProfileId(profileId);
    if (!memberRecord) {
      throw new Error("Member record not found");
    }

    const currentCount = await memberRepo.getSkillsCount(memberRecord.id);
    if (currentCount >= 20) {
      throw new Error("Maximum of 20 skills allowed");
    }

    await memberRepo.addSkill(memberRecord.id, skill);

    // Return the updated profile
    return this.getOwnProfile(profileId);
  }

  async removeSkill(profileId: string, skillId: string) {
    const memberRecord = await memberRepo.getMemberRecordByProfileId(profileId);
    if (!memberRecord) {
      throw new Error("Member record not found");
    }

    await memberRepo.removeSkill(memberRecord.id, skillId);

    // Return the updated profile
    return this.getOwnProfile(profileId);
  }
}
