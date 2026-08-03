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
import { createAdminReadOnlyClient } from "@/lib/adminAuth/readOnlyClient";
import { verifyAdminUser } from "@/lib/adminAuth/verifyAdminUser";

// ── 관리자 전용 Case Review PDF (신규 파일) ──────────────────────────────
//
// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// 왜 새 파일인가: 프로젝트에 관리자용 PDF 생성 route가 존재하지 않아(고객용
// src/app/api/mypage-pdf/route.ts 하나뿐) "기존 파일 수정"이 불가능했다.
// src/middleware.ts의 matcher가 이미 "/api/admin/:path*" 전체를 보호하고
// 있으므로 원래는 별도 인증 로직 없이 관리자 전용으로 동작했으나,
// [2026-08-03 STEP 1] 개인별 Supabase Auth 로그인으로 인증 방식이 바뀌면서
// 아래의 자체 방어 확인 로직도 동일한 기준(세션+admin_users.active)으로
// 함께 교체했다 — PDF 생성 로직 본문은 이 변경과 무관하게 그대로다.
//
// 데이터 소스·재사용 원칙은 고객용 mypage-pdf.ts와 동일하다:
// - src/lib/checkDiagnosis.ts / verifyDiagnosis.ts / requiredDocuments.ts는
//   이번에도 한 글자도 수정하지 않았다. import해서 그대로 재호출만 한다.
// - 법인설립·VERIFY는 crm_activities.meta에 저장된 원본 입력값으로 기존
//   결정론적 함수를 다시 실행해 고객 화면과 동일한 결과를 재현한다.
// - CHECK 4종은 원본 입력값이 저장되지 않아 재계산이 불가능하므로, meta에
//   이미 저장되어 있는 expertBrief를 그대로 사용한다.
//
// ⚠️ 고객용 PDF와의 결정적 차이: 이 리포트는 "관리자 전용 내부 검토용"이며,
// 마스터문서 9장이 원래 expertBrief의 용도로 명시한 바로 그 화면
// ("전문가용 결과 화면... Linda 대표가 어드민에서 확인")이다. 따라서
// expertBrief의 riskLevel / checkedItems.reason / rejectionRisks /
// recommendedSteps를 이 파일에서는 그대로 사용한다 — 고객용 PDF에서
// 이 필드들을 절대 쓰지 않는 원칙과 모순되지 않는다(대상이 고객이 아니라
// 관리자이기 때문). similarCases는 실제 사례 DB 연동 전까지 항상 빈
// 배열이므로(허위 데이터 금지 원칙, 마스터문서 16장) 비어 있으면 정직하게
// "연동된 사례 없음"으로 표시하고 지어내지 않는다.
//
// 새 법령·새 위험요인·새 AI 판단을 추가하지 않았다. Risk Assessment의
// "영향/정부 보완 가능성/처리 지연 가능성" 서술은 실제 riskLevel/
// rejectionRisks 유무에 따라 갈리는 정형화된 안내 문장이며, 서비스별
// 구체적 법령·조항을 새로 만들지 않는다.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── 서비스 분류 (mypage-pdf.ts와 동일 로직 복제) ──
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
type FullExpertBrief = {
  riskLevel: "low" | "medium" | "high";
  checkedItems: { label: string; passed: boolean; reason: string }[];
  rejectionRisks: { rank: number; reason: string }[];
  recommendedSteps: string[];
  similarCases: string[];
} | null;

