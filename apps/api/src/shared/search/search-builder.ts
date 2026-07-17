import { SQL, ilike, or } from "drizzle-orm";

export function buildSearchQuery(fields: any[], keyword: string): SQL | undefined {
  if (!keyword) return undefined;
  const conditions = fields.map(f => ilike(f, `%${keyword}%`));
  return or(...conditions);
}
