import { chromium } from "@playwright/test";

const BASE = "http://localhost:3010";
const LABELS = {
  conflictFocus: "서류 내용과 실제 겪은 상황이 다를 때",
  conflictDetail: "불일치 부분 — 서류와 실제 상황이 어디서",
};

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
  await page.waitForTimeout(500);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE}/verify/real-estate`);
await page.waitForTimeout(900);
for (const s of [
  "서명·납부 전",
  "초안",
  "소유권 이전",
  "집주인·매도인",
  "불리하거나 위험한",
  "서류와 제가 겪은",
  "상대가 말로 한",
]) {
  await click(page, s);
}
await page.getByRole("button", { name: /자료 없이/ }).click();
await page.locator('input[name="name"]').fill("QA B2");
await page.locator('input[name="phone"]').fill(`0903333${Math.floor(Math.random() * 900) + 100}`);
await page.locator('input[name="address"]').fill("Q7");
await page.locator('input[name="email"]').fill(`b2-${Date.now()}@test.vfbcai.local`);
await page.locator('input[name="kakao_id"]').fill(`b2${Date.now().toString().slice(-4)}`);
await page.locator('input[name="agreeTerms"]').check();
await page.getByRole("button", { name: "AI 1차 분석 결과 보기" }).click();
await page
  .getByRole("heading", { name: "부동산 문서 1차 종합 결과" })
  .waitFor({ timeout: 120_000 });
await page.getByRole("button", { name: "개인화 상세검토 하기" }).click();
await page.getByText("2차 · 개인화 검토").waitFor({ timeout: 20_000 });

const order = [];
for (let i = 0; i < 6; i++) {
  const body = await page.evaluate(() => document.body.innerText);
  const active =
    Object.entries(LABELS).find(([, s]) => body.includes(s))?.[1] ??
    (body.includes("등기·소유권 쪽에서")
      ? "regConcern"
      : body.includes("가장 걸리는 조항")
        ? "clauseFocus"
        : body.includes("걸리는 조항 —")
          ? "clauseDetail"
          : body.includes("2차 추가 확인 완료")
            ? "completion"
            : null);
  order.push(active);
  if (active === "completion") break;
  if (body.includes(LABELS.conflictFocus)) break;

  if (body.includes("걸리는 조항 —")) {
    await page.locator("textarea").first().fill("해지 시 보증금 전액 몰수 조항이 있습니다.");
    await page.getByRole("button", { name: "다음" }).click();
    await page.waitForTimeout(700);
    continue;
  }

  const clicked = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const btns = [...document.querySelectorAll("button")].filter(visible);
    const choice = btns.find((b) => {
      const t = b.textContent ?? "";
      return (
        t.includes("등기부등본") ||
        t.includes("해지·위약") ||
        t.includes("매도인·임대인")
      );
    });
    if (choice) {
      choice.click();
      return true;
    }
    return false;
  });
  if (!clicked) break;
  await page.waitForTimeout(600);
}

const finalBody = await page.evaluate(() => document.body.innerText);
console.log(
  JSON.stringify(
    {
      order,
      hasConflictFocus: finalBody.includes(LABELS.conflictFocus),
      hasConflictDetail: finalBody.includes(LABELS.conflictDetail),
      hasDocsRepeat: finalBody.includes("받은 서류 내용이"),
      hasCompletion: finalBody.includes("2차 추가 확인 완료"),
    },
    null,
    2,
  ),
);
await browser.close();
