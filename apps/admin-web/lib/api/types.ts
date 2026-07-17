export interface Member {
  profileId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "vendor" | "customer";
  status: "active" | "inactive" | "suspended";
  membershipId?: string;
  branchId?: string;
  branchName?: string;
  joinedDate?: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}
