import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "/home/abijithcb/Projects/ebizhub/apps/api/src/database/schema.js";
import { eq, and, isNull, or, ilike, desc } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: "/home/abijithcb/Projects/ebizhub/apps/api/.env" });

const dbUrl = process.env.DATABASE_URL;
console.log("DB URL:", dbUrl);

const client = postgres(dbUrl!, { prepare: false });
const db = drizzle(client, { schema });

async function run() {
  console.log("Running query...");
  try {
    const conditions = [
      eq(schema.serviceProviders.status, "active"),
      eq(schema.serviceProviders.verificationStatus, "verified"),
      isNull(schema.serviceProviders.deletedAt),
    ];

    let query = db
      .selectDistinct({
        id: schema.serviceProviders.id,
        name: schema.profiles.fullName,
        avatar: schema.profiles.avatar,
        profession: schema.serviceProviders.profession,
        experience: schema.serviceProviders.experience,
        bio: schema.serviceProviders.bio,
        categoryName: schema.serviceCategories.name,
      })
      .from(schema.serviceProviders)
      .leftJoin(schema.profiles, eq(schema.serviceProviders.profileId, schema.profiles.id))
      .leftJoin(schema.serviceCategories, eq(schema.serviceProviders.serviceCategoryId, schema.serviceCategories.id))
      .leftJoin(schema.serviceProviderSkills, eq(schema.serviceProviders.id, schema.serviceProviderSkills.providerId));

    // Handle service areas search/filter
    query = query.leftJoin(schema.serviceProviderAreas, eq(schema.serviceProviders.id, schema.serviceProviderAreas.providerId)) as any;
    conditions.push(eq(schema.serviceProviderAreas.districtId, 1));

    const sql = query.where(and(...conditions))
      .limit(10)
      .offset(0)
      .orderBy(desc(schema.serviceProviders.createdAt)).toSQL();

    console.log("Generated SQL:", sql);

    const res = await query.where(and(...conditions))
      .limit(10)
      .offset(0)
      .orderBy(desc(schema.serviceProviders.createdAt));

    console.log("Result:", res);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
