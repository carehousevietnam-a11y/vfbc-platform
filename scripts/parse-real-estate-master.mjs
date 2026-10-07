/**
 * Parses docs/content-packs/VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1.md
 * into src/lib/contentPacks/realEstate/generated/*.ts
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const MD_PATH = path.join(ROOT, "docs/content-packs/VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1.md");
const OUT_DIR = path.join(ROOT, "src/lib/contentPacks/realEstate/generated");

function esc(s) {
  return JSON.stringify(s ?? "");
}

function parseQ1(md) {
  const block = md.match(/## 공용 Q1[\s\S]*?\n\n## RE06/);
  if (!block) throw new Error("Q1 block not found");
  const rows = [];
  for (const line of block[0].split("\n")) {
    const m = line.match(/^\|\s*(\w+)\s*\|\s*(.+?)\s*\|\s*RE0(\d)/);
    if (m && m[1] !== "value") {
      rows.push({ value: m[1], label: m[2].trim(), caseId: `RE0${m[3]}` });
    }
  }
  return rows;
}

function parseNodeBlock(block, id) {
  const cut = block.search(/\n## [A-Z]\./);
  if (cut > 0) block = block.slice(0, cut);
  const node = {
    id,
    phase: 1,
    kind: "single",
    showIf: "항상",
    profileFields: [],
    question: "",
    placeholder: "",
    options: [],
  };

  const phaseM = block.match(/phase:\s*(\d)/);
  if (phaseM) node.phase = Number(phaseM[1]);
  const kindM = block.match(/kind:\s*(single|multi|text)/);
  if (kindM) node.kind = kindM[1];
  const showM = block.match(/show_if:\s*(.+)/);
  if (showM) node.showIf = showM[1].trim();
  const pfM = block.match(/profile_field:\s*`?([^`\n]+)`?/);
  if (pfM) {
    node.profileFields = pfM[1]
      .split(",")
      .map((s) => s.trim().replace(/`/g, ""))
      .filter(Boolean);
  }
  const qM = block.match(/질문:\s*(.+)/);
  if (qM) node.question = qM[1].trim();
  const phM = block.match(/placeholder:\s*(.+)/);
  if (phM) node.placeholder = phM[1].trim();

  // bullet options
  const optRe = /-\s*`([^`]+)`\s*[—–-]\s*(.+)/g;
  let om;
  while ((om = optRe.exec(block)) !== null) {
    const rest = block.slice(om.index);
    const meaningM = rest.match(/meaning:\s*`([^`]+)`/);
    node.options.push({
      value: om[1],
      label: om[2].trim(),
      meaning: meaningM ? meaningM[1] : "",
    });
  }

  // table options | `value` | label | meaning |
  const tableLines = block.split("\n").filter((l) => l.includes("|") && l.includes("`"));
  for (const line of tableLines) {
    if (line.includes("---") || line.includes("value |")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const vm = cells[0].match(/`([^`]+)`/);
    if (!vm) continue;
    const value = vm[1];
    if (node.options.some((o) => o.value === value)) continue;
    const label = cells[1].replace(/`/g, "").trim();
    let meaning = "";
    if (cells[2]) {
      const mm = cells[2].match(/`([^`]+)`/);
      meaning = mm ? mm[1] : cells[2].replace(/`/g, "").trim();
    }
    node.options.push({ value, label, meaning });
  }

  return node;
}

function parseNodeChunk(chunk) {
  const nodes = [];
  const parts = chunk.split(/\n(?=#{2,4}\s*re\d{2}_)/i);
  for (const part of parts) {
    const head = part.match(/^(#{2,4})\s*(re\d{2}_\w+)/i);
    if (!head) continue;
    const id = head[2];
    nodes.push(parseNodeBlock(part, id));
  }
  return nodes;
}

function extractNodesFromCaseSlice(slice) {
  const cIdx = slice.search(/\n## C\./);
  const fIdx = slice.search(/\n## F\./);
  const mIdx = slice.search(/\n## M\./);
  const byId = new Map();
  if (cIdx >= 0 && fIdx > cIdx) {
    for (const n of parseNodeChunk(slice.slice(cIdx, fIdx))) byId.set(n.id, n);
  }
  if (fIdx >= 0 && mIdx > fIdx) {
    for (const n of parseNodeChunk(slice.slice(fIdx, mIdx))) byId.set(n.id, n);
  }
  if (byId.size === 0) {
    const body = mIdx >= 0 ? slice.slice(0, mIdx) : slice;
    for (const n of parseNodeChunk(body)) byId.set(n.id, n);
  }
  return [...byId.values()];
}

function parsePackSpecialTriggers(packPath) {
  const rows = [];
  if (!fs.existsSync(packPath)) return rows;
  const text = fs.readFileSync(packPath, "utf8");
  const block = text.match(/(?:###|####)\s*특수 사건[\s\S]*?(?=\n### |\n## |$)/);
  if (!block) return rows;
  const judge = block[0].match(/판단[：:](.+)/);
  if (judge) {
    rows.push({ trigger: judge[1].trim(), line: "special|VFBCAI 전문가팀 진행" });
  }
  for (const line of block[0].split("\n")) {
    const combo = line.match(/`([^`]+)`\s*\+\s*`([^`]+)`/);
    if (combo) rows.push({ trigger: `${combo[1]} + ${combo[2]}`, line: "special|VFBCAI 전문가팀 진행" });
    const single = line.match(/`([^`]+)`\s*\+/);
    if (single && line.includes("|")) {
      const trig = line.match(/`([^`]+)`[^`]*`([^`]+)`/);
      if (trig) rows.push({ trigger: `${trig[1]} + ${trig[2]}`, line: "special|VFBCAI 전문가팀 진행" });
    }
  }
  return rows;
}

function parseM3Table(sectionMd) {
  const rows = [];
  const m = sectionMd.match(/### M-3\. 특수 사건[\s\S]*?(?=### |## [A-Z]\.|$)/);
  if (!m) return rows;
  for (const line of m[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("---") || line.includes("특수 사건")) continue;
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;
    const trig = cols[1].replace(/`/g, "").trim();
    if (!trig || trig === "판별 조건") continue;
    rows.push({ trigger: trig, line: "special|VFBCAI 전문가팀 진행" });
  }
  return rows;
}

function normalizePackRiskTrigger(raw, caseId) {
  let t = raw.replace(/`/g, "").trim();
  t = t.replace(/re05_stage\s*=\s*/g, "re05_stage = r5_");
  t = t.replace(/re05_paidStage\s*=\s*/g, "re05_paidStage = r5_");
  t = t.replace(/re05_counterparty\s*=\s*/g, "re05_counterparty = r5_");
  t = t.replace(/\b(transfer_delay|project_book_pending|book_mismatch|foreign_eligibility|registration_rejected)\b/g, (m) =>
    m.startsWith("r5_") ? m : `r5_${m}`,
  );
  t = t.replace(/\b(paid_\w+|cp_\w+|cg_\w+|td_\w+|mm_\w+)\b/g, (m) => {
    if (m.startsWith("r5_") || m.startsWith("r3_") || m.startsWith("r2_")) return m;
    if (caseId === "RE05" && (m.startsWith("paid_") || m.startsWith("cp_") || m.startsWith("cg_"))) return `r5_${m}`;
    return m;
  });
  t = t.replace(/\s*\(\+\s*/g, " + ");
  t = t.replace(/\|/g, "|");
  return t;
}

