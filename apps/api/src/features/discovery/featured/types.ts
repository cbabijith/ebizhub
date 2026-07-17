export interface FeaturedBusiness {
  id: string;
  name: string;
  categoryName: string | null;
  districtName: string | null;
  isVerified: boolean;
  featuredPriority: number;
  featuredEndDate: string | null;
}

export interface FeaturedProvider {
  id: string;
  name: string;
  profession: string;
  categoryName: string | null;
  isVerified: boolean;
  featuredPriority: number;
  featuredEndDate: string | null;
}

export interface FeaturedCombinedResponse {
  businesses: FeaturedBusiness[];
  providers: FeaturedProvider[];
  meta: {
    totalBusinesses: number;
    totalProviders: number;
  };
}
