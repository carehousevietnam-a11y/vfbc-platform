import { accountingSupabase as supabase } from "./accountingSupabaseClient";

let syncPromise: Promise<boolean> | null = null;

function readDevSessionFromDocumentCookie(): { access_token: string; refresh_token: string } | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((part) => part.includes("-auth-token=") && part.startsWith("sb-"));
  if (!row) return null;
  const encoded = row.slice(row.indexOf("=") + 1);
  let raw = encoded;
  try {
    raw = decodeURIComponent(encoded);
  } catch {
    /* use encoded */
  }
  const payload = raw.startsWith("base64-") ? raw.slice(7) : raw;
  try {
    const parsed = JSON.parse(atob(payload)) as
      | { access_token?: string; refresh_token?: string }
      | { access_token?: string; refresh_token?: string }[];
    const session = Array.isArray(parsed) ? parsed[0] : parsed;
    if (session?.access_token && session.refresh_token) {
      return { access_token: session.access_token, refresh_token: session.refresh_token };
    }
  } catch {
    return null;
  }
  return null;
}

async function applySessionTokens(access_token: string, refresh_token: string): Promise<boolean> {
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return false;
  const { data: verify } = await supabase.auth.getSession();
  return Boolean(verify.session?.access_token);
}

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
      const { data: refreshed } = await supabase.auth.refreshSession();
      if (refreshed.session?.access_token) return true;

      const fromCookie = readDevSessionFromDocumentCookie();
      if (fromCookie) {
        return applySessionTokens(fromCookie.access_token, fromCookie.refresh_token);
      }

      const res = await fetch("/api/dev/accounting-login/session", { credentials: "include" });
      if (!res.ok) return false;
      const json = (await res.json().catch(() => null)) as {
        access_token?: string;
        refresh_token?: string;
      } | null;
      if (!json?.access_token || !json.refresh_token) return false;
      return applySessionTokens(json.access_token, json.refresh_token);
    })().finally(() => {
      syncPromise = null;
    });
  }

  return syncPromise;
}
