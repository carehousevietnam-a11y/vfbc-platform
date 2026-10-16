/**
 * P5a: 01/GTGT engine, deadlines, RLS — local Supabase.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { computeGtgt01, gtgtFieldsToJson } from "../../src/lib/accounting/gtgt01Engine.ts";
import { aggregateConfirmedTxnLines } from "../../src/lib/accounting/gtgt01TxnAggregate.ts";
import {
  loadVatDeadlineConfig,
  vatDueDateWithConfig,
  nextBusinessDay,
} from "../../src/lib/accounting/vatDeadline.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const results = { pass: 0, fail: 0, cases: [] };

function record(name, ok, detail = "") {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
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

function getLocalSupabaseEnv() {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  if (!st.API_URL || !st.ANON_KEY || !st.SERVICE_ROLE_KEY || !st.DB_URL) {
    throw new Error("local supabase status incomplete");
  }
  return {
    url: st.API_URL,
    anonKey: st.ANON_KEY,
    serviceKey: st.SERVICE_ROLE_KEY,
    dbUrl: st.DB_URL,
  };
}

function unitPackCaseA() {
  const r = computeGtgt01({
    prior43: 15_000_000n,
    inputs: { 25: 75_000_000n, 31: 5_000_000n, 33: 74_000_000n },
    adjustments: [],
  });
  const f = (c) => r.fields[c].value;
  record("unit_pack_a_35", f("35") === 79_000_000n);
  record("unit_pack_a_36", f("36") === 4_000_000n);
  record("unit_pack_a_41", f("41") === 11_000_000n);
  record("unit_pack_a_43", f("43") === 11_000_000n);
}

function unitPackCaseB() {
  const r = computeGtgt01({
    prior43: 0n,
    inputs: { 22: 0n, 25: 10_000_000n, 31: 50_000_000n, 33: 0n },
    adjustments: [],
  });
  const f = (c) => r.fields[c].value;
  record("unit_pack_b_40", f("40") === 40_000_000n);
  record("unit_pack_b_41_zero", f("41") === 0n);
}

async function unitDeadlines(service) {
  const cfg = await loadVatDeadlineConfig(service);
  record(
    "due_q3_2026",
    vatDueDateWithConfig("2026-Q3", "quarter", cfg) === "2026-11-02"
  );
  record(
    "due_q2_2026",
    vatDueDateWithConfig("2026-Q2", "quarter", cfg) === "2026-07-31"
  );
  record(
    "due_month_holiday_shift",
    vatDueDateWithConfig("2026-04", "month", cfg) === "2026-05-21"
  );
}

function unitAggregateMixed() {
  const { fromTxns, warnings } = aggregateConfirmedTxnLines([
    { txn_id: "s1", type: "sale", amount_net: 100, vat_rate: 0, vat_amount: 0 },
    { txn_id: "s2", type: "sale", amount_net: 200, vat_rate: 5, vat_amount: 10 },
    { txn_id: "s3", type: "sale", amount_net: 300, vat_rate: 10, vat_amount: 30 },
    { txn_id: "p1", type: "purchase", amount_net: 50, vat_rate: 10, vat_amount: 5 },
  ]);
  record("agg_29", fromTxns["29"]?.value === 100n);
  record("agg_31", fromTxns["31"]?.value === 10n);
  record("agg_33", fromTxns["33"]?.value === 30n);
  record("agg_25_warning", warnings.includes("accounting.vat.warning.field25_expert_review"));
  const r = computeGtgt01({ prior43: 0n, inputs: {}, adjustments: [], fromTxns });
  record("agg_35", r.fields["35"].value === 40n);
  record("agg_txn_ids", (r.fields["33"].txn_ids ?? []).includes("s3"));
}

function unitIdempotent() {
  const input = {
    prior43: 15_000_000n,
    inputs: { 25: 75_000_000n, 31: 5_000_000n, 33: 74_000_000n },
    adjustments: [],
  };
  const a = gtgtFieldsToJson(computeGtgt01(input));
  const b = gtgtFieldsToJson(computeGtgt01(input));
  record("idempotent_compute", JSON.stringify(a) === JSON.stringify(b));
}

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  return data.user;
}

async function signIn(url, anonKey, email, password) {
  const bootstrap = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await bootstrap.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function securityRls(url, anonKey, serviceKey) {
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const tag = `p5a-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  const ownerA = await createAuthUser(service, `a-${tag}@test.local`, password);
  const ownerB = await createAuthUser(service, `b-${tag}@test.local`, password);
  const expert = await createAuthUser(service, `e-${tag}@test.local`, password);
  const member = await createAuthUser(service, `m-${tag}@test.local`, password);

  const { data: orgA } = await service
    .from("accounting_organizations")
    .insert({ name_official: `OrgA ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  const { data: orgB } = await service
    .from("accounting_organizations")
    .insert({ name_official: `OrgB ${tag}`, approval_status: "approved" })
    .select("id")
    .single();

  for (const [uid, orgId, role] of [
    [ownerA.id, orgA.id, "company_owner"],
    [ownerB.id, orgB.id, "company_owner"],
    [expert.id, orgA.id, "vnk_expert"],
    [member.id, orgA.id, "company_member"],
  ]) {
    await service.from("accounting_org_members").insert({ org_id: orgId, user_id: uid, role });
  }

  await service.from("users").upsert([
    { id: ownerA.id, member_type: "company" },
    { id: ownerB.id, member_type: "company" },
    { id: expert.id, member_type: "company" },
    { id: member.id, member_type: "company" },
  ]);

  const clientA = await signIn(url, anonKey, `a-${tag}@test.local`, password);
  const clientB = await signIn(url, anonKey, `b-${tag}@test.local`, password);
  const clientExpert = await signIn(url, anonKey, `e-${tag}@test.local`, password);
  const clientMember = await signIn(url, anonKey, `m-${tag}@test.local`, password);

  const { data: declA } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgA.id,
      form_code: "01/GTGT",
      period_key: "2026-10",
      status: "drafting",
      computed: { fields: { "43": { value: "999", source: "calc" } } },
    })
    .select("id")
    .single();

  const cross = await clientB
    .from("accounting_declarations")
    .select("id")
    .eq("id", declA.id);
  record("isolation_declarations", (cross.data ?? []).length === 0);

  const { data: filed } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgA.id,
      form_code: "01/GTGT",
      period_key: "2026-09",
      status: "filed_manual",
    })
    .select("id")
    .single();

  const adjBlocked = await clientExpert.from("accounting_declaration_adjustments").insert({
    org_id: orgA.id,
    declaration_id: filed.id,
    field_code: "37",
    amount: 1,
    reason_code: "ADJ_DECREASE_PAYABLE",
  });
  record("filed_manual_adj_blocked", !!adjBlocked.error);

  const noReason = await clientExpert.from("accounting_declaration_adjustments").insert({
    org_id: orgA.id,
    declaration_id: declA.id,
    field_code: "37",
    amount: 1,
    reason_code: null,
  });
  record("adj_37_no_reason", !!noReason.error);

  const memberAdj = await clientMember.from("accounting_declaration_adjustments").insert({
    org_id: orgA.id,
    declaration_id: declA.id,
    field_code: "42",
    amount: 1,
    reason_code: "ADJ_REFUND_REQUEST",
  });
  record("member_adj_insert_blocked", !!memberAdj.error);

  const ownerVat = await clientA
    .from("accounting_organizations")
    .update({ vat_method: "deduction" })
    .eq("id", orgA.id);
  record("owner_vat_method_blocked", !!ownerVat.error);

  const expertVat = await clientExpert
    .from("accounting_organizations")
    .update({ vat_method: "deduction", vat_method_basis: "voluntary" })
    .eq("id", orgA.id);
  record("expert_vat_method_ok", !expertVat.error);

  const { data: adjOk } = await clientExpert
    .from("accounting_declaration_adjustments")
    .insert({
      org_id: orgA.id,
      declaration_id: declA.id,
      field_code: "38",
      amount: 1000,
      reason_code: "ADJ_INCREASE_PAYABLE",
    })
    .select("id")
    .single();
  record("expert_adj_ok", !!adjOk?.id);

  const { count: auditCount } = await service
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity", "accounting_declaration_adjustments")
    .eq("entity_id", adjOk.id);
  record("audit_log_adjustment", (auditCount ?? 0) >= 1);
}

async function loadConfirmedLinesForTest(service, orgId, periodKey) {
  const { data: txns } = await service
    .from("accounting_transactions")
    .select("id, type")
    .eq("org_id", orgId)
    .eq("period_key", periodKey)
    .eq("status", "confirmed");
  const ids = (txns ?? []).map((t) => t.id);
  if (!ids.length) return [];
  const { data: lines } = await service
    .from("accounting_transaction_lines")
    .select("txn_id, amount_net, vat_rate, vat_amount")
    .in("txn_id", ids);
  const typeById = new Map((txns ?? []).map((t) => [t.id, t.type]));
  return (lines ?? []).map((l) => ({
    txn_id: l.txn_id,
    type: typeById.get(l.txn_id),
    amount_net: Number(l.amount_net),
    vat_rate: l.vat_rate === null ? null : Number(l.vat_rate),
    vat_amount: Number(l.vat_amount),
  }));
}

function draftComputeFromLines(lines) {
  const { fromTxns, warnings } = aggregateConfirmedTxnLines(lines);
  const p1 = computeGtgt01({ prior43: 0n, inputs: {}, adjustments: [], fromTxns });
  p1.warnings.push(...warnings);
  const p2 = computeGtgt01({ prior43: 0n, inputs: {}, adjustments: [], fromTxns });
  p2.warnings.push(...warnings);
  return { a: gtgtFieldsToJson(p1), b: gtgtFieldsToJson(p2), payload: p1 };
}

async function integrationDraft(service) {
  const tag = `p5a-int-${Date.now()}`;
  const owner = await createAuthUser(service, `own-${tag}@test.local`, `Test-${tag}-Aa1!`);
  await service.from("users").upsert({ id: owner.id, member_type: "company" });
  const { data: org } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Int ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  await service.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: owner.id,
    role: "company_owner",
  });

  const mkTxn = async (periodKey, status, net, rate, vat) => {
    const { data: t } = await service
      .from("accounting_transactions")
      .insert({
        org_id: org.id,
        type: "sale",
        status,
        txn_date: "2026-02-01",
        period_key: periodKey,
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
    return t.id;
  };

  await mkTxn("2026-Q1", "confirmed", 100, 10, 10);
  await mkTxn("2026-Q1", "draft", 999, 10, 99);
  await mkTxn("2026-Q2", "confirmed", 200, 5, 10);

  const linesQ1 = await loadConfirmedLinesForTest(service, org.id, "2026-Q1");
  const { a, b, payload } = draftComputeFromLines(linesQ1);
  record("draft_lines_loaded", linesQ1.length === 1);
  record("recompute_idempotent", JSON.stringify(a) === JSON.stringify(b));
  const f = a.fields;
  record("q1_agg_33_only_confirmed", f["33"]?.value === "10");
  record("q1_has_txn_ids", Array.isArray(f["33"]?.txn_ids) && f["33"].txn_ids.length === 1);
  record("agg_payload_35", payload.fields["35"].value === 10n);

  const linesQ2 = await loadConfirmedLinesForTest(service, org.id, "2026-Q2");
  record(
    "quarter_boundary_period_keys",
    linesQ1.length === 1 && linesQ2.length === 1 && linesQ1[0].txn_id !== linesQ2[0].txn_id
  );
}

async function main() {
  unitPackCaseA();
  unitPackCaseB();
  unitAggregateMixed();
  unitIdempotent();

  const { url, anonKey, serviceKey } = getLocalSupabaseEnv();
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const probe = await service.from("accounting_public_holidays").select("id").limit(1);
  if (probe.error?.code === "42P01" || probe.error?.code === "PGRST205") {
    execSync("npx supabase db reset --local --no-seed", { cwd: repoRoot, stdio: "inherit" });
  }
  await unitDeadlines(service);
  await integrationDraft(service);
  await securityRls(url, anonKey, serviceKey);

  console.log(JSON.stringify({ pass: results.pass, fail: results.fail, cases: results.cases }));
  if (results.fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
