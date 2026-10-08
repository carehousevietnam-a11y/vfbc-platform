/**
 * C2.3e — Pack fact2 dictionary lint (all entries).
 */
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "../../src/lib/contentPacks/realEstate/generated/meta.ts";
import fs from "fs";

const ALLOWED_END = /(다는 점|이다는 점|있다는 점|상태라는 점|상황이라는 점)$/;
const FORBIDDEN = [
  /라다는/,
  /여서다는/,
  /여다는/,
  /므로다는/,
  /면다는/,
  /은다는 점/,
  /를다는/,
  /\.다는/,
  /은다는/,
  /전에다는/,
  /경우다는/,
  /상태다는/,
  /(?:수 있다|해야|좋습니다|안전|이어질|영향을 줄)/,
  /(?:이|하|되|겠|았|었|않)으면/,
  /려면/,
  /(?:할|될)\s*경우/,
];

function riskMessages(caseId) {
  const out = [];
  const tables = realEstatePackBundle().risks[caseId];
  for (const tier of ["special", "expert", "caution", "check"]) {
    for (const row of tables?.[tier] ?? []) {
      const p = row.line.split("|");
      out.push(p.length > 1 ? p.slice(1).join("|").trim() : row.line);
    }
  }
  return out;
}

function lintFact2(text) {
  const issues = [];
  if (!ALLOWED_END.test(text.trim())) issues.push("bad_end");
  for (const re of FORBIDDEN) {
    if (re.test(text)) issues.push(`forbidden:${re}`);
  }
  const words = text.trim().split(/\s+/);
  if (words.length < 3 || words.length > 40) issues.push("word_count");
  const sansMeet = text.replace(/만나/g, "");
  if ((sansMeet.match(/만/g) ?? []).length >= 2) issues.push("duplicate_man");
  return issues;
}

const keysJson = JSON.parse(
  fs.readFileSync("docs/content-packs/proposals/RE_PHASE2_FACT2_KEYS.json", "utf8"),
);
const extras = [
  "re01_deposit_paid_proof=r1_dp_cash_no_receipt",
  "re01_deposit_paid_proof=r1_dp_via_broker",
];
const requiredKeys = new Set([...keysJson.map((r) => r.key), ...extras]);

const stats = {
  bad_end: 0,
  forbidden: 0,
  word_count: 0,
  caution_echo: 0,
  duplicate_fact2: 0,
  duplicate_man: 0,
  missing_required: 0,
  total_entries: 0,
};

for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
  const dict = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.phase2Fact2 ?? {};
  const cautions = riskMessages(caseId);
  const fact2Set = new Map();
  const haveKeys = new Set();
  const canonicalKeys = new Set(
    keysJson.filter((r) => r.caseId === caseId).map((r) => r.key),
  );
  if (caseId === "RE01") {
    extras.forEach((k) => canonicalKeys.add(k));
  }
  for (const [key, fact2] of Object.entries(dict)) {
    if (key.includes("=") && !canonicalKeys.has(key)) continue;
    if (!key.includes("=") && !["sd_passed", "dp_cash_no_receipt", "dp_via_broker"].includes(key)) {
      continue;
    }
    stats.total_entries++;
    haveKeys.add(key);
    const issues = lintFact2(fact2);
    if (issues.includes("bad_end")) stats.bad_end++;
    if (issues.some((i) => i.startsWith("forbidden"))) stats.forbidden++;
    if (issues.includes("word_count")) stats.word_count++;
    if (issues.includes("duplicate_man")) stats.duplicate_man++;
    for (const c of cautions) {
      const frag = c.slice(0, Math.min(28, c.length));
      if (frag.length >= 14 && fact2.includes(frag)) stats.caution_echo++;
    }
    if (key.includes("=")) {
      const prev = fact2Set.get(fact2);
      if (prev && prev !== key) stats.duplicate_fact2++;
      fact2Set.set(fact2, key);
    }
  }
  for (const row of keysJson.filter((r) => r.caseId === caseId)) {
    if (!dict[row.key] && !dict[row.value]) stats.missing_required++;
  }
}

console.log(JSON.stringify(stats, null, 2));
const fail =
  stats.bad_end > 0 ||
  stats.forbidden > 0 ||
  stats.word_count > 0 ||
  stats.caution_echo > 0 ||
  stats.duplicate_fact2 > 0 ||
  stats.duplicate_man > 0 ||
  stats.missing_required > 0;
if (fail) process.exit(1);
