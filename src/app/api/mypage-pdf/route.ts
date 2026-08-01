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
// STEP6 (디자인/레이아웃 전면 개편 — 데이터 소스·비즈니스 로직은 STEP5 승인 범위 그대로):
// - src/lib/checkDiagnosis.ts / src/lib/verifyDiagnosis.ts / src/lib/requiredDocuments.ts
//   는 이번에도 한 글자도 수정하지 않았다. import해서 그대로 재호출만 한다.
// - 데이터 연결 방식(법인설립·VERIFY는 기존 결정론적 함수 재호출, CHECK는
//   expertBrief.checkedItems의 label/passed만 사용, REGISTER 7종은 각 페이지의
//   비교식을 그대로 옮긴 설정표 사용)은 이전 단계와 동일하다.
// - ⚠️ expertBrief/expert_brief의 reason/riskLevel/rejectionRisks/
//   recommendedSteps/similarCases는 여전히 어디에서도 읽지 않는다.
// - 이번 변경은 "같은 데이터를 더 읽기 좋게 배치"한 것이다. 4영역 문장이
//   길어진 것은 같은 checklist/report 데이터를 더 풀어서 서술했기 때문이며,
//   서비스마다 다른 실제 데이터에서만 나온다. 새 법령·새 위험요인·새 AI
//   판단을 추가하지 않았다.
// - 우측 "서비스 진행 현황" 카드는 새로 만든 절차가 아니라, CRM 활동 로그
//   (verify_lead/expert_review_request/agency_upgrade_request/
//   process_government_submitted/process_permit_completed)로 이미 판별
//   가능한 카테고리별 표준 진행단계를 나열한 것이다.
// - 우측 "주의사항" 카드는 실제 미충족 항목이 있으면 그 항목을, 없으면
//   마스터문서에 명시된 기존 고지 문구("행정기관 통폐합·법령 개정이 잦다")를
//   재사용한다. 새 문구를 지어내지 않았다.
// - A4 세로 1페이지, 하단 안전영역(BODY_MIN_Y) 유지.

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

const RESULT_COLORS: Record<string, ReturnType<typeof rgb>> = {
  possible: rgb(0.02, 0.45, 0.32),
  conditional: rgb(0.7, 0.45, 0.02),
  impossible: rgb(0.7, 0.15, 0.15),
};

// ── VERIFY 서비스 키 → verifyDiagnosis.ts의 VerifyCategory 명시적 매핑.
//    문자열 치환(정규식)에 의존하지 않는다. 매핑에 없는 키는 진단을 재현하지 않는다.
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
type Sections = { area1: string[]; area2: string[]; area3: string[]; area4: string[]; riskCount: number | null };

