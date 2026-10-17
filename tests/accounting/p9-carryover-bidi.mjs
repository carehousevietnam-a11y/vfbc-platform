/**
 * P9 carry-over: bidirectional memo evidence + machine translation paths.
 * Modes (env P9_BIDI_MODE):
 *   pending   - server WITHOUT key: vi original saved, ko view shows vi fallback + "번역 대기"
 *   translate - server WITH key: vi original saved, poll for ko machine row, ko view shows ko text
 *   failure   - server with invalid key on separate port: retries counted from server log, ko fallback kept
 * Local only. Secrets and memo text are never logged. Only booleans, lengths, lang/status/version are printed.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const MODE = process.env.P9_BIDI_MODE || "pending";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p9-carryover");
fs.mkdirSync(outDir, { recursive: true });
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
const serverLog = process.env.P9_SERVER_LOG || "";
const storageKey = `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;
const tag = `p9bidi-${MODE}-${Date.now()}`;
const memoVi = `Ghi chu ${tag}`;
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const results = {};
const put = (id, status, note) => (results[id] = { status, note });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitUntil(fn, timeoutMs, intervalMs = 250) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      if (await fn()) return true;
    } catch {
      /* retry */
    }
    await sleep(intervalMs);
  }
  return false;
}

async function sessionForEmail(email) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  if (error || !data.session) throw error ?? new Error("sign_in");
  return data.session;
}
async function withSession(session, locale, viewport, fn) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport });
  await ctx.addCookies([{ name: "vfbcai_locale", value: locale, url: base }]);
  await ctx.addInitScript((p) => localStorage.setItem(p.key, p.raw), {
    key: storageKey,
    raw: JSON.stringify(session),
  });
  const page = await ctx.newPage();
  try {
    await fn(page);
  } finally {
    await browser.close();
  }
}
function countServerLog() {
  if (!serverLog || !fs.existsSync(serverLog)) return 0;
  const text = fs.readFileSync(serverLog, "utf8");
  return text.split(/\r?\n/).filter((l) => l.includes("accountingMachineTranslate: upstream status")).length;
}

// --- fixtures: ephemeral vi company_member in DEV Org A ---
const orgRow = await service
  .from("accounting_organizations")
  .select("id")
  .eq("tax_code", config.orgs.a.tax_code)
  .single();
const orgAId = orgRow.data.id;
const usersList = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
const ownerA = usersList.data.users.find((u) => u.email === config.accounts.org_a_owner);
const viEmail = `dev-org-a-${tag}@test.vfbcai.local`;
const { data: created, error: cErr } = await service.auth.admin.createUser({
  email: viEmail,
  password: config.password,
  email_confirm: true,
});
if (cErr) throw cErr;
const viUid = created.user.id;
await service.from("users").upsert({ id: viUid, member_type: "company" });
await service.from("accounting_org_members").insert({ org_id: orgAId, user_id: viUid, role: "company_member" });
await service.from("accounting_profiles").upsert({ user_id: viUid, locale: "vi" });
await service.from("accounting_company_signup_profiles").upsert({
  user_id: viUid,
  company_category: "operating",
  company_name: "DEV Org A Bidi Vi",
  job_position: "finance",
});

const amountNet = 7000000 + Math.floor(Math.random() * 900000);
const vatAmount = Math.round(amountNet * 0.1);
const amountLabelKo = new Intl.NumberFormat("ko-KR").format(amountNet + vatAmount);
const viSession = await sessionForEmail(viEmail);
const koSession = await sessionForEmail(config.accounts.org_a_owner);

let txnId = null;
const logBefore = countServerLog();
{
  const createRes = await fetch(`${base}/api/accounting/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${viSession.access_token}` },
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
      vatAmount: String(vatAmount),
      memo: memoVi,
      description: "",
      memoLang: "vi",
      descriptionLang: "vi",
    }),
  });
  const body = await createRes.json().catch(() => ({}));
  txnId = body.id ?? null;
  put("setup-create-vi-memo", createRes.ok && txnId ? "PASS" : "FAIL", `status=${createRes.status}`);
}

async function koRows() {
  const { data } = await service
    .from("accounting_i18n_texts")
    .select("lang, status, version, text")
    .eq("entity_type", "transaction")
    .eq("entity_id", txnId)
    .eq("field", "memo")
    .order("version", { ascending: false });
  return data ?? [];
}

// UI check on ko owner (ko locale), returns booleans/lengths only
async function koUiCheck(viewport, expect, koText) {
  const r = {};
  await withSession(koSession, "ko", viewport, async (page) => {
    await page.goto(`${base}/company/accounting/transactions?status=draft`, { waitUntil: "domcontentloaded" });
    const row = page.locator("ul li button", { hasText: amountLabelKo }).first();
    await row.waitFor({ timeout: 45000 });
    await row.click();
    const field = page.getByTestId("accounting-i18n-field-txn.memo");
    await field.waitFor({ timeout: 45000 });
    r.loaded = await waitUntil(async () => (await field.locator("textarea").inputValue()).length > 0, 10000);
    await field.getByRole("button", { name: "한국어로 보기" }).click();
    if (expect === "translated") {
      r.uiSettled = await waitUntil(
        async () => {
          const t = await field.innerText();
          return !t.includes("번역 대기") && t.includes(koText);
        },
        10000
      );
    } else {
      r.uiSettled = await waitUntil(async () => (await field.innerText()).includes("번역 대기"), 10000);
    }
    const txt = await field.innerText();
    r.viOriginalShown = txt.includes(memoVi);
    r.badgePending = txt.includes("번역 대기");
    r.textLen = txt.length;
    if (expect === "translated") r.koShown = txt.includes(koText);
    await page.screenshot({ path: path.join(outDir, `${MODE}-ko-${viewport.width}.png`), fullPage: true });
  });
  return r;
}

