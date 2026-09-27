#!/usr/bin/env node
/**
 * CASE_05 v3 Claude — md 화면 문구 ↔ code label 글자 단위 일치 + choice count ≤5.
 * Run: npx tsx tests/qa/case05-choice-final-v3-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  CASE05_V2_FIELD_OPTION_MAP as CASE_FIELD_OPTION_MAP,
  CASE05_V2_QUESTION_LABELS as CASE_QUESTION_LABELS,
} from "../../src/lib/adminVerifyCase05ChoiceFinalV2.ts";

const MD_PATH = path.join(
  process.cwd(),
  "docs/master/VFBCAI_CASE05_CHOICE_FINAL_v3_CLAUDE.md",
);

const DI_LABEL = "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";

function stripBracketMeta(label) {
  const idx = label.indexOf(" [");
  return idx >= 0 ? label.slice(0, idx).trim() : label.trim();
}

function parseMdSpec(md) {
  const sections = [];
  const parts = md.split(/^### /m).slice(1);
  for (const part of parts) {
    const fieldMatch = part.match(/^case05_\w+/);
    if (!fieldMatch) continue;
    const fieldId = fieldMatch[0];
    const questionMatch = part.match(/^Q:\s*(.+)/m);
    const question = questionMatch?.[1]?.trim();
    const rows = [];
    for (const line of part.split("\n")) {
      const row = line.match(/^-\s+([a-z0-9_]+):\s*(.+)$/);
      if (!row) continue;
      if (row[1].startsWith("case05_")) continue;
      rows.push({ slug: row[1], label: stripBracketMeta(row[2]) });
    }
    sections.push({ fieldId, question, rows });
  }
  return sections;
}

function isDirectInput(opt) {
  return opt.value === "other" || opt.label === DI_LABEL;
}

function compareLabels() {
  const md = fs.readFileSync(MD_PATH, "utf8");
  const sections = parseMdSpec(md);
  const mismatches = [];

  for (const { fieldId, question, rows } of sections) {
    const expectedQuestion = CASE_QUESTION_LABELS[fieldId];
    if (expectedQuestion && question && question !== expectedQuestion) {
      mismatches.push({
        kind: "question",
        fieldId,
        expected: expectedQuestion,
        actual: question,
      });
    }
    const codeOptions = CASE_FIELD_OPTION_MAP[fieldId];
    if (!codeOptions) {
      if (rows.length > 0) {
        mismatches.push({ kind: "missing-map", fieldId });
      }
      continue;
    }
    const contentCount = codeOptions.filter((o) => !isDirectInput(o)).length;
    if (contentCount > 5) {
      mismatches.push({
        kind: "choice-count",
        fieldId,
        count: contentCount,
      });
    }
    const bySlug = new Map(codeOptions.map((o) => [o.value, o.label]));
    for (const { slug, label } of rows) {
      const codeLabel = bySlug.get(slug);
      if (codeLabel === undefined) {
        mismatches.push({ kind: "slug-missing", fieldId, slug });
        continue;
      }
      if (codeLabel !== label) {
        mismatches.push({
          kind: "choice",
          fieldId,
          slug,
          expected: label,
          actual: codeLabel,
        });
      }
    }
    for (const opt of codeOptions) {
      if (opt.value === "other" && opt.label !== DI_LABEL) {
        mismatches.push({ kind: "di", fieldId, expected: DI_LABEL, actual: opt.label });
      }
    }
    const removed = {
      case05_dispositionReason: ["unsure"],
      case05_explanationDetail: ["both_unverified"],
      case05_appealDetail: ["preparing_deadline_known"],
      case05_authorityFollowUp: ["under_review"],
      case05_blockage: ["evidence"],
      case05_evidence: ["payment_proof"],
      case05_finalGoal: ["evidence"],
    }[fieldId];
    if (removed) {
      for (const slug of removed) {
        if (bySlug.has(slug)) {
          mismatches.push({ kind: "removed-still-present", fieldId, slug });
        }
      }
    }
  }

  return mismatches;
}

const labelMismatches = compareLabels();

if (labelMismatches.length === 0) {
  console.log("PASS: CASE_05 v3 label parity (0 mismatches, choices <= 5)");
  process.exit(0);
}
console.log(`Label mismatches (${labelMismatches.length}):`);
for (const m of labelMismatches) console.log(JSON.stringify(m));
process.exit(1);
