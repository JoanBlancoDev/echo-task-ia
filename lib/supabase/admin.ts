import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, supabaseUrl } from "./env";

export const supabaseAdmin = createClient(supabaseUrl, getSupabaseServiceRoleKey(), {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
