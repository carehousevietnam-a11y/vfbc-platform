/**
 * Parse docs/master/content/UNCLEAR_CONTENT_FINAL.md into the unclear pack data shape.
 * Run: node scripts/parse-unclear-content-final.mjs --write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = path.join(repoRoot, "docs/master/content/UNCLEAR_CONTENT_FINAL.md");
const outPath = path.join(repoRoot, "src/lib/contentPacks/unclear/unclearContentFinal.data.ts");

export function stripCustomerMarkup(text) {
  return text.replace(/\*\*/g, "").replace(/\u00a0/g, " ").trim();
}

function parseFieldPairs(cell) {
  const fields = {};
  const re = /`([A-Za-z0-9_]+)=([A-Za-z0-9_]+)`/g;
  let match;
  while ((match = re.exec(cell))) fields[match[1]] = match[2];
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
    .filter(
      (cells) =>
        cells.length > 0 &&
        !cells[0].includes("선택") &&
        cells[0] !== "순서" &&
        cells[0] !== "내부 값" &&
        cells[0] !== "연결" &&
        cells[0] !== "필드" &&
        cells[0] !== "점검 항목" &&
        cells[0] !== "자동 점검" &&
        cells[0] !== "번호",
    );
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

function parseQuestion(code, section, phase) {
  const route = code.endsWith("-M") ? "M" : code.endsWith("-D") ? "D" : "N";
  const { prompt, options } = parseCustomerScreen(section);
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
    choices.push({ value: `o${choices.length + 1}`, label: "", fields });
  });
  if (!directFields) throw new Error(`missing direct input fields for ${code}`);
  const numbered = options.filter((label) => !/^직접 입력$/.test(label));
  if (numbered.length !== choices.length) {
    throw new Error(`${code}: screen options ${numbered.length} != stored choices ${choices.length}`);
  }
  choices.forEach((choice, index) => {
    choice.label = numbered[index];
  });
  return {
    code,
    id: `unclear_${code.toLowerCase().replace("-", "_")}`,
    route,
    phase,
    prompt,
    choices,
    directFields,
  };
}

function routeFromMove(cell) {
  if ((cell ?? "").includes("경로 M")) return "M";
  if ((cell ?? "").includes("경로 D")) return "D";
  if ((cell ?? "").includes("경로 N")) return "N";
  throw new Error(`entry move cell has no route: ${cell}`);
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
      route: routeFromMove(cells[2] ?? ""),
    });
  });
  if (!directFields) throw new Error("missing entry direct input");
  return {
    code: "A-0",
    id: "unclear_entry",
    route: "ENTRY",
    phase: 0,
    prompt,
    subtitle: subtitleParts.join(" "),
    choices,
    directFields,
    directRoute: "N",
  };
}

function sliceBetween(md, startHeading, endHeading) {
  const start = md.indexOf(startHeading);
  if (start < 0) throw new Error(`missing ${startHeading}`);
  const end = endHeading ? md.indexOf(endHeading, start + startHeading.length) : md.length;
  return md.slice(start, end < 0 ? md.length : end);
}

function parseMembershipClauses(cell) {
  const clauses = [];
  const re = /`([A-Za-z0-9_]+)`\s*[∈\u2208]\s*\{([^}]+)\}/g;
  let match;
  while ((match = re.exec(cell))) {
    clauses.push({
      field: match[1],
      values: match[2].split(",").map((part) => part.trim()).filter(Boolean),
    });
  }
  return clauses;
}

function parseRiskCell(cell) {
  if (cell.startsWith("기본") || cell.includes("하나도 해당하지")) {
    return { fallback: true, clauses: [] };
  }
  const clauses = parseMembershipClauses(cell);
  if (clauses.length === 0) throw new Error(`unparsed risk condition: ${cell}`);
  return { fallback: false, clauses, excludes: [] };
}

