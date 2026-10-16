/**
 * P7-2a — member_type server + duplicate org block (local Supabase).
 */
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { parseCompanySignupProfile } from "../../src/lib/accounting/companySignup.ts";

const repoRoot = process.cwd();
function st() {
  const out = {};
  for (const line of execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const env = st();
const svc = createClient(env.API_URL, env.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let fail = 0;
function assert(n, ok) {
  if (!ok) {
    fail++;
    console.error(`FAIL ${n}`);
  } else console.log(`PASS ${n}`);
}

const email = `p72a-${Date.now()}@test.vfbcai.local`;
const password = "Test-P72a-1!Aa";
const { data: created, error: cErr } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
if (cErr) throw cErr;
const userId = created.user.id;
await svc.from("users").insert({ id: userId, email, member_type: "company", password_set: true });

const profile = parseCompanySignupProfile({
  companyCategory: "operating",
  companyName: "P72A Test Co",
  jobPosition: "ceo",
});
if (!profile.ok) throw new Error("profile");

const { provisionCompanyMemberSignup } = await import("../../src/lib/accounting/provisionCompanyMemberSignup.ts");
await provisionCompanyMemberSignup(svc, userId, profile.profile);
let dupOk = false;
try {
  await provisionCompanyMemberSignup(svc, userId, profile.profile);
} catch {
  dupOk = true;
}
assert("duplicate_org_blocked", dupOk);

await svc.from("accounting_org_members").delete().eq("user_id", userId);
const orgs = await svc.from("accounting_organizations").select("id").limit(1);
await svc.from("accounting_company_signup_profiles").delete().eq("user_id", userId);
await svc.from("users").delete().eq("id", userId);
await svc.auth.admin.deleteUser(userId);

assert("parse_profile_ok", profile.ok);
process.exit(fail > 0 ? 1 : 0);
