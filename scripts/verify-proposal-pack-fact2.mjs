import fs from "fs";
import path from "path";
import { RE_PHASE2_FACT2_BY_KEY } from "./re-phase2-fact2-by-key.mjs";

const PROPOSAL_MD = path.join("docs", "content-packs", "proposals", "RE_PHASE2_FACT2.md");
const PACK_DIR = path.join("docs", "content-packs");

function parsePackFact2(packText) {
  const m = new Map();
  for (const line of packText.matchAll(/personalizedPhase2Fact2:\s*`([^`]+)`/g)) {
    const inner = line[1];
    const pipe = inner.indexOf("|");
    if (pipe < 0) continue;
    m.set(inner.slice(0, pipe).trim(), inner.slice(pipe + 1).trim());
  }
  return m;
}

function parseProposalTable(md) {
  const m = new Map();
  for (const line of md.split("\n")) {
    if (!line.startsWith("| `")) continue;
    const cols = line.split("|").map((s) => s.trim());
    if (cols.length < 4) continue;
    const key = cols[1].replace(/`/g, "");
    const fact2 = cols[3];
    if (key && fact2 && fact2 !== "fact2") m.set(key, fact2);
  }
  return m;
}

const proposal = parseProposalTable(fs.readFileSync(PROPOSAL_MD, "utf8"));
let fail = 0;
for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
  const pack = parsePackFact2(fs.readFileSync(path.join(PACK_DIR, `pack-${caseId}.md`), "utf8"));
  for (const [k, v] of proposal) {
    if (!k.startsWith("re0") && caseId !== "RE02") continue;
    if (pack.get(k) !== v) {
      if (pack.get(k) === RE_PHASE2_FACT2_BY_KEY[k] && v === RE_PHASE2_FACT2_BY_KEY[k]) continue;
    }
  }
  for (const [k, v] of pack) {
    const canon = RE_PHASE2_FACT2_BY_KEY[k] ?? v;
    if (proposal.get(k) && proposal.get(k) !== v) {
      console.log("proposal/pack mismatch", caseId, k);
      fail++;
    }
    if (RE_PHASE2_FACT2_BY_KEY[k] && RE_PHASE2_FACT2_BY_KEY[k] !== v) {
      console.log("by-key/pack mismatch", caseId, k);
      fail++;
    }
  }
}
if (fail) process.exit(1);
console.log("proposal/pack sync OK");
