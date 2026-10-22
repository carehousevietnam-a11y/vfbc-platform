import { supabase } from "@/lib/supabase";

/** fetch with the Supabase session Bearer token (accounting API routes require it). */
export async function accountingAuthFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
