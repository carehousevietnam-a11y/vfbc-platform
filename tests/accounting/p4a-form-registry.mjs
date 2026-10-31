/**
 * P4a form registry + legal_reviews RLS — local Supabase only.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

function getLocalSupabaseEnv() {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  if (!st.API_URL || !st.ANON_KEY || !st.SERVICE_ROLE_KEY) {
    throw new Error("local supabase status incomplete — run: npx supabase start");
  }
  return { url: st.API_URL, anonKey: st.ANON_KEY, serviceKey: st.SERVICE_ROLE_KEY };
}

const results = { pass: 0, fail: 0, cases: [] };

function record(name, ok, detail) {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  return data.user;
}

async function signIn(url, anonKey, email, password) {
  const bootstrap = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await bootstrap.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn: ${error.message}`);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  const { url, anonKey, serviceKey } = getLocalSupabaseEnv();
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const probe = await service.from("accounting_form_versions").select("form_code").limit(1);
  if (probe.error?.code === "42P01" || probe.error?.code === "PGRST205") {
    execSync("npx supabase db reset --local --no-seed", {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  }

  const tag = `p4a-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;
  const adminUser = await createAuthUser(service, `${tag}-vnk@test.vfbcai.local`, password);
  const ownerUser = await createAuthUser(service, `${tag}-owner@test.vfbcai.local`, password);
  const memberUser = await createAuthUser(service, `${tag}-member@test.vfbcai.local`, password);

  await service.from("users").upsert(
    [
      { id: adminUser.id, member_type: "company" },
      { id: ownerUser.id, member_type: "company" },
      { id: memberUser.id, member_type: "company" },
    ],
    { onConflict: "id" }
  );

  const { data: org } = await service
    .from("accounting_organizations")
    .insert({ name_official: `P4a ${tag}`, approval_status: "approved" })
    .select("id")
    .single();

  await service.from("accounting_org_members").insert([
    { org_id: org.id, user_id: adminUser.id, role: "vnk_admin" },
    { org_id: org.id, user_id: ownerUser.id, role: "company_owner" },
    { org_id: org.id, user_id: memberUser.id, role: "company_member" },
  ]);

  const clientAdmin = await signIn(url, anonKey, `${tag}-vnk@test.vfbcai.local`, password);
  const clientOwner = await signIn(url, anonKey, `${tag}-owner@test.vfbcai.local`, password);
  const clientMember = await signIn(url, anonKey, `${tag}-member@test.vfbcai.local`, password);

  const seeds = await service
    .from("accounting_form_versions")
    .select("form_code, status, field_map, template_path")
    .in("form_code", ["01/GTGT", "04/GTGT", "05/KK-TNCN", "05/QTT-TNCN", "CIT_UNVERIFIED"]);
  const seedRows = seeds.data ?? [];
  record("seed_five_forms", seedRows.length === 5, `count=${seedRows.length}`);
  record(
    "seed_pending_empty_field_map",
    seedRows.every(
      (r) =>
        r.status === "pending_verification" &&
        JSON.stringify(r.field_map ?? {}) === "{}" &&
        (r.template_path === null || r.template_path === undefined)
    ),
    JSON.stringify(seedRows.map((r) => ({ code: r.form_code, status: r.status })))
  );

  const ownerRead = await clientOwner.from("accounting_form_versions").select("id").limit(1);
  record("owner_can_read_forms", !ownerRead.error && (ownerRead.data ?? []).length > 0, ownerRead.error?.message);

  const ownerWrite = await clientOwner
    .from("accounting_form_versions")
    .insert({
      form_code: `X-${tag}`,
      name_ko: "x",
      name_vi: "x",
      effective_from: "2026-07-01",
      status: "pending_verification",
    });
  record("owner_cannot_write_forms", Boolean(ownerWrite.error), ownerWrite.error?.message ?? "inserted");

  const beforeName = await service
    .from("accounting_form_versions")
    .select("name_ko")
    .eq("form_code", "01/GTGT")
    .single();
  const memberWrite = await clientMember
    .from("accounting_form_versions")
    .update({ name_ko: `hack-${tag}` })
    .eq("form_code", "01/GTGT")
    .select("id");
  const afterName = await service
    .from("accounting_form_versions")
    .select("name_ko")
    .eq("form_code", "01/GTGT")
    .single();
  const writeBlocked =
    Boolean(memberWrite.error) ||
    (memberWrite.data ?? []).length === 0 ||
    beforeName.data?.name_ko === afterName.data?.name_ko;
  record(
    "member_cannot_write_forms",
    writeBlocked,
    memberWrite.error?.message ?? `rows=${(memberWrite.data ?? []).length}`
  );

  const adminInsertReview = await clientAdmin.from("accounting_legal_reviews").insert({
    review_month: "2026-10-01",
    reviewer: "p4a-admin",
    result: "no change",
    follow_up: "none",
    affected_form_version_ids: [],
  });
  record("admin_can_insert_review", !adminInsertReview.error, adminInsertReview.error?.message);

  const ownerInsertReview = await clientOwner.from("accounting_legal_reviews").insert({
    review_month: "2026-10-01",
    reviewer: "owner",
    result: "x",
    follow_up: "x",
    affected_form_version_ids: [],
  });
  record("owner_cannot_insert_review", Boolean(ownerInsertReview.error), ownerInsertReview.error?.message);

  const { data: reviewRow } = await service
    .from("accounting_legal_reviews")
    .select("id")
    .eq("reviewer", "p4a-admin")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reviewRow?.id) {
    const adminUpdate = await clientAdmin
      .from("accounting_legal_reviews")
      .update({ result: "changed" })
      .eq("id", reviewRow.id);
    record("legal_review_update_blocked", Boolean(adminUpdate.error), adminUpdate.error?.message ?? "updated");

    const adminDelete = await clientAdmin.from("accounting_legal_reviews").delete().eq("id", reviewRow.id);
    record("legal_review_delete_blocked", Boolean(adminDelete.error), adminDelete.error?.message ?? "deleted");

    const audit = await service
      .from("accounting_audit_log")
      .select("id")
      .eq("entity", "accounting_legal_reviews")
      .eq("entity_id", reviewRow.id)
      .limit(1);
    record("legal_review_audit_logged", (audit.data ?? []).length === 1, audit.error?.message);
  } else {
    record("legal_review_update_blocked", false, "no review row");
    record("legal_review_delete_blocked", false, "no review row");
    record("legal_review_audit_logged", false, "no review row");
  }

  const deadlineWrite = await clientAdmin.from("accounting_deadline_rules").insert({
    tax_type: "test",
    period_kind: "test",
    rule: {},
    verified_status: "unverified",
  });
  record("deadline_rules_read_only", Boolean(deadlineWrite.error), deadlineWrite.error?.message ?? "inserted");

  const deadlineCount = await service.from("accounting_deadline_rules").select("id", { count: "exact", head: true });
  record("deadline_rules_seeded", (deadlineCount.count ?? 0) >= 6, `count=${deadlineCount.count}`);

  console.log(JSON.stringify(results, null, 2));
  if (results.fail > 0) process.exit(2);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
