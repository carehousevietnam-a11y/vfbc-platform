#!/usr/bin/env node
/**
 * CASE_05 v2 Claude — md 화면 문구 ↔ 코드 label 글자 단위 일치.
 * Run: npx tsx tests/qa/case05-choice-final-v2-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  CASE05_V2_FIELD_OPTION_MAP,
  CASE05_V2_QUESTION_LABELS,
} from "../../src/lib/adminVerifyCase05ChoiceFinalV2.ts";
import { buildAdminVerifyProfileQuestions } from "../../src/lib/adminVerifyProfiling.ts";

const MD_PATH = path.join(
  process.cwd(),
  "docs/master/VFBCAI_CASE05_CHOICE_FINAL_v2_CLAUDE.md",
);

const DI_LABEL = "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";
const REMOVED_FIELD_IDS = [
  "case05_dispositionOutcome",
  "case05_repeatFollowUp",
  "case05_plannedNextStep",
];

function parseMdSpec(md) {
  const sections = [];
  const parts = md.split(/^### /m).slice(1);
  for (const part of parts) {
    const fieldMatch = part.match(/^(A\d+|B\d+)\.\s+(case05_\w+)/);
    if (!fieldMatch) continue;
    const fieldId = fieldMatch[2];
    const questionMatch = part.match(/질문:\s*(.+)/);
    const question = questionMatch?.[1]?.trim();
    const rows = [];
    for (const line of part.split("\n")) {
      const row = line.match(/^\|\s*([a-z0-9_]+)\s*\|\s*(.+?)\s*\|$/);
      if (!row) continue;
      if (row[1] === "slug" || row[1] === "------") continue;
      rows.push({ slug: row[1], label: row[2] });
    }
    sections.push({ fieldId, question, rows });
  }
  return sections;
}

function compareLabels() {
  const md = fs.readFileSync(MD_PATH, "utf8");
  const sections = parseMdSpec(md);
  const mismatches = [];

  for (const { fieldId, question, rows } of sections) {
    if (fieldId === "case05_deadlineDate") {
      const expectedQ = CASE05_V2_QUESTION_LABELS.case05_deadlineDate;
      if (question !== expectedQ) {
        mismatches.push({ kind: "question", fieldId, expected: expectedQ, actual: question });
      }
      continue;
    }
    const expectedQuestion = CASE05_V2_QUESTION_LABELS[fieldId];
    if (expectedQuestion && question && question !== expectedQuestion) {
      mismatches.push({
        kind: "question",
        fieldId,
        expected: expectedQuestion,
        actual: question,
      });
    }
    const codeOptions = CASE05_V2_FIELD_OPTION_MAP[fieldId];
    if (!codeOptions) {
      if (rows.length > 0) {
        mismatches.push({ kind: "missing-map", fieldId, detail: "no CASE05_V2_FIELD_OPTION_MAP" });
      }
      continue;
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
        mismatches.push({
          kind: "di",
          fieldId,
          expected: DI_LABEL,
          actual: opt.label,
        });
      }
    }
  }

  return mismatches;
}

function assertRemovedQuestionsNeverShown() {
  const samples = [
    { case05_dispositionType: "application_denied", _case05Active: "1" },
    {
      case05_dispositionType: "situation_mismatch",
      case05_confirmGoal: "unsure",
      case05_customerResponse: "none",
      case05_deadline: "unsure",
      _case05Active: "1",
    },
    {
      case05_dispositionType: "application_denied",
      case05_confirmGoal: "what_to_do",
      case05_customerResponse: "inquired",
      case05_deadline: "specific_date",
      case05_deadlineDate: "2026-10-01",
      case05_authorityFollowUp: "maintained",
      _case05Active: "1",
    },
  ];
  const violations = [];
  for (const base of samples) {
    const questions = buildAdminVerifyProfileQuestions(base, {}, {}, 2);
    for (const removed of REMOVED_FIELD_IDS) {
      if (questions.some((q) => q.id === removed)) {
        violations.push({ removed, sample: base.case05_customerResponse ?? "partial" });
      }
    }
  }
  return violations;
}

const labelMismatches = compareLabels();
const removedViolations = assertRemovedQuestionsNeverShown();

if (labelMismatches.length === 0 && removedViolations.length === 0) {
  console.log("PASS: CASE_05 v2 label parity (0 mismatches) + removed questions hidden");
  process.exit(0);
}

if (labelMismatches.length) {
  console.log(`Label mismatches (${labelMismatches.length}):`);
  for (const m of labelMismatches) {
    console.log(JSON.stringify(m));
  }
}
if (removedViolations.length) {
  console.log(`Removed question violations (${removedViolations.length}):`);
  for (const v of removedViolations) {
    console.log(JSON.stringify(v));
  }
}
process.exit(1);
