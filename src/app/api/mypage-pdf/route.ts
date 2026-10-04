import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { getRequiredDocuments } from "@/lib/requiredDocuments";
import {
  getCheckDiagnosis,
  type PermitInvestorType,
  type PermitCapital,
  type PermitOffice,
  type PermitResidentRep,
} from "@/lib/checkDiagnosis";
import { getDiagnosis as getVerifyDiagnosis, type VerifyCategory } from "@/lib/verifyDiagnosis";
import { buildAdminVerifyResponseSummaryBlock } from "@/lib/adminVerifyResponseSummary";
import { buildAdminVerifyAiReportContentFromActivities } from "@/lib/adminVerifyMypageFields";
import { buildMypagePdfDocumentFromLeadAndActivities } from "@/lib/mypagePdfExecutiveRender";
import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// STEP8 (Executive Decision Paper 고도화 — 데이터 소스·비즈니스 로직은
// 그대로 유지하고, 의사결정 중심 정보 구조와 문서 완성도만 개선했다):
// - src/lib/checkDiagnosis.ts / src/lib/verifyDiagnosis.ts / src/lib/requiredDocuments.ts
//   는 이번에도 한 글자도 수정하지 않았다. import해서 그대로 재호출만 한다.
// - 데이터 연결 방식은 STEP5·STEP6과 동일: 법인설립·VERIFY는 기존 결정론적
//   함수 재호출, CHECK는 expertBrief.checkedItems의 label/passed만 사용,
//   REGISTER 7종은 각 페이지의 비교식을 그대로 옮긴 설정표 사용.
// - ⚠️ expertBrief/expert_brief의 reason/riskLevel/rejectionRisks/
//   recommendedSteps/similarCases는 여전히 어디에서도 읽지 않는다.
// - "Executive Summary"는 새 AI 판단이 아니라, 기존 점수/체크결과/미충족
//   항목/준비서류 개수를 한 문단으로 조합한 것이다. VERIFY는 기존
//   report.incidentSummary/analysisOpinion을 그대로 이어붙인다.
// - "Key Risks"의 HIGH/MEDIUM/LOW 색상 표기는 VERIFY의 실제
//   report.riskFactors.level(critical/high/caution)이 있을 때만 붙인다.
//   CHECK·REGISTER·법인설립은 실제 등급 데이터가 없으므로(통과/미통과만
//   존재) 등급을 지어내지 않고 등급 표시 없이 항목만 나열한다.
// - 우측 "Executive Dashboard" 3카드는 영어+한글 제목만 바뀌었을 뿐 내부
//   데이터(필수서류/진행단계/주의사항)는 STEP6과 동일하다.
// - A4 세로 1페이지, 하단 안전영역(BODY_MIN_Y)·카드별 minY 이중 안전장치 유지.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 서비스 분류 (다른 admin/mypage 파일들과 동일 원칙, 이 파일에도 동일하게 복제) ──
function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company",
};

function normalizeServiceType(serviceType: string | null | undefined): string | null {
  if (!serviceType) return serviceType ?? null;
  return SERVICE_TYPE_ALIASES[serviceType] ?? serviceType;
}

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CHECK_SERVICE_TYPES = ["wp", "trc", "tamtru", "driving-license"];

function getCategory(serviceType: string | null | undefined): CategoryKey {
  const normalized = normalizeServiceType(serviceType);
  if (!normalized) return "unclassified";
  if (normalized === "consultation") return "consultation";
  const prefixKey = toPrefixKey(normalized);
  if (prefixKey.startsWith("verify")) return "verify";
  if (prefixKey.startsWith("permit")) return "register";
  if (prefixKey.startsWith("register")) return "register";
  if (CHECK_SERVICE_TYPES.includes(normalized)) return "check";
  return "unclassified";
}

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
  consultation: "일반 상담문의",
  permit_company: "법인설립",
  verify_admin: "행정문서 검토",
  "verify_real-estate": "부동산 문서 검토",
  verify_fraud: "사기문서 검토",
  verify_tax: "세무문서 검토",
  verify_unclear: "불확실한 서류 검토",
  register_restaurant: "식당허가",
  register_cosmetics: "화장품허가",
  register_environment: "환경허가",
  register_fire_safety: "소방허가",
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가",
  register_franchise: "프랜차이즈 등록",
};

