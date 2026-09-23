import { chromium } from "playwright";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
  isAdminVerifyChoiceFieldComplete,
} from "../src/lib/adminVerifyProfiling.ts";

const BASE = "http://localhost:3010";
const EMPTY_FOLLOW = {};
const EMPTY_DOCS = { mismatch: [], unknown: [], other: [] };
const EXPECT_PHASE2 =
  "2차 추가 확인에서는 미납 시 추가 조치 안내가 있음 — 기한·내용 확인이 필요합니다.";
const EXPECT_PARTIAL =
  "2차 추가 확인에서는 납부 요구와 실제 상황이 다르게 느껴진다는 점이 핵심입니다.";
const EXPECT_DIFFERS =
  "2차 추가 확인에서는 안내 금액과 알고 있는 금액의 차이, 또는 재요구 가능성이 핵심입니다.";

function nextPendingQuestion(answers, phase) {
  const qs = buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, phase);
  const p1Ids =
    phase === 2
      ? new Set(
          buildAdminVerifyProfileQuestions(answers, EMPTY_FOLLOW, EMPTY_DOCS, 1).map((q) => q.id),
        )
      : new Set();
  for (const q of qs) {
    if (q.id === ADMIN_CASE_ENTRY_Q1_KEY && answers[ADMIN_CASE_ENTRY_Q1_KEY]) continue;
    if (phase === 2 && p1Ids.has(q.id)) continue;
    const val = answers[q.id]?.trim() ?? "";
    if (!val) return q;
    if (val === "other" && q.options) {
      if (!isAdminVerifyChoiceFieldComplete(q.id, answers, q.options)) return q;
    }
  }
  return null;
}

async function clickChoice(page, text) {
  const needle = text.slice(0, 32);
  await page.waitForFunction(
    (n) => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        x.textContent?.includes(n),
      );
      if (!b || b.disabled) return false;
      b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    },
    needle,
    { timeout: 45_000 },
  );
  await page.waitForTimeout(550);
}

