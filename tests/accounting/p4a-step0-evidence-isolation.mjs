/**
 * P4a step 0 — fresh org A/B sessions, evidence filter + cross-org list (local only).
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p4a-step0");
fs.mkdirSync(outDir, { recursive: true });

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);
const host = new URL(st.API_URL).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error("refusing non-local supabase");
  process.exit(1);
}

const { listTransactions } = await import("../../src/lib/accounting/transactionEntry.ts");

const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createUser(email, password) {
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  await service.from("users").upsert({ id: data.user.id, member_type: "company" }, { onConflict: "id" });
  return data.user;
}

async function signIn(email, password) {
  const boot = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await boot.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

const tag = `p4a-step0-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const ownerA = await createUser(`${tag}-a@test.vfbcai.local`, password);
const ownerB = await createUser(`${tag}-b@test.vfbcai.local`, password);

const { data: orgA } = await service
  .from("accounting_organizations")
  .insert({ name_official: `A ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
const { data: orgB } = await service
  .from("accounting_organizations")
  .insert({ name_official: `B ${tag}`, approval_status: "approved" })
  .select("id")
  .single();

await service.from("accounting_org_members").insert([
  { org_id: orgA.id, user_id: ownerA.id, role: "company_owner" },
  { org_id: orgB.id, user_id: ownerB.id, role: "company_owner" },
]);

const sessionA = await signIn(`${tag}-a@test.vfbcai.local`, password);
const sessionB = await signIn(`${tag}-b@test.vfbcai.local`, password);
fs.writeFileSync(path.join(outDir, "session-a.json"), JSON.stringify(sessionA, null, 2));
fs.writeFileSync(path.join(outDir, "session-b.json"), JSON.stringify(sessionB, null, 2));

const clientA = createClient(st.API_URL, st.ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
const clientB = createClient(st.API_URL, st.ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});

await service.from("accounting_transactions").insert({
  org_id: orgA.id,
  type: "sale",
  status: "draft",
  txn_date: "2026-10-01",
  period_key: "2026-10",
  amount_vnd: 5000,
  created_by: ownerA.id,
});

const bListA = await clientB.from("accounting_transactions").select("id").eq("org_id", orgA.id);
const linkedA = await listTransactions(clientA, sessionA.access_token, { evidence: "linked" });
const missingA = await listTransactions(clientA, sessionA.access_token, { evidence: "missing" });
const linkedB = await listTransactions(clientB, sessionB.access_token, { evidence: "linked" });
const missingB = await listTransactions(clientB, sessionB.access_token, { evidence: "missing" });

const rows = [
  {
    case: "B cannot read A txns by org_id",
    pass: !bListA.error && (bListA.data ?? []).length === 0,
    detail: `error=${bListA.error?.message ?? "none"} count=${bListA.data?.length ?? 0}`,
  },
  {
    case: "A evidence linked ok",
    pass: linkedA.ok && linkedA.error !== "UNAUTHENTICATED",
    detail: linkedA.ok ? `total=${linkedA.total}` : linkedA.error,
  },
  {
    case: "A evidence missing ok",
    pass: missingA.ok && missingA.error !== "UNAUTHENTICATED",
    detail: missingA.ok ? `total=${missingA.total}` : missingA.error,
  },
  {
    case: "B evidence linked isolated",
    pass: linkedB.ok && linkedB.total === 0 && linkedB.error !== "UNAUTHENTICATED",
    detail: linkedB.ok ? `total=${linkedB.total}` : linkedB.error,
  },
  {
    case: "B evidence missing isolated",
    pass: missingB.ok && missingB.total === 0 && missingB.error !== "UNAUTHENTICATED",
    detail: missingB.ok ? `total=${missingB.total}` : missingB.error,
  },
];

const report = { tag, orgA: orgA.id, orgB: orgB.id, rows, allPass: rows.every((r) => r.pass), supabaseHost: host };
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.allPass ? 0 : 2);
