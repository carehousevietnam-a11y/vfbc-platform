/**
 * C2.3e — apply hand-authored fact2 to proposal MD + Pack md (parser unchanged).
 */
import fs from "fs";
import path from "path";
import { RE_PHASE2_FACT2_BY_KEY } from "./re-phase2-fact2-by-key.mjs";

const KEYS_PATH = path.join("docs", "content-packs", "proposals", "RE_PHASE2_FACT2_KEYS.json");
const PROPOSAL_MD = path.join("docs", "content-packs", "proposals", "RE_PHASE2_FACT2.md");
const PACK_DIR = path.join("docs", "content-packs");

/** Lookup aliases (risk trigger shorthand) — same fact2 as canonical row. */
const EXTRA_ALIASES = [
  { caseId: "RE01", key: "sd_passed", canonical: "re01_sign_deadline=r1_sd_passed" },
  { caseId: "RE01", key: "dp_cash_no_receipt", canonical: "re01_deposit_paid_proof=r1_dp_cash_no_receipt" },
  { caseId: "RE01", key: "dp_via_broker", canonical: "re01_deposit_paid_proof=r1_dp_via_broker" },
];

const keys = JSON.parse(fs.readFileSync(KEYS_PATH, "utf8"));
const extras = [
  { caseId: "RE01", key: "re01_deposit_paid_proof=r1_dp_cash_no_receipt", label: "계약금을 현금으로 보냈지만 영수증이 없습니다.", field: "re01_deposit_paid_proof", value: "r1_dp_cash_no_receipt" },
  { caseId: "RE01", key: "re01_deposit_paid_proof=r1_dp_via_broker", label: "중개인 계좌로 계약금을 보냈습니다.", field: "re01_deposit_paid_proof", value: "r1_dp_via_broker" },
];
const allRows = [...keys];
for (const e of extras) {
  if (!allRows.some((r) => r.key === e.key)) allRows.push(e);
}

const missing = [];
for (const row of allRows) {
  if (!RE_PHASE2_FACT2_BY_KEY[row.key]) missing.push(row.key);
}
if (missing.length) {
  console.error("missing fact2 for keys:", missing);
  process.exit(1);
}

function replaceFact2Block(text, fact2Lines) {
  const anchor = "- personalizedPhase2ElevatedSentence2:";
  const start = text.indexOf(anchor);
  if (start < 0) return null;
  const afterAnchorLine = text.indexOf("\n", start);
  const nextSection = text.indexOf("\n### ", afterAnchorLine + 1);
  const head = text.slice(0, afterAnchorLine + 1);
  const tail = nextSection >= 0 ? text.slice(nextSection) : "";
  return head + fact2Lines.join("\n") + "\n" + tail;
}

let md = `# RE phase2 fact2 (C2.3e — 수작업 원본)\n\nPack \`personalizedPhase2Fact2\` 와 1:1 동기화. 자동 생성 금지.\n\n`;
for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
  md += `## ${caseId}\n\n| field=value | 선택지 라벨 | fact2 | 비고 |\n|---|---|---|---|\n`;
  for (const r of allRows.filter((x) => x.caseId === caseId)) {
    md += `| \`${r.key}\` | ${r.label.replace(/\|/g, "/").slice(0, 120)} | ${RE_PHASE2_FACT2_BY_KEY[r.key]} | |\n`;
  }
  for (const a of EXTRA_ALIASES.filter((x) => x.caseId === caseId)) {
    md += `| \`${a.key}\` | (alias) | ${RE_PHASE2_FACT2_BY_KEY[a.canonical]} | → \`${a.canonical}\` |\n`;
  }
  md += "\n";
}
fs.writeFileSync(PROPOSAL_MD, md, "utf8");

for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
  const file = path.join(PACK_DIR, `pack-${caseId}.md`);
  let text = fs.readFileSync(file, "utf8");
  const lines = [];
  for (const r of allRows.filter((x) => x.caseId === caseId)) {
    lines.push(`- personalizedPhase2Fact2: \`${r.key}|${RE_PHASE2_FACT2_BY_KEY[r.key]}\``);
  }
  for (const a of EXTRA_ALIASES.filter((x) => x.caseId === caseId)) {
    lines.push(`- personalizedPhase2Fact2: \`${a.key}|${RE_PHASE2_FACT2_BY_KEY[a.canonical]}\``);
  }
  const next = replaceFact2Block(text, lines);
  if (!next) {
    console.error(caseId, "block replace failed");
    process.exit(1);
  }
  fs.writeFileSync(file, next, "utf8");
  console.log(caseId, "fact2 lines", lines.length);
}

console.log("wrote", PROPOSAL_MD);
