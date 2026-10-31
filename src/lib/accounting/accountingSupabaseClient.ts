import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createAccountingBrowserClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * 회계 모듈 전용 Supabase browser client — SSR auth cookie ↔ localStorage sync for dev login + Bearer APIs.
 * 고객 CHECK/VERIFY/REGISTER·/login 은 `@/lib/supabase` 유지.
 */
export const accountingSupabase: SupabaseClient =
  typeof window !== "undefined"
    ? createAccountingBrowserClient()
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
