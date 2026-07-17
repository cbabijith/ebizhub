import { SQL, desc, asc } from "drizzle-orm";

export function getSortOrder(sortBy: string, table: any, options: { analyticsTable?: any; nameColumn?: any } = {}): SQL | SQL[] {
  const { analyticsTable, nameColumn } = options;
  
  switch (sortBy?.toLowerCase()) {
    case "oldest":
      return asc(table.createdAt);
    case "alphabetical":
      if (nameColumn) {
        return asc(nameColumn);
      }
      if (table.businessName) {
        return asc(table.businessName);
      }
      if (table.profession) {
        return asc(table.profession);
      }
      return asc(table.id);
    case "most_viewed":
    case "most viewed":
      if (analyticsTable) {
        return desc(analyticsTable.profileViews);
      }
      return desc(table.createdAt);
    case "recently_verified":
    case "recently verified":
      return [desc(table.verificationStatus), desc(table.updatedAt)];
    case "experience":
      if ("experience" in table) {
        return desc(table.experience);
      }
      return desc(table.createdAt);
    case "newest":
    default:
      return desc(table.createdAt);
  }
}
