export interface PopularBusinessCategory {
  id: number;
  name: string;
  slug: string;
  businessCount: number;
  totalViews: number;
  popularityScore: number;
}

export interface PopularServiceCategory {
  id: number;
  name: string;
  slug: string;
  providerCount: number;
  totalViews: number;
  popularityScore: number;
}
