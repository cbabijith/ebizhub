import { db } from "../../../config/database.js";
import { serviceProviderSkills } from "../../../database/schema.js";
import { eq, and } from "drizzle-orm";

export class SkillRepository {
  async create(data: any) {
    const [result] = await db.insert(serviceProviderSkills).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(serviceProviderSkills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceProviderSkills.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await db.delete(serviceProviderSkills).where(eq(serviceProviderSkills.id, id)).returning();
    return result;
  }

  async findById(id: string) {
    const [result] = await db.select().from(serviceProviderSkills).where(eq(serviceProviderSkills.id, id));
    return result;
  }

  async findByProvider(providerId: string) {
    return await db
      .select()
      .from(serviceProviderSkills)
      .where(eq(serviceProviderSkills.providerId, providerId));
  }

  async findByProviderAndName(providerId: string, skillName: string) {
    const [result] = await db
      .select()
      .from(serviceProviderSkills)
      .where(and(eq(serviceProviderSkills.providerId, providerId), eq(serviceProviderSkills.skillName, skillName)));
    return result;
  }
}
