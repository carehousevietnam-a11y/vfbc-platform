/** VERIFIER ONLY temp harness — delete after QA */
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const FIRST = "부동산 문서 1차 종합 결과";
const SECOND = "부동산 문서 2차 개인화 결과";
const DETAIL =
  "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.";

async function click(page, text) {
  await page.waitForFunction(
    (needle) => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        x.textContent?.includes(needle),
      );
      if (!b) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    text,
    { timeout: 25000 },
  );
  await page.waitForTimeout(450);
}

async function clickFirst(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden";
    };
    const btn = [...document.querySelectorAll("button")].find((b) => {
      if (!vis(b)) return false;
      const t = (b.textContent ?? "").trim();
      return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
    });
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return true;
  });
}

async function phase1(page, steps) {
  for (const s of steps) {
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    await click(page, s);
  }
  for (let i = 0; i < 8; i++) {
    if (await page.locator('input[name="name"]').isVisible().catch(() => false)) return;
    if (!(await clickFirst(page))) break;
    await page.waitForTimeout(400);
  }
}

async function signup(page, tag) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 90000 });
  await page.locator('input[name="name"]').fill(`E2E ${tag}`);
  await page.locator('input[name="phone"]').fill(`0906666${Math.floor(Math.random() * 900) + 100}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@e2e.local`);
  await page.locator('input[name="kakao_id"]').fill(`${tag}${Date.now().toString().slice(-4)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: FIRST }).waitFor({ timeout: 90000 });
}

async function metrics(page) {
  return page.evaluate(
    ({ first, second }) => {
      const b = document.body.innerText;
      return {
        firstResult: b.includes(first),
        secondResult: b.includes(second),
        entryQ1: b.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요?"),
        gateShell: [...document.querySelectorAll("h3,h4")].some(
          (el) => el.textContent?.trim() === "1차에서 확인한 내용",
        ),
        section01: b.includes("01") && b.includes("현재 상황"),
        section02: b.includes("02") && b.includes("핵심"),
        section03: b.includes("03") && b.includes("주요 위험"),
        section04: b.includes("04") && b.includes("확인"),
        section05: b.includes("05") && b.includes("지금"),
        claimFootnote: b.includes("고객·상대 주장 기준 (확인 전)"),
        paidCta: b.includes("개인화 상세검토 하기"),
        expertCta: b.includes("전문가 진행하기"),
        aiReportCta: b.includes("AI 검토 상세 리포트"),
        evidenceStep: b.includes("간단한 자료"),
        hasTextarea: !!document.querySelector("textarea"),
        phase2Banner: b.includes("2차 · 개인화 검토"),
        insufficient:
          b.includes("충분하지 않") ||
          b.includes("정보가 부족") ||
          b.includes("partial"),
      };
    },
    { first: FIRST, second: SECOND },
  );
}

async function submitTa(page, text) {
  const ta = page.locator("textarea").first();
  if (!(await ta.isVisible().catch(() => false))) return false;
  await ta.fill(text);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && (b.textContent || "").trim() === "다음",
    );
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(600);
  return true;
}

async function advanceP2(page) {
  for (let i = 0; i < 36; i++) {
    const m = await metrics(page);
    if (m.secondResult) return m;
    if (m.evidenceStep) {
      const skip = page.getByRole("button", { name: /자료 없이 계속|건너/ });
      if (await skip.isVisible().catch(() => false)) await skip.click();
      await page.waitForTimeout(700);
      continue;
    }
    if (m.hasTextarea) {
      await submitTa(page, DETAIL);
      continue;
    }
    if (!(await clickFirst(page))) break;
    await page.waitForTimeout(500);
  }
  return metrics(page);
}

const PATHS = {
  PRE_CONTRACT: [
    "서명·납부 전",
    "초안",
    "사거나 팔려",
    "집주인·매도인",
    "불리하거나 위험한",
    "서류와 제가 겪은",
    "금액·보증금",
  ],
  POST_DISPUTE: [
    "문제가 생겼",
    "보증금·계약금을 받지 못",
    "집주인·매도인",
    "아직 공식 대응 전",
    "서류와 제가 겪은",
    "금액·보증금",
  ],
  DOCUMENT_REVIEW: [
    "서류 내용을 확인",
    "임대차·전세",
    "원본과 번역본",
    "서류와 제가 겪은",
    "번역본·문구",
  ],
};

async function runPath(page, pathKey, steps, withExpert) {
  const row = {
    path: pathKey,
    phase1: "FAIL",
    freeResult: "NOT VERIFIED",
    phase2: "NOT VERIFIED",
    secondResult: "NOT VERIFIED",
    expert: withExpert ? "NOT VERIFIED" : "SKIP",
    verdict: "FAIL",
    evidence: {},
  };
  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await phase1(page, steps);
    await signup(page, pathKey);
    row.phase1 = "PASS";
    const free = await metrics(page);
    row.evidence.free = free;
    row.freeResult =
      free.firstResult &&
      free.section01 &&
      free.section02 &&
      free.section03 &&
      free.section04 &&
      free.section05 &&
      free.claimFootnote &&
      !free.entryQ1 &&
      free.paidCta
        ? "PASS"
        : "FAIL";

    await page.getByRole("button", { name: /개인화 상세검토|2차 개인화/ }).first().click();
    await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
    const p2s = await metrics(page);
    row.evidence.p2start = p2s;
    row.phase2 = p2s.phase2Banner && p2s.gateShell && !p2s.entryQ1 ? "PASS" : "FAIL";

    const fin = await advanceP2(page);
    row.evidence.second = fin;
    row.secondResult =
      fin.secondResult && fin.expertCta && fin.aiReportCta
        ? "PASS"
        : fin.secondResult
          ? "CONDITIONAL"
          : "FAIL";

    if (withExpert) {
      let meta = null;
      await page.route("**/rest/v1/crm_activities**", async (route) => {
        if (route.request().method() === "POST") {
          try {
            const body = route.request().postDataJSON();
            if (body?.action === "expert_review_request") meta = body.meta;
          } catch {}
        }
        await route.continue();
      });
      await page.getByRole("button", { name: "전문가 진행하기" }).click();
      await page.waitForTimeout(3500);
      let h = null;
      if (meta?.real_estate_expert_handoff_json) {
        h = JSON.parse(meta.real_estate_expert_handoff_json);
      }
      row.evidence.expert = h
        ? {
            customerClaims: h.customerClaims?.length ?? 0,
            counterpartyClaims: h.counterpartyClaims?.length ?? 0,
            confirmedFacts: h.confirmedFacts?.length ?? 0,
            inferredFacts: h.inferredFacts?.length ?? 0,
            unknownFacts: h.unknownFacts?.length ?? 0,
            phase2Keys: Object.keys(h.phase2Answers ?? {}).length,
            materialStop: h.materialStop,
          }
        : { captured: !!meta };
      row.expert =
        h && Array.isArray(h.customerClaims) && h.customerClaims.length > 0 ? "PASS" : "FAIL";
    }

    const core = [row.phase1, row.freeResult, row.phase2, row.secondResult].every((x) => x === "PASS");
    row.verdict = core ? (withExpert && row.expert !== "PASS" ? "CONDITIONAL" : "PASS") : "FAIL";
  } catch (e) {
    row.error = e instanceof Error ? e.message : String(e);
  }
  return row;
}

const rows = [];
const browser = await chromium.launch({ headless: true });

for (const [key, steps] of Object.entries(PATHS)) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  rows.push(await runPath(page, key, steps, key === "PRE_CONTRACT"));
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const row = {
    path: "UNCLEAR",
    phase1: "FAIL",
    freeResult: "NOT VERIFIED",
    phase2: "NOT VERIFIED",
    secondResult: "NOT VERIFIED",
    expert: "SKIP",
    verdict: "FAIL",
    evidence: {},
  };
  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await click(page, "제 상황부터 설명");
    await submitTa(
      page,
      "최근 집주소와 연락처가 적힌 안내를 받았습니다. 무엇부터 확인해야 할지 정리가 되지 않습니다.",
    );
    await signup(page, "UNCLEAR");
    row.phase1 = "PASS";
    const free = await metrics(page);
    row.freeResult = free.firstResult && free.section01 && !free.entryQ1 ? "PASS" : "FAIL";
    row.evidence.free = free;
    await page.getByRole("button", { name: /개인화 상세검토|2차 개인화/ }).first().click();
    await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
    await click(page, "돈·보증금·계약금 상태");
    await click(page, "아직 돈 문제를 분류하기 어렵");
    await page.waitForTimeout(1000);
    const before = await metrics(page);
    row.evidence.materialStopBefore = {
      blocked: !before.secondResult && before.hasTextarea,
      secondResult: before.secondResult,
      hasTextarea: before.hasTextarea,
    };
    if (before.secondResult) {
      row.phase2 = "FAIL";
      row.secondResult = "FAIL";
    } else {
      await submitTa(page, DETAIL);
      const fin = await advanceP2(page);
      row.phase2 = "PASS";
      row.secondResult = fin.secondResult ? "PASS" : "FAIL";
      row.evidence.second = fin;
    }
    row.verdict =
      row.phase1 === "PASS" &&
      row.freeResult === "PASS" &&
      row.evidence.materialStopBefore?.blocked &&
      row.secondResult === "PASS"
        ? "PASS"
        : "CONDITIONAL";
  } catch (e) {
    row.error = e instanceof Error ? e.message : String(e);
  }
  rows.push(row);
  await page.close();
}

const regression = {};
for (const [url, needle, key] of [
  [`${BASE}/verify/admin`, "검토 내용 체크", "admin"],
  [`${BASE}/check/trc`, "거주증", "trc"],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const body = await page.locator("body").innerText();
  regression[key] = { loaded: body.includes(needle), questionFlow: body.includes("01") || body.includes("검토") };
  await page.close();
}

await browser.close();

const report = { rows, regression, executedAt: new Date().toISOString() };
writeFileSync("tests/qa/.re-v12-e2e-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
