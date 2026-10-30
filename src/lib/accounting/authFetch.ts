import { ensureAccountingClientSession } from "./devClientSessionBootstrap";
import { accountingSupabase as supabase } from "./accountingSupabaseClient";

/** fetch with the Supabase session Bearer token (accounting API routes require it). */
export async function accountingAuthFetch(input: string, init: RequestInit = {}): Promise<Response> {
  await ensureAccountingClientSession();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
