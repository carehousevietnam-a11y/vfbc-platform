import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
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
// STEP5 (서비스별 실데이터 연결 — Ace 승인 범위 그대로 구현):
// - src/lib/checkDiagnosis.ts / src/lib/verifyDiagnosis.ts / src/lib/requiredDocuments.ts
//   는 단 한 글자도 수정하지 않았다. import해서 그대로 재호출만 한다.
// - 법인설립(permit_company)과 VERIFY 5종은 crm_activities.meta에 저장된
//   "원본 입력값"으로 기존 결정론적 함수(getCheckDiagnosis / getDiagnosis)를
//   PDF 요청 시점에 다시 실행해, 고객이 결과화면에서 이미 본 것과 동일한
//   customerView / report를 재현한다. 새 AI 호출이 아니라 기존 결과의 재현이다.
// - CHECK 4종은 원본 입력값이 DB에 없으므로 재계산이 불가능하다. 대신
//   meta.expertBrief.checkedItems에서 label과 passed **만** 뽑아 쓴다.
//   reason / riskLevel / rejectionRisks / recommendedSteps / similarCases는
//   이 파일 어디에서도 읽지 않는다(아래 checkedItemLabelsOnly 참고).
// - REGISTER 업종허가 7종은 checkDiagnosis.ts를 쓰지 않는 페이지라서
//   재호출 대상 함수가 없다. 각 페이지에 이미 있는 3개 상태값 비교 로직
//   (예: registrationStatus === "confirmed")을 그대로 옮겨와 저장된 원본
//   응답을 채점한다 — 새 판단 기준이 아니라 각 페이지에 이미 존재하는
//   동일한 비교식이다(REGISTER_STUB_CONFIG 참고).
// - 법령명·조문은 어떤 서비스에서도 새로 만들지 않는다. VERIFY만
//   verifyDiagnosis.ts가 반환하는 legalAreas(분야명+짧은 설명, 조문 없음)를
//   그대로 쓴다.
// - A4 세로 1페이지를 지키기 위해 각 섹션에 줄 수 상한을 뒀다(자르는 것이지
//   지어내는 것이 아니다).

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
//    (verify_real_estate는 실제 저장 값이 아니지만, 향후 하이픈 표기가 바뀌는
//    경우를 대비한 방어적 매핑으로 함께 등록해 둔다.)
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
//    (registrationStatus==="confirmed" / 2번째필드==="secured" / 3번째필드==="ready"
//    는 restaurant/cosmetics/environment/fire-safety/hygiene/medical-device/franchise
//    7개 페이지 전부 동일한 비교값을 쓴다 — 필드 "이름"과 라벨 문구만 다르다.)
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

