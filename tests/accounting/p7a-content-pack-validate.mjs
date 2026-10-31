/**
 * P7a/P7c Content Pack 검증기 + 위반 fixture 7종.
 * Run: node tests/accounting/p7a-content-pack-validate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureTsxRuntime } from "../qa/_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { ACCOUNTING_FUNNEL_PACKS } = await import("../../src/lib/accounting/funnel/contentPackData.ts");
const { validateAccountingEntryContentPack, validateAccountingFunnelBundle } = await import(
  "../../src/lib/accounting/funnel/validateContentPack.ts"
);
const { analyzeEntryPathStage2 } = await import("../../src/lib/accounting/funnel/pathAnalysis.ts");
const { accountingFunnelEntryFlags } = await import("../../src/lib/accounting/funnel/entryFlags.ts");

const violationsDir = path.join(repoRoot, "tests/accounting/fixtures/p7a-violations");

let fail = 0;
function assert(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
    fail += 1;
  } else {
    console.log(`PASS ${name}`);
  }
}

const productionResult = validateAccountingFunnelBundle(ACCOUNTING_FUNNEL_PACKS);
assert("production packs validate 3/3", productionResult.ok, JSON.stringify(productionResult.byEntry));

const flags = accountingFunnelEntryFlags();
assert("production entry flags all on", Object.values(flags).every((v) => v === true));

for (const entryId of Object.keys(ACCOUNTING_FUNNEL_PACKS)) {
  const pack = ACCOUNTING_FUNNEL_PACKS[entryId];
  const stats = analyzeEntryPathStage2(pack);
  console.log(
    `REPORT ${entryId} stage1=${pack.stage1.length} stage2=${pack.stage2.length} pathStage2 min=${stats.minVisibleStage2} max=${stats.maxVisibleStage2} paths=${stats.pathCount}`,
  );
}

const violationFiles = [
  "six-choices.json",
  "missing-direct-input.json",
  "stage2-ratio.json",
  "show-if-bad-ref.json",
  "sources-missing.json",
  "dead-end-choice.json",
  "path-stage2-max.json",
];

for (const file of violationFiles) {
  const pack = JSON.parse(fs.readFileSync(path.join(violationsDir, file), "utf8"));
  const result = validateAccountingEntryContentPack(pack);
  assert(`violation ${file} fails`, !result.ok, result.errors.join("; "));
}

process.exit(fail > 0 ? 1 : 0);
