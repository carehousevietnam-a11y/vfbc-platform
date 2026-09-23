/**
 * P0.6 verification — FREE restore + Expert Handoff payload
 * Run: node tests/qa/p0.6-re-product-fix-verify.mjs
 */
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";

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
    { timeout: 25_000 },
  );
  await page.waitForTimeout(450);
}

async function advanceToPersonalized(page) {
  for (let i = 0; i < 35; i++) {
    const snap = await page.evaluate(() => ({
      personalized: document.body.innerText.includes("부동산 문서 2차 개인화 결과"),
      evidence: document.body.innerText.includes("간단한 자료가 있으면 함께 첨부"),
      hasTextarea: !!document.querySelector("textarea"),
    }));
    if (snap.personalized) return true;
    if (snap.evidence) {
      await page.getByRole("button", { name: /자료 없이 계속하기/ }).click();
      await page.waitForTimeout(800);
      continue;
    }
    if (snap.hasTextarea) {
      await page.locator("textarea").first().fill(
        "계약서 조건과 실제 상황 차이를 확인해야 합니다. 보증금 반환 조건이 문서와 다릅니다.",
      );
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && b.textContent?.trim() === "다음",
        );
        btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(600);
      continue;
    }
    const ok = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => {
        const r = b.getBoundingClientRect();
        const t = (b.textContent || "").trim();
        return r.width > 0 && /^\d{2}/.test(t) && !t.includes("직접 설명하기");
      });
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    });
    if (!ok) break;
    await page.waitForTimeout(500);
  }
  return page.evaluate(() => document.body.innerText.includes("부동산 문서 2차 개인화 결과"));
}

const report = { parserUnit: null, freeRestore: null, expertPayload: null };

{
  const mod = await import(
    pathToFileURL(join(process.cwd(), "src/lib/realEstateVerifyProfiling.ts")).href,
  );
  const metaFromDb = {
    review_stage: "pre",
    real_estate_resolution_path: "PRE_CONTRACT",
    real_estate_situation_profile_json: JSON.stringify({
      property: { value: "매매", status: "confirmed", source: "re_propertyType" },
      transaction: { value: "사전 검토(계약·서명 전)", status: "confirmed", source: "realEstateSituationEntry" },
      contractStage: { value: "계약서 초안이나 관련 서류를 받았습니다", status: "confirmed", source: "re_preStage" },
      parties: { value: "집주인·매도인과 직접 조건을 맞추고 있습니다", status: "confirmed", source: "re_counterparty" },
      claims: { value: "계약서 초안이나 관련 서류를 받았습니다", status: "confirmed", source: "re_disputeSubject" },
      facts: { value: "", status: "unknown", source: "re_situationGap" },
      documents: { value: "서류와 제가 겪은 실제 상황이 다릅니다", status: "confirmed", source: "re_docsMatch" },
      money: { value: null, status: "unknown", source: "re_propertyType" },
      dates: { value: null, status: "unknown", source: "re_situationGap" },
      actions: { value: "나에게 불리하거나 위험한 조항이 있는지 보고 싶습니다", status: "confirmed", source: "re_goal" },
      responses: { value: null, status: "unknown", source: "re_goal" },
      rights: { value: null, status: "unknown", source: "re_disputeSubject" },
      evidence: { value: null, status: "unknown", source: "_realEstateEvidenceAttached" },
      risk: { value: "금액·보증금 표현이 원본과 다릅니다", status: "confirmed", source: "re_docsMatch" },
      goal: { value: "나에게 불리하거나 위험한 조항이 있는지 보고 싶습니다", status: "confirmed", source: "re_goal" },
      resolutionPath: "PRE_CONTRACT",
      customerInput: "",
    }),
  };
  const restored = mod.restoreRealEstateProfilingAnswersFromMeta(metaFromDb);
  report.parserUnit = {
    profilingComplete: restored?._realEstateProfilingComplete,
    nextMissing: restored?._realEstateNextMissing,
    situationGap: restored?.re_situationGap,
    isComplete: mod.isRealEstateProfilingComplete(restored ?? {}),
  };
}

