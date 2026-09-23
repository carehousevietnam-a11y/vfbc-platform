import { chromium } from "playwright";

const PARTICLES = /^(이|가|은|는|을|를|의|에|에서|와|과|도|만|로|으로|다|습니다|입니다|함|음|임)$/;

async function reachCase02Result(page) {
  await page.goto("http://localhost:3010/verify/admin", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(800);
  const steps = [
    /벌금이나 비용을 납부/,
    /교통위반에 대한 벌금/,
    /교통국·교통 관련 행정기관/,
    /특정 교통위반이나 과태료/,
    /납부할 금액이 명확하게/,
    /일부 내용이나 금액이 실제 상황과 다릅니다/,
    /기한은 있지만 정확한 날짜를 모르겠습니다/,
    /아직 납부하지 않았습니다/,
  ];
  for (const step of steps) {
    if (await page.getByText("01 / 종합 판단").isVisible().catch(() => false)) break;
    const btn = page.getByRole("button", { name: step }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(700);
    }
  }
  return page.getByText("01 / 종합 판단").isVisible().catch(() => false);
}

function analyzeLines(rects, text) {
  if (!rects.length) return { lines: 0, issues: [] };
  const lines = [];
  for (const r of rects) {
    const y = Math.round(r.top);
    const existing = lines.find((l) => Math.abs(l.y - y) < 3);
    if (existing) existing.width += r.width;
    else lines.push({ y, width: r.width, text: "" });
  }
  lines.sort((a, b) => a.y - b.y);

  const words = text.trim().split(/\s+/);
  const issues = [];
  if (lines.length >= 2) {
    const lastWord = words[words.length - 1] ?? "";
    if (words.length >= 2 && words[words.length - 2].length <= 2 && lastWord.length > 4) {
      issues.push("short_penultimate_word");
    }
    const lineTexts = text.split(/\n/).filter(Boolean);
    for (const lt of lineTexts) {
      const w = lt.trim().split(/\s+/).pop() ?? lt.trim();
      if (PARTICLES.test(w)) issues.push(`particle_alone:${w}`);
    }
  }
  return { lines: lines.length, issues };
}

async function measure(page, label) {
  const reached = await reachCase02Result(page);
  if (!reached) return { label, error: "Result page not reached" };

  const data = await page.evaluate(() => {
    const cs = (el) => getComputedStyle(el);
    const lineRects = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return [...range.getClientRects()].map((r) => ({
        top: r.top,
        width: r.width,
        height: r.height,
      }));
    };

    const section = (title) => {
      const h = [...document.querySelectorAll("h2, h3, span")].find((el) =>
        el.textContent?.trim().startsWith(title),
      );
      return h?.closest("section") ?? h?.parentElement?.parentElement;
    };

    const texts = [];
    const h1 = [...document.querySelectorAll("h1")].find((el) =>
      el.textContent?.includes("행정문서 1차 종합 결과"),
    );
    if (h1) texts.push({ area: "page_title", text: h1.textContent?.trim() ?? "", el: "h1" });

    const intro = h1?.parentElement?.querySelector("p");
    if (intro) texts.push({ area: "page_intro", text: intro.textContent?.trim() ?? "" });

    const s01 = section("01 / 종합 판단");
    const verdictH = s01?.querySelector("h3");
    const verdictP = s01?.querySelector("p");
    if (verdictH) texts.push({ area: "01_headline", text: verdictH.textContent?.trim() ?? "" });
    if (verdictP) texts.push({ area: "01_summary", text: verdictP.textContent?.trim() ?? "" });

    const s02 = section("02 / 핵심 확인 결과");
    const metrics = s02?.querySelectorAll(".grid > div") ?? [];
    metrics.forEach((card, i) => {
      const title = card.querySelector("h4");
      const foot = card.querySelector("p");
      if (title) texts.push({ area: `02_metric_${i + 1}_title`, text: title.textContent?.trim() ?? "" });
      if (foot) texts.push({ area: `02_metric_${i + 1}_foot`, text: foot.textContent?.trim() ?? "" });
    });

    const s03 = section("03 / 주요 위험 요인");
    s03?.querySelectorAll("h4").forEach((el, i) => {
      texts.push({ area: `03_caution_${i + 1}`, text: el.textContent?.trim() ?? "" });
    });

    const s04 = section("04 / 확인이 필요한 사항");
    s04?.querySelectorAll("h4 span, .flex-1 > div > div span").forEach((el, i) => {
      const t = el.textContent?.trim() ?? "";
      if (t && t !== "추가 확인" && !t.includes("✓")) {
        texts.push({ area: `04_unconfirmed_${i + 1}`, text: t });
      }
    });
    const s04cards = s04?.querySelectorAll(".grid > div") ?? [];
    s04cards.forEach((card, i) => {
      const spans = [...card.querySelectorAll("span")].filter(
        (s) => !s.textContent?.includes("추가 확인") && s.textContent?.trim().length > 3,
      );
      const titleSpan = spans.find((s) => !/^[✓□]$/.test(s.textContent?.trim() ?? ""));
      if (titleSpan) texts.push({ area: `04_card_${i + 1}`, text: titleSpan.textContent?.trim() ?? "" });
    });

    const s05 = section("05 / 지금 확인해 보세요");
    s05?.querySelectorAll("h4").forEach((el, i) => {
      texts.push({ area: `05_action_${i + 1}`, text: el.textContent?.trim() ?? "" });
    });

    const ctaH = [...document.querySelectorAll("h3")].find((el) =>
      el.textContent?.includes("검토 결과 적용"),
    );
    const ctaP = ctaH?.parentElement?.querySelector("p");
    if (ctaH) texts.push({ area: "cta_title", text: ctaH.textContent?.trim() ?? "" });
    if (ctaP) texts.push({ area: "cta_desc", text: ctaP.textContent?.trim() ?? "" });

    return texts.map((t) => {
      let el = null;
      if (t.el === "h1") el = h1;
      else {
        const found = [...document.querySelectorAll("h1,h3,h4,p,span")].find(
          (node) => node.textContent?.trim() === t.text && node.children.length === 0,
        );
        el = found;
      }
      const rects = el ? lineRects(el) : [];
      const nowrap = el ? cs(el).whiteSpace : "";
      return { ...t, lineCount: rects.length ? new Set(rects.map((r) => Math.round(r.top))).size : 0, nowrap };
    });
  });

  await page.screenshot({ path: `qa-first-result-text-${label}.png`, fullPage: true });

  const badOrphans = data.filter((d) => {
    const words = d.text.split(/\s+/);
    if (d.lineCount < 2) return false;
    if (words.length === 1 && d.text.length > 8 && d.lineCount >= 2) {
      const chars = d.text.replace(/\s/g, "");
      if (chars.length > 10) return true;
    }
    return false;
  });

  return {
    label,
    viewport: label,
    textCount: data.length,
    multiLine: data.filter((d) => d.lineCount > 1).map((d) => ({
      area: d.area,
      lines: d.lineCount,
      text: d.text.slice(0, 60),
      nowrap: d.nowrap,
    })),
    nowrapUsed: data.filter((d) => d.nowrap === "nowrap").map((d) => d.area),
    possibleOrphans: badOrphans.map((d) => ({ area: d.area, text: d.text, lines: d.lineCount })),
    section04Titles: data.filter((d) => d.area.startsWith("04_")).map((d) => ({
      area: d.area,
      text: d.text,
      lines: d.lineCount,
    })),
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
const desktop = await measure(page, "desktop");
await page.setViewportSize({ width: 375, height: 900 });
const mobile = await measure(page, "mobile");
console.log(JSON.stringify({ desktop, mobile }, null, 2));
await browser.close();
