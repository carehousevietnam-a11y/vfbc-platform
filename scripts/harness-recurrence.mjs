/**
 * Recurrence checks: internal terms, duplicate PDF paragraphs,
 * hardcoded question counts, question-number ranges, and question structure.
 * Run: node scripts/harness-recurrence.mjs
 * One check: node scripts/harness-recurrence.mjs internal-terms
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFraudContentFinal } from "./parse-fraud-content-final.mjs";
import { parseUnclearContentFinal } from "./parse-unclear-content-final.mjs";
import { parseTaxContentFinal } from "./parse-tax-content-final.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const INTERNAL_TERMS = [
  { name: "Cursor", re: /Cursor/ },
  { name: "localhost", re: /localhost/i },
  { name: "url", re: /https?:\/\//i },
  { name: "question-code", re: /\bQ\d+-[A-Z]\b/ },
  { name: "field", re: /\b(?:fraud|unclear|tax)_[A-Za-z0-9_]+/ },
  { name: "re_entry", re: /\bre_entry\b/ },
];

const SKIP_KEYS = new Set([
  "urls",
  "url",
  "href",
  "fields",
  "directFields",
  "value",
  "code",
  "id",
  "field",
  "clauses",
  "mode",
  "questionCode",
  "verdictQuestionCode",
  "condition",
]);

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function walkStrings(value, out, key = "") {
  if (SKIP_KEYS.has(key)) return;
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [childKey, child] of Object.entries(value)) walkStrings(child, out, childKey);
  }
}

export function internalTermHits() {
  const hits = [];
  const packs = [
    ["fraud", parseFraudContentFinal(read("docs/master/content/FRAUD_CONTENT_V3.md"))],
    ["unclear", parseUnclearContentFinal(read("docs/master/content/UNCLEAR_CONTENT_V3.md"))],
    ["tax", parseTaxContentFinal(read("docs/master/content/TAX_CONTENT_FINAL.md"))],
  ];
  for (const [name, pack] of packs) {
    const texts = [];
    walkStrings(pack, texts);
    for (const text of texts) {
      for (const term of INTERNAL_TERMS) {
        if (term.re.test(text)) hits.push(`internal-terms ${name} ${term.name}`);
      }
    }
  }
  const pdfDir = path.join(root, "tests/baseline/pdf");
  if (fs.existsSync(pdfDir)) {
    for (const file of fs.readdirSync(pdfDir).filter((name) => name.endsWith(".txt"))) {
      const text = fs.readFileSync(path.join(pdfDir, file), "utf8");
      for (const term of INTERNAL_TERMS) {
        if (term.re.test(text)) hits.push(`internal-terms ${file} ${term.name}`);
      }
    }
  }
  return [...new Set(hits)];
}

export function duplicateParagraphHits() {
  const hits = [];
  const pdfDir = path.join(root, "tests/baseline/pdf");
  if (!fs.existsSync(pdfDir)) return ["pdf-duplicate missing baseline dir"];
  for (const file of fs.readdirSync(pdfDir).filter((name) => name.endsWith(".txt"))) {
    const text = fs.readFileSync(path.join(pdfDir, file), "utf8").replace(/\r\n/g, "\n");
    const counts = new Map();
    for (const block of text.split(/\n\s*\n/)) {
      const paragraph = block.replace(/\s+/g, " ").trim();
      if (paragraph.length < 80) continue;
      counts.set(paragraph, (counts.get(paragraph) ?? 0) + 1);
    }
    for (const [paragraph, count] of counts) {
      if (count > 1) hits.push(`pdf-duplicate ${file} x${count} ${paragraph.slice(0, 40)}`);
    }
  }
  return hits;
}

const QUESTION_COUNT_LITERAL =
  /\b(?:phase1|phase2|shown1|shown2|checkPhase1|checkPhase2)\.length\s*(?:!==|===)\s*\d+/;

export function questionCountHardcodeHits() {
  const hits = [];
  const dir = path.join(root, "tests/qa");
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith("-content-final.mjs")) continue;
    const lines = fs.readFileSync(path.join(dir, file), "utf8").split(/\n/);
    lines.forEach((line, index) => {
      if (QUESTION_COUNT_LITERAL.test(line)) hits.push(`question-count-hardcode ${file}:${index + 1}`);
    });
  }
  return hits;
}

function questionMaxByRoute(md) {
  const max = new Map();
  for (const match of md.matchAll(/^### Q(\d+)-([A-Za-z0-9]+)\s*$/gm)) {
    const number = Number(match[1]);
    const route = match[2];
    max.set(route, Math.max(max.get(route) ?? 0, number));
  }
  return max;
}

export function questionRangeHits() {
  const hits = [];
  const dir = path.join(root, "docs/master/content");
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const md = fs.readFileSync(path.join(dir, file), "utf8");
    const maxByRoute = questionMaxByRoute(md);
    if (maxByRoute.size === 0) continue;
    const maxAll = Math.max(...maxByRoute.values());
    for (const match of md.matchAll(/Q(\d+)-([A-Za-z0-9]+)\s*[~～]\s*Q(\d+)-\2/g)) {
      const start = Number(match[1]);
      const route = match[2];
      const end = Number(match[3]);
      const max = maxByRoute.get(route);
      if (start === 1 && max != null && end !== max) {
        hits.push(`question-range ${file} ${route} ends ${end} expected ${max}`);
      }
    }
    for (const match of md.matchAll(/Q(\d+)부터\s*Q(\d+)까지/g)) {
      const end = Number(match[2]);
      if (end !== maxAll) hits.push(`question-range ${file} full span ends ${end} expected ${maxAll}`);
    }
    for (const match of md.matchAll(/2차\(Q(\d+)~Q(\d+)\)/g)) {
      const end = Number(match[2]);
      if (end !== maxAll) hits.push(`question-range ${file} phase2 ends ${end} expected ${maxAll}`);
    }
  }
  return hits;
}

function loadGeneratedPack(rel) {
  const source = read(rel);
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`pack json missing ${rel}`);
  return JSON.parse(source.slice(start, end + 1));
}

function customerLine(choice) {
  const label = String(choice.label ?? "").trim();
  const description = String(choice.description ?? "").trim();
  if (!description) return label;
  if (/[.?!。]$/.test(label)) return `${label} ${description}`;
  if (/^(했|합니|입니|이고|이며|지만)/.test(description)) return `${label}${description}`;
  return `${label} ${description}`;
}

function structureHits(name, pack, doc) {
  const hits = [];
  const questions = pack.questions ?? [];
  for (const question of questions) {
    const prompt = String(question.prompt ?? "");
    if (!/[,，]/.test(prompt) || [...prompt].length < 30) {
      hits.push(`question-standard ${name} ${question.code} prompt`);
    }
    const choices = question.choices ?? [];
    if (choices.length < 4 || !question.directFields) {
      hits.push(`question-standard ${name} ${question.code} options`);
    }
    if (choices.length > 5) {
      hits.push(`question-standard ${name} ${question.code} max-5 choices ${choices.length}`);
    }
    const descSeen = new Map();
    for (const choice of choices) {
      const key = String(choice.description ?? "").trim();
      if (key) descSeen.set(key, (descSeen.get(key) ?? 0) + 1);
    }
    for (const [key, n] of descSeen) {
      if (n > 1) hits.push(`question-standard ${name} ${question.code} a16 duplicate description x${n}: ${key.slice(0, 30)}`);
    }
    const secondKey = Object.keys(choices[0]?.fields ?? {})[1];
    if (secondKey) {
      const share = new Map();
      for (const choice of choices) share.set(choice.fields[secondKey], (share.get(choice.fields[secondKey]) ?? 0) + 1);
      if (Math.max(...share.values()) > 3) hits.push(`question-standard ${name} ${question.code} a16 second field ${secondKey} shared over 3`);
    }
    if (Object.keys(question.directFields ?? {}).length !== 2) {
      hits.push(`question-standard ${name} ${question.code} direct-fields`);
    }
    for (const choice of choices) {
      const line = customerLine(choice);
      const hasPoint = Boolean(String(choice.label ?? "").trim() && String(choice.description ?? "").trim());
      if (!hasPoint || [...line].length < 45 || !line.includes(".")) {
        hits.push(`question-standard ${name} ${question.code} ${choice.value} choice`);
      }
      if (Object.keys(choice.fields ?? {}).length !== 2) {
        hits.push(`question-standard ${name} ${question.code} ${choice.value} fields`);
      }
    }
  }
  const docQuestions = doc?.questions ?? [];
  if (docQuestions.length !== questions.length) {
    hits.push(`question-standard ${name} questions pack ${questions.length} doc ${docQuestions.length}`);
  }
  const packChoices = questions.reduce((sum, question) => sum + (question.choices?.length ?? 0), 0);
  const docChoices = docQuestions.reduce((sum, question) => sum + (question.choices?.length ?? 0), 0);
  if (packChoices !== docChoices) {
    hits.push(`question-standard ${name} choices pack ${packChoices} doc ${docChoices}`);
  }
  return hits;
}

export function questionStandardHits() {
  return [
    ...structureHits(
      "fraud",
      loadGeneratedPack("src/lib/contentPacks/fraud/fraudContentFinal.data.ts"),
      parseFraudContentFinal(read("docs/master/content/FRAUD_CONTENT_V3.md")),
    ),
    ...structureHits(
      "unclear",
      loadGeneratedPack("src/lib/contentPacks/unclear/unclearContentFinal.data.ts"),
      parseUnclearContentFinal(read("docs/master/content/UNCLEAR_CONTENT_V3.md")),
    ),
    ...["trc", "wp"].flatMap((name) => {
      const pack = loadGeneratedPack(`src/lib/contentPacks/${name}/${name}ContentFinal.data.ts`);
      return structureHits(name, pack, pack);
    }),
  ];
}

export function taxQuestionStandardHits() {
  return structureHits(
    "tax",
    loadGeneratedPack("src/lib/contentPacks/tax/taxContentFinal.data.ts"),
    parseTaxContentFinal(read("docs/master/content/TAX_CONTENT_FINAL.md")),
  );
}

const checks = [
  ["internal-terms", internalTermHits],
  ["pdf-duplicate", duplicateParagraphHits],
  ["question-count-hardcode", questionCountHardcodeHits],
  ["question-range", questionRangeHits],
  ["question-standard", questionStandardHits],
];

function runCli() {
  const only = process.argv[2] ?? "";
  if (only === "tax-question-standard") {
    const hits = taxQuestionStandardHits();
    if (hits.length) {
      process.stderr.write(hits.join("\n") + "\n");
      process.exit(1);
    }
    process.stdout.write("PASS tax-question-standard\n");
    return;
  }
  const selected = only ? checks.filter(([name]) => name === only) : checks;
  if (only && selected.length === 0) {
    process.stderr.write(`unknown check ${only}\n`);
    process.exit(1);
  }
  const hits = selected.flatMap(([, run]) => run());
  if (hits.length) {
    process.stderr.write(hits.join("\n") + "\n");
    process.exit(1);
  }
  process.stdout.write(`PASS ${selected.map(([name]) => name).join(",")}\n`);
}

if (path.resolve(process.argv[1] ?? "").toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  runCli();
}