function parsePackResultSignals(packPath, caseId) {
  const risks = { expert: [], caution: [], check: [], special: [] };
  if (!fs.existsSync(packPath)) return risks;
  const text = fs.readFileSync(packPath, "utf8");
  const block = text.match(/### 위험 신호 선택지[\s\S]*?(?=\n- 판정 합산|\n### |\n## )/);
  if (!block) return risks;
  const levelMap = { "전문가 권장": "expert", 주의: "caution", "확인 필요": "check" };
  for (const line of block[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("---") || line.includes("선택지")) continue;
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 3) continue;
    const left = cols[0];
    const msg = cols[1].replace(/\s*\(특수 사건:.*$/, "").trim();
    const grade = cols[2].replace(/\s*\(.*$/, "").trim();
    const tier = levelMap[grade];
    if (!tier || !msg) continue;
    if (msg.includes("VFBCAI 전문가팀")) {
      risks.special.push({
        trigger: normalizePackRiskTrigger(left, caseId),
        line: "special|VFBCAI 전문가팀 진행",
      });
      continue;
    }
    const trig = normalizePackRiskTrigger(left.split(/\s*\(\+/)[0].trim(), caseId);
    if (left.includes("(+") || left.includes("+")) {
      const compound = normalizePackRiskTrigger(left.replace(/^\`?[^`]+\`?\s*/, "").replace(/^\(\+\s*/, "").replace(/\)$/, ""), caseId);
      const base = left.match(/`([^`]+)`/)?.[1] ?? "";
      const trigger = base
        ? `${caseId === "RE05" && base.startsWith("paid_") ? `r5_${base}` : base}${compound ? ` + ${compound}` : ""}`
        : normalizePackRiskTrigger(left, caseId);
      risks[tier].push({ trigger, line: `${tier}|${msg}` });
      continue;
    }
    const tokens = left.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
    for (const tok of tokens) {
      const vm = tok.match(/`([^`]+)`/) || [null, tok.replace(/`/g, "").trim()];
      const trigger = normalizePackRiskTrigger(vm[1], caseId);
      if (trigger) risks[tier].push({ trigger, line: `${tier}|${msg}` });
    }
  }
  if (caseId === "RE05") {
    risks.caution.push(
      {
        trigger: "r5_registration_rejected",
        line: "caution|토지등록사무소에서 신청이 받아들여지지 않았다면, 통지 내용과 재신청 기한을 먼저 확인해야 합니다.",
      },
      {
        trigger: "r5_book_mismatch",
        line: "caution|핑크북 내용이 계약이나 실제 집과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다.",
      },
      {
        trigger: "r5_paid_balance",
        line: "caution|잔금까지 지급한 뒤에도 권리가 넘어오지 않아, 남은 협상 수단이 적은 상태일 수 있습니다.",
      },
    );
  }
  if (caseId === "RE03") {
    const bullets = text.match(/\*\*주의\*\*[\s\S]*?(?=\*\*확인 필요\*\*|\n### |\n## )/);
    if (bullets) {
      for (const line of bullets[0].split("\n")) {
        const m = line.match(/^-\s*`([^`]+)`\s*[—–-]\s*(.+)$/);
        if (!m) continue;
        const trigger = m[1].startsWith("r3_") ? m[1] : `r3_${m[1]}`;
        risks.caution.push({ trigger, line: `caution|${m[2].trim()}` });
      }
    }
    risks.caution.push(
      { trigger: "r3_dm_terminate", line: "caution|계약 해지 통보를 받았으므로, 통지 기간과 퇴거 시점을 계약서와 대조해야 합니다." },
      { trigger: "r3_dm_money_claim", line: "caution|위약금·손해배상 요구를 받았으므로, 계약서 조항과 금액 근거를 확인해야 합니다." },
      { trigger: "r3_dm_vacate_date", line: "caution|날짜가 정해진 퇴거 통보를 받았으므로, 그 시점과 계약 조항을 함께 확인해야 합니다." },
    );
  }
  return risks;
}

function mergeRiskTables(base, packPath, caseId) {
  const fromPack = parsePackResultSignals(packPath, caseId);
  for (const key of ["expert", "caution", "check", "special"]) {
    base[key].push(...fromPack[key]);
  }
  return base;
}

function parseRiskSection(sectionMd, caseId) {
  const risks = { expert: [], caution: [], check: [], special: [] };
  const levels = [
    ["전문가 권장", "expert"],
    ["주의", "caution"],
    ["확인 필요", "check"],
  ];
  for (const [heading, key] of levels) {
    const re = new RegExp(`### ${heading}[\\s\\S]*?(?=\\n### |\\n## F\\.|\\n## M-)`);
    const m = sectionMd.match(re);
    if (!m) continue;
    for (const line of m[0].split("\n")) {
      const row = line.match(/^\|\s*`?([^`|]+)`?\s*\|/);
      if (!row || row[1].includes("선택지")) continue;
      const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
      const msg = cols.length >= 2 ? cols[cols.length - 1] : "";
      const left = row[1].trim();
      if (left.startsWith("lg_")) {
        risks[key].push({ trigger: left, line: `${key}|${msg}` });
        continue;
      }
      const parts = left.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        const compound = p.includes("+") ? normalizePackRiskTrigger(p, caseId) : null;
        if (compound) {
          risks[key].push({ trigger: compound, line: `${key}|${msg}` });
          continue;
        }
        const vm = p.match(/`([^`]+)`/) || p.match(/^([\w.]+)\s*=\s*[\w|]+/);
        if (vm) {
          const trigger = vm[1].includes("=") ? normalizePackRiskTrigger(vm[1], caseId) : vm[1];
          risks[key].push({ trigger, line: `${key}|${msg}` });
        } else {
          const bare = p.match(/^(r\d_[\w]+|[\w]+_[\w]+)/);
          if (bare) risks[key].push({ trigger: bare[1], line: `${key}|${msg}` });
        }
      }
    }
  }
  if (caseId === "RE01") {
    risks.caution.push({
      trigger: "r1_st_deposit_requested",
      line:
        "caution|계약서 없이 계약금부터내면, 어떤 조건으로 돈을 보냈는지 증명하기 어려울 수 있습니다.",
    });
  }
  risks.special.push(...parseM3Table(sectionMd));
  const packPath = path.join(ROOT, `docs/content-packs/pack-${caseId}.md`);
  risks.special.push(...parsePackSpecialTriggers(packPath));
  return risks;
}

function main() {
  const md = fs.readFileSync(MD_PATH, "utf8");

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const q1 = parseQ1(md);

  const caseMarkers = [
    { id: "RE01", start: /^# RE01 /m },
    { id: "RE02", start: /^# RE02 /m },
    { id: "RE03", start: /^# RE03 /m },
    { id: "RE04", start: /^# VFBCAI.*RE04/m },
    { id: "RE05", start: /^# VFBCAI.*RE05/m },
  ];

  const indices = caseMarkers
    .map((c) => ({ id: c.id, idx: md.search(c.start) }))
    .filter((c) => c.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  const allNodes = {};
  const allRisks = {};
  const phase1Orders = {};

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : md.length;
    const slice = md.slice(start, end);
    const nodes = extractNodesFromCaseSlice(slice);
    allNodes[indices[i].id] = nodes;
    phase1Orders[indices[i].id] = nodes.filter((n) => n.phase === 1).map((n) => n.id);
    const packPath = path.join(ROOT, `docs/content-packs/pack-${indices[i].id}.md`);
    allRisks[indices[i].id] = mergeRiskTables(parseRiskSection(slice, indices[i].id), packPath, indices[i].id);
  }

  const valueOwners = new Map();
  const dups = [];
  for (const [caseId, nodes] of Object.entries(allNodes)) {
    for (const n of nodes) {
      for (const o of n.options) {
        const prev = valueOwners.get(o.value);
        if (prev) dups.push({ value: o.value, a: prev, b: `${caseId}/${n.id}` });
        else valueOwners.set(o.value, `${caseId}/${n.id}`);
      }
    }
  }
  for (const q of q1) {
    const prev = valueOwners.get(q.value);
    if (prev) dups.push({ value: q.value, a: prev, b: "Q1" });
    else valueOwners.set(q.value, "Q1");
  }
  if (dups.length) {
    console.warn("Cross-node duplicate option values:", dups);
  }

  const out = `/* AUTO-GENERATED — scripts/parse-real-estate-master.mjs */\nimport type { ContentPackNode, Q1Option, CaseRiskTables } from "../types";

export const REAL_ESTATE_Q1: Q1Option[] = ${JSON.stringify(q1, null, 2)};

export const REAL_ESTATE_NODES: Record<string, ContentPackNode[]> = ${JSON.stringify(allNodes, null, 2)};

export const REAL_ESTATE_PHASE1_ORDER: Record<string, string[]> = ${JSON.stringify(phase1Orders, null, 2)};

export const REAL_ESTATE_RISKS: Record<string, CaseRiskTables> = ${JSON.stringify(allRisks, null, 2)};
`;

  fs.writeFileSync(path.join(OUT_DIR, "pack.ts"), out, "utf8");

  const counts = Object.fromEntries(
    Object.entries(allNodes).map(([k, v]) => [k, v.length]),
  );
  console.log("Generated pack.ts", counts, "Q1", q1.length, "unique values", valueOwners.size);

  const meta = spawnSync(process.execPath, [path.join(import.meta.dirname, "parse-real-estate-meta.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (meta.status !== 0) {
    console.error(meta.stderr || meta.stdout);
    process.exit(meta.status ?? 1);
  }
  console.log(meta.stdout.trim());
}

main();
