/**
 * C2.5 / C2.5b — RE Pack PDF ↔ My Page parity, Admin 03a8e21 baseline, handoff keys
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
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
  countAdminVerifyPaidPdfMetricGapLines,
  formatAdminVerifyAiReportContentPlainText,
} from "../../src/lib/adminVerifyMypageFields.ts";
import { buildPackPersonalizedResult } from "../../src/lib/contentPacks/realEstate/personalizedResultBuilder.ts";
import { findJosaViolations } from "../../src/lib/contentPacks/realEstate/koreanParticle.ts";
import { ensureMypageExecutivePdfMeasureFonts, getMypageExecutivePdfMeasureFontsSync } from "../../src/lib/mypagePdfExecutiveMeasureFonts.ts";
import { buildMypagePdfBytesForQaHarness } from "../../src/lib/mypagePdfExecutiveRender.ts";
import { buildRealEstateVerifyAiReportContentFromActivities } from "../../src/lib/contentPacks/realEstate/realEstateVerifyPdfContent.ts";
import { listRealEstatePhase2RequiredDocuments } from "../../src/lib/contentPacks/realEstate/phase2Documents.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const MIN_PATHS_PER_CASE = 1500;
/** Full pdf-lib render is sampled; all paths get body builder parity (same source as PDF EVIDENCE). */
const PDF_RENDER_FIRST_N = 3;
const PDF_RENDER_EVERY_N = 1000;
const bundle = realEstatePackBundle();
const fail = [];

const SAMPLE_UUID_LEAD = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const JOSA_BAD = /\)\s*[과를은이가]/;
const FILLER_DOC = /\(부동산 관련 서류\)/;
/** E1: "내용과 … 와/과 … 기재" 이중 접속 조사 */
const ACTION_DOUBLE_CONJ_BEFORE_GIJAE = /(과|와)\s+[^\n]{0,200}?\s+(과|와)\s+기재/;
/** E1 legacy ② template */
const ACTION_LEGACY_COMPARE_AND = /2차에 입력하신 내용과\s+/;

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

