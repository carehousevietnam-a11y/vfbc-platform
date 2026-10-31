/**
 * Accounting P2-b evidence upload — local Supabase only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

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
const raw = execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
const st = parseSupabaseStatusEnv(raw);
const url = st.API_URL;
const anonKey = st.ANON_KEY;
const serviceKey = st.SERVICE_ROLE_KEY;

execSync("npx supabase migration up --local", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

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
    type: "expense",
    txnDate: "2026-10-16",
    invoiceSeries: "",
    invoiceNo: "",
    invoiceDate: "",
    currency: "VND",
    amountNet: 100000,
    vatRate: 0,
    vatAmount: 0,
    ...extra,
  };
}

async function main() {
  const { ACCOUNTING_UI } = await import("../../src/lib/accounting/uiCatalog.ts");
  const koKeys = Object.keys(ACCOUNTING_UI.ko).sort();
  const viKeys = Object.keys(ACCOUNTING_UI.vi).sort();
  record("i18n_catalog_key_parity", koKeys.join("|") === viKeys.join("|"), `ko=${koKeys.length} vi=${viKeys.length}`);

  const { seedTestPostingRule } = await import("./testPostingFixture.mjs");
  const { applyTransactionCommand } = await import("../../src/lib/accounting/transactionEntry.ts");
  const { uploadEvidence, createEvidenceSignedUrl, listEvidenceForTxn, detectEvidenceKind, EVIDENCE_MAX_BYTES } =
    await import("../../src/lib/accounting/evidenceEntry.ts");

  record("magic_reject_exe", detectEvidenceKind(Buffer.from("MZ\x90\x00")) === null);
  record("magic_accept_png", detectEvidenceKind(tinyPng) === "png");

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const tag = `p2b-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  async function makeUser(email) {
    const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error(error?.message ?? "user");
    await service.from("users").upsert({ id: data.user.id, member_type: "company" }, { onConflict: "id" });
    return data.user.id;
  }

  const ownerId = await makeUser(`${tag}-owner@evidence.test.vfbcai.local`);
  const otherId = await makeUser(`${tag}-other@evidence.test.vfbcai.local`);
  const pendingId = await makeUser(`${tag}-pending@evidence.test.vfbcai.local`);

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
  await service.from("accounting_org_members").insert([
    { org_id: orgA, user_id: ownerId, role: "company_owner" },
    { org_id: orgB, user_id: otherId, role: "company_owner" },
    { org_id: orgP, user_id: pendingId, role: "company_owner" },
  ]);
  await seedTestPostingRule(service, "expense");

  const owner = await signIn(`${tag}-owner@evidence.test.vfbcai.local`, password);
  const other = await signIn(`${tag}-other@evidence.test.vfbcai.local`, password);
  const pending = await signIn(`${tag}-pending@evidence.test.vfbcai.local`, password);
  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const draft = await applyTransactionCommand(owner.client, owner.token, saleBody("draft"), null);
  record("txn_draft", draft.ok);
  if (!draft.ok) throw new Error("draft failed");

  const pendingUpload = await uploadEvidence(
    pending.client,
    service,
    pending.token,
    draft.id,
    tinyPng,
    "image/png",
    "x.png"
  );
  record("pending_org_denied", !pendingUpload.ok && pendingUpload.error === "ORG_NOT_APPROVED");

  const anonUpload = await uploadEvidence(anon, service, "fake-token", draft.id, tinyPng, "image/png", "x.png");
  record("unauthenticated_denied", !anonUpload.ok);

  const fakePdf = Buffer.from("MZ\x90\x00fake-exe-content");
  const spoof = await uploadEvidence(
    owner.client,
    service,
    owner.token,
    draft.id,
    fakePdf,
    "application/pdf",
    "evil.pdf",
    orgB
  );
  record("extension_spoof_rejected", !spoof.ok);

  const huge = Buffer.alloc(EVIDENCE_MAX_BYTES + 1, 0);
  huge[0] = 0x89;
  huge[1] = 0x50;
  const hugeRes = await uploadEvidence(owner.client, service, owner.token, draft.id, huge, "image/png", "big.png");
  record("oversize_rejected", !hugeRes.ok && hugeRes.error === "FILE_TOO_LARGE");

  const up = await uploadEvidence(owner.client, service, owner.token, draft.id, tinyPng, "image/png", "proof.png");
  record("upload_ok", up.ok);
  if (!up.ok) throw new Error("upload failed");

  const { data: row } = await owner.client
    .from("accounting_evidence_files")
    .select("org_id, sha256, storage_path")
    .eq("id", up.id)
    .single();
  record("sha256_stored", row?.sha256 === up.sha256);
  record("spoof_org_ignored", row?.org_id === orgA);

  const otherSign = await createEvidenceSignedUrl(other.client, service, other.token, up.id);
  record("cross_org_sign_denied", !otherSign.ok);

  const sign = await createEvidenceSignedUrl(owner.client, service, owner.token, up.id);
  record("sign_ok", sign.ok);
  if (sign.ok) {
    const live = await fetch(sign.url);
    record("signed_url_fetch_ok", live.ok);
  }

  const short = await service.storage.from("accounting_evidence").createSignedUrl(row.storage_path, 1);
  if (short.data?.signedUrl) {
    await new Promise((r) => setTimeout(r, 2000));
    const expired = await fetch(short.data.signedUrl);
    record("signed_url_expires", expired.status === 400 || expired.status === 403 || !expired.ok);
  } else {
    record("signed_url_expires", false, "no short url");
  }

  const publicUrl = `${url}/storage/v1/object/public/accounting_evidence/${row.storage_path}`;
  const publicRes = await fetch(publicUrl);
  record("public_bucket_blocked", publicRes.status === 400 || publicRes.status === 403 || !publicRes.ok);

  const del = await owner.client.from("accounting_evidence_files").delete().eq("id", up.id);
  record("evidence_delete_blocked", Boolean(del.error));

  const submitted = await applyTransactionCommand(owner.client, owner.token, saleBody("submit"), draft.id);
  const confirmed = await applyTransactionCommand(owner.client, owner.token, saleBody("confirm"), draft.id);
  record("confirm_for_flow", submitted.ok && confirmed.ok);
  const upConfirmed = await uploadEvidence(
    owner.client,
    service,
    owner.token,
    draft.id,
    tinyPng,
    "image/png",
    "after-confirm.png"
  );
  record("confirmed_txn_upload_ok", upConfirmed.ok);

  const list = await listEvidenceForTxn(owner.client, owner.token, draft.id);
  record("list_count", list.ok && list.items.length >= 2);

  const { count } = await owner.client
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity_id", up.id)
    .eq("entity", "accounting_evidence_files");
  record("audit_present", (count ?? 0) >= 1);

  console.log(JSON.stringify(results, null, 2));
  if (results.fail > 0) process.exit(1);
}

main().catch((error) => {
  record("harness", false, error instanceof Error ? error.message : "failed");
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
