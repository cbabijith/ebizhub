import { SearchRepository } from "./repository.js";

const searchRepo = new SearchRepository();

export class SearchService {
  async search(filters: {
    q: string;
    page: number;
    limit: number;
    category?: number;
    district?: number;
    panchayat?: number;
    experience?: number;
    availability?: string;
  }) {
    return await searchRepo.searchPublic(filters);
  }
}
