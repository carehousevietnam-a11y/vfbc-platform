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
  return createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
};

const staffExpert = await mk("staff");
const owner = await mk("owner");
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
await service.from("accounting_org_members").insert({ org_id: pendingOrg.id, user_id: owner.id, role: "company_owner" });

const cStaff = await signIn("staff");
const cOwner = await signIn("owner");

const pendingList = await cStaff.from("accounting_organizations").select("id").eq("approval_status", "pending");
record("staff_sees_pending_org", (pendingList.data ?? []).some((o) => o.id === pendingOrg.id));

const ownerApprove = await cOwner
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", pendingOrg.id);
record("owner_cannot_approve_pending", Boolean(ownerApprove.error));

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

console.log(JSON.stringify(results, null, 2));
process.exit(results.fail > 0 ? 1 : 0);