function parseCardBlocks(section) {
  const cards = [];
  const heads = [...section.matchAll(/\*\*카드\d+\s*\(([^)]+)\)\*\*\s*—\s*(Q\d+-[MDN])/g)];
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
  if (cards.length === 0) throw new Error("expected result cards");
  return cards;
}

function parseVerdict(section) {
  const marker = section.indexOf("**01 판정");
  const risk = section.indexOf("**03 주요 위험");
  const heading = section.slice(marker, section.indexOf("\n", marker));
  const codeMatch = heading.match(/(Q\d+-[MDN])/);
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
  return { questionCode: codeMatch?.[1] ?? "", sentences };
}

function parseRisks(section) {
  const marker = section.indexOf("**03 주요 위험 요소 규칙**");
  if (marker < 0) throw new Error("missing risk rules");
  const heading = section.slice(marker, section.indexOf("\n", marker));
  const maxMatch = heading.match(/최대\s*(\d+)개/);
  const block = section.slice(marker);
  const rules = [];
  let fallback = "";
  for (const cells of tableRows(block)) {
    const parsed = parseRiskCell(cells[1] ?? "");
    const sentence = stripCustomerMarkup(cells[2] ?? "");
    if (parsed.fallback || (cells[0] ?? "").startsWith("기본")) {
      fallback = sentence;
      continue;
    }
    rules.push({ clauses: parsed.clauses, excludes: [], sentence });
  }
  if (!fallback) throw new Error("missing risk fallback");
  return { rules, fallback, max: maxMatch ? Number(maxMatch[1]) : rules.length };
}

