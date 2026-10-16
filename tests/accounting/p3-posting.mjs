/**
 * Accounting P3 posting engine — local Supabase only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

const raw = execSync("npx supabase migration up --local", {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: ["pipe", "pipe", "pipe"],
});
void raw;
const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const url = st.API_URL;
const anonKey = st.ANON_KEY;
const serviceKey = st.SERVICE_ROLE_KEY;

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail) {
  results.cases.push({ name, ok: Boolean(ok), detail: detail ?? "" });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

async function signIn(email, password) {
  const bootstrap = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await bootstrap.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`signIn ${email}`);
  const token = data.session.access_token;
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { client, token };
}

function saleBody(action, extra = {}) {
  return {
    action,
    type: "sale",
    txnDate: "2026-10-16",
    newCounterpartyName: "Buyer",
    invoiceSeries: "1C26T",
    invoiceNo: "0000099",
    invoiceDate: "2026-10-16",
    currency: "VND",
    amountNet: 1000000,
    vatRate: 10,
    vatAmount: 100000,
    ...extra,
  };
}

async function main() {
  const { seedTestPostingRule } = await import("./testPostingFixture.mjs");
  const { applyTransactionCommand } = await import("../../src/lib/accounting/transactionEntry.ts");
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const tag = `p3-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  async function makeUser(email, role = "company_owner") {
    const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(error?.message ?? "user");
    await service.from("users").upsert({ id: data.user.id, member_type: "company" }, { onConflict: "id" });
    return { id: data.user.id, role };
  }

  const ownerA = await makeUser(`${tag}-a-owner@test.vfbcai.local`);
  const ownerB = await makeUser(`${tag}-b-owner@test.vfbcai.local`);
  const memberA = await makeUser(`${tag}-a-member@test.vfbcai.local`, "company_member");

  async function makeOrg(name) {
    const { data, error } = await service
      .from("accounting_organizations")
      .insert({ name_official: name, approval_status: "approved" })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "org");
    return data.id;
  }

  const orgA = await makeOrg(`OrgA ${tag}`);
  const orgB = await makeOrg(`OrgB ${tag}`);
  await service.from("accounting_org_members").insert([
    { org_id: orgA, user_id: ownerA.id, role: "company_owner" },
    { org_id: orgA, user_id: memberA.id, role: "company_member" },
    { org_id: orgB, user_id: ownerB.id, role: "company_owner" },
  ]);

  await seedTestPostingRule(service);

  const ownerAClient = await signIn(`${tag}-a-owner@test.vfbcai.local`, password);
  const ownerBClient = await signIn(`${tag}-b-owner@test.vfbcai.local`, password);

  const draft = await applyTransactionCommand(ownerAClient.client, ownerAClient.token, saleBody("draft"), null);
  record("draft_ok", draft.ok);
  if (!draft.ok) throw new Error("draft");

  const noRule = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("confirm", { type: "payroll", newCounterpartyName: "X" }),
    null
  );
  record("no_posting_rule_rejected", !noRule.ok && noRule.error === "POSTING_RULE_MISSING");

  const confirm = await applyTransactionCommand(ownerAClient.client, ownerAClient.token, saleBody("confirm"), draft.id);
  record("confirm_with_ledger", confirm.ok);

  const { data: ledger } = await ownerAClient.client
    .from("accounting_ledger_entries")
    .select("debit, credit")
    .eq("txn_id", draft.id);
  const debitSum = (ledger ?? []).reduce((s, r) => s + Number(r.debit), 0);
  const creditSum = (ledger ?? []).reduce((s, r) => s + Number(r.credit), 0);
  record("ledger_balanced", debitSum === creditSum && debitSum === 1100000);

  const { data: enriched } = await ownerAClient.client
    .from("accounting_ledger_entries_enriched")
    .select("uses_unverified_accounting_basis")
    .eq("txn_id", draft.id);
  record(
    "unverified_basis_flag",
    (enriched ?? []).length >= 2 && (enriched ?? []).every((r) => r.uses_unverified_accounting_basis === true)
  );

  const crossRead = await ownerBClient.client.from("accounting_ledger_entries").select("id").eq("org_id", orgA);
  record("cross_org_ledger_read_blocked", (crossRead.data ?? []).length === 0 && !crossRead.error);

  const crossInsert = await ownerBClient.client.from("accounting_ledger_entries").insert({
    org_id: orgA,
    txn_id: draft.id,
    period_key: "2026-10",
    entry_date: "2026-10-16",
    account_code: "TEST-DB-SALE",
    debit: 1,
    credit: 0,
  });
  record("cross_org_ledger_insert_blocked", Boolean(crossInsert.error));

  const before = await ownerAClient.client.from("accounting_transactions").select("invoice_no, status").eq("id", draft.id).single();
  await ownerAClient.client.from("accounting_transactions").update({ invoice_no: "hack" }).eq("id", draft.id);
  const { data: still } = await ownerAClient.client
    .from("accounting_transactions")
    .select("invoice_no, status")
    .eq("id", draft.id)
    .maybeSingle();
  record(
    "confirmed_txn_update_blocked",
    still?.status === "confirmed" && still?.invoice_no === before.data?.invoice_no
  );

  const delLedger = await ownerAClient.client.from("accounting_ledger_entries").delete().eq("txn_id", draft.id);
  record("ledger_delete_blocked", Boolean(delLedger.error));

  const { count: auditCount } = await ownerAClient.client
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity_id", draft.id);
  record("audit_on_confirm", (auditCount ?? 0) >= 1);

  await service.from("accounting_declarations").insert({
    org_id: orgA,
    form_code: "TEST-VAT",
    period_key: "2026-11",
    status: "filed_manual",
  });
  const lockedDraft = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("draft", { txnDate: "2026-11-15", invoiceNo: "0000100" }),
    null
  );
  const lockedConfirm = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("confirm", { txnDate: "2026-11-15", invoiceNo: "0000100" }),
    lockedDraft.ok ? lockedDraft.id : null
  );
  record("filed_manual_period_blocked", lockedDraft.ok && !lockedConfirm.ok && lockedConfirm.error === "PERIOD_FILED_LOCKED");

  const orig = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("confirm", { invoiceNo: "0000101" }),
    null
  );
  record("orig_confirm", orig.ok);
  const { data: origLedger } = await ownerAClient.client
    .from("accounting_ledger_entries")
    .select("id, debit, credit, account_code")
    .eq("txn_id", orig.id);
  const origHash = JSON.stringify(origLedger);

  const corrBody = saleBody("draft", { invoiceNo: "0000102" });
  const corrDraft = await applyTransactionCommand(ownerAClient.client, ownerAClient.token, corrBody, null);
  if (corrDraft.ok) {
    await ownerAClient.client
      .from("accounting_transactions")
      .update({ corrects_txn_id: orig.id })
      .eq("id", corrDraft.id);
  }
  const corrConfirm = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("confirm", { invoiceNo: "0000102" }),
    corrDraft.ok ? corrDraft.id : null
  );
  record("correction_confirm", corrConfirm.ok);
  const { data: origAfter } = await ownerAClient.client
    .from("accounting_ledger_entries")
    .select("id, debit, credit, account_code")
    .eq("txn_id", orig.id);
  record("orig_ledger_unchanged", JSON.stringify(origAfter) === origHash);

  const { data: corrLedger } = await ownerAClient.client
    .from("accounting_ledger_entries")
    .select("debit, credit")
    .eq("txn_id", corrDraft.id);
  const cDebit = (corrLedger ?? []).reduce((s, r) => s + Number(r.debit), 0);
  const cCredit = (corrLedger ?? []).reduce((s, r) => s + Number(r.credit), 0);
  record("correction_ledger_balanced", cDebit === cCredit && cDebit > 0);

  const rollbackDraft = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("draft", { type: "purchase", newCounterpartyName: "Sup", invoiceNo: "0000200" }),
    null
  );
  await service.from("accounting_posting_rules").insert({
    txn_type: "purchase",
    condition: {},
    debit_code: "TEST-DB-SALE",
    credit_code: "TEST-THROW-FAIL",
    effective_from: "2026-01-01",
    verified_status: "unverified",
  });

  const rollbackConfirm = await applyTransactionCommand(
    ownerAClient.client,
    ownerAClient.token,
    saleBody("confirm", { type: "purchase", newCounterpartyName: "Sup", invoiceNo: "0000200" }),
    rollbackDraft.ok ? rollbackDraft.id : null
  );
  const { data: rollbackTxn } = await ownerAClient.client
    .from("accounting_transactions")
    .select("status")
    .eq("id", rollbackDraft.id)
    .maybeSingle();
  record(
    "rollback_not_confirmed",
    rollbackDraft.ok && !rollbackConfirm.ok && rollbackTxn?.status !== "confirmed"
  );

  console.log(JSON.stringify(results, null, 2));
  if (results.fail > 0) process.exit(1);
}

main().catch((error) => {
  record("harness", false, error instanceof Error ? error.message : "failed");
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
