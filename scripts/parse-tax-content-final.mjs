/**
 * Parse docs/master/content/TAX_CONTENT_FINAL.md into the tax pack data shape.
 * Run: node scripts/parse-tax-content-final.mjs --write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = path.join(repoRoot, "docs/master/content/TAX_CONTENT_FINAL.md");
const outPath = path.join(repoRoot, "src/lib/contentPacks/tax/taxContentFinal.data.ts");

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

const QUESTION_IDS = {
  Q1: "re11_q1",
  Q2: "re12_q2",
  Q3: "re13_q3",
  Q4: "re14_q4",
  Q5: "re15_q5",
  Q6: "re16_q6",
  Q7: "re17_q7",
  Q8: "re18_q8",
  Q9: "re19_q9",
  Q10: "re20_q10",
  Q11: "re21_q11",
};

export function stripCustomerMarkup(text) {
  return text.replace(/\*\*/g, "").replace(/\u00a0/g, " ").trim();
}

function parseFieldPairs(cell) {
  const fields = {};
  const re = /`([A-Za-z0-9_]+)=([A-Za-z0-9_]+)`/g;
  let match;
  while ((match = re.exec(cell))) {
    fields[match[1]] = match[2];
  }
  return fields;
}

function fieldPairKey(fields) {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function isDirectFields(fields) {
  const values = Object.values(fields);
  return values.includes("direct_input") && values.includes("direct_input_detail");
}

function tableRows(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .filter((line) => !/^\|[\s|:-]+$/.test(line))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((cells) => cells.length > 0 && !cells[0].includes("선택") && cells[0] !== "순서" && cells[0] !== "내부 값" && cells[0] !== "연결" && cells[0] !== "필드");
}

function customerBlock(section) {
  const start = section.indexOf("**고객 화면**");
  const end = section.indexOf("**내부 저장**");
  if (start < 0 || end < 0) return "";
  return section.slice(start + "**고객 화면**".length, end).trim();
}

function parseCustomerScreen(section) {
  const block = customerBlock(section);
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const promptParts = [];
  const options = [];
  for (const line of lines) {
    const option = line.match(/^[①②③④⑤⑥⑦⑧⑨]\s+(.+)$/);
    if (option) {
      options.push(stripCustomerMarkup(option[1]));
      continue;
    }
    promptParts.push(stripCustomerMarkup(line));
  }
  return { prompt: promptParts.join("\n"), options };
}

function parseQuestion(code, section) {
  const route = code.endsWith("-P") ? "P" : code.endsWith("-V") ? "V" : "C";
  const qn = code.slice(0, code.indexOf("-"));
  const { prompt, options } = parseCustomerScreen(section);
  const rows = tableRows(section.split("**내부 저장**")[1] ?? "");
  const choices = [];
  let directFields = null;
  rows.forEach((cells, index) => {
    const fields = parseFieldPairs(cells[1] ?? "");
    const marker = cells[0] ?? "";
    if (marker.includes("직접 입력") || isDirectFields(fields)) {
      directFields = fields;
      return;
    }
    const label = options[index] ?? "";
    choices.push({
      value: `o${choices.length + 1}`,
      label,
      fields,
    });
  });
  if (!directFields) {
    throw new Error(`missing direct input fields for ${code}`);
  }
  const numbered = options.filter((label) => !/^직접 입력$/.test(label));
  if (numbered.length !== choices.length) {
    throw new Error(
      `${code}: screen options ${numbered.length} != stored choices ${choices.length}`,
    );
  }
  choices.forEach((choice, index) => {
    choice.label = numbered[index];
  });
  return {
    code,
    id: QUESTION_IDS[qn],
    route,
    phase: Number(qn.slice(1)) <= 4 ? 1 : 2,
    prompt,
    choices,
    directFields,
  };
}

function parseEntry(section) {
  const block = customerBlock(section);
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  let prompt = "";
  const subtitleParts = [];
  const optionTexts = [];
  let seenOption = false;
  for (const line of lines) {
    const option = line.match(/^[①②③④⑤⑥⑦⑧⑨]\s+(.+)$/);
    if (option) {
      seenOption = true;
      const text = stripCustomerMarkup(option[1]);
      if (text === "직접 입력") continue;
      optionTexts.push({ label: text, description: "" });
      continue;
    }
    const text = stripCustomerMarkup(line);
    if (!seenOption) {
      if (!prompt) prompt = text;
      else subtitleParts.push(text);
    } else if (optionTexts.length > 0) {
      const last = optionTexts[optionTexts.length - 1];
      last.description = last.description ? `${last.description} ${text}` : text;
    }
  }
  const rows = tableRows(section.split("**내부 저장**")[1] ?? "");
  const choices = [];
  let directFields = null;
  rows.forEach((cells) => {
    const fields = parseFieldPairs(cells[1] ?? "");
    const marker = cells[0] ?? "";
    if (marker.includes("직접 입력") || isDirectFields(fields)) {
      directFields = fields;
      return;
    }
    const screen = optionTexts[choices.length] ?? { label: "", description: "" };
    choices.push({
      value: `o${choices.length + 1}`,
      label: screen.label,
      description: screen.description,
      fields,
    });
  });
  return {
    code: "A-0",
    id: "re_entry",
    route: "ENTRY",
    phase: 0,
    prompt,
    subtitle: subtitleParts.join(" "),
    choices,
    directFields,
  };
}

function sliceBetween(md, startHeading, endHeading) {
  const start = md.indexOf(startHeading);
  if (start < 0) throw new Error(`missing ${startHeading}`);
  const end = endHeading ? md.indexOf(endHeading, start + startHeading.length) : md.length;
  return md.slice(start, end < 0 ? md.length : end);
}

function parseRiskCell(cell) {
  if (cell.startsWith("기본") || cell.includes("하나도 해당하지")) {
    return { fallback: true, clauses: [] };
  }
  const clauses = [];
  const re = /`([A-Za-z0-9_]+)`\s*[∈\u2208]\s*\{([^}]+)\}/g;
  let match;
  while ((match = re.exec(cell))) {
    clauses.push({
      field: match[1],
      values: match[2].split(",").map((part) => part.trim()).filter(Boolean),
    });
  }
  if (clauses.length === 0) throw new Error(`unparsed risk condition: ${cell}`);
  return { fallback: false, clauses };
}

