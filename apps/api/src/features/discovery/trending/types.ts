export interface TrendingBusiness {
  id: string;
  name: string;
  categoryName: string | null;
  isVerified: boolean;
  trendingScore: number;
  profileViews: number;
  phoneClicks: number;
  whatsappClicks: number;
}

export interface TrendingProvider {
  id: string;
  name: string;
  profession: string;
  categoryName: string | null;
  isVerified: boolean;
  trendingScore: number;
  profileViews: number;
  phoneClicks: number;
  whatsappClicks: number;
}
