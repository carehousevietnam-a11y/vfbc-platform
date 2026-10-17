/**
 * Local-only dev accounting login accounts (run after supabase start).
 * Password: src/lib/accounting/dev-local-login.config.json (not printed).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8")
);

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const host = new URL(st.API_URL).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error("refusing non-local supabase");
  process.exit(1);
}

const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const password = config.password;

async function findUserByEmail(email) {
  let page = 1;
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function ensureUser(email) {
  let user = await findUserByEmail(email);
  if (user) {
    await service.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  } else {
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }
  await service.from("users").upsert({ id: user.id, member_type: "company" }, { onConflict: "id" });
  return user;
}

async function ensureOrg(key, spec) {
  const existing = await service
    .from("accounting_organizations")
    .select("id")
    .eq("tax_code", spec.tax_code)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id;
  const { data, error } = await service
    .from("accounting_organizations")
    .insert({ name_official: spec.name_official, tax_code: spec.tax_code, approval_status: "approved" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureMember(orgId, userId, role) {
  const row = await service
    .from("accounting_org_members")
    .select("id")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();
  if (row.data?.id) {
    await service.from("accounting_org_members").update({ role }).eq("id", row.data.id);
    return;
  }
  await service.from("accounting_org_members").insert({ org_id: orgId, user_id: userId, role });
}

const ownerA = await ensureUser(config.accounts.org_a_owner);
const ownerB = await ensureUser(config.accounts.org_b_owner);
const expert = await ensureUser(config.accounts.vnk_expert);

const orgA = await ensureOrg("a", config.orgs.a);
const orgB = await ensureOrg("b", config.orgs.b);

await ensureMember(orgA, ownerA.id, "company_owner");
await ensureMember(orgB, ownerB.id, "company_owner");
await ensureMember(orgA, expert.id, "vnk_expert");

await service.from("accounting_profiles").upsert(
  [
    { user_id: ownerA.id, locale: "ko" },
    { user_id: ownerB.id, locale: "ko" },
    { user_id: expert.id, locale: "vi" },
  ],
  { onConflict: "user_id" }
);

const assign = await service
  .from("accounting_expert_assignments")
  .select("id")
  .eq("org_id", orgA)
  .eq("expert_user_id", expert.id)
  .maybeSingle();
if (!assign.data?.id) {
  await service.from("accounting_expert_assignments").insert({
    expert_user_id: expert.id,
    org_id: orgA,
    assigned_by: ownerA.id,
  });
}

const { count: txnCount } = await service
  .from("accounting_transactions")
  .select("id", { count: "exact", head: true })
  .eq("org_id", orgA);
if ((txnCount ?? 0) === 0) {
  await seedTestPostingRule(service, "sale");
  const anon = createClient(st.API_URL, st.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
    email: config.accounts.org_a_owner,
    password,
  });
  if (signErr || !signIn.session) throw signErr ?? new Error("dev owner sign-in failed");
  const ownerClient = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${signIn.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  async function confirmTxn(txnId) {
    const { error } = await ownerClient.rpc("accounting_confirm_transaction", { p_txn_id: txnId });
    if (error) throw error;
  }
  async function addConfirmedTxn(date, amountVnd) {
    const { data: t, error } = await service
      .from("accounting_transactions")
      .insert({
        org_id: orgA,
        type: "sale",
        status: "draft",
        txn_date: date,
        period_key: date.slice(0, 7),
        amount_vnd: amountVnd,
        created_by: ownerA.id,
      })
      .select("id")
      .single();
    if (error || !t) throw error ?? new Error("txn insert failed");
    await service.from("accounting_transaction_lines").insert({
      txn_id: t.id,
      amount_net: amountVnd,
      vat_rate: 0,
      vat_amount: 0,
    });
    await confirmTxn(t.id);
    return t.id;
  }
  await addConfirmedTxn("2026-10-16", 1_000_000);
  await addConfirmedTxn("2026-10-15", 900_000);
  await addConfirmedTxn("2026-10-14", 800_000);
  await addConfirmedTxn("2026-10-13", 700_000);
  await addConfirmedTxn("2026-10-12", 600_000);

  const { count: declCount } = await service
    .from("accounting_declarations")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgA);
  if ((declCount ?? 0) === 0) {
    await service.from("accounting_declarations").insert([
      {
        org_id: orgA,
        form_code: "01/GTGT",
        period_key: "2026-11",
        status: "drafting",
        due_date: null,
      },
      {
        org_id: orgA,
        form_code: "01/GTGT",
        period_key: "2026-10",
        status: "expert_review",
        due_date: "2026-11-20",
      },
      {
        org_id: orgA,
        form_code: "01/GTGT",
        period_key: "2026-09",
        status: "ready",
        due_date: "2026-10-20",
      },
    ]);
  }
}

console.log(
  JSON.stringify({
    ok: true,
    orgA,
    orgB,
    emails: config.accounts,
    mailOtpNote: config.mailOtpNote,
  })
);
