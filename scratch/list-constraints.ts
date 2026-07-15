import postgres from "postgres";

const connectionString = "postgresql://postgres.iaaoxxoabdwbbcbamcso:1%40Abijithcb@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

async function main() {
  console.log("Listing foreign key constraints in public schema...");
  const sql = postgres(connectionString, { prepare: false });

  try {
    const result = await sql`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        LEFT JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;

    console.log("Found constraints:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed to list constraints:", error);
  } finally {
    await sql.end();
  }
}

main();
