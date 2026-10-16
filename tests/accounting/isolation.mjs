/**
 * Accounting P1 isolation tests — local Supabase by default (never applies migration to prod URL).
 * Set ACCOUNTING_TEST_LOCAL=0 only to use NEXT_PUBLIC_SUPABASE_URL from .env.local (schema must exist).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUSINESS_MEMBER_TYPE = "company";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim().replace(/^\uFEFF/, "");
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
  return true;
}

function stripBomFromEnvLocal() {
  const envPath = path.join(repoRoot, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath);
  if (raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    fs.writeFileSync(envPath, raw.subarray(3));
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

function getLocalSupabaseEnv() {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  if (!st.API_URL || !st.ANON_KEY || !st.SERVICE_ROLE_KEY || !st.DB_URL) {
    throw new Error("local supabase status incomplete — run: npx supabase start");
  }
  return {
    url: st.API_URL,
    anonKey: st.ANON_KEY,
    serviceKey: st.SERVICE_ROLE_KEY,
    dbUrl: st.DB_URL,
  };
}

loadEnvFile(path.join(repoRoot, ".env.local"));

const useLocal = process.env.ACCOUNTING_TEST_LOCAL !== "0";
let url;
let anonKey;
let serviceKey;
let dbUrl;

if (useLocal) {
  stripBomFromEnvLocal();
  const local = getLocalSupabaseEnv();
  url = local.url;
  anonKey = local.anonKey;
  serviceKey = local.serviceKey;
  dbUrl = local.dbUrl;
} else {
  url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  dbUrl = process.env.SUPABASE_DB_URL;
}

const results = { pass: 0, fail: 0, skipped: 0, cases: [] };

function record(name, ok, detail) {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

async function schemaReady(service) {
  const { error } = await service.from("accounting_organizations").select("id").limit(1);
  if (!error) return true;
  if (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist/i.test(error.message) ||
    /schema cache/i.test(error.message)
  ) {
    return false;
  }
  throw new Error(`schema probe failed: ${error.message}`);
}

async function ensureSchema(service) {
  if (await schemaReady(service)) return;
  if (!useLocal) {
    throw new Error(
      "accounting schema missing — use local supabase (ACCOUNTING_TEST_LOCAL=1) or apply migrations on test DB"
    );
  }
  execSync("npx supabase db reset --local --no-seed", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (!(await schemaReady(service))) {
    throw new Error("schema still missing after supabase db reset --local");
  }
  record("local_migration_apply", true, "supabase migrations (prereq users + accounting P1)");
}

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user;
}

async function signIn(baseUrl, baseAnon, email, password) {
  const client = createClient(baseUrl, baseAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return createClient(baseUrl, baseAnon, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  record("member_type_company_allowed", true, "CHECK personal|company (live_schema_snapshot)");

  if (!url || !anonKey || !serviceKey) {
    record("supabase_env", false, "missing url/keys");
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    await ensureSchema(service);
  } catch (e) {
    record("ensure_schema", false, e.message);
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  const tag = `p1-${Date.now()}`;
  const passwords = { all: `Test-${tag}-Aa1!` };

  const users = {
    aOwner: await createAuthUser(service, `${tag}-a-owner@test.vfbcai.local`, passwords.all),
    aMember: await createAuthUser(service, `${tag}-a-member@test.vfbcai.local`, passwords.all),
    aExpert: await createAuthUser(service, `${tag}-a-expert@test.vfbcai.local`, passwords.all),
    bOwner: await createAuthUser(service, `${tag}-b-owner@test.vfbcai.local`, passwords.all),
    personal: await createAuthUser(service, `${tag}-personal@test.vfbcai.local`, passwords.all),
  };

  const upsertUsersRow = async (id, member_type) => {
    const { error } = await service.from("users").upsert({ id, member_type }, { onConflict: "id" });
    if (error) throw new Error(`users upsert ${member_type}: ${error.message}`);
  };

  await upsertUsersRow(users.aOwner.id, BUSINESS_MEMBER_TYPE);
  await upsertUsersRow(users.aMember.id, BUSINESS_MEMBER_TYPE);
  await upsertUsersRow(users.aExpert.id, BUSINESS_MEMBER_TYPE);
  await upsertUsersRow(users.bOwner.id, BUSINESS_MEMBER_TYPE);
  await upsertUsersRow(users.personal.id, "personal");

  const { data: orgA, error: orgAErr } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Org A ${tag}`, approval_status: "pending" })
    .select("id, approval_status")
    .single();
  if (orgAErr) throw orgAErr;

  const { data: orgB, error: orgBErr } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Org B ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  if (orgBErr) throw orgBErr;

  const members = [
    { org_id: orgA.id, user_id: users.aOwner.id, role: "company_owner" },
    { org_id: orgA.id, user_id: users.aMember.id, role: "company_member" },
    { org_id: orgA.id, user_id: users.aExpert.id, role: "vnk_expert" },
    { org_id: orgB.id, user_id: users.bOwner.id, role: "company_owner" },
  ];
  const { error: memErr } = await service.from("accounting_org_members").insert(members);
  if (memErr) throw memErr;

  const clientAOwner = await signIn(url, anonKey, `${tag}-a-owner@test.vfbcai.local`, passwords.all);
  const clientAMember = await signIn(url, anonKey, `${tag}-a-member@test.vfbcai.local`, passwords.all);
  const clientAExpert = await signIn(url, anonKey, `${tag}-a-expert@test.vfbcai.local`, passwords.all);
  const clientBOwner = await signIn(url, anonKey, `${tag}-b-owner@test.vfbcai.local`, passwords.all);
  const clientPersonal = await signIn(url, anonKey, `${tag}-personal@test.vfbcai.local`, passwords.all);
  const clientAnon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const pendingOrgRead = await clientAMember
    .from("accounting_organizations")
    .select("id, approval_status")
    .eq("id", orgA.id)
    .single();
  record(
    "pending_org_metadata_readable",
    !pendingOrgRead.error && pendingOrgRead.data?.approval_status === "pending",
    pendingOrgRead.error?.message
  );

  const { data: txnSeed, error: txnSeedErr } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "expense",
      status: "draft",
      txn_date: "2026-10-01",
      period_key: "2026-10",
      amount_vnd: 1000,
      created_by: users.aOwner.id,
    })
    .select("id")
    .single();
  if (txnSeedErr) throw txnSeedErr;

  const pendingTxnRead = await clientAMember
    .from("accounting_transactions")
    .select("id")
    .eq("id", txnSeed.id);
  record(
    "pending_org_txn_read_blocked",
    (pendingTxnRead.data ?? []).length === 0,
    pendingTxnRead.error?.message
  );

  const ownerRejectTry = await clientAOwner
    .from("accounting_organizations")
    .update({ approval_status: "approved" })
    .eq("id", orgA.id);
  record(
    "customer_cannot_approve_org",
    Boolean(ownerRejectTry.error),
    ownerRejectTry.error?.message ?? "owner changed approval_status"
  );

  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const pendingStorageUp = await clientAMember.storage
    .from("accounting_evidence")
    .upload(`${orgA.id}/pending-only/proof.png`, tinyPng, {
      contentType: "image/png",
      upsert: true,
    });
  record(
    "pending_org_storage_upload_blocked",
    Boolean(pendingStorageUp.error),
    pendingStorageUp.error?.message ?? "uploaded while pending"
  );

  const expertApprove = await clientAExpert
    .from("accounting_organizations")
    .update({ approval_status: "approved" })
    .eq("id", orgA.id);
  record("vnk_expert_can_approve_org", !expertApprove.error, expertApprove.error?.message);

  const { error: assignErr } = await service.from("accounting_expert_assignments").insert({
    expert_user_id: users.aExpert.id,
    org_id: orgA.id,
    assigned_by: users.aExpert.id,
  });
  if (assignErr) throw assignErr;

  const { data: txnA, error: txnAErr } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "expense",
      status: "draft",
      txn_date: "2026-10-01",
      period_key: "2026-10",
      amount_vnd: 1000,
      created_by: users.aOwner.id,
    })
    .select("id")
    .single();
  if (txnAErr) throw txnAErr;

  const approvedTxnRead = await clientAMember.from("accounting_transactions").select("id").eq("id", txnA.id);
  record(
    "approved_org_txn_readable",
    (approvedTxnRead.data ?? []).length >= 1,
    approvedTxnRead.error?.message
  );

  const { data: txnConfirmed, error: txnCErr } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "sale",
      status: "confirmed",
      txn_date: "2026-10-02",
      period_key: "2026-10",
      amount_vnd: 2000,
      created_by: users.aOwner.id,
      confirmed_by: users.aOwner.id,
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (txnCErr) throw txnCErr;

  const bReadsA = await clientBOwner.from("accounting_transactions").select("id").eq("id", txnA.id);
  record("cross_org_read_blocked", (bReadsA.data ?? []).length === 0 && !bReadsA.error, bReadsA.error?.message);

  const bWritesA = await clientBOwner.from("accounting_transactions").insert({
    org_id: orgA.id,
    type: "expense",
    status: "draft",
    txn_date: "2026-10-03",
    period_key: "2026-10",
    amount_vnd: 1,
  });
  record(
    "cross_org_write_blocked",
    Boolean(bWritesA.error),
    bWritesA.error?.message ?? "unexpected insert success"
  );

  const personalRead = await clientPersonal.from("accounting_transactions").select("id").eq("org_id", orgA.id);
  record(
    "personal_member_read_blocked",
    (personalRead.data ?? []).length === 0,
    personalRead.error?.message
  );

  const anonRead = await clientAnon.from("accounting_transactions").select("id").limit(1);
  record("anon_read_blocked", (anonRead.data ?? []).length === 0, anonRead.error?.message);

  const memberConfirm = await clientAMember
    .from("accounting_transactions")
    .update({ status: "confirmed" })
    .eq("id", txnA.id);
  const afterMemberConfirm = await clientAMember
    .from("accounting_transactions")
    .select("status")
    .eq("id", txnA.id)
    .single();
  record(
    "member_cannot_confirm",
    Boolean(memberConfirm.error) || afterMemberConfirm.data?.status !== "confirmed",
    memberConfirm.error?.message ?? afterMemberConfirm.data?.status
  );

  await seedTestPostingRule(service, "expense");

  const ownerConfirm = await clientAOwner.rpc("accounting_confirm_transaction", {
    p_txn_id: txnA.id,
  });
  record("owner_can_confirm", !ownerConfirm.error, ownerConfirm.error?.message);

  const expertRead = await clientAExpert.from("accounting_transactions").select("id").eq("id", txnConfirmed.id);
  record("expert_read_ok", (expertRead.data ?? []).length === 1, expertRead.error?.message);

  const expertInsertTxn = await clientAExpert.from("accounting_transactions").insert({
    org_id: orgA.id,
    type: "expense",
    status: "draft",
    txn_date: "2026-10-04",
    period_key: "2026-10",
    amount_vnd: 5,
  });
  record("expert_cannot_insert_txn", Boolean(expertInsertTxn.error), expertInsertTxn.error?.message);

  const expertComment = await clientAExpert.from("accounting_review_comments").insert({
    org_id: orgA.id,
    target_type: "transaction",
    target_id: txnConfirmed.id,
    author_id: users.aExpert.id,
    status: "open",
  });
  record("expert_can_comment", !expertComment.error, expertComment.error?.message);

  await service.from("accounting_review_comments").insert({
    org_id: orgA.id,
    target_type: "transaction",
    target_id: txnConfirmed.id,
    author_id: users.aOwner.id,
    kind: "comment",
    status: "open",
  });

  const { data: corrA, error: corrAErr } = await service
    .from("accounting_review_comments")
    .insert({
      org_id: orgA.id,
      target_type: "transaction",
      target_id: txnConfirmed.id,
      author_id: users.aMember.id,
      kind: "correction_request",
      status: "open",
      correction_payload: { amount_vnd: 1500 },
    })
    .select("id")
    .single();
  if (corrAErr) throw corrAErr;

  const { data: txnB, error: txnBErr } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgB.id,
      type: "expense",
      status: "confirmed",
      txn_date: "2026-10-05",
      period_key: "2026-10",
      amount_vnd: 50,
      created_by: users.bOwner.id,
      confirmed_at: new Date().toISOString(),
      confirmed_by: users.bOwner.id,
    })
    .select("id")
    .single();
  if (txnBErr) throw txnBErr;

  await service.from("accounting_review_comments").insert({
    org_id: orgB.id,
    target_type: "transaction",
    target_id: txnB.id,
    author_id: users.bOwner.id,
    kind: "comment",
    status: "open",
  });

  const bOwnerReadAComments = await clientBOwner
    .from("accounting_review_comments")
    .select("id")
    .eq("org_id", orgA.id);
  const aMemberReadBComments = await clientAMember
    .from("accounting_review_comments")
    .select("id")
    .eq("org_id", orgB.id);
  record(
    "cross_org_comment_read_blocked",
    (bOwnerReadAComments.data ?? []).length === 0 && (aMemberReadBComments.data ?? []).length === 0,
    `b=${(bOwnerReadAComments.data ?? []).length} m=${(aMemberReadBComments.data ?? []).length}`
  );

  const bOwnerWriteComment = await clientBOwner.from("accounting_review_comments").insert({
    org_id: orgA.id,
    target_type: "transaction",
    target_id: txnConfirmed.id,
    author_id: users.bOwner.id,
    kind: "comment",
    status: "open",
  });
  record(
    "cross_org_comment_write_blocked",
    Boolean(bOwnerWriteComment.error),
    bOwnerWriteComment.error?.message ?? "inserted"
  );

  const { data: corrB, error: corrBErr } = await service
    .from("accounting_review_comments")
    .insert({
      org_id: orgB.id,
      target_type: "transaction",
      target_id: txnB.id,
      author_id: users.bOwner.id,
      kind: "correction_request",
      status: "open",
      correction_payload: { amount_vnd: 99 },
    })
    .select("id")
    .single();
  if (corrBErr) throw corrBErr;

  const bOwnerReadCorrA = await clientBOwner
    .from("accounting_review_comments")
    .select("id")
    .eq("id", corrA.id);
  const aMemberReadCorrB = await clientAMember
    .from("accounting_review_comments")
    .select("id")
    .eq("id", corrB.id);
  record(
    "cross_org_correction_read_blocked",
    (bOwnerReadCorrA.data ?? []).length === 0 && (aMemberReadCorrB.data ?? []).length === 0,
    `bA=${(bOwnerReadCorrA.data ?? []).length} mB=${(aMemberReadCorrB.data ?? []).length}`
  );

  const bOwnerWriteCorr = await clientBOwner.from("accounting_review_comments").insert({
    org_id: orgA.id,
    target_type: "transaction",
    target_id: txnConfirmed.id,
    author_id: users.bOwner.id,
    kind: "correction_request",
    status: "open",
    correction_payload: { amount_vnd: 100 },
  });
  const aMemberWriteCorr = await clientAMember.from("accounting_review_comments").insert({
    org_id: orgB.id,
    target_type: "transaction",
    target_id: txnB.id,
    author_id: users.aMember.id,
    kind: "correction_request",
    status: "open",
    correction_payload: { amount_vnd: 100 },
  });
  record(
    "cross_org_correction_write_blocked",
    Boolean(bOwnerWriteCorr.error) && Boolean(aMemberWriteCorr.error),
    [bOwnerWriteCorr.error?.message, aMemberWriteCorr.error?.message].filter(Boolean).join("; ") || "inserted"
  );

  const ownerUpdateConfirmed = await clientAOwner
    .from("accounting_transactions")
    .update({ amount_vnd: 9999 })
    .eq("id", txnConfirmed.id)
    .select("amount_vnd");
  record(
    "confirmed_txn_update_blocked",
    Boolean(ownerUpdateConfirmed.error) || (ownerUpdateConfirmed.data ?? []).length === 0,
    ownerUpdateConfirmed.error?.message ?? "row updated"
  );

  const ownerDeleteConfirmed = await clientAOwner
    .from("accounting_transactions")
    .delete()
    .eq("id", txnConfirmed.id)
    .select("id");
  record(
    "confirmed_txn_delete_blocked",
    Boolean(ownerDeleteConfirmed.error) || (ownerDeleteConfirmed.data ?? []).length === 0,
    ownerDeleteConfirmed.error?.message ?? "row deleted"
  );

  const { data: auditRows } = await clientAOwner
    .from("accounting_audit_log")
    .select("id")
    .eq("org_id", orgA.id)
    .limit(1);
  if (auditRows?.length) {
    const auditId = auditRows[0].id;
    const auditUpdate = await clientAOwner
      .from("accounting_audit_log")
      .update({ action: "hack" })
      .eq("id", auditId)
      .select("id");
    record(
      "audit_update_blocked",
      Boolean(auditUpdate.error) || (auditUpdate.data ?? []).length === 0,
      auditUpdate.error?.message ?? "row updated"
    );
    const auditDelete = await clientAOwner
      .from("accounting_audit_log")
      .delete()
      .eq("id", auditId)
      .select("id");
    record(
      "audit_delete_blocked",
      Boolean(auditDelete.error) || (auditDelete.data ?? []).length === 0,
      auditDelete.error?.message ?? "row deleted"
    );
  } else {
    record("audit_rows_present", false, "no audit rows after txn ops");
  }

  await service
    .from("accounting_organizations")
    .update({ vat_period: "month", vat_method: "deduction" })
    .in("id", [orgA.id, orgB.id]);

  const { data: txnHomeB, error: txnHomeBErr } = await service
    .from("accounting_transactions")
    .insert({
      org_id: orgB.id,
      type: "expense",
      status: "confirmed",
      txn_date: "2026-10-20",
      period_key: "2026-10",
      amount_vnd: 7777000,
      created_by: users.bOwner.id,
      confirmed_at: new Date().toISOString(),
      confirmed_by: users.bOwner.id,
    })
    .select("id")
    .single();
  if (txnHomeBErr) throw txnHomeBErr;

  await service.from("accounting_declarations").insert({
    org_id: orgA.id,
    form_code: "01/GTGT",
    period_key: "2026-11",
    status: "drafting",
    due_date: null,
  });
  await service.from("accounting_declarations").insert({
    org_id: orgB.id,
    form_code: "01/GTGT",
    period_key: "2026-12",
    status: "expert_review",
  });

  const { loadAccountingHomeSnapshot } = await import("../../src/lib/accounting/accountingHomeData.ts");
  const snapHomeA = await loadAccountingHomeSnapshot(clientAOwner, orgA.id, "company_owner");
  const snapHomeB = await loadAccountingHomeSnapshot(clientBOwner, orgB.id, "company_owner");
  const snapHomeMember = await loadAccountingHomeSnapshot(clientAMember, orgA.id, "company_member");

  record(
    "home_cross_org_a_no_b_amount",
    !snapHomeA.recentTxns.some((t) => t.amountVnd === 7777000),
    `recent=${snapHomeA.recentTxns.length}`
  );
  record(
    "home_cross_org_b_no_a_period",
    !snapHomeB.schedule.some((s) => s.periodKey === "2026-11") &&
      !snapHomeB.inProgress.some((p) => p.periodKey === "2026-11"),
    `sched=${snapHomeB.schedule.length}`
  );
  record(
    "home_member_declarations_skipped",
    !snapHomeMember.showDeclarations &&
      snapHomeMember.schedule.length === 0 &&
      snapHomeMember.inProgress.length === 0,
    `show=${snapHomeMember.showDeclarations}`
  );
  record(
    "home_owner_unverified_due",
    snapHomeA.schedule.some((s) => s.periodKey === "2026-11" && s.dueUnverified === true),
    snapHomeA.schedule.map((s) => s.periodKey).join(",")
  );

  await service.from("accounting_declarations").delete().eq("org_id", orgA.id).eq("period_key", "2026-11");
  await service.from("accounting_declarations").delete().eq("org_id", orgB.id).eq("period_key", "2026-12");
  await service.from("accounting_transactions").delete().eq("id", txnHomeB.id);

  const pathA = `${orgA.id}/${txnA.id}/proof.png`;
  const pathB = `${orgB.id}/${txnA.id}/proof.png`;

  const upA = await clientAMember.storage.from("accounting_evidence").upload(pathA, tinyPng, {
    contentType: "image/png",
    upsert: true,
  });
  record("storage_member_upload_approved_org", !upA.error, upA.error?.message);

  const crossDl = await clientBOwner.storage.from("accounting_evidence").download(pathA);
  record("storage_cross_org_download_blocked", Boolean(crossDl.error), crossDl.error?.message ?? "downloaded");

  const anonUp = await clientAnon.storage.from("accounting_evidence").upload(pathB, tinyPng, {
    contentType: "image/png",
  });
  record("storage_anon_upload_blocked", Boolean(anonUp.error), anonUp.error?.message ?? "uploaded");

  const anonDl = await clientAnon.storage.from("accounting_evidence").download(pathA);
  record("storage_anon_download_blocked", Boolean(anonDl.error), anonDl.error?.message ?? "downloaded");

  await service.storage.from("accounting_evidence").remove([pathA]);
  await service
    .from("accounting_transactions")
    .delete()
    .in("id", [txnA.id, txnConfirmed.id, txnSeed.id, txnB.id]);
  await service.from("accounting_org_members").delete().eq("org_id", orgA.id);
  await service.from("accounting_org_members").delete().eq("org_id", orgB.id);
  await service.from("accounting_organizations").delete().in("id", [orgA.id, orgB.id]);
  for (const u of Object.values(users)) {
    await service.auth.admin.deleteUser(u.id);
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
