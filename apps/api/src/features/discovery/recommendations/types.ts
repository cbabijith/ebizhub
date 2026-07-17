export interface RecommendationItem {
  id: string;
  name: string;
  categoryName: string | null;
  districtName?: string | null;
  profession?: string;
  isVerified: boolean;
  matchReason: "same_category" | "same_district" | "recent" | "same_profession" | "same_skill";
}

export interface RecommendationsResponse {
  recommendations: RecommendationItem[];
  meta: {
    type: "business" | "provider";
    sourceId: string;
    total: number;
  };
}
