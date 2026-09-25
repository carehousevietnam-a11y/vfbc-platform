import {
  CASE01_DATE_PLACE_DETAIL_KEY,
  CASE01_DEADLINE_DATE_KEY,
  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
  CASE01_FACT_DIFFERENCE_AUX_KEY,
  CASE01_DATE_PLACE_AUX_KEY,
  CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY,
  CASE01_FACT_RELATIONSHIP_NOTE_KEY,
  CASE01_RESPONSE_DETAIL_NOTE_KEY,
  CASE01_VIOLATION_CONTENT_NOTE_KEY,
  CASE01_CUSTOMER_RESPONDED_NOTE_KEY,
  CASE02_DEADLINE_DATE_KEY,
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
  CASE03_ATTENDANCE_PLACE_KEY,
  CASE03_ATTENDANCE_WHEN_WHERE_KEY,
  CASE03_DEADLINE_DATE_KEY,
  CASE03_PREP_ATTENDANCE_DATE_KEY,
  CASE04_DEADLINE_DATE_KEY,
  CASE05_DEADLINE_DATE_KEY,
  getAdminChoiceNoteKey,
  resolveAdminPhase2EvidenceFileName,
  getQ1ResolvedCase,
} from "@/lib/adminVerifyProfiling";
import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import {
  CASE06_DEADLINE_DATE_KEY,
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
} from "@/lib/adminVerifyCase06Redesign";

function pushTextLine(
  lines: string[],
  answers: ReviewAnswers,
  key: string,
  label: string,
): void {
  const text = answers[key]?.trim();
  if (text) lines.push(`${label}: ${text}`);
}

function pushNoteLine(
  lines: string[],
  answers: ReviewAnswers,
  questionId: string,
  label: string,
): void {
  const note = answers[getAdminChoiceNoteKey(questionId)]?.trim();
  if (note) lines.push(`${label}: ${note}`);
}

function pushCase01OriginalTextLine(
  lines: string[],
  answers: ReviewAnswers,
  primaryKey: string,
  legacyKey: string,
  label: string,
): void {
  const primary = answers[primaryKey]?.trim();
  if (primary) {
    lines.push(`${label}: ${primary}`);
    return;
  }
  pushTextLine(lines, answers, legacyKey, label);
}

function buildCase01ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushCase01OriginalTextLine(
    lines,
    answers,
    CASE01_FACT_DIFFERENCE_AUX_KEY,
    CASE01_FACT_DIFFERENCE_DETAIL_KEY,
    "사실 차이 원문",
  );
  pushCase01OriginalTextLine(
    lines,
    answers,
    CASE01_DATE_PLACE_AUX_KEY,
    CASE01_DATE_PLACE_DETAIL_KEY,
    "날짜·장소 원문",
  );
  pushTextLine(lines, answers, CASE01_VIOLATION_CONTENT_NOTE_KEY, "통지 내용");
  pushNoteLine(lines, answers, "case01_authorityDemand", "기관 요구");
  pushTextLine(lines, answers, CASE01_CUSTOMER_RESPONDED_NOTE_KEY, "대응 여부");
  pushTextLine(lines, answers, CASE01_RESPONSE_DETAIL_NOTE_KEY, "대응 내용");
  pushCase01OriginalTextLine(
    lines,
    answers,
    CASE01_AUTHORITY_FOLLOW_UP_AUX_KEY,
    getAdminChoiceNoteKey("case01_authorityResponse"),
    "기관 추가 요구 원문",
  );
  pushTextLine(lines, answers, CASE01_FACT_RELATIONSHIP_NOTE_KEY, "사실 비교 보충");
  pushTextLine(lines, answers, CASE01_DEADLINE_DATE_KEY, "대응 기한");
  return lines;
}

function buildCase02ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushTextLine(lines, answers, CASE02_PAYMENT_AMOUNT_DETAIL_KEY, "납부 금액");
  pushTextLine(lines, answers, CASE02_DEADLINE_DATE_KEY, "납부 기한");
  pushNoteLine(lines, answers, "case02_paymentSubject", "납부 안내 내용");
  pushNoteLine(lines, answers, "case02_paymentBasis", "납부 사유");
  pushNoteLine(lines, answers, "case02_authorityResponse", "기관 추가 안내");
  return lines;
}

