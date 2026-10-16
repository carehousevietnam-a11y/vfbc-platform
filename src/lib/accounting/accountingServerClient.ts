import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAccountingServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("SUPABASE_ENV_MISSING");
  }
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server layout read-only; session refresh is handled elsewhere.
      },
    },
  });
}
