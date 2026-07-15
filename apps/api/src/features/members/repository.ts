import { db } from "../../config/database.js";
import { profiles, members, memberSkills, branches } from "../../database/schema.js";
import { eq, and } from "drizzle-orm";

export class MemberRepository {
  async findMemberByProfileId(profileId: string) {
    const [result] = await db
      .select({
        id: profiles.id,
        memberRecordId: members.id,
        fullName: profiles.fullName,
        email: profiles.email,
        phone: profiles.phone,
        avatar: profiles.avatar,
        role: profiles.role,
        status: profiles.status,
        membershipNumber: members.membershipNumber,
        branchId: members.branchId,
        branchName: branches.branchName,
        branchNumber: branches.branchNumber,
        districtId: members.districtId,
        panchayatId: members.panchayatId,
        occupation: members.occupation,
        company: members.company,
        bio: members.bio,
        verificationStatus: members.verificationStatus,
        communityStatus: members.communityStatus,
        memberType: members.memberType,
        joinedDate: members.joinedDate,
        createdAt: members.createdAt,
        updatedAt: members.updatedAt,
      })
      .from(profiles)
      .leftJoin(members, eq(profiles.id, members.profileId))
      .leftJoin(branches, eq(members.branchId, branches.id))
      .where(eq(profiles.id, profileId));

    if (!result) return null;
    if (!result.memberRecordId) {
      return {
        ...result,
        skills: [],
      };
    }

    const skills = await db
      .select({
        id: memberSkills.id,
        skill: memberSkills.skill,
      })
      .from(memberSkills)
      .where(eq(memberSkills.memberId, result.memberRecordId));

    return {
      ...result,
      skills: skills || [],
    };
  }

  async updateMemberProfile(
    profileId: string,
    profileData: {
      fullName?: string;
      phone?: string | null;
      avatar?: string | null;
    },
    memberData: {
      occupation?: string | null;
      company?: string | null;
      bio?: string | null;
      districtId?: number | null;
      panchayatId?: number | null;
      branchId?: string | null;
      memberType?: "regular" | "life" | "associate";
    }
  ) {
    return await db.transaction(async (tx) => {
      if (Object.keys(profileData).length > 0) {
        await tx
          .update(profiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(profiles.id, profileId));
      }

      if (Object.keys(memberData).length > 0) {
        await tx
          .update(members)
          .set({ ...memberData, updatedAt: new Date() })
          .where(eq(members.profileId, profileId));
      }

      return this.findMemberByProfileId(profileId);
    });
  }

  async findPublicProfileById(profileId: string) {
    const profile = await db.select().from(profiles).where(eq(profiles.id, profileId));
    if (!profile[0] || profile[0].status !== "active") {
      return null;
    }

    const [result] = await db
      .select({
        id: profiles.id,
        memberRecordId: members.id,
        fullName: profiles.fullName,
        avatar: profiles.avatar,
        role: profiles.role,
        membershipNumber: members.membershipNumber,
        branchId: members.branchId,
        branchName: branches.branchName,
        branchNumber: branches.branchNumber,
        districtId: members.districtId,
        panchayatId: members.panchayatId,
        occupation: members.occupation,
        company: members.company,
        bio: members.bio,
        verificationStatus: members.verificationStatus,
        communityStatus: members.communityStatus,
        memberType: members.memberType,
        joinedDate: members.joinedDate,
      })
      .from(profiles)
      .leftJoin(members, eq(profiles.id, members.profileId))
      .leftJoin(branches, eq(members.branchId, branches.id))
      .where(eq(profiles.id, profileId));

    if (!result) return null;
    if (!result.memberRecordId) {
      return {
        ...result,
        skills: [],
      };
    }

    const skills = await db
      .select({
        id: memberSkills.id,
        skill: memberSkills.skill,
      })
      .from(memberSkills)
      .where(eq(memberSkills.memberId, result.memberRecordId));

    return {
      ...result,
      skills: skills || [],
    };
  }

  async getMemberRecordByProfileId(profileId: string) {
    const [member] = await db.select().from(members).where(eq(members.profileId, profileId));
    return member;
  }

  async getSkillsCount(memberRecordId: string): Promise<number> {
    const skills = await db.select().from(memberSkills).where(eq(memberSkills.memberId, memberRecordId));
    return skills.length;
  }

  async addSkill(memberRecordId: string, skill: string) {
    const [newSkill] = await db
      .insert(memberSkills)
      .values({
        memberId: memberRecordId,
        skill,
      })
      .returning();
    return newSkill;
  }

  async removeSkill(memberRecordId: string, skillId: string) {
    const [deletedSkill] = await db
      .delete(memberSkills)
      .where(and(eq(memberSkills.id, skillId), eq(memberSkills.memberId, memberRecordId)))
      .returning();
    return deletedSkill;
  }

  // Admin Methods
  async updateVerification(memberRecordId: string, verificationStatus: "pending" | "verified" | "rejected") {
    const [updated] = await db
      .update(members)
      .set({ verificationStatus, updatedAt: new Date() })
      .where(eq(members.id, memberRecordId))
      .returning();
    return updated;
  }

  async updateCommunityStatus(memberRecordId: string, communityStatus: "active" | "inactive" | "suspended" | "expired" | "transferred") {
    const [updated] = await db
      .update(members)
      .set({ communityStatus, updatedAt: new Date() })
      .where(eq(members.id, memberRecordId))
      .returning();
    return updated;
  }

  // Branch Directory Queries
  async findBranches() {
    return await db.select().from(branches).orderBy(branches.branchName);
  }

  async findBranchMembers(branchId: string) {
    return await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatar: profiles.avatar,
        occupation: members.occupation,
        company: members.company,
      })
      .from(profiles)
      .innerJoin(members, eq(profiles.id, members.profileId))
      .where(and(eq(members.branchId, branchId), eq(profiles.status, "active")));
  }
}
