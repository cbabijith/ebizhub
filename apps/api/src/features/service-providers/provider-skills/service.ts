import { SkillRepository } from "./repository.js";
import { ProviderRepository } from "../providers/repository.js";

const skillRepo = new SkillRepository();
const providerRepo = new ProviderRepository();

export class SkillService {
  async addSkill(profileId: string, userRole: string, data: any) {
    const provider = await providerRepo.findById(data.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    // Duplicate check
    const existing = await skillRepo.findByProviderAndName(data.providerId, data.skillName);
    if (existing) {
      throw new Error("Skill already exists for this provider");
    }

    return await skillRepo.create(data);
  }

  async updateSkill(id: string, profileId: string, userRole: string, data: any) {
    const skill = await skillRepo.findById(id);
    if (!skill) {
      throw new Error("Skill not found");
    }

    const provider = await providerRepo.findById(skill.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    if (data.skillName && data.skillName !== skill.skillName) {
      const existing = await skillRepo.findByProviderAndName(skill.providerId, data.skillName);
      if (existing && existing.id !== id) {
        throw new Error("Skill already exists for this provider");
      }
    }

    return await skillRepo.update(id, data);
  }

  async deleteSkill(id: string, profileId: string, userRole: string) {
    const skill = await skillRepo.findById(id);
    if (!skill) {
      throw new Error("Skill not found");
    }

    const provider = await providerRepo.findById(skill.providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }

    if (userRole !== "admin" && provider.profileId !== profileId) {
      const err = new Error("Forbidden: You do not own this service provider profile");
      (err as any).statusCode = 403;
      throw err;
    }

    return await skillRepo.delete(id);
  }

  async getSkills(providerId: string) {
    const provider = await providerRepo.findById(providerId);
    if (!provider) {
      throw new Error("Service provider not found");
    }
    return await skillRepo.findByProvider(providerId);
  }
}
