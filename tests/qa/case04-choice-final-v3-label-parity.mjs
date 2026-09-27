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

/** 개인화 퍼널 v1: 단순 고객은 짧게(blockage·finalGoal 생략), 복잡 고객은 깊게 */
function assertTailAxesAfterCoreComplete() {
  const common = {
    situation: "received_document",
    profileDocumentSource: "immigration",
    stage: "case",
    [ADMIN_CASE_ENTRY_Q1_KEY]: "supplement_demand",
  };
  const ids = (a) => buildAdminVerifyProfileQuestions(attachCaseResolutionSnapshot(a), {}, {}, 2).map((q) => q.id);
  const violations = [];

  // 단순: 추가 서류, 이미 제출, 목표 분명 → 기한·막힌 점·최종 목표를 다시 묻지 않음
  const simple = ids({
    ...common,
    case04_supplementTarget: "additional_docs",
    case04_customerResponse: "submitted",
    case04_confirmGoal: "understand_materials",
    case04_addDocDetail: "id_doc",
    case04_initialSubmission: "partial",
    case04_authorityFollowUp: "accepted",
  });
  if (simple.includes("case04_deadline")) violations.push("simple: deadline asked after submission");
  if (simple.includes("case04_submissionRelation")) violations.push("simple: submissionRelation asked though target already says it");
  if (simple.includes("case04_supplementReason")) violations.push("simple: supplementReason asked for additional_docs");
  if (simple.includes("case04_blockage")) violations.push("simple: blockage opened for everyone");
  if (!simple.includes("case04_evidence")) violations.push("simple: evidence (COMMON) missing");
  if (simple.includes("case04_repeatSupplement")) violations.push("simple: repeatSupplement without repeat trigger");

  // 복잡: 이해 못 함 + 무엇부터 할지 모름 → 막힌 점·최종 목표까지 깊어짐
  const complex = ids({
    ...common,
    case04_supplementTarget: "unclear",
    case04_customerResponse: "not_started",
    case04_confirmGoal: "unsure",
    case04_deadline: "unsure",
    case04_unclearFocus: "what_submit_list",
    case04_initialSubmission: "hard_to_confirm",
    case04_submissionRelation: "hard_to_judge",
    case04_supplementReason: "unsure",
    case04_blockage: "what_submit",
    case04_evidence: "supplement_notice",
  });
  for (const id of ["case04_initialSubmission", "case04_submissionRelation", "case04_supplementReason", "case04_blockage", "case04_evidence", "case04_finalGoal"]) {
    if (!complex.includes(id)) violations.push(`complex: ${id} missing`);
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