if (txnId) {
  if (MODE === "pending") {
    for (const [name, vp] of [
      ["desktop1440", { width: 1440, height: 900 }],
      ["mobile390", { width: 390, height: 844 }],
    ]) {
      try {
        const r = await koUiCheck(vp, "pending", "");
        put(
          `${name}-a-b`,
          r.loaded && r.uiSettled && r.viOriginalShown && r.badgePending ? "PASS" : "FAIL",
          `loaded=${r.loaded} vi_shown=${r.viOriginalShown} badge=${r.badgePending} len=${r.textLen}`
        );
      } catch (e) {
        put(`${name}-a-b`, "FAIL", String(e.message ?? e).split("\n")[0].slice(0, 120));
      }
    }
    const rows = await koRows();
    const vi = rows.find((x) => x.lang === "vi");
    const ko = rows.find((x) => x.lang === "ko");
    put(
      "d-pending-db",
      vi && vi.status === "original" && vi.version === 1 && !ko ? "PASS" : "FAIL",
      `vi=${vi?.status ?? "none"}/v${vi?.version ?? "-"} ko=${ko ? ko.status : "none"}`
    );
  }

  if (MODE === "translate") {
    const found = await waitUntil(async () => (await koRows()).some((x) => x.lang === "ko" && x.status === "machine"), 60000, 5000);
    const rows = await koRows();
    const ko = rows.find((x) => x.lang === "ko" && x.status === "machine");
    const koText = ko?.text ?? "";
    put("c-db-ko-machine", found ? "PASS" : "FAIL", `ko=${ko ? `machine/v${ko.version}` : "none"} polled<=60s`);
    if (found) {
      for (const [name, vp] of [
        ["desktop1440", { width: 1440, height: 900 }],
        ["mobile390", { width: 390, height: 844 }],
      ]) {
        try {
          const r = await koUiCheck(vp, "translated", koText);
          put(
            `c-ui-${name}`,
            r.loaded && r.uiSettled && r.koShown && !r.badgePending ? "PASS" : "FAIL",
            `ko_shown=${r.koShown} badge=${r.badgePending} len=${r.textLen}`
          );
        } catch (e) {
          put(`c-ui-${name}`, "FAIL", String(e.message ?? e).split("\n")[0].slice(0, 120));
        }
      }
    }
    const after = await koRows();
    const viAfter = after.find((x) => x.lang === "vi");
    const koAfter = after.find((x) => x.lang === "ko");
    const viRows = after.filter((x) => x.lang === "vi").length;
    const viSame = viAfter?.status === "original" && viAfter?.version === 1 && viRows === 1;
    put(
      "d-db-final",
      viSame && koAfter?.status === "machine" ? "PASS" : "FAIL",
      `vi=${viAfter?.status ?? "none"}/v${viAfter?.version ?? "-"} vi_rows=${viRows} ko=${koAfter ? `${koAfter.status}/v${koAfter.version}` : "none"}`
    );
  }

  if (MODE === "failure") {
    const retriedOk = await waitUntil(() => countServerLog() - logBefore >= 3, 60000, 2000);
    const delta = countServerLog() - logBefore;
    put(
      "5-retry-count",
      serverLog ? (delta === 3 ? "PASS" : "FAIL") : "확인 불가",
      `upstream_failures_logged=${delta} (expect 3 attempts) polled=${retriedOk}`
    );
    for (const [name, vp] of [
      ["desktop1440", { width: 1440, height: 900 }],
      ["mobile390", { width: 390, height: 844 }],
    ]) {
      try {
        const r = await koUiCheck(vp, "pending", "");
        put(
          `5-ui-${name}`,
          r.loaded && r.uiSettled && r.viOriginalShown && r.badgePending ? "PASS" : "FAIL",
          `vi_fallback=${r.viOriginalShown} badge=${r.badgePending} len=${r.textLen}`
        );
      } catch (e) {
        put(`5-ui-${name}`, "FAIL", String(e.message ?? e).split("\n")[0].slice(0, 120));
      }
    }
    const rows = await koRows();
    const ko = rows.find((x) => x.lang === "ko");
    const vi = rows.find((x) => x.lang === "vi");
    put(
      "5-no-ko-machine-row",
      !ko && vi?.status === "original" ? "PASS" : "FAIL",
      `ko=${ko ? ko.status : "none"} vi=${vi?.status ?? "none"}/v${vi?.version ?? "-"}`
    );
  }

  // cleanup fixtures (memo text never printed)
  await service.from("accounting_i18n_texts").delete().eq("entity_id", txnId);
  await service.from("accounting_transaction_lines").delete().eq("txn_id", txnId);
  await service.from("accounting_transactions").delete().eq("id", txnId);
}
await service.from("accounting_org_members").delete().eq("user_id", viUid);
await service.auth.admin.deleteUser(viUid);

console.log(JSON.stringify({ mode: MODE, results }, null, 2));
const failed = Object.values(results).filter((r) => r.status === "FAIL").length;
process.exit(failed > 0 ? 1 : 0);
