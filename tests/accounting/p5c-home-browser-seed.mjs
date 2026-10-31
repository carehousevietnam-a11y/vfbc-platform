/**
 * P5c home dashboard browser QA seed (local Supabase only).
 */
import fs from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

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

const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tag = `p5c-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;

async function createUser(email) {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  await service.from("users").upsert({ id: data.user.id, member_type: "company" });
  return data.user;
}

const aOwner = await createUser(`${tag}-a-owner@test.vfbcai.local`);
const aMember = await createUser(`${tag}-a-member@test.vfbcai.local`);
const aOwnerVi = await createUser(`${tag}-a-vi@test.vfbcai.local`);
const bOwner = await createUser(`${tag}-b-owner@test.vfbcai.local`);
const bMember = await createUser(`${tag}-b-member@test.vfbcai.local`);
const cOwner = await createUser(`${tag}-c-owner@test.vfbcai.local`);

await service.from("accounting_profiles").upsert([
  { user_id: aOwner.id, locale: "ko" },
  { user_id: aMember.id, locale: "ko" },
  { user_id: aOwnerVi.id, locale: "vi" },
  { user_id: bOwner.id, locale: "ko" },
  { user_id: cOwner.id, locale: "ko" },
]);

const orgBase = {
  approval_status: "approved",
  vat_method: "deduction",
  vat_period: "month",
};
const { data: orgA } = await service
  .from("accounting_organizations")
  .insert({ ...orgBase, name_official: `P5C A ${tag}`, tax_code: "0100000101" })
  .select("id")
  .single();
const { data: orgB } = await service
  .from("accounting_organizations")
  .insert({ ...orgBase, name_official: `P5C B ${tag}`, tax_code: "0100000102" })
  .select("id")
  .single();
const { data: orgC } = await service
  .from("accounting_organizations")
  .insert({ ...orgBase, name_official: `P5C C ${tag}`, tax_code: "0100000103" })
  .select("id")
  .single();

const members = [
  [orgA.id, aOwner.id, "company_owner"],
  [orgA.id, aMember.id, "company_member"],
  [orgA.id, aOwnerVi.id, "company_owner"],
  [orgB.id, bOwner.id, "company_owner"],
  [orgB.id, bMember.id, "company_member"],
  [orgC.id, cOwner.id, "company_owner"],
];
for (const [org_id, user_id, role] of members) {
  await service.from("accounting_org_members").insert({ org_id, user_id, role });
}

await seedTestPostingRule(service, "sale");
const anonEarly = createClient(st.API_URL, st.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: ownerSignIn } = await anonEarly.auth.signInWithPassword({
  email: `${tag}-a-owner@test.vfbcai.local`,
  password,
});
const ownerClient = createClient(st.API_URL, st.ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${ownerSignIn.session.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
async function confirmTxn(txnId) {
  const { error } = await ownerClient.rpc("accounting_confirm_transaction", { p_txn_id: txnId });
  if (error) throw error;
}

async function addTxn(orgId, { date, amount, status, withEvidence }) {
  const { data: t } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgId,
      type: "sale",
      status: "draft",
      txn_date: date,
      period_key: date.slice(0, 7),
      amount_vnd: amount,
      created_by: orgId === orgA.id ? aOwner.id : bOwner.id,
    })
    .select("id")
    .single();
  await service.from("accounting_transaction_lines").insert({
    txn_id: t.id,
    amount_net: amount,
    vat_rate: 0,
    vat_amount: 0,
  });
  if (status === "confirmed") await confirmTxn(t.id);
  if (status === "submitted") {
    await service.from("accounting_transactions").update({ status: "submitted" }).eq("id", t.id);
  }
  if (withEvidence) {
    await service.from("accounting_evidence_files").insert({
      org_id: orgId,
      txn_id: t.id,
      storage_path: `${orgId}/${t.id}/seed.png`,
      sha256: "seed",
      mime: "image/png",
      size: 1,
      uploaded_by: aOwner.id,
    });
  }
  return t.id;
}

const txnRecent1 = await addTxn(orgA.id, {
  date: "2026-10-16",
  amount: 1_000_000,
  status: "confirmed",
  withEvidence: true,
});
await addTxn(orgA.id, { date: "2026-10-15", amount: 900_000, status: "confirmed", withEvidence: false });
await addTxn(orgA.id, { date: "2026-10-14", amount: 800_000, status: "confirmed", withEvidence: true });
await addTxn(orgA.id, { date: "2026-10-13", amount: 700_000, status: "confirmed", withEvidence: true });
await addTxn(orgA.id, { date: "2026-10-12", amount: 600_000, status: "confirmed", withEvidence: true });
await addTxn(orgA.id, { date: "2026-10-11", amount: 500_000, status: "confirmed", withEvidence: true });
await addTxn(orgA.id, { date: "2026-10-10", amount: 100, status: "draft", withEvidence: false });
await addTxn(orgA.id, { date: "2026-10-09", amount: 200, status: "submitted", withEvidence: false });

const { data: txnBRow } = await service
  .from("accounting_transactions")
  .insert({
    org_id: orgB.id,
    type: "sale",
    status: "confirmed",
    txn_date: "2026-10-20",
    period_key: "2026-10",
    amount_vnd: 7_777_777,
    created_by: bOwner.id,
    confirmed_at: new Date().toISOString(),
    confirmed_by: bOwner.id,
  })
  .select("id")
  .single();
const txnBMarker = txnBRow.id;

await service.from("accounting_declarations").insert([
  {
    org_id: orgA.id,
    form_code: "01/GTGT",
    period_key: "2026-11",
    status: "drafting",
    due_date: null,
  },
  {
    org_id: orgA.id,
    form_code: "01/GTGT",
    period_key: "2026-10",
    status: "expert_review",
    due_date: "2026-11-20",
  },
  {
    org_id: orgA.id,
    form_code: "01/GTGT",
    period_key: "2026-09",
    status: "ready",
    due_date: "2026-10-20",
  },
  {
    org_id: orgB.id,
    form_code: "01/GTGT",
    period_key: "2026-12",
    status: "expert_review",
    due_date: "2026-12-20",
  },
]);

const anon = createClient(st.API_URL, st.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function sessionFor(email) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const payload = {
  password,
  tag,
  storageKey,
  orgA: orgA.id,
  orgB: orgB.id,
  orgC: orgC.id,
  txnRecent1,
  txnBMarker,
  amountKo: "1,000,000",
  amountVi: "1.000.000",
  dateKo: "2026.10.16",
  dateVi: "16/10/2026",
  sessionOwner: await sessionFor(`${tag}-a-owner@test.vfbcai.local`),
  sessionMember: await sessionFor(`${tag}-a-member@test.vfbcai.local`),
  sessionVi: await sessionFor(`${tag}-a-vi@test.vfbcai.local`),
  sessionB: await sessionFor(`${tag}-b-owner@test.vfbcai.local`),
  sessionC: await sessionFor(`${tag}-c-owner@test.vfbcai.local`),
};

fs.writeFileSync(path.join(repoRoot, "tests/accounting/.p5c-session.json"), JSON.stringify(payload));
console.log(JSON.stringify({ ok: true, tag, orgA: orgA.id, orgC: orgC.id }));