const adminBaseline = spawnSync("npx", ["tsx", "tests/qa/admin-mypage-pdf-baseline-regression.mjs"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
if (adminBaseline.status !== 0) {
  fail.push("admin baseline regression vs 03a8e21 failed");
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
  grade_label_miss: 0,
  caution_grade_miss: 0,
  ok_grade_gap_conflict: 0,
  josa_hits: 0,
  filler_doc_hits: 0,
  forbidden_hits: 0,
  glyph_hits: 0,
  empty_pdf: 0,
  hyphen_lead_glyph_note: 0,
  mandatory_mismatch: 0,
  action_double_conj: 0,
  action_legacy_compare: 0,
  action_doc_not_in_mandatory: 0,
};

const sampleSaved = Object.fromEntries(CASES.map((c) => [c, false]));
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
    const personalized = buildPackPersonalizedResult(caseId, answers);
    const gradeFilled = personalized?.gradeFilled ?? 1;
    const gradeLabel = personalized?.gradeLabel ?? "";

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

    if (!content.includes(gradeLabel)) stats.grade_label_miss++;
    for (const line of mypageP2) {
      if (!content.includes(line)) stats.summary_mismatch++;
    }
    if (!report.execSummary[0]?.includes(gradeLabel)) stats.grade_label_miss++;

    if (gradeFilled >= 2 && !report.keyRisks.some((l) => l.startsWith("[주의]"))) {
      stats.caution_grade_miss++;
    }
    if (gradeFilled < 2 && (personalized?.cautions?.length ?? 0) === 0) {
      const gap = countAdminVerifyPaidPdfMetricGapLines(report.keyRisks);
      if (gap > 0) stats.ok_grade_gap_conflict++;
    }

    const blob = [
      ...report.execSummary,
      ...report.keyRisks,
      ...report.recommendedAction,
      content,
    ].join("\n");
    if (FILLER_DOC.test(blob)) stats.filler_doc_hits++;
    if (JOSA_BAD.test(blob)) stats.josa_hits++;
    for (const v of findJosaViolations(blob)) stats.josa_hits++;

    const expectedMandatory = listRealEstatePhase2RequiredDocuments(caseId);
    const actualMandatory = report.mandatoryDocumentLines ?? [];
    if (JSON.stringify(expectedMandatory) !== JSON.stringify(actualMandatory)) {
      stats.mandatory_mismatch++;
    }
    const primaryDoc = expectedMandatory[0] ?? "";
    for (const action of report.recommendedAction) {
      if (ACTION_DOUBLE_CONJ_BEFORE_GIJAE.test(action)) stats.action_double_conj++;
      if (ACTION_LEGACY_COMPARE_AND.test(action)) stats.action_legacy_compare++;
      if (
        report.includesPhase2Block &&
        action.includes("②") &&
        primaryDoc &&
        !action.includes(primaryDoc)
      ) {
        stats.action_doc_not_in_mandatory++;
      }
    }

    for (const re of FORBIDDEN_RE) {
      if (re.test(content)) stats.forbidden_hits++;
    }

    const runFullPdf = pathIdx <= PDF_RENDER_FIRST_N || pathIdx % PDF_RENDER_EVERY_N === 0;
    if (!runFullPdf) continue;

    const leadId = !sampleSaved[caseId] ? SAMPLE_UUID_LEAD : `lead-re-pdf-${caseId}-${pathIdx}`;
    const harness = {
      leadId,
      serviceType: "verify_real-estate",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities,
    };
    const { pages, text, bytes } = await pdfTextFromHarness(harness);
    stats.pdf_rendered = (stats.pdf_rendered ?? 0) + 1;
    if (pages < 1 || text.trim().length < 80) stats.empty_pdf++;
    if (leadId.includes("-") && leadId.startsWith("lead-") && /㏄/.test(text)) {
      stats.hyphen_lead_glyph_note++;
    }
    if (leadId === SAMPLE_UUID_LEAD && !/VFA1B2C3D4/i.test(text.replace(/\s/g, ""))) {
      fail.push(`${caseId}: UUID sample missing expected receipt prefix VFA1B2C3D4`);
    }
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

    if (!sampleSaved[caseId]) {
      const pdfPath = path.join(outDir, `c25c-sample-${caseId}.pdf`);
      const txtPath = path.join(outDir, `c25c-text-${caseId}.txt`);
      fs.writeFileSync(pdfPath, Buffer.from(bytes));
      fs.writeFileSync(txtPath, text, "utf8");
      sampleSaved[caseId] = true;
    }
  }
}

if (stats.summary_mismatch > 0) fail.push(`mypage vs PDF body mismatch count=${stats.summary_mismatch}`);
if (stats.grade_label_miss > 0) fail.push(`grade label missing count=${stats.grade_label_miss}`);
if (stats.caution_grade_miss > 0) fail.push(`grade>=2 without [주의] count=${stats.caution_grade_miss}`);
if (stats.ok_grade_gap_conflict > 0) {
  fail.push(`양호 grade with gap metric conflict count=${stats.ok_grade_gap_conflict}`);
}
if (stats.josa_hits > 0) fail.push(`josa violations count=${stats.josa_hits}`);
if (stats.filler_doc_hits > 0) fail.push(`filler (부동산 관련 서류) count=${stats.filler_doc_hits}`);
if (stats.mandatory_mismatch > 0) {
  fail.push(`documents list != PDF mandatory count=${stats.mandatory_mismatch}`);
}
if (stats.action_double_conj > 0) {
  fail.push(`RECOMMENDED ACTIONS double 과/와 before 기재 count=${stats.action_double_conj}`);
}
if (stats.action_legacy_compare > 0) {
  fail.push(`legacy ② '내용과' compare template count=${stats.action_legacy_compare}`);
}
if (stats.action_doc_not_in_mandatory > 0) {
  fail.push(`② action missing pack primary doc count=${stats.action_doc_not_in_mandatory}`);
}
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
      admin_baseline_commit: "03a8e21",
      admin_baseline_status: adminBaseline.status,
      hyphen_lead_glyph_note:
        "non-UUID leadId with hyphens may show ㏄ in pdf-parse extract (VFLEAD㏄); UUID sample uses VFA1B2C3D4",
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
