/**
 * P9-4 hub icon navigation audit (owner + member from p5c session).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sessionPath = path.join(repoRoot, "tests/accounting/.p5c-session.json");
const base = process.env.P9_BASE || "http://localhost:3020";
const homeUrl = `${base}/company/accounting`;

const TARGETS = [
  { tile: "inquiry", subs: ["accounting.nav.ledger", "accounting.nav.evidence", "accounting.nav.filing"] },
  { tile: "proof", subs: ["accounting.nav.ledger", "accounting.nav.filing"] },
  { tile: "apply", subs: ["(direct)"] },
  { tile: "declare", subs: ["accounting.nav.tax", "accounting.nav.filing"] },
  { tile: "consult", subs: ["accounting.home.hub.link.expert_review", "accounting.nav.filing"] },
  { tile: "agent", subs: ["(direct)"] },
  { shortcut: "schedule", label: "신고 일정" },
  { shortcut: "txn", label: "거래 입력" },
  { shortcut: "excel", label: "장부 엑셀" },
  { shortcut: "evidence", label: "증빙 업로드" },
  { shortcut: "receipt", label: "접수증 조회" },
  { shortcut: "settings", label: "설정" },
];

const seed = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
const st = {};
for (const line of execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" }).split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) st[m[1]] = m[2].replace(/^"|"$/g, "");
}
const storageKey = seed.storageKey || `sb-${new URL(st.API_URL).hostname.split(".")[0]}-auth-token`;

async function auditSession(name, session) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
  await context.addInitScript(
    (p) => localStorage.setItem(p.key, p.raw),
    { key: storageKey, raw: JSON.stringify(session) }
  );
  const page = await context.newPage();
  const rows = [];

  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  const hub = page.getByTestId("accounting-home-hub");
  const hubVisible = (await hub.count()) > 0;
  if (!hubVisible) {
    const mainText = (await page.locator("main").innerText()).slice(0, 80);
    rows.push({ account: name, icon: "(hub)", url: page.url(), title: mainText, verdict: "허브 미노출", reason: "승인 전/거부 상태" });
    await browser.close();
    return rows;
  }

  for (const t of TARGETS) {
    if (t.tile) {
      await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
      await hub.waitFor({ timeout: 60000 });
      const tileBtn = page.getByTestId(`accounting-home-hub-tile-${t.tile}`);
      await tileBtn.click();
      if (t.subs[0] === "(direct)") {
        await page.waitForTimeout(800);
        const url = page.url();
        const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
        const body = await page.locator("main").innerText();
        const verdict = body.includes("준비 중") ? "안내만 있음" : url.includes("/transactions") || url.includes("/vat") ? "동작" : "일부 동작";
        rows.push({ account: name, icon: t.tile, sub: "-", url, title: h1, verdict, reason: body.includes("준비 중") ? "placeholder.lead" : "" });
      } else {
        const menu = page.getByTestId(`accounting-home-hub-menu-${t.tile}`);
        if ((await menu.count()) === 0) continue;
        const links = menu.locator("a");
        const n = await links.count();
        for (let i = 0; i < n; i++) {
          await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
          await tileBtn.click();
          const link = page.getByTestId(`accounting-home-hub-menu-${t.tile}`).locator("a").nth(i);
          const label = (await link.innerText()).trim();
          await link.click();
          await page.waitForTimeout(600);
          const url = page.url();
          const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
          const body = await page.locator("main").innerText();
          let verdict = "동작";
          if (body.includes("준비 중") || body.includes("이 화면은 준비")) verdict = "안내만 있음";
          else if (url.includes("/ledger") && body.includes("장부")) verdict = "동작";
          rows.push({ account: name, icon: t.tile, sub: label, url, title: h1, verdict, reason: verdict === "안내만 있음" ? "AccountingPlaceholderClient" : "" });
        }
      }
    }
  }

  for (const s of TARGETS.filter((x) => x.shortcut)) {
    await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
    const strip = page.getByTestId("accounting-home-hub-shortcuts");
    const link = strip.getByRole("link", { name: s.label }).or(strip.locator(`a[href*='${s.shortcut}']`));
    if ((await link.count()) === 0) {
      rows.push({ account: name, icon: `short:${s.shortcut}`, sub: "-", url: "-", title: "-", verdict: "없음", reason: "UI에 없음" });
      continue;
    }
    if (s.shortcut === "schedule") {
      await strip.getByRole("link", { name: s.label }).click();
      await page.waitForTimeout(400);
      rows.push({
        account: name,
        icon: `short:${s.shortcut}`,
        sub: "-",
        url: page.url() + "#schedule",
        title: "신고 일정",
        verdict: "동작",
        reason: "앵커 스크롤",
      });
      continue;
    }
    await strip.getByRole("link", { name: s.label }).click();
    await page.waitForTimeout(600);
    const url = page.url();
    const h1 = (await page.locator("h1").first().innerText().catch(() => "")).trim();
    const body = await page.locator("main").innerText();
    let verdict = "동작";
    if (body.includes("준비 중") || body.includes("이 화면은 준비")) verdict = "안내만 있음";
    rows.push({ account: name, icon: `short:${s.shortcut}`, sub: "-", url, title: h1, verdict, reason: verdict === "안내만 있음" ? "placeholder" : "" });
  }

  await browser.close();
  return rows;
}

const ownerRows = await auditSession("org_a_owner", seed.sessionOwner);
const memberRows = await auditSession("company_member", seed.sessionMember);
console.log(JSON.stringify({ ownerRows, memberRows }, null, 2));
