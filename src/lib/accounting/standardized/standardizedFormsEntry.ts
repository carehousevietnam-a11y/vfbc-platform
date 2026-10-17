import type { SupabaseClient } from "@supabase/supabase-js";

export type StandardizedFormRow = {
  id: string;
  form_code: string;
  name_ko: string;
  name_vi: string;
  status: string;
  verified_status: string;
  field_map: Record<string, unknown>;
};

export async function listActiveStandardizedForms(
  client: SupabaseClient
): Promise<{ ok: true; items: StandardizedFormRow[] } | { ok: false; error: string }> {
  const { data, error } = await client
    .from("accounting_form_versions")
    .select("id, form_code, name_ko, name_vi, status, verified_status, field_map")
    .eq("form_class", "standardized")
    .neq("status", "retired")
    .order("form_code", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, items: (data ?? []) as StandardizedFormRow[] };
}
