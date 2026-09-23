import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import type {
  AdminVerifyFirstResultData,
  AdminVerifyKeyMetric,
  AdminVerifyPersonalizedContext,
} from "@/components/cost-check/AdminVerifyFirstResultPanel";
import { buildRealEstateFirstResult } from "@/lib/realEstateVerifyFirstResult";
import {
  buildRealEstatePhase1CarryOverLines,
  buildRealEstatePhase2CompletionLines,
  buildRealEstateSituationProfile,
  getRealEstateResolutionPath,
  RE2_CANNOT_CLASSIFY_YET,
  RE2_CONFLICT_DETAIL_KEY,
  RE2_CONFLICT_FOCUS_KEY,
  RE2_MONEY_RECOVERY_KEY,
  RE2_UNCLEAR_DOC_ANCHOR_KEY,
  RE2_UNCLEAR_MONEY_ISSUE_KEY,
  RE2_UNCLEAR_PARTY_FOCUS_KEY,
  RE2_UNCLEAR_TIMELINE_FOCUS_KEY,
  RE_DOCS_MATCH_KEY,
  realEstatePhase2HasMaterialMissing,
  type RealEstateProfileFieldStatus,
  type RealEstateResolutionPath,
} from "@/lib/realEstateVerifyProfiling";

const REAL_ESTATE_DOCUMENTS_NEEDED_NOTE =
  "현재 답변만으로 기본적인 상황은 정리할 수 있습니다. 계약서·등기부·송금 내역 등 원본 서류를 대조하면 확인 범위를 넓힐 수 있습니다.";

type RealEstateResultConfidence = "sufficient" | "partial" | "insufficient" | "conflict";

function metricFromProfile(
  label: string,
  title: string,
  value: string | null,
  status: RealEstateProfileFieldStatus,
): AdminVerifyKeyMetric {
  if (!value) {
    return {
      label,
      title,
      footnote: "답변에서 아직 확인되지 않았습니다",
      status: "caution",
    };
  }
  const isInferred = status === "inferred" || status === "candidate";
  const isClaim = status === "customer_claim" || status === "counterparty_claim";
  return {
    label,
    title: value,
    footnote: isClaim
      ? "고객·상대 주장 기준 (확인 전)"
      : isInferred
        ? "선택 답변에서 추론된 내용입니다"
        : "입력·확인된 답변 기준",
    status: isClaim || isInferred ? "caution" : "ok",
  };
}

function hasMaterialStop(answers: ReviewAnswers): boolean {
  return realEstatePhase2HasMaterialMissing(answers);
}

function detectConflictNotes(answers: ReviewAnswers): string[] {
  const notes: string[] = [];
  const docsMatch = answers[RE_DOCS_MATCH_KEY];
  if (
    docsMatch === "match" &&
    (answers[RE2_CONFLICT_FOCUS_KEY]?.trim() || answers[RE2_CONFLICT_DETAIL_KEY]?.trim())
  ) {
    notes.push("서류 일치 응답과 2차 불일치 확인이 공존합니다. 원본 대조가 필요합니다.");
  }
  const path = getRealEstateResolutionPath(answers);
  if (path === "PRE_CONTRACT" && answers[RE2_MONEY_RECOVERY_KEY]?.trim()) {
    notes.push(
      "사전 검토 경로이나 금전 회수 이슈가 2차에서 확인되었습니다. 초점을 다시 정리할 필요가 있습니다.",
    );
  }
  return notes;
}

function assessConfidence(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  path: RealEstateResolutionPath | null,
  materialStop: boolean,
  conflicts: string[],
): RealEstateResultConfidence {
  if (conflicts.length > 0) return "conflict";
  if (materialStop) return "insufficient";

  const criticalFields =
    path === "PRE_CONTRACT"
      ? [profile.contractStage, profile.risk, profile.money]
      : path === "POST_DISPUTE"
        ? [profile.claims, profile.money, profile.dates]
        : path === "DOCUMENT_REVIEW"
          ? [profile.documents, profile.facts, profile.risk]
          : [profile.claims, profile.goal, profile.documents];

  const unknownCount = criticalFields.filter((field) => field.status === "unknown").length;
  const inferredCount = criticalFields.filter(
    (field) => field.status === "inferred" || field.status === "candidate",
  ).length;
  const claimCount = criticalFields.filter(
    (field) =>
      field.status === "customer_claim" || field.status === "counterparty_claim",
  ).length;

  if (unknownCount >= 2) return "insufficient";
  if (unknownCount > 0 || inferredCount > 0 || claimCount > 0) return "partial";
  return "sufficient";
}