function buildCase03ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushTextLine(lines, answers, CASE03_DEADLINE_DATE_KEY, "출석·소명 기한");
  pushTextLine(lines, answers, CASE03_ATTENDANCE_PLACE_KEY, "출석·소명 장소");
  pushTextLine(lines, answers, CASE03_ATTENDANCE_WHEN_WHERE_KEY, "출석 일시·장소");
  pushTextLine(lines, answers, CASE03_PREP_ATTENDANCE_DATE_KEY, "출석 예정일");
  pushNoteLine(lines, answers, "case03_authorityDemand", "기관 요구");
  pushNoteLine(lines, answers, "case03_customerResponse", "대응 내용");
  return lines;
}

function buildCase04ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushTextLine(lines, answers, CASE04_DEADLINE_DATE_KEY, "보완 제출 기한");
  pushNoteLine(lines, answers, "case04_supplementTarget", "보완 대상");
  pushNoteLine(lines, answers, "case04_supplementReason", "보완 사유");
  pushNoteLine(lines, answers, "case04_customerResponse", "대응 내용");
  pushNoteLine(lines, answers, "case04_addDocDetail", "추가 서류");
  pushNoteLine(lines, answers, "case04_modifyDetail", "수정 항목");
  pushNoteLine(lines, answers, "case04_evidenceDetail", "추가 증빙");
  return lines;
}

function buildCase05ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushTextLine(lines, answers, CASE05_DEADLINE_DATE_KEY, "처분 관련 대응 기한");
  pushNoteLine(lines, answers, "case05_dispositionType", "처분·조치 내용");
  pushNoteLine(lines, answers, "case05_customerResponse", "대응 내용");
  pushNoteLine(lines, answers, "case05_dispositionDetail", "처분 상세");
  pushNoteLine(lines, answers, "case05_factDetail", "사실 관련");
  pushNoteLine(lines, answers, "case05_explanationDetail", "소명·설명");
  return lines;
}

function buildCase06ResponseSummaryLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  pushTextLine(lines, answers, CASE06_DEADLINE_DATE_KEY, "날짜·기한");
  pushTextLine(lines, answers, CASE06_PAYMENT_AMOUNT_TEXT_KEY, "금액");
  pushNoteLine(lines, answers, "case06_documentNature", "문서 성격");
  pushNoteLine(lines, answers, "case06_requiredActionCandidate", "요구 조치");
  return lines;
}

/** Layer A — §01 「응답 요약」: DI·note·첨부 파일명만 (선택지 full label 제외). */
export function buildAdminVerifyResponseSummaryBlock(answers: ReviewAnswers): string[] {
  const q1Case = getQ1ResolvedCase(answers);
  let lines: string[] = [];
  switch (q1Case) {
    case "CASE_01":
      lines = buildCase01ResponseSummaryLines(answers);
      break;
    case "CASE_02":
      lines = buildCase02ResponseSummaryLines(answers);
      break;
    case "CASE_03":
      lines = buildCase03ResponseSummaryLines(answers);
      break;
    case "CASE_04":
      lines = buildCase04ResponseSummaryLines(answers);
      break;
    case "CASE_05":
      lines = buildCase05ResponseSummaryLines(answers);
      break;
    case "CASE_06":
      lines = buildCase06ResponseSummaryLines(answers);
      break;
    default:
      lines = [];
  }
  const fileName = resolveAdminPhase2EvidenceFileName(answers);
  if (fileName) {
    lines.push(`첨부 자료: ${fileName}`);
  }
  return lines;
}

/** CASE_01 legacy import path — Layer A `buildCase01ResponseSummaryLines`와 동일 */
export function buildCase01PrincipleFStateLines(answers: ReviewAnswers): string[] {
  return buildCase01ResponseSummaryLines(answers);
}
