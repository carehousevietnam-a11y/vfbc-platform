/**
 * Ledger unaccent search RPC + cross-org detail — local Supabase only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const p2cDir = path.join(repoRoot, "tests/qa/_output/p2c-evidence-filter");

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

execSync("npx supabase migration up --local", { cwd: repoRoot, stdio: "pipe" });
const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);

const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tag = `ledger-search-${Date.now()}`;
const { data: org } = await service
  .from("accounting_organizations")
  .insert({ name_official: `Search ${tag}`, approval_status: "approved" })
  .select("id")
  .single();
const orgId = org.id;

const { data: cp } = await service
  .from("accounting_counterparties")
  .insert({ org_id: orgId, name_original: "Công ty Hà Nội", kind: "customer" })
  .select("id")
  .single();

const { data: txn } = await service
  .from("accounting_transactions")
  .insert({
    org_id: orgId,
    type: "expense",
    status: "confirmed",
    txn_date: "2026-10-16",
    period_key: "2026-10",
    counterparty_id: cp.id,
    currency: "VND",
    amount_vnd: 1000,
  })
  .select("id")
  .single();

const { data: hits } = await service.rpc("accounting_ledger_search_txn_ids", {
  p_org_id: orgId,
  p_query: "Ha Noi",
});
const ok = Array.isArray(hits) && hits.includes(txn.id);
await service.from("accounting_transactions").delete().eq("id", txn.id);
await service.from("accounting_counterparties").delete().eq("id", cp.id);
await service.from("accounting_organizations").delete().eq("id", orgId);

const cases = [{ name: "unaccent_search", ok }];
if (fs.existsSync(path.join(p2cDir, "session-b.json")) && fs.existsSync(path.join(p2cDir, "seed-report.json"))) {
  const sessionB = JSON.parse(fs.readFileSync(path.join(p2cDir, "session-b.json"), "utf8"));
  const seed = JSON.parse(fs.readFileSync(path.join(p2cDir, "seed-report.json"), "utf8"));
  const clientB = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const crossTxn = await clientB
    .from("accounting_transactions")
    .select("id")
    .eq("id", seed.ids.aLinkedSale)
    .maybeSingle();
  const crossLedger = await clientB
    .from("accounting_ledger_entries_enriched")
    .select("id")
    .eq("txn_id", seed.ids.aLinkedSale);
  cases.push({
    name: "cross_org_ledger_detail_blocked",
    ok: !crossTxn.data && (crossLedger.data ?? []).length === 0,
  });
}

const fail = cases.filter((c) => !c.ok).length;
console.log(JSON.stringify({ pass: cases.length - fail, fail, cases }, null, 2));
if (fail > 0) process.exit(1);
