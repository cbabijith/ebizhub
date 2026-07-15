import { db } from "../../config/database.js";
import { profiles, members } from "../../database/schema.js";
import { eq } from "drizzle-orm";

export class AuthRepository {
  async findProfileByEmail(email: string) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, email.toLowerCase()));
    return profile;
  }

  async findProfileById(id: string) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(data: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: "admin" | "vendor" | "customer";
    status?: "active" | "inactive" | "suspended";
  }) {
    const [profile] = await db.insert(profiles).values({
      id: data.id,
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      role: data.role,
      status: data.status || "active",
    }).returning();

    return profile;
  }

  async createMember(data: {
    profileId: string;
    verificationStatus?: "pending" | "verified" | "rejected";
  }) {
    const [member] = await db.insert(members).values({
      profileId: data.profileId,
      verificationStatus: data.verificationStatus || "pending",
    }).returning();

    return member;
  }

  async updateProfileStatus(id: string, status: "active" | "inactive" | "suspended") {
    const [profile] = await db.update(profiles)
      .set({ status, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }
}