function confidenceHeadline(confidence: RealEstateResultConfidence): string {
  if (confidence === "conflict") return "확인이 엇갈리는 상태입니다";
  if (confidence === "insufficient") return "아직 정리 중인 상태입니다";
  if (confidence === "partial") return "추가 확인이 필요한 상태입니다";
  return "입력·확인된 내용 기준으로 2차 검토를 정리했습니다";
}

function buildIntegratedSituation(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  phase2Lines: { label: string; value: string }[],
  path: RealEstateResolutionPath | null,
): string {
  const parts: string[] = ["입력·확인된 내용 기준으로"];
  if (profile.transaction.value) parts.push(profile.transaction.value);
  if (profile.contractStage.value) parts.push(`진행 단계는 ${profile.contractStage.value}`);
  if (profile.property.value) parts.push(`거래·물건은 ${profile.property.value}`);
  if (profile.parties.value) parts.push(`상대는 ${profile.parties.value}`);
  if (profile.customerInput) {
    const trimmed = profile.customerInput.trim();
    parts.push(
      trimmed.length > 80 ? `상황 설명: ${trimmed.slice(0, 77)}…` : `상황 설명: ${trimmed}`,
    );
  }

  const phase2Highlight = phase2Lines
    .slice(0, 2)
    .map((line) => `${line.label}(${line.value})`)
    .join(", ");
  if (phase2Highlight) {
    parts.push(`2차에서 ${phase2Highlight}이(가) 추가로 확인되었습니다`);
  } else if (path === "UNCLEAR") {
    parts.push("우선 확인 사실을 중심으로 상황을 정리했습니다");
  }

  return parts.join(". ").replace(/\.\./g, ".") + ".";
}

function buildCoreJudgment(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  path: RealEstateResolutionPath | null,
  materialStop: boolean,
  conflicts: string[],
): string {
  if (materialStop) {
    return "입력·확인된 내용만으로는 아직 상황을 더 세분화하기 어렵습니다. 추가 사실 확인 후 검토 범위를 좁히는 것이 좋습니다.";
  }

  const segments: string[] = [];
  if (path === "UNCLEAR") {
    segments.push("처음에는 상황 파악 검토로 접근했습니다");
    if (profile.money.value) {
      segments.push(`2차에서는 ${profile.money.value} 쪽 이슈가 두드러집니다`);
    } else if (profile.documents.value) {
      segments.push(`2차에서는 ${profile.documents.value} 쪽 확인이 중심입니다`);
    } else if (profile.claims.value) {
      segments.push(`우선 확인 사실 기준으로 ${profile.claims.value} 쪽 정리가 필요합니다`);
    }
  } else if (path === "PRE_CONTRACT") {
    if (profile.rights.value) segments.push(`등기·권리 측면에서 ${profile.rights.value}`);
    if (profile.risk.value) segments.push(`조항·위험 측면에서 ${profile.risk.value}`);
    if (profile.money.value) segments.push(`금액·납부 조건은 ${profile.money.value}`);
    if (segments.length === 0 && profile.contractStage.value) {
      segments.push(`${profile.contractStage.value} 단계에서 계약 조건 교차 확인이 핵심입니다`);
    }
  } else if (path === "POST_DISPUTE") {
    if (profile.money.value) segments.push(`금전·반환 상태는 ${profile.money.value}`);
    if (profile.dates.value) segments.push(`문제 흐름은 ${profile.dates.value}`);
    if (profile.claims.value) segments.push(`핵심 사안은 ${profile.claims.value}`);
    if (profile.responses.value) segments.push(`공식 대응·기관 절차는 ${profile.responses.value}`);
  } else if (path === "DOCUMENT_REVIEW") {
    if (profile.documents.value) segments.push(`서류 신뢰는 ${profile.documents.value}`);
    if (profile.facts.value) segments.push(`내용 차이·불일치는 ${profile.facts.value}`);
    if (profile.risk.value && profile.risk.value !== profile.facts.value) {
      segments.push(`추가 위험 신호: ${profile.risk.value}`);
    }
  }

  if (conflicts.length > 0) {
    segments.push(conflicts[0]!);
  }

  if (segments.length === 0) {
    return "1차와 2차 답변을 통합해 현재까지 확인된 핵심 축을 정리했습니다. 아직 직접 확인되지 않은 부분은 아래 확인 사항을 참고해 주세요.";
  }

  return `입력·확인된 내용 기준으로 ${segments.join(". ")}.`;
}