function getServiceLabel(serviceType: string): string {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];
  if (key.startsWith("verify")) {
    const sub = key.replace(/^verify_?/, "");
    return sub ? `검토 · ${sub}` : "검토";
  }
  if (key.startsWith("permit") || key.startsWith("register")) {
    const sub = key.replace(/^(permit|register)_?/, "");
    return sub ? `허가 · ${sub}` : "허가";
  }
  return serviceType;
}

const RESULT_LABELS: Record<string, string> = {
  possible: "가능",
  conditional: "조건부 가능",
  impossible: "어려움",
};

// Executive Summary 문장에 쓰는 정성적 표현 — resultTone(기존에 이미 존재하는
// 분류값)을 자연스러운 문장으로 바꾼 것일 뿐, 새 판단 기준을 추가한 게 아니다.
const RESULT_QUALITATIVE: Record<string, string> = {
  possible: "높은",
  conditional: "중간",
  impossible: "낮은",
};

const RESULT_COLORS: Record<string, ReturnType<typeof rgb>> = {
  possible: rgb(0.02, 0.45, 0.32),
  conditional: rgb(0.7, 0.45, 0.02),
  impossible: rgb(0.7, 0.15, 0.15),
};

// ── VERIFY 서비스 키 → verifyDiagnosis.ts의 VerifyCategory 명시적 매핑.
const VERIFY_CATEGORY_MAP: Record<string, VerifyCategory> = {
  verify_admin: "admin",
  "verify_real-estate": "real-estate",
  verify_real_estate: "real-estate",
  verify_fraud: "fraud",
  verify_tax: "tax",
  verify_unclear: "unclear",
};

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asStringField(meta: Record<string, unknown> | null, key: string): string | null {
  const v = meta?.[key];
  return typeof v === "string" ? v : null;
}

const REAL_ESTATE_SITUATION_META_JSON_KEY = "real_estate_situation_profile_json";
const REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY = "real_estate_phase2_answers_json";
const CASE_RESOLUTION_META_JSON_KEY = "case_resolution_json";
const ADMIN_VERIFY_ANSWERS_META_JSON_KEY = "admin_verify_answers_json";
const ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY =
  "admin_phase2_documents_upload_complete";

type PdfActivityRow = { action: string | null; meta: unknown; created_at: string };

function findLatestMetaString(activities: PdfActivityRow[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const raw = asStringField(asMeta(activities[i]?.meta), key);
    if (raw?.trim()) return raw.trim();
  }
  return null;
}