// 공통 4영역 텍스트 빌더 — CHECK 4종 / REGISTER 업종허가 7종 / 법인설립이 전부
// "점수 + 체크리스트(label/passed만) + 준비서류" 형태를 공유하므로 하나로 통합.
// 여기서 만들어지는 문장은 checklist 내용(서비스·고객마다 실제로 다름)에서만
// 나오며, 서비스명을 끼워 넣는 고정 템플릿이 아니다.
function buildChecklistSections(
  feasibilityScore: number | null,
  resultTone: string | null,
  checklist: SimpleChecklistItem[],
  requiredDocs: { documents: string[] },
  customerNote: string | null
): { area1: string[]; area2: string[]; area3: string[]; area4: string[]; riskCount: number | null } {
  const toneLabel = resultTone ? RESULT_LABELS[resultTone] ?? resultTone : null;
  const passedCount = checklist.filter((c) => c.passed).length;
  const failed = checklist.filter((c) => !c.passed);

  const area1: string[] = [];
  if (typeof feasibilityScore === "number") {
    area1.push(
      `입력하신 정보를 기준으로 종합 판단 점수는 ${feasibilityScore}%이며${
        toneLabel ? `, '${toneLabel}' 단계로 분류되었습니다.` : "입니다."
      }`
    );
    if (checklist.length > 0) {
      area1.push(`확인 항목 ${passedCount}/${checklist.length}개를 충족한 상태입니다.`);
    }
    if (customerNote) area1.push(customerNote);
  } else {
    area1.push("아직 AI 진단 결과가 없습니다.");
  }

  const area2: string[] = [];
  if (checklist.length > 0) {
    area2.push("아래 항목을 기준으로 행정요건 충족 여부를 확인했습니다.");
    for (const item of checklist.slice(0, 5)) {
      area2.push(`${item.passed ? "✓" : "!"} ${item.label}`);
    }
  } else {
    area2.push("아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다.");
  }

  const area3: string[] = [];
  if (checklist.length > 0) {
    if (failed.length > 0) {
      area3.push(
        `다음 항목이 아직 충족되지 않아 보완이 필요합니다: ${failed
          .slice(0, 4)
          .map((f) => f.label)
          .join(", ")}${failed.length > 4 ? ` 외 ${failed.length - 4}건` : ""}`
      );
    } else {
      area3.push("확인된 항목 기준으로 별도 보완이 필요한 사항이 없습니다.");
    }
  } else {
    area3.push("아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다.");
  }

  const area4: string[] = [];
  if (requiredDocs.documents.length > 0) {
    area4.push(`우선 준비 서류: ${requiredDocs.documents.slice(0, 5).join(", ")}`);
  }
  if (failed.length > 0) {
    area4.push("위 미충족 항목을 먼저 보완하신 뒤 전문가 상담을 진행하시면 더 정확한 안내를 받으실 수 있습니다.");
  } else if (checklist.length > 0) {
    area4.push("확인된 항목은 모두 충족된 상태이며, 준비서류를 갖추신 뒤 전문가 상담을 통해 최종 확인을 진행해 주세요.");
  }
  if (area4.length === 0) area4.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");

  return { area1, area2, area3, area4, riskCount: checklist.length > 0 ? failed.length : null };
}

