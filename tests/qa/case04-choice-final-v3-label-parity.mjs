#!/usr/bin/env node
/**
 * CASE_04 v3 Claude — md 화면 문구 ↔ code label 글자 단위 일치 + choice count ≤5.
 * Run: npx tsx tests/qa/case04-choice-final-v3-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  CASE04_V3_FIELD_OPTION_MAP,
  CASE04_V3_QUESTION_LABELS,
} from "../../src/lib/adminVerifyCase04ChoiceFinalV3.ts";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
} from "../../src/lib/adminVerifyProfiling.ts";

const MD_PATH = path.join(
  process.cwd(),
  "docs/master/VFBCAI_CASE04_CHOICE_FINAL_v3_CLAUDE.md",
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
    const fieldMatch = part.match(/^case04_\w+/);
    if (!fieldMatch) continue;
    const fieldId = fieldMatch[0];
    const questionMatch = part.match(/^Q:\s*(.+)/m);
    const question = questionMatch?.[1]?.trim();
    const rows = [];
    for (const line of part.split("\n")) {
      const row = line.match(/^-\s+([a-z0-9_]+):\s*(.+)$/);
      if (!row) continue;
      if (row[1].startsWith("case04_")) continue;
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
    const expectedQuestion = CASE04_V3_QUESTION_LABELS[fieldId];
    if (expectedQuestion && question && question !== expectedQuestion) {
      mismatches.push({
        kind: "question",
        fieldId,
        expected: expectedQuestion,
        actual: question,
      });
    }
    const codeOptions = CASE04_V3_FIELD_OPTION_MAP[fieldId];
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
      case04_unclearFocus: ["why_submit_apply"],
      case04_authorityFollowUp: ["awaiting_review", "more_docs"],
      case04_evidence: ["unsure"],
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

/** non-repeat 고객: 2차 core 완료 후 tail(blockage) 노출 여부 */
function assertTailAxesAfterCoreComplete() {
  const base = attachCaseResolutionSnapshot({
    situation: "received_document",
    profileDocumentSource: "immigration",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
    case04_supplementTarget: "additional_docs",
    case04_confirmGoal: "prepare_materials",
    case04_customerResponse: "submitted",
    case04_deadline: "period_stated",
    case04_initialSubmission: "complete",
    case04_submissionRelation: "add_missing",
    case04_supplementReason: "missing_info",
    case04_addDocDetail: "id_doc",
    case04_authorityFollowUp: "accepted",
  });
  const questions = buildAdminVerifyProfileQuestions(base, {}, {}, 2);
  const ids = questions.map((q) => q.id);
  const violations = [];
  if (!ids.includes("case04_blockage")) {
    violations.push("missing case04_blockage on non-repeat tail path");
  }
  if (ids.includes("case04_repeatSupplement")) {
    violations.push("case04_repeatSupplement shown without repeat trigger");
  }
  return violations;
}

const labelMismatches = compareLabels();
const tailViolations = assertTailAxesAfterCoreComplete();

if (labelMismatches.length === 0 && tailViolations.length === 0) {
  console.log("PASS: CASE_04 v3 label parity (0 mismatches) + tail path check");
  process.exit(0);
}

if (labelMismatches.length) {
  console.log(`Label mismatches (${labelMismatches.length}):`);
  for (const m of labelMismatches) {
    console.log(JSON.stringify(m));
  }
}
if (tailViolations.length) {
  console.log(`Tail path violations (${tailViolations.length}):`);
  for (const v of tailViolations) {
    console.log(v);
  }
}
process.exit(1);