function profileFieldValue(field: unknown): string | null {
  if (!field || typeof field !== "object") return null;
  const value = (field as { value?: unknown }).value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildVerifyMasterReportContent(
  normalizedType: string,
  activities: PdfActivityRow[],
  leadId?: string,
): {
  execSummary: string[];
  keyFindings: string[];
  keyRisks: string[];
  recommendedAction: string[];
  riskCount: number;
  reviewedCount: number;
  satisfiedCount: number;
  mandatoryDocumentLines?: string[];
  executiveDashboardSupplementLines?: string[];
} | null {
  const typeKey = normalizedType.replace(/-/g, "_");

  if (typeKey === "verify_real_estate") {
    const profileRaw = findLatestMetaString(activities, REAL_ESTATE_SITUATION_META_JSON_KEY);
    if (!profileRaw) return null;
    try {
      const profile = JSON.parse(profileRaw) as Record<string, unknown>;
      const headline =
        profileFieldValue(profile.risk) ??
        profileFieldValue(profile.goal) ??
        profileFieldValue(profile.claims) ??
        "1차 종합 검토 결과";
      const execSummary = [
        `결론 · ${headline}`,
        profileFieldValue(profile.documents)
          ? `서류 · ${profileFieldValue(profile.documents)}`
          : "서류 · 제출 정보 기준으로 1차 확인했습니다.",
      ];
      const keyFindings: string[] = ["■ 1차 확인 사항"];
      for (const [label, key] of [
        ["거래·물건", "property"],
        ["확인 목적", "goal"],
        ["핵심 사안", "claims"],
        ["서류 상태", "documents"],
        ["차이·문제", "facts"],
      ] as const) {
        const val = profileFieldValue(profile[key]);
        if (val) keyFindings.push(`✓ ${label} · ${val}`);
      }
      const phase2Raw = findLatestMetaString(activities, REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY);
      if (phase2Raw && phase2Raw !== "{}") {
        keyFindings.push("■ 2차 확인");
        try {
          const phase2 = JSON.parse(phase2Raw) as Record<string, string>;
          for (const [key, value] of Object.entries(phase2).slice(0, 8)) {
            if (value?.trim()) keyFindings.push(`✓ ${key} · ${value.trim()}`);
          }
        } catch {
          /* ignore malformed phase2 */
        }
      }
      const keyRisks = profileFieldValue(profile.risk)
        ? [`[주의] ${profileFieldValue(profile.risk)}`]
        : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];
      const recommendedAction = profileFieldValue(profile.goal)
        ? [`① 다음 조치 · ${profileFieldValue(profile.goal)}`]
        : ["① 다음 조치 · My Page에서 AI 리포트를 확인해 주세요."];
      const satisfiedCount = keyFindings.filter((line) => line.startsWith("✓")).length;
      return {
        execSummary,
        keyFindings,
        keyRisks,
        recommendedAction,
        riskCount: keyRisks.length,
        reviewedCount: keyFindings.length,
        satisfiedCount,
      };
    } catch {
      return null;
    }
  }

  if (typeKey === "verify_admin") {
    if (!leadId) return null;
    return buildAdminVerifyAiReportContentFromActivities(activities, leadId);
  }

  return null;
}

