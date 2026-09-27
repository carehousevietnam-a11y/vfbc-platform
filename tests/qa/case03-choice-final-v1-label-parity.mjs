#!/usr/bin/env node
/**
 * CASE_03 v1 Claude — md 문구 ↔ code label 글자 단위 일치 + choice count ≤5 + 재요구 질문 표시 조건.
 * Run: npx tsx tests/qa/case03-choice-final-v1-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE03_FIELD_OPTION_MAP,
  attachCaseResolutionSnapshot,
  buildAdminVerifyProfileQuestions,
} from "../../src/lib/adminVerifyProfiling.ts";

const MD_PATH = path.join(process.cwd(), "docs/master/VFBCAI_CASE03_CHOICE_FINAL_v1_CLAUDE.md");
const SRC = fs
  .readFileSync(path.join(process.cwd(), "src/lib/adminVerifyProfiling.ts"), "utf8")
  .replace(/(label|placeholder):\s+"/g, "$1: \"");
const DI_LABEL = "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";
const REMOVED = {
  case03_authorityFollowUp: ["re_attendance", "unsure"],
  case03_prepRequired: ["unsure"],
  case03_evidence: ["unsure"],
  case03_repeatFollowUp: ["not_applicable"],
};

function strip(label) {
  const i = label.indexOf(" [");
  return (i >= 0 ? label.slice(0, i) : label).trim();
}

const md = fs.readFileSync(MD_PATH, "utf8");
const problems = [];
for (const part of md.split(/^### /m).slice(1)) {
  const fid = part.match(/^case03_\w+/)?.[0];
  if (!fid) continue;
  const q = part.match(/^Q:\s*(.+)$/m)?.[1]?.trim();
  const ph = part.match(/^안내\(placeholder\):\s*(.+)$/m)?.[1]?.trim();
  if (q && !SRC.includes(`label: ${JSON.stringify(q)}`)) problems.push({ kind: "question", fid, q });
  if (ph && !SRC.includes(`placeholder: ${JSON.stringify(ph)}`)) problems.push({ kind: "placeholder", fid, ph });
  const rows = [];
  for (const line of part.split("\n")) {
    const r = line.match(/^-\s+([a-z0-9_]+):\s*(.+)$/);
    if (r && !r[1].startsWith("case03_")) rows.push([r[1], strip(r[2])]);
  }
  if (!rows.length) continue;
  const opts = CASE03_FIELD_OPTION_MAP[fid];
  if (!opts) { problems.push({ kind: "missing-map", fid }); continue; }
  const content = opts.filter((o) => o.value !== "other");
  if (content.length > 5) problems.push({ kind: "choice-count", fid, n: content.length });
  const by = new Map(opts.map((o) => [o.value, o.label]));
  for (const [slug, label] of rows) {
    if (by.get(slug) !== label) problems.push({ kind: "choice", fid, slug, expected: label, actual: by.get(slug) });
  }
  if (content.length !== rows.length) problems.push({ kind: "extra-options", fid, code: content.map((o) => o.value) });
  for (const slug of REMOVED[fid] ?? []) if (by.has(slug)) problems.push({ kind: "removed-present", fid, slug });
  const di = opts.find((o) => o.value === "other");
  if (!di || di.label !== DI_LABEL) problems.push({ kind: "di", fid });
}

// 재요구 없는 고객: repeatFollowUp 미노출, blockage 노출
const base = attachCaseResolutionSnapshot({
  situation: "received_document",
  profileDocumentSource: "immigration",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "attendance_demand",
  case03_authorityDemand: "specific_incident",
  case03_inquiryFocus: "specific_event",
  case03_customerResponse: "attendance",
  case03_attendancePlace: "Hanoi",
  case03_confirmGoal: "sufficient_explanation",
  case03_deadline: "period_stated",
  case03_factRelationship: "match",
  case03_explanationDetail: "full_explanation",
  case03_authorityFollowUp: "no_further_action",
});
const ids = buildAdminVerifyProfileQuestions(base, {}, {}, 2).map((q) => q.id);
if (ids.includes("case03_repeatFollowUp")) problems.push({ kind: "repeat-shown-without-trigger" });
const repeat = attachCaseResolutionSnapshot({ ...base, case03_authorityFollowUp: "more_explanation" });
const ids2 = buildAdminVerifyProfileQuestions(repeat, {}, {}, 2).map((q) => q.id);
if (!ids2.includes("case03_repeatFollowUp")) problems.push({ kind: "repeat-missing-with-trigger", ids: ids2 });

if (!problems.length) {
  console.log("PASS: CASE_03 v1 label parity + choices <= 5 + repeat condition");
  process.exit(0);
}
for (const p of problems) console.log(JSON.stringify(p));
process.exit(1);
