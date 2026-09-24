import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY,
  CASE06_BRIDGE_TARGET_CASE_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
} from "../../src/lib/adminVerifyProfiling.ts";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010";
const OUT = join(process.cwd(), "test-results", "case01-bridge-phase1-gate-spot");
mkdirSync(OUT, { recursive: true });

const bridgedIncompleteP1 = attachCaseResolutionSnapshot({
  situation: "received_document",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "unclear",
  case06_requiredActionCandidate: "problem_action_unclear",
  case06_knowledgeSource: "path_unclear",
  case06_sourceChannel: "source_unknown",
  case06_deadlineActionPair: "action_unclear_timing",
  case06_customerResponse: "no_response_yet",
  case06_unclearContentRecheck: "signal_violation",
  [CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY]: "1",
  [CASE06_BRIDGE_TARGET_CASE_KEY]: "CASE_01",
});

const phase2Qs = buildAdminVerifyProfileQuestions(
  bridgedIncompleteP1,
  {},
  { mismatch: [], unknown: [], other: [] },
  2,
);
const firstId =
  phase2Qs.find((q) => q.id !== ADMIN_CASE_ENTRY_Q1_KEY && !q.id.startsWith("case06_"))?.id ?? "";
const enginePass = firstId === "case01_violationContent" || firstId === "case01_confirmGoal";

const report = {
  base: BASE,
  engine: { firstQuestionId: firstId, pass: enginePass, phase2Count: phase2Qs.length },
  browser: { entry: false },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(`${BASE}/verify/admin`, { waitUntil: "networkidle", timeout: 60_000 });
  report.browser.entry = page.url().includes("/verify/admin");
} catch (e) {
  report.browser.error = String(e.message ?? e);
} finally {
  await browser.close();
}

report.pass = enginePass && report.browser.entry;
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
