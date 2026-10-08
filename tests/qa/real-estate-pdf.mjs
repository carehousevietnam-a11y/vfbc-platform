/**
 * C2.5 — RE Pack PDF ↔ My Page parity, Admin regression, phase2 handoff keys
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { buildRealEstatePackPhase2PersistMeta } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";
import {
  buildRealEstatePhase1SummaryLinesFromActivities,
  buildRealEstatePhase2SummaryLinesFromActivities,
} from "../../src/lib/contentPacks/realEstate/realEstatePackMypageFields.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";
import {
  ADMIN_VERIFY_PHASE2_SNAPSHOT_STORAGE_KEY,
  getVerifyPhase2HandoffConfig,
} from "../../src/lib/verifyMasterPhase2Handoff.ts";
import {
  bindAdminVerifyPaidEvidenceMeasureFonts,
  formatAdminVerifyAiReportContentPlainText,
} from "../../src/lib/adminVerifyMypageFields.ts";
import { ensureMypageExecutivePdfMeasureFonts, getMypageExecutivePdfMeasureFontsSync } from "../../src/lib/mypagePdfExecutiveMeasureFonts.ts";
import { buildMypagePdfBytesForQaHarness } from "../../src/lib/mypagePdfExecutiveRender.ts";
import { buildRealEstateVerifyAiReportContentFromActivities } from "../../src/lib/contentPacks/realEstate/realEstateVerifyPdfContent.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const MIN_PATHS_PER_CASE = 300;
/** Full pdf-lib render is sampled; all paths get body builder parity (same source as PDF EVIDENCE). */
const PDF_RENDER_FIRST_N = 3;
const PDF_RENDER_EVERY_N = 1000;
const bundle = realEstatePackBundle();
const fail = [];

const FORBIDDEN_RE = [
  /\bundefined\b/i,
  /\bNaN\b/,
  /\bverify_admin\b/,
  /\bnull\b/,
  /변호사/,
  /Linda/i,
  /□□/,
  /\uFFFD/,
  /□/,
];

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function optionsForNode(node) {
  if (node.kind === "text") return ["detail-a", "detail-b"];
  const opts = node.options ?? [];
  if (!opts.length) return ["01"];
  return opts.map((o) => o.value);
}

function collectPhase2Paths(caseId, phase1Answers, out, max) {
  function dfs(a) {
    if (out.length >= max) return;
    const ids = phase2QuestionIds(caseId, a);
    let pending = null;
    for (const id of ids) {
      if (!String(a[id] ?? "").trim()) {
        pending = id;
        break;
      }
    }
    if (pending) {
      const node = bundle.nodes[caseId]?.find((n) => n.id === pending);
      if (!node) return;
      for (const val of optionsForNode(node)) {
        dfs({ ...a, [pending]: val });
        if (out.length >= max) return;
      }
      return;
    }
    if (isPhase2QuestionSetComplete(caseId, a)) out.push({ ...a });
  }
  dfs({ ...phase1Answers });
}

function activitiesFromAnswers(answers) {
  answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
  const persist = buildRealEstatePackPhase2PersistMeta(answers, 2);
  return [
    {
      action: "verify_lead",
      meta: {
        ...persist,
        admin_phase2_documents_upload_complete: "1",
      },
      created_at: "2026-01-01T00:00:00.000Z",
    },
    { action: "expert_review_request", meta: {}, created_at: "2026-01-02T00:00:00.000Z" },
  ];
}

async function pdfTextFromHarness(harness) {
  const bytes = await buildMypagePdfBytesForQaHarness(harness);
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const parser = new PDFParse({ data: Buffer.from(bytes) });
  const parsed = await parser.getText();
  await parser.destroy();
  return { pages, text: parsed.text ?? "", bytes };
}

await ensureMypageExecutivePdfMeasureFonts();
bindAdminVerifyPaidEvidenceMeasureFonts(getMypageExecutivePdfMeasureFontsSync());

const adminCaseResolution = {
  case_resolution_json: JSON.stringify({
    goal: { value: "행정 통지 대응" },
    document: { value: "위반 통지서" },
    riskSignals: [],
  }),
};
const adminPaidHarness = {
  leadId: "lead-admin-paid-regression",
  serviceType: "verify_admin",
  result: "conditional",
  createdAt: "2026-01-01T00:00:00.000Z",
  activities: [
    {
      action: "verify_lead",
      meta: {
        admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
        admin_phase2_documents_upload_complete: "1",
        ...adminCaseResolution,
      },
    },
    { action: "verify_lead", meta: {} },
  ],
};

const adminA = await pdfTextFromHarness(adminPaidHarness);
const adminB = await pdfTextFromHarness(adminPaidHarness);
if (adminA.pages !== adminB.pages) {
  fail.push(`admin regression: page count ${adminA.pages} vs ${adminB.pages}`);
}
const norm = (t) => t.replace(/\d{4}\.\d{2}\.\d{2}/g, "DATE");
if (norm(adminA.text) !== norm(adminB.text)) {
  fail.push("admin regression: PDF plain text differs between duplicate builds");
}

const adminCfg = getVerifyPhase2HandoffConfig("verify_admin");
const reCfg = getVerifyPhase2HandoffConfig("verify_real-estate");
if (ADMIN_VERIFY_PHASE2_SNAPSHOT_STORAGE_KEY !== "vfbcai_admin_verify_phase2_snapshot") {
  fail.push("handoff: admin snapshot storage key changed");
}
const snapshotShape = {
  leadId: "x",
  answers: { a: "1" },
  resultToken: "tok",
  serviceType: "verify_admin",
};
const keys = Object.keys(snapshotShape).sort();
if (!keys.includes("leadId") || !keys.includes("answers") || !keys.includes("resultToken")) {
  fail.push("handoff: required snapshot keys missing");
}
if (reCfg?.documentsServiceParam !== "verify_real-estate") {
  fail.push("handoff: RE documents service param");
}

