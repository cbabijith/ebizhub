import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});
