#!/usr/bin/env node
/**
 * CASE_02 v1 Claude — md 문구 ↔ code label 글자 단위 일치 + choice count ≤5.
 * Run: npx tsx tests/qa/case02-choice-final-v1-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP } from "../../src/lib/adminVerifyProfiling.ts";

const MD = fs.readFileSync(path.join(process.cwd(), "docs/master/VFBCAI_CASE02_CHOICE_FINAL_v1_CLAUDE.md"), "utf8");
const norm = (t) => t.replace(/(label|placeholder):\s+"/g, '$1: "');
const SRC =
  norm(fs.readFileSync(path.join(process.cwd(), "src/lib/adminVerifyProfiling.ts"), "utf8"));
const DI_LABEL = "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";
const strip = (l) => { const i = l.indexOf(" ["); return (i >= 0 ? l.slice(0, i) : l).trim(); };

const problems = [];
for (const part of MD.split(/^### /m).slice(1)) {
  const fid = part.match(/^case02_\w+/)?.[0];
  if (!fid) continue;
  const q = part.match(/^Q:\s*(.+)$/m)?.[1]?.trim();
  const ph = part.match(/^안내\(placeholder\):\s*(.+)$/m)?.[1]?.trim();
  if (q && !SRC.includes(JSON.stringify(q))) problems.push({ kind: "question", fid, q });
  if (ph && !SRC.includes(`placeholder: ${JSON.stringify(ph)}`)) problems.push({ kind: "placeholder", fid });
  const rows = [];
  for (const line of part.split("\n")) {
    const r = line.match(/^-\s+([a-z0-9_]+):\s*(.+)$/);
    if (r && !r[1].startsWith("case02_")) rows.push([r[1], strip(r[2])]);
  }
  if (!rows.length) continue;
  const opts = ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP[fid];
  if (!opts) {
    // 병합 맵에 없는 필드: 소스 문구 직접 확인
    for (const [slug, label] of rows) {
      if (!SRC.includes(`value: ${JSON.stringify(slug)}, label: ${JSON.stringify(label)}`)) {
        problems.push({ kind: "choice-src", fid, slug });
      }
    }
    continue;
  }
  const content = opts.filter((o) => o.value !== "other");
  if (content.length > 5) problems.push({ kind: "choice-count", fid, n: content.length });
  if (content.length !== rows.length) problems.push({ kind: "option-set", fid, code: content.map((o) => o.value) });
  const by = new Map(opts.map((o) => [o.value, o.label]));
  for (const [slug, label] of rows) {
    if (by.get(slug) !== label) problems.push({ kind: "choice", fid, slug, expected: label, actual: by.get(slug) });
  }
  const di = opts.find((o) => o.value === "other");
  if (!di || di.label !== DI_LABEL) problems.push({ kind: "di", fid });
}
if (!problems.length) {
  console.log("PASS: CASE_02 v1 label parity + choices <= 5");
  process.exit(0);
}
for (const p of problems) console.log(JSON.stringify(p));
process.exit(1);
