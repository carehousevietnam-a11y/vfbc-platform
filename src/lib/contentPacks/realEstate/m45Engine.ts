import type { AnswerMap, RealEstateCaseId } from "./types";
import { REAL_ESTATE_M45, type PackM45 } from "./generated/m45";
import { evalExpr } from "../engine/showIf";
import { correctParticlesInSentence, withParticle } from "./koreanParticle";
import { dedupeAdjacentPhrases, hopeFormToPackConfirmGoal, mergeRedundantRecordSuffix } from "./sentencePolish";
import { realEstatePackBundle } from "./packBundle";

const packBundle = realEstatePackBundle();

function pack(caseId: RealEstateCaseId): PackM45 | undefined {
  return REAL_ESTATE_M45.find((p) => p.caseId === caseId);
}

function phraseFromOption(caseId: RealEstateCaseId, fieldId: string, value: unknown): string {
  const node = packBundle.nodes[caseId]?.find((n) => n.id === fieldId);
  const v = String(value ?? "");
  const opt = node?.options?.find((o) => o.value === v);
  if (!opt) return "";
  const parts = opt.label.split(/[—–-]/);
  return (parts[1] ?? parts[0]).trim().replace(/\.$/, "");
}

function lkDeep(lookups: Record<string, string>, val: unknown, field?: string): string {
  let text = lk(lookups, val, field);
  let guard = 0;
  while (text && /^[a-z0-9_]+$/i.test(text) && lookups[text] && guard < 4) {
    text = lk(lookups, text, field);
    guard++;
  }
  if (text.includes(" / ")) {
    const first = text.split(" / ")[0].trim();
    const resolved = lkDeep(lookups, first, field);
    if (resolved && !/^[a-z0-9_]+$/i.test(resolved)) return resolved;
  }
  return text;
}

function lk(lookups: Record<string, string>, val: unknown, field?: string): string {
  const v = String(val ?? "");
  if (!v) return "";
  const candidates = [
    v,
    v.replace(/^re\d{2}_/, ""),
    v.replace(/^r\d_/, ""),
    v.replace(/^re03_/, "").replace(/^r3_/, ""),
    v.replace(/^re04_/, "").replace(/^it_/, "").replace(/^nt_/, "").replace(/^sw_/, "").replace(/^cg_/, ""),
    v.replace(/^re05_/, "").replace(/^r5_/, ""),
  ];
  for (const key of candidates) {
    if (lookups[key]) {
      const raw = lookups[key];
      if (raw.includes(" / ") && !raw.includes("[")) {
        return raw.split(" / ")[0].trim();
      }
      return raw;
    }
  }
  if (field && lookups[`${field}.${candidates[1]}`]) return lookups[`${field}.${candidates[1]}`];
  return "";
}

function lkCompound(
  lookups: Record<string, string>,
  answers: AnswerMap,
  fieldA: string,
  fieldB: string,
): string {
  const a = String(answers[fieldA] ?? "");
  const b = String(answers[fieldB] ?? "");
  if (!a || !b) return "";
  const keys = [
    `${a}__${b}`,
    `${a.replace(/^re01_/, "r1_")}__${b.replace(/^re01_/, "r1_")}`,
    `${a.replace(/^re\d{2}_/, "r1_")}__${b.replace(/^re\d{2}_/, "r1_")}`,
  ];
  for (const key of keys) {
    if (lookups[key]) return lookups[key];
  }
  return "";
}

/** viewing + 원본 직접 확인 compound — 두 선택 뜻이 문장에 모두 반영되는지 */
export function isRe01ViewingOriginalMatchSemanticFail(
  answers: AnswerMap,
  m2: string,
): boolean {
  const stage = String(answers.re01_progress_stage ?? "");
  const od = String(answers.re01_owner_doc_check ?? "");
  if (!/viewing/i.test(stage) || !/original_match/i.test(od)) return false;
  const hasNoDocYet = /받지 못|아직.*못/.test(m2);
  const hasOriginalSeen = /원본|직접/.test(m2) && /일치/.test(m2);
  const contradicts = /설명만|상대방 설명만/.test(m2);
  return !hasNoDocYet || !hasOriginalSeen || contradicts;
}

