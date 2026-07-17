import { SQL, and } from "drizzle-orm";

export function buildWhereClause(conditions: (SQL | undefined)[]): SQL | undefined {
  const filtered = conditions.filter((c): c is SQL => c !== undefined);
  if (filtered.length === 0) return undefined;
  return and(...filtered);
}
