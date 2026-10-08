/**
 * D1 — verify_admin My Page PDF at 03a8e21 vs HEAD (admin render files only).
 * Baseline text: tests/qa/fixtures/admin-mypage-pdf-03a8e21/*.txt
 * Regenerate: REGENERATE_ADMIN_PDF_BASELINE=1 npx tsx tests/qa/admin-mypage-pdf-baseline-regression.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const wtRoot = path.join(repoRoot, ".wt-admin-pdf-03a8e21");
const fixtureDir = path.join(repoRoot, "tests/qa/fixtures/admin-mypage-pdf-03a8e21");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");

const BASE_COMMIT = "03a8e21";

const caseResolutionMeta = {
  case_resolution_json: JSON.stringify({
    goal: { value: "행정 통지 대응" },
    document: { value: "위반 통지서" },
    authority: { value: "교통국" },
    riskSignals: [],
  }),
};

const HARNESSES = [
  {
    id: "admin-free-basic",
    harness: {
      leadId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
            ...caseResolutionMeta,
          },
        },
      ],
    },
  },
  {
    id: "admin-paid-basic",
    harness: {
      leadId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
            admin_phase2_documents_upload_complete: "1",
            ...caseResolutionMeta,
          },
        },
      ],
    },
  },
  {
    id: "admin-paid-upload",
    harness: {
      leadId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "deadline" }),
            admin_phase2_documents_upload_complete: "1",
            ...caseResolutionMeta,
          },
        },
        {
          action: "document_upload",
          meta: {
            fileName: "phase2-scan.pdf",
            storagePath: "document-upload/lead-paid/phase2-scan.pdf",
          },
        },
      ],
    },
  },
  {
    id: "admin-free-risk",
    harness: {
      leadId: "d4e5f6a7-b8c9-0123-def0-234567890123",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
            case_resolution_json: JSON.stringify({
              goal: { value: "행정 통지 대응" },
              document: { value: "위반 통지서" },
              riskSignals: ["기한 경과 가능성"],
            }),
          },
        },
      ],
    },
  },
  {
    id: "admin-paid-traffic",
    harness: {
      leadId: "e5f6a7b8-c9d0-1234-ef01-345678901234",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
            admin_phase2_documents_upload_complete: "1",
            case_resolution_json: JSON.stringify({
              goal: { value: "운전면허 관련" },
              document: { value: "교통국 통지" },
              authority: { value: "호찌민시 교통국" },
              riskSignals: [],
            }),
          },
        },
      ],
    },
  },
  {
    id: "admin-free-upload-flag",
    harness: {
      leadId: "f6a7b8c9-d0e1-2345-f012-456789012345",
      serviceType: "verify_admin",
      result: "conditional",
      createdAt: "2026-01-01T00:00:00.000Z",
      activities: [
        {
          action: "verify_lead",
          meta: {
            admin_verify_answers_json: JSON.stringify({
              case01_authorityDemand: "payment",
              case01_evidenceFileName: "scan.pdf",
            }),
            ...caseResolutionMeta,
          },
        },
      ],
    },
  },
];

function normalizePdfPlain(text) {
  return text
    .replace(/\d{4}\.\d{2}\.\d{2}/g, "DATE")
    .replace(/\r\n/g, "\n")
    .trim();
}

async function loadPdfModule(rootDir) {
  const { ensureMypageExecutivePdfMeasureFonts, getMypageExecutivePdfMeasureFontsSync } =
    await import(pathToFileURL(path.join(rootDir, "src/lib/mypagePdfExecutiveMeasureFonts.ts")).href);
  const { bindAdminVerifyPaidEvidenceMeasureFonts } = await import(
    pathToFileURL(path.join(rootDir, "src/lib/adminVerifyMypageFields.ts")).href,
  );
  const { buildMypagePdfBytesForQaHarness } = await import(
    pathToFileURL(path.join(rootDir, "src/lib/mypagePdfExecutiveRender.ts")).href,
  );
  await ensureMypageExecutivePdfMeasureFonts();
  bindAdminVerifyPaidEvidenceMeasureFonts(getMypageExecutivePdfMeasureFontsSync());
  return buildMypagePdfBytesForQaHarness;
}

async function harnessToNormalizedText(buildFn, harness) {
  const bytes = await buildFn(harness);
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const parser = new PDFParse({ data: Buffer.from(bytes) });
  const parsed = await parser.getText();
  await parser.destroy();
  return { pages, text: normalizePdfPlain(parsed.text ?? "") };
}

function ensureWorktree() {
  if (!fs.existsSync(path.join(wtRoot, ".git"))) {
    const r = spawnSync("git", ["worktree", "add", wtRoot, BASE_COMMIT], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    if (r.status !== 0) throw new Error("git worktree add failed");
  }
}

async function main() {
  const fail = [];
  fs.mkdirSync(fixtureDir, { recursive: true });

  if (process.env.REGENERATE_ADMIN_PDF_BASELINE === "1") {
    ensureWorktree();
    const buildBaseline = await loadPdfModule(wtRoot);
    for (const { id, harness } of HARNESSES) {
      const { pages, text } = await harnessToNormalizedText(buildBaseline, harness);
      fs.writeFileSync(path.join(fixtureDir, `${id}.pages`), String(pages), "utf8");
      fs.writeFileSync(path.join(fixtureDir, `${id}.txt`), text, "utf8");
    }
    console.log(JSON.stringify({ regenerated: HARNESSES.length, fixtureDir }, null, 2));
    return;
  }

  for (const { id } of HARNESSES) {
    const txtPath = path.join(fixtureDir, `${id}.txt`);
    const pagesPath = path.join(fixtureDir, `${id}.pages`);
    if (!fs.existsSync(txtPath) || !fs.existsSync(pagesPath)) {
      fail.push(`missing fixture ${id} — run REGENERATE_ADMIN_PDF_BASELINE=1`);
    }
  }
  if (fail.length) {
    console.log(JSON.stringify({ fail }, null, 2));
    process.exit(1);
  }

  const buildHead = await loadPdfModule(repoRoot);
  for (const { id, harness } of HARNESSES) {
    const expectedPages = Number(fs.readFileSync(path.join(fixtureDir, `${id}.pages`), "utf8"));
    const expectedText = fs.readFileSync(path.join(fixtureDir, `${id}.txt`), "utf8");
    const { pages, text } = await harnessToNormalizedText(buildHead, harness);
    if (pages !== expectedPages) {
      fail.push(`${id}: pages ${pages} vs baseline ${expectedPages}`);
    }
    if (text !== expectedText) {
      fail.push(`${id}: plain text differs from 03a8e21 baseline`);
      fs.writeFileSync(path.join(fixtureDir, `${id}.head-diff.txt`), text, "utf8");
    }
  }

  console.log(
    JSON.stringify(
      {
        baseline_commit: BASE_COMMIT,
        harness_count: HARNESSES.length,
        fail_count: fail.length,
        fail,
      },
      null,
      2,
    ),
  );
  process.exit(fail.length ? 1 : 0);
}

await main();