export function countTripleWordRepeat(sentence: string, minLen = 3): boolean {
  const tokens = sentence.match(/[가-힣]{3,}/g) ?? [];
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
    if (freq.get(t)! >= 3) return true;
  }
  return false;
}

export function hasGerundTenseDefect(text: string): boolean {
  return /(?:받은|한|본|든|탄|낸|쓴|보낸|지은) 것이 필요/.test(text);
}

function ensureMetricSentenceEnd(text: string): string {
  const t = text.trim();
  if (!t) return "";
  if (/[.!?…]$/.test(t)) return t;
  if (/습니다$|입니다$|합니다$|좋습니다$/.test(t)) return `${t}.`;
  return `${t}.`;
}

function stripOrphanJosaFragments(text: string): string {
  return text
    .replace(/^\s*(과의|와의|이며,|으며,)\s*/u, "")
    .replace(/,\s*(과의|와의)\s*/gu, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function fillTemplate(
  caseId: RealEstateCaseId,
  template: string,
  answers: AnswerMap,
  fields: string[],
  lookups: Record<string, string>,
): string {
  let out = template;
  const placeholders = [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  placeholders.forEach((ph, i) => {
    const field = fields[i];
    const text = field ? lk(lookups, answers[field], field) : "";
    out = out.replace(`{${ph}}`, text);
  });
  return stripOrphanJosaFragments(out.replace(/\{[^}]+\}/g, "").replace(/\s+/g, " ").trim());
}

function buildRe02MetricLine(
  metricIndex: number,
  answers: AnswerMap,
  p: PackM45,
): string {
  const resolved = metricsAnswers("RE02", answers);
  if (metricIndex === 0) {
    const role =
      lkDeep(p.lookups, resolved.re02_role, "re02_role") ||
      phraseFromOption("RE02", "re02_role", resolved.re02_role);
    const disputeRaw =
      resolved.re02_dispute_type || resolved.re02_dispute_type_holder;
    let dispute =
      p.lookups[`sit_${disputeRaw}`] ||
      p.lookups[`sit_${String(disputeRaw).replace(/^r2_/, "")}`] ||
      "";
    if (!dispute) dispute = lkDeep(p.lookups, disputeRaw, "re02_dispute_type");
    if (dispute && !/상황$/.test(dispute)) dispute = `${dispute} 상황`;
    const end =
      lkDeep(p.lookups, resolved.re02_contract_end, "re02_contract_end") ||
      phraseFromOption("RE02", "re02_contract_end", resolved.re02_contract_end);
    if (!role || !dispute || !end) return "";
    const rolePhrase = /로서$/.test(role) ? role : `${withParticle(role, "으로/로")}서`;
    const endClause = end.trim().replace(/\.$/, "");
    return ensureMetricSentenceEnd(
      correctParticlesInSentence(`${rolePhrase} ${withParticle(dispute, "이/가")}며, 계약은 ${endClause}`),
    );
  }
  if (metricIndex === 1) {
    const goal = lkDeep(p.lookups, resolved.re02_confirm_goal, "re02_confirm_goal");
    return goal ? ensureMetricSentenceEnd(goal) : "";
  }
  if (metricIndex === 2) {
    const disputeRaw =
      resolved.re02_dispute_type || resolved.re02_dispute_type_holder;
    let materials = lkDeep(p.lookups, disputeRaw, "re02_dispute_type");
    if (!materials || /^[a-z0-9_]+$/i.test(materials)) return "";
    const end = String(resolved.re02_contract_end ?? "");
    if (/end_me_short_notice/.test(end)) materials += " 계약서의 사전 통지 조항도 함께 확인하세요.";
    if (/end_not_ended/.test(end)) materials += " 계약이 아직 유지 중이므로 대응 방식은 신중히 정하세요.";
    return ensureMetricSentenceEnd(materials);
  }
  return "";
}

function buildRe03MetricLine(
  metricIndex: number,
  answers: AnswerMap,
  p: PackM45,
): string {
  if (metricIndex === 0) {
    const role =
      lkDeep(p.lookups, answers.re03_my_role, "re03_my_role") ||
      phraseFromOption("RE03", "re03_my_role", answers.re03_my_role);
    const demand =
      lkDeep(p.lookups, answers.re03_demand_type, "re03_demand_type") ||
      phraseFromOption("RE03", "re03_demand_type", answers.re03_demand_type);
    if (!role || !demand) return "";
    const rolePhrase = /(으로서|로서)$/.test(role) ? role : `${withParticle(role, "으로/로")}서`;
    return ensureMetricSentenceEnd(
      correctParticlesInSentence(`${rolePhrase} 상대방에게서 ${demand} 통보를 받은 상황입니다.`),
    );
  }
  if (metricIndex === 1) {
    const goal = lkDeep(p.lookups, answers.re03_confirm_goal, "re03_confirm_goal");
    return goal ? ensureMetricSentenceEnd(goal) : "";
  }
  if (metricIndex === 2) {
    const response = lkDeep(p.lookups, answers.re03_response_status, "re03_response_status");
    if (!response) return "";
    return ensureMetricSentenceEnd(response);
  }
  return "";
}

function fixCpTradeParticles(text: string): string {
  return text.replace(/([가-힣·A-Za-z0-9]+)(과|와)의 거래/g, (full, noun) => {
    const correct = withParticle(noun, "과/와");
    return `${correct}의 거래`;
  });
}

function buildRe04MetricLine(
  metricIndex: number,
  answers: AnswerMap,
  p: PackM45,
): string {
  if (metricIndex === 0) {
    const issue = lkDeep(p.lookups, answers.re04_issue_type, "re04_issue_type");
    const since = lkDeep(p.lookups, answers.re04_since_when, "re04_since_when");
    if (!issue || !since || /^[a-z0-9_]+$/i.test(issue) || /^[a-z0-9_]+$/i.test(since)) {
      return "";
    }
    const line = `${withParticle(issue, "이/가")} ${since} 이어지고 있습니다.`;
    return ensureMetricSentenceEnd(correctParticlesInSentence(line));
  }
  if (metricIndex === 1) {
    let goal = lkDeep(p.lookups, answers.re04_confirm_goal, "re04_confirm_goal");
    if (!goal || /^cg_[\w]+$/.test(goal)) {
      const fromOpt = phraseFromOption("RE04", "re04_confirm_goal", answers.re04_confirm_goal);
      goal = fromOpt ? hopeFormToPackConfirmGoal(fromOpt.endsWith(".") ? fromOpt : `${fromOpt}.`) : "";
    } else {
      goal = hopeFormToPackConfirmGoal(goal);
    }
    return goal ? ensureMetricSentenceEnd(goal) : "";
  }
  if (metricIndex === 2) {
    let notify = lkDeep(p.lookups, answers.re04_notify_status, "re04_notify_status");
    if (!notify || /^nt_[\w]+$/.test(notify)) {
      notify = phraseFromOption("RE04", "re04_notify_status", answers.re04_notify_status);
    }
    return notify ? ensureMetricSentenceEnd(notify) : "";
  }
  return "";
}

function buildRe05MetricLine(
  metricIndex: number,
  answers: AnswerMap,
  p: PackM45,
): string {
  const m = p.metrics[metricIndex];
  if (!m) return "";
  if (metricIndex === 0) {
    const cp = lk(p.lookups, answers.re05_counterparty, "re05_counterparty");
    const paid = lk(p.lookups, answers.re05_paidStage, "re05_paidStage");
    const stage = lk(p.lookups, answers.re05_stage, "re05_stage");
    const clauses: string[] = [];
    const cpPhrase = cp ? `${withParticle(cp, "과/와")}의 거래` : "";
    if (cp && paid && stage) clauses.push(`${cpPhrase}에서 ${paid} 상태이며, ${stage}`);
    else if (cp && stage) clauses.push(`${cpPhrase}에서 ${stage}`);
    else if (paid && stage) clauses.push(`${paid} 상태이며, ${stage}`);
    else if (stage) clauses.push(stage);
    else if (cp) clauses.push(`${cpPhrase}를 진행 중입니다`);
    return ensureMetricSentenceEnd(correctParticlesInSentence(fixCpTradeParticles(clauses.join(" "))));
  }
  if (metricIndex === 1) {
    const goal = lk(p.lookups, answers.re05_confirmGoal, "re05_confirmGoal");
    if (!goal) return "";
    return ensureMetricSentenceEnd(goal);
  }
  if (metricIndex === 2) {
    const paidVal = String(answers.re05_paidStage ?? "");
    const prep =
      p.lookups[`m3_${paidVal}`] || lkDeep(p.lookups, answers.re05_paidStage, "re05_paidStage");
    if (!prep || /^r5_paid_/.test(prep)) return "";
    return ensureMetricSentenceEnd(prep);
  }
  return "";
}

function metricsAnswers(caseId: RealEstateCaseId, answers: AnswerMap): AnswerMap {
  if (caseId !== "RE02") return answers;
  if (answers.re02_dispute_type) return answers;
  if (!answers.re02_dispute_type_holder) return answers;
  return { ...answers, re02_dispute_type: answers.re02_dispute_type_holder };
}

/** pack-RE01 §3 — 진행 단계 → metric1 「… 상태」 / metric3 「다음 행동」 */
const RE01_NEXT_ACTION_BY_STAGE: Record<string, string> = {
  r1_st_viewing: "계약서 초안을 서면으로 받는 것",
  st_viewing: "계약서 초안을 서면으로 받는 것",
  r1_st_draft: "조항 검토와 소유자 원본 대조",
  st_draft: "조항 검토와 소유자 원본 대조",
  r1_st_sign_scheduled: "조항 검토와 소유자 원본 대조",
  st_sign_scheduled: "조항 검토와 소유자 원본 대조",
  r1_st_deposit_requested: "송금 전에 계좌 명의와 위약 조항 확인",
  st_deposit_requested: "송금 전에 계좌 명의와 위약 조항 확인",
  r1_st_deposit_paid: "계약금 영수증 확보와 본계약 조건 확정",
  st_deposit_paid: "계약금 영수증 확보와 본계약 조건 확정",
};

function re01ProgressStageSituationPhrase(answers: AnswerMap, lookups: Record<string, string>): string {
  const raw = lk(lookups, answers.re01_progress_stage, "re01_progress_stage");
  if (!raw || raw.includes(" / ") || raw.includes("`")) return "";
  return raw.replace(/입니다\.?\s*$/i, "").replace(/\.\s*$/, "").trim();
}

function buildRe01MetricLine(
  metricIndex: number,
  answers: AnswerMap,
  p: PackM45,
): string {
  const m = p.metrics[metricIndex];
  if (!m) return "";
  if (metricIndex === 0) {
    const contract = lk(p.lookups, answers.re01_contract_type, "re01_contract_type");
    const stage = re01ProgressStageSituationPhrase(answers, p.lookups);
    if (!contract || !stage) return "";
    return `${withParticle(contract, "을/를")} 앞두고 있고, 현재 ${stage}입니다.`;
  }
  if (metricIndex === 1) {
    const goal = lk(p.lookups, answers.re01_confirm_goal, "re01_confirm_goal");
    const compoundOwner = lkCompound(
      p.lookups,
      answers,
      "re01_progress_stage",
      "re01_owner_doc_check",
    );
    const owner =
      compoundOwner || lk(p.lookups, answers.re01_owner_doc_check, "re01_owner_doc_check");
    if (!goal || !owner) return "";
    const ownerTail = owner.endsWith(".") ? owner : `${owner}.`;
    const ownerClause =
      compoundOwner || /(소유자|핑크북)/.test(owner)
        ? ownerTail
        : `소유자 확인은 ${ownerTail}`;
    return `${withParticle(goal, "을/를")} 먼저 확인해야 하며, ${ownerClause}`;
  }
  if (metricIndex === 2) {
    const stageVal = String(answers.re01_progress_stage ?? "");
    const nextAction =
      RE01_NEXT_ACTION_BY_STAGE[stageVal] ??
      RE01_NEXT_ACTION_BY_STAGE[stageVal.replace(/^re01_/, "r1_")] ??
      "";
    const prep = m.prepDefault ?? "";
    if (!nextAction || !prep) return "";
    let action = nextAction;
    if (action.startsWith("송금 전에 ")) action = action.slice("송금 전에 ".length);
    const nextWith = action.endsWith("것") ? `${action}이` : withParticle(action, "이/가");
    return dedupeAdjacentPhrases(
      `서명이나 송금 전에 ${nextWith} 필요하고, ${withParticle(prep, "을/를")} 준비해 두세요.`,
    );
  }
  return "";
}

export function buildResultMetrics(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
): [string, string, string] {
  const p = pack(caseId);
  if (!p?.metrics?.length) return ["", "", ""];
  const resolved = metricsAnswers(caseId, answers);
  const out: string[] = [];
  for (let i = 0; i < Math.min(3, p.metrics.length); i++) {
    const m = p.metrics[i];
    let line =
      caseId === "RE01"
        ? buildRe01MetricLine(i, resolved, p)
        : caseId === "RE02"
          ? buildRe02MetricLine(i, resolved, p)
          : caseId === "RE03"
            ? buildRe03MetricLine(i, resolved, p)
            : caseId === "RE04"
              ? buildRe04MetricLine(i, resolved, p)
              : caseId === "RE05"
                ? buildRe05MetricLine(i, resolved, p)
                : fillTemplate(caseId, m.template, resolved, m.fields, p.lookups);
    if (caseId === "RE03" && i > 0) {
      line = ensureMetricSentenceEnd(line);
    }
    if (caseId === "RE03" && i === 2 && m.suffixIfNotNone) {
      const rs = String(answers.re03_response_status ?? "");
      if (rs && rs !== "rs_none" && rs !== "r3_rs_none") {
        line = mergeRedundantRecordSuffix(line, m.suffixIfNotNone);
      }
    }
    if (i === 1) line = hopeFormToPackConfirmGoal(line);
    if (caseId !== "RE01" && m.prepDefault && line.includes("{prep}")) {
      line = line.replace("{prep}", m.prepDefault);
    }
    out.push(correctParticlesInSentence(dedupeAdjacentPhrases(line)));
  }
  while (out.length < 3) out.push("");
  return [out[0], out[1], out[2]];
}

function resolveRe01BracketStep(raw: string, answers: AnswerMap): string {
  const ct = String(answers.re01_contract_type ?? "");
  let s = raw;
  if (s.includes("(분양이면")) {
    s = s.replace(/\s*\(분양이면[^)]*\)/g, () =>
      ct.includes("purchase_project")
        ? " 개발사의 사업 서류와 외국인 구매 가능 물량을 서면으로 받으세요."
        : "",
    );
  }
  const bracket = s.match(/\[([^\]]+)\]/);
  if (!bracket) return s.replace(/\s+/g, " ").trim();
  const segments = bracket[1].split(" / ").map((p) => p.trim());
  const leaseHome = /r1_ct_lease_home/.test(ct);
  const leaseOffice = /r1_ct_lease_office/.test(ct);
  const purchase = /purchase/.test(ct);
  let chosen = "";
  if (leaseHome) {
    const seg = segments.find((p) => p.startsWith("임대:"));
    chosen = seg ? seg.replace(/^[^:]+:\s*/, "") : segments[0] ?? "";
  } else if (leaseOffice) {
    const seg = segments.find((p) => p.startsWith("상가"));
    chosen = seg ? seg.replace(/^[^:]+:\s*/, "") : "";
  } else if (purchase) {
    const seg = segments.find((p) => p.startsWith("매매"));
    chosen = seg ? seg.replace(/^[^:]+:\s*/, "") : "";
  } else {
    chosen = segments[0]?.replace(/^[^:]+:\s*/, "") ?? "";
  }
  s = s.replace(/\[([^\]]+)\]/, chosen);
  return s.replace(/\s+/g, " ").trim();
}

export function buildResultSteps(caseId: RealEstateCaseId, answers: AnswerMap): string[] {
  const p = pack(caseId);
  if (!p) return [];
  const steps = [...(p.steps ?? [])].map((step) =>
    caseId === "RE01" ? resolveRe01BracketStep(step, answers) : step,
  );
  for (const v of p.stepVariants ?? []) {
    if (evalExpr(v.when, answers)) {
      const idx = v.when.includes("project_book") ? 0 : v.when.includes("foreign_eligibility") ? 0 : 2;
      if (steps[idx]) steps[idx] = v.text;
    }
  }
  return steps.slice(0, 3);
}
