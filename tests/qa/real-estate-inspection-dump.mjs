/**
 * C1.5 — 검수용 덤프 (기존 열거·runner·m45만 사용, 새 로직 없음)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { enumerateRe02GateCombinations } from "../../src/lib/contentPacks/realEstate/exhaustiveGate.ts";
import { pickSinglePathId } from "../../src/lib/contentPacks/realEstate/fPathResolve.ts";
import { REAL_ESTATE_F_PATHS } from "../../src/lib/contentPacks/realEstate/generated/meta.ts";
import { REAL_ESTATE_M45 } from "../../src/lib/contentPacks/realEstate/generated/m45.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  buildFirstResultData,
  getNode,
  optionLabel,
  phase1QuestionIds,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "_dump");
const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();

const PACK_SOURCE = {
  RE01: "docs/content-packs/pack-RE01.md §3(1차 결과 3칸)·§4(STEP 3개); MASTER RE01 M-4/M-5",
  RE02: "docs/content-packs/pack-RE02.md §1차 결과 3칸·STEP 3개; MASTER RE02 M-4/M-5",
  RE03: "docs/content-packs/pack-RE03.md §1차 결과 3칸·STEP 3개; MASTER RE03 M-4/M-5",
  RE04: "docs/content-packs/pack-RE04.md §1차 결과 3칸·STEP 3개; MASTER RE04 M-4/M-5",
  RE05: "docs/content-packs/pack-RE05.md §1차 결과 3칸·STEP 3개; MASTER RE05 M-4/M-5",
};

function m45Source(caseId) {
  const row = REAL_ESTATE_M45.find((p) => p.caseId === caseId);
  if (!row) return PACK_SOURCE[caseId];
  return `${PACK_SOURCE[caseId]}; generated/m45.ts rulesRaw·steps·stepVariants`;
}

function findAnswersForPath(caseId, pathId) {
  if (caseId === "RE02" && (pathId === "PATH_A" || pathId === "PATH_D1")) {
    for (const answers of enumerateRe02GateCombinations()) {
      if (pickSinglePathId(caseId, answers) === pathId) return answers;
    }
    return null;
  }
  for (const answers of enumeratePhase1Combinations(caseId)) {
    if (pickSinglePathId(caseId, answers) === pathId) return answers;
  }
  return null;
}

function formatPhase1Answers(caseId, answers) {
  const lines = [];
  for (const qid of phase1QuestionIds(caseId)) {
    const val = answers[qid];
    if (val == null) continue;
    const node = getNode(caseId, qid);
    const values = Array.isArray(val) ? val : [String(val)];
    for (const v of values) {
      const label = node ? optionLabel(node, v) : v;
      lines.push(`- ${qid} = ${v} | ${label}`);
    }
  }
  const q1 = answers.re_entry;
  if (q1 != null) {
    const q1row = bundle.q1.find((q) => q.value === q1);
    lines.unshift(`- re_entry = ${q1} | ${q1row?.label ?? q1}`);
  }
  return lines.join("\n");
}

function formatFirstResult(caseId, answers) {
  const data = buildFirstResultData(caseId, answers);
  const lines = [];
  lines.push(`statusHeadline: ${data.statusHeadline}`);
  lines.push(`statusTone: ${data.statusTone}`);
  lines.push(`situationSummary: ${data.situationSummary}`);
  lines.push(`gradeLabel: ${data.gradeLabel}`);
  for (let i = 0; i < data.keyMetrics.length; i++) {
    const m = data.keyMetrics[i];
    lines.push(
      `keyMetrics[${i}]: label=${m.label}; title=${m.title}; footnote=${m.footnote}; status=${m.status}`,
    );
  }
  lines.push(`cautions: ${JSON.stringify(data.cautions)}`);
  lines.push(`unconfirmed: ${JSON.stringify(data.unconfirmed)}`);
  lines.push(`actions: ${JSON.stringify(data.actions)}`);
  lines.push(`caseClassificationLabel: ${data.caseClassificationLabel}`);
  lines.push(`referenceDateLabel: ${data.referenceDateLabel}`);
  lines.push(`case06ExpertHandoffRequired: ${data.case06ExpertHandoffRequired}`);
  return lines.join("\n");
}

function formatPhase2Order(caseId, answers) {
  const ids = phase2QuestionIds(caseId, answers);
  return ids
    .map((id) => {
      const n = getNode(caseId, id);
      return `- ${id}: ${n?.question ?? "(no question)"}`;
    })
    .join("\n");
}

function buildResultMd() {
  const parts = ["# real-estate-dump-result.md\n", `생성: ${new Date().toISOString()}\n`];
  for (const caseId of CASES) {
    const paths = REAL_ESTATE_F_PATHS[caseId] ?? [];
    for (const row of paths) {
      if (caseId === "RE04" && row.pathId === "X") continue;
      const answers = findAnswersForPath(caseId, row.pathId);
      parts.push(`\n## ${caseId} / ${row.pathId}\n`);
      parts.push(`F 조건: ${row.condition}\n`);
      parts.push(`F 라벨: ${row.label}\n`);
      if (!answers) {
        parts.push(`(대표 조합 없음)\n`);
        continue;
      }
      parts.push(`### 1차 답\n${formatPhase1Answers(caseId, answers)}\n`);
      if (answers.re02_other_reason) {
        const n = getNode(caseId, "re02_other_reason");
        const v = String(answers.re02_other_reason);
        parts.push(
          `### 2차 게이트(첫 답)\n- re02_other_reason = ${v} | ${n ? optionLabel(n, v) : v}\n`,
        );
      }
      parts.push(`### 1차 결과\n${formatFirstResult(caseId, answers)}\n`);
      parts.push(`### STEP 3개\n`);
      const data = buildFirstResultData(caseId, answers);
      data.actions.forEach((s, i) => parts.push(`${i + 1}. ${s}\n`));
      parts.push(`\n### 2차 질문 순서\n${formatPhase2Order(caseId, answers)}\n`);
      parts.push(`### 근거\n${m45Source(caseId)}\n`);
    }
  }
  return parts.join("");
}

function formatOptions(node) {
  if (!node.options?.length) return "(none)";
  return node.options.map((o) => `${o.value} | ${o.label}`).join("\n  ");
}

function buildQuestionsMd() {
  const parts = ["# real-estate-dump-questions.md\n", `생성: ${new Date().toISOString()}\n`];
  for (const caseId of CASES) {
    parts.push(`\n# ${caseId}\n`);
    const nodes = bundle.nodes[caseId] ?? [];
    const p1 = nodes.filter((n) => n.phase === 1);
    const p2 = nodes.filter((n) => n.phase === 2);
    parts.push(`\n## 1차 질문 (${p1.length}개)\n`);
    for (const n of p1) {
      parts.push(`\n### ${n.id}\n`);
      parts.push(`문구: ${n.question}\n`);
      parts.push(`kind: ${n.kind}\n`);
      parts.push(`show_if: ${n.showIf || "(none)"}\n`);
      parts.push(`profile_field: ${JSON.stringify(n.profileFields)}\n`);
      parts.push(`선택지:\n  ${formatOptions(n)}\n`);
      if (n.placeholder) parts.push(`placeholder: ${n.placeholder}\n`);
    }
    parts.push(`\n## 2차 질문 (${p2.length}개, pack 정의 순서)\n`);
    for (const n of p2) {
      parts.push(`\n### ${n.id}\n`);
      parts.push(`문구: ${n.question}\n`);
      parts.push(`kind: ${n.kind}\n`);
      parts.push(`show_if: ${n.showIf || "(none)"}\n`);
      parts.push(`profile_field: ${JSON.stringify(n.profileFields)}\n`);
      parts.push(`선택지:\n  ${formatOptions(n)}\n`);
      if (n.placeholder) parts.push(`placeholder: ${n.placeholder}\n`);
    }
  }
  return parts.join("");
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const resultPath = path.join(OUT_DIR, "real-estate-dump-result.md");
const questionsPath = path.join(OUT_DIR, "real-estate-dump-questions.md");
fs.writeFileSync(resultPath, buildResultMd(), "utf8");
fs.writeFileSync(questionsPath, buildQuestionsMd(), "utf8");

function lineCount(p) {
  return fs.readFileSync(p, "utf8").split(/\n/).length;
}
console.log(`Wrote ${resultPath} (${lineCount(resultPath)} lines)`);
console.log(`Wrote ${questionsPath} (${lineCount(questionsPath)} lines)`);
