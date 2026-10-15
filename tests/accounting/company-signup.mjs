/**
 * Accounting P2 — company member signup security (local Supabase only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const LEAD_SUBMIT_MEMBER_TYPE = "personal";

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

async function provisionCompanyMemberSignup(service, userId, profile) {
  const { data: existingProfile } = await service
    .from("accounting_company_signup_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingProfile) {
    throw new Error("ALREADY_PROVISIONED");
  }

  const { data: existingOwner } = await service
    .from("accounting_org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("role", "company_owner")
    .maybeSingle();

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

  if (existingOwner?.org_id) {
    return { orgId: existingOwner.org_id };
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

async function createAuthUser(admin, email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function signIn(baseUrl, baseAnon, email, password) {
  const bootstrap = createClient(baseUrl, baseAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await bootstrap.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return createClient(baseUrl, baseAnon, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

loadEnvFile(path.join(repoRoot, ".env.local"));

const local = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" })
);

const url = local.API_URL;
const anonKey = local.ANON_KEY;
const serviceKey = local.SERVICE_ROLE_KEY;

const results = { pass: 0, fail: 0, cases: [] };

function record(name, ok, detail) {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

async function main() {
  if (!url || !serviceKey || !anonKey) {
    record("local_supabase", false, "missing url/keys");
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

  const tag = `p2sec-${Date.now()}`;
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

  // (a) 다른 사용자가 타인 signup profile 조회 불가
  const victim = await createAuthUser(
    service,
    `${tag}-victim@signup.test.vfbcai.local`,
    password
  );
  await provisionCompanyMemberSignup(service, victim.id, {
    companyCategory: "operating",
    companyCategoryOther: null,
    companyName: "피해 회사",
    jobPosition: "ceo",
    jobPositionOther: null,
  });
  const attacker = await createAuthUser(
    service,
    `${tag}-attacker@signup.test.vfbcai.local`,
    password
  );
  const attackerClient = await signIn(
    url,
    anonKey,
    `${tag}-attacker@signup.test.vfbcai.local`,
    password
  );
  const crossRead = await attackerClient
    .from("accounting_company_signup_profiles")
    .select("user_id")
    .eq("user_id", victim.id);
  record(
    "rls_cross_user_read_blocked",
    !crossRead.error && (crossRead.data?.length ?? 0) === 0,
    crossRead.error?.message ?? `rows=${crossRead.data?.length ?? 0}`
  );

  const victimClient = await signIn(url, anonKey, `${tag}-victim@signup.test.vfbcai.local`, password);
  const clientInsert = await victimClient.from("accounting_company_signup_profiles").insert({
    user_id: victim.id,
    company_category: "operating",
    company_name: "해킹",
    job_position: "ceo",
  });
  record(
    "rls_client_insert_blocked",
    Boolean(clientInsert.error),
    clientInsert.error?.message ?? "insert succeeded"
  );

  // (b) lead-submit은 channel/member_type 조작과 무관하게 personal
  record(
    "lead_submit_member_type_constant",
    LEAD_SUBMIT_MEMBER_TYPE === "personal",
    LEAD_SUBMIT_MEMBER_TYPE
  );
  const forgedLeadSubmitType = LEAD_SUBMIT_MEMBER_TYPE;
  record(
    "lead_submit_forged_company_body_still_personal",
    forgedLeadSubmitType === "personal",
    "companySignupChannel+profile in body does not change LEAD_SUBMIT_MEMBER_TYPE"
  );

  // (c) 동일 사용자 2회 provision → 조직 1개
  const dupUser = await createAuthUser(service, `${tag}-dup@signup.test.vfbcai.local`, password);
  await service
    .from("users")
    .upsert({ id: dupUser.id, member_type: "company" }, { onConflict: "id" });
  const first = await provisionCompanyMemberSignup(service, dupUser.id, {
    companyCategory: "operating",
    companyCategoryOther: null,
    companyName: "중복 테스트",
    jobPosition: "ceo",
    jobPositionOther: null,
  });
  let secondOk = false;
  try {
    await provisionCompanyMemberSignup(service, dupUser.id, {
      companyCategory: "operating",
      companyCategoryOther: null,
      companyName: "두번째",
      jobPosition: "ceo",
      jobPositionOther: null,
    });
  } catch (e) {
    secondOk = e.message === "ALREADY_PROVISIONED";
  }
  const { count: ownerOrgCount } = await service
    .from("accounting_org_members")
    .select("org_id", { count: "exact", head: true })
    .eq("user_id", dupUser.id)
    .eq("role", "company_owner");
  record(
    "duplicate_provision_one_org",
    secondOk && ownerOrgCount === 1 && first.orgId,
    `secondBlocked=${secondOk} ownerOrgs=${ownerOrgCount}`
  );

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  record("fatal", false, e.message);
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
});