// 공통 4영역 텍스트 빌더 — CHECK 4종 / REGISTER 업종허가 7종 / 법인설립이 전부
// "점수 + 체크리스트(label/passed만) + 준비서류" 형태를 공유하므로 하나로 통합.
// 여기서 만들어지는 문장은 checklist 내용(서비스·고객마다 실제로 다름)에서만
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
  const passedCount = checklist.filter((c) => c.passed).length;
  const failed = checklist.filter((c) => !c.passed);

  const area1: string[] = [];
  if (typeof feasibilityScore === "number") {
    area1.push(
      `${serviceLabel} 신청 건에 대해 입력하신 정보를 종합 분석한 결과, 진행 가능성은 ${feasibilityScore}%로${
        toneLabel ? ` '${toneLabel}' 단계로 판단됩니다.` : " 판단됩니다."
      }`
    );
    if (checklist.length > 0) {
      area1.push(
        `총 ${checklist.length}개 확인 항목 중 ${passedCount}개 항목을 충족했으며, ${
          failed.length > 0 ? `${failed.length}개 항목에서 보완이 필요한 것으로 확인됩니다.` : "모든 항목을 충족한 상태입니다."
        }`
      );
    }
    if (customerNote) area1.push(customerNote);
    area1.push("아래 상세 분석 결과를 참고하시어 다음 단계를 준비해 주시기 바랍니다.");
  } else {
    area1.push("아직 AI 진단 결과가 없습니다.");
  }

  const area2: string[] = [];
  if (checklist.length > 0) {
    area2.push("아래 항목은 입력하신 답변을 기준으로 확인한 주요 준비요건입니다.");
    for (const item of checklist.slice(0, 6)) {
      area2.push(`${item.passed ? "✓" : "!"} ${item.label}`);
    }
    area2.push(`현재 기준 ${passedCount}/${checklist.length}개 항목이 충족된 상태입니다.`);
  } else {
    area2.push("아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다.");
  }

  const area3: string[] = [];
  if (checklist.length > 0) {
    if (failed.length > 0) {
      failed.slice(0, 4).forEach((f, idx) => {
        area3.push(`${idx + 1}. ${f.label} — 입력하신 답변 기준으로 아직 준비가 확인되지 않은 항목입니다.`);
      });
      if (failed.length > 4) area3.push(`그 외 ${failed.length - 4}건이 추가로 확인됩니다.`);
      area3.push("위 항목을 먼저 준비한 후 서류 원본과 함께 전문가 확인을 진행해 주세요.");
    } else {
      area3.push("확인된 항목은 모두 충족되어 현재 시점 기준으로는 별도 위험요인이 발견되지 않았습니다.");
      area3.push("다만 서류 원본 확인 과정에서 새로운 보완사항이 발견될 수 있습니다.");
    }
  } else {
    area3.push("아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다.");
  }

  const area4: string[] = [];
  area4.push(
    toneLabel
      ? `현재 제출 정보를 기준으로 '${toneLabel}' 상태이며, 아래 사항을 확인하신 후 진행하시길 권장합니다.`
      : "현재 제출 정보를 기준으로 아래 사항을 확인하신 후 진행하시길 권장합니다."
  );
  const recommendations: string[] = [];
  for (const f of failed.slice(0, 2)) recommendations.push(f.label);
  if (requiredDocs.documents.length > 0) recommendations.push(`준비 서류: ${requiredDocs.documents.slice(0, 3).join(", ")}`);
  const circled = ["①", "②", "③"];
  recommendations.slice(0, 3).forEach((r, idx) => area4.push(`${circled[idx]} ${r}`));
  area4.push("모든 항목을 준비하신 후에는 전문가 상담을 통해 최종 확인을 진행해 주세요.");
  if (recommendations.length === 0 && failed.length === 0 && requiredDocs.documents.length === 0) {
    area4.length = 0;
    area4.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");
  }

  return { area1, area2, area3, area4, riskCount: checklist.length > 0 ? failed.length : null };
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

    // ── 4영역 콘텐츠 + 카드용 부가값 계산 ──
    let area1: string[] = ["아직 AI 진단 결과가 없습니다."];
    let area2: string[] = [];
    let area3: string[] = [];
    let area4: string[] = [];
    let riskCount: number | null = null;
    let estimatedDaysText = "서류 확인 후 안내";
    let requiredDocsCount: number | null = null;
    let requiredDocsList: string[] = [];
    let cautionLines: string[] = [EXISTING_LEGAL_CHANGE_NOTICE];

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
      const built = buildChecklistSections(serviceLabel, feasibilityScore, resultTone, checklist, requiredDocs, null);
      ({ area1, area2, area3, area4, riskCount } = built);
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
          const built = buildChecklistSections(serviceLabel, cv.feasibilityScore, cv.resultTone, cv.checklist, requiredDocs, cv.note);
          ({ area1, area2, area3, area4, riskCount } = built);
          cautionLines = buildCautionLines(cv.checklist.filter((c) => !c.passed));
          if (cv.estimatedDays) estimatedDaysText = `${cv.estimatedDays.min}~${cv.estimatedDays.max}일`;
        }
      } else if (typeof feasibilityScore === "number") {
        area1 = [`입력하신 정보를 기준으로 종합 판단 점수는 ${feasibilityScore}%입니다.`];
        area2 = ["아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다."];
        area3 = ["아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다."];
        area4 = ["아직 이 항목에 연결된 권고 데이터가 없습니다."];
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
      const built = buildChecklistSections(serviceLabel, feasibilityScore, resultTone, checklist, requiredDocs, null);
      ({ area1, area2, area3, area4, riskCount } = built);
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
          area1 = [report.incidentSummary, report.analysisOpinion];
          if (report.keyFindings.length > 0) {
            area1.push(`주요 확인사항: ${report.keyFindings.map((k) => k.label).join(", ")}`);
          }
          area1.push("아래 상세 분석 결과를 참고하시어 다음 단계를 준비해 주시기 바랍니다.");

          area2 = [];
          for (const la of report.legalAreas.slice(0, 3)) area2.push(`[${la.area}] ${la.note}`);
          if (report.legalApplicabilityNote) area2.push(report.legalApplicabilityNote);
          if (report.legalUpdateNotice) area2.push(report.legalUpdateNotice);
          if (report.practiceNotes) area2.push(report.practiceNotes);
          if (area2.length === 0) area2.push("아직 이 항목에 연결된 법령·행정기준 데이터가 없습니다.");

          area3 =
            report.riskFactors.length > 0
              ? report.riskFactors
                  .slice(0, 5)
                  .map(
                    (r, idx) =>
                      `${idx + 1}. [${r.level === "critical" ? "치명적" : r.level === "high" ? "높음" : "주의"}] ${r.label}`
                  )
              : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];
          if (report.riskFactors.length > 0) area3.push("우선순위가 높은 항목부터 서류 원본과 함께 보완해 주세요.");

          area4 = report.recommendedActions.slice(0, 3).map((a, idx) => `${["①", "②", "③"][idx]} ${a}`);
          if (report.expertReviewRecommendation) area4.push(report.expertReviewRecommendation);
          if (area4.length === 0) area4.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");

          riskCount = report.riskFactors.length;
          cautionLines = buildCautionLinesFromRiskFactors(report.riskFactors);
        } else {
          // report가 없는 예외 상황(구버전 데이터 등) — 고객에게 이미 노출되는
          // 최상위 안전 필드(headline/checklist/note)만 사용, 지어내지 않음.
          area1 = [diag.headline];
          area2 =
            diag.checklist.length > 0
              ? diag.checklist.slice(0, 5).map((c) => `[${c.level}] ${c.label}`)
              : ["아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다."];
          area3 = ["아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다."];
          area4 = [diag.note];
        }
      }
    }

    if (typeof feasibilityScore !== "number" && area1.length === 0) {
      area1 = ["아직 AI 진단 결과가 없습니다."];
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

    const processSteps = buildProcessSteps(category, hasDiagnosis, hasExpertReview, hasAgency, hasGovSubmit, hasPermitDone);

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

    // 컬럼 단위로 독립된 y 상태를 갖는 텍스트 출력 도구 모음.
    // 좌측 본문(4영역)과 우측 정보카드가 서로 다른 폭·다른 세로 위치에서
    // 각자 안전영역(BODY_MIN_Y)을 지키며 출력되도록 분리했다.
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
          const wrapped = wrapLines(line, size, font, width);
          for (const w of wrapped) {
            if (used >= maxLines) return;
            if (!hasRoom(size, lineGap, minY)) {
              if (state.y - size >= minY - 4) {
                targetPage.drawText("…", { x, y: state.y, size, font, color });
                state.y -= size + lineGap;
              }
              return;
            }
            targetPage.drawText(w, { x, y: state.y, size, font, color });
            state.y -= size + lineGap;
            used++;
          }
        }
      }
      function drawSectionHeader(index: string, title: string): boolean {
        if (state.y - 15 < BODY_MIN_Y) return false;
        state.y -= 2;
        targetPage.drawRectangle({ x, y: state.y - 1, width: 3, height: 11, color: rgb(0.09, 0.15, 0.35) });
        targetPage.drawText(`${index}  ${title}`, {
          x: x + 8,
          y: state.y,
          size: 10.5,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.12),
        });
        state.y -= 15;
        return true;
      }
      function drawCardTitle(title: string) {
        targetPage.drawText(title, { x, y: state.y, size: 10.5, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
        state.y -= 6;
        targetPage.drawLine({
          start: { x, y: state.y },
          end: { x: x + width, y: state.y },
          thickness: 0.75,
          color: rgb(0.85, 0.85, 0.85),
        });
        state.y -= 12;
      }
      return { drawParagraphList, drawSectionHeader, drawCardTitle, hasRoom };
    }

    // ── 헤더 ──
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

    const headerRightLines = ["AI 진단 결과 보고서", "Check. Verify. Register. Protect."];
    let ry = y;
    page.drawText(headerRightLines[0], {
      x: pageWidth - marginX - fontBold.widthOfTextAtSize(headerRightLines[0], 13),
      y: ry,
      size: 13,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
    });
    ry -= 14;
    page.drawText(headerRightLines[1], {
      x: pageWidth - marginX - font.widthOfTextAtSize(headerRightLines[1], 8),
      y: ry,
      size: 8,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    ry -= 13;
    const issuedLabel = `발급일  ${formatDateDot(new Date().toISOString())}`;
    page.drawText(issuedLabel, {
      x: pageWidth - marginX - font.widthOfTextAtSize(issuedLabel, 8),
      y: ry,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
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

    // ── 상단 5개 요약 카드 (아이콘 배지 + 강조색) ──
    const cardGap = 8;
    const cardWidth = (contentWidth - cardGap * 4) / 5;
    const cardHeight = 58;
    const cards: { label: string; value: string; color: ReturnType<typeof rgb>; symbol: string }[] = [
      { label: possibilityCardLabel, value: possibilityText, color: resultColor, symbol: "%" },
      { label: "위험요인", value: riskCardText, color: rgb(0.7, 0.45, 0.02), symbol: "!" },
      { label: "준비서류", value: docsCardText, color: rgb(0.09, 0.15, 0.35), symbol: "D" },
      { label: "예상 처리기간", value: estimatedDaysText, color: rgb(0.35, 0.35, 0.4), symbol: "T" },
      { label: "AI 검토상태", value: aiStatusText, color: hasDiagnosis ? rgb(0.02, 0.45, 0.32) : rgb(0.5, 0.5, 0.5), symbol: "A" },
    ];
    cards.forEach((card, i) => {
      const cx = marginX + i * (cardWidth + cardGap);
      page.drawRectangle({
        x: cx,
        y: y - cardHeight,
        width: cardWidth,
        height: cardHeight,
        borderColor: rgb(0.88, 0.88, 0.88),
        borderWidth: 0.75,
        color: rgb(0.985, 0.985, 0.99),
      });
      page.drawRectangle({ x: cx, y: y - 2.5, width: cardWidth, height: 2.5, color: card.color });
      drawBadge(cx + 15, y - 18, 8, card.color, card.symbol);
      page.drawText(card.label, { x: cx + 29, y: y - 15, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
      const valSize = card.value.length > 8 ? 9.5 : 12;
      page.drawText(card.value, { x: cx + 8, y: y - 46, size: valSize, font: fontBold, color: card.color });
    });
    y -= cardHeight + 18;

    // ── 2단 본문: 좌측 4영역(AI 종합의견) / 우측 정보카드 3종 ──
    const gutter = 16;
    const leftWidth = Math.round(contentWidth * 0.62);
    const rightWidth = contentWidth - leftWidth - gutter;
    const leftX = marginX;
    const rightX = marginX + leftWidth + gutter;

    const leftState = { y };
    const rightState = { y };
    const left = makeDrawers(page, leftX, leftWidth, leftState);
    const right = makeDrawers(page, rightX, rightWidth, rightState);

    // 좌측: 핵심 본문(가장 큰 비중)
    if (left.drawSectionHeader("1", "종합 판단")) {
      left.drawParagraphList(area1, 9, 3.5, MAX_LINES_PER_AREA);
      if (leftState.y > BODY_MIN_Y) leftState.y -= 7;
    }
    if (left.drawSectionHeader("2", "법령 및 행정기준에 따른 판단")) {
      left.drawParagraphList(area2, 8.5, 3.5, MAX_LINES_PER_AREA);
      if (leftState.y > BODY_MIN_Y) leftState.y -= 7;
    }
    if (left.drawSectionHeader("3", "발견된 위험요인 및 보완사항")) {
      left.drawParagraphList(area3, 8.5, 3.5, MAX_LINES_PER_AREA);
      if (leftState.y > BODY_MIN_Y) leftState.y -= 7;
    }
    if (left.drawSectionHeader("4", "최종 권고 의견")) {
      left.drawParagraphList(area4, 8.5, 3.5, MAX_LINES_PER_AREA);
    }

    // 우측: 필수 제출서류 / 서비스 진행 현황 / 주의사항 (고정 카드 박스)
    // 카드마다 "이 카드 내부에서만" 지켜야 할 최저 y(cardContentMinY)를 별도로
    // 계산해, 페이지 전체 안전영역(BODY_MIN_Y)뿐 아니라 카드 테두리 자체를
    // 벗어나지 않도록 이중으로 제한한다. 텍스트가 다음 카드를 침범하지 않는다.
    function drawRightCard(title: string, bodyLines: string[], height: number, maxLines: number, bullet = true) {
      if (rightState.y - height < BODY_MIN_Y) return;
      const topY = rightState.y;
      const cardBottomY = topY - height;
      const cardContentMinY = cardBottomY + 10;
      const effectiveMinY = Math.max(BODY_MIN_Y, cardContentMinY);
      page.drawRectangle({
        x: rightX,
        y: cardBottomY,
        width: rightWidth,
        height,
        borderColor: rgb(0.88, 0.88, 0.88),
        borderWidth: 0.75,
        color: rgb(0.99, 0.99, 0.995),
      });
      rightState.y = topY - 10;
      right.drawCardTitle(title);
      const prefixed = bullet ? bodyLines.map((l) => `• ${l}`) : bodyLines;
      right.drawParagraphList(prefixed, 8, 3.5, maxLines, rgb(0.32, 0.32, 0.35), effectiveMinY);
      rightState.y = cardBottomY - 12;
    }

    drawRightCard(
      "필수 제출서류",
      requiredDocsList.length > 0 ? requiredDocsList.slice(0, 6) : ["아직 연결된 서류 목록이 없습니다."],
      132,
      8
    );

    drawRightCard(
      "서비스 진행 현황",
      processSteps.map((s) => `${s.done ? "[완료]" : "[예정]"} ${s.label}`),
      110,
      6,
      false
    );

    drawRightCard("주의사항", cautionLines, 88, 4);

    // ── 하단 ──
    const footerY = 58;
    page.drawLine({ start: { x: marginX, y: footerY + 30 }, end: { x: pageWidth - marginX, y: footerY + 30 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) });
    const footerLogoSize = 14;
    page.drawImage(watermarkImage, { x: marginX, y: footerY + 8, width: footerLogoSize, height: footerLogoSize });
    page.drawText("VFBCAI", { x: marginX + footerLogoSize + 6, y: footerY + 11, size: 9, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
    page.drawText("본 리포트는 입력하신 정보를 기준으로 한 1차 자가진단이며, 정확한 진행·허가 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.", {
      x: marginX,
      y: footerY - 4,
      size: 7,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    const contactLabel = "문의  ·  마이페이지 내 '메시지' 또는 전문가 상담 신청을 이용해 주세요.";
    page.drawText(contactLabel, {
      x: pageWidth - marginX - font.widthOfTextAtSize(contactLabel, 7),
      y: footerY + 11,
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
