/**
 * Tax 7 + RE01 + admin free PDF text baseline.
 * No network and no database.
 * Run: node scripts/harness-pdf-baseline.mjs
 */
import { ensureTsxRuntime } from "../tests/qa/_ensure-tsx-runtime.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselineDir = path.join(repoRoot, "tests/baseline/pdf");
const names = [
  "tax-P-free",
  "tax-V-free",
  "tax-C-free",
  "tax-P-paid",
  "tax-V-paid",
  "tax-C-paid",
  "tax-direct",
  "re-RE01",
  "admin-free-basic",
];

const { buildMypagePdfBytesForQaHarness } = await import("../src/lib/mypagePdfExecutiveRender.ts");
const { TAX_CONTENT_FINAL, buildTaxPhase2PersistMeta } = await import(
  "../src/lib/contentPacks/tax/taxPack.ts"
);
const {
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY,
  getAdminChoiceNoteKey,
} = await import("../src/lib/adminVerifyProfiling.ts");
const { enumeratePhase1Combinations } = await import(
  "../src/lib/contentPacks/realEstate/exhaustivePhase1.ts"
);
const { getNode, phase2QuestionIds, isPhase2QuestionSetComplete } = await import(
  "../src/lib/contentPacks/runner.ts"
);
const { buildRealEstatePackPhase2PersistMeta } = await import(
  "../src/lib/contentPacks/realEstate/packPhase2Persist.ts"
);

const leadId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const createdAt = "2026-01-01T00:00:00.000Z";

function taxAnswers(route) {
  const entryValue = route === "V" ? "o2" : route === "C" ? "o3" : "o1";
  const answers = { re_entry: entryValue };
  for (const question of TAX_CONTENT_FINAL.questions) {
    if (question.route === route) answers[question.id] = "o1";
  }
  return answers;
}

function taxActivities(answers, paid) {
  const meta = buildTaxPhase2PersistMeta(answers, paid ? 2 : 1);
  if (paid) meta[ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY] = "1";
  return [{ action: "verify_lead", meta, created_at: createdAt }];
}

function re01Answers() {
  const answers = { ...enumeratePhase1Combinations("RE01")[0] };
  for (let guard = 0; guard < 40 && !isPhase2QuestionSetComplete("RE01", answers); guard += 1) {
    const pending = phase2QuestionIds("RE01", answers).find((id) => !String(answers[id] ?? "").trim());
    if (!pending) break;
    const node = getNode("RE01", pending);
    answers[pending] = node?.kind === "text" ? "sample text" : (node?.options?.[0]?.value ?? "01");
  }
  answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
  return answers;
}

function jobs() {
  const list = [];
  for (const route of ["P", "V", "C"]) {
    const answers = taxAnswers(route);
    list.push([`tax-${route}-free`, "verify_tax", taxActivities(answers, false)]);
    list.push([`tax-${route}-paid`, "verify_tax", taxActivities(answers, true)]);
  }
  const direct = taxAnswers("P");
  direct.re_entry = "other";
  direct[getAdminChoiceNoteKey("re_entry")] = "direct sample";
  list.push(["tax-direct", "verify_tax", taxActivities(direct, false)]);
  const reAnswers = re01Answers();
  list.push([
    "re-RE01",
    "verify_real-estate",
    [
      {
        action: "verify_lead",
        meta: {
          ...buildRealEstatePackPhase2PersistMeta(reAnswers, 2),
          admin_phase2_documents_upload_complete: "1",
        },
        created_at: createdAt,
      },
    ],
  ]);
  list.push([
    "admin-free-basic",
    "verify_admin",
    [
      {
        action: "verify_lead",
        meta: {
          admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
          case_resolution_json: JSON.stringify({
            goal: { value: "notice" },
            document: { value: "notice" },
            riskSignals: [],
          }),
        },
        created_at: createdAt,
      },
    ],
  ]);
  return list;
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n").replace(/\s+$/g, "") + "\n";
}

function extractPdf(pdfPath) {
  const txtPath = `${pdfPath}.txt`;
  const py = [
    "import sys",
    "from pathlib import Path",
    "from pypdf import PdfReader",
    "reader = PdfReader(sys.argv[1])",
    "text = chr(10).join((page.extract_text() or '') for page in reader.pages)",
    "Path(sys.argv[2]).write_text(text, encoding='utf-8')",
  ].join("\n");
  const result = spawnSync("python", ["-c", py, pdfPath, txtPath], {
    encoding: "utf8",
    env: { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || "pypdf failed\n");
    process.exit(1);
  }
  const text = fs.readFileSync(txtPath, "utf8");
  fs.unlinkSync(txtPath);
  return normalize(text);
}

async function capture() {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "vfbcai-harness-pdf-"));
  const texts = new Map();
  try {
    for (const [name, serviceType, activities] of jobs()) {
      const bytes = await buildMypagePdfBytesForQaHarness({
        leadId,
        serviceType,
        result: "conditional",
        createdAt,
        activities,
      });
      const pdfPath = path.join(work, `${name}.pdf`);
      fs.writeFileSync(pdfPath, bytes);
      texts.set(name, extractPdf(pdfPath));
      fs.unlinkSync(pdfPath);
    }
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
  return texts;
}

function baselinesReady() {
  return names.every((name) => fs.existsSync(path.join(baselineDir, `${name}.txt`)));
}

function readBaseline() {
  const texts = new Map();
  for (const name of names) {
    texts.set(name, normalize(fs.readFileSync(path.join(baselineDir, `${name}.txt`), "utf8")));
  }
  return texts;
}

function writeBaseline(texts) {
  fs.mkdirSync(baselineDir, { recursive: true });
  for (const name of names) {
    fs.writeFileSync(path.join(baselineDir, `${name}.txt`), texts.get(name), "utf8");
  }
}

function mismatches(actual, expected) {
  const bad = [];
  for (const name of names) {
    if (actual.get(name) !== expected.get(name)) bad.push(name);
  }
  return bad;
}

const hadBaseline = baselinesReady();
const first = await capture();
if (!hadBaseline) writeBaseline(first);
const expected = hadBaseline ? readBaseline() : first;
const second = hadBaseline ? first : await capture();
const bad = mismatches(second, expected);
if (bad.length) {
  if (!hadBaseline) fs.rmSync(baselineDir, { recursive: true, force: true });
  process.stderr.write(`PDF DIFF ${bad.join(",")}\n`);
  process.exit(1);
}
process.stdout.write(hadBaseline ? "PDF compare ok\n" : "PDF baseline captured\n");