function appendPrePhase2Signals(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (profile.rights.value && profile.rights.status !== "unknown") {
    cautions.push(`등기·소유권: ${profile.rights.value}`);
    unconfirmed.push("등기부·위임장 원본 대조");
  }
  if (profile.risk.value) {
    cautions.push(
      profile.risk.status !== "unknown"
        ? `조항·위험: ${profile.risk.value}`
        : `조항·위험 후보: ${profile.risk.value}`,
    );
  }
  if (profile.money.value) {
    cautions.push(`금액·반환 조건: ${profile.money.value}`);
  }
  actions.push(
    "계약서·등기부 핵심 조항을 직접 대조",
    "보증금·중도금 조건이 합의와 같은지 확인",
    "불리한 조항은 서명 전 VFBCAI 전문가팀과 검토",
    "서명·공증·등기 필요 여부를 사전에 확인",
  );
}

function appendPostPhase2Signals(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (profile.money.value) {
    cautions.push(`보증금·반환: ${profile.money.value}`);
  }
  if (profile.dates.value) {
    cautions.push(`문제 흐름: ${profile.dates.value}`);
  }
  if (profile.facts.value && profile.facts.status !== "unknown") {
    cautions.push(`사실 불일치: ${profile.facts.value}`);
  }
  if (profile.responses.value) {
    unconfirmed.push("공식 연락·기관 대응 경로");
  }
  if (profile.dates.status === "unknown") {
    unconfirmed.push("분쟁 경과·기한");
  }
  actions.push(
    "서면·송금·메시지 등 증빙을 날짜 순으로 정리",
    "공식 연락 경로와 상대방 안내 내용을 확인",
    "기한·기록을 보존하고 다음 대응을 준비",
    "VFBCAI 전문가팀과 대응 방향 상담",
  );
}

function appendDocumentPhase2Signals(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (profile.documents.value) {
    cautions.push(`서류 신뢰: ${profile.documents.value}`);
  }
  if (profile.facts.value) {
    cautions.push(`내용 차이: ${profile.facts.value}`);
  }
  if (profile.risk.value && profile.risk.value !== profile.facts.value) {
    cautions.push(profile.risk.value);
  }
  unconfirmed.push("원본·번역본 대조", "핵심 조항·금액·당사자 정보");
  actions.push(
    "서류 원본과 번역본을 나란히 비교",
    "핵심 조항·금액을 하이라이트",
    "상대방에게 확인 요청",
    "VFBCAI 전문가팀 검토 요청",
  );
}

function appendUnclearPhase2Signals(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  materialStop: boolean,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (materialStop) {
    cautions.push("분류에 필요한 추가 정보가 아직 부족합니다");
    actions.push("현재 상황을 시간 순으로 정리", "관련 서류·증빙을 모아 보관");
    return;
  }
  if (profile.claims.value) unconfirmed.push(`우선 확인: ${profile.claims.value}`);
  if (profile.money.value) cautions.push(`2차 확인 초점 — 금전: ${profile.money.value}`);
  if (profile.documents.value) cautions.push(`2차 확인 초점 — 서류: ${profile.documents.value}`);
  actions.push(
    "우선 확인 사실부터 순서대로 정리",
    "관련 서류·증빙을 모아 보관",
    "어떤 검토가 필요한지 다시 확인",
    "VFBCAI 전문가팀과 방향 상담",
  );
}

function buildPhase2RiskSummary(lines: { label: string; value: string }[]): string {
  if (lines.length === 0) {
    return "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";
  }
  return lines
    .slice(0, 4)
    .map((line) => `${line.label}: ${line.value}`)
    .join(" · ");
}

function buildEnrichedKeyMetrics(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  path: RealEstateResolutionPath | null,
): AdminVerifyKeyMetric[] {
  const metrics: AdminVerifyKeyMetric[] = [
    metricFromProfile("거래·물건", "물건·거래", profile.property.value, profile.property.status),
    metricFromProfile("상대·관계", "상대방", profile.parties.value, profile.parties.status),
  ];

  if (path === "PRE_CONTRACT" || profile.money.value) {
    metrics.push(metricFromProfile("금액·반환", "금액", profile.money.value, profile.money.status));
  }
  if (path === "PRE_CONTRACT" || profile.rights.value) {
    metrics.push(metricFromProfile("등기·권리", "권리", profile.rights.value, profile.rights.status));
  }
  if (path === "POST_DISPUTE" || profile.dates.value) {
    metrics.push(metricFromProfile("문제 흐름", "경과", profile.dates.value, profile.dates.status));
  }
  if (path === "DOCUMENT_REVIEW" || profile.documents.value) {
    metrics.push(
      metricFromProfile("서류 상태", "서류", profile.documents.value, profile.documents.status),
    );
  }
  if (metrics.length < 4) {
    metrics.push(metricFromProfile("확인 목적", "목적", profile.goal.value, profile.goal.status));
  }

  return metrics.slice(0, 4);
}

