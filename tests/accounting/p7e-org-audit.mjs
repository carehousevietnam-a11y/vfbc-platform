/**
 * P7e — accounting_organizations audit_log (local Supabase only).
 */
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }));
const url = st.API_URL;
const anon = st.ANON_KEY;
const service = createClient(url, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

execSync("npx supabase db push --local", { cwd: repoRoot, stdio: "pipe" });

const tag = `p7e-${Date.now()}`;
const password = "Test-P7e-Audit-1!";

async function signIn(email) {
  const boot = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await boot.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
}

const results = { pass: 0, fail: 0 };
function record(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (ok) results.pass += 1;
  else results.fail += 1;
}

const sensitiveName = `P7e Sensitive Co ${tag} secret@mail.test 09011112222`;

const { data: ownerAuth } = await service.auth.admin.createUser({
  email: `${tag}-owner@test.vfbcai.local`,
  password,
  email_confirm: true,
});
const { data: expertAuth } = await service.auth.admin.createUser({
  email: `${tag}-expert@test.vfbcai.local`,
  password,
  email_confirm: true,
});
await service.from("users").upsert(
  [{ id: ownerAuth.user.id, member_type: "company" }, { id: expertAuth.user.id, member_type: "company" }],
  { onConflict: "id" },
);

const { data: org } = await service
  .from("accounting_organizations")
  .insert({ name_official: sensitiveName, approval_status: "pending" })
  .select("id")
  .single();

await service.from("accounting_org_members").insert([
  { org_id: org.id, user_id: ownerAuth.user.id, role: "company_owner" },
  { org_id: org.id, user_id: expertAuth.user.id, role: "vnk_expert" },
]);

const { data: createRows } = await service
  .from("accounting_audit_log")
  .select("actor, action, entity, entity_id, before_hash, after_hash, org_id")
  .eq("entity", "accounting_organizations")
  .eq("entity_id", org.id)
  .eq("action", "INSERT");

record(
  "org_create_audit",
  (createRows ?? []).length === 1 &&
    createRows[0].entity_id === org.id &&
    createRows[0].org_id === org.id &&
    Boolean(createRows[0].after_hash) &&
    !createRows[0].before_hash,
  `rows=${(createRows ?? []).length}`,
);

const expertClient = await signIn(`${tag}-expert@test.vfbcai.local`);
const { error: approveErr } = await expertClient
  .from("accounting_organizations")
  .update({ approval_status: "approved" })
  .eq("id", org.id);
if (approveErr) throw approveErr;

const { data: updateRows } = await service
  .from("accounting_audit_log")
  .select("actor, action, entity, entity_id, before_hash, after_hash, org_id")
  .eq("entity", "accounting_organizations")
  .eq("entity_id", org.id)
  .eq("action", "UPDATE");

record(
  "org_approve_audit",
  (updateRows ?? []).length === 1 &&
    updateRows[0].entity_id === org.id &&
    updateRows[0].actor === expertAuth.user.id &&
    Boolean(updateRows[0].before_hash) &&
    Boolean(updateRows[0].after_hash),
  `rows=${(updateRows ?? []).length}`,
);

const { data: allOrgAudit } = await service
  .from("accounting_audit_log")
  .select("actor, action, entity, entity_id, before_hash, after_hash, org_id")
  .eq("entity_id", org.id);

const json = JSON.stringify(allOrgAudit ?? []);
const noPlainPii =
  !json.includes(sensitiveName) &&
  !json.includes("09011112222") &&
  !json.includes("secret@mail.test") &&
  (allOrgAudit ?? []).every(
    (r) =>
      typeof r.entity_id === "string" &&
      (r.before_hash == null || /^[a-f0-9]{32}$/i.test(r.before_hash)) &&
      (r.after_hash == null || /^[a-f0-9]{32}$/i.test(r.after_hash)),
  );
record("audit_no_plain_pii", noPlainPii, noPlainPii ? "hash+id only" : "plaintext leak");

process.exit(results.fail > 0 ? 1 : 0);
