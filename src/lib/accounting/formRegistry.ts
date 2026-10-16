import type { SupabaseClient } from "@supabase/supabase-js";

export type FormVersionStatus = "pending_verification" | "active" | "retired" | "blocked";

export type FormVersionRow = {
  id: string;
  form_code: string;
  name_ko: string;
  name_vi: string;
  legal_basis: string | null;
  effective_from: string;
  effective_to: string | null;
  status: FormVersionStatus;
  field_map: Record<string, unknown>;
  template_path: string | null;
};

export async function isVnkAdmin(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from("accounting_org_members")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "vnk_admin")
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}

export async function listFormVersions(
  client: SupabaseClient
): Promise<{ ok: true; items: FormVersionRow[] } | { ok: false; error: string }> {
  const { data, error } = await client
    .from("accounting_form_versions")
    .select(
      "id, form_code, name_ko, name_vi, legal_basis, effective_from, effective_to, status, field_map, template_path"
    )
    .order("form_code", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, items: (data ?? []) as FormVersionRow[] };
}

export type LegalReviewRow = {
  id: string;
  review_month: string;
  reviewer: string | null;
  result: string | null;
  follow_up: string | null;
  affected_form_version_ids: string[];
  created_at: string;
};

export async function listLegalReviews(
  client: SupabaseClient
): Promise<{ ok: true; items: LegalReviewRow[] } | { ok: false; error: string }> {
  const { data, error } = await client
    .from("accounting_legal_reviews")
    .select("id, review_month, reviewer, result, follow_up, affected_form_version_ids, created_at")
    .order("review_month", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, items: (data ?? []) as LegalReviewRow[] };
}

export async function insertLegalReview(
  client: SupabaseClient,
  payload: {
    review_month: string;
    reviewer: string;
    result: string;
    follow_up: string;
    affected_form_version_ids: string[];
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await client
    .from("accounting_legal_reviews")
    .insert({
      review_month: payload.review_month,
      reviewer: payload.reviewer,
      result: payload.result,
      follow_up: payload.follow_up,
      affected_form_version_ids: payload.affected_form_version_ids,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}
