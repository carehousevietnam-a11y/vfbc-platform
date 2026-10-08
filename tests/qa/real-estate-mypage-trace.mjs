/**
 * C2.4b — phase2 DFS 경로(유형별 ≥2000) + 위험 field=value 커버리지
 * persist grade2/summary ↔ 2차 화면 ↔ My Page summary lines 일치 · grade 비하락
 */
import fs from "fs";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  buildFirstResultData,
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { buildRealEstatePackPhase2PersistMeta } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";
import {
  buildRealEstatePhase2SummaryLinesFromActivities,
  buildRealEstatePhase1SummaryLinesFromActivities,
} from "../../src/lib/contentPacks/realEstate/realEstatePackMypageFields.ts";
import { tracePackPersonalizedGrades } from "../../src/lib/contentPacks/realEstate/personalizedResultBuilder.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const MIN_PATHS_PER_CASE = 2000;
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();
const riskRows = JSON.parse(
  fs.readFileSync("docs/content-packs/proposals/RE_PHASE2_FACT2_KEYS.json", "utf8"),
);
const riskByCase = {};
for (const row of riskRows) {
  (riskByCase[row.caseId] ??= []).push(row);
}

/** D-2 금지 — ○○○(비용 placeholder) 외 가격·외부 주체 */
const FORBIDDEN = [
  /\d{1,3}(,\d{3})+\s*원/,
  /USD\s*\d/i,
  /₫/,
  /변호사/,
  /법무법인/,
  /Linda/i,
  /공인중개사\s*홍길동/,
];

function phase1Subset(caseId, answers) {
  const out = { re_entry: answers.re_entry };
  if (answers.re_entryNote) out.re_entryNote = answers.re_entryNote;
  for (const n of bundle.nodes[caseId] ?? []) {
    if (n.phase === 1 && answers[n.id] != null) out[n.id] = answers[n.id];
  }
  return out;
}

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

function walkPhase2Greedy(caseId, phase1Answers, overrides = {}) {
  const answers = { ...phase1Answers, ...overrides };
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

function markRiskHits(caseId, answers, hitSet) {
  for (const row of riskByCase[caseId] ?? []) {
    if (String(answers[row.field] ?? "") === row.value) hitSet.add(row.key);
  }
}

function inspectPath(caseId, answers, stats, riskHits) {
  answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
  if (!isPhase2QuestionSetComplete(caseId, answers)) {
    stats.phase2_incomplete++;
    return;
  }
  stats.inspected++;
  markRiskHits(caseId, answers, riskHits);

  const screen = bridge.buildPersonalizedResult(answers);
  if (!screen) {
    stats.build_null++;
    return;
  }

  const persist = buildRealEstatePackPhase2PersistMeta(answers, 2);
  const activities = fakeActivitiesFromPersist(persist);
  const mypageLines = buildRealEstatePhase2SummaryLinesFromActivities(activities);
  const screenLines = splitSummaryLines(screen.situationSummary);

  if (persist.real_estate_pack_phase2_summary !== (screen.situationSummary ?? "")) {
    stats.mismatch_persist_summary++;
  }
  if (String(persist.real_estate_pack_grade2) !== String(screen.gradeFilled)) {
    stats.mismatch_persist_grade++;
  }
  if (mypageLines.join(" ") !== screenLines.join(" ")) {
    stats.mismatch_mypage_lines++;
  }
  const expectedHeadline =
    screen.statusHeadline?.trim() || screenLines[0]?.trim() || "";
  if (
    persist.real_estate_pack_headline &&
    expectedHeadline &&
    persist.real_estate_pack_headline !== expectedHeadline
  ) {
    stats.mismatch_headline++;
  }

  const grades = tracePackPersonalizedGrades(caseId, answers);
  if (grades.grade2 < grades.grade1) stats.grade_drop++;

  const cardText = [
    persist.real_estate_pack_headline ?? "",
    ...mypageLines,
    ...buildRealEstatePhase1SummaryLinesFromActivities(activities),
  ].join(" ");
  for (const re of FORBIDDEN) {
    if (re.test(cardText)) stats.forbidden++;
  }
}

function fakeActivitiesFromPersist(persist) {
  return [{ action: "verify_lead", meta: persist, created_at: new Date().toISOString() }];
}

function splitSummaryLines(summary) {
  const trimmed = (summary ?? "").trim();
  if (!trimmed) return [];
  return trimmed
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const stats = {
  phase1_combinations: 0,
  inspected: 0,
  phase2_incomplete: 0,
  paths_per_case: {},
  risk_keys_missing: 0,
  mismatch_persist_summary: 0,
  mismatch_persist_grade: 0,
  mismatch_mypage_lines: 0,
  mismatch_headline: 0,
  grade_drop: 0,
  forbidden: 0,
  build_null: 0,
};

for (const caseId of CASES) {
  const paths = [];
  const riskHits = new Set();
  for (const phase1 of enumeratePhase1Combinations(caseId)) {
    stats.phase1_combinations++;
    if (paths.length >= MIN_PATHS_PER_CASE) break;
    collectPhase2Paths(caseId, phase1, paths, MIN_PATHS_PER_CASE);
  }
  stats.paths_per_case[caseId] = paths.length;
  for (const answers of paths) inspectPath(caseId, answers, stats, riskHits);
  for (const row of riskByCase[caseId] ?? []) {
    if (riskHits.has(row.key)) continue;
    for (const phase1 of enumeratePhase1Combinations(caseId)) {
      const answers = walkPhase2Greedy(caseId, phase1, { [row.field]: row.value });
      if (!isPhase2QuestionSetComplete(caseId, answers)) continue;
      inspectPath(caseId, answers, stats, riskHits);
      if (riskHits.has(row.key)) break;
    }
    if (!riskHits.has(row.key)) stats.risk_keys_missing++;
  }
}

const fail =
  stats.mismatch_persist_summary > 0 ||
  stats.mismatch_persist_grade > 0 ||
  stats.mismatch_mypage_lines > 0 ||
  stats.mismatch_headline > 0 ||
  stats.grade_drop > 0 ||
  stats.forbidden > 0 ||
  stats.build_null > 0 ||
  stats.risk_keys_missing > 0 ||
  CASES.some((c) => (stats.paths_per_case[c] ?? 0) < MIN_PATHS_PER_CASE)
    ? 1
    : 0;

console.log(
  JSON.stringify(
    {
      ...stats,
      sampling_rule:
        `phase2 DFS (all options per question) until ${MIN_PATHS_PER_CASE} complete paths per case; risk field=value from RE_PHASE2_FACT2_KEYS.json each ≥1`,
      fail,
    },
    null,
    2,
  ),
);

process.exit(fail);
