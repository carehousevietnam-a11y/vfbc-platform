/**
 * Accounting P2-a transaction entry — local Supabase only.
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
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

loadEnvFile(path.join(repoRoot, ".env.local"));
const useLocal = process.env.ACCOUNTING_TEST_LOCAL !== "0";
let url;
let anonKey;
let serviceKey;
if (useLocal) {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  url = st.API_URL;
  anonKey = st.ANON_KEY;
  serviceKey = st.SERVICE_ROLE_KEY;
} else {
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail) {
  results.cases.push({ name, ok: Boolean(ok), detail: detail ?? "" });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

function saleBody(action, extra = {}) {
  return {
    action,
    type: "sale",
    txnDate: "2026-10-16",
    newCounterpartyName: "Buyer",
    invoiceSeries: "1C26T",
    invoiceNo: "0000001",
    invoiceDate: "2026-10-16",
    currency: "VND",
    amountNet: 1000000,
    vatRate: 10,
    vatAmount: 100000,
    ...extra,
  };
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

async function main() {
  if (useLocal) {
    execSync("npx supabase migration up --local", {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  }
  const { applyTransactionCommand, listTransactions, buildTxnChecks, computeAmountVnd } = await import(
    "../../src/lib/accounting/transactionEntry.ts"
  );
  const fx = buildTxnChecks({
    type: "expense",
    txnDate: "2026-10-16",
    counterpartyId: null,
    newCounterpartyName: null,
    invoiceSeries: "",
    invoiceNo: "",
    invoiceDate: "",
    currency: "USD",
    fxRate: 25000,
    amountNet: 10,
    vatRate: 0,
    vatAmount: 0,
  }).find((check) => check.code === "fx");
  record("fx_unverified_mid", fx?.level === "mid" && fx.messageKey.endsWith("fx_unverified"));
  record("fx_user_multiplier", computeAmountVnd("USD", 10, 0, 25000) === 250000);

  const { seedTestPostingRule } = await import("./testPostingFixture.mjs");
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const tag = `p2a-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;
  const emails = {
    owner: `${tag}-owner@txn.test.vfbcai.local`,
    member: `${tag}-member@txn.test.vfbcai.local`,
    other: `${tag}-other@txn.test.vfbcai.local`,
    pending: `${tag}-pending@txn.test.vfbcai.local`,
  };

  async function makeUser(email) {
    const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(error?.message ?? "createUser");
    const { error: userError } = await service.from("users").upsert(
      { id: data.user.id, member_type: "company" },
      { onConflict: "id" }
    );
    if (userError) throw new Error(userError.message);
    return data.user.id;
  }

  const ownerId = await makeUser(emails.owner);
  const memberId = await makeUser(emails.member);
  const otherId = await makeUser(emails.other);
  const pendingId = await makeUser(emails.pending);

  async function makeOrg(name, approval) {
    const { data, error } = await service
      .from("accounting_organizations")
      .insert({ name_official: name, approval_status: approval })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "org");
    return data.id;
  }
  const orgA = await makeOrg(`OrgA ${tag}`, "approved");
  const orgB = await makeOrg(`OrgB ${tag}`, "approved");
  const orgP = await makeOrg(`OrgP ${tag}`, "pending");
  const { error: memberError } = await service.from("accounting_org_members").insert([
    { org_id: orgA, user_id: ownerId, role: "company_owner" },
    { org_id: orgA, user_id: memberId, role: "company_member" },
    { org_id: orgB, user_id: otherId, role: "company_owner" },
    { org_id: orgP, user_id: pendingId, role: "company_owner" },
  ]);
  if (memberError) throw new Error(memberError.message);
  await seedTestPostingRule(service);

  const owner = await signIn(emails.owner, password);
  const member = await signIn(emails.member, password);
  const other = await signIn(emails.other, password);
  const pending = await signIn(emails.pending, password);
  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const anonRpc = await anon.rpc("accounting_can_read_company_signup_profile", {
    p_target_user_id: ownerId,
  });
  record(
    "anon_execute_revoked",
    Boolean(anonRpc.error) && /permission denied|42501/i.test(`${anonRpc.error.code ?? ""} ${anonRpc.error.message}`)
  );

  const authRpc = await owner.client.rpc("accounting_can_read_company_signup_profile", {
    p_target_user_id: memberId,
  });
  record("authenticated_execute_kept", !authRpc.error && typeof authRpc.data === "boolean");

  const pendingList = await listTransactions(pending.client, pending.token, {});
  record("pending_org_denied", !pendingList.ok && pendingList.error === "ORG_NOT_APPROVED");

  const spoofId = "00000000-0000-0000-0000-000000000099";
  const drafted = await applyTransactionCommand(
    member.client,
    member.token,
    saleBody("draft", {
      org_id: orgB,
      role: "company_owner",
      created_by: otherId,
      confirmed_by: otherId,
    }),
    null
  );
  record("member_draft", drafted.ok && drafted.status === "draft");
  if (!drafted.ok) {
    record("spoof_ignored", false, drafted.error);
    record("cross_list", false);
    record("cross_update", false);
    record("member_confirm_forbidden", false);
    record("owner_confirm", false);
    record("confirmed_update_blocked", false);
    record("confirmed_delete_blocked", false);
    record("audit_present", false);
    record("cross_party", false);
  } else {
    const { data: row } = await owner.client
      .from("accounting_transactions")
      .select("org_id, created_by, counterparty_id")
      .eq("id", drafted.id)
      .single();
    record(
      "spoof_ignored",
      row?.org_id === orgA && row?.created_by === memberId && row?.org_id !== orgB && row?.created_by !== spoofId
    );
    const otherList = await listTransactions(other.client, other.token, { period: "2026-10", type: "sale", status: "draft" });
    record("cross_list", otherList.ok && !otherList.items.some((item) => item.id === drafted.id));
    const crossWrite = await applyTransactionCommand(other.client, other.token, saleBody("draft"), drafted.id);
    record("cross_update", !crossWrite.ok && crossWrite.error === "NOT_FOUND");
    const { data: foreignParty } = await other.client
      .from("accounting_counterparties")
      .select("id")
      .eq("id", row.counterparty_id)
      .maybeSingle();
    record("cross_party", !foreignParty);
    const memberConfirm = await applyTransactionCommand(
      member.client,
      member.token,
      saleBody("confirm", { role: "company_owner", org_id: orgA, confirmed_by: ownerId }),
      drafted.id
    );
    record("member_confirm_forbidden", !memberConfirm.ok && memberConfirm.error === "CONFIRM_FORBIDDEN");
    const usdDraft = await applyTransactionCommand(
      owner.client,
      owner.token,
      saleBody("draft", { currency: "USD", fxRate: 25000 }),
      null
    );
    let usdSubmitOk = false;
    let usdConfirm = { ok: false, error: "" };
    if (usdDraft.ok) {
      const usdSubmit = await applyTransactionCommand(
        owner.client,
        owner.token,
        saleBody("submit", { currency: "USD", fxRate: 25000 }),
        usdDraft.id
      );
      usdSubmitOk = usdSubmit.ok;
      usdConfirm = await applyTransactionCommand(
        owner.client,
        owner.token,
        saleBody("confirm", { currency: "USD", fxRate: 25000 }),
        usdDraft.id
      );
    }
    record(
      "fx_confirm_with_unverified",
      usdDraft.ok && usdSubmitOk && usdConfirm.ok && usdConfirm.fxUnverified === true
    );
    const submitted = await applyTransactionCommand(owner.client, owner.token, saleBody("submit"), drafted.id);
    const confirmed = await applyTransactionCommand(owner.client, owner.token, saleBody("confirm"), drafted.id);
    record("owner_confirm", submitted.ok && submitted.status === "submitted" && confirmed.ok && confirmed.status === "confirmed");
    const before = await owner.client.from("accounting_transactions").select("invoice_no, status").eq("id", drafted.id).single();
    const updated = await owner.client.from("accounting_transactions").update({ invoice_no: "999" }).eq("id", drafted.id);
    const deleted = await owner.client.from("accounting_transactions").delete().eq("id", drafted.id);
    const { data: still } = await owner.client.from("accounting_transactions").select("invoice_no, status").eq("id", drafted.id).maybeSingle();
    const serviceUpdate = await service.from("accounting_transactions").update({ invoice_no: "888" }).eq("id", drafted.id);
    const serviceDelete = await service.from("accounting_transactions").delete().eq("id", drafted.id);
    record(
      "confirmed_update_blocked",
      still?.invoice_no === before.data?.invoice_no && still?.status === "confirmed" && Boolean(serviceUpdate.error)
    );
    record(
      "confirmed_delete_blocked",
      still?.status === "confirmed" && Boolean(serviceDelete.error) && !deleted.data
    );
    const { count } = await owner.client
      .from("accounting_audit_log")
      .select("id", { count: "exact", head: true })
      .eq("entity_id", drafted.id)
      .eq("entity", "accounting_transactions");
    record("audit_present", (count ?? 0) >= 1);
  }

  console.log(JSON.stringify(results, null, 2));
  if (results.fail > 0) process.exit(1);
}

main().catch((error) => {
  record("harness", false, error instanceof Error ? error.message : "failed");
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
