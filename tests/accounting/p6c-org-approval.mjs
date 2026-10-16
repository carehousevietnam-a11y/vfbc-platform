/**
 * P6c: pending org visibility + staff approve + audit (local Supabase).
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
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
    .map((m) => [m[1], m[2].replace(/^"|"$/g, "")])
);
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const tag = `p6c-${Date.now()}`;
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
  const client = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
  return { client, token: data.session.access_token };
};

const staffExpert = await mk("staff");
const owner = await mk("owner");
const member = await mk("member");
const { data: staffOrg } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Staff ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert({ org_id: staffOrg.id, user_id: staffExpert.id, role: "vnk_expert" });

const { data: pendingOrg } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Pending ${tag}`, approval_status: "pending" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert([
  { org_id: pendingOrg.id, user_id: owner.id, role: "company_owner" },
  { org_id: pendingOrg.id, user_id: member.id, role: "company_member" },
]);

const { client: cStaff, token: staffToken } = await signIn("staff");
const { client: cOwner } = await signIn("owner");
const { client: cMember } = await signIn("member");

const pendingList = await cStaff.from("accounting_organizations").select("id").eq("approval_status", "pending");
record("staff_sees_pending_org", (pendingList.data ?? []).some((o) => o.id === pendingOrg.id));

const ownerApprove = await cOwner
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", pendingOrg.id);
record("owner_cannot_approve_pending", Boolean(ownerApprove.error));

const memberApprove = await cMember
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", pendingOrg.id)
  .select("id");
record(
  "member_cannot_approve_org",
  Boolean(memberApprove.error) || (memberApprove.data ?? []).length === 0,
  memberApprove.error?.message ?? "rows_updated"
);

const rejectNoReasonRes = await fetch(
  `${process.env.P6C_API_BASE || "http://localhost:3020"}/api/accounting/expert/org-approval`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({ orgId: pendingOrg.id, action: "reject" }),
  }
).catch(() => null);
record(
  "org_reject_requires_reason_api",
  rejectNoReasonRes?.status === 400,
  String(rejectNoReasonRes?.status ?? "fetch_failed")
);

const approve = await cStaff
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", pendingOrg.id);
record("staff_approves_pending", !approve.error, approve.error?.message ?? "");

const { count: auditApprove } = await service
  .from("accounting_audit_log")
  .select("id", { count: "exact", head: true })
  .eq("entity", "accounting_organizations")
  .eq("entity_id", pendingOrg.id)
  .eq("action", "UPDATE");
record("audit_org_approve", (auditApprove ?? 0) >= 1);

const { data: pendingReject } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Reject audit ${tag}`, approval_status: "pending" })
  .select("id")
  .single();
const rejectUpd = await cStaff
  .from("accounting_organizations")
  .update({ approval_status: "rejected" })
  .eq("id", pendingReject.id);
record("staff_rejects_org", !rejectUpd.error);
await cStaff.from("accounting_i18n_texts").insert({
  org_id: pendingReject.id,
  entity_type: "organization",
  entity_id: pendingReject.id,
  field: "approval_reject_reason",
  lang: "ko",
  text: "테스트 반려",
  status: "original",
  version: 1,
  created_by: staffExpert.id,
});
const { count: auditReject } = await service
  .from("accounting_audit_log")
  .select("id", { count: "exact", head: true })
  .eq("entity", "accounting_organizations")
  .eq("entity_id", pendingReject.id)
  .eq("action", "UPDATE");
record("audit_org_reject", (auditReject ?? 0) >= 1);

const { data: staffOrg2 } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Expert txn ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
await service.from("accounting_org_members").insert([
  { org_id: staffOrg2.id, user_id: staffExpert.id, role: "vnk_expert" },
  { org_id: staffOrg2.id, user_id: owner.id, role: "company_owner" },
]);
await service.from("accounting_expert_assignments").insert({
  expert_user_id: staffExpert.id,
  org_id: staffOrg2.id,
  assigned_by: owner.id,
});
const { data: txn } = await service
  .from("accounting_transactions")
  .insert({
    org_id: staffOrg2.id,
    type: "sale",
    status: "confirmed",
    txn_date: "2026-10-01",
    period_key: "2026-10",
    amount_vnd: 1000,
    created_by: owner.id,
  })
  .select("id")
  .single();
const expertTxnUp = await cStaff.from("accounting_transactions").update({ amount_vnd: 9999 }).eq("id", txn.id);
record("expert_cannot_update_confirmed_txn", Boolean(expertTxnUp.error) || (expertTxnUp.data ?? []).length === 0);

console.log(JSON.stringify(results, null, 2));
process.exit(results.fail > 0 ? 1 : 0);
