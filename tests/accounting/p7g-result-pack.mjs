/**
 * P7g — result pack alignment + 3×5 variant render.
 * Run: node tests/accounting/p7g-result-pack.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureTsxRuntime } from "../qa/_ensure-tsx-runtime.mjs";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { ACCOUNTING_FUNNEL_PACKS } = await import("../../src/lib/accounting/funnel/contentPackData.ts");
const { collectResultPackAlignmentIssues } = await import(
  "../../src/lib/accounting/funnel/validateResultPackAlignment.ts"
);
const { resolveResultVariant, stage1LanguageQuestionId } = await import(
  "../../src/lib/accounting/funnel/resolveFirstResult.ts"
);

const resultRaw = fs.readFileSync(
  path.join(repoRoot, "docs/master/content/RESULT_PACK_FUNNEL.json"),
  "utf8",
);
const resultBundle = JSON.parse(resultRaw);

let fail = 0;
function assert(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
    fail += 1;
  } else {
    console.log(`PASS ${name}`);
  }
}

const allIssues = [];
for (const entryId of Object.keys(ACCOUNTING_FUNNEL_PACKS)) {
  const issues = collectResultPackAlignmentIssues(ACCOUNTING_FUNNEL_PACKS[entryId], resultBundle[entryId]);
  allIssues.push(...issues);
}
if (allIssues.length > 0) {
  console.error("ALIGNMENT_MISMATCH");
  for (const issue of allIssues) {
    console.error(
      `${issue.entry_id} ${issue.question_id} ${issue.choice_id} (${issue.reason})`,
    );
  }
  fail += 1;
} else {
  assert("result_when_alignment", true);
}

for (const entryId of Object.keys(ACCOUNTING_FUNNEL_PACKS)) {
  const qPack = ACCOUNTING_FUNNEL_PACKS[entryId];
  const rPack = resultBundle[entryId];
  const q2 = qPack.stage1.find((q) => q.id.endsWith("_s1_q2"));
  const langQ = stage1LanguageQuestionId(qPack);
  if (!q2) {
    assert(`${entryId} s1_q2`, false, "missing");
    continue;
  }
  for (const choice of q2.choices) {
    const answers = { [q2.id]: choice.id };
    if (langQ) answers[langQ] = "fluent";
    const variant = resolveResultVariant(rPack, answers);
    assert(
      `${entryId} render ${choice.id}`,
      Boolean(variant?.summary?.length),
      variant ? "" : "no variant",
    );
  }
}

process.exit(fail > 0 ? 1 : 0);
