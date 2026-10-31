/**
 * P7-2b org documents + approval flow (local Supabase).
 */
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const repoRoot = process.cwd();
const results = { pass: 0, fail: 0, cases: [] };
const record = (name, ok, detail = "") => {
  results.cases.push({ name, ok: Boolean(ok), detail: ok ? "" : detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
};

const st = Object.fromEntries(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^"|"$/g, "")]),
);
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const tag = `p72b-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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
  const client = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
  return { client, token: data.session.access_token };
};

const ownerA = await mk("ownerA");
const memberA = await mk("memberA");
const ownerB = await mk("ownerB");
const expert = await mk("expert");
const { data: orgA } = await service
  .from("accounting_organizations")
  .insert({ name_official: `A ${tag}`, approval_status: "pending" })
  .select("id")
  .single();
const { data: orgB } = await service
  .from("accounting_organizations")
  .insert({ name_official: `B ${tag}`, approval_status: "pending" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert([
  { org_id: orgA.id, user_id: ownerA.id, role: "company_owner" },
  { org_id: orgA.id, user_id: memberA.id, role: "company_member" },
  { org_id: orgB.id, user_id: ownerB.id, role: "company_owner" },
  { org_id: orgB.id, user_id: expert.id, role: "vnk_expert" },
]);

const { client: cOwnerA, token: ownerToken } = await signIn("ownerA");
const { client: cMemberA } = await signIn("memberA");
const { client: cOwnerB } = await signIn("ownerB");
const { client: cExpert } = await signIn("expert");

const pathA = `${orgA.id}/org-docs/business_registration/doc-a.png`;
await service.storage.from("accounting_evidence").upload(pathA, tinyPng, { contentType: "image/png", upsert: true });
const sha = createHash("sha256").update(tinyPng).digest("hex");
await service.from("accounting_org_documents").insert({
  org_id: orgA.id,
  doc_kind: "business_registration",
  storage_path: pathA,
  sha256: sha,
  mime: "image/png",
  size: tinyPng.length,
  uploaded_by: ownerA.id,
});

const crossRead = await cOwnerB.from("accounting_org_documents").select("id").eq("org_id", orgA.id);
record("p72b_cross_org_doc_read_blocked", (crossRead.data ?? []).length === 0);

const memberRead = await cMemberA.from("accounting_org_documents").select("id").eq("org_id", orgA.id);
record("p72b_member_doc_read_blocked", (memberRead.data ?? []).length === 0);

const memberUp = await cMemberA.from("accounting_org_documents").insert({
  org_id: orgA.id,
  doc_kind: "investment_registration",
  storage_path: `${orgA.id}/org-docs/investment_registration/hack.png`,
  sha256: sha,
  mime: "image/png",
  size: tinyPng.length,
  uploaded_by: memberA.id,
});
record("p72b_member_doc_upload_blocked", Boolean(memberUp.error));

const ownerApprove = await cOwnerA.from("accounting_organizations").update({ approval_status: "approved" }).eq("id", orgA.id);
record("p72b_owner_self_approve_blocked", Boolean(ownerApprove.error));

const badTransition = await cOwnerA.from("accounting_organizations").update({ approval_status: "approved" }).eq("id", orgA.id);
record("p72b_invalid_transition_blocked", Boolean(badTransition.error));

const requestNoDocs = await cOwnerB.rpc("accounting_org_request_review", { p_org_id: orgB.id });
record("p72b_request_without_docs_blocked", Boolean(requestNoDocs.error));

const pathB1 = `${orgB.id}/org-docs/business_registration/b1.png`;
const pathB2 = `${orgB.id}/org-docs/investment_registration/b2.png`;
await service.storage.from("accounting_evidence").upload(pathB1, tinyPng, { contentType: "image/png", upsert: true });
await service.storage.from("accounting_evidence").upload(pathB2, tinyPng, { contentType: "image/png", upsert: true });
await service.from("accounting_org_documents").insert([
  {
    org_id: orgB.id,
    doc_kind: "business_registration",
    storage_path: pathB1,
    sha256: sha,
    mime: "image/png",
    size: tinyPng.length,
    uploaded_by: ownerB.id,
  },
  {
    org_id: orgB.id,
    doc_kind: "investment_registration",
    storage_path: pathB2,
    sha256: sha,
    mime: "image/png",
    size: tinyPng.length,
    uploaded_by: ownerB.id,
  },
]);
const requestOk = await cOwnerB.rpc("accounting_org_request_review", { p_org_id: orgB.id });
record("p72b_owner_request_review_ok", !requestOk.error);

const ownerApproveOther = await cOwnerA
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", orgB.id)
  .select("id");
record(
  "p72b_non_expert_approve_blocked",
  Boolean(ownerApproveOther.error) || (ownerApproveOther.data ?? []).length === 0,
);

const expertApprove = await cExpert.from("accounting_organizations").update({ approval_status: "approved" }).eq("id", orgB.id);
record("p72b_expert_approve_in_review", !expertApprove.error);

const { data: signed } = await service.storage.from("accounting_evidence").createSignedUrl(pathB1, 1);
record("p72b_signed_url_issued", Boolean(signed?.signedUrl));
await new Promise((r) => setTimeout(r, 1500));
const expiredFetch = await fetch(signed.signedUrl).catch(() => null);
record("p72b_signed_url_expires", expiredFetch ? expiredFetch.status >= 400 : true);

const big = Buffer.alloc(11 * 1024 * 1024, 0);
const bigUp = await cOwnerA.storage.from("accounting_evidence").upload(`${orgA.id}/org-docs/business_registration/big.bin`, big, {
  contentType: "application/octet-stream",
});
record("p72b_oversize_upload_blocked", Boolean(bigUp.error));

const { count: auditUp } = await service
  .from("accounting_audit_log")
  .select("id", { count: "exact", head: true })
  .eq("entity", "accounting_org_documents")
  .eq("org_id", orgA.id);
record("p72b_audit_upload_logged", (auditUp ?? 0) >= 1);

console.log(JSON.stringify(results, null, 2));
process.exit(results.fail > 0 ? 1 : 0);
