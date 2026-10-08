import fs from "fs";
import path from "path";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  buildFirstResultData,
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();
const OUT = path.join("tests/qa/_output");
fs.mkdirSync(OUT, { recursive: true });

function phase1Subset(caseId, answers) {
  const out = { re_entry: answers.re_entry };
  for (const n of bundle.nodes[caseId] ?? []) {
    if (n.phase === 1 && answers[n.id] != null) out[n.id] = answers[n.id];
  }
  return out;
}

function optionAt(node, variant) {
  if (node.kind === "text") return `detail-${variant}`;
  const opts = node.options ?? [];
  if (!opts.length) return "01";
  return opts[variant % opts.length]?.value ?? opts[0].value;
}

function walkPhase2Variant(caseId, phase1Answers, variant) {
  const answers = { ...phase1Answers };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = optionAt(node, variant + ids.indexOf(id));
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

function phase2Digest(caseId, answers) {
  const ids = phase2QuestionIds(caseId, answers);
  return ids
    .slice(0, 8)
    .map((id) => `${id}=${String(answers[id] ?? "").slice(0, 28)}`)
    .join("; ");
}

for (const caseId of CASES) {
  const lines = [];
  const elevatedUnique = new Set();
  const combos = [...enumeratePhase1Combinations(caseId)];
  const baseStep = Math.max(1, Math.floor(combos.length / 30));
  const extraStep = Math.max(1, Math.floor(combos.length / 10));
  const indices = new Set();
  for (let i = 0; i < combos.length && indices.size < 30; i += baseStep) indices.add(i);
  for (let i = 0; i < combos.length && indices.size < 40; i += extraStep) indices.add(i);
  const sorted = [...indices].sort((a, b) => a - b).slice(0, 40);
  let written = 0;
  for (const i of sorted) {
    const phase1 = combos[i];
    const variant = written;
    const answers = walkPhase2Variant(caseId, phase1, variant);
    answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
    const p1 = buildFirstResultData(caseId, phase1Subset(caseId, answers));
    const data = bridge.buildPersonalizedResult(answers);
    const sum = data?.situationSummary ?? "";
    if (/2차 답변에서 .+이 확인되어/.test(sum)) elevatedUnique.add(sum);
    lines.push(`=== ${caseId} path ${written + 1} (combo index ${i}) ===`);
    lines.push(`phase1_grade: ${p1.gradeLabel} (${p1.gradeFilled})`);
    lines.push(`phase1_core: ${(data?.personalizedContext?.phase1Facts ?? [])[0] ?? ""}`);
    lines.push(`phase2_digest: ${phase2Digest(caseId, answers)}`);
    lines.push(`phase2_grade: ${data?.gradeLabel} (${data?.gradeFilled})`);
    lines.push(`summary: ${sum}`);
    lines.push(`cautions: ${(data?.cautions ?? []).join(" | ")}`);
    lines.push("");
    written++;
  }
  fs.writeFileSync(path.join(OUT, `c23e-dump-${caseId}.txt`), lines.join("\n"), "utf8");
  fs.writeFileSync(
    path.join(OUT, `c23e-elevated-unique-${caseId}.txt`),
    [...elevatedUnique].map((s, idx) => `${idx + 1}. ${s}`).join("\n"),
    "utf8",
  );
}
console.log("wrote c23e-dump + c23e-elevated-unique RE01..05");
