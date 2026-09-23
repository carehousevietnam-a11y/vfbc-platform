import { chromium } from "playwright";

const SCENARIOS = [
  {
    id: "CASE_06->01",
    q2: /01 어떤 문제나 위반 사실을 알리는/,
    q3: /01 문제나 위반과 관련해 대응/,
    expect: "위반·문제 통지",
  },
  {
    id: "CASE_06->02",
    q2: /02 돈을 납부하라는 내용/,
    q3: /02 돈을 납부하거나 비용/,
    expect: "납부 요구",
  },
  {
    id: "CASE_06->03",
    q2: /03 기관에 출석하거나 설명/,
    q3: /03 직접 출석하거나 설명/,
    expect: "출석·소명 요구",
  },
  {
    id: "CASE_06->04",
    q2: /04 추가 서류나 자료를 제출하라는 내용으로 보입니다/,
    q3: /04 추가 서류나 자료를 제출해야 하는 것으로 보입니다/,
    expect: "보완 요구",
  },
  {
    id: "CASE_06->05",
    q2: /05 어떤 처분이나 제한/,
    q3: /05 특정 조치나 제한/,
    expect: "처분·조치 통지",
  },
  {
    id: "CASE_06 keep",
    q2: /06 위 항목 중 어디에 해당하는지 판단하기 어렵/,
    q3: /06 무엇을 해야 하는지 알기 어렵/,
    expect: "불명확한 행정문서",
  },
];

async function clickBtn(page, pattern) {
  const btn = page.getByRole("button", { name: pattern, pressed: false }).first();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(650);
}

async function runScenario(page, scenario) {
  await page.goto("http://localhost:3010/verify/admin?start=check", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await clickBtn(page, /06 무슨 내용인지 잘 모르겠습니다/);
  await clickBtn(page, /01 정부기관이나 공공기관/);
  await clickBtn(page, scenario.q2);
  await clickBtn(page, scenario.q3);
  await clickBtn(page, /02 대응 기한이 있다는 것은 알지만/);
  if (scenario.expect === "불명확한 행정문서") {
    await clickBtn(page, /06 전체적으로 문서의 의미를 이해하기 어렵/);
  } else {
    await clickBtn(page, /02 무엇을 해야 하는지 이해하기 어렵/);
  }

  await page
    .getByRole("heading", { name: "행정문서 1차 종합 결과" })
    .waitFor({ state: "visible", timeout: 15000 });

  const body = await page.locator("body").innerText();
  const ok = body.includes(`사건 유형(${scenario.expect})`);
  return { ...scenario, ok, snippet: body.match(/사건 유형\([^)]+\)/)?.[0] ?? "NOT FOUND" };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const results = [];
for (const s of SCENARIOS) {
  try {
    results.push(await runScenario(page, s));
  } catch (err) {
    results.push({ ...s, ok: false, error: String(err) });
  }
}
await browser.close();

let pass = 0;
for (const r of results) {
  const status = r.ok ? "PASS" : "FAIL";
  if (r.ok) pass += 1;
  console.log(`${status} ${r.id}: ${r.snippet ?? r.error ?? "no snippet"}`);
}
console.log(`\n${pass}/${results.length} browser reclassification checks passed`);
process.exit(pass === results.length ? 0 : 1);
