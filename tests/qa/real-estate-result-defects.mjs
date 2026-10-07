import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
function hasRenderedDefect(line) {
  if (!line?.trim()) return true;
  if (line.includes("{")) return true;
  if (line.includes("[") || line.includes("]")) return true;
  if (/\(분양이면/.test(line)) return true;
  if (line.includes(" / ") && /임대:|매매:|상가/.test(line)) return true;
  if (/undefined|null/i.test(line)) return true;
  return false;
}

let total = 0;
let bracket = 0;
let emptyM2 = 0;
let headlineContradict = 0;

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    total++;
    const data = buildFirstResultData(caseId, answers);
    const blob = [
      data.statusHeadline,
      data.situationSummary,
      ...data.keyMetrics.map((m) => m.footnote),
      ...data.actions,
    ].join("\n");
    if (blob.split("\n").some((line) => hasRenderedDefect(line))) bracket++;
    const visibleCards = data.keyMetrics.filter((m) => (m.footnote ?? "").trim()).length;
    if (visibleCards !== 3) emptyM2++;
    if (
      data.statusHeadline.includes("남아 있습니다") &&
      data.unconfirmed.length === 0 &&
      data.cautions.length === 0
    ) {
      headlineContradict++;
    }
  }
}

console.log(`total=${total}`);
console.log(`defect_bracket_or_split=${bracket}`);
console.log(`empty_metric_slot2=${emptyM2}`);
console.log(`headline_04_contradict=${headlineContradict}`);