function parseCardBlocks(section) {
  const cards = [];
  const heads = [...section.matchAll(/\*\*카드\d+\s*\(([^)]+)\)\*\*\s*—\s*(Q\d-[PVC])/g)];
  heads.forEach((head, index) => {
    const start = head.index + head[0].length;
    const end = heads[index + 1]?.index ?? section.indexOf("**01 판정", start);
    const part = section.slice(start, end < 0 ? section.length : end);
    const sentences = {};
    for (const cells of tableRows(part)) {
      const fields = parseFieldPairs(cells[1] ?? "");
      if (Object.keys(fields).length < 2 || isDirectFields(fields)) continue;
      sentences[fieldPairKey(fields)] = stripCustomerMarkup(cells[2] ?? "");
    }
    cards.push({ questionCode: head[2], title: head[1], sentences });
  });
  if (cards.length !== 3) throw new Error(`expected 3 cards, got ${cards.length}`);
  return cards;
}

function parseVerdict(section) {
  const marker = section.indexOf("**01 판정");
  const risk = section.indexOf("**03 주요 위험");
  const block = section.slice(marker, risk < 0 ? section.length : risk);
  const sentences = {};
  for (const cells of tableRows(block)) {
    const fields = parseFieldPairs(cells[1] ?? "");
    if (isDirectFields(fields)) continue;
    sentences[fieldPairKey(fields)] = {
      headline: stripCustomerMarkup(cells[2] ?? ""),
      body: stripCustomerMarkup(cells[3] ?? ""),
    };
  }
  return sentences;
}

function parseRisks(section) {
  const marker = section.indexOf("**03 주요 위험 요소 규칙**");
  if (marker < 0) throw new Error("missing risk rules");
  const block = section.slice(marker);
  const rules = [];
  let fallback = "";
  const riskRows = tableRows(block);
  if (riskRows.length === 0) throw new Error(`no risk rows in ${block.slice(0, 120)}`);
  for (const cells of riskRows) {
    const parsed = parseRiskCell(cells[1] ?? "");
    const sentence = stripCustomerMarkup(cells[2] ?? "");
    if (parsed.fallback || (cells[0] ?? "").startsWith("기본")) {
      fallback = sentence;
      continue;
    }
    rules.push({ clauses: parsed.clauses, sentence });
  }
  if (!fallback) throw new Error("missing risk fallback");
  return { rules, fallback };
}

