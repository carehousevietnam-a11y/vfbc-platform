import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = path.join("qa-ui-final", "2026-09-20");

const VIEWPORTS = [
  { id: "pc-1440", width: 1440, height: 900 },
  { id: "pc-1280", width: 1280, height: 800 },
  { id: "mobile-430", width: 430, height: 932 },
  { id: "mobile-390", width: 390, height: 844 },
  { id: "mobile-375", width: 375, height: 812 },
];

const SCREENS = [
  { id: "home", path: "/" },
  { id: "check-trc-landing", path: "/check/trc" },
  { id: "check-trc-q1", path: "/check/trc?start=check" },
  { id: "verify-admin-landing", path: "/verify/admin" },
  { id: "verify-re-landing", path: "/verify/real-estate" },
  { id: "register-company-landing", path: "/register/company" },
  { id: "register-company-q1", path: "/register/company?start=check" },
];

function measureOverflow() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const overflowing = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.right > vw + 2 || r.left < -2) {
      const cs = getComputedStyle(el);
      overflowing.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 80),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        vw,
        overflowX: cs.overflowX,
      });
      if (overflowing.length >= 12) break;
    }
  }
  return {
    horizontalScrollbar: sw > vw + 2,
    scrollWidth: sw,
    clientWidth: vw,
    overflowing,
  };
}

async function waitSettled(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1200);
}

async function capture(page, screenId, viewportId, suffix = "") {
  const name = `${screenId}__${viewportId}${suffix ? `__${suffix}` : ""}`;
  const vpPath = path.join(OUT, `${name}__viewport.png`);
  const fpPath = path.join(OUT, `${name}__full.png`);
  await page.screenshot({ path: vpPath });
  await page.screenshot({ path: fpPath, fullPage: true });
  const metrics = await page.evaluate(measureOverflow);
  return { name, vpPath, fpPath, metrics };
}

async function maybeOpenQuestions(page) {
  const clicked = await page.evaluate(() => {
    const labels = [
      "내 상황 확인하기",
      "직접 검토하기",
      "검토 시작",
      "질문 시작",
      "확인 시작",
    ];
    const buttons = [...document.querySelectorAll("button, a")];
    for (const label of labels) {
      const el = buttons.find((b) => (b.textContent || "").includes(label));
      if (el) {
        el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        return label;
      }
    }
    return null;
  });
  if (clicked) await page.waitForTimeout(1500);
  return clicked;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = [];

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      for (const screen of SCREENS) {
        try {
          await page.goto(`${BASE}${screen.path}`, { waitUntil: "load", timeout: 60_000 });
        } catch {
          await page.goto(`${BASE}${screen.path}`, { waitUntil: "commit", timeout: 60_000 });
        }
        await waitSettled(page);
        const title = await page.title();
        const heading = await page.locator("h1").first().innerText().catch(() => "");
        const shot = await capture(page, screen.id, vp.id);
        report.push({
          screen: screen.id,
          path: screen.path,
          viewport: vp.id,
          title,
          heading: heading.slice(0, 120),
          ...shot.metrics,
        });

        if (screen.id.endsWith("-landing")) {
          const cta = await maybeOpenQuestions(page);
          if (cta) {
            const qHeading = await page.locator("h1, h2").first().innerText().catch(() => "");
            const qShot = await capture(page, `${screen.id}-after-cta`, vp.id);
            report.push({
              screen: `${screen.id}-after-cta`,
              path: screen.path,
              viewport: vp.id,
              cta,
              heading: qHeading.slice(0, 120),
              ...qShot.metrics,
            });
          }
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const jsonPath = path.join(OUT, "overflow-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  const fails = report.filter((r) => r.horizontalScrollbar || (r.overflowing && r.overflowing.length));
  console.log(JSON.stringify({
    out: OUT,
    captured: report.length,
    overflowHits: fails.length,
    hits: fails.map((f) => ({
      screen: f.screen,
      viewport: f.viewport,
      horizontalScrollbar: f.horizontalScrollbar,
      overflowCount: f.overflowing?.length ?? 0,
    })),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