function asFullExpertBrief(value: unknown): FullExpertBrief {
  const m = asMeta(value);
  if (!m) return null;
  const riskLevel = typeof m.riskLevel === "string" ? m.riskLevel : "low";
  const checkedItems = Array.isArray(m.checkedItems)
    ? (m.checkedItems as Array<Record<string, unknown>>)
        .map((it) => ({
          label: typeof it.label === "string" ? it.label : "",
          passed: Boolean(it.passed),
          reason: typeof it.reason === "string" ? it.reason : "",
        }))
        .filter((it) => it.label.length > 0)
    : [];
  const rejectionRisks = Array.isArray(m.rejectionRisks)
    ? (m.rejectionRisks as Array<Record<string, unknown>>).map((r, idx) => ({
        rank: typeof r.rank === "number" ? r.rank : idx + 1,
        reason: typeof r.reason === "string" ? r.reason : "",
      }))
    : [];
  const recommendedSteps = Array.isArray(m.recommendedSteps)
    ? (m.recommendedSteps as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  const similarCases = Array.isArray(m.similarCases)
    ? (m.similarCases as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  return {
    riskLevel: riskLevel === "medium" || riskLevel === "high" ? riskLevel : "low",
    checkedItems,
    rejectionRisks,
    recommendedSteps,
    similarCases,
  };
}

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

// ── Executive Decision — 실제 riskLevel/resultTone/riskCount만 조합, 새 판단기준 없음 ──
type Decision = { label: string; color: ReturnType<typeof rgb>; priority: string };

function computeDecision(
  hasDiagnosis: boolean,
  resultTone: string | null,
  riskLevel: "low" | "medium" | "high" | null,
  riskCount: number | null
): Decision {
  const RED = rgb(0.72, 0.16, 0.16);
  const AMBER = rgb(0.72, 0.46, 0.03);
  const GREEN = rgb(0.04, 0.44, 0.32);
  if (!hasDiagnosis) return { label: "EXPERT REVIEW REQUIRED", color: RED, priority: "High" };
  if (resultTone === "impossible") return { label: "EXPERT REVIEW REQUIRED", color: RED, priority: "High" };
  if (riskLevel === "high") return { label: "EXPERT REVIEW REQUIRED", color: RED, priority: "High" };
  if (resultTone === "conditional" || riskLevel === "medium" || (riskCount ?? 0) > 0) {
    return { label: "PROCEED AFTER SUPPLEMENT", color: AMBER, priority: "Medium" };
  }
  return { label: "PROCEED", color: GREEN, priority: "Standard" };
}

const RISK_LEVEL_LABEL: Record<"low" | "medium" | "high", string> = { low: "LOW", medium: "MEDIUM", high: "HIGH" };
const RISK_LEVEL_COLOR: Record<"low" | "medium" | "high", ReturnType<typeof rgb>> = {
  low: rgb(0.45, 0.45, 0.48),
  medium: rgb(0.72, 0.46, 0.03),
  high: rgb(0.72, 0.16, 0.16),
};

export async function POST(req: NextRequest) {
  try {
    // [2026-08-03 STEP 1 변경] middleware.ts가 고정 접근코드 쿠키 대신
    // 개인별 Supabase Auth 세션으로 /api/admin/* 전체를 보호하도록 바뀌어,
    // 이 파일의 방어적 재확인 로직도 동일한 기준으로 교체했다(비교 대상만
    // 교체 — PDF 생성 로직은 한 글자도 건드리지 않음).
    const readOnlySupabase = createAdminReadOnlyClient(req);
    const {
      data: { user },
    } = await readOnlySupabase.auth.getUser();
    const adminUser = user ? await verifyAdminUser(user.id) : null;
    if (!adminUser) {
      return NextResponse.json({ error: "관리자 인증이 필요합니다." }, { status: 401 });
    }

    const { leadId } = (await req.json()) as { leadId?: string };
    if (!leadId) {
      return NextResponse.json({ error: "leadId가 필요합니다." }, { status: 400 });
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type, result, created_at")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }

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
    const toneLabel = resultTone ? RESULT_LABELS[resultTone] ?? resultTone : null;

    let checklist: SimpleChecklistItem[] = [];
    let expertBrief: FullExpertBrief = null;
    let requiredDocsMandatory: string[] = [];
    let requiredDocsOptional: string[] = [];
    let estimatedDaysText = "서류 검토 후 확정 예정 (Pending document review)";
    let verifyReportRiskFactors: { level: "critical" | "high" | "caution"; label: string }[] | null = null;
    let verifyRecommendedActions: string[] = [];
    let verifyExpertReviewRecommendation = "";
    let verifyAnalysis: { incidentSummary: string; analysisOpinion: string; legalAreas: { area: string; note: string }[] } | null =
      null;

    if (category === "check") {
      expertBrief = asFullExpertBrief(diagMeta?.["expertBrief"]);
      checklist = (expertBrief?.checkedItems ?? []).map((it) => ({ label: it.label, passed: it.passed }));
      const requiredDocs = getRequiredDocuments(normalizedType ?? undefined);
      requiredDocsMandatory = requiredDocs.documents;
      requiredDocsOptional = requiredDocs.optionalDocuments ?? [];
    } else if (category === "register" && normalizedType === "permit_company") {
      const investorType = asStringField(diagMeta, "investorType") as PermitInvestorType | null;
      const capital = asStringField(diagMeta, "capital") as PermitCapital | null;
      const office = asStringField(diagMeta, "office") as PermitOffice | null;
      const residentRep = asStringField(diagMeta, "residentRep") as PermitResidentRep | null;
      const documentService = asStringField(diagMeta, "documentService") ?? "permit_company";
      const requiredDocs = getRequiredDocuments(documentService);
      requiredDocsMandatory = requiredDocs.documents;
      requiredDocsOptional = requiredDocs.optionalDocuments ?? [];

      if (investorType && capital && office && residentRep) {
        const recomputed = await getCheckDiagnosis({ service: "permit_company", investorType, capital, office, residentRep });
        if (recomputed) {
          checklist = recomputed.customerView.checklist;
          expertBrief = recomputed.expertBrief;
          if (recomputed.customerView.estimatedDays) {
            estimatedDaysText = `${recomputed.customerView.estimatedDays.min}~${recomputed.customerView.estimatedDays.max}일`;
          }
        }
      }
    } else if (category === "register" && normalizedType && REGISTER_STUB_CONFIG[normalizedType]) {
      const cfg = REGISTER_STUB_CONFIG[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsMandatory = requiredDocs.documents;
      requiredDocsOptional = requiredDocs.optionalDocuments ?? [];
      checklist = diagMeta
        ? [
            { label: "사업자·법인 등록 서류 준비", passed: asStringField(diagMeta, "registrationStatus") === "confirmed" },
            { label: cfg.facilityLabel, passed: asStringField(diagMeta, cfg.facilityField) === "secured" },
            { label: cfg.readyLabel, passed: asStringField(diagMeta, cfg.readyField) === "ready" },
          ]
        : [];
      // ⚠️ REGISTER 업종허가 7종은 각 페이지에 expertBrief 구조 자체가 없다
      // (checkedItems.reason/rejectionRisks/recommendedSteps 생성 로직이 없음).
      // 없는 데이터를 지어내지 않고 expertBrief=null로 남긴다.
    } else if (category === "verify" && normalizedType) {
      const verifyCategory = VERIFY_CATEGORY_MAP[normalizedType];
      const requiredDocs = getRequiredDocuments(normalizedType);
      requiredDocsMandatory = requiredDocs.documents;
      requiredDocsOptional = requiredDocs.optionalDocuments ?? [];

      if (verifyCategory) {
        const incidentType = asStringField(diagMeta, "incident_type") ?? undefined;
        const incidentDescription = asStringField(diagMeta, "incident_description") ?? undefined;
        const fileUrl = asStringField(diagMeta, "file_url");
        const fileName = asStringField(diagMeta, "file_name");

        const diag = await getVerifyDiagnosis(verifyCategory, { fileUrl, fileName, incidentType, incidentDescription });
        checklist = diag.checklist.map((c) => ({ label: c.label, passed: c.level !== "critical" }));
        expertBrief = asFullExpertBrief(diag.expertBrief as unknown);
        if (diag.report) {
          verifyReportRiskFactors = diag.report.riskFactors;
          verifyRecommendedActions = diag.report.recommendedActions;
          verifyExpertReviewRecommendation = diag.report.expertReviewRecommendation;
          verifyAnalysis = {
            incidentSummary: diag.report.incidentSummary,
            analysisOpinion: diag.report.analysisOpinion,
            legalAreas: diag.report.legalAreas,
          };
        }
      }
    }

    const passedCount = checklist.filter((c) => c.passed).length;
    const failedCount = checklist.length - passedCount;
    const riskLevel = expertBrief?.riskLevel ?? null;
    const riskCount =
      category === "verify" && verifyReportRiskFactors ? verifyReportRiskFactors.length : checklist.length > 0 ? failedCount : null;
    const decision = computeDecision(hasDiagnosis, resultTone, riskLevel, riskCount);
    const processSteps = buildProcessSteps(category, hasDiagnosis, hasExpertReview, hasAgency, hasGovSubmit, hasPermitDone);
    const currentStageLabel = [...processSteps].reverse().find((s) => s.done)?.label ?? "접수 전";
    const confidenceText = typeof feasibilityScore === "number" ? `${feasibilityScore}%` : "N/A";
    const complianceText = checklist.length > 0 ? `${passedCount}/${checklist.length} requirements met` : "N/A";
    const outstandingDocsText = `${requiredDocsMandatory.length} mandatory`;

    // ── PDF 생성 (2페이지) ──
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Regular.ttf")));
    const fontBold = await doc.embedFont(fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf")));
    const watermarkImage = await doc.embedPng(fs.readFileSync(path.join(process.cwd(), "public/vfbcai-shield-logo.png")));

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 44;
    const contentWidth = pageWidth - marginX * 2;
    const BODY_MIN_Y = 90;

    const receiptNumber = `VF${leadId.slice(0, 8).toUpperCase()}`;
    const generatedDate = formatDateDot(new Date().toISOString());

    function wrapLines(text: string, size: number, useFont: PDFFont, maxWidth: number): string[] {
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (useFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else current = candidate;
      }
      if (current) lines.push(current);
      return lines.length > 0 ? lines : [""];
    }

    function makeDrawers(targetPage: PDFPage, x: number, width: number, state: { y: number }) {
      function drawParagraphList(
        lines: string[],
        size = 8.6,
        lineGap = 3.6,
        maxLines = 20,
        color = rgb(0.28, 0.28, 0.3),
        minY = BODY_MIN_Y
      ) {
        let used = 0;
        for (const line of lines) {
          if (used >= maxLines) return;
          const wrapped = wrapLines(line, size, font, width);
          for (const w of wrapped) {
            if (used >= maxLines) return;
            if (state.y - (size + lineGap) < minY) {
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
      function drawSectionHeader(title: string, subtitle?: string): boolean {
        const needed = subtitle ? 30 : 20;
        if (state.y - needed < BODY_MIN_Y) return false;
        state.y -= 3;
        targetPage.drawRectangle({ x, y: state.y - 1, width: 3.5, height: 13, color: rgb(0.09, 0.15, 0.35) });
        targetPage.drawText(title, { x: x + 10, y: state.y, size: 12, font: fontBold, color: rgb(0.09, 0.1, 0.13) });
        state.y -= 14;
        if (subtitle) {
          targetPage.drawText(subtitle, { x: x + 10, y: state.y, size: 7.3, font, color: rgb(0.52, 0.52, 0.56) });
          state.y -= 14;
        } else {
          state.y -= 6;
        }
        return true;
      }
      return { drawParagraphList, drawSectionHeader };
    }

    function drawTopBadge(targetPage: PDFPage) {
      targetPage.drawRectangle({ x: 0, y: pageHeight - 4, width: pageWidth, height: 4, color: rgb(0.09, 0.15, 0.35) });
      const wmSize = 240;
      targetPage.drawImage(watermarkImage, {
        x: (pageWidth - wmSize) / 2,
        y: pageHeight / 2 - wmSize / 2,
        width: wmSize,
        height: wmSize,
        opacity: 0.03,
      });
      const badge = "INTERNAL USE ONLY · CONFIDENTIAL";
      const bw = fontBold.widthOfTextAtSize(badge, 7.5);
      targetPage.drawRectangle({
        x: pageWidth - marginX - bw - 12,
        y: pageHeight - 22,
        width: bw + 12,
        height: 13,
        color: rgb(0.72, 0.16, 0.16),
      });
      targetPage.drawText(badge, {
        x: pageWidth - marginX - bw - 6,
        y: pageHeight - 18.5,
        size: 7.5,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
    }

    function drawFooter(targetPage: PDFPage, pageLabel: string) {
      const footerY = 34;
      targetPage.drawLine({
        start: { x: marginX, y: footerY + 20 },
        end: { x: pageWidth - marginX, y: footerY + 20 },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      targetPage.drawText(
        `Prepared by VFBCAI · Vietnam Foreign Business Verification & Compliance AI Center · Administrative Intelligence Engine`,
        { x: marginX, y: footerY + 9, size: 6.3, font, color: rgb(0.5, 0.5, 0.5) }
      );
      targetPage.drawText(`Report ID ${receiptNumber}  ·  Generated ${generatedDate}  ·  ${pageLabel}`, {
        x: marginX,
        y: footerY,
        size: 6.3,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      const disclaimer =
        "Internal review document. Not for external or customer distribution. Final determination requires expert verification.";
      targetPage.drawText(disclaimer, {
        x: pageWidth - marginX - font.widthOfTextAtSize(disclaimer, 6.3),
        y: footerY,
        size: 6.3,
        font,
        color: rgb(0.6, 0.35, 0.35),
      });
    }

    // ══════════════════════════ PAGE 1 ══════════════════════════
    const page1 = doc.addPage([pageWidth, pageHeight]);
    drawTopBadge(page1);

    let y = pageHeight - 46;
    const logoSize = 30;
    page1.drawImage(watermarkImage, { x: marginX, y: y - logoSize + 6, width: logoSize, height: logoSize });
    page1.drawText("VFBCAI", { x: marginX + logoSize + 11, y, size: 15, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
    page1.drawText("Administrative Case Review · 내부 검토용", {
      x: marginX + logoSize + 11,
      y: y - 14,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    const rightTitle = "Executive Case Review Report";
    page1.drawText(rightTitle, {
      x: pageWidth - marginX - fontBold.widthOfTextAtSize(rightTitle, 12),
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.09, 0.15, 0.35),
    });
    page1.drawText(`${serviceLabel}  ·  ${receiptNumber}`, {
      x: pageWidth - marginX - font.widthOfTextAtSize(`${serviceLabel}  ·  ${receiptNumber}`, 8),
      y: y - 14,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 40;
    page1.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 0.75, color: rgb(0.85, 0.85, 0.85) });
    y -= 22;

    // ── 1. Executive Decision ──
    const decisionHeight = 56;
    page1.drawRectangle({
      x: marginX,
      y: y - decisionHeight,
      width: contentWidth,
      height: decisionHeight,
      borderColor: decision.color,
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98),
    });
    page1.drawRectangle({ x: marginX, y: y - decisionHeight, width: 6, height: decisionHeight, color: decision.color });
    page1.drawText("EXECUTIVE DECISION", { x: marginX + 20, y: y - 16, size: 8, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
    page1.drawText(decision.label, { x: marginX + 20, y: y - 38, size: 20, font: fontBold, color: decision.color });
    y -= decisionHeight + 20;

    // ── 2. Executive Dashboard (7 metrics) ──
    {
      const state = { y };
      const d = makeDrawers(page1, marginX, contentWidth, state);
      d.drawSectionHeader("EXECUTIVE DASHBOARD");
      const metrics: [string, string][] = [
        ["Decision", decision.label],
        ["Confidence", confidenceText],
        ["Compliance", complianceText],
        ["Outstanding Documents", outstandingDocsText],
        ["Current Stage", currentStageLabel],
        ["Timeline", estimatedDaysText],
        ["Priority", decision.priority],
      ];
      const cols = 4;
      const cellW = contentWidth / cols;
      const rowH = 34;
      metrics.forEach(([label, value], idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = marginX + col * cellW;
        const cy = state.y - row * rowH;
        page1.drawText(label.toUpperCase(), { x: cx, y: cy, size: 6.3, font: fontBold, color: rgb(0.55, 0.55, 0.58) });
        const valSize = value.length > 16 ? 8.2 : 10;
        page1.drawText(value, { x: cx, y: cy - 13, size: valSize, font: fontBold, color: rgb(0.12, 0.12, 0.15) });
      });
      const rows = Math.ceil(metrics.length / cols);
      state.y -= rows * rowH + 6;
      y = state.y;
    }
    page1.drawLine({ start: { x: marginX, y: y + 6 }, end: { x: pageWidth - marginX, y: y + 6 }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });

    // ── 3. Executive Summary (결론 → 핵심 판단 이유 → 현재 행정 상태 → 권장 진행 방향 → AI 판단 기준) ──
    {
      const state = { y: y - 10 };
      const d = makeDrawers(page1, marginX, contentWidth, state);
      if (d.drawSectionHeader("EXECUTIVE SUMMARY", "결론 · 핵심 판단 이유 · 현재 행정 상태 · 권장 진행 방향 · AI 판단 기준")) {
        const conclusion =
          category === "verify"
            ? `결론 — ${decision.label} (문서 검토, ${serviceLabel})`
            : `결론 — ${decision.label} (${serviceLabel} 진행 가능성 ${toneLabel ?? "확인 전"}${
                typeof feasibilityScore === "number" ? `, ${feasibilityScore}%` : ""
              })`;

        const coreReasonSource = expertBrief?.rejectionRisks.map((r) => r.reason) ?? [];
        const coreReason =
          coreReasonSource.length > 0
            ? `핵심 판단 이유 — ${coreReasonSource.slice(0, 3).join(" / ")}`
            : verifyAnalysis
              ? `핵심 판단 이유 — ${verifyAnalysis.analysisOpinion}`
              : checklist.length > 0
                ? `핵심 판단 이유 — 확인 항목 ${passedCount}/${checklist.length}건 충족, 특별한 추가 위험요인 없음`
                : "핵심 판단 이유 — 연결된 진단 데이터 없음";

        const adminStatus = `현재 행정 상태 — ${currentStageLabel} (${processSteps.filter((s) => s.done).length}/${processSteps.length}단계 완료)`;

        const nextStepsSource = expertBrief?.recommendedSteps ?? verifyRecommendedActions;
        const recommendation =
          nextStepsSource.length > 0
            ? `권장 진행 방향 — ${nextStepsSource.slice(0, 2).join(" / ")}`
            : requiredDocsMandatory.length > 0
              ? `권장 진행 방향 — 필수서류(${requiredDocsMandatory.slice(0, 3).join(", ")}) 원본 확인 후 진행`
              : "권장 진행 방향 — 연결된 권고 데이터 없음";

        const aiBasis =
          "AI 판단 기준 — VFBCAI 행정 진단 규칙(checkDiagnosis.ts / verifyDiagnosis.ts)과 입력된 고객 답변을 기준으로 생성되었으며, 법령 조문을 직접 인용하지 않습니다.";

        d.drawParagraphList([conclusion, coreReason, adminStatus, recommendation, aiBasis], 8.8, 5, 12, rgb(0.2, 0.2, 0.23));
      }
      drawFooter(page1, "Page 1 of 2");
    }

    // ══════════════════════════ PAGE 2 ══════════════════════════
    const page2 = doc.addPage([pageWidth, pageHeight]);
    drawTopBadge(page2);

    let y2 = pageHeight - 42;
    page2.drawText("VFBCAI · Internal Case Review (continued)", { x: marginX, y: y2, size: 8.5, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
    page2.drawText(`${serviceLabel}  ·  ${receiptNumber}`, {
      x: pageWidth - marginX - font.widthOfTextAtSize(`${serviceLabel}  ·  ${receiptNumber}`, 7.5),
      y: y2,
      size: 7.5,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y2 -= 12;
    page2.drawLine({ start: { x: marginX, y: y2 }, end: { x: pageWidth - marginX, y: y2 }, thickness: 0.75, color: rgb(0.85, 0.85, 0.85) });
    y2 -= 20;

    const gutter = 18;
    const leftWidth2 = Math.round(contentWidth * 0.56);
    const rightWidth2 = contentWidth - leftWidth2 - gutter;
    const leftX2 = marginX;
    const rightX2 = marginX + leftWidth2 + gutter;
    const leftState2 = { y: y2 };
    const rightState2 = { y: y2 };
    const left2 = makeDrawers(page2, leftX2, leftWidth2, leftState2);
    const right2 = makeDrawers(page2, rightX2, rightWidth2, rightState2);

    // ── 4. Administrative Evidence ── (좌측)
    if (left2.drawSectionHeader("ADMINISTRATIVE EVIDENCE")) {
      const evidenceLines: string[] = [];
      if (checklist.length > 0) {
        checklist.slice(0, 6).forEach((item) => {
          evidenceLines.push(item.label);
          const reason = expertBrief?.checkedItems.find((c) => c.label === item.label)?.reason;
          evidenceLines.push(`  ↓  ${item.passed ? "Verified / Requirement Satisfied" : "Not Confirmed"}${reason ? ` — ${reason}` : ""}`);
        });
      } else {
        evidenceLines.push("연결된 확인 항목 데이터가 없습니다.");
      }
      left2.drawParagraphList(evidenceLines, 8.3, 3.4, 16, rgb(0.24, 0.24, 0.27));
      if (leftState2.y > BODY_MIN_Y) leftState2.y -= 10;
    }

    // ── 5. Risk Assessment ── (좌측 계속)
    if (left2.drawSectionHeader("RISK ASSESSMENT")) {
      const riskLines: string[] = [];
      if (category === "verify" && verifyReportRiskFactors) {
        if (verifyReportRiskFactors.length > 0) {
          verifyReportRiskFactors.forEach((r) => {
            const tag = r.level === "critical" ? "[HIGH]" : r.level === "high" ? "[MEDIUM]" : "[LOW]";
            riskLines.push(`${tag} ${r.label}`);
          });
        } else {
          riskLines.push("[LOW] 확인된 항목 기준으로 별도 위험요인이 발견되지 않았습니다.");
        }
      } else if (riskLevel) {
        riskLines.push(`[${RISK_LEVEL_LABEL[riskLevel]}] Overall Risk Level`);
        riskLines.push(`영향 — ${riskLevel === "high" ? "반려 또는 보완요청 가능성이 있는 항목이 확인됨" : riskLevel === "medium" ? "일부 보완 필요 항목이 확인됨" : "특별한 영향 요인 없음"}`);
        riskLines.push(`정부 보완 가능성 — ${(expertBrief?.rejectionRisks.length ?? 0) > 0 ? "있음" : "낮음"}`);
        riskLines.push(`처리 지연 가능성 — ${riskLevel === "high" ? "있음" : "낮음"}`);
        if (expertBrief && expertBrief.rejectionRisks.length > 0) {
          riskLines.push("Contributing factors:");
          expertBrief.rejectionRisks.slice(0, 4).forEach((r) => riskLines.push(`  ${r.rank}. ${r.reason}`));
        }
      } else {
        riskLines.push("연결된 위험요인 평가 데이터가 없습니다.");
      }
      const riskColor =
        riskLevel === "high" || (verifyReportRiskFactors && verifyReportRiskFactors.some((r) => r.level === "critical"))
          ? RISK_LEVEL_COLOR.high
          : riskLevel === "medium"
            ? RISK_LEVEL_COLOR.medium
            : rgb(0.24, 0.24, 0.27);
      left2.drawParagraphList(riskLines, 8.3, 3.4, 14, riskColor);
    }

    // ── 6. Missing Documents (Mandatory / Optional) ── (우측)
    if (right2.drawSectionHeader("MISSING DOCUMENTS")) {
      const docLines: string[] = ["Mandatory:"];
      if (requiredDocsMandatory.length > 0) requiredDocsMandatory.slice(0, 6).forEach((doc) => docLines.push(`• ${doc}`));
      else docLines.push("• 연결된 필수서류 목록이 없습니다.");
      docLines.push("Optional:");
      if (requiredDocsOptional.length > 0) requiredDocsOptional.slice(0, 4).forEach((doc) => docLines.push(`• ${doc}`));
      else docLines.push("• 없음");
      right2.drawParagraphList(docLines, 8, 3.4, 16, rgb(0.28, 0.28, 0.31));
      if (rightState2.y > BODY_MIN_Y) rightState2.y -= 10;
    }

    // ── 7. Recommended Actions (Priority 1/2/3) ── (우측 계속)
    if (right2.drawSectionHeader("RECOMMENDED ACTIONS")) {
      const actionSource =
        (expertBrief?.recommendedSteps.length ?? 0) > 0
          ? expertBrief!.recommendedSteps
          : verifyRecommendedActions.length > 0
            ? [...verifyRecommendedActions, verifyExpertReviewRecommendation].filter(Boolean)
            : requiredDocsMandatory.length > 0
              ? [`필수서류(${requiredDocsMandatory.slice(0, 3).join(", ")}) 원본 확인`, "전문가 최종 검토 진행"]
              : [];
      const actionLines =
        actionSource.length > 0
          ? actionSource.slice(0, 3).map((a, idx) => `Priority ${idx + 1} — ${a}`)
          : ["연결된 권고 데이터가 없습니다."];
      right2.drawParagraphList(actionLines, 8.3, 4, 10, rgb(0.24, 0.24, 0.27));
    }

    // ── 8. Assessment Basis ── (좌측 하단, 남은 공간 활용)
    if (left2.drawSectionHeader("ASSESSMENT BASIS")) {
      left2.drawParagraphList(
        [
          `Administrative Requirements — ${serviceLabel} 진단 규칙(checkDiagnosis.ts / verifyDiagnosis.ts)`,
          "Required Documents — requiredDocuments.ts 등록 기준",
          "Administrative Procedure — VFBCAI 표준 진행단계(CRM 활동 기준)",
          "VFBCAI Administrative Knowledge Base — 내부 행정 규칙 데이터베이스",
          "본 리포트는 실제 법령 조문을 직접 인용하지 않으며, 최종 판단은 전문가 검토를 통해 확정됩니다.",
        ],
        7.8,
        3.4,
        10,
        rgb(0.4, 0.4, 0.43)
      );
    }

    // ── 9. Internal Review Notes (빈 메모 영역, DB 저장 없음) ── (우측 하단)
    {
      const notesTop = rightState2.y;
      const notesHeight = Math.max(60, notesTop - BODY_MIN_Y - 4);
      if (notesHeight > 40) {
        page2.drawRectangle({
          x: rightX2,
          y: notesTop - notesHeight,
          width: rightWidth2,
          height: notesHeight,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 0.75,
        });
        page2.drawText("INTERNAL REVIEW NOTES", { x: rightX2 + 8, y: notesTop - 14, size: 7.5, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
        page2.drawText("(기록은 저장되지 않습니다 · Not stored in database)", {
          x: rightX2 + 8,
          y: notesTop - 24,
          size: 6.2,
          font,
          color: rgb(0.65, 0.65, 0.68),
        });
        let ruleY = notesTop - 36;
        while (ruleY > notesTop - notesHeight + 8) {
          page2.drawLine({
            start: { x: rightX2 + 8, y: ruleY },
            end: { x: rightX2 + rightWidth2 - 8, y: ruleY },
            thickness: 0.4,
            color: rgb(0.9, 0.9, 0.9),
          });
          ruleY -= 14;
        }
      }
    }

    drawFooter(page2, "Page 2 of 2");

    const pdfBytes = await doc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vfbcai-admin-case-${leadId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("admin case-pdf route error:", err);
    return NextResponse.json({ error: "PDF 생성 중 문제가 발생했습니다." }, { status: 500 });
  }
}
