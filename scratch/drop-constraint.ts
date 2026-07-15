import postgres from "postgres";

const connectionString = "postgresql://postgres.iaaoxxoabdwbbcbamcso:1%40Abijithcb@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

async function main() {
  console.log("Connecting to database to drop foreign key constraint...");
  const sql = postgres(connectionString, { prepare: false });

  try {
    // Attempt to drop any possible foreign key constraint names on profiles.id
    await sql`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_users_id_fk;`;
    await sql`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;`;
    await sql`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_auth_users_id_fk;`;
    console.log("Successfully attempted to drop constraint.");
  } catch (error) {
    console.error("Failed to drop constraint:", error);
  } finally {
    await sql.end();
  }
}

main();
