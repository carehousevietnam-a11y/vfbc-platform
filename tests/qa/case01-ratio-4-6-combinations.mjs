#!/usr/bin/env node
/**
 * CASE_01 Brief v3 — 4:6 미달 조합 목록 (수정 없음 · 보고용).
 * Run: npx --yes tsx tests/qa/case01-ratio-4-6-combinations.mjs
 */
import { runCase01Ratio46CombinationAudit } from "./case01-ratio-4-6-combinations.impl.mjs";

const { brief30Mismatches, under, total } = runCase01Ratio46CombinationAudit();

if (brief30Mismatches.length) {
  console.error("FAIL: Brief §5 30-row expectation mismatch:", brief30Mismatches.length);
  for (const row of brief30Mismatches) {
    console.error(JSON.stringify(row));
  }
  process.exit(1);
}

console.log(`CASE_01 4:6 grid: ${total} combinations scanned`);
console.log(`미달 조합: ${under.length}건\n`);

for (const row of under) {
  console.log(
    `- ${row.describe} | P1=${row.p1} P2=${row.p2} 하한=${row.floor} | 축=${row.symbols}`,
  );
}

console.log("\nBrief §5 핵심 미달 (has_responded × payment|attend|supplement|correct × match):");
const coreMiss = under.filter((row) => {
  return (
    row.describe.startsWith("has_responded × payment × match") ||
    row.describe.startsWith("has_responded × attend × match") ||
    row.describe.startsWith("has_responded × supplement × match") ||
    row.describe.startsWith("has_responded × correct × match")
  );
});
console.log(`  core 미달 ${coreMiss.length}건 (기대 4건 — payment/attend/supplement/correct × match)`);

if (coreMiss.length !== 4) {
  console.error("FAIL: expected 4 core 미달 rows for has_responded×match×(payment|attend|supplement|correct)");
  process.exit(1);
}

console.log("PASS: Brief §5 30-row alignment + 미달 목록 emitted");
