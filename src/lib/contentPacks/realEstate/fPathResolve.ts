/**
 * 부동산 F-path 해석 (Ace C1.3-R4)
 * - L-35: F표 괄호 조건은 경로 선택에 쓰지 않음 (parseRe04Condition 등)
 * - RE04 A2 = it_repair_refused + nt_verbal_only|nt_not_told (sw_* 괄호는 참고용)
 * - RE05 S3 = project_book_pending + cp_developer / S4 = 동일 stage + counterparty≠developer
 * - RE02 PATH_A·D1 = 게이트(re02_other_reason: or_damage_claim→A, 그 외→D1)
 * - RE04 X: 오버레이만 — re04_other_response=or_counter_threat 시 re04_threat_detail 삽입
 */
import { evalExpr } from "../engine/showIf";
import type { AnswerMap } from "../engine/types";
import type { FPathRow } from "../engine/types";
import {
  REAL_ESTATE_F_PATHS,
  REAL_ESTATE_PATH_ALIASES,
  REAL_ESTATE_RE02_PATH_PRIORITY,
} from "./generated/meta";
import { realEstatePackBundle } from "./packBundle";

const bundle = realEstatePackBundle();
import type { RealEstateCaseId } from "./types";
import { applyRe01GoalAdjust } from "./re01GoalAdjust";

const RE04_X_PATH_ID = "X";
const RE05_PATH_PRIORITY = ["S3", "S4", "S5", "S6", "S7", "S1", "S2"] as const;

const RE03_PHASE2_ONLY_IN_CONDITION = [
  "re03_reason_tenant",
  "re03_reason_landlord",
  "re03_arrears_fact",
  "re03_conduct_fact",
  "re03_owner_reason_fact",
  "r3_rt_",
  "r3_rld_",
  "r3_nf_",
] as const;

const RE05_PHASE2_ONLY_IN_CONDITION = [
  "re05_transferDelayDetail",
  "re05_projectBookDetail",
  "re05_mismatchDetail",
  "re05_foreignDetail",
  "re05_rejectionDetail",
  "re05_resaleApproval",
] as const;

const RE03_PATH_ORDER = ["A-1", "A-2", "B", "C", "D-1", "D-2", "E", "F"] as const;

function aliasesFor(caseId: string): Record<string, string> {
  return REAL_ESTATE_PATH_ALIASES[caseId] ?? {};
}

function re03FieldForToken(tok: string): string | null {
  if (tok.startsWith("r3_dm_")) return "re03_demand_type";
  if (tok.startsWith("r3_rs_")) return "re03_response_status";
  if (tok === "r3_role_landlord") return "re03_my_role";
  return null;
}

/** F 표 pipe 절·단독 r3_* 토큰을 phase1 필드 비교식으로 (phase2 reason 토큰은 이후 strip) */
function expandRe03Clause(part: string): string {
  let t = part.trim().replace(/^\(|\)$/g, "").trim();
  t = t.replace(/\s*\([^)]*\)\s*$/g, "").trim();
  t = t.replace(/\s*\([^)]*사유[^)]*\)\s*/g, "").trim();
  if (t.includes("=") || t.includes("≠")) return part.trim();
  if (!t.includes("|")) {
    const field = re03FieldForToken(t);
    if (field) return `${field} = ${t}`;
    return part.trim();
  }
  const toks = t.split("|").map((s) => s.trim());
  const field = re03FieldForToken(toks[0] ?? "");
  if (!field) return part.trim();
  return `(${toks.map((tok) => `${field} = ${tok}`).join(" OR ")})`;
}

function normalizeRe03PathExpr(e: string): string {
  const andParts = e.split(/\s+AND\s+/i).map((p) => expandRe03Clause(p));
  return andParts.join(" AND ");
}

