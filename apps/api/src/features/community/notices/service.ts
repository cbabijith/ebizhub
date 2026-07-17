import { NoticeRepository } from "./repository.js";

export class NoticeService {
  private repo = new NoticeRepository();

  async getNotices(params: {
    noticeType?: string;
    priority?: string;
    branchId?: string;
    status?: string;
    limit: number;
    offset: number;
  }) {
    return this.repo.findNotices(params);
  }

  async getNoticeById(id: string) {
    const notice = await this.repo.findById(id);
    if (!notice) throw new Error("Notice not found");
    return notice;
  }

  async getPublicNoticeById(id: string) {
    const notice = await this.getNoticeById(id);
    if (notice.status !== "active" || (notice.expiresAt && notice.expiresAt < new Date())) {
      throw new Error("Notice not found");
    }
    return notice;
  }

  async createNotice(data: any, userId: string) {
    return this.repo.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateNotice(id: string, data: any, userId: string) {
    await this.getNoticeById(id);
    return this.repo.update(id, {
      ...data,
      updatedBy: userId,
    });
  }

  async deleteNotice(id: string, userId: string) {
    await this.getNoticeById(id);
    return this.repo.delete(id, userId);
  }
}