function parsePhase2(section) {
  const blocks = section.split(/\*\*[^*]+\*\*\s*—\s*Q\d+-[PVC]/);
  const headings = [...section.matchAll(/\*\*([^*]+)\*\*\s*—\s*(Q\d+-[PVC])/g)];
  const questions = [];
  headings.forEach((heading, index) => {
    const body = blocks[index + 1] ?? "";
    const sentences = {};
    for (const cells of tableRows(body)) {
      const fields = parseFieldPairs(cells[1] ?? "");
      if (isDirectFields(fields)) continue;
      sentences[fieldPairKey(fields)] = stripCustomerMarkup(cells[2] ?? "");
    }
    questions.push({
      questionCode: heading[2],
      title: stripCustomerMarkup(heading[1]),
      sentences,
    });
  });
  return questions;
}

function parseLabels(section) {
  const labels = {};
  for (const cells of tableRows(section)) {
    const key = (cells[0] ?? "").replace(/`/g, "").trim();
    const label = stripCustomerMarkup(cells[1] ?? "");
    if (!key || key === "내부 값") continue;
    labels[key] = label;
  }
  return labels;
}

export function parseTaxContentFinal(md) {
  const entry = parseEntry(sliceBetween(md, "## A-0.", "## A-1."));
  const questions = [];
  const questionRe = /^### (Q\d+-[PVC])\s*$/gm;
  const marks = [...md.matchAll(questionRe)];
  marks.forEach((mark, index) => {
    const start = mark.index + mark[0].length;
    const end = marks[index + 1]?.index ?? md.indexOf("\n# C.");
    questions.push(parseQuestion(mark[1], md.slice(start, end)));
  });

  const e1p = sliceBetween(md, "### E-1-P.", "### E-1-V.");
  const e1v = sliceBetween(md, "### E-1-V.", "### E-1-C.");
  const e1c = sliceBetween(md, "### E-1-C.", "## E-2.");
  const firstResult = {
    P: { cards: parseCardBlocks(e1p), verdicts: parseVerdict(e1p), risks: parseRisks(e1p) },
    V: { cards: parseCardBlocks(e1v), verdicts: parseVerdict(e1v), risks: parseRisks(e1v) },
    C: { cards: parseCardBlocks(e1c), verdicts: parseVerdict(e1c), risks: parseRisks(e1c) },
  };
  const phase2Result = {
    P: parsePhase2(sliceBetween(md, "### E-2-P.", "### E-2-V.")),
    V: parsePhase2(sliceBetween(md, "### E-2-V.", "### E-2-C.")),
    C: parsePhase2(sliceBetween(md, "### E-2-C.", "## E-3.")),
  };
  const labels = parseLabels(sliceBetween(md, "# G. 값", "# H."));
  const connections = tableRows(sliceBetween(md, "## E-3.", "## E-4.")).map((cells) => ({
    name: stripCustomerMarkup(cells[0] ?? ""),
    condition: stripCustomerMarkup(cells[1] ?? ""),
    sentence: stripCustomerMarkup(cells[2] ?? ""),
  }));
  const directNoticeMatch = md.match(
    /직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다\./,
  );
  if (!directNoticeMatch || connections.length !== 3) {
    throw new Error("missing direct-input notice or E-3 rows");
  }
  return {
    entry,
    questions,
    firstResult,
    phase2Result,
    labels,
    connections,
    directNotice: directNoticeMatch[0],
  };
}

function emit(data) {
  return `/* Generated from docs/master/content/TAX_CONTENT_FINAL.md. Do not edit sentences. */\nexport const TAX_CONTENT_FINAL = ${JSON.stringify(data, null, 2)} as const;\n`;
}

function main() {
  const md = fs.readFileSync(mdPath, "utf8");
  const data = parseTaxContentFinal(md);
  const byRoute = { P: { 1: 0, 2: 0, options: 0 }, V: { 1: 0, 2: 0, options: 0 }, C: { 1: 0, 2: 0, options: 0 } };
  for (const question of data.questions) {
    const bucket = byRoute[question.route];
    bucket[question.phase] += 1;
    bucket.options += question.choices.length + 1;
  }
  console.log(JSON.stringify(byRoute));
  console.log("labels", Object.keys(data.labels).length);
  console.log(
    "risks",
    data.firstResult.P.risks.rules.length,
    data.firstResult.V.risks.rules.length,
    data.firstResult.C.risks.rules.length,
  );
  console.log("entry choices", data.entry.choices.length, "direct", data.entry.directFields);
  if (process.argv.includes("--write")) {
    fs.writeFileSync(outPath, emit(data));
    console.log("wrote", outPath);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
