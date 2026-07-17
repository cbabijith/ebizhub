import { JobRepository } from "./repository.js";

export class JobService {
  private repo = new JobRepository();

  async getJobs(params: {
    businessId?: string;
    employmentType?: string;
    status?: string;
    limit: number;
    offset: number;
  }) {
    return this.repo.findJobs(params);
  }

  async getJobById(id: string) {
    const job = await this.repo.findById(id);
    if (!job) throw new Error("Job not found");
    return job;
  }

  async getPublicJobById(id: string) {
    const job = await this.getJobById(id);
    if (job.status !== "active" || (job.closingDate && job.closingDate < new Date())) {
      throw new Error("Job not found");
    }
    return job;
  }

  async checkOwnership(businessId: string, profileId: string, role: string) {
    if (role === "admin") return; // Admin bypass
    const biz = await this.repo.getBusinessById(businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== profileId) {
      throw new Error("You do not own this business");
    }
  }

  async createJob(data: any, profileId: string, role: string) {
    await this.checkOwnership(data.businessId, profileId, role);
    return this.repo.create({
      ...data,
      createdBy: profileId,
      updatedBy: profileId,
    });
  }

  async updateJob(id: string, data: any, profileId: string, role: string) {
    const job = await this.getJobById(id);
    await this.checkOwnership(job.businessId, profileId, role);
    return this.repo.update(id, {
      ...data,
      updatedBy: profileId,
    });
  }

  async deleteJob(id: string, profileId: string, role: string) {
    const job = await this.getJobById(id);
    await this.checkOwnership(job.businessId, profileId, role);
    return this.repo.delete(id, profileId);
  }

  // --- Applications Services ---
  async applyForJob(jobId: string, profileId: string) {
    const job = await this.getJobById(jobId);
    if (job.status !== "active") {
      throw new Error("Cannot apply to an inactive job posting");
    }

    if (job.closingDate && new Date() > new Date(job.closingDate)) {
      throw new Error("This job posting is closed for applications");
    }

    const member = await this.repo.findMemberByProfileId(profileId);
    if (!member) throw new Error("Only community members can apply for jobs");
    if (member.verificationStatus !== "verified") {
      throw new Error("Your member profile must be verified to apply for jobs");
    }

    const existing = await this.repo.getApplication(jobId, member.id);
    if (existing) {
      throw new Error("You have already applied for this job");
    }

    return this.repo.createApplication({
      jobId,
      memberId: member.id,
      status: "applied",
      createdBy: profileId,
      updatedBy: profileId,
    });
  }

  async getApplications(jobId: string, profileId: string, role: string) {
    const job = await this.getJobById(jobId);
    await this.checkOwnership(job.businessId, profileId, role);
    return this.repo.getApplicationsForJob(jobId);
  }

  async updateApplication(applicationId: string, status: string, profileId: string, role: string) {
    const app = await this.repo.findApplicationById(applicationId);
    if (!app) throw new Error("Application not found");
    const job = await this.getJobById(app.jobId);
    await this.checkOwnership(job.businessId, profileId, role);
    return this.repo.updateApplicationStatus(applicationId, status, profileId);
  }
}