const MAX_LINES_PER_AREA = 5;

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

    // 고객명은 이 리포트에 출력하지 않으므로 profile(users.name) 조회는 불필요해 제거했다.

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

    // ── 4영역 콘텐츠 + 요약카드용 부가값 계산 ──
    let area1: string[] = ["아직 AI 진단 결과가 없습니다."];
    let area2: string[] = [];
    let area3: string[] = [];
    let area4: string[] = [];
    let riskCount: number | null = null;
    let estimatedDaysText = "서류 확인 후 안내";
    let requiredDocsCount: number | null = null;

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
      const built = buildChecklistSections(feasibilityScore, resultTone, checklist, requiredDocs, null);
      area1 = built.area1;
      area2 = built.area2;
      area3 = built.area3;
      area4 = built.area4;
      riskCount = built.riskCount;
      // estimatedDays는 원본 입력값이 저장되지 않아 재계산 불가 — 정직하게 고정 안내.
    } else if (category === "register" && normalizedType === "permit_company") {
      const investorType = asStringField(diagMeta, "investorType") as PermitInvestorType | null;
      const capital = asStringField(diagMeta, "capital") as PermitCapital | null;
      const office = asStringField(diagMeta, "office") as PermitOffice | null;
      const residentRep = asStringField(diagMeta, "residentRep") as PermitResidentRep | null;
      const documentService = asStringField(diagMeta, "documentService") ?? "permit_company";
      const requiredDocs = getRequiredDocuments(documentService);
      requiredDocsCount = requiredDocs.documents.length;

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
          const built = buildChecklistSections(cv.feasibilityScore, cv.resultTone, cv.checklist, requiredDocs, cv.note);
          area1 = built.area1;
          area2 = built.area2;
          area3 = built.area3;
          area4 = built.area4;
          riskCount = built.riskCount;
          if (cv.estimatedDays) estimatedDaysText = `${cv.estimatedDays.min}~${cv.estimatedDays.max}일`;
        }
      } else if (typeof feasibilityScore === "number") {
        // 원본 입력값이 없어 재계산은 못 하지만 점수만은 안전하게 표시.
        area1 = [`입력하신 정보를 기준으로 종합 판단 점수는 ${feasibilityScore}%입니다.`];
        area2 = ["아직 이 항목에 연결된 행정요건 확인 데이터가 없습니다."];
        area3 = ["아직 이 항목에 연결된 위험요인 확인 데이터가 없습니다."];
        area4 = ["아직 이 항목에 연결된 권고 데이터가 없습니다."];
      }
    } else if (category === "register" && normalizedType && REGISTER_STUB_CONFIG[normalizedType]) {
      const cfg = REGISTER_STUB_CONFIG[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsCount = requiredDocs.documents.length;
      const checklist: SimpleChecklistItem[] = diagMeta
        ? [
            { label: "사업자·법인 등록 서류 준비", passed: asStringField(diagMeta, "registrationStatus") === "confirmed" },
            { label: cfg.facilityLabel, passed: asStringField(diagMeta, cfg.facilityField) === "secured" },
            { label: cfg.readyLabel, passed: asStringField(diagMeta, cfg.readyField) === "ready" },
          ]
        : [];
      const built = buildChecklistSections(feasibilityScore, resultTone, checklist, requiredDocs, null);
      area1 = built.area1;
      area2 = built.area2;
      area3 = built.area3;
      area4 = built.area4;
      riskCount = built.riskCount;
    } else if (category === "verify" && normalizedType) {
      const verifyCategory = VERIFY_CATEGORY_MAP[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsCount = requiredDocs.documents.length;

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
          area1 = [report.incidentSummary, report.analysisOpinion].filter(Boolean).slice(0, MAX_LINES_PER_AREA);

          area2 = [];
          for (const la of report.legalAreas.slice(0, 3)) area2.push(`[${la.area}] ${la.note}`);
          if (report.legalApplicabilityNote) area2.push(report.legalApplicabilityNote);
          if (area2.length === 0) area2.push("아직 이 항목에 연결된 법령·행정기준 데이터가 없습니다.");

          area3 =
            report.riskFactors.length > 0
              ? report.riskFactors
                  .slice(0, 5)
                  .map((r) => `[${r.level === "critical" ? "치명적" : r.level === "high" ? "높음" : "주의"}] ${r.label}`)
              : ["확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다."];

          area4 = [...report.recommendedActions.slice(0, 3), report.expertReviewRecommendation].filter(Boolean);
          if (area4.length === 0) area4.push("아직 이 항목에 연결된 권고 데이터가 없습니다.");

          riskCount = report.riskFactors.length;
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
    // VERIFY는 애초에 수치 점수 개념이 없다(verifyDiagnosis.ts 어디에도 점수 필드가
    // 없음). "확인 전"으로 표시하면 본문(4영역)에는 내용이 있는데 상단 카드만
    // 비어 보이는 모순이 생기므로, 점수를 지어내는 대신 VERIFY 전용의 정직한
    // 서비스 상태 문구("문서 검토")를 고정으로 사용한다. 본문/상단 모두 동일한
    // 값을 써서 정합성을 맞춘다.
    const possibilityText =
      category === "verify" ? "문서 검토" : typeof feasibilityScore === "number" ? `${feasibilityScore}%` : "확인 전";
    const riskCardText = riskCount !== null ? `${riskCount}건` : "확인 전";
    const docsCardText = requiredDocsCount !== null ? `${requiredDocsCount}종` : "확인 전";
    // "AI Confidence"는 실제로 존재하지 않는 개념(feasibilityScore는 모델
    // 신뢰도가 아니라 허가·진행 가능성 점수)이라 쓰지 않는다. 서비스군에 맞는
    // 정직한 라벨만 사용한다.
    const headerStatusLabel = category === "verify" ? "검토유형" : "판단결과";
    const possibilityCardLabel = category === "verify" ? "검토유형" : "가능성";

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
    const marginX = 46;
    const contentWidth = pageWidth - marginX * 2;

    const page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 50;

    page.drawRectangle({ x: 0, y: pageHeight - 4, width: pageWidth, height: 4, color: rgb(0.09, 0.15, 0.35) });

    const wmSize = 300;
    page.drawImage(watermarkImage, {
      x: (pageWidth - wmSize) / 2,
      y: (pageHeight - wmSize) / 2 - 30,
      width: wmSize,
      height: wmSize,
      opacity: 0.045,
    });

    // A4 1페이지 하단 안전영역 — 이 y값 아래로는 어떤 본문도 그리지 않는다.
    // 하단 고지문구(footerY=66, 구분선은 footerY+34=100)와 겹치지 않도록
    // 여유를 둔 값이다. 두 번째 페이지를 만드는 대신, 넘치는 내용은 말줄임표로
    // 자른다.
    const BODY_MIN_Y = 125;
    function hasRoom(size: number, lineGap = 4): boolean {
      return y - (size + lineGap) >= BODY_MIN_Y;
    }

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

    function drawWrapped(
      text: string,
      size: number,
      useFont: PDFFont,
      color: ReturnType<typeof rgb>,
      maxWidth: number,
      lineGap = 4,
      maxLines?: number
    ) {
      let lines = wrapLines(text, size, useFont, maxWidth);
      if (maxLines && lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[maxLines - 1] = `${lines[maxLines - 1]}…`;
      }
      for (const line of lines) {
        if (!hasRoom(size, lineGap)) {
          if (y - size >= BODY_MIN_Y - 4) {
            page.drawText("…", { x: marginX, y, size, font: useFont, color });
            y -= size + lineGap;
          }
          return;
        }
        page.drawText(line, { x: marginX, y, size, font: useFont, color });
        y -= size + lineGap;
      }
    }

    function drawParagraphList(lines: string[], size = 9, lineGap = 4, maxLines = MAX_LINES_PER_AREA) {
      let used = 0;
      for (const line of lines) {
        if (used >= maxLines) return;
        const wrapped = wrapLines(line, size, font, contentWidth);
        for (const w of wrapped) {
          if (used >= maxLines) return;
          if (!hasRoom(size, lineGap)) {
            if (y - size >= BODY_MIN_Y - 4) {
              page.drawText("…", { x: marginX, y, size, font, color: rgb(0.28, 0.28, 0.3) });
              y -= size + lineGap;
            }
            return;
          }
          page.drawText(w, { x: marginX, y, size, font, color: rgb(0.28, 0.28, 0.3) });
          y -= size + lineGap;
          used++;
        }
      }
    }

    function drawSectionHeader(index: string, title: string): boolean {
      // 안전영역 이하로 내려갔으면 섹션 제목 자체를 그리지 않는다(본문 없는
      // 제목만 하단에 남는 것을 방지) — 두 번째 페이지는 만들지 않는다.
      if (y - 16 < BODY_MIN_Y) return false;
      y -= 3;
      page.drawRectangle({ x: marginX, y: y - 1, width: 3, height: 12, color: rgb(0.09, 0.15, 0.35) });
      page.drawText(`${index}  ${title}`, { x: marginX + 9, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.12) });
      y -= 16;
      return true;
    }

    // ── 헤더 ──
    const logoSize = 22;
    page.drawImage(watermarkImage, { x: marginX, y: y - logoSize + 4, width: logoSize, height: logoSize });
    page.drawText("VFBCAI AI 진단 결과 리포트", {
      x: marginX + logoSize + 8,
      y,
      size: 15,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
    });
    const issuedLabel = `발급일 ${formatDateDot(new Date().toISOString())}`;
    page.drawText(issuedLabel, {
      x: pageWidth - marginX - font.widthOfTextAtSize(issuedLabel, 8.5),
      y: y + 2,
      size: 8.5,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 20;
    // "접수번호" 라벨과 "VF"+leadId 앞 8자 포맷은 프로젝트에 실제 신청번호 컬럼이
    // 없어 새로 만들지 않고, 마이페이지(src/app/mypage/page.tsx)가 이미 고객에게
    // 노출 중인 표시 방식(`VF${item.id.slice(0,8).toUpperCase()}`)을 그대로
    // 재사용한 것이다 — leadId(내부 UUID)의 앞 8자 축약값이며 별도 DB 컬럼이
    // 아니다. DB 컬럼 추가 없음.
    const receiptNumber = `VF${leadId.slice(0, 8).toUpperCase()}`;
    const metaLine = `서비스 ${serviceLabel}   |   접수번호 ${receiptNumber}   |   신청일 ${formatDateDot(
      lead.created_at as string
    )}   |   ${headerStatusLabel} ${possibilityText}`;
    drawWrapped(metaLine, 8.5, font, rgb(0.4, 0.4, 0.4), contentWidth);
    y -= 4;
    page.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 0.75, color: rgb(0.85, 0.85, 0.85) });
    y -= 16;

    // ── 상단 5개 요약 카드 ──
    const cardGap = 8;
    const cardWidth = (contentWidth - cardGap * 4) / 5;
    const cardHeight = 46;
    const cards: { label: string; value: string; color: ReturnType<typeof rgb> }[] = [
      { label: possibilityCardLabel, value: possibilityText, color: resultColor },
      { label: "위험요인", value: riskCardText, color: rgb(0.7, 0.45, 0.02) },
      { label: "준비서류", value: docsCardText, color: rgb(0.09, 0.15, 0.35) },
      { label: "예상 처리기간", value: estimatedDaysText, color: rgb(0.35, 0.35, 0.35) },
      { label: "AI 검토상태", value: aiStatusText, color: hasDiagnosis ? rgb(0.02, 0.45, 0.32) : rgb(0.5, 0.5, 0.5) },
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
      page.drawText(card.label, { x: cx + 7, y: y - 15, size: 7.5, font, color: rgb(0.5, 0.5, 0.5) });
      const valSize = card.value.length > 8 ? 10 : 12.5;
      page.drawText(card.value, { x: cx + 7, y: y - 33, size: valSize, font: fontBold, color: card.color });
    });
    y -= cardHeight + 16;

    // ── 핵심 본문: 4영역 (AI 종합의견 — 페이지에서 가장 큰 비중) ──
    // 제목이 그려지지 않았으면(안전영역 초과) 본문·말줄임표·여백도 전혀 출력하지 않는다.
    if (drawSectionHeader("1", "종합 판단")) {
      drawParagraphList(area1, 9.5, 4, MAX_LINES_PER_AREA);
      if (y > BODY_MIN_Y) y -= 6;
    }

    if (drawSectionHeader("2", "법령 및 행정기준에 따른 판단")) {
      drawParagraphList(area2, 9, 4, MAX_LINES_PER_AREA);
      if (y > BODY_MIN_Y) y -= 6;
    }

    if (drawSectionHeader("3", "발견된 위험요인 및 보완사항")) {
      drawParagraphList(area3, 9, 4, MAX_LINES_PER_AREA);
      if (y > BODY_MIN_Y) y -= 6;
    }

    if (drawSectionHeader("4", "최종 권고 의견")) {
      drawParagraphList(area4, 9, 4, MAX_LINES_PER_AREA);
      if (y > BODY_MIN_Y) y -= 6;
    }

    // ── 진행현황 — AI Report의 핵심이 아니므로 한 줄로 축소. 공간이 부족하면
    //    footer와 겹치지 않도록 아예 생략한다(진행현황은 없어도 무방).
    const progressRequiredHeight = 32;
    if (y - progressRequiredHeight >= BODY_MIN_Y) {
      page.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
      y -= 14;
      page.drawText(
        `진행현황  ·  ${hasDiagnosis ? "AI 진단 완료" : "AI 진단 전"}${
          actions.has("expert_review_request") ? " · 전문가 검토 요청됨" : ""
        }${actions.has("agency_upgrade_request") ? " · 전문가 진행요청 접수됨" : ""}`,
        { x: marginX, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) }
      );
      y -= 18;
    }

    // ── 하단 ──
    const footerY = 66;
    page.drawLine({ start: { x: marginX, y: footerY + 34 }, end: { x: pageWidth - marginX, y: footerY + 34 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) });
    page.drawText("핵심 권장사항은 위 '4. 최종 권고 의견'을 참고해 주세요.", {
      x: marginX,
      y: footerY + 20,
      size: 7.5,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText("본 리포트는 입력하신 정보를 기준으로 한 1차 자가진단이며, 정확한 진행·허가 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.", {
      x: marginX,
      y: footerY + 8,
      size: 7.5,
      font,
      color: rgb(0.55, 0.55, 0.55),
    });
    page.drawText("문의  ·  마이페이지 내 '메시지' 또는 전문가 상담 신청을 이용해 주세요.", {
      x: marginX,
      y: footerY - 4,
      size: 7.5,
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
