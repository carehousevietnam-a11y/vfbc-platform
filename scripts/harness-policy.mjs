/**
 * Policy checks for the harness itself: no database writes and no remote publish.
 */
import fs from "node:fs";
import path from "node:path";

const WATCHED = [
  "scripts/verify.mjs",
  "scripts/harness-pdf-baseline.mjs",
  "scripts/harness-screen.mjs",
  "scripts/harness-shared-diff.mjs",
  "scripts/harness-known-g4.mjs",
  "scripts/harness-recurrence.mjs",
  "scripts/harness-policy.mjs",
  ".githooks/pre-commit",
  ".githooks/commit-msg",
  "scripts/harness-standards.mjs",
  "scripts/harness-report-layout.mjs",
  "tests/qa/tax-content-final.mjs",
  "tests/qa/fraud-content-final.mjs",
  "tests/qa/unclear-content-final.mjs",
  "tests/qa/trc-content-final.mjs",
  "tests/qa/wp-content-final.mjs",
  "tests/qa/tamtru-content-final.mjs",
  "tests/qa/license-content-final.mjs",
  "tests/qa/company-content-final.mjs",
  "tests/qa/restaurant-content-final.mjs",
];

const DB_WRITE = [
  /createClient\s*\(/,
  /\.insert\s*\(/,
  /\.upsert\s*\(/,
  /\.update\s*\(/,
  /\.delete\s*\(/,
  /supabase\.from\s*\(/,
];

export function policyViolations(root) {
  const hits = [];
  for (const rel of WATCHED) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file)) {
      hits.push(`missing ${rel}`);
      continue;
    }
    const text = fs.readFileSync(file, "utf8");
    if (/\bgit\s+push\b/.test(text)) hits.push(`push ${rel}`);
    for (const pattern of DB_WRITE) {
      if (pattern.test(text)) hits.push(`db ${rel} ${pattern}`);
    }
  }
  return hits;
}
