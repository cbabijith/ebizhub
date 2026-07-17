export interface PublicBusinessDto {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  workingHours: string | null;
  establishedYear: number | null;
  isVerified: boolean;
  isFeatured: boolean;
  category: { id: string | number; name: string; slug: string } | null;
  district: { id: string | number; name: string } | null;
  panchayat: { id: string | number; name: string } | null;
  views: number;
  products?: any[];
  services?: any[];
  gallery?: any[];
}

export interface PublicProviderDto {
  id: string;
  profession: string;
  experience: number;
  bio: string | null;
  phone: string;
  qualification: string | null;
  languages: string | null;
  whatsapp: string | null;
  email: string | null;
  availability: string | null;
  serviceRadius: number;
  isVerified: boolean;
  isFeatured: boolean;
  fullName: string;
  avatar: string | null;
  category: { id: string | number; name: string; slug: string } | null;
  district: { id: string | number; name: string } | null;
  panchayat: { id: string | number; name: string } | null;
  views: number;
  skills?: any[];
  portfolios?: any[];
  serviceAreas?: any[];
}

export interface PublicCategoryDto {
  id: string | number;
  name: string;
  slug: string;
  icon: string | null;
  type?: string;
}

export interface PublicNewsDto {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  featuredImage: string | null;
  gallery: string[] | null;
  category: { id: string; name: string; slug: string } | null;
  tags: string[] | null;
  publishedAt: string | Date | null;
  viewCount: number;
  shareCount: number;
}

export interface PublicEventDto {
  id: string;
  title: string;
  description: string | null;
  banner: string | null;
  venue: string;
  startDate: string | Date;
  endDate: string | Date;
  registrationStart: string | Date | null;
  registrationEnd: string | Date | null;
  maxParticipants: number | null;
  entryFee: string;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string;
  category?: { id: string; name: string; slug: string } | null;
  registrationCount?: number;
}

export interface PublicJobDto {
  id: string;
  businessId: string;
  businessName: string | null;
  title: string;
  description: string | null;
  employmentType: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  experience: number | null;
  qualification: string | null;
  location: string | null;
  skills: string[] | null;
  vacancies: number;
  closingDate: string | Date | null;
  status: string;
}

export interface PublicOfferDto {
  id: string;
  businessId: string;
  businessName: string | null;
  title: string;
  description: string | null;
  banner: string | null;
  discountType: string;
  discountValue: string | null;
  couponCode: string | null;
  validFrom: string | Date;
  validTo: string | Date;
  terms: string | null;
  status: string;
  featured: boolean;
}

export interface PublicNoticeDto {
  id: string;
  title: string;
  description: string;
  noticeType: string;
  priority: string;
  status: string;
  branchId: string | null;
}

export interface PublicBannerDto {
  id: string;
  title: string | null;
  image: string;
  redirectType: string;
  redirectId: string | null;
  priority: number;
}

export function mapBusinessToDto(item: any): PublicBusinessDto {
  const biz = item.business || item;
  const cat = item.category || item.businessCategory || biz.category || null;
  const dist = item.district || biz.district || null;
  const panch = item.panchayat || biz.panchayat || null;
  const views = Number(item.analytics?.profileViews || biz.views || 0);

  return {
    id: biz.id,
    businessName: biz.businessName || biz.name,
    slug: biz.slug,
    description: biz.description || null,
    phone: biz.phone,
    whatsapp: biz.whatsapp || null,
    email: biz.email || null,
    website: biz.website || null,
    logo: biz.logo || null,
    coverImage: biz.coverImage || null,
    address: biz.address,
    latitude: biz.latitude !== undefined ? Number(biz.latitude) : null,
    longitude: biz.longitude !== undefined ? Number(biz.longitude) : null,
    workingHours: biz.workingHours || null,
    establishedYear: biz.establishedYear ? Number(biz.establishedYear) : null,
    isVerified: biz.isVerified || biz.verificationStatus === "verified",
    isFeatured: !!biz.isFeatured,
    category: cat ? {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    } : null,
    district: dist ? {
      id: dist.id,
      name: dist.name,
    } : null,
    panchayat: panch ? {
      id: panch.id,
      name: panch.name,
    } : null,
    views,
    products: item.products || undefined,
    services: item.services || undefined,
    gallery: item.gallery || undefined,
  };
}

