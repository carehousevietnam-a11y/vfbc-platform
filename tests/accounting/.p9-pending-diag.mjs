/** One-off P9 pending diag — counts only, no secrets. */
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8")
);
function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}
execSync("node tests/accounting/dev-local-login-seed.mjs", { cwd: repoRoot, stdio: "pipe" });
const st = parseEnv(execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }));
const base = process.env.P5B_BASE || "http://localhost:3020";

async function tokenFor(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  if (error || !data.session) throw new Error("sign_in_failed");
  return data.session.access_token;
}

const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const orgRow = await service.from("accounting_organizations").select("id").eq("tax_code", config.orgs.a.tax_code).single();
const orgAId = orgRow.data.id;
const tag = `diag-${Date.now()}`;
const viEmail = `diag-vi-${tag}@test.vfbcai.local`;
const { data: created } = await service.auth.admin.createUser({
  email: viEmail,
  password: config.password,
  email_confirm: true,
});
const viUid = created.user.id;
await service.from("users").upsert({ id: viUid, member_type: "company" });
await service.from("accounting_org_members").insert({ org_id: orgAId, user_id: viUid, role: "company_member" });
await service.from("accounting_profiles").upsert({ user_id: viUid, locale: "vi" });
await service.from("accounting_company_signup_profiles").upsert({
  user_id: viUid,
  company_category: "operating",
  company_name: "Diag Vi",
  job_position: "finance",
});
const viTok = await tokenFor(viEmail);
const amountNet = 7000000;
const createRes = await fetch(`${base}/api/accounting/transactions`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${viTok}` },
  body: JSON.stringify({
    action: "draft",
    type: "sale",
    txnDate: "2026-10-12",
    counterpartyId: "",
    newCounterpartyName: "",
    invoiceSeries: "",
    invoiceNo: "",
    invoiceDate: "",
    currency: "VND",
    fxRate: "",
    amountNet: String(amountNet),
    vatRate: "10",
    vatAmount: String(Math.round(amountNet * 0.1)),
    memo: `diag memo ${tag}`,
    description: "",
    memoLang: "vi",
    descriptionLang: "vi",
  }),
});
const createBody = await createRes.json().catch(() => ({}));
const txnId = createBody.id ?? null;

async function listCount(tok, label) {
  const res = await fetch(`${base}/api/accounting/transactions?status=draft&evidence=all`, {
    headers: { Authorization: `Bearer ${tok}` },
  });
  const body = await res.json().catch(() => ({}));
  const n = Array.isArray(body.items) ? body.items.length : -1;
  const hasTxn = Array.isArray(body.items) && body.items.some((i) => i.id === txnId);
  return { label, status: res.status, itemCount: n, hasTxn, error: body.error ?? null };
}

const koTok = await tokenFor(config.accounts.org_a_owner);
const rows = [await listCount(viTok, "vi"), await listCount(koTok, "ko")];
await service.from("accounting_transactions").delete().eq("id", txnId);
await service.from("accounting_org_members").delete().eq("user_id", viUid);
await service.auth.admin.deleteUser(viUid);

console.log(JSON.stringify({ createStatus: createRes.status, txnCreated: Boolean(txnId), lists: rows }));
