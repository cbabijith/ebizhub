import { SearchRepository } from "./repository.js";

const searchRepo = new SearchRepository();

export class SearchService {
  async searchBusinesses(filters: any) {
    return await searchRepo.search(filters);
  }
}
