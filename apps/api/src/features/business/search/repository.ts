import { db } from "../../../config/database.js";
import { businesses, businessCategories } from "../../../database/schema.js";
import { eq, and, isNull, like, or } from "drizzle-orm";

export class SearchRepository {
  async search(filters: {
    businessName?: string;
    categoryId?: number;
    districtId?: number;
    panchayatId?: number;
    keyword?: string;
  }) {
    const conditions = [
      eq(businesses.status, "active"),
      eq(businesses.verificationStatus, "verified"),
      isNull(businesses.deletedAt),
    ];

    if (filters.categoryId) {
      conditions.push(eq(businesses.categoryId, filters.categoryId));
    }
    if (filters.districtId) {
      conditions.push(eq(businesses.districtId, filters.districtId));
    }
    if (filters.panchayatId) {
      conditions.push(eq(businesses.panchayatId, filters.panchayatId));
    }
    if (filters.businessName) {
      conditions.push(like(businesses.businessName, `%${filters.businessName}%`));
    }
    if (filters.keyword) {
      conditions.push(
        or(
          like(businesses.businessName, `%${filters.keyword}%`),
          like(businesses.description, `%${filters.keyword}%`)
        ) as any
      );
    }

    return await db
      .select({
        id: businesses.id,
        businessName: businesses.businessName,
        slug: businesses.slug,
        description: businesses.description,
        phone: businesses.phone,
        logo: businesses.logo,
        coverImage: businesses.coverImage,
        address: businesses.address,
        categoryName: businessCategories.name,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .where(and(...conditions))
      .orderBy(businesses.businessName);
  }
}
