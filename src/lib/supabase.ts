import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createSupabaseBrowserClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Browser: SSR cookie + localStorage via @supabase/ssr. SSR pass: ephemeral client (no persist). */
export const supabase: SupabaseClient =
  typeof window !== "undefined"
    ? createSupabaseBrowserClient()
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
