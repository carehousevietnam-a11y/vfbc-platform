/**
 * VIET TAX workspace mini intake — local Supabase (ACCOUNTING_TEST_LOCAL default).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { ensureTsxRuntime } from "../qa/_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { validateWorkspaceIntakePayload, workspaceIntakeRedirectPath, hasOrgWorkspaceIntake } = await import(
  "../../src/lib/accounting/workspaceIntake.ts"
);
const { isAccountingWorkspaceDataPath } = await import("../../src/lib/accounting/accountingWorkspace.ts");
const { ACCOUNTING_ROUTES } = await import("../../src/lib/accounting/accountingNav.ts");

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

function runLocalDbQuery(repoRoot, sqlOrFile, { file = false } = {}) {
  const args = file
    ? ["supabase", "db", "query", "--local", "-f", sqlOrFile]
    : ["supabase", "db", "query", "--local", sqlOrFile];
  execSync(`npx ${args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function syncWorkspaceIntakeLocalSchema(repoRoot) {
  const periodCheck =
    "alter table public.accounting_org_workspace_intake add constraint accounting_workspace_intake_period_key_chk check ( (period_granularity = 'month' and period_key ~ '^\\d{4}-(0[1-9]|1[0-2])$') or (period_granularity = 'quarter' and period_key ~ '^\\d{4}-Q[1-4]$') or (period_granularity = 'year' and period_key ~ '^\\d{4}$') )";
  try {
    runLocalDbQuery(repoRoot, "drop policy if exists accounting_workspace_intake_insert on public.accounting_org_workspace_intake");
    runLocalDbQuery(
      repoRoot,
      "create policy accounting_workspace_intake_insert on public.accounting_org_workspace_intake for insert to authenticated with check ( public.accounting_can_use_org_data(org_id) and public.accounting_org_role(org_id) in ('company_owner', 'company_member') and created_by = auth.uid() )",
    );
    runLocalDbQuery(
      repoRoot,
      "alter table public.accounting_org_workspace_intake drop constraint if exists accounting_workspace_intake_period_key_chk",
    );
    runLocalDbQuery(repoRoot, periodCheck);
    runLocalDbQuery(
      repoRoot,
      path.join(repoRoot, "tests/accounting/fixtures/workspace-intake-audit-append-fn.sql"),
      { file: true },
    );
  } catch (err) {
    const detail = [err.stdout, err.stderr].filter(Boolean).join("\n").trim();
    console.error("workspace_intake_schema_sync_failed", detail.slice(0, 800) || err.message);
    process.exit(1);
  }
}

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

loadEnvFile(path.join(repoRoot, ".env.local"));
const useLocal = process.env.ACCOUNTING_TEST_LOCAL !== "0";
let url;
let serviceKey;
let anonKey;
if (useLocal) {
  const raw = execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" });
  const st = parseSupabaseStatusEnv(raw);
  url = st.API_URL;
  serviceKey = st.SERVICE_ROLE_KEY;
  anonKey = st.ANON_KEY;
  syncWorkspaceIntakeLocalSchema(repoRoot);
} else {
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

if (!url || !serviceKey || !anonKey) {
  console.error("workspace-intake: missing supabase env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const results = { pass: 0, fail: 0 };

function assert(name, ok) {
  if (ok) {
    results.pass += 1;
    console.log(`PASS ${name}`);
  } else {
    results.fail += 1;
    console.log(`FAIL ${name}`);
  }
}

const tag = `ws-intake-${Date.now()}`;
const emailA = `${tag}-a@test.vfbcai.local`;
const emailB = `${tag}-b@test.vfbcai.local`;
const emailMember = `${tag}-m@test.vfbcai.local`;
const password = `Test-${tag}-Aa1!`;

async function signUp(email) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function signIn(email) {
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, token: data.session.access_token, userId: data.user.id };
}

async function seedOrg(userId, label, role = "company_owner") {
  const { data: org, error: orgErr } = await admin
    .from("accounting_organizations")
    .insert({
      name_official: `Official ${label}`,
      name_ko_display: `Ko ${label}`,
      tax_code: `TAX-${label}`,
      approval_status: "approved",
    })
    .select("id")
    .single();
  if (orgErr) throw orgErr;
  await admin.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: userId,
    role,
  });
  await admin.from("users").upsert({ id: userId, member_type: "company" });
  return org.id;
}

function assertPeriodValidation() {
  assert("period_month_valid", validateWorkspaceIntakePayload({
    reportIntent: "vat",
    periodGranularity: "month",
    periodKey: "2026-09",
    viUnderstanding: "read_self",
  }) === null);
  assert("period_month_invalid", validateWorkspaceIntakePayload({
    reportIntent: "vat",
    periodGranularity: "month",
    periodKey: "2026-13",
    viUnderstanding: "read_self",
  }) === "INVALID_PERIOD");
  assert("period_quarter_mismatch", validateWorkspaceIntakePayload({
    reportIntent: "vat",
    periodGranularity: "quarter",
    periodKey: "2026-09",
    viUnderstanding: "read_self",
  }) === "INVALID_PERIOD");
  assert("period_year_valid", validateWorkspaceIntakePayload({
    reportIntent: "undecided",
    periodGranularity: "year",
    periodKey: "2025",
    viUnderstanding: "hard",
  }) === null);
}

function assertRedirectPaths() {
  const vat = workspaceIntakeRedirectPath("vat", "2026-09");
  assert("redirect_vat", vat.path.includes(ACCOUNTING_ROUTES.tax) && vat.path.includes("periodKey=2026-09"));
  const corp = workspaceIntakeRedirectPath("corp_tax", "2025");
  assert("redirect_corp_tax", corp.path === ACCOUNTING_ROUTES.home && corp.noticeKey);
  const inv = workspaceIntakeRedirectPath("invoices", "2026-Q1");
  assert("redirect_invoices", inv.path === ACCOUNTING_ROUTES.transactions);
  const und = workspaceIntakeRedirectPath("undecided", "2025");
  assert("redirect_undecided", und.path === ACCOUNTING_ROUTES.home && !und.noticeKey);
}

async function main() {
  assertPeriodValidation();
  assertRedirectPaths();
  assert("later_home_not_gated", !isAccountingWorkspaceDataPath(ACCOUNTING_ROUTES.home));
  assert("tax_path_gated", isAccountingWorkspaceDataPath(ACCOUNTING_ROUTES.tax));

  const userA = await signUp(emailA);
  const userB = await signUp(emailB);
  const userMember = await signUp(emailMember);
  const orgA = await seedOrg(userA, "A");
  const orgB = await seedOrg(userB, "B");
  await seedOrg(userMember, "Am", "company_member");

  const sessionA = await signIn(emailA);
  const { data: before } = await sessionA.client
    .from("accounting_org_workspace_intake")
    .select("org_id")
    .eq("org_id", orgA)
    .maybeSingle();
  assert("first_visit_no_row", !before?.org_id);
  assert("first_visit_has_intake_false", !(await hasOrgWorkspaceIntake(sessionA.client, orgA)));

  const { error: insErr } = await sessionA.client.from("accounting_org_workspace_intake").insert({
    org_id: orgA,
    report_intent: "vat",
    period_granularity: "month",
    period_key: "2026-09",
    vi_understanding: "read_self",
    created_by: userA,
  });
  if (insErr) console.log("owner_insert_err", insErr.code, insErr.message);
  assert("owner_insert_ok", !insErr);

  assert("after_intake_has_row", await hasOrgWorkspaceIntake(sessionA.client, orgA));

  const sessionB = await signIn(emailB);
  const { data: cross } = await sessionB.client
    .from("accounting_org_workspace_intake")
    .select("org_id")
    .eq("org_id", orgA)
    .maybeSingle();
  assert("cross_org_select_blocked", !cross?.org_id);

  const { error: crossInsErr } = await sessionB.client.from("accounting_org_workspace_intake").insert({
    org_id: orgA,
    report_intent: "invoices",
    period_granularity: "month",
    period_key: "2026-08",
    vi_understanding: "hard",
    created_by: userB,
  });
  assert("cross_org_insert_blocked", Boolean(crossInsErr));

  const { error: forgedErr } = await sessionA.client.from("accounting_org_workspace_intake").insert({
    org_id: orgB,
    report_intent: "undecided",
    period_granularity: "year",
    period_key: "2024",
    vi_understanding: "read_self",
    created_by: userA,
  });
  assert("created_by_forgery_blocked", Boolean(forgedErr));

  const { error: badPeriodErr } = await sessionA.client.from("accounting_org_workspace_intake").insert({
    org_id: orgA,
    report_intent: "vat",
    period_granularity: "month",
    period_key: "2026-13",
    vi_understanding: "read_self",
    created_by: userA,
  });
  assert("db_period_check_rejects", Boolean(badPeriodErr));

  const { error: dupErr } = await sessionA.client.from("accounting_org_workspace_intake").insert({
    org_id: orgA,
    report_intent: "invoices",
    period_granularity: "month",
    period_key: "2026-08",
    vi_understanding: "hard",
    created_by: userA,
  });
  assert("duplicate_insert_denied", Boolean(dupErr));

  const sessionMember = await signIn(emailMember);
  const memberOrgId = (
    await admin.from("accounting_org_members").select("org_id").eq("user_id", userMember).single()
  ).data.org_id;
  const { error: memberInsErr } = await sessionMember.client.from("accounting_org_workspace_intake").insert({
    org_id: memberOrgId,
    report_intent: "undecided",
    period_granularity: "year",
    period_key: "2025",
    vi_understanding: "interpreter",
    created_by: userMember,
  });
  if (memberInsErr) console.log("member_insert_err", memberInsErr.code, memberInsErr.message);
  assert("member_insert_ok", !memberInsErr);

  console.log(`workspace-intake summary pass=${results.pass} fail=${results.fail}`);
  process.exit(results.fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
