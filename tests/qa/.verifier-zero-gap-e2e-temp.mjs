/** VERIFIER ONLY — delete after QA. RE-MASTER-FULL-FUNNEL-ZERO-GAP final E2E */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const FIXTURE = path.join(process.cwd(), "tests/qa/fixtures/qa-sample-contract.pdf");
const P1FIX = "qa-phase1-contract.pdf";
const P2FIX = "qa-phase2-addendum.pdf";
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
  await page.waitForTimeout(400);
}

async function runPrePhase1(page) {
  await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await click(page, "서명·납부 전");
  await click(page, "매물만 보고");
  await click(page, "전세·월세");
  await click(page, "집주인·매도인");
  await click(page, "제출·계약 요건");
  await page.getByText("1차 · 간단 자료").waitFor({ timeout: 30000 });
}

async function signup(page, tag) {
  await page.locator('input[name="name"]').waitFor({ state: "visible", timeout: 30000 });
  await page.locator('input[name="name"]').fill(`E2E ${tag}`);
  await page.locator('input[name="phone"]').fill(`0907777${Math.floor(Math.random() * 900 + 100)}`);
  await page.locator('input[name="address"]').fill("Quan 7");
  await page.locator('input[name="email"]').fill(`${tag}-${Date.now()}@e2e.local`);
  await page.locator('input[name="kakao_id"]').fill(`k${Date.now().toString().slice(-5)}`);
  await page.locator('input[name="agreeTerms"]').check();
  await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
  await page.getByRole("heading", { name: "부동산 문서 1차 종합 결과" }).waitFor({ timeout: 90000 });
}

async function advancePhase2Questions(page) {
  for (let i = 0; i < 40; i++) {
    const body = await page.locator("body").innerText();
    if (body.includes("2차 · 간단 자료")) return "evidence";
    if (body.includes("부동산 문서 2차 개인화 결과")) return "result";
    const ta = page.locator("textarea").first();
    if (await ta.isVisible().catch(() => false)) {
      await ta.fill(DETAIL);
      const next = page.getByRole("button", { name: "다음" }).first();
      if (await next.isVisible().catch(() => false)) await next.click();
      await page.waitForTimeout(500);
      continue;
    }
    const clicked = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden";
      };
      const btn = [...document.querySelectorAll("button")].find((b) => {
        if (!vis(b)) return false;
        const t = (b.textContent || "").trim();
        return /^\d{2}/.test(t) && !t.includes("직접 설명하기");
      });
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      return true;
    });
    if (!clicked) break;
    await page.waitForTimeout(500);
  }
  return "timeout";
}

const report = {
  executedAt: new Date().toISOString(),
  paths: {},
  regression: {},
  storage: {},
  cta: {},
  expert: {},
};

const browser = await chromium.launch({ headless: true });
const pdfBuffer = readFileSync(FIXTURE);

async function runPath(pathKey, steps, opts = {}) {
  const row = {
    phase1Evidence: "NOT VERIFIED",
    phase1Result: "NOT VERIFIED",
    phase2Questions: "NOT VERIFIED",
    phase2Evidence: "NOT VERIFIED",
    phase2Result: "NOT VERIFIED",
    evidenceSeparation: "NOT VERIFIED",
  };
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const storageUploads = [];
  await page.route("**/storage/v1/object/**", async (route) => {
    const req = route.request();
    if (req.method() === "POST" || req.method() === "PUT") {
      storageUploads.push(req.url());
    }
    await route.continue();
  });

  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    for (const s of steps) await click(page, s);
    await page.getByText("1차 · 간단 자료").waitFor({ timeout: 30000 });
    row.phase1Evidence = "PASS";

    if (opts.attachPhase1) {
      await page.locator('input[type="file"]').first().setInputFiles({
        name: P1FIX,
        mimeType: "application/pdf",
        buffer: pdfBuffer,
      });
      await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();
    } else {
      await page.getByRole("button", { name: /자료 없이/ }).click();
    }

    await signup(page, pathKey);
    const body1 = await page.locator("body").innerText();
    row.phase1Result =
      body1.includes("부동산 문서 1차 종합 결과") &&
      body1.includes("01") &&
      body1.includes("개인화 상세검토 하기")
        ? "PASS"
        : "FAIL";
    if (opts.attachPhase1) {
      row.phase1Filename = body1.includes(P1FIX) || body1.includes("참고 자료");
    }

    await page.getByRole("button", { name: /개인화 상세검토/ }).first().click();
    await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20000 });
    const p2start = await page.locator("body").innerText();
    row.phase2Questions =
      p2start.includes("2차 · 개인화 검토") &&
      !p2start.includes("지금 부동산 관련해서 어떤 일이 진행 중인가요?")
        ? "PASS"
        : "FAIL";

    const state = await advancePhase2Questions(page);
    row.phase2Evidence = (await page.getByText("2차 · 간단 자료").count()) > 0 ? "PASS" : "FAIL";

    if (opts.attachPhase2) {
      await page.locator('input[type="file"]').first().setInputFiles({
        name: P2FIX,
        mimeType: "application/pdf",
        buffer: pdfBuffer,
      });
      await page.getByRole("button", { name: /자료 포함하고 계속하기/ }).click();
    } else {
      await page.getByRole("button", { name: /자료 없이/ }).click();
    }

    await page
      .getByRole("heading", { name: "부동산 문서 2차 개인화 결과" })
      .waitFor({ timeout: 90000 });
    const body2 = await page.locator("body").innerText();
    row.phase2Result = body2.includes("2차 개인화") && body2.includes("02") ? "PASS" : "FAIL";
    if (opts.attachPhase2) {
      row.phase2Filename = body2.includes(P2FIX) || body2.includes("첨부 자료");
    }

    row.storagePhase1 = storageUploads.filter((u) => !u.includes("-phase2."));
    row.storagePhase2 = storageUploads.filter((u) => u.includes("-phase2."));
    row.evidenceSeparation =
      row.storagePhase1.length > 0 &&
      row.storagePhase2.length > 0 &&
      !row.storagePhase1.some((u) => u.includes("-phase2.")) &&
      !row.storagePhase2.some((u) => !u.includes("-phase2."))
        ? "PASS"
        : opts.attachPhase1 && opts.attachPhase2
          ? "FAIL"
          : "NOT VERIFIED";

    if (opts.testCta) {
      const nav = page.waitForURL(/\/mypage/, { timeout: 20000 }).catch(() => null);
      await page.getByRole("button", { name: "AI 검토 상세 리포트" }).click();
      row.aiMypage = (await nav) !== null;
      row.aiNotDocuments = !page.url().includes("/documents");
    }

    if (opts.testExpert) {
      let expertMeta = null;
      await page.route("**/rest/v1/crm_activities**", async (route) => {
        if (route.request().method() === "POST") {
          try {
            const body = route.request().postDataJSON();
            if (body?.action === "expert_review_request") expertMeta = body.meta;
          } catch {}
        }
        await route.continue();
      });
      const nav = page.waitForURL(/\/mypage/, { timeout: 20000 }).catch(() => null);
      await page.getByRole("button", { name: "전문가 진행하기" }).click();
      row.expertMypage = (await nav) !== null;
      if (expertMeta?.real_estate_expert_handoff_json) {
        const h = JSON.parse(expertMeta.real_estate_expert_handoff_json);
        row.expertHandoff = {
          materialStop: h.materialStop,
          customerClaims: h.customerClaims?.length ?? 0,
          phase2Keys: Object.keys(h.phase2Answers ?? {}).length,
        };
      }
    }
  } catch (e) {
    row.error = e instanceof Error ? e.message : String(e);
  } finally {
    await page.close();
  }
  return row;
}

