/**
 * Local Supabase harness for pre-signup document retention.
 * Run: npx tsx tests/security/pre-signup-document-purge.harness.ts
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execSync } from "child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
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
}

function parseSupabaseStatusEnv(stdout: string) {
  const out: Record<string, string> = {};
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
  if (!st.API_URL || !st.SERVICE_ROLE_KEY || !st.DB_URL) {
    throw new Error("local supabase status incomplete — run: npx supabase start");
  }
  return { url: st.API_URL, serviceKey: st.SERVICE_ROLE_KEY, dbUrl: st.DB_URL };
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

function tinyPng() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

function applyHarnessBootstrapSql(dbUrl: string) {
  const bootstrapPath = path.join(repoRoot, "tests/security/bootstrap-local-platform.sql");
  const sql = fs.readFileSync(bootstrapPath, "utf8");
  const statements = sql
    .split(";")
    .map((chunk) => chunk.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vfbcai-purge-bootstrap-"));
  try {
    for (let i = 0; i < statements.length; i++) {
      const file = path.join(tmpDir, `stmt-${i}.sql`);
      fs.writeFileSync(file, `${statements[i]};`, "utf8");
      execSync(
        `npx supabase db query --db-url ${JSON.stringify(dbUrl)} --file ${JSON.stringify(file)}`,
        { cwd: repoRoot, stdio: "pipe" },
      );
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function importCronGet() {
  const routePath = path.join(repoRoot, "src/app/api/cron/purge-pre-signup-documents/route.ts");
  const mod = await import(`${pathToFileURL(routePath).href}?cron=${Date.now()}`);
  return mod.GET as (req: NextRequest) => Promise<Response>;
}

function cronRequest(authorization?: string) {
  const headers = new Headers();
  if (authorization) headers.set("authorization", authorization);
  return new NextRequest("http://localhost/api/cron/purge-pre-signup-documents", { headers });
}

async function main() {
  loadEnvFile(path.join(repoRoot, ".env.local"));

  const local = getLocalSupabaseEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = local.url;
  process.env.SUPABASE_SERVICE_ROLE_KEY = local.serviceKey;

  applyHarnessBootstrapSql(local.dbUrl);

  execSync(
    `npx supabase migration repair --status reverted 20261016200100 --db-url "${local.dbUrl}"`,
    { cwd: repoRoot, stdio: "pipe" },
  );

  execSync(`npx supabase db push --db-url "${local.dbUrl}"`, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  const service: SupabaseClient = createClient(local.url, local.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { DOCUMENTS_BUCKET, runPreSignupDocumentPurge } = await import(
    "@/lib/security/preSignupDocumentRetention"
  );

  const results: { name: string; pass: boolean; detail?: string }[] = [];
  function record(name: string, pass: boolean, detail = "") {
    results.push({ name, pass, detail });
    console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  }

  async function auditLogCount() {
    const { count } = await service
      .from("audit_log")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  }

  async function insertLead(opts: { userId?: string | null; createdAt?: string }) {
  const id = crypto.randomUUID();
  const row = {
    id,
    name: "TEST 삭제대상 purge",
    phone: `090${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`,
    service_type: "verify_wp",
    source_page: "/verify/wp",
    user_id: opts.userId ?? null,
    created_at: opts.createdAt ?? new Date().toISOString(),
    display_id: `TEST-PURGE-${id.slice(0, 8)}`,
  };
  const { error } = await service.from("leads").insert(row);
  if (error) throw new Error(error.message);
    return id;
  }

  async function insertActivity(opts: {
  leadId: string;
  storagePath: string;
  createdAt: string;
}) {
  const { data, error } = await service
    .from("crm_activities")
    .insert({
      lead_id: opts.leadId,
      action: "verify_lead",
      tag: "TEST",
      meta: { storagePath: opts.storagePath, file_name: "test.png" },
      created_at: opts.createdAt,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
    return data.id as string;
  }

  async function storageExists(objectPath: string) {
  const dir = objectPath.includes("/") ? objectPath.slice(0, objectPath.lastIndexOf("/")) : "";
  const name = objectPath.includes("/") ? objectPath.slice(objectPath.lastIndexOf("/") + 1) : objectPath;
  const { data, error } = await service.storage.from(DOCUMENTS_BUCKET).list(dir, { search: name });
  if (error) return false;
    return (data ?? []).some((o) => o.name === name);
  }

  async function uploadDocuments(objectPath: string) {
  const { error } = await service.storage.from(DOCUMENTS_BUCKET).upload(objectPath, tinyPng(), {
    contentType: "image/png",
    upsert: true,
  });
    if (error) throw new Error(error.message);
  }

  const cronCanaryPath = `verify-wp/${crypto.randomUUID()}.png`;
  await uploadDocuments(cronCanaryPath);

  const auditBeforeCron = await auditLogCount();
  delete process.env.CRON_SECRET;
  const getCronUnset = await importCronGet();
  const resUnset = await getCronUnset(cronRequest());
  const auditAfterUnset = await auditLogCount();
  record(
    "cron_secret_unset_reject",
    resUnset.status === 401 &&
      (await storageExists(cronCanaryPath)) &&
      auditAfterUnset === auditBeforeCron,
    `status=${resUnset.status}`,
  );

  process.env.CRON_SECRET = "harness-purge-cron-secret";
  const getCron = await importCronGet();

  const auditBeforeNoAuth = await auditLogCount();
  const resNoAuth = await getCron(cronRequest());
  record(
    "cron_no_auth_401",
    resNoAuth.status === 401 &&
      (await storageExists(cronCanaryPath)) &&
      (await auditLogCount()) === auditBeforeNoAuth,
    `status=${resNoAuth.status}`,
  );

  const auditBeforeWrong = await auditLogCount();
  const resWrong = await getCron(cronRequest("Bearer wrong-harness-secret"));
  record(
    "cron_wrong_secret_401",
    resWrong.status === 401 &&
      (await storageExists(cronCanaryPath)) &&
      (await auditLogCount()) === auditBeforeWrong,
    `status=${resWrong.status}`,
  );

  await service.storage.from(DOCUMENTS_BUCKET).remove([cronCanaryPath]);

  async function createAuthUser() {
  const email = `purge-${crypto.randomUUID()}@test.vfbcai.local`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: "Test-Purge-Local-Only-1!",
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(error?.message ?? "createUser failed");
    return data.user.id;
  }

  const cleanupIds = { leads: [] as string[], paths: [] as string[], activities: [] as string[] };
const authUserIds: string[] = [];
let otherBucketPath = "";

try {
  const oldCutoff = daysAgo(31);
  const recent = daysAgo(5);

  const leadOldUnsigned = await insertLead({ createdAt: oldCutoff });
  cleanupIds.leads.push(leadOldUnsigned);
  const pathOldUnsigned = `verify-wp/${leadOldUnsigned}.png`;
  cleanupIds.paths.push(pathOldUnsigned);
  await uploadDocuments(pathOldUnsigned);
  const actOldUnsigned = await insertActivity({
    leadId: leadOldUnsigned,
    storagePath: pathOldUnsigned,
    createdAt: oldCutoff,
  });
  cleanupIds.activities.push(actOldUnsigned);

  const leadRecent = await insertLead({ createdAt: recent });
  cleanupIds.leads.push(leadRecent);
  const pathRecent = `verify-wp/${leadRecent}.png`;
  cleanupIds.paths.push(pathRecent);
  await uploadDocuments(pathRecent);
  await insertActivity({
    leadId: leadRecent,
    storagePath: pathRecent,
    createdAt: recent,
  });

  const signedUserId = await createAuthUser();
  authUserIds.push(signedUserId);
  const leadSigned = await insertLead({ userId: signedUserId, createdAt: oldCutoff });
  cleanupIds.leads.push(leadSigned);
  const pathSigned = `verify-wp/${leadSigned}.png`;
  cleanupIds.paths.push(pathSigned);
  await uploadDocuments(pathSigned);
  await insertActivity({
    leadId: leadSigned,
    storagePath: pathSigned,
    createdAt: oldCutoff,
  });

  const leadRetry = await insertLead({ createdAt: oldCutoff });
  cleanupIds.leads.push(leadRetry);
  const pathRetry = `verify-wp/${leadRetry}.png`;
  cleanupIds.paths.push(pathRetry);
  await uploadDocuments(pathRetry);
  const actRetry = await insertActivity({
    leadId: leadRetry,
    storagePath: pathRetry,
    createdAt: oldCutoff,
  });
  cleanupIds.activities.push(actRetry);

  otherBucketPath = `${crypto.randomUUID()}/filing/other.bin`;
  const { error: otherUpErr } = await service.storage
    .from("accounting_evidence")
    .upload(otherBucketPath, tinyPng(), { contentType: "image/png", upsert: true });
  record("accounting_evidence_seed", !otherUpErr, otherUpErr?.message ?? "");

  const failOnce = new Set([pathRetry]);
  const deleteObject = async (bucket: string, objectPath: string) => {
    if (bucket !== DOCUMENTS_BUCKET) {
      return { error: new Error("wrong bucket") };
    }
    if (failOnce.has(objectPath)) {
      failOnce.delete(objectPath);
      return { error: new Error("simulated_delete_failure") };
    }
    const { error } = await service.storage.from(bucket).remove([objectPath]);
    return { error: error ? new Error(error.message) : null };
  };

  const run1 = await runPreSignupDocumentPurge({
    client: service,
    deleteObject,
    maxItems: 100,
    now: new Date(),
  });
  record("purge_run1_failed_count", run1.failedCount >= 1, `failed=${run1.failedCount}`);

  const { data: auditRow } = await service
    .from("audit_log")
    .select("job_id, action, meta")
    .eq("job_id", run1.jobId)
    .maybeSingle();
  const meta = (auditRow?.meta ?? {}) as Record<string, unknown>;
  record(
    "audit_log_run1_row",
    auditRow?.action === "purge_unsigned_pre_signup_documents" &&
      meta.deleted_count === run1.deletedCount &&
      meta.failed_count === run1.failedCount &&
      auditRow?.job_id === run1.jobId,
    `deleted=${String(meta.deleted_count)} failed=${String(meta.failed_count)}`,
  );
  const metaJson = JSON.stringify(meta);
  record(
    "audit_log_no_paths_in_meta",
    !/verify-|document-upload|storagePath|file_name/i.test(metaJson),
    "path-like key in meta",
  );

  record("old_unsigned_deleted_after_run1", !(await storageExists(pathOldUnsigned)), "storage still present");
  record("recent_kept", await storageExists(pathRecent), "missing");
  record("signed_up_kept", await storageExists(pathSigned), "missing");
  record("retry_path_kept_after_fail", await storageExists(pathRetry), "should remain for retry");

  const { data: otherList } = await service.storage
    .from("accounting_evidence")
    .list(otherBucketPath.split("/")[0]);
  record(
    "other_bucket_untouched",
    (otherList ?? []).length >= 1,
    "accounting_evidence missing",
  );

  const bucketsTouched: string[] = [];
  const deleteObjectTrack = async (bucket: string, objectPath: string) => {
    bucketsTouched.push(bucket);
    const { error } = await service.storage.from(bucket).remove([objectPath]);
    return { error: error ? new Error(error.message) : null };
  };

  await runPreSignupDocumentPurge({
    client: service,
    deleteObject: deleteObjectTrack,
    maxItems: 100,
    now: new Date(),
  });
  record("retry_succeeds_second_run", !(await storageExists(pathRetry)), "retry path still in storage");
  record(
    "only_documents_bucket_in_deletes",
    bucketsTouched.every((b) => b === DOCUMENTS_BUCKET),
    bucketsTouched.join(","),
  );

  const { count: auditCount } = await service
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .eq("action", "purge_unsigned_pre_signup_documents");
  record("audit_log_rows", (auditCount ?? 0) >= 2, `count=${auditCount}`);
} finally {
  for (const p of cleanupIds.paths) {
    await service.storage.from(DOCUMENTS_BUCKET).remove([p]);
  }
  if (cleanupIds.activities.length) {
    await service.from("crm_activities").delete().in("id", cleanupIds.activities);
  }
  if (cleanupIds.leads.length) {
    await service.from("crm_activities").delete().in("lead_id", cleanupIds.leads);
    await service.from("leads").delete().in("id", cleanupIds.leads);
  }
  for (const uid of authUserIds) {
    await service.auth.admin.deleteUser(uid);
  }
  if (otherBucketPath) {
    await service.storage.from("accounting_evidence").remove([otherBucketPath]).catch(() => {});
  }
}

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ pass: results.length - failed.length, fail: failed.length }));
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
