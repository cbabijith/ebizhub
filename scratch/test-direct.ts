import postgres from "postgres";

const connectionString = "postgresql://postgres:1%40Abijithcb@db.iaaoxxoabdwbbcbamcso.supabase.co:5432/postgres";

async function main() {
  console.log("Connecting to direct database host with standard username 'postgres'...");
  const sql = postgres(connectionString, { prepare: false });

  try {
    const result = await sql`SELECT version();`;
    console.log("Success! Database response:", result[0].version);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await sql.end();
  }
}

main();