function formatDateDot(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// ── REGISTER 업종허가 7종 — 각 페이지의 compute*Diagnosis()에 이미 있는
//    3개 상태값 비교식을 그대로 옮긴 설정표. 값 자체는 손대지 않았다.
const REGISTER_STUB_CONFIG: Record<
  string,
  { facilityField: string; facilityLabel: string; readyField: string; readyLabel: string }
> = {
  register_restaurant: {
    facilityField: "premisesStatus",
    facilityLabel: "영업장(매장) 임대차 계약 확보",
    readyField: "hygieneFireStatus",
    readyLabel: "위생·소방 안전시설 준비",
  },
  register_cosmetics: {
    facilityField: "facilityStatus",
    facilityLabel: "제조·유통·보관 시설(창고) 확보",
    readyField: "safetyDataStatus",
    readyLabel: "제품 성분·안전성 평가자료 준비",
  },
  register_environment: {
    facilityField: "facilityStatus",
    facilityLabel: "배출시설·방지시설 설치 확보",
    readyField: "assessmentStatus",
    readyLabel: "환경영향평가서(또는 환경보호계획서) 준비",
  },
  register_fire_safety: {
    facilityField: "facilityStatus",
    facilityLabel: "소방시설(소화기·경보·스프링클러 등) 설치 확보",
    readyField: "safetyManagerStatus",
    readyLabel: "소방안전관리자 선임 및 소방계획서 준비",
  },
  register_hygiene: {
    facilityField: "facilityStatus",
    facilityLabel: "위생시설(조리·저장·세척 시설 등) 구비 확보",
    readyField: "staffHygieneStatus",
    readyLabel: "종사자 건강검진·위생교육 이수 준비",
  },
  register_medical_device: {
    facilityField: "facilityStatus",
    facilityLabel: "보관·유통시설(창고) 확보",
    readyField: "qualityDocStatus",
    readyLabel: "제품 분류·품질서류 준비",
  },
  register_franchise: {
    facilityField: "operatingHistoryStatus",
    facilityLabel: "직영점 운영 이력 확보",
    readyField: "contractManualStatus",
    readyLabel: "가맹계약서·운영매뉴얼 준비",
  },
};

type SimpleChecklistItem = { label: string; passed: boolean };
type Sections = {
  execSummary: string[];
  keyFindings: string[];
  keyRisks: string[];
  recommendedAction: string[];
  riskCount: number | null;
};

// CHECK 4종 / REGISTER 업종허가 7종 / 법인설립이 공유하는 빌더.
// "점수 + 체크리스트(label/passed만) + 준비서류"만 조합해서 Executive
// Summary/Key Findings/Key Risks/Recommended Action 4개 영역 문장을 만든다.
// 여기서 나오는 문장은 checklist 내용(서비스·고객마다 실제로 다름)에서만
// 나오며, 서비스명을 끼워 넣는 고정 템플릿이 아니다.
function buildChecklistSections(
  serviceLabel: string,
  feasibilityScore: number | null,
  resultTone: string | null,
  checklist: SimpleChecklistItem[],
  requiredDocs: { documents: string[] },
  customerNote: string | null
): Sections {
  const toneLabel = resultTone ? RESULT_LABELS[resultTone] ?? resultTone : null;
  const qualitative = resultTone ? RESULT_QUALITATIVE[resultTone] ?? null : null;
  const passed = checklist.filter((item) => item.passed);
  const failed = checklist.filter((item) => !item.passed);
  const reviewedCount = checklist.length;
  const readinessText =
    reviewedCount > 0 ? `${passed.length}/${reviewedCount}개 요건 확인` : "세부 요건 확인 전";

  // Executive Summary: 결론 → 근거 → 영향 → 권고
  const execSummary: string[] = [];

  if (typeof feasibilityScore === "number") {
    execSummary.push(
      `결론 · ${serviceLabel} 진행 가능성은 ${
        qualitative ? `${qualitative} 수준(${feasibilityScore}%)` : `${feasibilityScore}%`
      }으로 평가됩니다.`
    );

    if (reviewedCount > 0) {
      execSummary.push(
        `핵심 근거 · 검토된 ${reviewedCount}개 요건 중 ${passed.length}개가 확인되었고 ${failed.length}개는 추가 확인이 필요합니다.`
      );
    }

    if (failed.length > 0) {
      execSummary.push(
        `영향 · ${failed
          .slice(0, 2)
          .map((item) => item.label)
          .join(", ")}${failed.length > 2 ? ` 외 ${failed.length - 2}건` : ""}이 확인되지 않아 실제 접수 전 보완 검토가 필요합니다.`
      );
      execSummary.push(
        "권고 · 미확인 항목을 우선 준비한 뒤 서류 원본과 함께 전문가 최종 검토를 진행해 주세요."
      );
    } else if (reviewedCount > 0) {
      execSummary.push(
        "영향 · 현재 확인된 범위에서는 핵심 준비요건이 모두 충족되어 다음 서류 준비 단계로 진행할 수 있습니다."
      );
      execSummary.push(
        "권고 · 실제 제출 전 서류 원본, 유효기간 및 최신 행정기준을 최종 확인해 주세요."
      );
    }

    if (customerNote) {
      execSummary.push(`추가 안내 · ${customerNote}`);
    }

    if (requiredDocs.documents.length > 0) {
      execSummary.push(
        `제출 준비 · 필수 제출서류 ${requiredDocs.documents.length}종의 원본 상태와 유효기간을 확인해 주세요.`
      );
    }
  } else {
    execSummary.push("결론 · 현재 저장된 정보만으로는 최종 평가를 구성하기 어렵습니다.");
  }

  // Evidence: Confirmed / Outstanding
  const keyFindings: string[] = [];
  if (reviewedCount > 0) {
    keyFindings.push(`■ 확인 완료 · ${passed.length}/${reviewedCount}개 요건`);
    passed.slice(0, 4).forEach((item) => {
      keyFindings.push(`✓ ${item.label} · 확인 완료`);
    });

    if (failed.length > 0) {
      keyFindings.push(`■ 추가 확인 필요 · ${failed.length}건`);
      failed.slice(0, 3).forEach((item) => {
        keyFindings.push(`○ ${item.label} · 보완 필요`);
      });
    }
  } else {
    keyFindings.push("현재 연결된 세부 확인 데이터가 없습니다.");
  }

  // Risk: Issue -> Impact -> Recommendation
  const keyRisks: string[] = [];
  if (reviewedCount > 0) {
    if (failed.length > 0) {
      failed.slice(0, 2).forEach((item, index) => {
        keyRisks.push(`위험 ${index + 1} · ${item.label}`);
      });
      keyRisks.push(
        "영향 · 미확인 항목이 남아 있으면 실제 접수 전 추가 확인 또는 보완이 필요할 수 있습니다."
      );
      keyRisks.push(
        "대응 · 우선순위가 높은 항목부터 준비한 뒤 전문가 최종 검토를 진행해 주세요."
      );
    } else {
      keyRisks.push("위험 · 현재 확인된 요건 기준으로 별도 미확인 항목은 없습니다.");
      keyRisks.push(
        "영향 · 실제 제출 시 서류 유효기간 또는 최신 행정기준에 따라 추가 확인이 필요할 수 있습니다."
      );
      keyRisks.push(
        "대응 · 접수 전 서류 원본과 최신 기준을 한 번 더 확인해 주세요."
      );
    }
  } else {
    keyRisks.push("현재 연결된 위험요인 확인 데이터가 없습니다.");
  }

  // Actions: Immediate -> Next -> Final
  const recommendedAction: string[] = [];
  if (toneLabel) {
    recommendedAction.push(`현재 상태 · ${toneLabel} / ${readinessText}`);
  }

  const immediateAction =
    failed[0]?.label ??
    (requiredDocs.documents.length > 0 ? `${requiredDocs.documents[0]} 원본 확인` : null);

  const nextAction =
    failed[1]?.label ??
    (requiredDocs.documents.length > 1
      ? `${requiredDocs.documents.slice(0, 3).join(", ")} 준비 상태 확인`
      : null);

  if (immediateAction) {
    recommendedAction.push(`① 즉시 조치 · ${immediateAction}`);
  }
  if (nextAction) {
    recommendedAction.push(`② 다음 조치 · ${nextAction}`);
  }
  recommendedAction.push("③ 최종 조치 · 전문가 검토 후 최종 진행 여부 확인");

  return {
    execSummary,
    keyFindings,
    keyRisks,
    recommendedAction,
    riskCount: reviewedCount > 0 ? failed.length : null,
  };
}

// ── 진행단계 (기존 CRM 활동 로그 기반, 새 절차 아님) ──
type ProcessStep = { label: string; done: boolean };

function cascadeDone(rawDone: boolean[]): boolean[] {
  let lastTrueIndex = -1;
  rawDone.forEach((d, i) => {
    if (d) lastTrueIndex = i;
  });
  return rawDone.map((_, i) => i <= lastTrueIndex);
}

function buildProcessSteps(
  category: CategoryKey,
  hasDiagnosis: boolean,
  hasExpertReview: boolean,
  hasAgency: boolean,
  hasGovSubmit: boolean,
  hasPermitDone: boolean
): ProcessStep[] {
  if (category === "verify") {
    const done = cascadeDone([true, hasDiagnosis, hasExpertReview, false]);
    return [
      { label: "접수 완료", done: done[0] },
      { label: "AI 자체 진단", done: done[1] },
      { label: "전문가 검토 요청", done: done[2] },
      { label: "전문가 안내", done: done[3] },
    ];
  }
  if (category === "consultation") {
    const done = cascadeDone([true, false]);
    return [
      { label: "상담 접수", done: done[0] },
      { label: "담당자 확인", done: done[1] },
    ];
  }
  const done = cascadeDone([true, hasDiagnosis, hasExpertReview, hasAgency, hasGovSubmit, hasPermitDone]);
  return [
    { label: "접수 완료", done: done[0] },
    { label: "AI 진단 완료", done: done[1] },
    { label: "전문가 검토", done: done[2] },
    { label: "전문가 진행요청", done: done[3] },
    { label: "정부 제출", done: done[4] },
    { label: "허가 완료", done: done[5] },
  ];
}

// 마스터문서에 이미 명시된 기존 고지 문구(전 서비스 공통, 새로 만들지 않음).
const EXISTING_LEGAL_CHANGE_NOTICE =
  "베트남은 행정기관 통폐합과 법령 개정이 잦은 편이니, 진행 전 반드시 전문가와 상의하시기 바랍니다.";

// ⚠️ 여기서 쓰는 값은 checklist의 label(통과 여부만 있는 안전 필드)이나
// riskFactors의 label(고객용 report 필드)뿐이다. reason/rejectionRisks/
// recommendedSteps 등 전문가 전용 데이터는 이 함수들 어디에서도 참조하지 않는다.
function buildCautionLines(failed: SimpleChecklistItem[]): string[] {
  if (failed.length > 0) {
    return [
      "현재 준비가 확인되지 않은 항목",
      `${failed
        .slice(0, 2)
        .map((f) => f.label)
        .join(", ")}${failed.length > 2 ? ` 외 ${failed.length - 2}건` : ""}`,
      "해당 항목을 준비한 후 서류 원본과 함께 전문가 확인을 진행해 주세요.",
    ];
  }
  return [EXISTING_LEGAL_CHANGE_NOTICE];
}

function buildCautionLinesFromRiskFactors(riskFactors: { label: string }[]): string[] {
  if (riskFactors.length > 0) {
    return [
      "현재 확인된 위험요인",
      `${riskFactors
        .slice(0, 2)
        .map((r) => r.label)
        .join(", ")}${riskFactors.length > 2 ? ` 외 ${riskFactors.length - 2}건` : ""}`,
      "해당 항목을 서류 원본과 함께 전문가 확인을 진행해 주세요.",
    ];
  }
  return [EXISTING_LEGAL_CHANGE_NOTICE];
}


type ReportSupportData = {
  assessmentBasis: string[];
  primaryNextAction: string;
  currentStageLabel: string;
};

function buildReportSupportData(
  category: CategoryKey,
  hasDiagnosis: boolean,
  hasExpertReview: boolean,
  hasAgency: boolean,
  hasGovSubmit: boolean,
  hasPermitDone: boolean,
  cautionLines: string[],
  recommendedAction: string[],
  requiredDocsCount: number | null
): ReportSupportData {
  const currentStageLabel = hasPermitDone
    ? "허가 완료"
    : hasGovSubmit
      ? "정부 제출"
      : hasAgency
        ? "전문가 진행"
        : hasExpertReview
          ? "전문가 검토"
          : hasDiagnosis
            ? "진단 완료"
            : "진단 대기";

  const actionFromRecommendation = recommendedAction.find(
    (line) => line.startsWith("①") || line.startsWith("②") || line.startsWith("③")
  );
  const primaryNextAction =
    actionFromRecommendation?.replace(/^[①②③]\s*/, "").replace(/^다음 조치\s*·\s*/, "") ??
    cautionLines[1] ??
    cautionLines[0] ??
    "서류 원본 확인";

  const assessmentBasis =
    category === "verify"
      ? [
          "고객 입력 사건정보 및 제출자료",
          "고객용 문서검토 결과와 위험요인",
          "기존 VFBCAI 문서검토 규칙",
          `연결된 준비서류 ${requiredDocsCount ?? 0}종`,
        ]
      : [
          "고객 입력정보 및 확인 항목",
          "필수 제출서류 목록과 준비상태",
          "기존 VFBCAI 행정 진단 규칙",
          `연결된 준비서류 ${requiredDocsCount ?? 0}종`,
        ];

  return { assessmentBasis, primaryNextAction, currentStageLabel };
}

type ExecutiveDecision = {
  eyebrow: string;
  headline: string;
  subline: string;
  color: ReturnType<typeof rgb>;
  softColor: ReturnType<typeof rgb>;
};

function getExecutiveDecision(
  category: CategoryKey,
  resultTone: string | null,
  riskCount: number | null,
  hasDiagnosis: boolean
): ExecutiveDecision {
  if (!hasDiagnosis) {
    return {
      eyebrow: "평가 상태",
      headline: "평가 대기",
      subline: "진단 데이터가 확인되면 최종 판단이 표시됩니다.",
      color: rgb(0.42, 0.44, 0.5),
      softColor: rgb(0.965, 0.968, 0.975),
    };
  }

  if (category === "verify") {
    if ((riskCount ?? 0) > 0) {
      return {
        eyebrow: "EXECUTIVE DECISION",
        headline: "우선 검토 필요",
        subline: `확인된 위험요인 ${riskCount ?? 0}건을 중심으로 서류 원본 검토가 필요합니다.`,
        color: rgb(0.72, 0.34, 0.04),
        softColor: rgb(0.995, 0.965, 0.92),
      };
    }
    return {
      eyebrow: "EXECUTIVE DECISION",
      headline: "문서 검토 완료",
      subline: "현재 입력자료 기준으로 우선 검토가 완료되었습니다.",
      color: rgb(0.02, 0.45, 0.32),
      softColor: rgb(0.93, 0.985, 0.965),
    };
  }

  if (resultTone === "possible") {
    return {
      eyebrow: "EXECUTIVE DECISION",
      headline: "서류 준비 단계 진행",
      subline: "현재 확인된 조건을 기준으로 다음 서류 준비 단계 진행이 가능합니다.",
      color: rgb(0.02, 0.45, 0.32),
      softColor: rgb(0.93, 0.985, 0.965),
    };
  }

  if (resultTone === "conditional") {
    return {
      eyebrow: "EXECUTIVE DECISION",
      headline: "보완 후 진행",
      subline: "미확인 또는 미준비 항목을 보완한 후 최종 확인을 진행해 주세요.",
      color: rgb(0.72, 0.45, 0.02),
      softColor: rgb(0.995, 0.97, 0.92),
    };
  }

  if (resultTone === "impossible") {
    return {
      eyebrow: "EXECUTIVE DECISION",
      headline: "전문가 검토 필요",
      subline: "현재 입력정보만으로는 바로 진행하기 어려워 전문가 검토가 필요합니다.",
      color: rgb(0.7, 0.15, 0.15),
      softColor: rgb(0.995, 0.94, 0.94),
    };
  }

  return {
    eyebrow: "EXECUTIVE DECISION",
    headline: "문서 검토 필요",
    subline: "현재 자료를 기준으로 서류 확인과 최종 검토가 필요합니다.",
    color: rgb(0.09, 0.15, 0.35),
    softColor: rgb(0.95, 0.96, 0.985),
  };
}

const MAX_LINES_PER_AREA = 7;

export async function POST(req: NextRequest) {
  try {
    const { accessToken, leadId } = (await req.json()) as { accessToken?: string; leadId?: string };
    if (!accessToken || !leadId) {
      return NextResponse.json({ error: "요청 정보가 올바르지 않습니다." }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
    }
    const userId = userData.user.id;

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type, result, created_at, user_id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    // 고객명은 이 리포트에 출력하지 않으므로 profile(users.name) 조회는 하지 않는다.

    const { data: activitiesRaw } = await supabaseAdmin
      .from("crm_activities")
      .select("action, meta, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });
    const activities = activitiesRaw ?? [];
    const pdfBytes = await buildMypagePdfDocumentFromLeadAndActivities(
      { id: leadId, service_type: lead.service_type, result: lead.result, created_at: lead.created_at },
      activities,
      leadId,
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vfbcai-report-${leadId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("mypage-pdf route error:", err);
    return NextResponse.json({ error: "PDF 생성 중 문제가 발생했습니다." }, { status: 500 });
  }
}
