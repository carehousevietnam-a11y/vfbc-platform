/**
 * Accounting P2 — company member signup (local Supabase only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const COMPANY_SIGNUP_CHANNEL = "vfbc_company_member_v1";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
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

function resolveLeadSubmitMemberType(body) {
  const channelOk =
    typeof body.companySignupChannel === "string" &&
    body.companySignupChannel === COMPANY_SIGNUP_CHANNEL;
  const category = body.companyCategory;
  const name = body.companyName;
  const position = body.jobPosition;
  const profileOk =
    typeof category === "string" &&
    typeof name === "string" &&
    name.trim().length > 0 &&
    typeof position === "string";
  if (channelOk && profileOk) return "company";
  return "personal";
}

async function provisionCompanyMemberSignup(service, userId, profile) {
  const { error: profileError } = await service.from("accounting_company_signup_profiles").insert({
    user_id: userId,
    company_category: profile.companyCategory,
    company_category_other: profile.companyCategoryOther,
    company_name: profile.companyName,
    job_position: profile.jobPosition,
    job_position_other: profile.jobPositionOther,
  });
  if (profileError) throw new Error(profileError.message);

  if (profile.companyCategory === "prospective") {
    return { orgId: null };
  }

  const { data: org, error: orgError } = await service
    .from("accounting_organizations")
    .insert({
      name_official: profile.companyName,
      name_ko_display: profile.companyName,
      approval_status: "pending",
    })
    .select("id, approval_status")
    .single();
  if (orgError) throw orgError;

  const { error: memberError } = await service.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: userId,
    role: "company_owner",
  });
  if (memberError) throw memberError;

  return { orgId: org.id, approvalStatus: org.approval_status };
}

loadEnvFile(path.join(repoRoot, ".env.local"));

const local = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" })
);

const url = local.API_URL;
const serviceKey = local.SERVICE_ROLE_KEY;

const results = { pass: 0, fail: 0, cases: [] };

function record(name, ok, detail) {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

async function main() {
  if (!url || !serviceKey) {
    record("local_supabase", false, "missing API_URL or SERVICE_ROLE_KEY");
    console.log(JSON.stringify(results, null, 2));
    process.exit(1);
  }

  execSync("npx supabase db reset --local --no-seed", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tag = `p2-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  const { data: opUser, error: opAuthErr } = await service.auth.admin.createUser({
    email: `${tag}-op@signup.test.vfbcai.local`,
    password,
    email_confirm: true,
  });
  if (opAuthErr) throw opAuthErr;

  await service
    .from("users")
    .upsert({ id: opUser.user.id, member_type: "company" }, { onConflict: "id" });

  const provisioned = await provisionCompanyMemberSignup(service, opUser.user.id, {
    companyCategory: "operating",
    companyCategoryOther: null,
    companyName: "테스트 주식회사",
    jobPosition: "ceo",
    jobPositionOther: null,
  });

  const { data: userRow } = await service
    .from("users")
    .select("member_type")
    .eq("id", opUser.user.id)
    .single();
  record("company_member_type", userRow?.member_type === "company", userRow?.member_type);

  const { data: orgRow } = await service
    .from("accounting_organizations")
    .select("approval_status")
    .eq("id", provisioned.orgId)
    .single();
  record("org_pending", orgRow?.approval_status === "pending", orgRow?.approval_status);

  const { data: ownerRow } = await service
    .from("accounting_org_members")
    .select("role")
    .eq("org_id", provisioned.orgId)
    .eq("user_id", opUser.user.id)
    .maybeSingle();
  record("owner_role", ownerRow?.role === "company_owner", ownerRow?.role);

  const { data: prUser, error: prAuthErr } = await service.auth.admin.createUser({
    email: `${tag}-pr@signup.test.vfbcai.local`,
    password,
    email_confirm: true,
  });
  if (prAuthErr) throw prAuthErr;
  await service
    .from("users")
    .upsert({ id: prUser.user.id, member_type: "company" }, { onConflict: "id" });
  const prProvision = await provisionCompanyMemberSignup(service, prUser.user.id, {
    companyCategory: "prospective",
    companyCategoryOther: null,
    companyName: "미정",
    jobPosition: "ceo",
    jobPositionOther: null,
  });
  const { count: prOrgCount } = await service
    .from("accounting_org_members")
    .select("org_id", { count: "exact", head: true })
    .eq("user_id", prUser.user.id);
  record(
    "prospective_no_org",
    prProvision.orgId === null && (prOrgCount ?? 0) === 0,
    `orgId=${prProvision.orgId} count=${prOrgCount}`
  );

  const { data: peUser, error: peAuthErr } = await service.auth.admin.createUser({
    email: `${tag}-pe@signup.test.vfbcai.local`,
    password,
    email_confirm: true,
  });
  if (peAuthErr) throw peAuthErr;
  await service
    .from("users")
    .upsert({ id: peUser.user.id, member_type: "personal" }, { onConflict: "id" });
  const { data: peRow } = await service
    .from("users")
    .select("member_type")
    .eq("id", peUser.user.id)
    .single();
  record("personal_member_type", peRow?.member_type === "personal", peRow?.member_type);

  const forged = resolveLeadSubmitMemberType({
    member_type: "company",
    companyCategory: "operating",
    companyName: "x",
    jobPosition: "ceo",
  });
  record("forged_member_type_personal", forged === "personal", forged);

  const trusted = resolveLeadSubmitMemberType({
    companySignupChannel: COMPANY_SIGNUP_CHANNEL,
    companyCategory: "operating",
    companyName: "x",
    jobPosition: "ceo",
  });
  record("trusted_channel_company", trusted === "company", trusted);

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  record("fatal", false, e.message);
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
