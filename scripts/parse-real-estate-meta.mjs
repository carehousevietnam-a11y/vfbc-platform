/**
 * F-paths, path aliases, M-4/M-5 from MASTER + pack-RE0N.md
 * Output: src/lib/contentPacks/realEstate/generated/meta.ts + m45.ts
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MD_PATH = path.join(ROOT, "docs/content-packs/VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1.md");
const OUT_DIR = path.join(ROOT, "src/lib/contentPacks/realEstate/generated");
const PACK_DIR = path.join(ROOT, "docs/content-packs");

const RE01_TOKEN = {
  info_channel: "re01_info_channel",
  broker_role: "re01_broker_role",
  deposit_paid_proof: "re01_deposit_paid_proof",
  transfer_account: "re01_transfer_account",
  post_deposit_status: "re01_post_deposit_status",
  penalty_clause: "re01_penalty_clause",
  contract_form: "re01_contract_form",
  language_gap: "re01_language_gap",
  condition_compare: "re01_condition_compare",
  compare_detail: "re01_compare_detail",
  counterparty_reaction: "re01_counterparty_reaction",
  deposit_months: "re01_deposit_months",
  payment_schedule: "re01_payment_schedule",
  deposit_link: "re01_deposit_link",
  amount_detail: "re01_amount_detail",
  client_party: "re01_client_party",
  foreign_eligibility: "re01_foreign_eligibility",
  commercial_use: "re01_commercial_use",
  project_docs: "re01_project_docs",
  book_status: "re01_book_status",
  owner_authority: "re01_owner_authority",
  precheck_response: "re01_precheck_response",
  residence_registration: "re01_residence_registration",
  sign_deadline: "re01_sign_deadline",
  sign_date: "re01_sign_date",
  evidence: "re01_evidence",
  blockage: "re01_blockage",
  final_goal: "re01_final_goal",
};

const RE03_TOKEN = {
  reason_tenant: "re03_reason_tenant",
  reason_landlord: "re03_reason_landlord",
  arrears_fact: "re03_arrears_fact",
  arrears_cause: "re03_arrears_cause",
  conduct_fact: "re03_conduct_fact",
  owner_reason_fact: "re03_owner_reason_fact",
  fact_gap_text: "re03_fact_gap_text",
  fact_compare: "re03_fact_compare",
  fact_gap: "re03_fact_gap",
  notice_form: "re03_notice_form",
  notice_sender: "re03_notice_sender",
  notice_period: "re03_notice_period",
  contract_form: "re03_contract_form",
  move_out_deadline: "re03_move_out_deadline",
  key_dates: "re03_key_dates",
  occupancy_tenant: "re03_occupancy_tenant",
  occupancy_landlord: "re03_occupancy_landlord",
  counter_reaction: "re03_counter_reaction",
  deposit_status: "re03_deposit_status",
  penalty_clause: "re03_penalty_clause",
  claim_amount: "re03_claim_amount",
  evidence: "re03_evidence",
  blockage: "re03_blockage",
  final_goal: "re03_final_goal",
  exit_terms_landlord: "re03_exit_terms_landlord",
};

const unparsedChains = [];

function splitMdTableRow(line) {
  const normalized = line.replace(/\\\|/g, "§PIPE§");
  return normalized.split("|").map((c) => c.trim().replace(/§PIPE§/g, "|")).filter((c, i) => i > 0 || c);
}

function toNodeId(tok, map = {}) {
  if (!tok) return "";
  let t = tok.replace(/\(.*?\)/g, "").replace(/…/g, "").replace(/\.\.\./g, "").trim();
  if (!t || t === "또는") return "";
  if (t.startsWith("re0")) return t.match(/re\d{2}_[\w]+/)?.[0] ?? "";
  if (map[t]) return map[t];
  if (RE01_TOKEN[t]) return RE01_TOKEN[t];
  if (RE03_TOKEN[t]) return RE03_TOKEN[t];
  if (/^re04_/.test(t)) return t;
  if (/^re05_/.test(t)) return t;
  unparsedChains.push(tok);
  return "";
}

function expandShorthandIds(col, tokenMap = {}) {
  let s = col;
  for (const [k, v] of Object.entries({ ...RE01_TOKEN, ...RE03_TOKEN, ...tokenMap })) {
    s = s.replace(new RegExp(`\\b${k}\\b`, "g"), v);
  }
  return s;
}

function parseChainColumn(col, tokenMap = {}) {
  const expanded = expandShorthandIds(col, tokenMap);
  const seen = new Set();
  const ids = [];
  const re = /re\d{2}_[a-zA-Z0-9_]+/g;
  let m;
  while ((m = re.exec(expanded)) !== null) {
    const id = m[0];
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function r1FieldForCode(code) {
  if (code.startsWith("r1_st_")) return "re01_progress_stage";
  if (code.startsWith("r1_ct_")) return "re01_contract_type";
  if (code.startsWith("r1_od_")) return "re01_owner_doc_check";
  return null;
}

function parseStageClause(raw) {
  const stageM = raw.match(/\(단계:\s*([^)]+)\)/);
  if (!stageM) return { text: raw, clause: "" };
  const map = { viewing: "r1_st_viewing", draft: "r1_st_draft", sign_scheduled: "r1_st_sign_scheduled" };
  const stages = stageM[1]
    .split(/·|\//)
    .map((s) => map[s.trim()] ?? (s.trim().startsWith("r1_") ? s.trim() : null))
    .filter(Boolean);
  const clause = stages.length ? `re01_progress_stage = ${stages.join("|")}` : "";
  return { text: raw.replace(/\(단계:[^)]+\)/, "").trim(), clause };
}

function parseRe01Condition(condRaw) {
  let raw = condRaw.replace(/`/g, "").trim();
  const altOwner = raw.match(/\(또는\s*(r1_od_[\w]+)\)/);
  if (altOwner) {
    raw = raw.replace(/\(또는\s*r1_od_[\w]+\)/, "").trim();
  }
  const { text, clause: stageClause } = parseStageClause(raw);
  const clauses = [];
  const segments = text.split(/\s+\+\s+/).map((s) => s.trim()).filter(Boolean);
  if (!segments.length) segments.push(text);
  for (const seg of segments) {
    const codes = seg
      .split(/\s*\/\s*| 또는 /)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("r1_"));
    if (!codes.length) continue;
    const field = r1FieldForCode(codes[0]);
    if (field) clauses.push(`${field} = ${codes.join("|")}`);
    else
      clauses.push(
        `(${codes.map((c) => `re01_progress_stage = ${c} OR re01_contract_type = ${c} OR re01_owner_doc_check = ${c}`).join(" OR ")})`,
      );
  }
  if (stageClause) clauses.push(stageClause);
  if (altOwner) {
    const main = clauses.length ? `(${clauses.join(" AND ")})` : "";
    const alt = `re01_owner_doc_check = ${altOwner[1]}`;
    return main ? `${main} OR ${alt}` : alt;
  }
  if (!clauses.length) {
    const single = text.match(/r1_[\w]+/g);
    if (single?.length === 1) {
      const f = r1FieldForCode(single[0]);
      if (f) clauses.push(`${f} = ${single[0]}`);
    }
  }
  return clauses.join(" AND ");
}

function parseRe01Paths(md) {
  const f = md.match(/# RE01[\s\S]*?## F\. 1차 → 2차 adaptive branching[\s\S]*?(?=\n---\n\n## I\.)/);
  if (!f) return { paths: [], goalAdjust: "" };
  const paths = [];
  for (const line of f[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("우선") || line.includes("---")) continue;
    const cols = splitMdTableRow(line).filter(Boolean);
    if (cols.length < 4 || !/^\d+$/.test(cols[0])) continue;
    const condRaw = cols[1];
    const condition = parseRe01Condition(condRaw);
    const label = cols[2];
    const pathId = label.match(/RE01-([A-G])/)?.[1] ?? `P${cols[0]}`;
    const chain = parseChainColumn(cols[3], RE01_TOKEN);
    paths.push({ pathId, condition, label, chain, priority: Number(cols[0]) });
  }
  const adjustLine = f[0].match(/정렬 보정\(`re01_confirm_goal`\):(.+)/);
  return { paths, goalAdjust: adjustLine ? adjustLine[1].trim() : "" };
}

function parseRe02Paths(md) {
  const f = md.match(/# RE02[\s\S]*?### 분기 표[\s\S]*?(?=\n---\n\n## G\.)/);
  if (!f) return [];
  const paths = [];
  const labelToPath = {
    "**A.": "PATH_A",
    "**B.": "PATH_B",
    "**C.": "PATH_C",
    "**D1.": "PATH_D1",
    "**D2.": "PATH_D2",
    "**E.": "PATH_E",
  };
  for (const line of f[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("1차 답") || line.includes("---")) continue;
    const cols = splitMdTableRow(line).filter(Boolean);
    if (cols.length < 3) continue;
    const label = cols.find((c) => /^\*\*[A-Z]/.test(c)) ?? cols[1];
    const chainCol = cols[cols.length - 2] ?? cols[2];
    const pathKey = Object.keys(labelToPath).find((k) => label.startsWith(k));
    if (!pathKey) continue;
    const chain = parseChainColumn(chainCol.replace(/\(입력\)/g, ""));
    paths.push({
      pathId: labelToPath[pathKey],
      condition: labelToPath[pathKey],
      label,
      chain,
    });
  }
  return paths;
}

function parseRe02Aliases(md) {
  const s = md.match(/# RE02[\s\S]*?# RE03/)?.[0] ?? "";
  const aliases = {};
  for (const line of s.split("\n")) {
    if (!line.startsWith("|") || line.includes("---") || line.includes("이름")) continue;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|\s*`(.+)`\s*\|\s*$/);
    if (!m) continue;
    const name = m[1].trim();
    const def = m[2].trim();
    if (/^(PATH_[A-Z0-9_]+|GATE_RENTAL_UNRETURNED)$/.test(name) && def) aliases[name] = def;
  }
  return aliases;
}

function normalizeRe03Condition(cond) {
  let c = cond.replace(/role ≠ landlord/g, "re03_my_role ≠ r3_role_landlord");
  c = c.replace(/role ≠ landlord/g, "re03_my_role ≠ role_landlord");
  c = c.replace(/\br3_/g, "r3_");
  c = c.replace(/dm_/g, "r3_dm_").replace(/r3_r3_/g, "r3_");
  c = c.replace(/r3_dm_/g, "dm_").replace(/dm_/g, "r3_dm_");
  return c;
}

/** F 표 1차 답 열 → phase1 필드만 (2차 reason/nf 토큰 제외) */
function parseRe03Phase1Condition(cond0) {
  let c = cond0.replace(/`/g, "").trim().split("→")[0].trim();
  c = c.replace(/\([^)]*사유[^)]*\)/g, "").trim();
  const segments = c
    .split(/,| 또는 /)
    .map((s) => s.trim())
    .filter(Boolean);
  const clauses = [];
  for (const seg of segments) {
    if (/r3_rt_|r3_rld_|r3_nf_/.test(seg)) continue;
    if (/role\s*≠\s*landlord/i.test(seg)) {
      clauses.push("re03_my_role ≠ r3_role_landlord");
      continue;
    }
    if (/^r3_role_landlord\b/.test(seg) || seg === "r3_role_landlord") {
      clauses.push("re03_my_role = r3_role_landlord");
      continue;
    }
    const dmToks = seg.match(/r3_dm_\w+/g);
    if (dmToks?.length) {
      const uniq = [...new Set(dmToks)];
      clauses.push(
        uniq.length === 1
          ? `re03_demand_type = ${uniq[0]}`
          : `(${uniq.map((t) => `re03_demand_type = ${t}`).join(" OR ")})`,
      );
      continue;
    }
    const rsToks = seg.match(/r3_rs_\w+/g);
    if (rsToks?.length) {
      const uniq = [...new Set(rsToks)];
      clauses.push(
        uniq.length === 1
          ? `re03_response_status = ${uniq[0]}`
          : `(${uniq.map((t) => `re03_response_status = ${t}`).join(" OR ")})`,
      );
      continue;
    }
  }
  return clauses.join(" AND ");
}

function parseRe03Paths(md) {
  const f = md.match(/# RE03[\s\S]*?## F\. 1차 → 2차 adaptive branching 표[\s\S]*?(?=\n---\n\n## G\.)/);
  if (!f) return [];
  const paths = [];
  for (const line of f[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("1차 답") || line.includes("---") || line.includes("특수")) continue;
    const cols = splitMdTableRow(line).filter(Boolean);
    if (cols.length < 4) continue;
    const cond0 = cols[0];
    if (!/r3_|role|landlord|dm_|rt_|rs_|nf_|rld_/.test(cond0)) continue;
    const label = cols[1];
    const pathId = label.match(/^([A-F]-\d)/)?.[1] ?? (label.match(/^([A-F])\s/)?.[1] ?? "");
    if (!pathId || pathId === "특수" || label.includes("특수")) continue;
    const chainCol = cols[2];
    const chain = parseChainColumn(chainCol, RE03_TOKEN);
    const condition = parseRe03Phase1Condition(cols[0]);
    paths.push({ pathId, condition, label, chain });
  }
  return paths;
}

function parseRe04Condition(raw) {
  const text = raw.replace(/`/g, "").trim();
  const clauses = [];
  for (const part of text.split(/\s*\+\s*/).map((s) => s.trim()).filter(Boolean)) {
    // L-35: F표 괄호 조건은 경로 선택에 쓰지 않음 (cg_ / sw_ 등 참고용)
    if (part.startsWith("(") && part.endsWith(")")) continue;
    const cg = part.match(/^\(cg_(\w+)\)$/);
    if (cg) continue;
    if (part.startsWith("cg_")) continue;
    const sw = part.match(/^\(sw_([\w/]+)\)$/);
    if (sw) continue;
    if (part.includes("/")) {
      const opts = part.split("/").map((tok) => {
        const t = tok.trim();
        if (t.startsWith("it_")) return `re04_issue_type = ${t}`;
        if (t.startsWith("nt_")) return `re04_notify_status = ${t}`;
        if (t.startsWith("sw_")) return `re04_since_when = ${t}`;
        return t;
      });
      clauses.push(`(${opts.join(" OR ")})`);
      continue;
    }
    if (part.startsWith("it_")) clauses.push(`re04_issue_type = ${part}`);
    else if (part.startsWith("nt_")) clauses.push(`re04_notify_status = ${part}`);
    else if (part.startsWith("sw_")) clauses.push(`re04_since_when = ${part}`);
    else if (part.startsWith("cg_")) clauses.push(`re04_confirm_goal = ${part}`);
  }
  return clauses.join(" AND ");
}

