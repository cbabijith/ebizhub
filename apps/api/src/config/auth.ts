import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const supabaseUrl = env.SUPABASE_URL;
// Prefer service role key for backend administration
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn("WARNING: SUPABASE_URL environment variable is not defined");
}

if (!supabaseKey) {
  console.warn("WARNING: SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are not defined");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
