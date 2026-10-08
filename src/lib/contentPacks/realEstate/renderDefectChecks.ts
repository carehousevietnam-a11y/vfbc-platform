import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import type { VerifyFirstResultTransition } from "@/lib/verifyPaidTransitionHooks";
import { findJosaViolations } from "./koreanParticle";
import type { RealEstateCaseId } from "./types";
import { re02DirectionMismatch } from "./directionChecks";
import { metricEchoesOptionLabel } from "./echoChecks";
import {
  dedupeAdjacentPhrases,
  hasSemanticRecordRepetition,
  hasVerbStemRepetition,
} from "./sentencePolish";

const SUBTITLE_BY_CASE: Record<RealEstateCaseId, string> = {
  RE01: "계약 전 확인 핵심 포인트",
  RE02: "분쟁 대응 핵심 포인트",
  RE03: "통보 대응 핵심 포인트",
  RE04: "하자·관리 대응 핵심 포인트",
  RE05: "권리·지급 확인 핵심 포인트",
  RE06: "계약 전 확인 핵심 포인트",
};

const BAD_STATE_TAIL =
  /(부족|않음|만료로 종료|먼저 종료|종료되지 않음|사전 통지가 부족)\s*상태입니다/;

function orphanJosaAtLineStart(line: string): boolean {
  if (/^이\s+(돈|번|상황|문제|부분|조건|내용)/.test(line)) return false;
  if (/^으로서\s|^로서\s/.test(line)) return true;
  return /^(과의|와의|을|를|이|가|은|는)\s/.test(line);
}

/** Pack §3에 명시된 1차 고정 문장은 제외 — 미완성/무선택 폴백만 */
const FALLBACK_PHRASES = ["진행 순서를 정리합니다"];

const ADMIN_DOC_PHRASES = [
  "원본·번역·조항",
  "원본·번역",
  "행정문서",
  "신청 서류 규격",
  "번역본만으로",
];

export function renderDefectHitsC118(
  metrics: string[],
  visibleText: string,
  transition?: VerifyFirstResultTransition,
  opts?: { caseId?: RealEstateCaseId; answers?: Record<string, string>; subtitle?: string },
): Record<string, number> {
  const hits: Record<string, number> = {
    orphan_josa_start: 0,
    bare_state_ime: 0,
    missing_period: 0,
    double_space: 0,
    empty_paren: 0,
    brace_leftover: 0,
    generic_fallback: 0,
    admin_doc_phrase: 0,
    metric_josa: 0,
    bad_state_tail: 0,
    direction_mismatch: 0,
    wrong_subtitle: 0,
  };
  for (const line of metrics.filter(Boolean)) {
    if (orphanJosaAtLineStart(line)) hits.orphan_josa_start++;
    if (findJosaViolations(line).length) hits.metric_josa++;
    if (BAD_STATE_TAIL.test(line)) hits.bad_state_tail++;
    if (line.length > 12 && !/[.!?…]$/.test(line.trim())) hits.missing_period++;
    if (/  /.test(line)) hits.double_space++;
    if (/\(\s*\)/.test(line)) hits.empty_paren++;
    if (/\{[^}]+\}/.test(line)) hits.brace_leftover++;
    for (const p of FALLBACK_PHRASES) {
      if (line.includes(p) && !line.endsWith(".")) hits.generic_fallback++;
    }
  }
  if (opts?.caseId && opts.subtitle) {
    const expected = SUBTITLE_BY_CASE[opts.caseId];
    if (expected && !opts.subtitle.includes(expected)) hits.wrong_subtitle++;
  }
  if (opts?.caseId === "RE02" && opts.answers && metrics[0]) {
    if (re02DirectionMismatch(opts.answers, metrics[0])) hits.direction_mismatch++;
  }
  const blob = `${visibleText}\n${transition?.hookWhatMore ?? ""}`;
  for (const p of ADMIN_DOC_PHRASES) {
    if (blob.includes(p)) hits.admin_doc_phrase++;
  }
  return hits;
}

export function renderDefectHitsC119(
  metrics: string[],
  visibleText: string,
  transition?: VerifyFirstResultTransition,
  opts?: { caseId?: RealEstateCaseId; answers?: Record<string, string>; subtitle?: string },
): Record<string, number> {
  const hits = renderDefectHitsC118(metrics, visibleText, transition, opts);
  const extra = {
    adjacent_dup: 0,
    verb_stem_repeat: 0,
    hope_form_m2_m3: 0,
    label_echo: 0,
  };
  for (let i = 0; i < metrics.length; i++) {
    const line = metrics[i];
    if (!line) continue;
    if (line !== dedupeAdjacentPhrases(line)) extra.adjacent_dup++;
    if (hasVerbStemRepetition(line)) extra.verb_stem_repeat++;
    if ((i === 1 || i === 2) && /(하고|받고|정리하고)\s*싶습니다/.test(line)) extra.hope_form_m2_m3++;
    if (opts?.caseId && opts.answers && (i === 1 || i === 2)) {
      if (metricEchoesOptionLabel(opts.caseId, opts.answers, line, i)) extra.label_echo++;
    }
  }
  return { ...hits, ...extra };
}

export function renderDefectHitsC120(
  metrics: string[],
  visibleText: string,
  transition?: VerifyFirstResultTransition,
  opts?: { caseId?: RealEstateCaseId; answers?: Record<string, string>; subtitle?: string },
): Record<string, number> {
  const hits = renderDefectHitsC119(metrics, visibleText, transition, opts);
  let semantic_record_repeat = 0;
  for (const line of metrics) {
    if (line && hasSemanticRecordRepetition(line)) semantic_record_repeat++;
  }
  return { ...hits, semantic_record_repeat };
}

export function renderDefectHits(
  packText: string,
  visibleText: string,
  transition?: VerifyFirstResultTransition,
): Record<string, number> {
  const hits: Record<string, number> = {
    orphan_josa_start: 0,
    bare_state_ime: 0,
    missing_period: 0,
    double_space: 0,
    empty_paren: 0,
    brace_leftover: 0,
    generic_fallback: 0,
    admin_doc_phrase: 0,
  };
  const lines = packText.split("\n").filter(Boolean).slice(2);
  for (const line of lines) {
    if (/^(과의|와의|을|를|이|가|은|는)\s/.test(line)) hits.orphan_josa_start++;
    if (/,\s*(과의|와의)\s/.test(line)) hits.orphan_josa_start++;
    if (/ 상태이며/.test(line) && !/[^\s,]{2,} 상태이며/.test(line)) hits.bare_state_ime++;
    if (line.length > 12 && !/[.!?…]$/.test(line.trim())) hits.missing_period++;
    if (/  /.test(line)) hits.double_space++;
    if (/\(\s*\)/.test(line)) hits.empty_paren++;
    if (/\{[^}]+\}/.test(line)) hits.brace_leftover++;
    for (const p of FALLBACK_PHRASES) {
      if (line.includes(p) && !line.endsWith(".")) hits.generic_fallback++;
    }
  }
  const blob = `${visibleText}\n${transition?.hookWhatMore ?? ""}`;
  for (const p of ADMIN_DOC_PHRASES) {
    if (blob.includes(p)) hits.admin_doc_phrase++;
  }
  return hits;
}

export function isFalseOkVerdict(data: AdminVerifyFirstResultData): boolean {
  const okHeadline = data.statusHeadline.includes("큰 문제가 보이지 않습니다");
  const okGrade = data.gradeLabel === "양호 (1단계)";
  return data.statusTone === "ok" && okHeadline && okGrade;
}