function parseRe04Paths(md) {
  const start = md.search(/# VFBCAI_REAL_ESTATE.*RE04/);
  const end = md.search(/# VFBCAI_REAL_ESTATE.*RE05/);
  if (start < 0 || end < 0) return [];
  const slice = md.slice(start, end);
  const f = slice.match(/## F\. 1차 → 2차 adaptive branching[\s\S]*?(?=\n---\n\n## G\.)/);
  if (!f) return [];
  const paths = [];
  for (const line of f[0].split("\n")) {
    if (!line.startsWith("|") || line.includes("1차 답") || line.includes("---")) continue;
    const cols = splitMdTableRow(line).filter(Boolean);
    if (cols.length < 3) continue;
    const label = cols[1];
    const pathId = label.match(/^(A\d|[BCDE]|X)\./)?.[1] ?? label.match(/^(A\d|[BCDE]|X)/)?.[1];
    if (!pathId) continue;
    const chain = parseChainColumn(cols[2]);
    let condition = parseRe04Condition(cols[0]);
    if (pathId === "A1" && condition.includes("nt_formal_request")) {
      condition = condition.replace(
        "re04_notify_status = nt_formal_request)",
        "re04_notify_status = nt_formal_request OR re04_notify_status = nt_via_agent)",
      );
    }
    if (pathId === "X") condition = "re04_other_response = or_counter_threat";
    if (!condition.includes("re04_") && pathId !== "X") continue;
    if (chain.length) paths.push({ pathId, condition, label, chain });
  }
  return paths;
}

function normRe05Field(expr) {
  let s = expr
    .replace(/\bstage\s*=\s*transfer_delay\b/g, "re05_stage = r5_transfer_delay")
    .replace(/\bstage\s*=\s*project_book_pending\b/g, "re05_stage = r5_project_book_pending")
    .replace(/\bstage\s*=\s*book_mismatch\b/g, "re05_stage = r5_book_mismatch")
    .replace(/\bstage\s*=\s*foreign_eligibility\b/g, "re05_stage = r5_foreign_eligibility")
    .replace(/\bstage\s*=\s*registration_rejected\b/g, "re05_stage = r5_registration_rejected")
    .replace(/\btransferDelayDetail\s*=\s*/g, "re05_transferDelayDetail = ")
    .replace(/\bcounterparty\s*=\s*/g, "re05_counterparty = ")
    .replace(/\bpaidStage\s*≠\s*/g, "re05_paidStage ≠ ")
    .replace(/\bpaidStage\s*=\s*/g, "re05_paidStage = ")
    .replace(/\btd_(\w+)/g, "r5_td_$1")
    .replace(/\bcp_/g, "r5_cp_")
    .replace(/\bpaid_nothing\b/g, "r5_paid_nothing")
    .replace(/\bcounterparty\s*=\s*r5_cp_/g, "re05_counterparty = r5_cp_")
    .replace(/\+\s*/g, " + ");
  s = s.replace(/re05_re05_/g, "re05_").replace(/r5_r5_/g, "r5_");
  return s;
}

function parseRe05Paths(md) {
  const f = md.match(/## F\. 1차 → 2차 adaptive branching 표[\s\S]*?(?=\n---\n\n## G\. 노드)/);
  if (!f) return [];
  const paths = [];
  for (const line of f[0].split("\n")) {
    if (!line.startsWith("| S")) continue;
    const cols = splitMdTableRow(line).filter(Boolean);
    if (cols.length < 3) continue;
    const pathId = cols[0].split(" ")[0];
    const cond = normRe05Field(cols[1].replace(/`/g, ""));
    let chain = parseChainColumn(cols[2]);
    if (!chain.length && /S1과 같은/.test(cols[2])) {
      const s1 = paths.find((p) => p.pathId === "S1");
      if (s1?.chain?.length) chain = [...s1.chain];
    }
    let condition = cond;
    if (pathId === "S3") {
      condition = "re05_stage = r5_project_book_pending AND re05_counterparty = r5_cp_developer";
    }
    if (pathId === "S4") {
      condition =
        "re05_stage = r5_project_book_pending AND re05_counterparty ≠ r5_cp_developer";
    }
    paths.push({ pathId, condition, label: cols[0], chain });
  }
  return paths;
}

/** docs/content-packs/proposals/RE_SHORT_PHRASES_PROPOSAL.md — Pack §3 반영 전 임시 lookup */
function applyRe01MetricPhraseLookups(lookups) {
  Object.assign(lookups, {
    r1_ct_lease_office: "사무실·상가 임대차 계약",
    r1_ct_purchase_project: "분양 아파트 매매 계약",
    r1_ct_purchase_resale: "기존 주택·아파트 매매 계약",
    r1_ct_deposit_only: "계약금 약정(đặt cọc) 단계",
    r1_st_viewing: "집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못한 상태",
    r1_st_deposit_requested:
      "계약서에 서명하기 전에 계약금부터 먼저 보내라는 요청을 받은 상태",
    r1_st_deposit_paid: "계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있는 상태",
    r1_st_sign_scheduled: "서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶은 상태",
    r1_cg_owner_authority: "계약 상대방의 소유자·서명 권한",
    r1_cg_contract_terms: "계약서에 불리한 조항이 없는지",
    r1_cg_money_safety: "계약금·보증금 송금의 안전성",
    r1_cg_foreigner_fit: "외국인 계약·거주 신고 가능 여부",
    r1_cg_order_unsure: "서명 전 확인 순서",
    r1_od_original_match: "핑크북 원본과 소유자 이름이 일치한 상태입니다",
    r1_od_copy_only: "핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다",
    r1_od_signer_differs: "소유자와 서명할 사람이 달라 권한 확인이 필요한 상태입니다",
    r1_od_refused_delay: "핑크북 확인이 계속 미뤄지는 상태입니다",
    r1_od_project_no_book: "분양 단계로 핑크북이 없고 사업 서류만 있는 상태입니다",
    "r1_st_viewing__r1_od_original_match":
      "계약서·서류는 아직 받지 못했지만, 핑크북 원본을 직접 보고 소유자 이름이 계약 상대방과 일치함을 확인한 상태입니다",
  });
}

function applyRe03RoleDemandLookups(lookups, rulesRaw) {
  for (const line of rulesRaw.split("\n")) {
    const role = line.match(/role_(\w+)\s+["“](.+?)["”]/);
    if (role) {
      lookups[`role_${role[1]}`] = role[2].trim();
      lookups[`r3_role_${role[1]}`] = role[2].trim();
    }
    const dm = line.match(/dm_(\w+)\s+["“](.+?)["”]/);
    if (dm) {
      lookups[`dm_${dm[1]}`] = dm[2].trim();
      lookups[`r3_dm_${dm[1]}`] = dm[2].trim();
    }
    const cg = line.match(/cg_(\w+)\s+["“](.+?)["”]/);
    if (cg) {
      lookups[`cg_${cg[1]}`] = cg[2].trim();
      lookups[`r3_cg_${cg[1]}`] = cg[2].trim();
    }
    const rs = line.match(/rs_(\w+)\s+["“](.+?)["”]/);
    if (rs) {
      lookups[`rs_${rs[1]}`] = rs[2].trim();
      lookups[`r3_rs_${rs[1]}`] = rs[2].trim();
    }
  }
}

/** Pack §3 RE04 상황 칸: "[요약]이 [기간] 이어지고 있습니다." — 옵션 전문 라벨과 분리 */
function applyRe04ResultPhraseLookups(lookups, rulesRaw) {
  for (const line of rulesRaw.split("\n")) {
    const nt = line.match(/`(nt_[\w]+)`\s*→\s*["“](.+?)["”]/);
    if (nt) lookups[nt[1]] = nt[2].trim();
    const cg = line.match(/`(cg_[\w]+)`\s*→\s*["“](.+?)["”]/);
    if (cg) lookups[cg[1]] = cg[2].trim();
  }
}

function applyRe04MetricSituationLookups(lookups) {
  Object.assign(lookups, {
    it_repair_refused: "누수·설비 수리를 집주인이 미루는 상황",
    it_prior_defect_blamed: "입주 전 하자를 제 책임으로 돌리는 상황",
    it_fee_dispute: "관리비·요금 금액을 두고 다투는 상황",
    it_neighbor_management: "이웃·관리 문제로 생활이 어려운 상황",
    it_landlord_entry: "동의 없는 출입·출입 요구가 있는 상황",
    sw_within_week: "1주일 안쪽에",
    sw_within_month: "몇 주 전부터",
    sw_over_month: "한 달 넘게",
    sw_since_movein: "입주할 때부터",
    sw_recurring: "같은 문제가 반복되면서",
  });
}

function applyRe03RoleLookups(lookups) {
  Object.assign(lookups, {
    r3_role_tenant: "임차인",
    r3_role_company_staff: "회사 명의 계약의 거주자",
    r3_role_subtenant: "원래 세입자에게서 다시 빌린 거주자",
    r3_role_landlord: "집주인",
    r3_role_proxy: "계약 당사자를 대신해 확인하는 분",
    r3_dm_fix_breach: "기간 내 시정 요구",
    r3_dm_terminate: "계약 해지",
    r3_dm_vacate_date: "날짜를 정한 퇴거",
    r3_dm_money_claim: "위약금·손해배상 요구",
    r3_dm_unclear: "요구 내용이 분명하지 않은",
  });
}

function applyRe02SituationLookups(lookups, rulesRaw) {
  const roles = {
    role_tenant: "세입자",
    role_company_occupant: "회사 명의 계약의 실제 거주자",
    role_landlord: "집주인",
    role_buyer: "매수인",
    role_seller: "매도인",
  };
  Object.assign(lookups, roles);
  const ends = {
    end_expired: "기간이 지나 종료되었습니다",
    end_me_with_notice: "고객님이 미리 알리고 먼저 종료했습니다",
    end_me_short_notice: "고객님이 먼저 종료했으나 사전 통지가 부족했습니다",
    end_other_first: "상대방 사정으로 종료되었습니다",
    end_not_ended: "아직 종료되지 않았습니다",
  };
  Object.assign(lookups, ends);
  const disputeSit = {
    dt_not_returned: "맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못한 상황",
    dt_partial_deduction: "보증금 일부 공제를 주장하는 상황",
    dt_deposit_forfeited: "계약금을 돌려주지 않는 상황",
    dt_extra_claim: "보증금을 넘는 추가 금액을 요구하는 상황",
    dt_contact_avoided: "상대방이 연락을 피하는 상황",
    hd_deduct_dispute: "공제 금액을 두고 다투는 상황",
    hd_forfeit_dispute: "계약금 몰수를 두고 다투는 상황",
    hd_double_demand: "계약금 두 배 반환을 주장하는 상황",
    hd_extra_claim: "추가 금액을 요구하는 상황",
    hd_contact_lost: "상대방 연락이 끊긴 상황",
  };
  for (const [k, v] of Object.entries(disputeSit)) lookups[`sit_${k}`] = v;
  const ex = rulesRaw.match(
    /예:\s*"(세입자로서[^"]+)"/,
  );
  if (ex) {
    const disputeEx = ex[1].match(/로서\s+(.+?)\s+이며/);
    if (disputeEx) lookups._re02_dispute_example = disputeEx[1].trim();
  }
}

function applyRe05MetricPhraseLookups(lookups, rulesRaw) {
  const stageRe = /(transfer_delay|project_book_pending|book_mismatch|foreign_eligibility|registration_rejected)\s+["“](.+?)["”]/g;
  let m;
  while ((m = stageRe.exec(rulesRaw)) !== null) {
    lookups[`r5_${m[1]}`] = m[2].trim();
  }
  const cgRe = /cg_(\w+)\s+["“](.+?)["”]/g;
  while ((m = cgRe.exec(rulesRaw)) !== null) {
    lookups[`cg_${m[1]}`] = m[2].trim();
    lookups[`r5_cg_${m[1]}`] = m[2].trim();
  }
  const cpLine = rulesRaw.match(/counterparty 요약:\s*([^\n]+)/);
  if (cpLine) {
    const parts = cpLine[1].split(/\s*\/\s*/).map((p) => p.trim());
    const cpKeys = [
      "r5_cp_individual_seller",
      "r5_cp_developer",
      "r5_cp_resale_buyer",
      "r5_cp_broker_only",
      "r5_cp_owner_unclear",
    ];
    parts.forEach((phrase, i) => {
      if (cpKeys[i]) lookups[cpKeys[i]] = phrase;
    });
  }
  const paidLine = rulesRaw.match(/paidStage 요약:\s*([^\n]+)/);
  if (paidLine) {
    const parts = paidLine[1].split(/\s*\/\s*/).map((p) => p.trim());
    const paidKeys = [
      "r5_paid_deposit",
      "r5_paid_interim",
      "r5_paid_balance",
      "r5_paid_via_broker",
      "r5_paid_nothing",
    ];
    parts.forEach((phrase, i) => {
      if (paidKeys[i]) lookups[paidKeys[i]] = phrase;
    });
  }
  for (const line of rulesRaw.split("\n")) {
    const m3 = line.match(/`(r5_paid_\w+)`\s*→\s*["“](.+?)["”]/);
    if (m3 && /모아 두세요|먼저 모아/.test(m3[2])) lookups[`m3_${m3[1]}`] = m3[2].trim();
  }
}

function parsePackM45(caseId) {
  const packPath = path.join(PACK_DIR, `pack-${caseId}.md`);
  const text = fs.readFileSync(packPath, "utf8");
  const m3 = text.match(/(?:## 3\.|### 1차 결과 "핵심 확인 결과")[\s\S]*?(?=(?:## 4\.|### "지금 확인해 보세요")|$)/);
  const m4 = text.match(/(?:## 4\.|### "지금 확인해 보세요")[\s\S]*?(?=\n---|\n## |$)/);
  const stepBlock = m4 ? m4[0] : "";
  const steps = [];
  const stepVariants = [];
  for (const line of stepBlock.split("\n")) {
    const main = line.match(/^([1-3])\.\s+(.+)/) || line.match(/^-\s+STEP\s*([1-3])[.\s]+(.+)/);
    if (main) {
      const body = (main[2] ?? "").replace(/\*\*/g, "").trim();
      if (body) steps.push(body);
    }
    const alt = line.match(/\(re05_stage\s*=\s*(\w+)\S*\)\s*(.+)/);
    if (alt) stepVariants.push({ when: `re05_stage = r5_${alt[1].replace(/^r5_/, "")}`, text: alt[2].trim() });
  }
  const lookups = {};
  const rulesRaw = m3 ? m3[0] : "";
  for (const line of rulesRaw.split("\n")) {
    const arrowParts = line.match(/`([^`]+)`\s*→\s*([^/`]+)/);
    if (arrowParts && line.includes("단계별")) {
      const chunk = line.split("→").slice(1).join("→");
      for (const piece of chunk.split("/")) {
        const pm = piece.match(/`?([a-z0-9_]+)`?\s*→\s*(.+)/);
        if (pm) lookups[pm[1].trim()] = pm[2].trim().replace(/`/g, "");
      }
      continue;
    }
    const eq = line.match(/^\s*[-*]\s*([a-z0-9_]+)\s*=\s*([^/]+)/i);
    if (eq) lookups[eq[1].trim()] = eq[2].trim();
    const arrow = line.match(/^\s*[-*]\s*([a-z0-9_]+)\s+["“](.+?)["”]/i);
    if (arrow) lookups[arrow[1]] = arrow[2].trim();
    const cg = line.match(/^\s*[-*]\s*(cg_[\w]+)\s+["“](.+?)["”]/);
    if (cg) lookups[cg[1]] = cg[2].trim();
    const rs = line.match(/^\s*[-*]\s*(rs_[\w]+)\s+["“](.+?)["”]/);
    if (rs) lookups[rs[1]] = rs[2].trim();
    const dm = line.match(/^\s*[-*]\s*(dm_[\w]+)\s+["“](.+?)["”]/);
    if (dm) lookups[dm[1]] = dm[2].trim();
    const role = line.match(/^\s*[-*]\s*(role_[\w]+)\s+["“](.+?)["”]/);
    if (role) lookups[role[1]] = role[2].trim();
    const r3 = line.match(/^\s*[-*]\s*(r3_[\w]+)\s+["“](.+?)["”]/);
    if (r3) lookups[r3[1]] = r3[2].trim();
    const cg2 = line.match(/`(cg_[\w]+)`\s*→\s*["“](.+?)["”]/);
    if (cg2) lookups[cg2[1]] = cg2[2].trim();
    const r5stage = line.match(/(transfer_delay|project_book_pending|book_mismatch|foreign_eligibility|registration_rejected)\s+["“](.+?)["”]/);
    if (r5stage) lookups[`r5_${r5stage[1]}`] = r5stage[2].trim();
    const r5cg = line.match(/`(cg_[\w]+)`\s+["“](.+?)["”]/);
    if (r5cg) lookups[r5cg[1]] = r5cg[2].trim();
    const mat = line.match(/(dt_[\w]+(?:\s*\/\s*[\w_]+)*)\s*→\s*["“](.+?)["”]/);
    if (mat) {
      for (const tok of mat[1].split(/\s*\/\s*/)) lookups[tok.trim()] = mat[2].trim();
    }
    const endLine = line.match(/end_(\w+)=([^/]+)/);
    if (endLine && caseId !== "RE02") lookups[`end_${endLine[1]}`] = endLine[2].trim();
    const cgLine = line.match(/cg_(\w+)\s*→\s*["“](.+?)["”]/);
    if (cgLine) lookups[`cg_${cgLine[1]}`] = cgLine[2].trim();
  }
  if (caseId === "RE01") {
    const ex = rulesRaw.match(/\|\s*상황\s*\|[\s\S]*?\|\s*([^|]+살 집[^|]+)\|/);
    if (ex) {
      lookups.r1_ct_lease_home = "살 집을 빌리는 임대차 계약";
      const stageEx = ex[1].match(/계약서 초안을 받은 뒤[^,]+/);
      if (stageEx) lookups.r1_st_draft = stageEx[0].trim().replace(/입니다\.?$/, "");
    }
    applyRe01MetricPhraseLookups(lookups);
  }
  if (caseId === "RE03") {
    applyRe03RoleDemandLookups(lookups, rulesRaw);
  }
  if (caseId === "RE05") {
    applyRe05MetricPhraseLookups(lookups, rulesRaw);
  }
  if (caseId === "RE03") {
    applyRe03RoleLookups(lookups);
  }
  const metrics = [];
  if (caseId === "RE01") {
    metrics.push({
      template: "{contract}을 앞두고 있고, 현재 {stage}입니다.",
      fields: ["re01_contract_type", "re01_progress_stage"],
    });
    metrics.push({
      template: "{goal}를 먼저 확인해야 하며, 소유자 확인은 {owner_doc}.",
      fields: ["re01_confirm_goal", "re01_owner_doc_check"],
    });
    metrics.push({
      template: "서명이나 송금 전에 {next_action}이 필요하고, {prep}를 준비해 두세요.",
      fields: ["re01_progress_stage", "re01_owner_doc_check"],
      prepDefault: "계약서 초안과 중개인 메시지",
    });
  }
  if (caseId === "RE03") {
    metrics.push({
      template: "{role}으로서 상대방에게서 {demand} 통보를 받은 상황입니다.",
      fields: ["re03_my_role", "re03_demand_type"],
    });
    metrics.push({ template: "{goal}", fields: ["re03_confirm_goal"] });
    metrics.push({
      template: "{response}",
      fields: ["re03_response_status"],
      suffixIfNotNone: " 그 기록을 남겨 두는 것이 중요합니다.",
    });
  }
  if (caseId === "RE02") {
    metrics.push({
      template: "{role}로서 {dispute}이며, 계약은 {end} 상태입니다.",
      fields: ["re02_role", "re02_dispute_type", "re02_contract_end"],
    });
    metrics.push({ template: "{goal}", fields: ["re02_confirm_goal"] });
    metrics.push({ template: "{materials}", fields: ["re02_dispute_type"] });
    for (const line of rulesRaw.split("\n")) {
      const m = line.match(/(role_\w+|end_\w+|cg_\w+|dt_\w+|hd_\w+)=(.+?)(?:\s*\/\s|$)/);
      if (m && !/^end_/.test(m[1])) lookups[m[1]] = m[2].trim();
      const m2 = line.match(/(dt_\w+|hd_\w+)\s*\/\s*(.+?)→/);
      if (m2) lookups[m2[1]] = m2[2].trim().replace(/"/g, "");
    }
    applyRe02SituationLookups(lookups, rulesRaw);
  }
  if (caseId === "RE04") {
    metrics.push({
      template: "{issue}이 {since} 이어지고 있습니다.",
      fields: ["re04_issue_type", "re04_since_when"],
    });
    metrics.push({ template: "{goal}", fields: ["re04_confirm_goal"] });
    metrics.push({ template: "{notify}", fields: ["re04_notify_status"] });
    applyRe04MetricSituationLookups(lookups);
    applyRe04ResultPhraseLookups(lookups, rulesRaw);
    for (const line of rulesRaw.split("\n")) {
      const cg = line.match(/`(cg_[\w]+)`\s*→\s*["“](.+?)["”]/);
      if (cg) lookups[cg[1]] = cg[2].trim();
      const nt = line.match(/`(nt_[\w]+)`\s*→\s*["“](.+?)["”]/);
      if (nt) lookups[nt[1]] = nt[2].trim();
    }
  }
  if (caseId === "RE05") {
    metrics.push({
      template: "{cp}과의 거래에서 {paid} 상태이며, {stage}.",
      fields: ["re05_counterparty", "re05_paidStage", "re05_stage"],
    });
    metrics.push({ template: "{goal}", fields: ["re05_confirmGoal"] });
    metrics.push({ template: "{m3_prep}", fields: ["re05_paidStage"] });
  }
  return { caseId, rulesRaw, stepsRaw: stepBlock, steps, lookups, metrics, stepVariants };
}

function parseFirstResultPackMeta(packText) {
  const subtitleM = packText.match(/firstResultCautionsSectionSubtitle:\s*`([^`]+)`/);
  const boostBlock = packText.match(
    /### 1차 판정 상향[\s\S]*?(?=\n### |\n## |\n---\s*$|$)/,
  );
  const phase1VerdictBoost = [];
  if (boostBlock) {
    for (const line of boostBlock[0].split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("-")) continue;
      const v = trimmed.match(/`([a-z0-9_]+)`/);
      if (v) phase1VerdictBoost.push(v[1]);
    }
  }
  const floorM = packText.match(/firstResultVerdictFloor:\s*(true|false)/i);
  const noRiskTitleM = packText.match(/firstResultNoRiskFloorTitle:\s*`([^`]+)`/);
  const noRiskBodyM = packText.match(/firstResultNoRiskFloorBody:\s*`([^`]+)`/);
  return {
    firstResultCautionsSectionSubtitle: subtitleM?.[1]?.trim() ?? "",
    phase1VerdictBoost,
    firstResultVerdictFloor: floorM?.[1]?.toLowerCase() === "true",
    firstResultNoRiskFloorTitle: noRiskTitleM?.[1]?.trim() ?? "",
    firstResultNoRiskFloorBody: noRiskBodyM?.[1]?.trim() ?? "",
  };
}

function main() {
  const md = fs.readFileSync(MD_PATH, "utf8");
  const re01 = parseRe01Paths(md);
  const re02 = parseRe02Paths(md);
  const re03 = parseRe03Paths(md);
  const re04 = parseRe04Paths(md);
  const re05 = parseRe05Paths(md);
  const re02Aliases = parseRe02Aliases(md);
  const m45 = ["RE01", "RE02", "RE03", "RE04", "RE05"].map(parsePackM45);
  const firstResultPackMeta = {};
  for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
    const packText = fs.readFileSync(path.join(PACK_DIR, `pack-${caseId}.md`), "utf8");
    firstResultPackMeta[caseId] = parseFirstResultPackMeta(packText);
  }

  const metaBody = `/* AUTO-GENERATED — scripts/parse-real-estate-meta.mjs */
import type { FPathRow } from "../../engine/types";

export type { FPathRow };

export const REAL_ESTATE_F_PATHS: Record<string, FPathRow[]> = ${JSON.stringify(
    { RE01: re01.paths, RE02: re02, RE03: re03, RE04: re04, RE05: re05 },
    null,
    2,
  )};

export const REAL_ESTATE_RE01_GOAL_ADJUST_RAW = ${JSON.stringify(re01.goalAdjust ?? "")};

export const REAL_ESTATE_PATH_ALIASES: Record<string, Record<string, string>> = ${JSON.stringify(
    { RE02: re02Aliases },
    null,
    2,
  )};

export const REAL_ESTATE_RE02_PATH_PRIORITY = ["PATH_B","PATH_C","PATH_E","PATH_D2","PATH_A","PATH_D1"];

export const PARSE_UNPARSED_CHAIN_TOKENS: string[] = ${JSON.stringify([...new Set(unparsedChains)], null, 2)};

export type FirstResultPackMeta = {
  firstResultCautionsSectionSubtitle: string;
  phase1VerdictBoost: string[];
  firstResultVerdictFloor: boolean;
  firstResultNoRiskFloorTitle: string;
  firstResultNoRiskFloorBody: string;
};

export const REAL_ESTATE_FIRST_RESULT_PACK_META: Record<string, FirstResultPackMeta> = ${JSON.stringify(
    firstResultPackMeta,
    null,
    2,
  )};
`;

  const m45Body = `/* AUTO-GENERATED — scripts/parse-real-estate-meta.mjs */
export type PackM45Metric = { template: string; fields: string[]; prepDefault?: string; suffixIfNotNone?: string };
export type PackM45StepVariant = { when: string; text: string };
export type PackM45 = {
  caseId: string;
  rulesRaw: string;
  stepsRaw: string;
  steps: string[];
  lookups: Record<string, string>;
  metrics: PackM45Metric[];
  stepVariants: PackM45StepVariant[];
};
export const REAL_ESTATE_M45: PackM45[] = ${JSON.stringify(m45, null, 2)};
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "meta.ts"), metaBody, "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "m45.ts"), m45Body, "utf8");

  const counts = {
    RE01: re01.paths.length,
    RE02: re02.length,
    RE03: re03.length,
    RE04: re04.length,
    RE05: re05.length,
    m45Steps: m45.map((m) => m.steps.length),
    unparsed: unparsedChains.length,
  };
  console.log("meta.ts", counts);
}

main();
