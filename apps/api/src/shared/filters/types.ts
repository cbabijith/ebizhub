export interface BusinessFilterParams {
  category?: string | number;
  district?: number;
  panchayat?: number;
  branch?: boolean;
  verified?: boolean;
  featured?: boolean;
  status?: string;
  branchId?: string;
}

export interface ProviderFilterParams {
  profession?: string;
  category?: string | number;
  experience?: number;
  languages?: string;
  availability?: string;
  district?: number;
  panchayat?: number;
  verified?: boolean;
  status?: string;
  branchId?: string;
}

