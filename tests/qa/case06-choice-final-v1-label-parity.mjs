#!/usr/bin/env node
/**
 * CASE_06 v1 Claude — md 문구 ↔ code label 글자 단위 일치 + choice count ≤5 + slug 불변.
 * Run: npx tsx tests/qa/case06-choice-final-v1-label-parity.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { CASE06_V11_FIELD_OPTIONS } from "../../src/lib/adminVerifyCase06Redesign.ts";

const MD = fs.readFileSync(path.join(process.cwd(), "docs/master/VFBCAI_CASE06_CHOICE_FINAL_v1_CLAUDE.md"), "utf8");
const SRC = fs.readFileSync(path.join(process.cwd(), "src/lib/adminVerifyCase06Redesign.ts"), "utf8");
const DI_LABEL = "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";
const strip = (l) => { const i = l.indexOf(" ["); return (i >= 0 ? l.slice(0, i) : l).trim(); };
const problems = [];
for (const part of MD.split(/^### /m).slice(1)) {
  const fid = part.match(/^case06_\w+/)?.[0];
  if (!fid) continue;
  const q = part.match(/^Q:\s*(.+)$/m)?.[1]?.trim();
  const ph = part.match(/^안내\(placeholder\):\s*(.+)$/m)?.[1]?.trim();
  if (q && !SRC.includes(JSON.stringify(q))) problems.push({ kind: "question", fid, q });
  if (ph && !SRC.includes(JSON.stringify(ph))) problems.push({ kind: "placeholder", fid });
  const rows = [];
  for (const line of part.split("\n")) {
    const r = line.match(/^-\s+([a-z0-9_]+):\s*(.+)$/);
    if (r) rows.push([r[1], strip(r[2])]);
  }
  if (!rows.length) continue;
  const opts = CASE06_V11_FIELD_OPTIONS[fid];
  if (!opts) { problems.push({ kind: "missing-map", fid }); continue; }
  const content = opts.filter((o) => o.value !== "other");
  if (content.length > 5) problems.push({ kind: "choice-count", fid, n: content.length });
  if (content.map((o) => o.value).join() !== rows.map((r) => r[0]).join()) problems.push({ kind: "slug-set", fid });
  const by = new Map(opts.map((o) => [o.value, o.label]));
  for (const [slug, label] of rows) if (by.get(slug) !== label) problems.push({ kind: "choice", fid, slug, actual: by.get(slug) });
  const di = opts.find((o) => o.value === "other");
  if (!di || di.label !== DI_LABEL) problems.push({ kind: "di", fid });
}
if (!problems.length) { console.log("PASS: CASE_06 v1 label parity + choices <= 5 + slugs unchanged"); process.exit(0); }
for (const p of problems) console.log(JSON.stringify(p));
process.exit(1);
