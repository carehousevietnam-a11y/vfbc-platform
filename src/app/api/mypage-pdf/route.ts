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
  const passed = checklist.filter((c) => c.passed);
  const failed = checklist.filter((c) => !c.passed);

  // ── Executive Summary ──
  const execSummary: string[] = [];
  if (typeof feasibilityScore === "number") {
    execSummary.push(
      `제출하신 자료를 종합 분석한 결과, ${serviceLabel} 진행 가능성은 ${
        qualitative ? `${qualitative} 수준(${feasibilityScore}%)으로` : `${feasibilityScore}%로`
      } 평가됩니다.`
    );
    if (checklist.length > 0) {
      if (failed.length > 0) {
        execSummary.push(
          `현재 확인된 항목 가운데 ${failed
            .slice(0, 2)
            .map((f) => f.label)
            .join(", ")}${failed.length > 2 ? ` 외 ${failed.length - 2}건` : ""}만 추가 준비가 필요합니다.`
        );
        execSummary.push("현재 판단의 핵심 변수는 위 미확인 항목이며, 해당 자료를 준비한 후 서류 원본 기준의 최종 확인이 필요합니다.");
      } else {
        execSummary.push(`확인된 ${checklist.length}개 항목을 모두 충족했으며, 현재 입력정보 범위에서는 별도 보완항목이 확인되지 않았습니다.`);
        execSummary.push("다만 실제 제출 전에는 서류 원본과 최신 행정요건을 기준으로 최종 확인해 주세요.");
      }
    }
    if (customerNote) execSummary.push(customerNote);
    if (requiredDocs.documents.length > 0) {
      execSummary.push(`준비서류는 총 ${requiredDocs.documents.length}종이 확인되며, 상세 목록은 우측을 참고해 주세요.`);
    }
  } else {
    execSummary.push("아직 AI 진단 결과가 없습니다.");
  }

  // ── Key Findings (확인 완료 / 추가 확인 필요) ──
  const keyFindings: string[] = [];
  if (checklist.length > 0) {
    if (passed.length > 0) {
      keyFindings.push("■ 확인 완료");
      passed.slice(0, 4).forEach((p) => keyFindings.push(`✓  ${p.label}`));
    }
    if (failed.length > 0) {
      keyFindings.push("■ 추가 확인 필요");
      failed.slice(0, 4).forEach((f) => keyFindings.push(`○ REVIEW  ${f.label}`));
    }
  } else {
    keyFindings.push("아직 이 항목에 연결된 확인 데이터가 없습니다.");
  }

  // ── Key Risks ── (등급 데이터가 없어 HIGH/MEDIUM/LOW를 붙이지 않는다 — 아래 참고)
  const keyRisks: string[] = [];
  if (checklist.length > 0) {
    if (failed.length > 0) {
      failed.slice(0, 4).forEach((f, idx) => {
        keyRisks.push(`PRIORITY ${idx + 1}  ${f.label} — 입력하신 답변 기준으로 준비 여부가 아직 확인되지 않았습니다.`);
      });
      keyRisks.push("위 항목을 먼저 준비한 후 서류 원본과 함께 전문가 확인을 진행해 주세요.");
    } else {
      keyRisks.push("확인된 항목은 모두 충족되어 현재 시점 기준으로는 별도 위험요인이 발견되지 않았습니다.");
    }
  } else {
    keyRisks.push("아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다.");
  }

  // ── Recommended Action ──
  const recommendedAction: string[] = [];
  recommendedAction.push(
    toneLabel
      ? `현재 제출정보 기준 판단은 '${toneLabel}'입니다. 아래 조치를 우선순위대로 진행해 주세요.`
      : "현재 제출정보를 기준으로 아래 조치를 우선순위대로 진행해 주세요."
  );
  const recommendations: string[] = [];
  for (const f of failed.slice(0, 2)) recommendations.push(f.label);
  if (requiredDocs.documents.length > 0) recommendations.push(`준비 서류: ${requiredDocs.documents.slice(0, 3).join(", ")}`);
  const circled = ["①", "②", "③"];
  recommendations.slice(0, 3).forEach((r, idx) => recommendedAction.push(`${circled[idx]} ${r}`));
  recommendedAction.push("모든 항목을 준비하신 후에는 전문가 상담을 통해 최종 확인을 진행해 주세요.");
  if (recommendations.length === 0 && failed.length === 0 && requiredDocs.documents.length === 0) {
    recommendedAction.length = 0;
    recommendedAction.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");
  }

  return { execSummary, keyFindings, keyRisks, recommendedAction, riskCount: checklist.length > 0 ? failed.length : null };
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
    ? "Permit completed"
    : hasGovSubmit
      ? "Government submission"
      : hasAgency
        ? "Professional processing"
        : hasExpertReview
          ? "Expert review"
          : hasDiagnosis
            ? "Assessment complete"
            : "Assessment pending";

  const actionFromRecommendation = recommendedAction.find(
    (line) => line.startsWith("①") || line.startsWith("②") || line.startsWith("③")
  );
  const primaryNextAction =
    actionFromRecommendation?.replace(/^[①②③]\s*/, "") ??
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
    const actions = new Set(activities.map((a) => a.action));

    const hasDiagnosis = activities.some(
      (a) => a.action === "verify_lead" || (a.action ?? "").endsWith("_diagnosis_lead")
    );
    const hasExpertReview = actions.has("expert_review_request");
    const hasAgency = actions.has("agency_upgrade_request");
    const hasGovSubmit = actions.has("process_government_submitted");
    const hasPermitDone = actions.has("process_permit_completed");

    // 진단 활동의 meta(가장 최근 것)를 원본 데이터 소스로 사용.
    let diagMeta: Record<string, unknown> | null = null;
    for (const a of activities) {
      const action = a.action as string | null;
      if (action && (action.endsWith("_diagnosis_lead") || action === "verify_lead")) {
        const m = asMeta(a.meta);
        if (m) diagMeta = m;
      }
    }

    let feasibilityScore: number | null = null;
    if (typeof diagMeta?.feasibilityScore === "number") feasibilityScore = diagMeta.feasibilityScore as number;

    const normalizedType = normalizeServiceType(lead.service_type);
    const category = getCategory(normalizedType);
    const serviceLabel = getServiceLabel(normalizedType ?? lead.service_type ?? "");
    const resultTone = lead.result as string | null;
    const resultColor = (resultTone && RESULT_COLORS[resultTone]) || rgb(0.3, 0.3, 0.3);

    // ── Executive Report 4영역 + 카드용 부가값 계산 ──
    let execSummary: string[] = ["아직 AI 진단 결과가 없습니다."];
    let keyFindings: string[] = [];
    let keyRisks: string[] = [];
    let recommendedAction: string[] = [];
    let riskCount: number | null = null;
    let estimatedDaysText = "서류 확인 후 안내";
    let requiredDocsCount: number | null = null;
    let requiredDocsList: string[] = [];
    let cautionLines: string[] = [EXISTING_LEGAL_CHANGE_NOTICE];
    let reviewedCount: number | null = null;
    let satisfiedCount: number | null = null;

    if (category === "check") {
      // ⚠️ expertBrief에서 label/passed만 추출. reason/riskLevel/rejectionRisks/
      // recommendedSteps/similarCases는 아래 어디에서도 읽지 않는다.
      const expertBriefRaw = asMeta(diagMeta?.["expertBrief"]);
      const checkedItemsRaw = Array.isArray(expertBriefRaw?.["checkedItems"])
        ? (expertBriefRaw!["checkedItems"] as Array<Record<string, unknown>>)
        : [];
      const checklist: SimpleChecklistItem[] = checkedItemsRaw
        .map((it) => ({
          label: typeof it.label === "string" ? it.label : "",
          passed: Boolean(it.passed),
        }))
        .filter((it) => it.label.length > 0);
      const requiredDocs = getRequiredDocuments(normalizedType ?? undefined);
      requiredDocsCount = requiredDocs.documents.length;
      requiredDocsList = requiredDocs.documents;
      reviewedCount = checklist.length;
      satisfiedCount = checklist.filter((item) => item.passed).length;
      const built = buildChecklistSections(serviceLabel, feasibilityScore, resultTone, checklist, requiredDocs, null);
      ({ execSummary, keyFindings, keyRisks, recommendedAction, riskCount } = built);
      cautionLines = buildCautionLines(checklist.filter((c) => !c.passed));
      // estimatedDays는 원본 입력값이 저장되지 않아 재계산 불가 — 정직하게 고정 안내.
    } else if (category === "register" && normalizedType === "permit_company") {
      const investorType = asStringField(diagMeta, "investorType") as PermitInvestorType | null;
      const capital = asStringField(diagMeta, "capital") as PermitCapital | null;
      const office = asStringField(diagMeta, "office") as PermitOffice | null;
      const residentRep = asStringField(diagMeta, "residentRep") as PermitResidentRep | null;
      const documentService = asStringField(diagMeta, "documentService") ?? "permit_company";
      const requiredDocs = getRequiredDocuments(documentService);
      requiredDocsCount = requiredDocs.documents.length;
      requiredDocsList = requiredDocs.documents;

      if (investorType && capital && office && residentRep) {
        const recomputed = await getCheckDiagnosis({
          service: "permit_company",
          investorType,
          capital,
          office,
          residentRep,
        });
        if (recomputed) {
          const cv = recomputed.customerView;
          reviewedCount = cv.checklist.length;
          satisfiedCount = cv.checklist.filter((item) => item.passed).length;
          const built = buildChecklistSections(serviceLabel, cv.feasibilityScore, cv.resultTone, cv.checklist, requiredDocs, cv.note);
          ({ execSummary, keyFindings, keyRisks, recommendedAction, riskCount } = built);
          cautionLines = buildCautionLines(cv.checklist.filter((c) => !c.passed));
          if (cv.estimatedDays) estimatedDaysText = `${cv.estimatedDays.min}~${cv.estimatedDays.max}일`;
        }
      } else if (typeof feasibilityScore === "number") {
        execSummary = [`입력하신 정보를 기준으로 종합 판단 점수는 ${feasibilityScore}%입니다.`];
        keyFindings = ["아직 이 항목에 연결된 확인 데이터가 없습니다."];
        keyRisks = ["아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다."];
        recommendedAction = ["아직 이 항목에 연결된 권고 데이터가 없습니다."];
      }
    } else if (category === "register" && normalizedType && REGISTER_STUB_CONFIG[normalizedType]) {
      const cfg = REGISTER_STUB_CONFIG[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsCount = requiredDocs.documents.length;
      requiredDocsList = requiredDocs.documents;
      const checklist: SimpleChecklistItem[] = diagMeta
        ? [
            { label: "사업자·법인 등록 서류 준비", passed: asStringField(diagMeta, "registrationStatus") === "confirmed" },
            { label: cfg.facilityLabel, passed: asStringField(diagMeta, cfg.facilityField) === "secured" },
            { label: cfg.readyLabel, passed: asStringField(diagMeta, cfg.readyField) === "ready" },
          ]
        : [];
      reviewedCount = checklist.length;
      satisfiedCount = checklist.filter((item) => item.passed).length;
      const built = buildChecklistSections(serviceLabel, feasibilityScore, resultTone, checklist, requiredDocs, null);
      ({ execSummary, keyFindings, keyRisks, recommendedAction, riskCount } = built);
      cautionLines = buildCautionLines(checklist.filter((c) => !c.passed));
    } else if (category === "verify" && normalizedType) {
      const verifyCategory = VERIFY_CATEGORY_MAP[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsCount = requiredDocs.documents.length;
      requiredDocsList = requiredDocs.documents;

      if (verifyCategory) {
        const incidentType = asStringField(diagMeta, "incident_type") ?? undefined;
        const incidentDescription = asStringField(diagMeta, "incident_description") ?? undefined;
        const fileUrl = asStringField(diagMeta, "file_url");
        const fileName = asStringField(diagMeta, "file_name");

        const diag = await getVerifyDiagnosis(verifyCategory, {
          fileUrl,
          fileName,
          incidentType,
          incidentDescription,
        });

        const report = diag.report;
        if (report) {
          // ── Executive Summary ──
          execSummary = [report.incidentSummary, report.analysisOpinion];
          execSummary.push(
            report.riskFactors.length > 0
              ? `확인된 위험요인은 총 ${report.riskFactors.length}건입니다.`
              : "현재 시점 기준으로 별도 위험요인이 확인되지 않았습니다."
          );
          if (report.recommendedActions.length > 0) {
            execSummary.push(`권장 조치는 총 ${report.recommendedActions.length}건이며, 아래 Recommended Action을 참고해 주세요.`);
          }

          // ── Key Findings (법률 분야 + 실무 안내) ──
          keyFindings = [];
          if (report.legalAreas.length > 0) {
            keyFindings.push("■ 관련 법률 분야");
            for (const la of report.legalAreas.slice(0, 3)) keyFindings.push(`✓ [${la.area}] ${la.note}`);
          }
          const practiceLines = [report.legalApplicabilityNote, report.legalUpdateNotice, report.practiceNotes].filter(Boolean);
          if (practiceLines.length > 0) {
            keyFindings.push("■ 실무 안내");
            practiceLines.forEach((p) => keyFindings.push(`○ ${p}`));
          }
          if (keyFindings.length === 0) keyFindings.push("아직 이 항목에 연결된 법령·행정기준 데이터가 없습니다.");

          // ── Key Risks (실제 등급 데이터가 있으므로 HIGH/MEDIUM/LOW 표기) ──
          keyRisks =
            report.riskFactors.length > 0
              ? report.riskFactors.slice(0, 5).map((r) => {
                  const tag = r.level === "critical" ? "[HIGH · 치명적]" : r.level === "high" ? "[MEDIUM · 높음]" : "[LOW · 주의]";
                  return `${tag} ${r.label}`;
                })
              : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];
          if (report.riskFactors.length > 0) keyRisks.push("우선순위가 높은 항목부터 서류 원본과 함께 보완해 주세요.");

          // ── Recommended Action ──
          recommendedAction = report.recommendedActions.slice(0, 3).map((a, idx) => `${["①", "②", "③"][idx]} ${a}`);
          if (report.expertReviewRecommendation) recommendedAction.push(report.expertReviewRecommendation);
          if (recommendedAction.length === 0) recommendedAction.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");

          riskCount = report.riskFactors.length;
          reviewedCount = Math.max(report.keyFindings.length, report.legalAreas.length);
          satisfiedCount = Math.max(0, (reviewedCount ?? 0) - report.riskFactors.length);
          cautionLines = buildCautionLinesFromRiskFactors(report.riskFactors);
        } else {
          // report가 없는 예외 상황(구버전 데이터 등) — 고객에게 이미 노출되는
          // 최상위 안전 필드(headline/checklist/note)만 사용, 지어내지 않음.
          execSummary = [diag.headline];
          keyFindings =
            diag.checklist.length > 0
              ? diag.checklist.slice(0, 5).map((c) => `[${c.level}] ${c.label}`)
              : ["아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다."];
          keyRisks = ["아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다."];
          recommendedAction = [diag.note];
        }
      }
    }

    if (typeof feasibilityScore !== "number" && execSummary.length === 0) {
      execSummary = ["아직 AI 진단 결과가 없습니다."];
    }

    const aiStatusText = hasDiagnosis ? "진단 완료" : "진단 전";
    // "AI Confidence"는 실제로 존재하지 않는 개념(feasibilityScore는 모델
    // 신뢰도가 아니라 허가·진행 가능성 점수)이라 쓰지 않는다. VERIFY는 애초에
    // 수치 점수 개념 자체가 없으므로(verifyDiagnosis.ts 어디에도 점수 필드
    // 없음) 정직한 서비스 전용 상태 문구를 고정으로 쓴다.
    const possibilityText =
      category === "verify" ? "문서 검토" : typeof feasibilityScore === "number" ? `${feasibilityScore}%` : "확인 전";
    const headerStatusLabel = category === "verify" ? "검토유형" : "판단결과";
    const possibilityCardLabel = category === "verify" ? "검토유형" : "가능성";
    const riskCardText = riskCount !== null ? `${riskCount}건` : "확인 전";
    const docsCardText = requiredDocsCount !== null ? `${requiredDocsCount}종` : "확인 전";
    const requirementsText =
      reviewedCount !== null && reviewedCount > 0 && satisfiedCount !== null
        ? `${satisfiedCount}/${reviewedCount}`
        : "확인 전";
    const executiveDecision = getExecutiveDecision(category, resultTone, riskCount, hasDiagnosis);

    const processSteps = buildProcessSteps(category, hasDiagnosis, hasExpertReview, hasAgency, hasGovSubmit, hasPermitDone);
    const supportData = buildReportSupportData(
      category,
      hasDiagnosis,
      hasExpertReview,
      hasAgency,
      hasGovSubmit,
      hasPermitDone,
      cautionLines,
      recommendedAction,
      requiredDocsCount
    );

    // ── PDF 생성 (A4 세로 1페이지 고정) ──
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const regularBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Regular.ttf"));
    const boldBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf"));
    const font = await doc.embedFont(regularBytes);
    const fontBold = await doc.embedFont(boldBytes);

    const watermarkBytes = fs.readFileSync(path.join(process.cwd(), "public/vfbcai-shield-logo.png"));
    const watermarkImage = await doc.embedPng(watermarkBytes);

    const pageWidth = 595.28; // A4
    const pageHeight = 841.89; // A4
    const marginX = 40;
    const contentWidth = pageWidth - marginX * 2;

    const page = doc.addPage([pageWidth, pageHeight]);

    // A4 1페이지 하단 안전영역 — 이 y값 아래로는 어떤 본문도 그리지 않는다.
    const BODY_MIN_Y = 118;

    // ── 배경: Shield + 대형 "VFBCAI" 텍스트 워터마크 (본문보다 먼저 그려서 뒤에 깔림) ──
    page.drawRectangle({ x: 0, y: pageHeight - 4, width: pageWidth, height: 4, color: rgb(0.09, 0.15, 0.35) });

    const wmShieldSize = 260;
    page.drawImage(watermarkImage, {
      x: (pageWidth - wmShieldSize) / 2,
      y: pageHeight / 2 - wmShieldSize / 2 + 60,
      width: wmShieldSize,
      height: wmShieldSize,
      opacity: 0.035,
    });
    const wmText = "VFBCAI";
    const wmTextSize = 108;
    const wmTextWidth = fontBold.widthOfTextAtSize(wmText, wmTextSize);
    page.drawText(wmText, {
      x: (pageWidth - wmTextWidth) / 2,
      y: pageHeight / 2 - 140,
      size: wmTextSize,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
      opacity: 0.035,
    });

    function wrapLines(text: string, size: number, useFont: PDFFont, maxWidth: number): string[] {
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (useFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      if (current) lines.push(current);
      return lines.length > 0 ? lines : [""];
    }

    function drawBadge(cx: number, cy: number, radius: number, color: ReturnType<typeof rgb>, symbol: string) {
      page.drawCircle({ x: cx, y: cy, size: radius, color });
      const symSize = radius * 1.05;
      const tw = fontBold.widthOfTextAtSize(symbol, symSize);
      page.drawText(symbol, { x: cx - tw / 2, y: cy - symSize * 0.35, size: symSize, font: fontBold, color: rgb(1, 1, 1) });
    }

    // 특정 접두어로 시작하는 줄은 글꼴/색을 다르게 그려 "텍스트 계층"을 준다.
    // ■ 그룹 헤더, ①②③ 번호, [HIGH]/[MEDIUM]/[LOW] 위험도 태그만 대상이며,
    // 그 외 줄은 호출부가 넘긴 기본 글꼴/색을 그대로 쓴다 — 새 정보를 넣는
    // 것이 아니라 이미 있는 문장의 시각적 강조만 다르게 한다.
    function styleForLine(
      line: string,
      defaultFont: PDFFont,
      defaultColor: ReturnType<typeof rgb>
    ): { useFont: PDFFont; color: ReturnType<typeof rgb> } {
      if (line.startsWith("■")) return { useFont: fontBold, color: rgb(0.09, 0.15, 0.35) };
      if (line.startsWith("①") || line.startsWith("②") || line.startsWith("③")) {
        return { useFont: fontBold, color: rgb(0.09, 0.15, 0.35) };
      }
      if (line.startsWith("[HIGH")) return { useFont: fontBold, color: rgb(0.75, 0.15, 0.15) };
      if (line.startsWith("[MEDIUM")) return { useFont: fontBold, color: rgb(0.8, 0.45, 0.05) };
      if (line.startsWith("[LOW")) return { useFont: fontBold, color: rgb(0.45, 0.45, 0.48) };
      return { useFont: defaultFont, color: defaultColor };
    }

    // 컬럼 단위로 독립된 y 상태를 갖는 텍스트 출력 도구 모음.
    // 좌측 본문(4영역)과 우측 정보카드가 서로 다른 폭·다른 세로 위치에서
    // 각자 안전영역(BODY_MIN_Y 또는 카드별 minY)을 지키며 출력되도록 분리했다.
    function makeDrawers(targetPage: PDFPage, x: number, width: number, state: { y: number }) {
      function hasRoom(size: number, lineGap: number, minY: number): boolean {
        return state.y - (size + lineGap) >= minY;
      }
      function drawParagraphList(
        lines: string[],
        size = 9,
        lineGap = 4,
        maxLines = MAX_LINES_PER_AREA,
        color = rgb(0.28, 0.28, 0.3),
        minY = BODY_MIN_Y
      ) {
        let used = 0;
        for (const line of lines) {
          if (used >= maxLines) return;
          const style = styleForLine(line, font, color);
          const wrapped = wrapLines(line, size, style.useFont, width);
          for (const w of wrapped) {
            if (used >= maxLines) return;
            if (!hasRoom(size, lineGap, minY)) {
              if (state.y - size >= minY - 4) {
                targetPage.drawText("…", { x, y: state.y, size, font, color });
                state.y -= size + lineGap;
              }
              return;
            }
            targetPage.drawText(w, { x, y: state.y, size, font: style.useFont, color: style.color });
            state.y -= size + lineGap;
            used++;
          }
        }
      }
      function drawSectionHeader(title: string, subtitle?: string): boolean {
        const requiredHeight = subtitle ? 28 : 18;
        if (state.y - requiredHeight < BODY_MIN_Y) return false;

        state.y -= 2;
        targetPage.drawRectangle({
          x,
          y: state.y - 2,
          width: 3,
          height: 12,
          color: rgb(0.09, 0.15, 0.35),
        });
        targetPage.drawText(title, {
          x: x + 9,
          y: state.y,
          size: 10.8,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.12),
        });

        if (subtitle) {
          targetPage.drawText(subtitle, {
            x: x + 9,
            y: state.y - 12,
            size: 6.6,
            font,
            color: rgb(0.56, 0.56, 0.59),
          });
          state.y -= 26;
        } else {
          state.y -= 18;
        }

        return true;
      }
      function drawCardTitle(title: string) {
        targetPage.drawText(title, {
          x,
          y: state.y,
          size: 9.2,
          font: fontBold,
          color: rgb(0.09, 0.15, 0.35),
        });
        state.y -= 8;
        targetPage.drawLine({
          start: { x, y: state.y },
          end: { x: x + width, y: state.y },
          thickness: 0.65,
          color: rgb(0.85, 0.85, 0.85),
        });
        state.y -= 13;
      }
      return { drawParagraphList, drawSectionHeader, drawCardTitle, hasRoom };
    }

    // ── 헤더 (Executive Assessment Report) ──
    let y = pageHeight - 42;
    const logoSize = 30;
    page.drawImage(watermarkImage, { x: marginX, y: y - logoSize + 6, width: logoSize, height: logoSize });
    page.drawText("VFBCAI", { x: marginX + logoSize + 9, y, size: 17, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
    page.drawText("Vietnam Foreign Business Verification &", {
      x: marginX + logoSize + 9,
      y: y - 15,
      size: 7,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    page.drawText("Compliance AI Center", {
      x: marginX + logoSize + 9,
      y: y - 24,
      size: 7,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });

    let ry = y;
    const headerTitle = "Executive Assessment Report";
    page.drawText(headerTitle, {
      x: pageWidth - marginX - fontBold.widthOfTextAtSize(headerTitle, 13),
      y: ry,
      size: 13,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
    });
    ry -= 13;
    const headerSubtitle = "AI 행정 평가 보고서";
    page.drawText(headerSubtitle, {
      x: pageWidth - marginX - font.widthOfTextAtSize(headerSubtitle, 8),
      y: ry,
      size: 8,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    ry -= 12;
    const generatedByLine = "대외비 · VFBCAI 행정 인텔리전스 엔진 생성";
    page.drawText(generatedByLine, {
      x: pageWidth - marginX - font.widthOfTextAtSize(generatedByLine, 7),
      y: ry,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    y -= 40;
    page.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 0.75, color: rgb(0.85, 0.85, 0.85) });
    y -= 18;

    // ── 상단 정보 (서비스 / 접수번호 / 신청일 / 발급일 / 판단결과) ──
    // "접수번호" 라벨과 "VF"+leadId 앞 8자 포맷은 프로젝트에 실제 신청번호
    // 컬럼이 없어 새로 만들지 않고, 마이페이지(src/app/mypage/page.tsx)가
    // 이미 고객에게 노출 중인 표시 방식(`VF${item.id.slice(0,8).toUpperCase()}`)을
    // 그대로 재사용한 것이다 — leadId(내부 UUID) 앞 8자 축약값. DB 컬럼 추가 없음.
    const receiptNumber = `VF${leadId.slice(0, 8).toUpperCase()}`;
    const infoFields: [string, string][] = [
      ["서비스", serviceLabel],
      ["접수번호", receiptNumber],
      ["신청일", formatDateDot(lead.created_at as string)],
      ["발급일", formatDateDot(new Date().toISOString())],
      [headerStatusLabel, possibilityText],
    ];
    const infoColWidth = contentWidth / 5;
    infoFields.forEach(([label, value], i) => {
      const ix = marginX + i * infoColWidth;
      page.drawText(label, { x: ix, y, size: 7.5, font, color: rgb(0.55, 0.55, 0.55) });
      const valSize = value.length > 12 ? 9 : 10.5;
      page.drawText(value, { x: ix, y: y - 14, size: valSize, font: fontBold, color: rgb(0.15, 0.15, 0.17) });
    });
    y -= 34;

    // ── Executive Decision: 10초 안에 결론을 이해하도록 가장 먼저 강조 ──
    const decisionHeight = 58;
    page.drawRectangle({
      x: marginX,
      y: y - decisionHeight,
      width: contentWidth,
      height: decisionHeight,
      color: executiveDecision.softColor,
      borderColor: executiveDecision.color,
      borderWidth: 0.8,
    });
    page.drawRectangle({
      x: marginX,
      y: y - decisionHeight,
      width: 6,
      height: decisionHeight,
      color: executiveDecision.color,
    });
    page.drawText(executiveDecision.eyebrow, {
      x: marginX + 18,
      y: y - 16,
      size: 7.2,
      font: fontBold,
      color: executiveDecision.color,
    });
    page.drawText(executiveDecision.headline, {
      x: marginX + 18,
      y: y - 35,
      size: 15,
      font: fontBold,
      color: executiveDecision.color,
    });
    page.drawText(executiveDecision.subline, {
      x: marginX + 18,
      y: y - 50,
      size: 8,
      font,
      color: rgb(0.35, 0.35, 0.38),
    });
    const decisionStatus = category === "verify" ? "검토" : resultTone === "possible" ? "진행" : resultTone === "conditional" ? "보완" : "검토";
    page.drawCircle({
      x: pageWidth - marginX - 32,
      y: y - decisionHeight / 2,
      size: 18,
      color: executiveDecision.color,
    });
    const decisionStatusWidth = fontBold.widthOfTextAtSize(decisionStatus, 8);
    page.drawText(decisionStatus, {
      x: pageWidth - marginX - 32 - decisionStatusWidth / 2,
      y: y - decisionHeight / 2 - 3,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    y -= decisionHeight + 12;

    // ── Executive Metrics: 단순 수치가 아니라 의사결정에 필요한 5개 지표 ──
    const cardGap = 7;
    const cardWidth = (contentWidth - cardGap * 4) / 5;
    const cardHeight = 46;
    const cards: { label: string; value: string; color: ReturnType<typeof rgb> }[] = [
      { label: category === "verify" ? "검토유형" : "평가결과", value: possibilityText, color: resultColor },
      { label: "충족요건", value: requirementsText, color: rgb(0.09, 0.15, 0.35) },
      { label: "보완항목", value: riskCardText, color: rgb(0.72, 0.45, 0.02) },
      { label: "필수서류", value: docsCardText, color: rgb(0.09, 0.15, 0.35) },
      { label: "검토상태", value: aiStatusText, color: hasDiagnosis ? rgb(0.02, 0.45, 0.32) : rgb(0.5, 0.5, 0.5) },
    ];
    cards.forEach((card, i) => {
      const cx = marginX + i * (cardWidth + cardGap);
      page.drawRectangle({
        x: cx,
        y: y - cardHeight,
        width: cardWidth,
        height: cardHeight,
        color: rgb(0.988, 0.989, 0.993),
        borderColor: rgb(0.88, 0.885, 0.9),
        borderWidth: 0.7,
      });
      page.drawRectangle({ x: cx, y: y - 2, width: cardWidth, height: 2, color: card.color });
      page.drawText(card.label, {
        x: cx + 8,
        y: y - 14,
        size: 6.5,
        font: fontBold,
        color: rgb(0.48, 0.49, 0.53),
      });
      const valSize = card.value.length > 9 ? 9.5 : 13.5;
      page.drawText(card.value, {
        x: cx + 8,
        y: y - 35,
        size: valSize,
        font: fontBold,
        color: card.color,
      });
    });
    y -= cardHeight + 14;

    // ── Executive Summary: 결론·근거·다음 행동을 한 번에 읽는 핵심 요약 ──
    {
      const summaryTop = y;
      const summaryHeight = 82;
      page.drawRectangle({
        x: marginX,
        y: summaryTop - summaryHeight,
        width: contentWidth,
        height: summaryHeight,
        color: rgb(0.965, 0.972, 0.988),
      });
      page.drawText("EXECUTIVE SUMMARY", {
        x: marginX + 16,
        y: summaryTop - 18,
        size: 10,
        font: fontBold,
        color: rgb(0.09, 0.15, 0.35),
      });
      page.drawText("핵심 판단 · 주요 근거 · 우선 조치", {
        x: marginX + 16,
        y: summaryTop - 31,
        size: 7,
        font,
        color: rgb(0.52, 0.53, 0.57),
      });
      const state = { y: summaryTop - 46 };
      const d = makeDrawers(page, marginX + 16, contentWidth - 32, state);
      d.drawParagraphList(execSummary, 8.9, 3.4, 6, rgb(0.2, 0.21, 0.24), summaryTop - summaryHeight + 10);
      y = summaryTop - summaryHeight - 12;
    }

    // ── 2단 본문: 좌측 Evidence/Risks/Actions · 우측 Decision Dashboard ──
    const gutter = 16;
    const leftWidth = Math.round(contentWidth * 0.62);
    const rightWidth = contentWidth - leftWidth - gutter;
    const leftX = marginX;
    const rightX = marginX + leftWidth + gutter;

    const leftState = { y };
    const rightState = { y };
    const left = makeDrawers(page, leftX, leftWidth, leftState);
    const right = makeDrawers(page, rightX, rightWidth, rightState);

    // 좌측: Key Findings → Key Risks → Recommended Action
    if (left.drawSectionHeader("EVIDENCE & KEY FINDINGS", "판단 근거와 확인 결과")) {
      left.drawParagraphList(keyFindings, 8.3, 3.3, MAX_LINES_PER_AREA);
      if (leftState.y > BODY_MIN_Y) leftState.y -= 9;
    }
    if (left.drawSectionHeader("KEY RISKS & GAPS", "미확인 항목과 우선 검토사항")) {
      left.drawParagraphList(keyRisks, 8.3, 3.3, MAX_LINES_PER_AREA);
      if (leftState.y > BODY_MIN_Y) leftState.y -= 9;
    }
    if (left.drawSectionHeader("RECOMMENDED ACTIONS", "우선순위별 다음 조치")) {
      left.drawParagraphList(recommendedAction, 8.3, 3.3, MAX_LINES_PER_AREA);
    }

    // 우측: Executive Dashboard — 필수 제출서류 / 진행 현황 / 다음 조치 (고정 카드 박스)
    // 카드마다 "이 카드 내부에서만" 지켜야 할 최저 y(cardContentMinY)를 별도로
    // 계산해, 페이지 전체 안전영역(BODY_MIN_Y)뿐 아니라 카드 테두리 자체를
    // 벗어나지 않도록 이중으로 제한한다. 텍스트가 다음 카드를 침범하지 않는다.
    function drawRightCard(title: string, bodyLines: string[], height: number, maxLines: number, bullet = true) {
      if (rightState.y - height < BODY_MIN_Y) return;

      const topY = rightState.y;
      const cardBottomY = topY - height;
      const horizontalPadding = 12;
      const topPadding = 13;
      const bottomPadding = 12;
      const innerX = rightX + horizontalPadding;
      const innerWidth = rightWidth - horizontalPadding * 2;
      const cardContentMinY = cardBottomY + bottomPadding;
      const effectiveMinY = Math.max(BODY_MIN_Y, cardContentMinY);

      page.drawRectangle({
        x: rightX,
        y: cardBottomY,
        width: rightWidth,
        height,
        borderColor: rgb(0.86, 0.865, 0.88),
        borderWidth: 0.7,
        color: rgb(0.992, 0.992, 0.996),
      });

      const localState = { y: topY - topPadding };
      const localDrawer = makeDrawers(page, innerX, innerWidth, localState);
      localDrawer.drawCardTitle(title);

      const prefixed = bullet ? bodyLines.map((line) => `• ${line}`) : bodyLines;
      localDrawer.drawParagraphList(
        prefixed,
        7.8,
        4,
        maxLines,
        rgb(0.30, 0.30, 0.34),
        effectiveMinY
      );

      rightState.y = cardBottomY - 14;
    }

    drawRightCard(
      "EXECUTIVE DASHBOARD",
      [
        `최종 판단  ${executiveDecision.headline}`,
        `Assessment  ${possibilityText}`,
        `충족 요건  ${requirementsText}`,
        `위험·보완  ${riskCardText}`,
        `Current stage  ${supportData.currentStageLabel}`,
        `Next action  ${supportData.primaryNextAction}`,
      ],
      148,
      9,
      false
    );

    drawRightCard(
      "MANDATORY DOCUMENTS · 필수 제출서류",
      requiredDocsList.length > 0
        ? requiredDocsList.slice(0, 6).map((docName) => `✓ ${docName}`)
        : ["아직 연결된 서류 목록이 없습니다."],
      118,
      8,
      false
    );

    drawRightCard(
      "ASSESSMENT BASIS",
      supportData.assessmentBasis.map((line) => `• ${line}`),
      94,
      6,
      false
    );

    // ── 하단 (신뢰감 있는 Footer — 발급 주체/버전/Report ID/문의/면책문구) ──
    const footerY = 58;
    page.drawLine({ start: { x: marginX, y: footerY + 32 }, end: { x: pageWidth - marginX, y: footerY + 32 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) });
    const footerLogoSize = 14;
    page.drawImage(watermarkImage, { x: marginX, y: footerY + 15, width: footerLogoSize, height: footerLogoSize });
    // 버전/Report ID는 실제 배포 버전 관리 체계나 신청번호 컬럼이 없어 새로
    // 만들지 않고, 위 상단 정보의 접수번호(receiptNumber, 기존 마이페이지
    // 표시 방식 재사용)를 그대로 Report ID로 다시 쓴다. 버전은 이 리포트
    // 템플릿 자체의 표기용 상수(v1.0)이며 DB/배포 시스템과 연동되지 않는다.
    page.drawText(`VFBCAI Executive Administrative Assessment  ·  대외비  ·  Report ID ${receiptNumber}`, {
      x: marginX + footerLogoSize + 6,
      y: footerY + 18,
      size: 7.5,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
    });
    page.drawText("본 문서는 입력정보와 연결된 진단자료를 기준으로 작성된 행정 평가서이며, 최종 진행 여부는 서류 원본 검토와 전문가 확인을 통해 확정됩니다.", {
      x: marginX,
      y: footerY + 4,
      size: 7,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    const contactLabel = "문의  ·  마이페이지 내 '메시지' 또는 전문가 상담 신청을 이용해 주세요.";
    page.drawText(contactLabel, {
      x: marginX,
      y: footerY - 8,
      size: 7,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    // 실제 QR 자산/연결 URL이 프로젝트에 존재하지 않아 QR은 추가하지 않았다(추측 금지).

    const pdfBytes = await doc.save();

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
