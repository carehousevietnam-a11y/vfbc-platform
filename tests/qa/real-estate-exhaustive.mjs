/**
 * C1.3-R3 — phase1 전수 열거 (solver 폐기)
 */
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { verifyRe02GatePaths } from "../../src/lib/contentPacks/realEstate/exhaustiveGate.ts";
import { phase1QuestionIds } from "../../src/lib/contentPacks/runner.ts";
import {
  buildFirstResultData,
  buildProfile,
  getNode,
  nodeVisible,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import {
  listMatchingPathIds,
  pickSinglePathId,
  phase2ChainFromF,
} from "../../src/lib/contentPacks/realEstate/fPathResolve.ts";
import { REAL_ESTATE_F_PATHS } from "../../src/lib/contentPacks/realEstate/generated/meta.ts";
import { REAL_ESTATE_M45 } from "../../src/lib/contentPacks/realEstate/generated/m45.ts";
import { buildResultMetrics, buildResultSteps } from "../../src/lib/contentPacks/realEstate/m45Engine.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { matchTrigger } from "../../src/lib/contentPacks/engine/packRunner.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();

let totalCombos = 0;
let chainOk = 0;
let meaningOk = 0;
let resultOk = 0;
const pathErrors = [];
const unreachable = [];
const missingLookups = new Set();
const specialRows = [];

function meaningMatches(caseId, answers) {
  const profile = buildProfile(caseId, answers);
  const order =
    caseId === "RE06" ? [] : [...phase1QuestionIds(caseId), "re_entry"];
  const keyOwner = {};
  for (const qid of order) {
    const val = answers[qid];
    if (val == null || qid === "re_entry") continue;
    const node = getNode(caseId, qid);
    if (!node || node.kind === "text") continue;
    const values = Array.isArray(val) ? val : [String(val)];
    for (const v of values) {
      const opt = node.options.find((o) => o.value === v);
      if (!opt?.meaning) continue;
      for (const part of opt.meaning.split(";")) {
        const m = part.trim().match(/^([^=]+)=(.+)$/);
        if (!m) continue;
        keyOwner[m[1].trim()] = qid;
      }
    }
  }
  for (const [qid, val] of Object.entries(answers)) {
    if (qid === "re_entry") continue;
    const node = getNode(caseId, qid);
    if (!node || node.kind === "text") continue;
    const values = Array.isArray(val) ? val : [String(val)];
    for (const v of values) {
      const opt = node.options.find((o) => o.value === v);
      if (!opt?.meaning) continue;
      for (const part of opt.meaning.split(";")) {
        const m = part.trim().match(/^([^=]+)=(.+)$/);
        if (!m) continue;
        const key = m[1].trim();
        const want = m[2].trim();
        if (keyOwner[key] !== qid) continue;
        const got = profile.fields[key];
        if (got === want || got === v) continue;
        if (got == null) continue;
        return false;
      }
    }
  }
  return true;
}

function visibleChain(caseId, chain, answers) {
  return chain.filter((id) => {
    const n = getNode(caseId, id);
    if (!n?.showIf) return false;
    return nodeVisible(n, answers, caseId);
  });
}

function hasRenderedDefect(line) {
  if (!line?.trim()) return true;
  if (line.includes("{")) return true;
  if (line.includes("[") || line.includes("]")) return true;
  if (/\(분양이면/.test(line)) return true;
  if (line.includes(" / ") && /임대:|매매:|상가/.test(line)) return true;
  if (/undefined|null/i.test(line)) return true;
  return false;
}

function resultSentenceOk(caseId, answers) {
  const [m1, m2, m3] = buildResultMetrics(caseId, answers);
  const steps = buildResultSteps(caseId, answers);
  const pack = REAL_ESTATE_M45.find((p) => p.caseId === caseId);
  if (!pack) return false;
  const lines = [m1, m2, m3, ...steps];
  for (const line of lines) {
    if (hasRenderedDefect(line)) {
      if (line.includes("{")) {
        const ph = line.match(/\{(\w+)\}/g);
        ph?.forEach((p) => missingLookups.add(`${caseId} metric placeholder ${p}`));
      }
      return false;
    }
  }
  return steps.length >= 3;
}

function scanSpecial(caseId, answers) {
  const risks = bundle.risks[caseId];
  if (!risks?.special?.length) return;
  for (const row of risks.special) {
    const ok = matchTrigger(row.trigger, answers, bundle.pathAliases[caseId] ?? {});
    specialRows.push({ caseId, trigger: row.trigger, matched: ok, line: row.line });
  }
}

for (const caseId of CASES) {
  const combos = enumeratePhase1Combinations(caseId);
  const reached = new Set();
  for (const answers of combos) {
    totalCombos++;
    const matching = listMatchingPathIds(caseId, answers);
    const pathId = pickSinglePathId(caseId, answers);
    if (matching.length !== 1 || !pathId) {
      pathErrors.push({ caseId, matching, pathId, answers: JSON.stringify(answers) });
      continue;
    }
    reached.add(pathId);
    const chain = phase2ChainFromF(caseId, answers);
    const p2 = phase2QuestionIds(caseId, answers);
    const expected = visibleChain(caseId, chain, answers);
    if (p2.join(",") === expected.join(",")) chainOk++;
    if (meaningMatches(caseId, answers)) meaningOk++;
    if (resultSentenceOk(caseId, answers)) resultOk++;
    scanSpecial(caseId, answers);
    buildFirstResultData(caseId, answers);
  }
  if (caseId === "RE02") {
    const gate = verifyRe02GatePaths();
    gate.reached.forEach((p) => reached.add(p));
    console.log(
      `RE02_GATE: combos=${gate.combos} reached_A=${gate.reached.has("PATH_A")} reached_D1=${gate.reached.has("PATH_D1")} errors=${gate.pathErrors.length}`,
    );
  }
  for (const row of REAL_ESTATE_F_PATHS[caseId] ?? []) {
    if (caseId === "RE04" && row.pathId === "X") continue;
    if (caseId === "RE02" && row.pathId === "PATH_A" && reached.has("PATH_A")) continue;
    if (!reached.has(row.pathId)) {
      unreachable.push({ caseId, pathId: row.pathId, condition: row.condition });
    }
  }
  console.log(`${caseId}: combinations=${combos.length} paths_reached=${reached.size}/${(REAL_ESTATE_F_PATHS[caseId] ?? []).filter((r) => !(caseId === "RE04" && r.pathId === "X")).length}`);
}

console.log("---");
console.log(`TOTAL combinations: ${totalCombos}`);
console.log(`path_errors: ${pathErrors.length}`);
console.log(`chain_ok: ${chainOk}/${totalCombos}`);
console.log(`meaning_ok: ${meaningOk}/${totalCombos}`);
console.log(`result_1to1_ok: ${resultOk}/${totalCombos}`);
console.log(`unreachable_paths: ${unreachable.length}`);

if (pathErrors.length) {
  console.log("PATH_ERRORS sample", pathErrors.slice(0, 8));
}
if (unreachable.length) {
  console.log("UNREACHABLE", unreachable);
}
if (missingLookups.size) {
  console.log("MISSING_LOOKUPS", [...missingLookups].slice(0, 30));
}

const pass =
  pathErrors.length === 0 &&
  unreachable.length === 0 &&
  chainOk === totalCombos &&
  meaningOk === totalCombos &&
  resultOk === totalCombos;

if (!pass) process.exit(1);
console.log("real-estate-exhaustive: PASS");
