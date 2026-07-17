export interface RecentBusiness {
  id: string;
  name: string;
  categoryName: string | null;
  districtName: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export interface RecentProvider {
  id: string;
  name: string;
  profession: string;
  categoryName: string | null;
  isVerified: boolean;
  createdAt: Date;
}
