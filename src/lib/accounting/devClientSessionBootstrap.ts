import { supabase } from "@/lib/supabase";

let syncPromise: Promise<boolean> | null = null;

/**
 * Dev login (Server Action) stores Supabase session in cookies only.
 * Accounting API routes require Authorization Bearer from the browser client — mirror cookie session once.
 */
export async function ensureAccountingClientSession(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") return false;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.access_token) return true;

  if (!syncPromise) {
    syncPromise = (async () => {
      const res = await fetch("/api/dev/accounting-login/session", { credentials: "include" });
      if (!res.ok) return false;
      const json = (await res.json().catch(() => null)) as {
        access_token?: string;
        refresh_token?: string;
      } | null;
      if (!json?.access_token || !json.refresh_token) return false;
      const { error } = await supabase.auth.setSession({
        access_token: json.access_token,
        refresh_token: json.refresh_token,
      });
      if (error) return false;
      const { data: verify } = await supabase.auth.getSession();
      return Boolean(verify.session?.access_token);
    })().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}
