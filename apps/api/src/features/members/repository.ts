import { db } from "../../config/database.js";
import { profiles, members } from "../../database/schema.js";
import { eq } from "drizzle-orm";

export class MemberRepository {
  async findMemberByProfileId(profileId: string) {
    const [result] = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        phone: profiles.phone,
        avatar: profiles.avatar,
        role: profiles.role,
        status: profiles.status,
        membershipNumber: members.membershipNumber,
        districtId: members.districtId,
        panchayatId: members.panchayatId,
        occupation: members.occupation,
        company: members.company,
        bio: members.bio,
        verificationStatus: members.verificationStatus,
        createdAt: members.createdAt,
        updatedAt: members.updatedAt,
      })
      .from(profiles)
      .leftJoin(members, eq(profiles.id, members.profileId))
      .where(eq(profiles.id, profileId));
      
    return result;
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
    }
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update profiles table if profileData has keys
      if (Object.keys(profileData).length > 0) {
        await tx
          .update(profiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(profiles.id, profileId));
      }

      // 2. Update members table if memberData has keys
      if (Object.keys(memberData).length > 0) {
        await tx
          .update(members)
          .set({ ...memberData, updatedAt: new Date() })
          .where(eq(members.profileId, profileId));
      }

      // 3. Return the fully updated record
      const [updatedResult] = await tx
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          email: profiles.email,
          phone: profiles.phone,
          avatar: profiles.avatar,
          role: profiles.role,
          status: profiles.status,
          membershipNumber: members.membershipNumber,
          districtId: members.districtId,
          panchayatId: members.panchayatId,
          occupation: members.occupation,
          company: members.company,
          bio: members.bio,
          verificationStatus: members.verificationStatus,
          createdAt: members.createdAt,
          updatedAt: members.updatedAt,
        })
        .from(profiles)
        .leftJoin(members, eq(profiles.id, members.profileId))
        .where(eq(profiles.id, profileId));

      return updatedResult;
    });
  }

  async findPublicProfileById(profileId: string) {
    // Restricted profile returned for public views
    const [result] = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatar: profiles.avatar,
        role: profiles.role,
        membershipNumber: members.membershipNumber,
        districtId: members.districtId,
        panchayatId: members.panchayatId,
        occupation: members.occupation,
        company: members.company,
        bio: members.bio,
        verificationStatus: members.verificationStatus,
      })
      .from(profiles)
      .leftJoin(members, eq(profiles.id, members.profileId))
      .where(eq(profiles.id, profileId));
      
    // Return only if active
    const fullProfile = await db.select().from(profiles).where(eq(profiles.id, profileId));
    if (!fullProfile[0] || fullProfile[0].status !== "active") {
      return null;
    }
    
    return result;
  }
}
