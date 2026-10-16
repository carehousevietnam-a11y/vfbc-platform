/**
 * Local-only seed for P5b browser QA. Prints credentials JSON to stdout.
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
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" })
);
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tag = `p5b-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;

async function createUser(email) {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

const aOwner = await createUser(`${tag}-a-owner@test.vfbcai.local`);
const aMember = await createUser(`${tag}-a-member@test.vfbcai.local`);
const aMemberVi = await createUser(`${tag}-a-vi@test.vfbcai.local`);
const bOwner = await createUser(`${tag}-b-owner@test.vfbcai.local`);

for (const u of [aOwner, aMember, aMemberVi, bOwner]) {
  await service.from("users").upsert({ id: u.id, member_type: "company" });
}
await service.from("accounting_profiles").upsert([
  { user_id: aOwner.id, locale: "ko" },
  { user_id: aMemberVi.id, locale: "vi" },
]);

const { data: orgA } = await service
  .from("accounting_organizations")
  .insert({
    name_official: `P5B A ${tag}`,
    tax_code: "0100000001",
    approval_status: "approved",
    vat_method: "deduction",
    vat_period: "month",
  })
  .select("id")
  .single();
const { data: orgB } = await service
  .from("accounting_organizations")
  .insert({ name_official: `P5B B ${tag}`, tax_code: "0100000002", approval_status: "approved" })
  .select("id")
  .single();

for (const [uid, role] of [
  [aOwner.id, "company_owner"],
  [aMember.id, "company_member"],
  [aMemberVi.id, "company_member"],
]) {
  await service.from("accounting_org_members").insert({ org_id: orgA.id, user_id: uid, role });
}
await service.from("accounting_org_members").insert({
  org_id: orgB.id,
  user_id: bOwner.id,
  role: "company_owner",
});

const period = "2026-10";
await seedTestPostingRule(service, "sale");
await seedTestPostingRule(service, "purchase");

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

async function addSale(net, rate, vat, status) {
  const { data: t } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "sale",
      status: "draft",
      txn_date: "2026-10-15",
      period_key: period,
      amount_vnd: net + vat,
    })
    .select("id")
    .single();
  await service.from("accounting_transaction_lines").insert({
    txn_id: t.id,
    amount_net: net,
    vat_rate: rate,
    vat_amount: vat,
  });
  if (status === "confirmed") await confirmTxn(t.id);
  return t.id;
}

async function addPurchase(net, vat) {
  const { data: t } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "purchase",
      status: "draft",
      txn_date: "2026-10-10",
      period_key: period,
      amount_vnd: net + vat,
    })
    .select("id")
    .single();
  await service.from("accounting_transaction_lines").insert({
    txn_id: t.id,
    amount_net: net,
    vat_rate: 10,
    vat_amount: vat,
  });
  await confirmTxn(t.id);
  return t.id;
}

const sale10 = await addSale(1_000_000, 10, 100_000, "confirmed");
const sale5 = await addSale(500_000, 5, 25_000, "confirmed");
const sale0 = await addSale(200_000, 0, 0, "confirmed");
await addSale(999, 10, 99, "draft");
const purchase = await addPurchase(300_000, 30_000);

await service.from("accounting_i18n_texts").insert({
  org_id: orgA.id,
  entity_type: "transaction",
  entity_id: sale10,
  field: "memo",
  lang: "ko",
  text: "P5B 테스트 매출 메모",
  status: "original",
  version: 1,
});

const { data: filedDecl } = await service
  .from("accounting_declarations")
  .insert({
    org_id: orgA.id,
    form_code: "01/GTGT",
    period_key: "2026-09",
    status: "filed_manual",
  })
  .select("id")
  .single();

const anon = createClient(st.API_URL, st.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: sess } = await anon.auth.signInWithPassword({
  email: `${tag}-a-owner@test.vfbcai.local`,
  password,
});
const { data: sessVi } = await anon.auth.signInWithPassword({
  email: `${tag}-a-vi@test.vfbcai.local`,
  password,
});
const { data: sessMember } = await anon.auth.signInWithPassword({
  email: `${tag}-a-member@test.vfbcai.local`,
  password,
});
const { data: sessB } = await anon.auth.signInWithPassword({
  email: `${tag}-b-owner@test.vfbcai.local`,
  password,
});

const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const payload = {
  password,
  period,
  storageKey,
  orgA: orgA.id,
  orgB: orgB.id,
  aOwner: `${tag}-a-owner@test.vfbcai.local`,
  aMember: `${tag}-a-member@test.vfbcai.local`,
  aMemberVi: `${tag}-a-vi@test.vfbcai.local`,
  bOwner: `${tag}-b-owner@test.vfbcai.local`,
  txnSale10: sale10,
  filedDeclId: filedDecl.id,
  purchase,
  sessionOwner: sess.session,
  sessionVi: sessVi.session,
  sessionMember: sessMember.session,
  sessionB: sessB.session,
};
fs.writeFileSync(path.join(repoRoot, "tests/accounting/.p5b-session.json"), JSON.stringify(payload));
console.log(JSON.stringify({ ok: true, period, orgA: orgA.id, aOwner: payload.aOwner }));
