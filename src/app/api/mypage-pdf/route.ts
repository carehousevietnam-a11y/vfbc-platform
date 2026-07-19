import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// 이 파일은 서버에서만 실행됩니다. service role key는 절대 브라우저로 노출되지 않습니다.
//
// STEP3: 고객용 AI 결과 PDF.
// - 인증: /api/mypage-data와 동일하게 access_token을 서버에서 직접 검증한다.
// - 데이터: 이 리드가 실제로 로그인한 본인 소유인지(leads.user_id) 확인 후에만
//   PDF를 만든다.
// - 새 라이브러리(pdf-lib, @pdf-lib/fontkit)를 이번에 처음 추가했다 — PDF
//   생성 자체가 이 프로젝트에 전혀 없던 기능이라 불가피하다. DB/테이블/컬럼은
//   전혀 추가하지 않았다.
// - 한글 폰트(Pretendard)는 public/fonts/에 정적 파일로 포함해 배포 환경에서
//   항상 함께 배포되도록 했다(런타임에 외부 폰트를 내려받지 않음).
// - ⚠️ 안전 경계: expertBrief / expert_brief / checkedItems / rejectionRisks /
//   recommendedSteps / similarCases 등 전문가 전용 데이터는 절대 포함하지
//   않는다. /api/mypage-data와 동일하게 feasibilityScore·result·진행단계·
//   처리이력 등 고객에게 이미 노출 중인 안전한 필드만 사용한다.

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

// ── 진행 단계 (mypage-data/route.ts, admin/leads/[id]/page.tsx와 동일 원칙) ──
type ProcessStep = { label: string; done: boolean };

function cascadeDone(rawDone: boolean[]): boolean[] {
  let lastTrueIndex = -1;
  rawDone.forEach((d, i) => {
    if (d) lastTrueIndex = i;
  });
  return rawDone.map((_, i) => i <= lastTrueIndex);
}

function buildSteps(
  category: CategoryKey,
  hasDiagnosis: boolean,
  hasExpertReview: boolean,
  hasAgency: boolean,
  hasGovernmentSubmitted: boolean,
  hasPermitCompleted: boolean
): ProcessStep[] {
  if (category === "verify") {
    const done = cascadeDone([true, hasDiagnosis, hasExpertReview, false]);
    return [
      { label: "접수 완료", done: done[0] },
      { label: "자체 진단 완료", done: done[1] },
      { label: "전문가 검토 요청", done: done[2] },
      { label: "전문가 안내 대기", done: done[3] },
    ];
  }
  if (category === "consultation") {
    const done = cascadeDone([true, false]);
    return [
      { label: "상담 접수 완료", done: done[0] },
      { label: "담당자 확인 대기", done: done[1] },
    ];
  }
  const done = cascadeDone([true, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted]);
  return [
    { label: "접수 완료", done: done[0] },
    { label: "AI 진단 완료", done: done[1] },
    { label: "전문가 검토", done: done[2] },
    { label: "대행 신청", done: done[3] },
    { label: "정부 제출", done: done[4] },
    { label: "허가 완료", done: done[5] },
  ];
}

// STAGE_ACTIONS 화이트리스트 + 고객용 라벨 변환 (mypage-data/route.ts와 동일 원칙)
const STAGE_ACTIONS = new Set([
  "verify_lead",
  "expert_review_request",
  "agency_upgrade_request",
  "consultation_request",
  "process_government_submitted",
  "process_permit_completed",
]);

function getActivityLabel(action: string): string {
  if (action === "verify_lead" || action.endsWith("_diagnosis_lead")) return "AI 검토 완료";
  if (action === "expert_review_request") return "전문가 검토 시작";
  if (action === "agency_upgrade_request") return "대행 신청 접수";
  if (action === "consultation_request") return "상담 신청 접수";
  if (action === "process_government_submitted") return "정부 제출 완료";
  if (action === "process_permit_completed") return "허가 완료";
  return "진행 업데이트";
}

