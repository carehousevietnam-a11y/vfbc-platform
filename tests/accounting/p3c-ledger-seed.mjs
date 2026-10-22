/**
 * P3c local ledger seed. Refuses any non-local Supabase URL.
 * Default: seed, assert debit=credit, then delete.
 * hold: leave rows and write tests/qa/_output/p3c-ledger/report.json
 * cleanup: delete the held org (local triggers paused only inside this script).
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p3c-ledger");
const reportPath = path.join(outDir, "report.json");
const MEMO_KO = "사무실 비품 구매 메모를 한국어로 남겼습니다";

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

function localStatus() {
  const stdout = spawnSync("npx", ["supabase", "status", "-o", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  if (stdout.status !== 0) throw new Error("local supabase status failed");
  const st = parseSupabaseStatusEnv(stdout.stdout || "");
  const host = new URL(st.API_URL).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error("refusing non-local supabase");
  }
  return st;
}

function assertUuid(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("refusing cleanup without a uuid");
  }
}

function runLocalSql(sql) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, "local.sql");
  fs.writeFileSync(file, sql);
  const result = spawnSync("npx", ["supabase", "db", "query", "--local", "-f", file], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true,
  });
  fs.rmSync(file, { force: true });
  if (result.status !== 0) {
    const detail = `${result.stderr || ""}\n${result.stdout || ""}`.replace(/postgres(ql)?:\/\/\S+/gi, "[db]").slice(0, 500);
    throw new Error(`local sql failed: ${detail}`);
  }
}

function runLocalStatements(statements) {
  for (const statement of statements) {
    const sql = statement.trim();
    if (!sql) continue;
    runLocalSql(sql.endsWith(";") ? sql : `${sql};`);
  }
}

function guardStatements(enabled) {
  const verb = enabled ? "enable" : "disable";
  return [
    `alter table public.accounting_ledger_entries ${verb} trigger accounting_trg_deny_ledger_mutate`,
    `alter table public.accounting_transactions ${verb} trigger accounting_trg_guard_confirmed_txn`,
    `alter table public.accounting_audit_log ${verb} trigger accounting_trg_deny_audit_delete`,
    `alter table public.accounting_audit_log ${verb} trigger accounting_trg_deny_audit_update`,
    `alter table public.accounting_exports ${verb} trigger accounting_trg_deny_exports_mutate`,
  ];
}

async function cleanupOrg(st, orgId, userId) {
  assertUuid(orgId);
  assertUuid(userId);
  const deletes = [
    `delete from public.accounting_exports where org_id = '${orgId}'`,
    `delete from public.accounting_ledger_entries where org_id = '${orgId}'`,
    `delete from public.accounting_i18n_texts where org_id = '${orgId}'`,
    `delete from public.accounting_transaction_lines where txn_id in (select id from public.accounting_transactions where org_id = '${orgId}')`,
    `delete from public.accounting_transactions where org_id = '${orgId}'`,
    `delete from public.accounting_audit_log where org_id = '${orgId}'`,
    `delete from public.accounting_counterparties where org_id = '${orgId}'`,
    `delete from public.accounting_org_members where org_id = '${orgId}'`,
    `delete from public.accounting_organizations where id = '${orgId}'`,
  ];
  try {
    runLocalStatements([...guardStatements(false), ...deletes]);
  } finally {
    runLocalStatements(guardStatements(true));
  }
  const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await service.auth.admin.deleteUser(userId);
}

function sumsByTxn(rows) {
  const map = new Map();
  for (const row of rows) {
    const cur = map.get(row.txn_id) ?? { debit: 0, credit: 0 };
    cur.debit += Number(row.debit);
    cur.credit += Number(row.credit);
    map.set(row.txn_id, cur);
  }
  return map;
}

async function seed(st) {
  const { seedTestPostingRule } = await import("./testPostingFixture.mjs");
  const { applyTransactionCommand } = await import("../../src/lib/accounting/transactionEntry.ts");
  const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const tag = `p3c-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;
  const email = `${tag}-owner@test.vfbcai.local`;
  const { data: userData, error: userError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError || !userData.user) throw new Error("local user create failed");
  const userId = userData.user.id;
  await service.from("users").upsert({ id: userId, member_type: "company" }, { onConflict: "id" });
  await service.from("accounting_profiles").upsert({ user_id: userId, locale: "ko" }, { onConflict: "user_id" });

  const { data: org, error: orgError } = await service
    .from("accounting_organizations")
    .insert({ name_official: `P3c Local ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  if (orgError || !org) throw new Error("local org create failed");
  await service.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: userId,
    role: "company_owner",
  });
  await seedTestPostingRule(service, "sale");

  const bootstrap = createClient(st.API_URL, st.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: sessionData, error: signError } = await bootstrap.auth.signInWithPassword({ email, password });
  if (signError || !sessionData.session) throw new Error("local sign-in failed");
  const token = sessionData.session.access_token;
  const client = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const shared = {
    type: "sale",
    txnDate: "2026-10-16",
    invoiceSeries: "1C26T",
    invoiceDate: "2026-10-16",
    vatRate: 0,
    vatAmount: 0,
    newCounterpartyName: "P3c Counterparty",
  };
  const vnd = await applyTransactionCommand(
    client,
    token,
    { action: "confirm", ...shared, currency: "VND", amountNet: 1000000, invoiceNo: "0001001" },
    null
  );
  const fx = await applyTransactionCommand(
    client,
    token,
    {
      action: "confirm",
      ...shared,
      currency: "USD",
      fxRate: 25000,
      amountNet: 40,
      invoiceNo: "0001002",
    },
    null
  );
  if (!vnd.ok || !fx.ok) throw new Error("local confirm failed");

  const { error: memoError } = await service.from("accounting_i18n_texts").insert({
    org_id: org.id,
    entity_type: "transaction",
    entity_id: vnd.id,
    field: "memo",
    lang: "ko",
    text: MEMO_KO,
    status: "original",
    version: 1,
    created_by: userId,
  });
  if (memoError) throw new Error("local memo insert failed");

  const { data: ledger, error: ledgerError } = await client
    .from("accounting_ledger_entries")
    .select("txn_id, debit, credit")
    .eq("org_id", org.id);
  if (ledgerError) throw new Error("local ledger read failed");
  const sums = sumsByTxn(ledger ?? []);
  for (const id of [vnd.id, fx.id]) {
    const sum = sums.get(id);
    if (!sum || sum.debit !== sum.credit || sum.debit !== 1000000) {
      throw new Error("ledger not balanced");
    }
  }
  const { data: langs } = await service
    .from("accounting_i18n_texts")
    .select("lang")
    .eq("entity_id", vnd.id)
    .eq("field", "memo");
  const langSet = new Set((langs ?? []).map((row) => row.lang));
  if (!langSet.has("ko") || langSet.has("vi")) throw new Error("memo langs");

  const { data: fxRows } = await client
    .from("accounting_ledger_entries_enriched")
    .select("txn_id, fx_conversion_unverified")
    .eq("org_id", org.id);
  const fxFlags = (fxRows ?? []).filter((row) => row.txn_id === fx.id);
  const vndFlags = (fxRows ?? []).filter((row) => row.txn_id === vnd.id);
  if (!fxFlags.length || !fxFlags.every((row) => row.fx_conversion_unverified === true)) {
    throw new Error("fx flag missing");
  }
  if (vndFlags.some((row) => row.fx_conversion_unverified === true)) throw new Error("vnd flagged fx");

  return {
    orgId: org.id,
    userId,
    vndTxnId: vnd.id,
    fxTxnId: fx.id,
    access_token: token,
    refresh_token: sessionData.session.refresh_token,
    session: sessionData.session,
    memoKo: MEMO_KO,
  };
}

async function main() {
  const mode = process.argv[2] || "once";
  const st = localStatus();
  if (mode === "cleanup") {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    await cleanupOrg(st, report.orgId, report.userId);
    fs.rmSync(reportPath, { force: true });
    console.log(JSON.stringify({ mode: "cleanup", cleaned: true }));
    return;
  }
  const report = await seed(st);
  if (mode === "hold") {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report));
    console.log(JSON.stringify({ mode: "hold", balanced: true, memoKoOnly: true, cleaned: false }));
    return;
  }
  await cleanupOrg(st, report.orgId, report.userId);
  console.log(JSON.stringify({ mode: "once", balanced: true, memoKoOnly: true, cleaned: true }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "p3c seed failed");
  process.exit(1);
});
