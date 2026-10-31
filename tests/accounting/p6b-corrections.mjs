/**
 * P6b: correction approve/reject, filed_manual refusal, Vietnamese confirm — local Supabase.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";
import { needsViReconfirm } from "../../src/lib/accounting/correctionEntry.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail = "") {
  results.cases.push({ name, ok: Boolean(ok), detail: ok ? "" : detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}
const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const tag = `p6b-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const mk = async (n) => {
  const { data, error } = await service.auth.admin.createUser({
    email: `${n}-${tag}@t.local`,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  await service.from("users").upsert({ id: data.user.id, member_type: "company" });
  return data.user;
};
const signIn = async (n) => {
  const boot = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await boot.auth.signInWithPassword({ email: `${n}-${tag}@t.local`, password });
  if (error) throw error;
  return createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
};

const u = {};
for (const n of ["owner", "memberko", "membervi", "expert", "expertu", "bowner"]) u[n] = await mk(n);

const { data: orgA } = await service.from("accounting_organizations").insert({ name_official: `A ${tag}`, approval_status: "approved" }).select("id").single();
const { data: orgB } = await service.from("accounting_organizations").insert({ name_official: `B ${tag}`, approval_status: "approved" }).select("id").single();
await service.from("accounting_org_members").insert([
  { org_id: orgA.id, user_id: u.owner.id, role: "company_owner" },
  { org_id: orgA.id, user_id: u.memberko.id, role: "company_member" },
  { org_id: orgA.id, user_id: u.membervi.id, role: "company_member" },
  { org_id: orgA.id, user_id: u.expert.id, role: "vnk_expert" },
  { org_id: orgA.id, user_id: u.expertu.id, role: "vnk_expert" },
  { org_id: orgB.id, user_id: u.bowner.id, role: "company_owner" },
]);
await service.from("accounting_profiles").upsert([
  { user_id: u.owner.id, locale: "vi" },
  { user_id: u.memberko.id, locale: "ko" },
  { user_id: u.membervi.id, locale: "vi" },
]);
await service.from("accounting_expert_assignments").insert({ expert_user_id: u.expert.id, org_id: orgA.id, assigned_by: u.owner.id });
await seedTestPostingRule(service, "sale");

const c = {};
for (const n of Object.keys(u)) c[n] = await signIn(n);

async function confirmedSale(period, amount, memo) {
  const { data: t } = await service
    .from("accounting_transactions")
    .insert({ org_id: orgA.id, type: "sale", status: "draft", txn_date: `${period}-10`, period_key: period, amount_vnd: amount, created_by: u.owner.id })
    .select("id")
    .single();
  await service.from("accounting_transaction_lines").insert({ txn_id: t.id, amount_net: amount / 1.1, vat_rate: 10, vat_amount: amount - amount / 1.1 });
  if (memo) {
    await service.from("accounting_i18n_texts").insert([
      { org_id: orgA.id, entity_type: "transaction", entity_id: t.id, field: "memo", lang: "ko", text: memo, status: "original", version: 1 },
      { org_id: orgA.id, entity_type: "transaction", entity_id: t.id, field: "memo", lang: "vi", text: `vi ${memo}`, status: "machine", version: 1 },
    ]);
  }
  const { error } = await c.owner.rpc("accounting_confirm_transaction", { p_txn_id: t.id });
  if (error) throw error;
  return t.id;
}
const requestCorr = (client, who, txnId, amount) =>
  client.from("accounting_review_comments").insert({
    org_id: orgA.id, target_type: "transaction", target_id: txnId, author_id: u[who].id,
    kind: "correction_request", status: "open", correction_payload: { amount_vnd: amount },
  }).select("id").single();

// ---- corrections ----
const orig = await confirmedSale("2026-10", 1_100_000, "원본 메모");
const rMember = await requestCorr(c.memberko, "memberko", orig, 900_000);
record("member_correction_insert_denied", !!rMember.error, rMember.error?.message);
const rOwner = await requestCorr(c.owner, "owner", orig, 900_000);
record("owner_can_request_correction", !rOwner.error, rOwner.error?.message);
const rExpert = await requestCorr(c.expert, "expert", orig, 800_000);
record("assigned_expert_can_request", !rExpert.error, rExpert.error?.message);
const rUnassigned = await requestCorr(c.expertu, "expertu", orig, 700_000);
record("unassigned_expert_request_denied", !!rUnassigned.error);
const rBadAmount = await requestCorr(c.owner, "owner", orig, 0);
record("request_without_amount_denied", !!rBadAmount.error);

const directResolve = await c.memberko.from("accounting_review_comments").update({ status: "resolved" }).eq("id", rOwner.data.id).select("id");
record("direct_resolve_blocked", !!directResolve.error || (directResolve.data ?? []).length === 0);

const apMember = await c.memberko.rpc("accounting_approve_correction", { p_comment_id: rOwner.data.id });
record("approve_denied_member", !!apMember.error, "");
const apExpert = await c.expert.rpc("accounting_approve_correction", { p_comment_id: rExpert.data.id });
record("approve_denied_expert", !!apExpert.error, "");
const { count: stillOpen } = await service.from("accounting_review_comments").select("id", { count: "exact", head: true }).in("id", [rOwner.data.id, rExpert.data.id]).eq("status", "open");
record("denied_requests_stay_open", stillOpen === 2);

const { data: entriesBefore } = await service.from("accounting_ledger_entries").select("account_code, debit, credit").eq("txn_id", orig);
const approve = await c.owner.rpc("accounting_approve_correction", { p_comment_id: rOwner.data.id });
record("owner_approves", !approve.error, approve.error?.message);
const newId = approve.data;
const { data: origAfter } = await service.from("accounting_transactions").select("amount_vnd, type, status, period_key").eq("id", orig).single();
record("original_txn_unchanged", Number(origAfter.amount_vnd) === 1_100_000 && origAfter.status === "confirmed" && origAfter.type === "sale");
const { data: entriesAfter } = await service.from("accounting_ledger_entries").select("account_code, debit, credit").eq("txn_id", orig);
record("original_entries_unchanged", JSON.stringify(entriesBefore) === JSON.stringify(entriesAfter));
const { data: newTxn } = await service.from("accounting_transactions").select("corrects_txn_id, status, amount_vnd").eq("id", newId).single();
record("corrects_txn_id_exact", newTxn.corrects_txn_id === orig && newTxn.status === "confirmed" && Number(newTxn.amount_vnd) === 900_000);
const { data: newEntries } = await service.from("accounting_ledger_entries").select("account_code, debit, credit").eq("txn_id", newId);
const sum = (rows, k) => rows.reduce((s, r) => s + Number(r[k]), 0);
record("new_txn_debit_eq_credit", sum(newEntries, "debit") === sum(newEntries, "credit") && newEntries.length === 4);
const reversal = entriesBefore.map((e) => newEntries.find((n) => n.account_code === e.account_code && Number(n.debit) === Number(e.credit) && Number(n.credit) === Number(e.debit)));
record("reversal_mirrors_original", reversal.every(Boolean));
const net = sum(entriesBefore, "debit") - sum(entriesBefore, "credit") + (sum(reversal.filter(Boolean), "debit") - sum(reversal.filter(Boolean), "credit"));
record("reversal_sum_zero", net === 0 && sum(reversal.filter(Boolean), "debit") === sum(reversal.filter(Boolean), "credit"));
const { data: resolvedRow } = await service.from("accounting_review_comments").select("status").eq("id", rOwner.data.id).single();
record("request_resolved_after_approve", resolvedRow.status === "resolved");
const { count: corrAudit } = await service.from("accounting_audit_log").select("id", { count: "exact", head: true }).eq("entity_id", rOwner.data.id).eq("action", "CORRECTION_APPROVE");
record("audit_correction_approve", (corrAudit ?? 0) >= 1);
const again = await c.owner.rpc("accounting_approve_correction", { p_comment_id: rExpert.data.id });
record("second_correction_of_same_txn_denied", !!again.error);

// ---- reject ----
const orig2 = await confirmedSale("2026-10", 550_000, null);
const rej = await requestCorr(c.expert, "expert", orig2, 500_000);
const rejNoReason = await c.owner.rpc("accounting_reject_correction", { p_comment_id: rej.data.id, p_reason: " ", p_lang: "ko" });
record("reject_requires_reason", !!rejNoReason.error);
const rejMember = await c.memberko.rpc("accounting_reject_correction", { p_comment_id: rej.data.id, p_reason: "x", p_lang: "ko" });
record("reject_denied_member", !!rejMember.error);
const rejOk = await c.owner.rpc("accounting_reject_correction", { p_comment_id: rej.data.id, p_reason: "금액 근거 부족", p_lang: "ko" });
const { data: rejRow } = await service.from("accounting_review_comments").select("status").eq("id", rej.data.id).single();
const { count: rejText } = await service.from("accounting_i18n_texts").select("id", { count: "exact", head: true }).eq("entity_id", rej.data.id).eq("field", "reject_reason");
record("owner_rejects_with_reason", !rejOk.error && rejRow.status === "resolved" && rejText === 1, rejOk.error?.message);

// ---- filed_manual ----
const origFiled = await confirmedSale("2026-09", 220_000, null);
await service.from("accounting_declarations").insert({ org_id: orgA.id, form_code: "01/GTGT", period_key: "2026-09", status: "filed_manual" });
const rFiled = await requestCorr(c.expert, "expert", origFiled, 200_000);
const apFiled = await c.owner.rpc("accounting_approve_correction", { p_comment_id: rFiled.data.id });
const { count: filedCorrections } = await service.from("accounting_transactions").select("id", { count: "exact", head: true }).eq("corrects_txn_id", origFiled);
record("filed_manual_correction_refused", !!apFiled.error && filedCorrections === 0, apFiled.error?.message ?? "approved");

// ---- Vietnamese confirm ----
const memoTxn = await confirmedSale("2026-10", 330_000, "베트남어 확정 메모");
const koMember = await c.memberko.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_denied_locale_ko_member", !!koMember.error);
const ownerVi = await c.owner.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_denied_owner_per_design_s3", !!ownerVi.error);
const direct = await c.membervi.from("accounting_i18n_texts").insert({
  org_id: orgA.id, entity_type: "transaction", entity_id: memoTxn, field: "memo", lang: "vi", text: "x", status: "human_verified", version: 9,
});
record("direct_human_verified_insert_blocked", !!direct.error);
const unassigned = await c.expertu.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_denied_unassigned_expert", !!unassigned.error);
const otherOrg = await c.bowner.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_denied_other_org", !!otherOrg.error);
const viOk = await c.membervi.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_ok_locale_vi_member", !viOk.error, viOk.error?.message);
const { data: viRows } = await service.from("accounting_i18n_texts").select("version, status, text, lang").eq("entity_id", memoTxn).eq("field", "memo").order("version");
const v1 = viRows.find((r) => r.lang === "vi" && r.version === 1);
const v2 = viRows.find((r) => r.lang === "vi" && r.version === 2);
const ko1 = viRows.find((r) => r.lang === "ko" && r.version === 1);
record("vi_new_version_added_v1_intact", v1?.status === "machine" && v2?.status === "human_verified" && v1.text === v2.text && ko1.text === "베트남어 확정 메모");
const upd = await c.membervi.from("accounting_i18n_texts").update({ text: "tamper" }).eq("entity_id", memoTxn).select("id");
record("i18n_update_blocked", !!upd.error || (upd.data ?? []).length === 0);
const { count: viAudit } = await service.from("accounting_audit_log").select("id", { count: "exact", head: true }).eq("action", "VI_CONFIRM").eq("org_id", orgA.id);
record("audit_vi_confirm", (viAudit ?? 0) >= 1);

const again2 = await c.membervi.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn, p_field: "memo" });
record("vi_confirm_twice_denied", !!again2.error);

await service.from("accounting_i18n_texts").insert({ org_id: orgA.id, entity_type: "transaction", entity_id: memoTxn, field: "memo", lang: "ko", text: "수정된 원문", status: "original", version: 2 });
const { data: after } = await service.from("accounting_i18n_texts").select("lang, status, version, created_at, text").eq("entity_id", memoTxn).eq("field", "memo").order("version", { ascending: false });
const koLatest = after.find((r) => r.lang === "ko");
const viLatest = after.find((r) => r.lang === "vi");
record("reconfirm_flag_when_ko_edited", needsViReconfirm(koLatest, viLatest) === true && viLatest.status === "human_verified");

// expert (assigned) confirms on another txn
const memoTxn2 = await confirmedSale("2026-10", 110_000, "전문가 확정");
const exOk = await c.expert.rpc("accounting_confirm_vi_text", { p_txn_id: memoTxn2, p_field: "memo" });
record("vi_confirm_ok_assigned_expert", !exOk.error, exOk.error?.message);

console.log(JSON.stringify({ pass: results.pass, fail: results.fail, failed: results.cases.filter((x) => !x.ok), orgA: orgA.id, memoTxn, memoTxn2, tag }));
process.exit(results.fail ? 1 : 0);
