/**
 * Accounting P1 isolation tests (RLS + storage + immutability).
 * Requires migration 20261016010000_accounting_p1.sql applied on the target DB.
 * Optional: SUPABASE_DB_URL + ACCOUNTING_P1_APPLY_MIGRATION=1 to apply migration via pg (branch/local only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const migrationPath = path.join(
  repoRoot,
  "supabase/migrations/20261016010000_accounting_p1.sql"
);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
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

loadEnvFile(path.join(repoRoot, ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.SUPABASE_DB_URL;

const results = { pass: 0, fail: 0, skipped: 0, cases: [] };

function record(name, ok, detail) {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

function skip(name, detail) {
  results.cases.push({ name, ok: null, detail });
  results.skipped += 1;
}

async function maybeApplyMigration() {
  if (process.env.ACCOUNTING_P1_APPLY_MIGRATION !== "1" || !dbUrl) return false;
  let pg;
  try {
    pg = await import("pg");
  } catch {
    throw new Error("pg package required when ACCOUNTING_P1_APPLY_MIGRATION=1");
  }
  const sql = fs.readFileSync(migrationPath, "utf8");
  const client = new pg.default.Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
  return true;
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

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user;
}

async function signIn(url, anonKey, email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  if (!url || !anonKey || !serviceKey) {
    console.error(JSON.stringify({ error: "missing_supabase_env" }, null, 2));
    process.exit(2);
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!(await schemaReady(service))) {
    const applied = await maybeApplyMigration().catch((e) => {
      record("apply_migration", false, e.message);
      return false;
    });
    if (!applied) {
      skip(
        "suite",
        "accounting_organizations missing — apply supabase/migrations/20261016010000_accounting_p1.sql on branch/local DB (prod requires Ace approval). Set SUPABASE_DB_URL + ACCOUNTING_P1_APPLY_MIGRATION=1 to auto-apply."
      );
      console.log(JSON.stringify(results, null, 2));
      process.exit(results.fail > 0 ? 1 : 0);
    }
    if (!(await schemaReady(service))) {
      record("schema_after_apply", false, "still missing accounting_organizations");
      console.log(JSON.stringify(results, null, 2));
      process.exit(1);
    }
    record("apply_migration", true, "applied via SUPABASE_DB_URL");
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

  await upsertUsersRow(users.aOwner.id, "company");
  await upsertUsersRow(users.aMember.id, "company");
  await upsertUsersRow(users.aExpert.id, "company");
  await upsertUsersRow(users.bOwner.id, "company");
  await upsertUsersRow(users.personal.id, "personal");

  const { data: orgA, error: orgAErr } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Org A ${tag}` })
    .select("id")
    .single();
  if (orgAErr) throw orgAErr;

  const { data: orgB, error: orgBErr } = await service
    .from("accounting_organizations")
    .insert({ name_official: `Org B ${tag}` })
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

  const clientAOwner = await signIn(url, anonKey, `${tag}-a-owner@test.vfbcai.local`, passwords.all);
  const clientAMember = await signIn(url, anonKey, `${tag}-a-member@test.vfbcai.local`, passwords.all);
  const clientAExpert = await signIn(url, anonKey, `${tag}-a-expert@test.vfbcai.local`, passwords.all);
  const clientBOwner = await signIn(url, anonKey, `${tag}-b-owner@test.vfbcai.local`, passwords.all);
  const clientPersonal = await signIn(url, anonKey, `${tag}-personal@test.vfbcai.local`, passwords.all);
  const clientAnon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Cross-org read
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

  // Personal member blocked
  const personalRead = await clientPersonal.from("accounting_transactions").select("id").eq("org_id", orgA.id);
  record(
    "personal_member_read_blocked",
    (personalRead.data ?? []).length === 0,
    personalRead.error?.message
  );

  // Anon blocked
  const anonRead = await clientAnon.from("accounting_transactions").select("id").limit(1);
  record("anon_read_blocked", (anonRead.data ?? []).length === 0, anonRead.error?.message);

  // Role: member cannot confirm (owner can)
  const memberConfirm = await clientAMember
    .from("accounting_transactions")
    .update({ status: "confirmed" })
    .eq("id", txnA.id);
  record("member_cannot_confirm", Boolean(memberConfirm.error), memberConfirm.error?.message ?? "updated");

  const ownerConfirm = await clientAOwner
    .from("accounting_transactions")
    .update({ status: "confirmed", confirmed_by: users.aOwner.id, confirmed_at: new Date().toISOString() })
    .eq("id", txnA.id);
  record("owner_can_confirm", !ownerConfirm.error, ownerConfirm.error?.message);

  // Expert: read OK, insert transaction blocked
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

  // Confirmed immutability
  const ownerUpdateConfirmed = await clientAOwner
    .from("accounting_transactions")
    .update({ amount_vnd: 9999 })
    .eq("id", txnConfirmed.id);
  record(
    "confirmed_txn_update_blocked",
    Boolean(ownerUpdateConfirmed.error),
    ownerUpdateConfirmed.error?.message ?? "updated"
  );

  const ownerDeleteConfirmed = await clientAOwner
    .from("accounting_transactions")
    .delete()
    .eq("id", txnConfirmed.id);
  record(
    "confirmed_txn_delete_blocked",
    Boolean(ownerDeleteConfirmed.error),
    ownerDeleteConfirmed.error?.message ?? "deleted"
  );

  // Audit log immutability (as member of org A)
  const { data: auditRows } = await clientAOwner
    .from("accounting_audit_log")
    .select("id")
    .eq("org_id", orgA.id)
    .limit(1);
  if (auditRows?.length) {
    const auditId = auditRows[0].id;
    const auditUpdate = await clientAOwner.from("accounting_audit_log").update({ action: "hack" }).eq("id", auditId);
    record("audit_update_blocked", Boolean(auditUpdate.error), auditUpdate.error?.message ?? "updated");
    const auditDelete = await clientAOwner.from("accounting_audit_log").delete().eq("id", auditId);
    record("audit_delete_blocked", Boolean(auditDelete.error), auditDelete.error?.message ?? "deleted");
  } else {
    record("audit_rows_present", false, "no audit rows after txn ops");
  }

  // Storage isolation
  const pathA = `${orgA.id}/${txnA.id}/proof.png`;
  const pathB = `${orgB.id}/${txnA.id}/proof.png`;
  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  const upA = await clientAMember.storage.from("accounting_evidence").upload(pathA, tinyPng, {
    contentType: "image/png",
    upsert: true,
  });
  record("storage_member_upload_own_org", !upA.error, upA.error?.message);

  const crossDl = await clientBOwner.storage.from("accounting_evidence").download(pathA);
  record("storage_cross_org_download_blocked", Boolean(crossDl.error), crossDl.error?.message ?? "downloaded");

  const anonUp = await clientAnon.storage.from("accounting_evidence").upload(pathB, tinyPng, {
    contentType: "image/png",
  });
  record("storage_anon_upload_blocked", Boolean(anonUp.error), anonUp.error?.message ?? "uploaded");

  const anonDl = await clientAnon.storage.from("accounting_evidence").download(pathA);
  record("storage_anon_download_blocked", Boolean(anonDl.error), anonDl.error?.message ?? "downloaded");

  // Cleanup (service role)
  await service.storage.from("accounting_evidence").remove([pathA]);
  await service.from("accounting_transactions").delete().in("id", [txnA.id, txnConfirmed.id]);
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