report.paths.PRE = await runPath(
  "PRE",
  ["서명·납부 전", "매물만 보고", "전세·월세", "집주인·매도인", "제출·계약 요건"],
  { attachPhase1: false, attachPhase2: false, testCta: true },
);
report.paths.POST = await runPath("POST", [
  "이미 문제가 생겼고",
  "보증금·계약금을 받지",
  "집주인·매도인",
  "아직 공식 대응 전",
  "서류에 적힌 내용과 제가 알고",
]);
report.paths.DOC = await runPath("DOC", [
  "상대나 기관에서 받은",
  "임대차·전세·월세",
  "나에게 불리하거나 위험한",
  "서류와 제가 겹치는 실제",
  "서류의 금액·보증금",
]);
report.paths.UNCLEAR = await runPath("UNCLEAR", [], { testExpert: false });

// UNCLEAR custom
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const row = { phase1Evidence: "NOT VERIFIED", materialStop: "NOT VERIFIED" };
  try {
    await page.goto(`${BASE}/verify/real-estate`, { waitUntil: "networkidle" });
    await click(page, "제 상황부터 설명");
    await page.locator("textarea").first().fill(
      "전세 만료 후 보증금 반환을 요청했는데 임대인이 거절했습니다. 계약서는 있는데 연락이 두절되었습니다.",
    );
    const next = page.getByRole("button", { name: /다음|확인|저장/ }).first();
    if (await next.isVisible().catch(() => false)) await next.click();
    await click(page, "보증금·계약금을 받지");
    await click(page, "집주인·매도인");
    await click(page, "상대방·기관과 협의·조율");
    await click(page, "서류에 적힌 내용과");
    await page.getByText("1차 · 간단 자료").waitFor({ timeout: 30000 });
    row.phase1Evidence = "PASS";
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await signup(page, "UNCLEAR");
    await page.getByRole("button", { name: /개인화 상세검토/ }).first().click();
    await click(page, "돈·보증금·계약금 상태");
    await click(page, "아직 돈 문제를 분류하기 어렵");
    const blocked = !(await page
      .getByRole("heading", { name: "부동산 문서 2차 개인화 결과" })
      .isVisible()
      .catch(() => false));
    row.materialStopBeforeDetail = blocked ? "PASS" : "FAIL";
    await page.locator("textarea").first().fill(DETAIL);
    await page.getByRole("button", { name: "다음" }).first().click();
    await advancePhase2Questions(page);
    await page.getByRole("button", { name: /자료 없이/ }).click();
    await page
      .getByRole("heading", { name: "부동산 문서 2차 개인화 결과" })
      .waitFor({ timeout: 90000 });
    row.materialStopAfterDetail = "PASS";
  } catch (e) {
    row.error = e instanceof Error ? e.message : String(e);
  } finally {
    await page.close();
  }
  report.paths.UNCLEAR = { ...report.paths.UNCLEAR, ...row };
}

report.paths.PRE_EVIDENCE_CHAIN = await runPath(
  "PRE-CHAIN",
  ["서명·납부 전", "매물만 보고", "전세·월세", "집주인·매도인", "제출·계약 요건"],
  { attachPhase1: true, attachPhase2: true },
);

for (const [url, needle, key] of [
  [`${BASE}/verify/admin`, "검토 내용", "admin"],
  [`${BASE}/check/trc`, "거주증", "trc"],
]) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const body = await page.locator("body").innerText();
  report.regression[key] = body.includes(needle) ? "PASS" : "FAIL";
  await page.close();
}

await browser.close();
writeFileSync("tests/qa/.verifier-zero-gap-e2e-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
