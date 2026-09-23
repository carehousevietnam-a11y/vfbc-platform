import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import type {
  AdminVerifyFirstResultData,
  AdminVerifyKeyMetric,
} from "@/components/cost-check/AdminVerifyFirstResultPanel";
import {
  buildRealEstateSituationProfile,
  type RealEstateProfileFieldStatus,
  type RealEstateResolutionPath,
} from "@/lib/realEstateVerifyProfiling";

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
        : "입력 답변에서 확인됨",
    status: isClaim || isInferred ? "caution" : "ok",
  };
}

function pathStageLabel(path: RealEstateResolutionPath | null): string {
  if (path === "PRE_CONTRACT") return "계약·서명 전 검토";
  if (path === "POST_DISPUTE") return "문제 발생 후 대응";
  if (path === "DOCUMENT_REVIEW") return "받은 서류 확인";
  if (path === "UNCLEAR") return "상황 파악 검토";
  return "부동산 검토";
}

function buildSituationSummary(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
): string {
  const parts: string[] = [];
  if (profile.transaction.value) parts.push(profile.transaction.value);
  if (profile.contractStage.value) parts.push(`진행 단계: ${profile.contractStage.value}`);
  if (profile.claims.value && profile.claims.value !== profile.contractStage.value) {
    parts.push(`핵심 사안: ${profile.claims.value}`);
  }
  if (profile.property.value) parts.push(`거래·물건: ${profile.property.value}`);
  if (profile.parties.value) parts.push(`상대: ${profile.parties.value}`);
  if (profile.goal.value) parts.push(`확인 목적: ${profile.goal.value}`);
  if (profile.documents.value) parts.push(`서류 상태: ${profile.documents.value}`);
  if (profile.facts.value) parts.push(`차이·문제: ${profile.facts.value}`);
  if (profile.customerInput) {
    const trimmed = profile.customerInput.trim();
    parts.push(
      trimmed.length > 100 ? `상황 설명: ${trimmed.slice(0, 97)}…` : `상황 설명: ${trimmed}`,
    );
  }
  if (parts.length === 0) {
    return "입력하신 답변을 바탕으로 현재 부동산 관련 상황을 정리했습니다.";
  }
  return parts.join(" · ");
}

function buildCautions(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  path: RealEstateResolutionPath | null,
): string[] {
  const cautions: string[] = [];
  if (profile.risk.value && profile.risk.status !== "unknown") {
    cautions.push(profile.risk.value);
  }
  if (profile.facts.value && profile.facts.status !== "unknown") {
    cautions.push(`서류와 실제 상황 차이: ${profile.facts.value}`);
  }
  if (path === "POST_DISPUTE" && profile.claims.value) {
    cautions.push(`${profile.claims.value} — 대응 방향을 미리 정리하는 것이 좋습니다`);
  }
  if (path === "PRE_CONTRACT" && profile.contractStage.value) {
    cautions.push(
      `서명 전 단계(${profile.contractStage.value}) — 계약 조건을 다시 확인해 보세요`,
    );
  }
  if (path === "DOCUMENT_REVIEW" && profile.documents.value?.includes("다릅니다")) {
    cautions.push("서류 내용과 실제 상황이 다를 수 있어 원본 대조가 필요합니다");
  }
  return [...new Set(cautions)].slice(0, 4);
}

function buildUnconfirmed(
  profile: ReturnType<typeof buildRealEstateSituationProfile>,
  path: RealEstateResolutionPath | null,
): string[] {
  const unconfirmed: string[] = [];
  if (!profile.property.value) unconfirmed.push("거래·물건 유형");
  if (
    !profile.parties.value &&
    (path === "PRE_CONTRACT" || path === "POST_DISPUTE")
  ) {
    unconfirmed.push("상대방·관계");
  }
  if (profile.documents.status === "unknown") {
    unconfirmed.push("서류와 실제 상황 대조");
  }
  if (profile.goal.status === "unknown") unconfirmed.push("확인 목적");
  if (profile.customerInput && profile.customerInput.length < 30) {
    unconfirmed.push("상황 설명 보완");
  }
  return [...new Set(unconfirmed)].slice(0, 4);
}

function buildActions(path: RealEstateResolutionPath | null): string[] {
  if (path === "PRE_CONTRACT") {
    return [
      "계약서·부속 서류의 핵심 조항을 직접 확인",
      "보증금·중도금 조건이 합의와 같은지 대조",
      "서명·공증·등기 필요 여부를 사전에 확인",
    ];
  }
  if (path === "POST_DISPUTE") {
    return [
      "분쟁 경과를 날짜 순으로 정리",
      "계약서·송금·메시지 등 증빙을 보관",
      "공식 대응 전 상대방 안내 내용을 확인",
    ];
  }
  if (path === "DOCUMENT_REVIEW") {
    return [
      "서류 원본과 번역본을 나란히 비교",
      "누락된 조항·금액·당사자 정보 확인",
      "기한·인도 조건이 실제 합의와 같은지 검토",
    ];
  }
  return [
    "현재 상황을 시간 순으로 정리",
    "관련 서류·증빙을 모아 보관",
    "어떤 검토가 필요한지 다시 확인",
  ];
}

/** 부동산 VERIFY FREE — Situation Profile 기반 1차 ONE RESULT 데이터 */
export function buildRealEstateFirstResult(
  answers: ReviewAnswers,
  evidenceFileName?: string | null,
): AdminVerifyFirstResultData {
  const profile = buildRealEstateSituationProfile(answers);
  const path = profile.resolutionPath;
  const cautions = buildCautions(profile, path);
  const unconfirmed = buildUnconfirmed(profile, path);
  const hasIssues = cautions.length > 0 || unconfirmed.length > 0;

  const baseSummary = buildSituationSummary(profile);
  const situationSummary = evidenceFileName
    ? `${baseSummary} · 참고 자료: ${evidenceFileName}`
    : baseSummary;

  const keyMetrics: AdminVerifyKeyMetric[] = [
    metricFromProfile("거래·물건", "물건·거래", profile.property.value, profile.property.status),
    metricFromProfile("상대·관계", "상대방", profile.parties.value, profile.parties.status),
    metricFromProfile("확인 목적", "검토 목적", profile.goal.value, profile.goal.status),
    metricFromProfile("서류 상태", "서류", profile.documents.value, profile.documents.status),
  ];

  const caseClassificationLabel =
    profile.claims.value ?? profile.transaction.value ?? "부동산 문서";

  return {
    stageLabel: pathStageLabel(path),
    statusHeadline: hasIssues
      ? "입력 내용 기준으로 추가 확인이 필요한 부분이 있습니다"
      : "입력 내용 기준으로 기본 상황 파악이 완료되었습니다",
    statusTone: hasIssues ? "caution" : "ok",
    situationSummary,
    gradeFilled: hasIssues ? 2 : 4,
    gradeLabel: hasIssues ? "주의 요망 (1차)" : "기본 확인 완료",
    keyMetrics,
    cautions,
    unconfirmed,
    actions: buildActions(path),
    referenceDateLabel: new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    caseClassificationLabel,
  };
}