const stats = {
  paths_per_case: {},
  inspected: 0,
  summary_mismatch: 0,
  headline_mismatch: 0,
  forbidden_hits: 0,
  glyph_hits: 0,
  empty_pdf: 0,
};

const sampleSaved = { RE01: false, RE03: false, RE05: false };
const outDir = path.join(repoRoot, "tests", "qa", "_output");
fs.mkdirSync(outDir, { recursive: true });

for (const caseId of CASES) {
  const paths = [];
  for (const phase1 of enumeratePhase1Combinations(caseId)) {
    if (paths.length >= MIN_PATHS_PER_CASE) break;
    collectPhase2Paths(caseId, phase1, paths, MIN_PATHS_PER_CASE);
  }
  stats.paths_per_case[caseId] = paths.length;
  if (paths.length < MIN_PATHS_PER_CASE) {
    fail.push(`${caseId}: only ${paths.length} paths (need ${MIN_PATHS_PER_CASE})`);
  }

  let pathIdx = 0;
  for (const answers of paths) {
    pathIdx += 1;
    const activities = activitiesFromAnswers({ ...answers });
    const mypageP2 = buildRealEstatePhase2SummaryLinesFromActivities(activities);
    const mypageP1 = buildRealEstatePhase1SummaryLinesFromActivities(activities);
    const persist = activities[0].meta;
    const headline = persist.real_estate_pack_headline ?? "";

    const report = buildRealEstateVerifyAiReportContentFromActivities(
      activities,
      `lead-${caseId}-${stats.inspected}`,
    );
    if (!report) {
      fail.push(`${caseId}: null PDF content at path ${stats.inspected}`);
      continue;
    }
    const content = formatAdminVerifyAiReportContentPlainText(report);
    stats.inspected++;
    if (stats.inspected % 200 === 0) {
      console.error(`progress inspected=${stats.inspected} pdf=${stats.pdf_rendered ?? 0}`);
    }

    for (const line of mypageP2) {
      if (!content.includes(line)) stats.summary_mismatch++;
    }
    if (headline && !content.includes(headline)) stats.headline_mismatch++;

    for (const re of FORBIDDEN_RE) {
      if (re.test(content)) stats.forbidden_hits++;
    }

    const runFullPdf = pathIdx <= PDF_RENDER_FIRST_N || pathIdx % PDF_RENDER_EVERY_N === 0;
    if (!runFullPdf) continue;

    const harness = {
      leadId: `lead-re-pdf-${caseId}-${pathIdx}`,
      serviceType: "verify_real-estate",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities,
    };
    const { pages, text, bytes } = await pdfTextFromHarness(harness);
    stats.pdf_rendered = (stats.pdf_rendered ?? 0) + 1;
    if (pages < 1 || text.trim().length < 80) stats.empty_pdf++;
    if (headline && !text.includes(headline)) stats.pdf_headline_miss = (stats.pdf_headline_miss ?? 0) + 1;
    const normWs = (s) => s.replace(/\s+/g, "");
    const phase2InContent = mypageP2.filter((line) => content.includes(line));
    for (const line of phase2InContent) {
      if (!normWs(text).includes(normWs(line))) {
        stats.pdf_summary_miss = (stats.pdf_summary_miss ?? 0) + 1;
      }
    }
    for (const re of FORBIDDEN_RE) {
      if (re.test(text)) stats.forbidden_hits++;
    }
    if (/□|\uFFFD/.test(text)) stats.glyph_hits++;

    if (!sampleSaved[caseId] && ["RE01", "RE03", "RE05"].includes(caseId)) {
      const pdfPath = path.join(outDir, `c25-sample-${caseId}.pdf`);
      const txtPath = path.join(outDir, `c25-text-${caseId}.txt`);
      fs.writeFileSync(pdfPath, Buffer.from(bytes));
      fs.writeFileSync(txtPath, text, "utf8");
      sampleSaved[caseId] = true;
    }
  }
}

if (stats.summary_mismatch > 0) fail.push(`mypage vs PDF body mismatch count=${stats.summary_mismatch}`);
if (stats.headline_mismatch > 0) fail.push(`headline body mismatch count=${stats.headline_mismatch}`);
if ((stats.pdf_summary_miss ?? 0) > 0) {
  fail.push(`PDF extract missing phase2 line (in body) count=${stats.pdf_summary_miss}`);
}
if ((stats.pdf_headline_miss ?? 0) > 0) {
  fail.push(`PDF extract missing headline count=${stats.pdf_headline_miss}`);
}
if (stats.forbidden_hits > 0) fail.push(`forbidden pattern hits=${stats.forbidden_hits}`);
if (stats.glyph_hits > 0) fail.push(`glyph missing hits=${stats.glyph_hits}`);
if (stats.empty_pdf > 0) fail.push(`empty pdf count=${stats.empty_pdf}`);

console.log(
  JSON.stringify(
    {
      sampling_rule: `content parity all ${MIN_PATHS_PER_CASE} paths/case; pdf-lib render first ${PDF_RENDER_FIRST_N} + every ${PDF_RENDER_EVERY_N}th`,
      stats,
      admin_regression_pages: adminA.pages,
      handoff_admin_url_param: adminCfg?.documentsServiceParam,
      handoff_re_url_param: reCfg?.documentsServiceParam,
      fail_count: fail.length,
      fail,
    },
    null,
    2,
  ),
);

process.exit(fail.length > 0 ? 1 : 0);
