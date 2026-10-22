/**
 * P6-1: confirmAccountingViI18nText (server action core) — local Supabase.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { seedTestPostingRule } from "./testPostingFixture.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
execSync("npx supabase migration up --local", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
const st = {};
for (const line of execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) st[m[1]] = m[2].replace(/^"|"$/g, "");
}
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { confirmAccountingViI18nText } = await import("../../src/lib/accounting/confirmViI18nTextEntry.ts");

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail = "") {
  results.cases.push({ name, ok: Boolean(ok), detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

const tag = `p61-${Date.now()}`;
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
  return { token: data.session.access_token, client: createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  }) };
};

const u = {};
for (const n of ["owner", "membervi", "vnkexp", "bowner"]) u[n] = await mk(n);
const { data: orgA } = await service.from("accounting_organizations").insert({ name_official: `A ${tag}`, approval_status: "approved" }).select("id").single();
const { data: orgB } = await service.from("accounting_organizations").insert({ name_official: `B ${tag}`, approval_status: "approved" }).select("id").single();
await service.from("accounting_org_members").insert([
  { org_id: orgA.id, user_id: u.owner.id, role: "company_owner" },
  { org_id: orgA.id, user_id: u.membervi.id, role: "company_member" },
  { org_id: orgA.id, user_id: u.vnkexp.id, role: "vnk_expert" },
  { org_id: orgB.id, user_id: u.bowner.id, role: "company_owner" },
]);
await service.from("accounting_expert_assignments").insert({
  expert_user_id: u.vnkexp.id,
  org_id: orgA.id,
  assigned_by: u.owner.id,
});
await service.from("accounting_profiles").upsert({ user_id: u.membervi.id, locale: "vi" });
await seedTestPostingRule(service, "sale");

const s = {};
for (const n of Object.keys(u)) s[n] = await signIn(n);

const { data: t } = await service
  .from("accounting_transactions")
  .insert({ org_id: orgA.id, type: "sale", status: "draft", txn_date: "2026-10-10", period_key: "2026-10", amount_vnd: 110000, created_by: u.owner.id })
  .select("id")
  .single();
await service.from("accounting_transaction_lines").insert({ txn_id: t.id, amount_net: 100000, vat_rate: 10, vat_amount: 10000 });
await service.from("accounting_i18n_texts").insert({
  org_id: orgA.id, entity_type: "transaction", entity_id: t.id, field: "memo", lang: "vi", text: "vi memo", status: "machine", version: 1,
});
await s.owner.client.rpc("accounting_confirm_transaction", { p_txn_id: t.id });

const deniedOwner = await confirmAccountingViI18nText(s.owner.client, s.owner.token, {
  entityType: "transaction", entityId: t.id, field: "memo",
});
record("server_denies_owner", !deniedOwner.ok && deniedOwner.error === "VI_CONFIRM_FORBIDDEN");

const deniedOther = await confirmAccountingViI18nText(s.bowner.client, s.bowner.token, {
  entityType: "transaction", entityId: t.id, field: "memo",
});
record("server_denies_other_org", !deniedOther.ok);

const ok = await confirmAccountingViI18nText(s.membervi.client, s.membervi.token, {
  entityType: "transaction", entityId: t.id, field: "memo",
});
record("server_allows_vi_member", ok.ok);

const { data: t2 } = await service
  .from("accounting_transactions")
  .insert({ org_id: orgA.id, type: "sale", status: "draft", txn_date: "2026-10-11", period_key: "2026-10", amount_vnd: 220000, created_by: u.owner.id })
  .select("id")
  .single();
await service.from("accounting_transaction_lines").insert({ txn_id: t2.id, amount_net: 200000, vat_rate: 10, vat_amount: 20000 });
await service.from("accounting_i18n_texts").insert({
  org_id: orgA.id, entity_type: "transaction", entity_id: t2.id, field: "memo", lang: "vi", text: "vi memo expert", status: "machine", version: 1,
});
await s.owner.client.rpc("accounting_confirm_transaction", { p_txn_id: t2.id });

const okExpert = await confirmAccountingViI18nText(s.vnkexp.client, s.vnkexp.token, {
  entityType: "transaction", entityId: t2.id, field: "memo",
});
record("server_allows_vnk_expert", okExpert.ok, okExpert.ok ? "" : okExpert.error ?? "fail");

const { count: audit } = await service
  .from("accounting_audit_log")
  .select("id", { count: "exact", head: true })
  .eq("action", "VI_CONFIRM")
  .eq("org_id", orgA.id);
record("audit_vi_confirm", (audit ?? 0) >= 1);

console.log(JSON.stringify({ pass: results.pass, fail: results.fail, failed: results.cases.filter((x) => !x.ok) }));
process.exit(results.fail ? 1 : 0);
