/**
 * C2.7 V3 — harness PDF samples (no HTTP auth)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { buildRealEstatePackPhase2PersistMeta } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";
import { bindAdminVerifyPaidEvidenceMeasureFonts, countAdminVerifyPaidPdfMetricGapLines } from "../../src/lib/adminVerifyMypageFields.ts";
import { ensureMypageExecutivePdfMeasureFonts, getMypageExecutivePdfMeasureFontsSync } from "../../src/lib/mypagePdfExecutiveMeasureFonts.ts";
import { buildMypagePdfBytesForQaHarness } from "../../src/lib/mypagePdfExecutiveRender.ts";
import { buildRealEstateVerifyAiReportContentFromActivities } from "../../src/lib/contentPacks/realEstate/realEstateVerifyPdfContent.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const SAMPLE_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const bundle = realEstatePackBundle();
const outDir = path.join(repoRoot, "tests", "qa", "_output");
fs.mkdirSync(outDir, { recursive: true });

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function walkPhase2(caseId, phase1) {
  const answers = { ...phase1 };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = firstOptionFor(node);
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

function activitiesFromAnswers(answers, anyUploaded) {
  answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = anyUploaded ? "1" : "0";
  const persist = buildRealEstatePackPhase2PersistMeta(answers, 2);
  persist.admin_phase2_documents_upload_complete = "1";
  persist.admin_phase2_documents_any_uploaded = anyUploaded ? "1" : "0";
  return [
    {
      action: "verify_lead",
      meta: persist,
      created_at: "2026-01-01T00:00:00.000Z",
    },
    { action: "expert_review_request", meta: {}, created_at: "2026-01-02T00:00:00.000Z" },
  ];
}

await ensureMypageExecutivePdfMeasureFonts();
bindAdminVerifyPaidEvidenceMeasureFonts(getMypageExecutivePdfMeasureFontsSync());

const stats = { cases: {}, glyph_hits: 0, http_verified: false };

for (const caseId of CASES) {
  const phase1 = [...enumeratePhase1Combinations(caseId)][0];
  const answers = walkPhase2(caseId, phase1);
  const activities = activitiesFromAnswers({ ...answers }, caseId === "RE03");
  const report = buildRealEstateVerifyAiReportContentFromActivities(activities, SAMPLE_UUID);
  const leadId = caseId === "RE01" ? SAMPLE_UUID : `lead-c27-${caseId}`;
  const harness = {
    leadId,
    serviceType: "verify_real-estate",
    result: "conditional",
    createdAt: "2026-01-01T00:00:00.000Z",
    activities,
  };
  const bytes = await buildMypagePdfBytesForQaHarness(harness);
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const parser = new PDFParse({ data: Buffer.from(bytes) });
  const parsed = await parser.getText();
  await parser.destroy();
  const text = parsed.text ?? "";
  const pdfSig = Buffer.from(bytes).subarray(0, 4).toString("utf8") === "%PDF";
  const glyphs = /□|\uFFFD/.test(text) ? 1 : 0;
  stats.glyph_hits += glyphs;

  const pdfPath = path.join(outDir, `c27-pdf-${caseId}.pdf`);
  const txtPath = path.join(outDir, `c27-text-${caseId}.txt`);
  fs.writeFileSync(pdfPath, Buffer.from(bytes));
  fs.writeFileSync(txtPath, text, "utf8");

  stats.cases[caseId] = {
    pages,
    pdf_sig: pdfSig,
    text_len: text.length,
    grade2_meta: activities[0].meta.real_estate_pack_grade2,
    summary_in_pdf: text.includes(String(activities[0].meta.real_estate_pack_phase2_summary ?? "").slice(0, 40)),
    re04_compare_line: caseId === "RE04" ? text.match(/2차에 입력하신 내용을[^\n]+/)?.[0] : undefined,
    gap_lines: countAdminVerifyPaidPdfMetricGapLines(report?.keyRisks ?? []),
  };
}

console.log(JSON.stringify({ harness_only: true, stats }, null, 2));