async function completeSignup(page, tag) {
  const suffix = String(Date.now()).slice(-8) + tag;
  await page.locator('input[name="name"]').fill(`QA ${tag}`);
  await page.locator('input[name="phone"]').fill(`090${suffix.slice(0, 8)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`qa-${tag}-${suffix}@test.vfbcai.local`);
  await page.locator('input[name="kakao_id"]').fill(`k${suffix}`);
  await page.locator('input[name="agreeTerms"]').check({ force: true });
  await page.getByRole("button", { name: /AI 1차 분석 결과 보기/ }).click();
  await page.getByRole("heading", { name: "행정문서 1차 종합 결과" }).waitFor({ timeout: 120_000 });
}

async function runFlow(page, { phase1Overrides = {}, noticeClick, noticeValue, tag }) {
  const phase1 = {
    case02_paymentSubject: "traffic_fine",
    case02_paymentInfoSource: "written_notice",
    case02_situationMatch: "match",
    case02_paymentAmount: "amount_stated_basis_unclear",
    case02_paymentStatus: "not_paid",
    case02_confirmGoal: "verify_obligation",
    ...phase1Overrides,
  };
  let sim = attachCaseResolutionSnapshot({
    situation: "received_document",
    stage: "case",
    profileDocumentSource: "traffic",
  });
  const q1Opt = ADMIN_CASE_ENTRY_Q1_OPTIONS.find((o) => o.value === "payment_demand");
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(700);
  await clickChoice(page, q1Opt.label.slice(0, 24));
  sim = attachCaseResolutionSnapshot({ ...sim, [ADMIN_CASE_ENTRY_Q1_KEY]: "payment_demand" });
  while (nextPendingQuestion(sim, 1)) {
    const q = nextPendingQuestion(sim, 1);
    const value = phase1[q.id];
    const opt = q.options.find((o) => o.value === value);
    await clickChoice(page, opt.label.slice(0, 36));
    sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: value });
  }
  const skip = page.getByRole("button", { name: /자료 없이 계속하기/ });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await completeSignup(page, tag);
  await page.getByRole("button", { name: /개인화 상세 검토하기/ }).click();
  await page.waitForTimeout(900);
  while (true) {
    const body = await page.locator("body").innerText();
    if (body.includes("기한 내 납부하지 않으면") || body.includes("이자·가산금이 붙는다고")) break;
    const q = nextPendingQuestion(sim, 2);
    if (!q) break;
    if (q.id === "case02_demandAuthority") {
      await clickChoice(page, "교통국");
      sim = attachCaseResolutionSnapshot({ ...sim, case02_demandAuthority: "traffic" });
      continue;
    }
    if (q.id === "case02_paymentMethod") {
      await clickChoice(page, "온라인");
      sim = attachCaseResolutionSnapshot({ ...sim, case02_paymentMethod: "online_portal" });
      continue;
    }
    const opt = q.options.find((o) => o.value !== "other");
    await clickChoice(page, opt.label.slice(0, 36));
    sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: opt.value });
  }
  await clickChoice(page, noticeClick);
  sim = attachCaseResolutionSnapshot({ ...sim, case02_nonPaymentNotice: noticeValue });
  for (let i = 0; i < 20; i++) {
    if (await page.getByRole("heading", { name: /행정문서 개인화 검토 결과/ }).isVisible().catch(() => false))
      break;
    const q = nextPendingQuestion(sim, 2);
    if (!q) {
      const sk = page.getByRole("button", { name: /자료 없이 계속하기/ });
      if (await sk.isVisible().catch(() => false)) {
        await sk.click();
        await page.waitForTimeout(700);
        continue;
      }
      break;
    }
    if (q.id === "case02_blockage") {
      await clickChoice(page, "제가 정말 납부해야 하는지부터");
      sim = attachCaseResolutionSnapshot({ ...sim, case02_blockage: "obligation" });
    } else if (q.id === "case02_evidence") {
      await clickChoice(page, "일부 자료만 있고");
      sim = attachCaseResolutionSnapshot({ ...sim, case02_evidence: "partial" });
    } else {
      const opt = q.options.find((o) => o.value !== "other");
      await clickChoice(page, opt.label.slice(0, 36));
      sim = attachCaseResolutionSnapshot({ ...sim, [q.id]: opt.value });
    }
  }
  const phase2Line = await page.evaluate(() => {
    const root = document.querySelector('[data-purpose="ai-analysis-details"]');
    if (!root) return null;
    const spans = [...root.querySelectorAll("span")];
    for (const s of spans) {
      const t = (s.textContent ?? "").trim();
      if (t.startsWith("2차 추가 확인에서는")) return t;
    }
    return null;
  });
  return { phase2Line, noticeStored: sim.case02_nonPaymentNotice };
}

const scenarios = [
  {
    key: "sanction_canonical",
    noticeClick: "기한 내 미납 시 추가 벌금",
    noticeValue: "sanction_enforcement_stated",
    expect: EXPECT_PHASE2,
    tag: "san",
  },
  {
    key: "interest",
    noticeClick: "이자·가산금이 붙는다고",
    noticeValue: "interest_stated",
    expect: EXPECT_PHASE2,
    tag: "int",
  },
  {
    key: "partial_plus_sanction",
    phase1Overrides: { case02_situationMatch: "partial" },
    noticeClick: "기한 내 미납 시 추가 벌금",
    noticeValue: "sanction_enforcement_stated",
    expect: EXPECT_PARTIAL,
    tag: "psan",
  },
  {
    key: "differs_plus_sanction",
    phase1Overrides: { case02_paymentAmount: "amount_differs" },
    noticeClick: "기한 내 미납 시 추가 벌금",
    noticeValue: "sanction_enforcement_stated",
    expect: EXPECT_DIFFERS,
    tag: "dsan",
  },
];

const out = { consoleErrors: [] };
const browser = await chromium.launch({ headless: true });
try {
  for (const s of scenarios) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on("console", (m) => {
      if (m.type() === "error") out.consoleErrors.push(`${s.key}: ${m.text()}`);
    });
    const r = await runFlow(page, s);
    out[s.key] = {
      noticeStored: r.noticeStored,
      phase2Dom: r.phase2Line,
      matchesExpect: r.phase2Line === s.expect,
      notInterestOverride: r.phase2Line !== EXPECT_PHASE2 || s.expect === EXPECT_PHASE2,
    };
    await page.close();
  }
} finally {
  await browser.close();
}

import { case02NormalizeNonPaymentNoticeValue } from "../src/lib/adminVerifyProfiling.ts";
out.legacy_normalize = {
  penalty_stated: case02NormalizeNonPaymentNoticeValue("penalty_stated"),
  enforcement_stated: case02NormalizeNonPaymentNoticeValue("enforcement_stated"),
};

console.log(JSON.stringify(out, null, 2));
