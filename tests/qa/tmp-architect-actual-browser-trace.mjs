/**
 * TEMP — delete after MASTER-HANDOFF-ACTUAL-BROWSER-TRACE Mission
 * NO mocks. Real network + DOM. Multiple auth-timing scenarios.
 */
import { chromium } from "playwright";
import { writeFileSync } from "fs";

const BASE = process.env.QA_BASE_URL || "http://localhost:3010";
const EVIDENCE = "tests/qa/fixtures/qa-sample-contract.pdf";
const AUTH_STORAGE = "tests/qa/tmp-architect-auth-storage.json";

const QA = {
  name: "Trace QA Member",
  phone: "0904444998",
  address: "Quan 7, TP.HCM",
  kakao: "traceqa002",
};

function ts(t0) {
  return Date.now() - t0;
}

async function clickChoice(page, text) {
  await page.waitForFunction(
    (needle) => {
      const btns = [...document.querySelectorAll("button")];
      const b = btns.find((x) => x.textContent?.includes(needle));
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(450);
}

async function getSessionInfo(page) {
  return page.evaluate(() => {
    const keys = Object.keys(localStorage).filter((k) => k.includes("auth-token"));
    const hasToken = keys.some((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Boolean(parsed?.access_token || parsed?.currentSession?.access_token);
      } catch {
        return false;
      }
    });
    return { hasSupabaseToken: hasToken, authKeys: keys.length };
  });
}

async function readDom(page) {
  return page.evaluate(() => {
    const body = document.body?.innerText ?? "";
    const qc = (sel) => document.querySelectorAll(sel).length;
    return {
      loadingRe: qc('[data-purpose="re-phase1-member-handoff"]') > 0,
      loadingAdmin: qc('[data-purpose="admin-phase1-member-handoff"]') > 0,
      loadingText: body.includes("제출하신 자료를 확인하고 1차 결과를 준비하고 있습니다"),
      firstResultRe: [...document.querySelectorAll("h1,h2,h3")].some((el) =>
        /부동산 문서 1차 종합 결과/.test(el.textContent ?? ""),
      ),
      firstResultAdmin: [...document.querySelectorAll("h1,h2,h3")].some((el) =>
        /행정문서 1차 종합 결과/.test(el.textContent ?? ""),
      ),
      signupVisible: qc('input[name="name"]') > 0,
      questionCheck: body.includes("1. 검토 내용 체크"),
      evidenceContinue: [...document.querySelectorAll("button")].some((b) =>
        /자료 포함하고 계속하기/.test(b.textContent ?? ""),
      ),
      errorText: body.match(/접수 중 문제|접수 처리 중|로그인 세션/)?.[0] ?? null,
    };
  });
}

function attachNet(page, log, t0) {
  const mark = (phase, extra = {}) => log.push({ ms: ts(t0), phase, ...extra });
  page.on("request", (req) => {
    const u = req.url();
    if (
      u.includes("/storage/v1/object") ||
      (u.includes("/rest/v1/leads") && req.method() === "POST") ||
      u.includes("/api/lead-submit") ||
      (u.includes("/rest/v1/crm_activities") && req.method() === "POST")
    ) {
      mark("REQ", { method: req.method(), url: u.replace(BASE, "").slice(0, 140) });
    }
  });
  page.on("response", async (res) => {
    const u = res.url();
    const req = res.request();
    if (
      u.includes("/storage/v1/object") ||
      (u.includes("/rest/v1/leads") && req.method() === "POST") ||
      u.includes("/api/lead-submit") ||
      (u.includes("/rest/v1/crm_activities") && req.method() === "POST")
    ) {
      let bodySnippet;
      if (u.includes("/rest/v1/leads") && req.method() === "POST") {
        try {
          bodySnippet = (await res.text()).slice(0, 100);
        } catch {
          /* ignore */
        }
      }
      mark("RES", {
        status: res.status(),
        method: req.method(),
        url: u.replace(BASE, "").slice(0, 140),
        bodySnippet,
      });
    }
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") mark("CONSOLE_ERR", { text: msg.text().slice(0, 180) });
  });
}

async function pollAfterTrigger(page, t0, maxMs = 120_000) {
  const samples = [];
  let prev = "";
  const end = Date.now() + maxMs;
  while (Date.now() < end) {
    const dom = await readDom(page);
    const snap = JSON.stringify(dom);
    if (snap !== prev) {
      samples.push({ ms: ts(t0), dom });
      prev = snap;
    }
    if (dom.firstResultRe || dom.firstResultAdmin) break;
    if (dom.signupVisible && dom.errorText) break;
    await page.waitForTimeout(150);
  }
  return samples;
}

async function submitSignup(page, email) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30_000 });
  await page.locator('input[name="name"]').fill(QA.name);
  await page.locator('input[name="phone"]').fill(QA.phone);
  await page.locator('input[name="address"]').fill(QA.address);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="kakao_id"]').fill(QA.kakao);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.waitForTimeout(2500);
}

async function runPreToEvidence(page) {
  await clickChoice(page, "서명·납부 전");
  await clickChoice(page, "매물만 보고");
  await clickChoice(page, "전세·월세");
  await clickChoice(page, "집주인·매도인");
  await clickChoice(page, "제출·계약 요건");
}