function parsePhase2(section) {
  const headings = [...section.matchAll(/\*\*([^*]+)\*\*\s*—\s*(Q\d+-[MDN])/g)];
  const questions = [];
  headings.forEach((heading, index) => {
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? section.length;
    const body = section.slice(start, end);
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

function parseConnections(section) {
  return tableRows(section).map((cells) => {
    const condition = cells[1] ?? "";
    const always = condition.includes("모든 결과");
    const mode = always ? "always" : condition.includes("이면서") ? "and" : "or";
    return {
      name: stripCustomerMarkup(cells[0] ?? ""),
      condition: stripCustomerMarkup(condition),
      sentence: stripCustomerMarkup(cells[2] ?? ""),
      mode,
      clauses: always ? [] : parseMembershipClauses(condition),
    };
  });
}

function bulletList(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => stripCustomerMarkup(line.replace(/^- /, "")))
    .filter((line) => line && !line.startsWith("이 두 목록"));
}

export function splitGuideChips(line) {
  const chips = [];
  const text = line
    .replace(/\s*(\[(?:\d+|일반 실무)\])+\s*$/, (all) => {
      for (const chip of all.match(/\[(?:\d+|일반 실무)\]/g) ?? []) chips.push(chip.slice(1, -1));
      return "";
    })
    .trim();
  return { text, chips };
}

function guideLines(body, pattern) {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => pattern.test(line));
}

function parseGuideBody(key, body) {
  if (key === "checklist") {
    const rows = guideLines(body, /^\d+\.\s+/).map((line) => {
      const { text, chips } = splitGuideChips(line.replace(/^\d+\.\s+/, ""));
      const slash = text.indexOf(" / ");
      if (slash < 0 || chips.length === 0) throw new Error(`checklist row needs reason and chip: ${line}`);
      return { name: text.slice(0, slash).trim(), why: text.slice(slash + 3).trim(), chips };
    });
    return { rows };
  }
  if (key === "order") {
    const raw = guideLines(body, /^흐름:/)[0];
    if (!raw) throw new Error("missing order flow");
    const { text, chips } = splitGuideChips(raw.replace(/^흐름:\s*/, ""));
    if (!text.includes("→") || chips.length === 0) throw new Error("order flow needs arrows and a chip");
    return { flow: text, chips };
  }
  if (key === "compare") {
    const rows = guideLines(body, /^- /).map((line) => {
      const { text, chips } = splitGuideChips(line.replace(/^- /, ""));
      const slash = text.indexOf(" / ");
      const pair = slash < 0 ? text : text.slice(0, slash);
      const point = slash < 0 ? "" : text.slice(slash + 3).trim();
      const sides = pair.split(" ↔ ");
      if (sides.length !== 2 || !point || chips.length === 0) throw new Error(`compare row: ${line}`);
      return { left: sides[0].trim(), right: sides[1].trim(), point, chips };
    });
    return { rows };
  }
  if (key === "timeline") {
    const flowLine = guideLines(body, /^흐름:/)[0];
    const noteLine = guideLines(body, /^표 아래:/)[0];
    if (!flowLine || !noteLine) throw new Error("timeline needs flow and note");
    const flow = splitGuideChips(flowLine.replace(/^흐름:\s*/, ""));
    const note = splitGuideChips(noteLine.replace(/^표 아래:\s*/, ""));
    return { flow: flow.text, chips: flow.chips, note: note.text, noteChips: note.chips };
  }
  if (key === "misses") {
    const items = guideLines(body, /^- /).map((line) => splitGuideChips(line.replace(/^- /, "")));
    return { items };
  }
  const items = guideLines(body, /^\d+\.\s+/).map((line) => splitGuideChips(line.replace(/^\d+\.\s+/, "")));
  return { items };
}

function parseReportGuide(md) {
  const iStart = md.indexOf("# I. AI 리포트 참고 사항");
  const jStart = md.indexOf("# J. 근거·출처");
  if (iStart < 0 || jStart < 0) throw new Error("missing report guide sections");
  const iBlock = md.slice(iStart, jStart);
  const jBlock = md.slice(jStart);
  const field = (block, label) => {
    const match = block.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
    if (!match) throw new Error(`missing guide field ${label}`);
    return match[1].trim();
  };
  const routeHeads = [...iBlock.matchAll(/^## 경로 (\d+):/gm)];
  if (routeHeads.length === 0) throw new Error("missing guide routes");
  const noticeStart = iBlock.indexOf("\n## ");
  const noticeBlock = iBlock.slice(noticeStart, routeHeads[0].index);
  const noticeItems = guideLines(noticeBlock, /^- /).map((line) => splitGuideChips(line.replace(/^- /, "")));
  const noticeFlow = splitGuideChips(field(noticeBlock, "흐름"));
  const routeKeys = ["M", "D", "N"];
  const routes = {};
  routeHeads.forEach((head, index) => {
    const start = head.index;
    const next = routeHeads[index + 1]?.index ?? iBlock.length;
    const block = iBlock.slice(start, next);
    const sections = {};
    for (const part of block.split(/\n### /).slice(1)) {
      const nl = part.indexOf("\n");
      const heading = part.slice(0, nl).trim();
      const body = part.slice(nl + 1);
      const sectionKey = heading.startsWith("①")
        ? "checklist"
        : heading.startsWith("②")
          ? "order"
          : heading.startsWith("③")
            ? "compare"
            : heading.startsWith("④")
              ? "timeline"
              : heading.startsWith("⑤")
                ? "misses"
                : heading.startsWith("⑥")
                  ? "questions"
                  : "";
      if (!sectionKey) throw new Error(`unknown guide heading ${heading}`);
      sections[sectionKey] = { title: heading, ...parseGuideBody(sectionKey, body) };
    }
    const key = routeKeys[index];
    if (!key) throw new Error(`unexpected guide route ${head[1]}`);
    routes[key] = sections;
  });
  const confirmedOn = field(jBlock, "확인일");
  const sources = tableRows(jBlock).map((cells) => ({
    id: cells[0],
    name: cells[1] ?? "",
    publisher: cells[2] ?? "",
    kind: cells[3] ?? "",
    urls: (cells[4] ?? "").split(",").map((url) => url.trim()).filter((url) => url.startsWith("http")),
    note: (cells[5] ?? "").trim(),
  }));
  return {
    title: field(iBlock, "제목"),
    subtitle: field(iBlock, "부제"),
    caption: field(iBlock, "확인 기준"),
    disclaimer: field(iBlock, "고정 문구"),
    firstMark: field(iBlock, "먼저 표시"),
    fileCountTemplate: field(iBlock, "접수 건수"),
    notice: {
      title: field(noticeBlock, "제목"),
      flow: noticeFlow.text,
      chips: noticeFlow.chips,
      items: noticeItems,
    },
    routes,
    sources: { confirmedOn, rows: sources },
  };
}

export function parseUnclearAuditTable(md) {
  const block = sliceBetween(md, "# F. 자동 점검 결과", "# G.");
  const byName = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || /^\|[\s|:-]+$/.test(trimmed)) continue;
    const cells = trimmed.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 4 || cells[0] === "점검 항목" || cells[0] === "자동 점검") continue;
    byName[cells[0]] = { M: cells[1], D: cells[2], N: cells[3] };
  }
  return byName;
}

export function parseUnclearContentFinal(md) {
  const phase2At = md.indexOf("# B. 2차 질문");
  const entry = parseEntry(sliceBetween(md, "## A-0.", "## A-1."));
  const questions = [];
  const marks = [...md.matchAll(/^### (Q\d+-[MDN])\s*$/gm)];
  marks.forEach((mark, index) => {
    const start = mark.index + mark[0].length;
    const end = marks[index + 1]?.index ?? md.indexOf("\n# C.");
    const phase = mark.index < phase2At ? 1 : 2;
    questions.push(parseQuestion(mark[1], md.slice(start, end), phase));
  });
  const sections = ["M", "D", "N"];
  const firstResult = {};
  const phase2Result = {};
  for (const route of sections) {
    const e1End = route === "N" ? "## E-2." : `### E-1-${route === "M" ? "D" : "N"}.`;
    const e1 = sliceBetween(md, `### E-1-${route}.`, e1End);
    const verdict = parseVerdict(e1);
    firstResult[route] = {
      cards: parseCardBlocks(e1),
      verdicts: verdict.sentences,
      verdictQuestionCode: verdict.questionCode,
      risks: parseRisks(e1),
    };
    const e2End = route === "N" ? "## E-3." : `### E-2-${route === "M" ? "D" : "N"}.`;
    phase2Result[route] = parsePhase2(sliceBetween(md, `### E-2-${route}.`, e2End));
  }
  const labels = parseLabels(sliceBetween(md, "# G. 값", "# H."));
  const connections = parseConnections(sliceBetween(md, "## E-3.", "## E-4."));
  const directNoticeMatch = md.match(/직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다\./);
  const reportFixedMatch = md.match(/# K\. 리포트 고정 문구[\s\S]*?(서류를 첨부하면 더 정확히 확인할 수 있습니다)/);
  if (!directNoticeMatch || !reportFixedMatch) throw new Error("missing direct notice or K sentence");
  return {
    entry,
    questions,
    firstResult,
    phase2Result,
    labels,
    connections,
    afterResultGuide: { pre: [], post: [] },
    directNotice: directNoticeMatch[0],
    reportFixed: { missingFileNotice: reportFixedMatch[1] },
    reportGuide: parseReportGuide(md),
  };
}

function emit(data) {
  return `/* Generated from docs/master/content/UNCLEAR_CONTENT_FINAL.md. Do not edit sentences. */\nexport const UNCLEAR_CONTENT_FINAL = ${JSON.stringify(data, null, 2)} as const;\n`;
}

function main() {
  const md = fs.readFileSync(mdPath, "utf8");
  const data = parseUnclearContentFinal(md);
  const byRoute = { M: { 1: 0, 2: 0 }, D: { 1: 0, 2: 0 }, N: { 1: 0, 2: 0 } };
  for (const question of data.questions) byRoute[question.route][question.phase] += 1;
  console.log(JSON.stringify(byRoute));
  console.log("labels", Object.keys(data.labels).length, "sources", data.reportGuide.sources.rows.length);
  if (process.argv.includes("--write")) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, emit(data));
    console.log("wrote", outPath);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
