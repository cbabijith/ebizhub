import { db } from "../../../config/database.js";
import { jobs, jobApplications, businesses, members } from "../../../database/schema.js";
import { eq, and, isNull, sql, desc, asc, count, SQL, or, gt } from "drizzle-orm";

export class JobRepository {
  async findJobs(params: {
    businessId?: string;
    employmentType?: string;
    status?: string;
    limit: number;
    offset: number;
  }) {
    const conditions: SQL[] = [isNull(jobs.deletedAt)];

    if (params.businessId) {
      conditions.push(eq(jobs.businessId, params.businessId));
    }
    if (params.employmentType) {
      conditions.push(eq(jobs.employmentType, params.employmentType as any));
    }
    if (params.status) {
      conditions.push(eq(jobs.status, params.status as any));
      if (params.status === "active") {
        conditions.push(or(isNull(jobs.closingDate), gt(jobs.closingDate, new Date())) as SQL);
      }
    }

    return db
      .select({
        id: jobs.id,
        businessId: jobs.businessId,
        businessName: businesses.businessName,
        title: jobs.title,
        description: jobs.description,
        employmentType: jobs.employmentType,
        salaryFrom: jobs.salaryFrom,
        salaryTo: jobs.salaryTo,
        experience: jobs.experience,
        qualification: jobs.qualification,
        location: jobs.location,
        skills: jobs.skills,
        vacancies: jobs.vacancies,
        closingDate: jobs.closingDate,
        status: jobs.status,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .leftJoin(businesses, eq(jobs.businessId, businesses.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt))
      .limit(params.limit)
      .offset(params.offset);
  }

  async findById(id: string) {
    const [result] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), isNull(jobs.deletedAt)));
    return result;
  }

  async create(data: any) {
    const [result] = await db.insert(jobs).values(data).returning();
    return result;
  }

  async update(id: string, data: any) {
    const [result] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date(), version: sql`version + 1` })
      .where(and(eq(jobs.id, id), isNull(jobs.deletedAt)))
      .returning();
    return result;
  }

  async delete(id: string, userId: string) {
    const [result] = await db
      .update(jobs)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        status: "inactive",
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(jobs.id, id), isNull(jobs.deletedAt)))
      .returning();
    return result;
  }

  // --- Business Verification Helper ---
  async getBusinessById(businessId: string) {
    const [result] = await db
      .select()
      .from(businesses)
      .where(and(eq(businesses.id, businessId), isNull(businesses.deletedAt)));
    return result;
  }

  // --- Applications Operations ---
  async getApplication(jobId: string, memberId: string) {
    const [result] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.memberId, memberId),
          isNull(jobApplications.deletedAt)
        )
      );
    return result;
  }

  async createApplication(data: any) {
    const [result] = await db.insert(jobApplications).values(data).returning();
    return result;
  }

  async getApplicationsForJob(jobId: string) {
    return db
      .select()
      .from(jobApplications)
      .where(and(eq(jobApplications.jobId, jobId), isNull(jobApplications.deletedAt)));
  }

  async updateApplicationStatus(id: string, status: string, userId: string) {
    const [result] = await db
      .update(jobApplications)
      .set({
        status: status as any,
        updatedBy: userId,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(and(eq(jobApplications.id, id), isNull(jobApplications.deletedAt)))
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

  async findApplicationById(id: string) {
    const [result] = await db
      .select()
      .from(jobApplications)
      .where(and(eq(jobApplications.id, id), isNull(jobApplications.deletedAt)));
    return result;
  }
}
