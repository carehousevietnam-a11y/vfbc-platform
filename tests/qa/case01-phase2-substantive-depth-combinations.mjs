#!/usr/bin/env node
/**
 * CASE_01 — Phase2 실질 축 > Phase1 실질 축 (175조합).
 * Run: npx --yes tsx tests/qa/case01-phase2-substantive-depth-combinations.mjs
 */
import { runCase01Phase2SubstantiveDepthAudit } from "./case01-phase2-substantive-depth-combinations.impl.mjs";

const { under, total } = runCase01Phase2SubstantiveDepthAudit();

console.log(`CASE_01 substantive depth grid: ${total} combinations`);
console.log(`미달 조합: ${under.length}건`);

if (under.length > 0) {
  for (const row of under) {
    console.log(`- ${row.describe} | P1=${row.p1} P2=${row.p2} | 축=${row.symbols}`);
  }
  process.exit(1);
}

console.log("PASS: all combinations meet Phase2 > Phase1 substantive depth");
process.exit(0);