/** phase1 종료 시점: re02_other_reason 미답이면 PATH_D1(≠ damage) 조건을 만족으로 본다 */
function evalPathExpr(expr: string, answers: AnswerMap, caseId: string): boolean {
  const aliases = aliasesFor(caseId);
  let e = expr.replace(/`/g, "").trim();
  if (aliases[e]) e = aliases[e];
  if (caseId === "RE01") {
    e = e.replace(
      /re01_progress_stage = ([^|()]+)\|r1_ct_deposit_only/g,
      "(re01_progress_stage = $1 OR re01_contract_type = r1_ct_deposit_only)",
    );
  }
  if (caseId === "RE03") {
    e = normalizeRe03PathExpr(e);
    const parts = e.split(/\s+AND\s+/i).filter((p) => {
      const t = p.trim();
      if (RE03_PHASE2_ONLY_IN_CONDITION.some((f) => t.includes(f))) return false;
      if (/^r3_rt_/.test(t) || /^r3_rld_/.test(t) || /^r3_nf_/.test(t)) return false;
      if (/\br3_rt_/.test(t) || /\br3_rld_/.test(t) || /\br3_nf_/.test(t)) return false;
      return true;
    });
    e = parts.join(" AND ");
    if (!e.trim()) return false;
  }
  if (caseId === "RE05") {
    e = e.replace(/\s*\+\s*/g, " AND ");
    const parts = e.split(/\s+AND\s+/i).filter((p) => {
      const t = p.trim();
      return !RE05_PHASE2_ONLY_IN_CONDITION.some((f) => t.includes(f));
    });
    e = parts.join(" AND ");
    if (!e.trim()) return false;
  }
  if (caseId === "RE04") {
    e = e.replace(/\s*\+\s*/g, " AND ");
  }
  if (caseId === "RE02" && /re02_other_reason\s*≠/.test(e)) {
    const v = answers.re02_other_reason;
    if (v == null || v === "") {
      e = e.replace(/re02_other_reason\s*≠\s*or_damage_claim/gi, "항상");
    }
  }
  if (caseId === "RE02" && /re02_other_reason\s*=/.test(e) && !answers.re02_other_reason) {
    return false;
  }
  return evalExpr(e, answers, aliases);
}

function rowsFor(caseId: RealEstateCaseId): FPathRow[] {
  return REAL_ESTATE_F_PATHS[caseId] ?? [];
}

/** RE04 X는 오버레이 — primary path 목록에서 제외 */
function primaryRows(caseId: RealEstateCaseId): FPathRow[] {
  return rowsFor(caseId).filter((r) => !(caseId === "RE04" && r.pathId === RE04_X_PATH_ID));
}

function collectRawMatchingPathIds(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const rows = primaryRows(caseId);
  const hits: string[] = [];
  if (caseId === "RE02") {
    for (const pid of REAL_ESTATE_RE02_PATH_PRIORITY) {
      const row = rows.find((r) => r.pathId === pid);
      if (row && evalPathExpr(row.condition, answers, caseId)) hits.push(row.pathId);
    }
    for (const row of rows) {
      if (!REAL_ESTATE_RE02_PATH_PRIORITY.includes(row.pathId as typeof REAL_ESTATE_RE02_PATH_PRIORITY[number])) {
        if (evalPathExpr(row.condition, answers, caseId)) hits.push(row.pathId);
      }
    }
    return hits;
  }
  if (caseId === "RE01") {
    const ordered = [...rows].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    for (const row of ordered) {
      if (evalPathExpr(row.condition, answers, caseId)) hits.push(row.pathId);
    }
    return hits;
  }
  if (caseId === "RE05") {
    for (const pid of RE05_PATH_PRIORITY) {
      const row = rows.find((r) => r.pathId === pid);
      if (row && evalPathExpr(row.condition, answers, caseId)) hits.push(row.pathId);
    }
    return hits;
  }
  for (const row of rows) {
    if (evalPathExpr(row.condition, answers, caseId)) hits.push(row.pathId);
  }
  return hits;
}

function pickFromRawHits(caseId: RealEstateCaseId, hits: string[]): string | null {
  if (hits.length === 0) return null;
  if (caseId === "RE02") {
    for (const pid of REAL_ESTATE_RE02_PATH_PRIORITY) {
      if (hits.includes(pid)) return pid;
    }
    return hits[0];
  }
  if (caseId === "RE01") {
    const ordered = [...primaryRows(caseId)].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    for (const row of ordered) {
      if (hits.includes(row.pathId)) return row.pathId;
    }
  }
  if (caseId === "RE05") {
    for (const pid of RE05_PATH_PRIORITY) {
      if (hits.includes(pid)) return pid;
    }
    return hits[0];
  }
  if (caseId === "RE03") {
    for (const pid of RE03_PATH_ORDER) {
      if (hits.includes(pid)) return pid;
    }
    for (const row of primaryRows(caseId)) {
      if (hits.includes(row.pathId)) return row.pathId;
    }
  }
  return hits[0];
}

/** F 우선순위로 1개 PATH만 반환 (1차 종료 시점) */
export function listMatchingPathIds(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const picked = pickFromRawHits(caseId, collectRawMatchingPathIds(caseId, answers));
  return picked ? [picked] : [];
}

export function pickSinglePathId(caseId: RealEstateCaseId, answers: AnswerMap): string | null {
  return pickFromRawHits(caseId, collectRawMatchingPathIds(caseId, answers));
}

export function applyRe04ThreatOverlay(chain: string[], answers: AnswerMap): string[] {
  if (String(answers.re04_other_response ?? "") !== "or_counter_threat") return chain;
  if (!chain.includes("re04_other_response")) return chain;
  if (chain.includes("re04_threat_detail")) return chain;
  const out = [...chain];
  const idx = out.indexOf("re04_other_response");
  out.splice(idx + 1, 0, "re04_threat_detail");
  return out;
}

export function phase2ChainFromF(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const pathId = pickSinglePathId(caseId, answers);
  if (!pathId) return [];
  const row = primaryRows(caseId).find((r) => r.pathId === pathId);
  if (!row?.chain?.length) return [];
  const nodeIds = new Set((bundle.nodes[caseId] ?? []).map((n) => n.id));
  let chain = row.chain.filter((id) => nodeIds.has(id));
  if (caseId === "RE01") chain = applyRe01GoalAdjust(chain, answers);
  if (caseId === "RE04") chain = applyRe04ThreatOverlay(chain, answers);
  return chain;
}

export function pathChainForCase(caseId: RealEstateCaseId, answers: AnswerMap): {
  pathId: string | null;
  matching: string[];
  chain: string[];
} {
  const matching = listMatchingPathIds(caseId, answers);
  const pathId = pickSinglePathId(caseId, answers);
  const chain = phase2ChainFromF(caseId, answers);
  return { pathId, matching, chain };
}