async function ensureMemberSession(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await runPreToEvidence(page);
  await page.getByRole("button", { name: /자료 없이/ }).click();
  await submitSignup(page, `trace-auth-${Date.now()}@test.vfbcai.local`);
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({
    state: "visible",
    timeout: 90_000,
  });
  await page.context().storageState({ path: AUTH_STORAGE });
  await page.close();
}

async function traceReMember(context, scenario) {
  const page = await context.newPage();
  const net = [];
  const t0 = Date.now();
  attachNet(page, net, t0);

  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  if (scenario.waitAuthMs > 0) await page.waitForTimeout(scenario.waitAuthMs);

  const sessionBefore = await getSessionInfo(page);
  const domBefore = await readDom(page);

  await runPreToEvidence(page);
  await page.locator('input[type="file"]').first().setInputFiles(EVIDENCE);

  const sessionAtEvidence = await getSessionInfo(page);
  const clickT0 = Date.now();
  await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();

  const timeline = await pollAfterTrigger(page, clickT0);
  const submitEvents = net.filter((e) => e.phase === "REQ" || e.phase === "RES");

  await page.close();
  return {
    scenario: scenario.name,
    sessionBefore,
    sessionAtEvidence,
    domBefore,
    timeline,
    submitEvents,
    outcome: {
      loadingSeen: timeline.some((s) => s.dom.loadingText),
      loadingFirstMs: timeline.find((s) => s.dom.loadingText)?.ms ?? null,
      loadingLastMs: [...timeline].reverse().find((s) => s.dom.loadingText)?.ms ?? null,
      firstResultMs: timeline.find((s) => s.dom.firstResultRe)?.ms ?? null,
      signupMs: timeline.find((s) => s.dom.signupVisible)?.ms ?? null,
      stuckLoading:
        timeline.some((s) => s.dom.loadingText) &&
        !timeline.some((s) => s.dom.firstResultRe) &&
        timeline.at(-1)?.dom.loadingText,
    },
  };
}

async function traceAdminMember(context, scenario) {
  const page = await context.newPage();
  const net = [];
  const t0 = Date.now();
  attachNet(page, net, t0);
  const steps = [
    "교통위반이나 문제를 알리는 통지",
    "내가 알고 있는 상황과 기관에서 말하는 내용이 서로 다른",
    "기관에서 말하는 문제가 실제로 내 상황에 해당하는지",
    "아직 아무에게도 설명하거나",
    "대응해야 하는 날짜를 확인했습니다",
  ];

  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle" });
  if (scenario.waitAuthMs > 0) await page.waitForTimeout(scenario.waitAuthMs);

  const sessionBefore = await getSessionInfo(page);
  for (const step of steps) await clickChoice(page, step);

  const sessionAtEnd = await getSessionInfo(page);
  const clickT0 = Date.now();
  const timeline = await pollAfterTrigger(page, clickT0);
  const submitEvents = net.filter((e) => e.phase === "REQ" || e.phase === "RES");

  await page.close();
  return {
    scenario: scenario.name,
    sessionBefore,
    sessionAtEnd,
    timeline,
    submitEvents,
    outcome: {
      loadingSeen: timeline.some((s) => s.dom.loadingText),
      loadingFirstMs: timeline.find((s) => s.dom.loadingText)?.ms ?? null,
      firstResultMs: timeline.find((s) => s.dom.firstResultAdmin)?.ms ?? null,
      signupMs: timeline.find((s) => s.dom.signupVisible)?.ms ?? null,
      stuckLoading:
        timeline.some((s) => s.dom.loadingText) &&
        !timeline.some((s) => s.dom.firstResultAdmin) &&
        timeline.at(-1)?.dom.loadingText,
    },
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

  console.log("=== Establishing real member session (guest signup, no mock) ===");
  await ensureMemberSession(context);

  const contextWithAuth = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: AUTH_STORAGE,
  });

  const scenarios = [
    { name: "WAIT_AUTH_3s", waitAuthMs: 3000 },
    { name: "WAIT_AUTH_0s_race", waitAuthMs: 0 },
  ];

  const reResults = [];
  const adminResults = [];
  for (const sc of scenarios) {
    console.log(`\n=== RE trace: ${sc.name} ===`);
    reResults.push(await traceReMember(contextWithAuth, sc));
    console.log(`=== ADMIN trace: ${sc.name} ===`);
    adminResults.push(await traceAdminMember(contextWithAuth, sc));
  }

  await browser.close();

  const out = {
    capturedAt: new Date().toISOString(),
    base: BASE,
    scenarios,
    re: reResults,
    admin: adminResults,
  };
  writeFileSync("tests/qa/tmp-architect-actual-browser-trace.json", JSON.stringify(out, null, 2));

  for (const r of reResults) {
    console.log(`\n--- RE ${r.scenario} ---`);
    console.log("sessionAtEvidence:", r.sessionAtEvidence);
    console.log("outcome:", r.outcome);
    console.log("submitEvents:", JSON.stringify(r.submitEvents, null, 2));
    console.log("timeline transitions:");
    for (const s of r.timeline) console.log(`  @${s.ms}ms`, JSON.stringify(s.dom));
  }
  for (const a of adminResults) {
    console.log(`\n--- ADMIN ${a.scenario} ---`);
    console.log("sessionAtEnd:", a.sessionAtEnd);
    console.log("outcome:", a.outcome);
    console.log("submitEvents:", JSON.stringify(a.submitEvents, null, 2));
    console.log("timeline transitions:");
    for (const s of a.timeline) console.log(`  @${s.ms}ms`, JSON.stringify(s.dom));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
