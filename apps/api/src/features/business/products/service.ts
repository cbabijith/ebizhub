import { ProductRepository } from "./repository.js";
import { BusinessRepository } from "../businesses/repository.js";

const productRepo = new ProductRepository();
const businessRepo = new BusinessRepository();

export class ProductService {
  async addProduct(ownerId: string, data: any) {
    const business = await businessRepo.findById(data.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    if (business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    const currentCount = await productRepo.countProducts(data.businessId);
    if (currentCount >= 5) {
      throw new Error("Maximum of 5 products allowed per business");
    }

    return await productRepo.create(data);
  }

  async updateProduct(id: string, ownerId: string, data: any) {
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new Error("Product not found");
    }

    const business = await businessRepo.findById(existing.businessId);
    if (!business || business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await productRepo.update(id, data);
  }

  async deleteProduct(id: string, ownerId: string) {
    const existing = await productRepo.findById(id);
    if (!existing) {
      throw new Error("Product not found");
    }

    const business = await businessRepo.findById(existing.businessId);
    if (!business || business.ownerId !== ownerId) {
      throw new Error("Forbidden: You do not own this business");
    }

    return await productRepo.softDelete(id);
  }

  async getProducts(businessId: string) {
    return await productRepo.findByBusinessId(businessId);
  }
}
