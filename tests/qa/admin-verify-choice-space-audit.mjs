#!/usr/bin/env node
/**
 * §3 선택 공간 자동 검사 A/B/C — 실패만 출력.
 * Run: npx tsx tests/qa/admin-verify-choice-space-audit.mjs
 */
import { runAdminVerifyChoiceSpaceAudit } from "../../src/lib/adminVerifyChoiceSpaceAudit.ts";

const failures = runAdminVerifyChoiceSpaceAudit();

if (failures.length === 0) {
  console.log("PASS: no choice-space audit failures");
  process.exit(0);
}

const byTest = { META: [], A: [], B: [], C: [] };
for (const row of failures) {
  byTest[row.test].push(row);
}

for (const test of ["META", "A", "B", "C"]) {
  const rows = byTest[test];
  if (rows.length === 0) continue;
  console.log(`\n## Test ${test} (${rows.length})`);
  for (const row of rows) {
    console.log(`- CASE_${row.caseCode} ${row.fieldId}: ${row.detail}`);
  }
}

console.log(`\nTotal failures: ${failures.length}`);
process.exit(1);
