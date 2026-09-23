import { chromium } from "playwright";

async function clickIfVisible(page, pattern) {
  const btn = page.getByRole("button", { name: pattern }).first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function runQA(page, width, label) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://localhost:3010/verify/admin", {
    waitUntil: "networkidle",
  });

  const steps = [
    /교통위반이나 문제를 알리는 통지/,
    /특정 교통위반을 했다고 적혀 있습니다/,
    /실제 상황과 대체로 같습니다/,
    /벌금·과태료 등을 납부하라고 했습니다/,
    /아직 아무것도 하지 않았습니다/,
    /대응 기한이 명확하게 적혀 있습니다/,
  ];

  for (const step of steps) {
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
    const clicked = await clickIfVisible(page, step);
    if (!clicked) {
      const heading = await page.locator("h3").last().textContent().catch(() => "");
      return { label, error: `Failed at step ${step}`, heading };
    }
  }

  const hasResult = await page.getByText("01 / 종합 판단").isVisible().catch(() => false);
  if (!hasResult) {
    const heading = await page.locator("h3").last().textContent().catch(() => "");
    return { label, error: "Result screen not reached", heading };
  }

  const measure = await page.evaluate(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const h1 = [...document.querySelectorAll("h1")].find((el) =>
      el.textContent?.includes("행정문서 1차 종합 결과"),
    );
    const panel = h1?.closest("[class*='max-w-']");
    const outer = panel?.parentElement;
    const section02 = [...document.querySelectorAll("h2, h3")].find((el) =>
      el.textContent?.includes("02 / 핵심 확인 결과"),
    );
    const grid = section02?.parentElement?.querySelector(".grid");
    const metricCards = grid ? [...grid.children] : [];
    const section01 = [...document.querySelectorAll("h2, h3")].find((el) =>
      el.textContent?.includes("01 / 종합 판단"),
    );
    const verdictCard = section01?.parentElement?.querySelector(
      "div.rounded-xl.border, div.rounded-lg.border",
    );
    const outerR = rect(outer);
    const viewportW = window.innerWidth;
    const dividerTops = metricCards.slice(0, 4).map((c) => {
      const div = c.querySelector(".border-t");
      return div ? rect(div).top : null;
    });
    const dividerSpread =
      dividerTops.length >= 2
        ? Math.max(...dividerTops) - Math.min(...dividerTops)
        : 0;
    return {
      viewportW,
      outerPad: outer
        ? {
            pl: cs(outer).paddingLeft,
            pr: cs(outer).paddingRight,
            pt: cs(outer).paddingTop,
          }
        : null,
      outerWidth: outerR?.width,
      panelWidth: rect(panel)?.width,
      outerCenterOffset: outerR
        ? Math.abs(viewportW / 2 - (outerR.left + outerR.width / 2))
        : null,
      verdictPad: verdictCard ? cs(verdictCard).padding : null,
      metricCount: metricCards.length,
      metricPad: metricCards[0] ? cs(metricCards[0]).padding : null,
      metricWidthPct: metricCards[0]
        ? ((rect(metricCards[0])?.width || 0) / viewportW) * 100
        : null,
      dividerSpread,
    };
  });

  await page.screenshot({
    path: `qa-admin-verify-spacing-${label}.png`,
    fullPage: true,
  });

  const outerPl = parseFloat(measure.outerPad?.pl ?? "0");
  const verdictP = parseFloat(measure.verdictPad ?? "0");
  const metricP = parseFloat(measure.metricPad ?? "0");
  const pass = {
    centered: (measure.outerCenterOffset ?? 999) < 24,
    outerPadOk: label === "desktop" ? outerPl >= 28 : outerPl >= 14,
    verdictPadOk: verdictP >= 20,
    metricPadOk: metricP >= 16,
    metricCountOk: measure.metricCount === 4,
    dividerAligned: measure.dividerSpread < 4,
    mobileWidthOk: label === "mobile" ? (measure.metricWidthPct ?? 0) > 80 : true,
  };

  return {
    label,
    hasResult: true,
    allPass: Object.values(pass).every(Boolean),
    pass,
    ...measure,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const desktop = await runQA(page, 1280, "desktop");
const mobile = await runQA(page, 375, "mobile");
console.log(JSON.stringify({ desktop, mobile }, null, 2));
await browser.close();