export function mapProviderToDto(item: any): PublicProviderDto {
  const prov = item.provider || item;
  const prof = item.profile || item;
  const cat = item.category || prov.category || null;
  const dist = item.district || prov.district || null;
  const panch = item.panchayat || prov.panchayat || null;
  const views = Number(item.analytics?.profileViews || prov.views || 0);

  return {
    id: prov.id,
    profession: prov.profession,
    experience: Number(prov.experience || 0),
    bio: prov.bio || null,
    phone: prov.phone,
    fullName: prof.fullName || prov.fullName || "",
    avatar: prof.avatar || prov.avatar || null,
    qualification: prov.qualification || null,
    languages: prov.languages || null,
    whatsapp: prov.whatsapp || null,
    email: prov.email || null,
    availability: prov.availability || null,
    serviceRadius: Number(prov.serviceRadius || 0),
    isVerified: prov.isVerified || prov.verificationStatus === "verified",
    isFeatured: !!prov.isFeatured,
    category: cat ? {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    } : null,
    district: dist ? {
      id: dist.id,
      name: dist.name,
    } : null,
    panchayat: panch ? {
      id: panch.id,
      name: panch.name,
    } : null,
    views,
    skills: item.skills || undefined,
    portfolios: item.portfolios || undefined,
    serviceAreas: item.serviceAreas || undefined,
  };
}

export function mapCategoryToDto(item: any): PublicCategoryDto {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    icon: item.icon || null,
    type: item.type || undefined,
  };
}

export function mapNewsToDto(item: any): PublicNewsDto {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary || null,
    content: item.content || null,
    featuredImage: item.featuredImage || null,
    gallery: item.gallery || [],
    category: item.category ? {
      id: item.category.id || item.categoryId,
      name: item.category.name || "",
      slug: item.category.slug || "",
    } : null,
    tags: item.tags || [],
    publishedAt: item.publishedAt || null,
    viewCount: Number(item.viewCount || 0),
    shareCount: Number(item.shareCount || 0),
  };
}

export function mapEventToDto(item: any): PublicEventDto {
  return {
    id: item.id,
    title: item.title,
    description: item.description || null,
    banner: item.banner || null,
    venue: item.venue,
    startDate: item.startDate,
    endDate: item.endDate,
    registrationStart: item.registrationStart || null,
    registrationEnd: item.registrationEnd || null,
    maxParticipants: item.maxParticipants ? Number(item.maxParticipants) : null,
    entryFee: String(item.entryFee || "0"),
    contactPhone: item.contactPhone || null,
    contactEmail: item.contactEmail || null,
    status: item.status,
    category: item.category ? {
      id: item.category.id || item.categoryId,
      name: item.category.name || "",
      slug: item.category.slug || "",
    } : null,
    registrationCount: item.registrationCount !== undefined ? Number(item.registrationCount) : undefined,
  };
}

export function mapJobToDto(item: any): PublicJobDto {
  return {
    id: item.id,
    businessId: item.businessId,
    businessName: item.businessName || null,
    title: item.title,
    description: item.description || null,
    employmentType: item.employmentType,
    salaryFrom: item.salaryFrom ? Number(item.salaryFrom) : null,
    salaryTo: item.salaryTo ? Number(item.salaryTo) : null,
    experience: item.experience ? Number(item.experience) : null,
    qualification: item.qualification || null,
    location: item.location || null,
    skills: item.skills || [],
    vacancies: Number(item.vacancies || 1),
    closingDate: item.closingDate || null,
    status: item.status,
  };
}

export function mapOfferToDto(item: any): PublicOfferDto {
  return {
    id: item.id,
    businessId: item.businessId,
    businessName: item.businessName || null,
    title: item.title,
    description: item.description || null,
    banner: item.banner || null,
    discountType: item.discountType,
    discountValue: item.discountValue || null,
    couponCode: item.couponCode || null,
    validFrom: item.validFrom,
    validTo: item.validTo,
    terms: item.terms || null,
    status: item.status,
    featured: !!item.featured,
  };
}

export function mapNoticeToDto(item: any): PublicNoticeDto {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    noticeType: item.noticeType,
    priority: item.priority,
    status: item.status,
    branchId: item.branchId || null,
  };
}

export function mapBannerToDto(item: any): PublicBannerDto {
  return {
    id: item.id,
    title: item.title || null,
    image: item.image,
    redirectType: item.redirectType,
    redirectId: item.redirectId || null,
    priority: Number(item.priority || 0),
  };
}