const browser = await chromium.launch({ headless: true });

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await click(page, "초안");
  await click(page, "사거나 팔려");
  await click(page, "집주인·매도인");
  await click(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
  await click(page, "서류와 제가 겪은");
  await click(page, "금액·보증금");
  await page.locator('input[name="name"]').waitFor({ state: "visible" });
  await page.locator('input[name="name"]').fill("P06 Restore QA");
  await page.locator('input[name="phone"]').fill("09088881111");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`p06-restore-${Date.now()}@test.local`);
  await page.locator('input[name="kakao_id"]').fill("p06restore");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });

  await page.goto(`${BASE}/verify/real-estate?restore=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);
  const body = await page.locator("body").innerText();
  report.freeRestore = {
    oneResult: body.includes("부동산 문서 1차 종합 결과"),
    entryQ1: body.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요?"),
    paidCta: body.includes("개인화 상세검토 하기"),
  };
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  let expertInsert = null;
  await page.route("**/rest/v1/crm_activities**", async (route) => {
    if (route.request().method() === "POST") {
      try {
        const body = route.request().postDataJSON();
        if (body?.action === "expert_review_request") expertInsert = body.meta;
      } catch {
        // ignore
      }
    }
    await route.continue();
  });

  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await click(page, "서명·납부 전");
  await page.getByRole("heading", { name: /서명 전 단계입니다/ }).waitFor();
  await click(page, "초안");
  await click(page, "사거나 팔려");
  await click(page, "집주인·매도인");
  await click(page, "불리하거나 위험한");
  await page.getByRole("heading", { name: /받은 서류 내용이/ }).waitFor();
  await click(page, "서류와 제가 겪은");
  await click(page, "금액·보증금");
  await page.locator('input[name="name"]').waitFor({ state: "visible" });
  await page.locator('input[name="name"]').fill("P06 Expert QA");
  await page.locator('input[name="phone"]').fill("09088880000");
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`p06-expert-${Date.now()}@test.local`);
  await page.locator('input[name="kakao_id"]').fill("p06expert");
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
  await page.getByRole("button", { name: /개인화 상세검토 하기|2차 개인화/ }).first().click();
  await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
  await advanceToPersonalized(page);
  await page.getByRole("button", { name: "전문가 진행하기" }).click();
  await page.waitForTimeout(3000);

  let handoff = null;
  if (expertInsert?.real_estate_expert_handoff_json) {
    try {
      handoff = JSON.parse(expertInsert.real_estate_expert_handoff_json);
    } catch {
      handoff = null;
    }
  }
  report.expertPayload = {
    captured: !!expertInsert,
    topLevelPhase2: expertInsert?.real_estate_phase2_answers_json ?? null,
    handoffKeys: handoff ? Object.keys(handoff) : null,
    phase2AnswerKeys: handoff?.phase2Answers ? Object.keys(handoff.phase2Answers) : [],
    phase2AnswerCount: handoff?.phase2Answers ? Object.keys(handoff.phase2Answers).length : 0,
    required: handoff
      ? {
          customerOriginalInput: handoff.customerOriginalInput != null,
          situationProfile: handoff.situationProfile != null,
          phase1CarryOver: Array.isArray(handoff.phase1CarryOver),
          phase2Answers: handoff.phase2Answers != null,
          confirmedFacts: Array.isArray(handoff.confirmedFacts),
          inferredFacts: Array.isArray(handoff.inferredFacts),
          unknownFacts: Array.isArray(handoff.unknownFacts),
          expertFocus: typeof handoff.expertFocus === "string" && handoff.expertFocus.length > 0,
        }
      : null,
  };
  await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));

const passParser = report.parserUnit?.profilingComplete === "1";
const passRestore =
  report.freeRestore?.oneResult &&
  !report.freeRestore?.entryQ1 &&
  report.freeRestore?.paidCta;
const passExpert =
  report.expertPayload?.phase2AnswerCount >= 1 &&
  report.expertPayload?.required?.situationProfile &&
  report.expertPayload?.required?.expertFocus;

if (!passParser || !passRestore || !passExpert) {
  console.error("FAIL", { passParser, passRestore, passExpert });
  process.exit(1);
}
console.log("PASS: P0.6 product fix verification");
