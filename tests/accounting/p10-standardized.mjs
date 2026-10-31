/**
 * P10 standardized_drafts — isolation, confirmed immutability, audit_log.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

loadEnvFile(path.join(repoRoot, ".env.local"));
const useLocal = process.env.ACCOUNTING_TEST_LOCAL !== "0";
const local = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const url = useLocal ? local.API_URL : process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = useLocal ? local.ANON_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = useLocal ? local.SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY;

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok: Boolean(ok), detail });
};

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);
  return data.user;
}

async function signIn(email, password) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
}

async function main() {
  const service = createClient(url, serviceKey, { auth: { persistSession: false } });
  const tag = `p10-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  const { data: formRow, error: formErr } = await service
    .from("accounting_form_versions")
    .select("id, form_class, field_map, verified_status")
    .eq("form_code", "VTAX_STD_G9_EXPLANATION")
    .eq("form_class", "standardized")
    .maybeSingle();
  record("g9_form_seed", !formErr && formRow?.verified_status === "unverified", formErr?.message ?? formRow?.id);
  const submitOff =
    formRow?.field_map?.gates?.standardized_submit === false ||
    formRow?.field_map?.gates?.standardized_submit === undefined;
  record("standardized_submit_off", submitOff, JSON.stringify(formRow?.field_map?.gates ?? {}));

  const ownerA = await createAuthUser(service, `${tag}-a@test.vfbcai.local`, password);
  const ownerB = await createAuthUser(service, `${tag}-b@test.vfbcai.local`, password);
  await service.from("users").upsert(
    [
      { id: ownerA.id, member_type: "company" },
      { id: ownerB.id, member_type: "company" },
    ],
    { onConflict: "id" }
  );

  const { data: orgA } = await service
    .from("accounting_organizations")
    .insert({ name_official: `P10 A ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  const { data: orgB } = await service
    .from("accounting_organizations")
    .insert({ name_official: `P10 B ${tag}`, approval_status: "approved" })
    .select("id")
    .single();

  await service.from("accounting_org_members").insert([
    { org_id: orgA.id, user_id: ownerA.id, role: "company_owner" },
    { org_id: orgB.id, user_id: ownerB.id, role: "company_owner" },
  ]);

  const clientA = await signIn(`${tag}-a@test.vfbcai.local`, password);
  const clientB = await signIn(`${tag}-b@test.vfbcai.local`, password);

  if (!formRow?.id) {
    record("draft_insert", false, "missing form_version");
    console.log(JSON.stringify({ pass: false, results }, null, 0));
    process.exit(1);
  }

  const { data: draft, error: insErr } = await clientA
    .from("accounting_standardized_drafts")
    .insert({
      org_id: orgA.id,
      form_version_id: formRow.id,
      period_key: "2026-10",
      status: "draft",
      answers: { g9_q1: "g9_q1_c1" },
      created_by: ownerA.id,
    })
    .select("id")
    .single();
  record("draft_insert", !insErr && draft?.id, insErr?.message);

  const cross = await clientB
    .from("accounting_standardized_drafts")
    .select("id")
    .eq("id", draft.id)
    .maybeSingle();
  record("cross_org_select_blocked", cross.error || !cross.data, cross.error?.message ?? "0 rows");

  const { count: auditCount } = await service
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity", "accounting_standardized_drafts")
    .eq("entity_id", draft.id);
  record("audit_log_insert", (auditCount ?? 0) >= 1, String(auditCount));

  const { error: confirmErr } = await clientA
    .from("accounting_standardized_drafts")
    .update({ status: "confirmed" })
    .eq("id", draft.id);
  record("owner_confirm", !confirmErr, confirmErr?.message);

  const upd = await clientA
    .from("accounting_standardized_drafts")
    .update({ answers: { g9_q1: "g9_q1_c2" } })
    .eq("id", draft.id)
    .select("id");
  const { data: afterUpd } = await service
    .from("accounting_standardized_drafts")
    .select("answers, status")
    .eq("id", draft.id)
    .single();
  record(
    "confirmed_update_blocked",
    (upd.data ?? []).length === 0 && afterUpd?.answers?.g9_q1 === "g9_q1_c1" && afterUpd?.status === "confirmed",
    `rows=${(upd.data ?? []).length}`
  );

  const del = await clientA.from("accounting_standardized_drafts").delete().eq("id", draft.id).select("id");
  const { data: afterDel } = await service
    .from("accounting_standardized_drafts")
    .select("id")
    .eq("id", draft.id)
    .maybeSingle();
  record(
    "confirmed_delete_blocked",
    (del.data ?? []).length === 0 && Boolean(afterDel?.id),
    `del_rows=${(del.data ?? []).length}`
  );

  const failed = results.filter((r) => !r.ok);
  console.log(JSON.stringify({ pass: failed.length === 0, results }, null, 0));
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
