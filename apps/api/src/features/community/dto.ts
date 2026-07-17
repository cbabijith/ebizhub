export const mapCategoryToPublicDto = (category: any) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  image: category.image,
  description: category.description,
  sortOrder: category.sortOrder,
});

export const mapNewsToPublicDto = (news: any) => ({
  id: news.id,
  title: news.title,
  slug: news.slug,
  summary: news.summary,
  content: news.content,
  featuredImage: news.featuredImage,
  gallery: news.gallery,
  categoryId: news.categoryId,
  categoryName: news.categoryName,
  tags: news.tags,
  authorName: news.authorName,
  featured: news.featured,
  isPinned: news.isPinned,
  publishedAt: news.publishedAt,
  viewCount: news.viewCount,
  shareCount: news.shareCount,
});

export const mapEventToPublicDto = (event: any) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  banner: event.banner,
  categoryId: event.categoryId,
  categoryName: event.categoryName,
  venue: event.venue,
  latitude: event.latitude,
  longitude: event.longitude,
  startDate: event.startDate,
  endDate: event.endDate,
  registrationStart: event.registrationStart,
  registrationEnd: event.registrationEnd,
  maxParticipants: event.maxParticipants,
  entryFee: event.entryFee,
  contactPhone: event.contactPhone,
  contactEmail: event.contactEmail,
});

export const mapJobToPublicDto = (job: any) => ({
  id: job.id,
  businessName: job.businessName,
  title: job.title,
  description: job.description,
  employmentType: job.employmentType,
  salaryFrom: job.salaryFrom,
  salaryTo: job.salaryTo,
  experience: job.experience,
  qualification: job.qualification,
  location: job.location,
  skills: job.skills,
  vacancies: job.vacancies,
  closingDate: job.closingDate,
});

export const mapOfferToPublicDto = (offer: any) => ({
  id: offer.id,
  businessName: offer.businessName,
  title: offer.title,
  description: offer.description,
  banner: offer.banner,
  discountType: offer.discountType,
  discountValue: offer.discountValue,
  couponCode: offer.couponCode,
  validFrom: offer.validFrom,
  validTo: offer.validTo,
  terms: offer.terms,
  featured: offer.featured,
});

export const mapNoticeToPublicDto = (notice: any) => ({
  id: notice.id,
  title: notice.title,
  description: notice.description,
  noticeType: notice.noticeType,
  priority: notice.priority,
  expiresAt: notice.expiresAt,
  createdAt: notice.createdAt,
});

export const mapBannerToPublicDto = (banner: any) => ({
  id: banner.id,
  title: banner.title,
  image: banner.image,
  redirectType: banner.redirectType,
  redirectId: banner.redirectId,
  priority: banner.priority,
  startDate: banner.startDate,
  endDate: banner.endDate,
});
