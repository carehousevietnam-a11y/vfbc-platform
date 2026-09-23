import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import {
  buildCaseResolutionProfile,
  getQ1ResolvedCase,
  type MasterCaseId,
} from "@/lib/adminVerifyProfiling";
import {
  buildRealEstateSituationProfile,
  type RealEstateResolutionPath,
} from "@/lib/realEstateVerifyProfiling";

export type VerifyFirstResultTransition = {
  hookHeadline: string;
  hookWhy: string;
  hookWho: string;
  hookWhatMore: string;
  trustLine: string;
};

type ResolveParams = {
  domain: "admin" | "real-estate";
  answers: ReviewAnswers;
  firstResultData: AdminVerifyFirstResultData;
};

function toneSuffix(isCaution: boolean): "caution" | "ok" {
  return isCaution ? "caution" : "ok";
}

const RE_HOOKS: Record<
  RealEstateResolutionPath,
  Record<"caution" | "ok", VerifyFirstResultTransition>
> = {
  PRE_CONTRACT: {
    caution: {
      hookHeadline: "계약 전에는 문서와 말이 같아 보여도, 서명 후에는 다를 수 있습니다.",
      hookWhy: "조항·등기·보증금 조건은 1차 요약만으로는 빠질 수 있습니다.",
      hookWho: "계약 직전·계약금·중요 조건을 확인 중인 경우",
      hookWhatMore: "거래 단계·조항·금액 조건을 내 상황에 맞게 정리합니다.",
      trustLine: "지금 1차 결과만으로도 기본 확인은 충분할 수 있습니다.",
    },
    ok: {
      hookHeadline: "지금은 큰 위험 신호가 보이지 않지만, 서명 전 한 번 더 좁혀 볼 여지는 있습니다.",
      hookWhy: "계약 조건은 1차 요약만으로는 세부가 빠질 수 있습니다.",
      hookWho: "계약 전 마지막으로 조건을 점검하고 싶은 경우",
      hookWhatMore: "조항·등기·금액 조건을 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
  POST_DISPUTE: {
    caution: {
      hookHeadline: "분쟁이 시작된 뒤에는 증빙과 경과가 결과를 좌우합니다.",
      hookWhy: "송금·메시지·계약 차이는 사건마다 달라 추가 확인이 필요합니다.",
      hookWho: "분쟁·환불·상대방 설명과 문서가 다른 경우",
      hookWhatMore: "경과·증빙·주장 차이를 통합 소견으로 정리합니다.",
      trustLine: "1차 결과로 방향은 잡을 수 있습니다. 더 꼼꼼히 보려면 개인 상세 검토를 선택하세요.",
    },
    ok: {
      hookHeadline: "지금은 급한 불이익 신호는 적지만, 분쟁 경과는 사건마다 다릅니다.",
      hookWhy: "증빙·타임라인을 좁히면 다음 대응이 분명해집니다.",
      hookWho: "분쟁 초기·대응 방향을 정리하고 싶은 경우",
      hookWhatMore: "핵심 사실·증빙·상대 관계를 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 기본 확인은 충분할 수 있습니다.",
    },
  },
  DOCUMENT_REVIEW: {
    caution: {
      hookHeadline: "번역본만으로 판단하면 원문과 다른 해석이 나올 수 있습니다.",
      hookWhy: "원본 대조·번역 이슈는 세부 답변 후 더 정확해집니다.",
      hookWho: "서류 불일치·번역·권리관계를 확인 중인 경우",
      hookWhatMore: "서류 신뢰도·번역·원본 대조를 반영한 판단을 정리합니다.",
      trustLine: "1차 결과로 큰 방향은 확인했습니다. 더 정밀히 보려면 개인 상세 검토를 선택하세요.",
    },
    ok: {
      hookHeadline: "문서 표면상 큰 문제는 보이지 않지만, 원문 대조는 별도 확인이 필요할 수 있습니다.",
      hookWhy: "번역·원본 차이는 1차 요약만으로는 끝나지 않을 수 있습니다.",
      hookWho: "받은 서류·계약서를 꼼꼼히 대조하고 싶은 경우",
      hookWhatMore: "원본·번역·조항을 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 기본 확인은 충분할 수 있습니다.",
    },
  },
  UNCLEAR: {
    caution: {
      hookHeadline: "상황이 아직 넓게 잡혀 있으면, 핵심만 좁혀야 다음 판단이 가능합니다.",
      hookWhy: "사실·상대·기한을 잠그면 맞춤 검토가 가능합니다.",
      hookWho: "무엇을 먼저 확인해야 할지 불분명한 경우",
      hookWhatMore: "핵심 사실·상대·기한을 좁힌 뒤 맞춤 검토를 정리합니다.",
      trustLine: "1차 결과로 방향을 잡았다면 여기서 멈춰도 됩니다.",
    },
    ok: {
      hookHeadline: "아직 상황이 넓게 잡혀 있어, 좁혀 보면 다음 단계가 분명해질 수 있습니다.",
      hookWhy: "핵심 사실을 잠그면 불필요한 걱정을 줄일 수 있습니다.",
      hookWho: "상황·서류·상대방 설명이 아직 정리되지 않은 경우",
      hookWhatMore: "확인 경로·우선순위를 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
};

const ADMIN_HOOKS: Record<
  Exclude<MasterCaseId, "UNIVERSAL">,
  Record<"caution" | "ok", VerifyFirstResultTransition>
> = {
  CASE_01: {
    caution: {
      hookHeadline: "통지 내용과 내가 아는 상황이 다르면, 기한 전에 좁혀 보는 것이 중요합니다.",
      hookWhy: "위반·문제 통지는 기한·대응 범위를 놓치면 불이익으로 이어질 수 있습니다.",
      hookWho: "위반·문제 통지를 받은 경우",
      hookWhatMore: "통지 내용·기한·대응 방향을 맞춤 정리합니다.",
      trustLine: "1차 결과로 기본 확인은 충분할 수 있습니다.",
    },
    ok: {
      hookHeadline: "지금은 급한 불이익 신호는 적지만, 통지 내용은 사건마다 다릅니다.",
      hookWhy: "기한·대응 범위를 좁히면 다음 행동이 분명해집니다.",
      hookWho: "위반·문제 통지를 받았고 방향을 정리하고 싶은 경우",
      hookWhatMore: "통지·기한·대응 포인트를 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
  CASE_02: {
    caution: {
      hookHeadline: "납부 요구는 금액·근거·기한을 함께 봐야 합니다.",
      hookWhy: "납부 여부·재요구 조건은 1차 요약만으로는 부족할 수 있습니다.",
      hookWho: "납부·벌금 요구 서류를 받은 경우",
      hookWhatMore: "금액·납부 여부·재요구 조건을 심화 확인합니다.",
      trustLine: "1차 결과로 방향은 잡을 수 있습니다.",
    },
    ok: {
      hookHeadline: "납부 요구는 형식상 단순해 보여도, 금액·근거 확인이 필요할 수 있습니다.",
      hookWhy: "납부 조건·기한을 좁히면 불필요한 납부를 줄일 수 있습니다.",
      hookWho: "납부 요구를 받고 확인 중인 경우",
      hookWhatMore: "금액·근거·기한을 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 기본 확인은 충분할 수 있습니다.",
    },
  },
  CASE_03: {
    caution: {
      hookHeadline: "출석·소명 요구는 일정과 범위를 놓치면 불이익으로 이어질 수 있습니다.",
      hookWhy: "소명 범위·증빙 준비는 사건마다 달라 추가 확인이 필요합니다.",
      hookWho: "출석·소명 요구를 받은 경우",
      hookWhatMore: "일정·소명 범위·증빙 준비를 맞춤 정리합니다.",
      trustLine: "1차 결과로 기본 확인은 충분할 수 있습니다.",
    },
    ok: {
      hookHeadline: "출석·소명 요구는 일정만 보면 놓치기 쉬운 조건이 있습니다.",
      hookWhy: "범위·증빙을 좁히면 대응 부담을 줄일 수 있습니다.",
      hookWho: "출석·소명 일정을 확인 중인 경우",
      hookWhatMore: "일정·소명·증빙 포인트를 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
  CASE_04: {
    caution: {
      hookHeadline: "보완·추가 제출 요구는 누락 항목과 기한을 함께 봐야 합니다.",
      hookWhy: "보완 항목·제출 기한은 1차 요약만으로는 부족할 수 있습니다.",
      hookWho: "보완·추가 제출 요구를 받은 경우",
      hookWhatMore: "보완 항목·기한·누락 서류를 맞춤 확인합니다.",
      trustLine: "1차 결과로 우선순위는 잡을 수 있습니다.",
    },
    ok: {
      hookHeadline: "보완 요구는 항목별로 빠지기 쉬워, 좁혀 보면 도움이 됩니다.",
      hookWhy: "제출 기한·누락 항목을 정리하면 재요구를 줄일 수 있습니다.",
      hookWho: "보완·추가 제출을 준비 중인 경우",
      hookWhatMore: "보완 항목·기한을 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 기본 확인은 충분할 수 있습니다.",
    },
  },
  CASE_05: {
    caution: {
      hookHeadline: "처분·조치 통지는 유형과 후속 절차를 함께 봐야 합니다.",
      hookWhy: "처분 유형·이의·후속 절차는 사건마다 달라 추가 확인이 필요합니다.",
      hookWho: "처분·조치 통지를 받은 경우",
      hookWhatMore: "처분 유형·이의·후속 절차를 맞춤 검토합니다.",
      trustLine: "1차 결과로 방향은 잡을 수 있습니다.",
    },
    ok: {
      hookHeadline: "처분 통지는 형식상 단순해 보여도, 후속 절차 확인이 필요할 수 있습니다.",
      hookWhy: "처분 유형·기한을 좁히면 다음 행동이 분명해집니다.",
      hookWho: "처분·조치 통지를 확인 중인 경우",
      hookWhatMore: "처분·이의·후속 절차를 맞춤 정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
  CASE_06: {
    caution: {
      hookHeadline: "문서 성격이 불분명하면, 먼저 종류와 요구 행위를 좁혀야 합니다.",
      hookWhy: "문서 종류·요구 행위를 정리하지 않으면 잘못된 대응으로 이어질 수 있습니다.",
      hookWho: "받은 문서의 성격·요구 내용이 불분명한 경우",
      hookWhatMore: "문서 종류·요구 행위를 좁힌 뒤 맞춤 검토를 정리합니다.",
      trustLine: "1차 결과로 큰 방향은 확인했습니다.",
    },
    ok: {
      hookHeadline: "아직 문서 성격이 넓게 잡혀 있어, 좁혀 보면 다음 판단이 쉬워집니다.",
      hookWhy: "종류·요구 행위를 잠그면 불필요한 걱정을 줄일 수 있습니다.",
      hookWho: "무슨 문서인지·무엇을 해야 하는지 정리하고 싶은 경우",
      hookWhatMore: "문서·요구·CASE를 맞춤 재정리합니다.",
      trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
    },
  },
};

export function resolveVerifyPaidTransitionHooks({
  domain,
  answers,
  firstResultData,
}: ResolveParams): VerifyFirstResultTransition {
  const tone = toneSuffix(firstResultData.statusTone === "caution");

  if (domain === "real-estate") {
    const profile = buildRealEstateSituationProfile(answers);
    const path = profile.resolutionPath ?? "UNCLEAR";
    return RE_HOOKS[path][tone];
  }

  const caseId = getQ1ResolvedCase(answers);
  if (
    caseId === "CASE_01" ||
    caseId === "CASE_02" ||
    caseId === "CASE_03" ||
    caseId === "CASE_04" ||
    caseId === "CASE_05" ||
    caseId === "CASE_06"
  ) {
    return ADMIN_HOOKS[caseId][tone];
  }

  const profile = buildCaseResolutionProfile(answers);
  const fallbackLabel = profile.document.value ?? "행정문서";
  return {
    hookHeadline: `${fallbackLabel} 관련해서, 지금 확인한 내용을 한 번 더 좁혀 볼 여지가 있습니다.`,
    hookWhy: "기한·요구 행위·대응 범위는 1차 요약만으로는 부족할 수 있습니다.",
    hookWho: "행정문서를 받고 다음 행동을 정리하고 싶은 경우",
    hookWhatMore: "내 상황·서류·기한을 맞춤 정리합니다.",
    trustLine: "무료 1차 결과만으로도 지금 단계의 확인은 충분할 수 있습니다.",
  };
}

/** Compact AI-style summary from existing 1차 result data — no new profile fields. */
export function buildVerifyFirstResultAiSummary(data: AdminVerifyFirstResultData): {
  headline: string;
  paragraphs: string[];
  bullets: string[];
} {
  const paragraphs = [data.situationSummary].filter(Boolean);
  if (data.cautions.length > 0) {
    paragraphs.push(`주의: ${data.cautions.slice(0, 2).join(" · ")}`);
  }
  const bullets = [
    ...data.keyMetrics.slice(0, 3).map((m) => `${m.label}: ${m.title}`),
    ...data.actions.slice(0, 2).map((a) => a),
  ].filter(Boolean);
  return {
    headline: data.statusHeadline,
    paragraphs,
    bullets,
  };
}