function asMeta(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function formatDateDot(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

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

    // 본인 소유 리드인지 반드시 확인 (leadId만으로 타인 정보 조회 방지)
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, service_type, result, created_at, user_id")
      .eq("id", leadId)
      .eq("user_id", userId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: "해당 신청 내역을 찾을 수 없습니다." }, { status: 404 });
    }

    const { data: profile } = await supabaseAdmin.from("users").select("name").eq("id", userId).maybeSingle();

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
    const hasGovernmentSubmitted = actions.has("process_government_submitted");
    const hasPermitCompleted = actions.has("process_permit_completed");

    // ⚠️ feasibilityScore만 안전하게 재사용 — expertBrief/expert_brief는 절대 읽지 않는다.
    let feasibilityScore: number | null = null;
    for (const a of activities) {
      const meta = asMeta(a.meta);
      if (typeof meta?.feasibilityScore === "number") {
        feasibilityScore = meta.feasibilityScore as number;
      }
    }

    const normalizedType = normalizeServiceType(lead.service_type);
    const category = getCategory(normalizedType);
    const serviceLabel = getServiceLabel(normalizedType ?? lead.service_type ?? "");
    const resultLabel = lead.result ? RESULT_LABELS[lead.result] ?? null : null;

    const steps = buildSteps(category, hasDiagnosis, hasExpertReview, hasAgency, hasGovernmentSubmitted, hasPermitCompleted);
    const activityLog = activities
      .filter((a) => a.action && (STAGE_ACTIONS.has(a.action) || a.action.endsWith("_diagnosis_lead")))
      .map((a) => ({ label: getActivityLabel(a.action as string), createdAt: a.created_at as string }));

    // ── PDF 생성 ──
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const regularBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Regular.ttf"));
    const boldBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Pretendard-Bold.ttf"));
    const font = await doc.embedFont(regularBytes);
    const fontBold = await doc.embedFont(boldBytes);

    const pageWidth = 595;
    const pageHeight = 842;
    const marginX = 50;
    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 60;

    function ensureSpace(needed: number) {
      if (y - needed < 60) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 60;
      }
    }

    function drawTitle(text: string, size = 18) {
      ensureSpace(size + 10);
      page.drawText(text, { x: marginX, y, size, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
      y -= size + 12;
    }

    function drawSectionHeader(text: string) {
      ensureSpace(30);
      page.drawText(text, { x: marginX, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 6;
      page.drawLine({
        start: { x: marginX, y },
        end: { x: pageWidth - marginX, y },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      y -= 16;
    }

    function drawLine(text: string, size = 10, color = rgb(0.25, 0.25, 0.25), useFont = font) {
      ensureSpace(size + 8);
      page.drawText(text, { x: marginX, y, size, font: useFont, color });
      y -= size + 8;
    }

    // 표지
    drawTitle("VFBCAI AI 진단 결과 리포트");
    drawLine(`발급일: ${formatDateDot(new Date().toISOString())}`, 9, rgb(0.5, 0.5, 0.5));
    y -= 6;

    // 신청 정보
    drawSectionHeader("신청 정보");
    drawLine(`고객명: ${profile?.name ?? "-"}`);
    drawLine(`서비스: ${serviceLabel}`);
    drawLine(`접수일: ${formatDateDot(lead.created_at as string)}`);
    y -= 6;

    // AI 예측 결과
    drawSectionHeader("AI 예측 결과");
    if (typeof feasibilityScore === "number") {
      ensureSpace(40);
      page.drawText(`${feasibilityScore}%`, { x: marginX, y: y - 6, size: 28, font: fontBold, color: rgb(0.09, 0.15, 0.35) });
      y -= 40;
      drawLine("허가 가능성 (1차 자가진단 기준)", 9, rgb(0.5, 0.5, 0.5));
    }
    if (resultLabel) {
      drawLine(`결과: ${resultLabel}`, 11, rgb(0.1, 0.1, 0.1), fontBold);
    }
    if (typeof feasibilityScore !== "number" && !resultLabel) {
      drawLine("아직 AI 진단 결과가 없습니다.", 10, rgb(0.6, 0.6, 0.6));
    }
    y -= 6;

    // 진행 현황
    drawSectionHeader("진행 현황");
    for (const step of steps) {
      drawLine(`${step.done ? "[완료]" : "[대기]"} ${step.label}`, 10, step.done ? rgb(0.05, 0.4, 0.2) : rgb(0.6, 0.6, 0.6));
    }
    y -= 6;

    // 처리 이력
    drawSectionHeader("처리 이력");
    if (activityLog.length === 0) {
      drawLine("아직 기록된 처리 이력이 없습니다.", 10, rgb(0.6, 0.6, 0.6));
    } else {
      for (const entry of activityLog) {
        drawLine(`${formatDateDot(entry.createdAt)}   ${entry.label}`, 10);
      }
    }
    y -= 10;

    // 안내문
    ensureSpace(60);
    page.drawText(
      "본 리포트는 입력하신 정보를 기준으로 한 1차 자가진단 및 진행상황 요약입니다.",
      { x: marginX, y, size: 8, font, color: rgb(0.55, 0.55, 0.55) }
    );
    y -= 12;
    page.drawText(
      "정확한 진행·허가 가능 여부는 서류 검토 후 전문가 상담을 통해 확정됩니다.",
      { x: marginX, y, size: 8, font, color: rgb(0.55, 0.55, 0.55) }
    );

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