export function buildRealEstatePersonalizedContext(
  answers: ReviewAnswers,
  evidenceFileName?: string | null,
): AdminVerifyPersonalizedContext {
  const profile = buildRealEstateSituationProfile(answers);
  const path = getRealEstateResolutionPath(answers);
  const carryOver = buildRealEstatePhase1CarryOverLines(answers);
  const phase2Lines = buildRealEstatePhase2CompletionLines(answers);
  const materialStop = hasMaterialStop(answers);
  const conflicts = detectConflictNotes(answers);

  return {
    integratedSituation: buildIntegratedSituation(profile, phase2Lines, path),
    coreJudgment: buildCoreJudgment(profile, path, materialStop, conflicts),
    phase1Facts: carryOver.map((line) => `${line.label}: ${line.value}`),
    phase2Additions: [buildPhase2RiskSummary(phase2Lines)],
    evidenceNote: evidenceFileName ? `첨부 자료: ${evidenceFileName}` : undefined,
    documentsNeededNote: REAL_ESTATE_DOCUMENTS_NEEDED_NOTE,
  };
}

export function buildRealEstatePersonalizedResult(
  answers: ReviewAnswers,
  evidenceFileName?: string | null,
): AdminVerifyFirstResultData {
  const base = buildRealEstateFirstResult(answers, null);
  const profile = buildRealEstateSituationProfile(answers);
  const path = getRealEstateResolutionPath(answers);
  const materialStop = hasMaterialStop(answers);
  const conflicts = detectConflictNotes(answers);
  const confidence = assessConfidence(profile, path, materialStop, conflicts);
  const personalizedContext = buildRealEstatePersonalizedContext(answers, evidenceFileName);

  const cautions = [...base.cautions];
  const unconfirmed = [...base.unconfirmed];
  const actions = [...base.actions];

  if (path === "PRE_CONTRACT") {
    appendPrePhase2Signals(profile, cautions, unconfirmed, actions);
  } else if (path === "POST_DISPUTE") {
    appendPostPhase2Signals(profile, cautions, unconfirmed, actions);
  } else if (path === "DOCUMENT_REVIEW") {
    appendDocumentPhase2Signals(profile, cautions, unconfirmed, actions);
  } else {
    appendUnclearPhase2Signals(profile, materialStop, cautions, unconfirmed, actions);
  }

  for (const conflict of conflicts) {
    unconfirmed.push(conflict);
  }

  if (profile.risk.value && profile.risk.status !== "unknown" && !cautions.includes(profile.risk.value)) {
    cautions.unshift(profile.risk.value);
  }
  if (profile.facts.value && profile.facts.status !== "unknown") {
    const factLine = profile.facts.value.startsWith("서류")
      ? profile.facts.value
      : `사실 차이: ${profile.facts.value}`;
    if (!cautions.some((item) => item.includes(profile.facts.value!))) {
      cautions.push(factLine);
    }
  }

  const keyMetrics = buildEnrichedKeyMetrics(profile, path);
  const hasMetricCaution = keyMetrics.some((metric) => metric.status === "caution");
  const hasIssues =
    confidence !== "sufficient" ||
    cautions.length > 0 ||
    unconfirmed.length > 0 ||
    hasMetricCaution;

  return {
    ...base,
    stageLabel:
      path === "PRE_CONTRACT"
        ? "계약·서명 전 2차 검토"
        : path === "POST_DISPUTE"
          ? "문제 발생 후 2차 검토"
          : path === "DOCUMENT_REVIEW"
            ? "서류 확인 2차 검토"
            : "상황 파악 2차 검토",
    statusHeadline: confidenceHeadline(confidence),
    statusTone: hasIssues ? "caution" : base.statusTone,
    situationSummary: personalizedContext.integratedSituation,
    gradeFilled: hasIssues ? Math.max(base.gradeFilled, 2) : base.gradeFilled,
    gradeLabel: hasIssues ? "주의 요망 (2차)" : "2차 확인 완료",
    keyMetrics,
    cautions: [...new Set(cautions)].slice(0, 6),
    unconfirmed: [...new Set(unconfirmed)].slice(0, 6),
    actions: [...new Set(actions)].slice(0, 4),
    personalizedContext,
  };
}
