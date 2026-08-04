// src/app/admin/documents/page.tsx
//
// 관리자 Document Center — 좌측 메뉴 "문서 관리"의 실제 구현.
// 고객이 /documents 페이지에서 제출한 문서(crm_activities.action = "document_upload")를
// 신청건 전체에 걸쳐 한 화면에서 검색·필터링해 확인하는 화면이다.
//
// 이 페이지는 admin/cases/page.tsx · admin/cases/[leadId]/page.tsx와 동일한 원칙을 따른다.
// - 새 테이블·새 컬럼·새 API route·새 Storage 구조를 만들지 않는다.
// - "문서 단위 승인/반려" 같은 데이터는 프로젝트에 존재하지 않으므로, 문서 상태는 같은
//   신청건(lead)에 이미 기록된 실제 action(expert_review_request, agency_upgrade_request)과
//   진단 결과(meta.expertBrief / meta.expert_brief)만으로 계산한다. 한 신청건에 속한 문서는
//   그 신청건의 진행 상태를 공유한다(문서별 개별 승인 기록이 없기 때문).
// - 다운로드/미리보기는 admin/cases/[leadId]/page.tsx가 이미 쓰는 방식(Storage "documents"
//   버킷 + createSignedUrl, 1시간 유효)을 그대로 재사용한다. 새 PDF Viewer·새 Modal 없음.
// - getCategory/getServiceLabel 등은 admin/cases/page.tsx의 로컬 함수와 동일한 로직이다.
//   다른 파일의 비공개(export 되지 않은) 함수라 import할 수 없어, 이 프로젝트의 기존 관례대로
//   (admin/cases/page.tsx와 admin/cases/[leadId]/page.tsx도 서로 이 매핑을 각자 갖고 있다)
//   이 파일에도 동일하게 복제했다. 원본 파일은 전혀 수정하지 않았다.

import Link from "next/link";
import {
  FileText,
  FileWarning,
  Upload,
  Sparkles,
  Search as SearchIcon,
  ExternalLink,
  Download,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
// v2: "문서 제출 진행률"에 재사용 — /documents(고객용 업로드 페이지)가 이미 쓰는 서비스별
// 필수서류 목록을 그대로 가져다 쓴다. 이 파일(requiredDocuments.ts) 자체는 수정하지 않는다.
import { getRequiredDocuments } from "@/lib/requiredDocuments";

export const dynamic = "force-dynamic";

// ── 서비스 분류 (admin/cases/page.tsx와 동일) ──
const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company",
};

function normalizeServiceType(serviceType: string | null | undefined): string | null {
  if (!serviceType) return serviceType ?? null;
  return SERVICE_TYPE_ALIASES[serviceType] ?? serviceType;
}

function toPrefixKey(value: string): string {
  return value.toLowerCase().replace(/-/g, "_");
}

const CHECK_SERVICE_TYPES = ["wp", "trc", "tamtru", "driving-license"];

type CategoryKey = "check" | "verify" | "permit" | "consultation" | "unclassified";

function getCategory(serviceType: string | null | undefined): CategoryKey {
  const normalized = normalizeServiceType(serviceType);
  if (!normalized) return "unclassified";
  if (normalized === "consultation") return "consultation";

  const prefixKey = toPrefixKey(normalized);
  if (prefixKey.startsWith("verify")) return "verify";
  if (prefixKey.startsWith("permit")) return "permit";
  if (prefixKey.startsWith("register")) return "permit";
  if (CHECK_SERVICE_TYPES.includes(normalized)) return "check";
  return "unclassified";
}

const CATEGORY_INFO: Record<CategoryKey, { label: string; badgeColor: string }> = {
  check: { label: "CHECK", badgeColor: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100" },
  verify: { label: "VERIFY", badgeColor: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200" },
  permit: { label: "REGISTER", badgeColor: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100" },
  consultation: { label: "상담문의", badgeColor: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100" },
  unclassified: { label: "미분류", badgeColor: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100" },
};

// v3: admin/cases/page.tsx의 DateContentGroup categoryTheme과 동일한 팔레트를 그대로
// 복제했다(다른 파일의 비공개 상수라 import 불가). 날짜 그룹 안의 카테고리 요약카드 색상을
// 신청건 관리와 동일하게 맞추기 위함이다.
const CATEGORY_ORDER: CategoryKey[] = ["check", "verify", "permit", "consultation", "unclassified"];

const CATEGORY_THEME: Record<CategoryKey, { dot: string; shell: string; label: string; count: string }> = {
  check: { dot: "bg-blue-600", shell: "border-blue-100 bg-blue-50/45", label: "text-blue-700", count: "text-blue-700" },
  verify: { dot: "bg-violet-600", shell: "border-violet-100 bg-violet-50/45", label: "text-violet-700", count: "text-violet-700" },
  permit: { dot: "bg-emerald-600", shell: "border-emerald-100 bg-emerald-50/45", label: "text-emerald-700", count: "text-emerald-700" },
  consultation: { dot: "bg-amber-500", shell: "border-amber-100 bg-amber-50/45", label: "text-amber-700", count: "text-amber-700" },
  unclassified: { dot: "bg-slate-500", shell: "border-slate-200 bg-slate-50", label: "text-slate-700", count: "text-slate-700" },
};

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
  consultation: "일반 상담문의",
  register_restaurant: "식당허가",
  register_cosmetics: "화장품허가",
  register_environment: "환경허가",
  register_fire_safety: "소방허가",
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가",
  permit_company: "법인설립",
  permit_franchise: "프랜차이즈허가",
  verify_admin: "행정문서 검토",
  verify_fraud: "사기·피해 검토",
  verify_real_estate: "부동산 검토",
  verify_tax: "세무 검토",
  verify_unclear: "기타·불명확 검토",
};

function getServiceLabel(serviceType: string): string {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];
  if (key.startsWith("verify")) {
    const sub = key.replace(/^verify_?/, "");
    return sub ? `VERIFY · ${sub}` : "VERIFY";
  }
  if (key.startsWith("permit") || key.startsWith("register")) {
    const sub = key.replace(/^(permit|register)_?/, "");
    return sub ? `REGISTER · ${sub}` : "REGISTER";
  }
  return serviceType;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDateTime(createdAt: string) {
  return new Date(createdAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 화면 표시용 파일명만 축약한다. 원본 fileName, Storage path, Signed URL은 변경하지 않는다.
function formatDisplayFileName(fileName: string | null, maxBaseLength = 22): string {
  if (!fileName) return "-";
  const lastDot = fileName.lastIndexOf(".");
  const hasExtension = lastDot > 0 && lastDot < fileName.length - 1;
  const extension = hasExtension ? fileName.slice(lastDot) : "";
  const baseName = hasExtension ? fileName.slice(0, lastDot) : fileName;
  if (baseName.length <= maxBaseLength) return fileName;
  return `${baseName.slice(0, maxBaseLength).trimEnd()}…${extension}`;
}

function formatCompactDateTime(createdAt: string) {
  return new Date(createdAt).toLocaleString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ── v3: 날짜 그룹 — admin/cases/page.tsx의 dateKeyOf/formatDateKey/getRelativeDateLabel과
// 동일한 로직을 그대로 복제했다(다른 파일의 비공개 함수라 import 불가, 이 파일의 기존 관례와
// 동일). 새 날짜 계산 방식이 아니라 기존 uploaded_at(=crm_activities.created_at)만 사용한다.
function dateKeyOf(uploadedAt: string) {
  return new Date(uploadedAt).toISOString().slice(0, 10);
}

function formatDateKey(dateKey: string) {
  const d = new Date(dateKey + "T00:00:00Z");
  return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
}

function getRelativeDateLabel(dateKey: string) {
  const target = new Date(dateKey + "T00:00:00Z");
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const targetDay = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const diffDays = Math.round((today - targetDay) / 86400000);

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays > 1 && diffDays < 7) return `${diffDays}일 전`;
  return "";
}

// ── 문서 상태 ──
// 프로젝트에 문서 단위 승인/반려 데이터가 없으므로, 같은 신청건에 이미 기록된 실제
// action만으로 4가지 상태를 판단한다. "보완요청"이 최우선이다(다른 상태보다 먼저 확인해야
// 하는 실무 우선순위 — admin/cases/page.tsx의 status=supplement 필터와 동일한 기준).
type DocStatusKey = "submitted" | "reviewing" | "completed" | "supplement";

// v2: admin/cases/page.tsx의 RESULT_LABELS/CATEGORY_INFO와 동일한 pill 배지 스타일
// (rounded-full + text-xs font-semibold + ring-1 ring-inset)로 통일했다. 상태 4종
// (제출/검토중/검토완료/보완요청)은 그대로 유지 — 새 상태 없음.
const STATUS_META: Record<DocStatusKey, { label: string; badge: string }> = {
  submitted: { label: "제출", badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100" },
  reviewing: { label: "검토중", badge: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100" },
  completed: { label: "검토완료", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100" },
  supplement: { label: "보완요청", badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100" },
};

const DOC_STATUS_FILTERS: Array<{ value: "all" | DocStatusKey; label: string }> = [
  { value: "all", label: "전체" },
  { value: "submitted", label: "제출" },
  { value: "reviewing", label: "검토중" },
  { value: "completed", label: "검토완료" },
  { value: "supplement", label: "보완요청" },
];

// 다음조치 — admin/cases/[leadId]/page.tsx의 buildProcessSteps가 쓰는 것과 동일한 실제
// action 순서(expert_review_request → agency_upgrade_request → process_government_submitted
// → process_permit_completed)를 그대로 재사용해 다음 단계 라벨만 계산한다. buildProcessSteps
// 자체는 다른 파일의 비공개 함수라 import할 수 없어 동일 로직만 이 페이지에 다시 구현했다.
function nextActionLabel(actions: Set<string>): string {
  if (!actions.has("expert_review_request")) return "전문가 검토";
  if (!actions.has("agency_upgrade_request")) return "전문가 진행요청 대기";
  if (!actions.has("process_government_submitted")) return "정부 제출 대기";
  if (!actions.has("process_permit_completed")) return "허가 완료 대기";
  return "완료";
}

const DISPLAY_LIMIT = 300;

// ── v2: 문서 유형 ──
// 새 필드를 만들지 않고, 이미 실제로 저장되는 문서명(crm_activities.tag ·
// meta.documentLabel — requiredDocuments.ts가 정의한 라벨 그대로)만 키워드로 분류한다.
// 매칭되지 않는 라벨은 임의로 추정하지 않고 전부 "기타"로 표시한다.
type DocTypeKey = "passport" | "visa" | "residenceCard" | "businessCert" | "contract" | "healthCert" | "other";

const DOC_TYPE_META: Record<DocTypeKey, string> = {
  passport: "여권",
  visa: "비자",
  residenceCard: "거주증",
  businessCert: "사업자등록증",
  contract: "계약서",
  healthCert: "건강검진서",
  other: "기타",
};

// v3: 문서유형 배지에 색상을 부여한다 — 새 배지 디자인이 아니라, 이 파일 전체에서 이미
// 쓰고 있는 pill 스타일(rounded-full/rounded-md + bg-X-50 + text-X-700)을 색상만 바꿔
// 재사용한다.
const DOC_TYPE_BADGE: Record<DocTypeKey, string> = {
  passport: "bg-blue-50 text-blue-700",
  visa: "bg-violet-50 text-violet-700",
  residenceCard: "bg-teal-50 text-teal-700",
  businessCert: "bg-emerald-50 text-emerald-700",
  contract: "bg-amber-50 text-amber-700",
  healthCert: "bg-rose-50 text-rose-700",
  other: "bg-slate-100 text-slate-600",
};

function classifyDocType(label: string): DocTypeKey {
  if (label.includes("여권")) return "passport";
  if (label.includes("비자")) return "visa";
  if (label.includes("거주증")) return "residenceCard";
  if (label.includes("사업자등록") || label.includes("법인등록")) return "businessCert";
  if (label.includes("계약서")) return "contract";
  if (label.includes("건강진단") || label.includes("건강검진")) return "healthCert";
  return "other";
}

type DocProgress = { submitted: number; total: number; percent: number };

type DocumentRow = {
  key: string;
  leadId: string;
  customerName: string;
  customerContact: string;
  serviceType: string;
  serviceLabel: string;
  category: CategoryKey;
  docLabel: string;
  docType: DocTypeKey;
  fileName: string | null;
  fileSize: number | null;
  uploadedAt: string;
  status: DocStatusKey;
  nextAction: string;
  storagePath: string;
  progress: DocProgress | null;
};

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" && sp.q.trim()) || "";
  const content = (typeof sp.content === "string" && sp.content) || "all";
  const filterService = (typeof sp.filterService === "string" && sp.filterService) || "all";
  const period = (typeof sp.period === "string" && sp.period) || "all";
  const docStatus = (typeof sp.docStatus === "string" && sp.docStatus) || "all";

  const { data: allLeads, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, email, service_type, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (leadsError) {
    return <ErrorScreen message={leadsError.message} />;
  }

  const leads = (allLeads ?? []).map((l) => ({
    ...l,
    service_type: normalizeServiceType(l.service_type),
  }));
  const leadById = new Map(leads.map((l) => [l.id, l]));
  const leadIds = leads.map((l) => l.id);

  const { data: activitiesRaw, error: activitiesError } = leadIds.length
    ? await supabaseAdmin
        .from("crm_activities")
        .select("lead_id, action, tag, meta, created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true })
    : { data: [] as any[], error: null };

  if (activitiesError) {
    return <ErrorScreen message={activitiesError.message} />;
  }

  const activities = activitiesRaw ?? [];

  // 리드별 실제 action 집합 + 최신 진단 브리프(expertBrief/expert_brief) — status 필터
  // (admin/cases/page.tsx)와 동일한 근거로 계산한다.
  const actionsByLead = new Map<string, Set<string>>();
  const briefByLead = new Map<string, any>();
  const rawDocuments: Array<{
    leadId: string;
    docLabel: string;
    fileName: string | null;
    fileSize: number | null;
    storagePath: string;
    serviceType: string | null;
    uploadedAt: string;
  }> = [];

  for (const a of activities) {
    if (!a.lead_id) continue;
    const actionSet = actionsByLead.get(a.lead_id) ?? new Set<string>();
    if (a.action) actionSet.add(a.action);
    actionsByLead.set(a.lead_id, actionSet);

    const m = a.meta as any;
    const brief = m && typeof m === "object" ? m.expertBrief ?? m.expert_brief : null;
    if (brief) briefByLead.set(a.lead_id, brief);

    if (a.action === "document_upload" && m && typeof m === "object" && typeof m.storagePath === "string") {
      rawDocuments.push({
        leadId: a.lead_id,
        docLabel: (a.tag as string | null) ?? (m.documentLabel as string | undefined) ?? "제출 서류",
        fileName: (m.fileName as string | undefined) ?? null,
        fileSize: typeof m.fileSize === "number" ? (m.fileSize as number) : null,
        storagePath: m.storagePath as string,
        serviceType: (m.service as string | undefined) ?? null,
        uploadedAt: a.created_at,
      });
    }
  }

  function hasSupplementSignal(leadId: string): boolean {
    const brief = briefByLead.get(leadId);
    const hasFailedItem =
      Array.isArray(brief?.checkedItems) && brief.checkedItems.some((c: any) => c?.passed === false);
    const hasRejectionRisk = Array.isArray(brief?.rejectionRisks) && brief.rejectionRisks.length > 0;
    return hasFailedItem || hasRejectionRisk;
  }

  function computeStatus(leadId: string): DocStatusKey {
    const actions = actionsByLead.get(leadId) ?? new Set<string>();
    if (hasSupplementSignal(leadId)) return "supplement";
    if (actions.has("agency_upgrade_request")) return "completed";
    if (actions.has("expert_review_request")) return "reviewing";
    return "submitted";
  }

  // v2: "문서 제출 진행률" — 같은 신청건(lead)이 제출한 문서 tag 집합을 한 번 더 모아서,
  // requiredDocuments.ts가 정의한 필수서류 목록과 정확히 일치하는 라벨 수만 센다
  // (admin/cases/[leadId]/page.tsx의 wpDocRows가 tag를 정확히 일치시키는 것과 동일한 원칙 —
  // 새 매칭 로직을 만들지 않고 동일하게 "정확히 일치"만 인정한다).
  const submittedTagsByLead = new Map<string, Set<string>>();
  for (const d of rawDocuments) {
    const set = submittedTagsByLead.get(d.leadId) ?? new Set<string>();
    set.add(d.docLabel);
    submittedTagsByLead.set(d.leadId, set);
  }

  function computeProgress(leadId: string, serviceType: string): DocProgress | null {
    const required = getRequiredDocuments(serviceType);
    const total = required.documents.length;
    if (total === 0) return null; // 필수서류 목록이 없는 서비스(예: 법인설립)는 진행률을 표시하지 않는다.
    const submittedTags = submittedTagsByLead.get(leadId) ?? new Set<string>();
    const submitted = required.documents.filter((label) => submittedTags.has(label)).length;
    return { submitted, total, percent: Math.round((submitted / total) * 100) };
  }

  const allDocuments: DocumentRow[] = rawDocuments
    .map((d, index) => {
      const lead = leadById.get(d.leadId);
      const svcType = normalizeServiceType(d.serviceType) ?? lead?.service_type ?? "";
      const actions = actionsByLead.get(d.leadId) ?? new Set<string>();
      return {
        key: `${d.leadId}-${index}`,
        leadId: d.leadId,
        customerName: lead?.name ?? "이름 미상",
        customerContact: lead?.phone || lead?.email || "연락처 없음",
        serviceType: svcType,
        serviceLabel: svcType ? getServiceLabel(svcType) : "미상",
        category: getCategory(svcType),
        docLabel: d.docLabel,
        docType: classifyDocType(d.docLabel),
        fileName: d.fileName,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt,
        status: computeStatus(d.leadId),
        nextAction: nextActionLabel(actions),
        storagePath: d.storagePath,
        progress: computeProgress(d.leadId, svcType),
      };
    })
    // leads 조회 범위(최근 2000건)에 없는 리드의 문서는 표시하지 않는다(존재하지 않는 리드
    // 추측 방지 — leadById에 없으면 customerName 등을 임의로 채우지 않고 제외한다).
    .filter((d) => leadById.has(d.leadId));

  // ── KPI: Admin Cases의 KPI 카드와 동일하게 전체 스코프(필터 적용 전) 기준 ──
  // v2: "오늘 신규 업로드" 계산을 위해 날짜 기준(startOfToday)을 KPI 계산보다 먼저 둔다
  // (기존에 기간 필터에서만 쓰던 것과 동일한 startOfToday를 그대로 재사용 — 새 날짜 로직 아님).
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalDocuments = allDocuments.length;
  const todayUploadCount = allDocuments.filter((d) => new Date(d.uploadedAt) >= startOfToday).length;
  const pendingReviewCount = allDocuments.filter((d) => d.status === "submitted" || d.status === "reviewing").length;
  const supplementCount = allDocuments.filter((d) => d.status === "supplement").length;

  const normalizedQuery = q.toLowerCase();
  const periodStart = (() => {
    if (period === "today") return startOfToday;
    if (period === "7d") {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - 6);
      return d;
    }
    if (period === "30d") {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - 29);
      return d;
    }
    return null;
  })();

  const visibleServices = Array.from(
    new Set(
      allDocuments
        .filter((d) => content === "all" || d.category === content)
        .map((d) => d.serviceType)
        .filter((v): v is string => Boolean(v))
    )
  ).sort((a, b) => getServiceLabel(a).localeCompare(getServiceLabel(b), "ko"));

  const filteredDocuments = allDocuments
    .filter((d) => {
      const categoryMatch = content === "all" || d.category === content;
      const serviceMatch = filterService === "all" || d.serviceType === filterService;
      const periodMatch = !periodStart || new Date(d.uploadedAt) >= periodStart;
      const statusMatch = docStatus === "all" || d.status === docStatus;
      const searchMatch =
        !normalizedQuery ||
        [d.customerName, d.customerContact, d.serviceType, d.serviceLabel, d.docLabel, d.fileName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return categoryMatch && serviceMatch && periodMatch && statusMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const visibleDocuments = filteredDocuments.slice(0, DISPLAY_LIMIT);

  // 다운로드/미리보기 — admin/cases/[leadId]/page.tsx와 동일한 방식(Storage "documents"
  // 버킷 + createSignedUrl, 1시간 유효)을 그대로 재사용한다.
  const documentsWithUrls = await Promise.all(
    visibleDocuments.map(async (d) => {
      let signedUrl: string | null = null;
      try {
        const { data: signedData, error: signedError } = await supabaseAdmin.storage
          .from("documents")
          .createSignedUrl(d.storagePath, 3600);
        if (!signedError && signedData?.signedUrl) signedUrl = signedData.signedUrl;
      } catch (signedCatchErr) {
        console.error("[admin/documents] Signed URL 생성 실패:", signedCatchErr);
      }
      return { ...d, signedUrl };
    })
  );

  // v3: 날짜 그룹 — admin/cases/page.tsx의 DateContentGroup과 동일한 원칙으로,
  // 이미 정렬·제한된 documentsWithUrls(우선순위 그대로 유지)를 uploaded_at 기준
  // dateKey로만 묶는다. 새 컬럼 없이 기존 uploaded_at만 사용한다.
  const groupedByDate = new Map<string, DocumentWithUrl[]>();
  for (const d of documentsWithUrls) {
    const key = dateKeyOf(d.uploadedAt);
    const group = groupedByDate.get(key) ?? [];
    group.push(d);
    groupedByDate.set(key, group);
  }
  const dateGroups = Array.from(groupedByDate.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const next = { q, content, filterService, period, docStatus, ...overrides };
    if (next.q) params.set("q", next.q);
    if (next.content && next.content !== "all") params.set("content", next.content);
    if (next.filterService && next.filterService !== "all") params.set("filterService", next.filterService);
    if (next.period && next.period !== "all") params.set("period", next.period);
    if (next.docStatus && next.docStatus !== "all") params.set("docStatus", next.docStatus);
    const query = params.toString();
    return query ? `/admin/documents?${query}` : "/admin/documents";
  };

  const hasActiveFilter = Boolean(q || content !== "all" || filterService !== "all" || period !== "all" || docStatus !== "all");

  return (
    <Shell>
      <PageHeader title="문서 관리" description="고객이 제출한 문서를 한 화면에서 확인하고 다음 조치를 관리합니다." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="전체 문서" value={totalDocuments} caption="제출된 전체 문서" icon={<FileText size={18} />} />
        <KpiCard label="오늘 신규 업로드" value={todayUploadCount} caption="오늘 0시 이후 제출" icon={<Upload size={18} />} />
        <KpiCard label="검토 대기" value={pendingReviewCount} caption="제출·검토중 상태" icon={<Sparkles size={18} />} />
        <KpiCard label="보완 요청" value={supplementCount} caption="보완이 필요한 건" icon={<FileWarning size={18} />} />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <form action="/admin/documents" method="get" className="flex flex-col gap-3 sm:flex-row">
            {content !== "all" && <input type="hidden" name="content" value={content} />}
            {filterService !== "all" && <input type="hidden" name="filterService" value={filterService} />}
            {period !== "all" && <input type="hidden" name="period" value={period} />}
            {docStatus !== "all" && <input type="hidden" name="docStatus" value={docStatus} />}
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">문서 검색</span>
              <SearchIconGlyph />
              <input
                name="q"
                defaultValue={q}
                placeholder="고객명, 이메일, 서비스, 문서명 검색"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </label>
            {/* v2: 우측 관리 기능 버튼 영역 — 향후 Export/다운로드 등이 추가될 자리를 위해
                검색 관련 버튼을 별도 flex 그룹으로 묶어둔다. 지금은 "검색"(+조건부 "전체
                초기화")만 렌더링하고, 새 버튼은 추가하지 않는다. */}
            <div className="flex items-center gap-2">
              <button type="submit" className="h-12 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800">
                검색
              </button>
              {hasActiveFilter && (
                <Link href="/admin/documents" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  전체 초기화
                </Link>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-5 p-5">
          <FilterRow label="콘텐츠">
            {[
              ["all", "전체"],
              ["check", "직접확인하기 CHECK"],
              ["verify", "직접검토하기 VERIFY"],
              ["permit", "직접허가받기 REGISTER"],
            ].map(([value, label]) => (
              <FilterChip key={value} href={buildHref({ content: value, filterService: "all" })} active={content === value} label={label} />
            ))}
          </FilterRow>

          <FilterRow label="상태">
            {DOC_STATUS_FILTERS.map(({ value, label }) => (
              <FilterChip key={value} href={buildHref({ docStatus: value })} active={docStatus === value} label={label} />
            ))}
          </FilterRow>

          <FilterRow label="기간">
            {[
              ["all", "전체"],
              ["today", "오늘"],
              ["7d", "최근 7일"],
              ["30d", "최근 30일"],
            ].map(([value, label]) => (
              <FilterChip key={value} href={buildHref({ period: value })} active={period === value} label={label} />
            ))}
          </FilterRow>

          <FilterRow label="서비스">
            <FilterChip href={buildHref({ filterService: "all" })} active={filterService === "all"} label="전체 서비스" />
            {visibleServices.map((svc) => (
              <FilterChip key={svc} href={buildHref({ filterService: svc })} active={filterService === svc} label={getServiceLabel(svc)} />
            ))}
          </FilterRow>
        </div>
      </section>

      <div className="mt-6 space-y-4">
        {dateGroups.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState message={hasActiveFilter ? "조건에 맞는 문서가 없습니다." : undefined} />
          </div>
        )}
        {dateGroups.map(([dateKey, docs], dateIndex) => (
          <DateDocumentGroup key={dateKey} dateKey={dateKey} documents={docs} defaultOpen={dateIndex === 0} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>필터 결과 {filteredDocuments.length}건</span>
        <span>최대 {DISPLAY_LIMIT}건 표시</span>
      </div>
    </Shell>
  );
}

type DocumentWithUrl = DocumentRow & { signedUrl: string | null };

// v3: Admin Cases의 DateContentGroup과 동일한 원칙(날짜 <details> → 카테고리 요약 →
// 상세 목록) — 문서 버전에서는 "상세 목록"이 leadId로 묶인 문서 그룹이 된다.
function DateDocumentGroup({
  dateKey,
  documents,
  defaultOpen,
}: {
  dateKey: string;
  documents: DocumentWithUrl[];
  defaultOpen: boolean;
}) {
  const byCategory = new Map<CategoryKey, DocumentWithUrl[]>();
  for (const d of documents) {
    const arr = byCategory.get(d.category) ?? [];
    arr.push(d);
    byCategory.set(d.category, arr);
  }

  // 요구사항 3: 동일 leadId 문서를 한 그룹으로 묶는다(leadId 기준만 사용, 새 로직 없음).
  const leadGroups = new Map<string, LeadDocGroup>();
  for (const d of documents) {
    const existing = leadGroups.get(d.leadId);
    if (existing) {
      existing.docs.push(d);
    } else {
      leadGroups.set(d.leadId, {
        leadId: d.leadId,
        customerName: d.customerName,
        customerContact: d.customerContact,
        serviceType: d.serviceType,
        serviceLabel: d.serviceLabel,
        category: d.category,
        docs: [d],
      });
    }
  }
  const sortedLeadGroups = Array.from(leadGroups.values()).sort(
    (a, b) => new Date(b.docs[0].uploadedAt).getTime() - new Date(a.docs[0].uploadedAt).getTime()
  );

  return (
    <details open={defaultOpen} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none flex-col gap-3 bg-slate-50 px-5 py-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition group-open:rotate-90">
            <ChevronIcon />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base ring-1 ring-inset ring-blue-100" aria-hidden="true">
            📄
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {getRelativeDateLabel(dateKey) && (
                <span className="rounded-full bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white">{getRelativeDateLabel(dateKey)}</span>
              )}
              <h2 className="text-base font-bold text-slate-950">{formatDateKey(dateKey)}</h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">{documents.length}건</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">제출된 문서 {documents.length}건 · 신청건 {leadGroups.size}건</p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 pl-20 sm:w-auto sm:justify-end sm:pl-0">
          {CATEGORY_ORDER.filter((c) => c !== "unclassified").map((c) => (
            <DateCategoryCountBadge key={c} label={CATEGORY_INFO[c].label} count={(byCategory.get(c) ?? []).length} />
          ))}
        </div>
      </summary>

      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        {/* 요구사항 2: 날짜 아래 CHECK/VERIFY/REGISTER 등 서비스 요약카드 */}
        <div className="space-y-3">
          {CATEGORY_ORDER.map((category) => {
            const categoryDocs = byCategory.get(category) ?? [];
            if (categoryDocs.length === 0) return null;

            const byService = new Map<string, number>();
            for (const d of categoryDocs) {
              byService.set(d.serviceType, (byService.get(d.serviceType) ?? 0) + 1);
            }
            const theme = CATEGORY_THEME[category];

            return (
              <section key={category} className={`rounded-2xl border px-4 py-4 ${theme.shell}`}>
                <div className="grid gap-4 lg:grid-cols-[136px_minmax(0,1fr)] lg:items-stretch">
                  <div className="flex min-h-[88px] flex-col items-start justify-center gap-1 rounded-xl bg-white/55 px-4 py-4 lg:border-r lg:border-slate-200/80 lg:rounded-none lg:bg-transparent lg:px-0 lg:pr-5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      <p className={`text-sm font-black tracking-[0.06em] ${theme.label}`}>{CATEGORY_INFO[category].label}</p>
                    </div>
                    <p className={`whitespace-nowrap text-3xl font-black tracking-[-0.06em] ${theme.count}`}>
                      {categoryDocs.length}
                      <span className="ml-1 text-sm font-bold">건</span>
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">해당일 제출 문서</p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from(byService.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([serviceType, count]) => (
                        <div
                          key={serviceType}
                          className="grid min-h-[62px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border border-white bg-white px-3 py-2.5 text-slate-700 shadow-sm"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-base ring-1 ring-inset ring-slate-100" aria-hidden="true">
                            <FileText size={14} className="text-slate-400" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-bold text-slate-900">{getServiceLabel(serviceType)}</span>
                            <span className="mt-0.5 block text-[10px] font-bold text-slate-400">{CATEGORY_INFO[category].label}</span>
                          </span>
                          <span className="flex min-w-[36px] flex-col items-end justify-center">
                            <span className="text-lg font-black leading-none text-slate-800">{count}</span>
                            <span className="mt-0.5 text-[10px] font-semibold text-slate-400">건</span>
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* 요구사항 3·4: leadId로 묶은 문서 그룹, 그룹 안에서만 문서를 출력 */}
        <div className="mt-4 space-y-3">
          {/* lg 이상에서만 보이는 공유 컬럼 헤더 — 가로 스크롤 없이 모든 열을 한 화면에 표시한다. */}
          <div className={`hidden items-center rounded-t-xl border border-b-0 border-slate-200 bg-slate-100 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 lg:grid ${DOC_ROW_GRID} gap-2 px-4`}>
            <span>문서유형</span>
            <span>문서명</span>
            <span>업로드일</span>
            <span>상태</span>
            <span>담당자</span>
            <span>다음조치</span>
            <span className="text-center">다운로드</span>
            <span className="text-center">미리보기</span>
          </div>
          {sortedLeadGroups.map((group) => (
            <LeadDocumentGroupCard key={group.leadId} group={group} />
          ))}
        </div>
      </div>
    </details>
  );
}

type LeadDocGroup = {
  leadId: string;
  customerName: string;
  customerContact: string;
  serviceType: string;
  serviceLabel: string;
  category: CategoryKey;
  docs: DocumentWithUrl[];
};

// 진행률은 신청건 헤더에 한 번만 표시한다. 문서 행은 가로 스크롤 없이 8열을 모두 노출한다.
// 문서명과 다음조치는 minmax(0, fr)로 유연하게 줄이고, 액션 버튼은 56px 고정 폭을 보장한다.
const DOC_ROW_GRID = "lg:grid-cols-[72px_minmax(0,2fr)_118px_92px_112px_minmax(0,1fr)_56px_56px]";

function LeadDocumentGroupCard({ group }: { group: LeadDocGroup }) {
  const categoryInfo = CATEGORY_INFO[group.category];
  // 신청건 진행률은 문서 단위가 아니라 신청건 단위 값(모든 문서 행이 같은 값)이므로 첫 문서에서만 읽는다.
  const progress = group.docs[0]?.progress ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200">
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {group.customerName.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/cases/${group.leadId}`} className="truncate text-sm font-bold text-slate-950 transition-colors hover:text-blue-700 hover:underline">
                {group.customerName}
              </Link>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${categoryInfo.badgeColor}`}>{categoryInfo.label}</span>
              <span className="text-xs font-semibold text-slate-500">{group.serviceLabel}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-400">{group.customerContact}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pl-12 sm:pl-0">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200">문서 {group.docs.length}건</span>
          <LeadProgressPanel progress={progress} />
        </div>
      </div>

      {/* 문서 행 — lg 이상은 공유 헤더와 같은 그리드, 이하는 카드형으로 쌓는다. */}
      <div className="divide-y divide-slate-100">
        {group.docs.map((d) => (
          <DocumentRowItem key={d.key} doc={d} />
        ))}
      </div>
    </div>
  );
}

function DocumentRowItem({ doc }: { doc: DocumentWithUrl }) {
  const statusMeta = STATUS_META[doc.status];
  return (
    <div className={`group/row grid items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-blue-50/40 ${DOC_ROW_GRID}`}>
      <div className="flex h-full items-center">
        <span className={`inline-flex max-w-full truncate rounded-md px-2 py-1 text-[11px] font-semibold ${DOC_TYPE_BADGE[doc.docType]}`}>{DOC_TYPE_META[doc.docType]}</span>
      </div>
      <div className="min-w-0">
        <Link href={`/admin/cases/${doc.leadId}`} className="block truncate text-sm font-bold leading-tight text-blue-700 transition-colors hover:text-blue-800 hover:underline">
          {doc.docLabel}
        </Link>
        <p
          className="mt-0 block max-w-full truncate whitespace-nowrap text-[11px] leading-tight text-slate-400"
          title={doc.fileName ?? undefined}
        >
          {formatDisplayFileName(doc.fileName)}
          {doc.fileSize !== null ? ` · ${formatFileSize(doc.fileSize)}` : ""}
        </p>
      </div>
      <div className="whitespace-nowrap text-xs text-slate-500">{formatCompactDateTime(doc.uploadedAt)}</div>
      <div className="flex h-full items-center">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badge}`}>{statusMeta.label}</span>
      </div>
      <div className="hidden truncate whitespace-nowrap text-xs font-semibold text-slate-700 lg:block" title="VFBCAI 담당자">VFBCAI 담당자</div>
      <div className="hidden truncate whitespace-nowrap text-xs text-slate-600 lg:block" title={doc.nextAction}>{doc.nextAction}</div>
      <div className="flex h-full items-center gap-2 lg:justify-center">
        {doc.signedUrl ? (
          <a
            href={doc.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            title="다운로드"
          >
            <Download size={14} />
          </a>
        ) : (
          <span className="text-slate-300">-</span>
        )}
        {/* lg 미만에서는 다운로드/미리보기를 한 줄에 같이 보여준다(그리드 컬럼을 그대로 다 펼치지 않음) */}
        {doc.signedUrl && (
          <a
            href={doc.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            title="미리보기"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <div className="hidden h-full lg:flex lg:items-center lg:justify-center">
        {doc.signedUrl ? (
          <a
            href={doc.signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            title="미리보기"
          >
            <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </div>
      {/* lg 미만 전용 보조 정보(담당자/다음조치) — 공유 그리드 대신 한 줄 요약으로 */}
      <div className="col-span-2 -mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 lg:hidden">
        <span>담당자 <b className="font-semibold text-slate-600">VFBCAI 담당자</b></span>
        <span>다음조치 <b className="font-semibold text-slate-600">{doc.nextAction}</b></span>
      </div>
    </div>
  );
}

// v4: "제출 진행률"은 문서 단위가 아니라 신청건 단위 값이므로, 문서 행에서는 제거하고
// LeadDocumentGroupCard 헤더에 한 번만 크게 표시한다. 계산 로직(progress 값)은 기존
// computeProgress()를 그대로 재사용하며 여기서는 시각화만 담당한다.
function LeadProgressPanel({ progress }: { progress: DocProgress | null }) {
  if (!progress) return <span className="text-xs text-slate-300">진행률 정보 없음</span>;
  return (
    <div className="w-[176px] shrink-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">제출 진행률</span>
        <span className="text-xs font-extrabold text-slate-700">
          {progress.submitted} / {progress.total} <span className="font-semibold text-slate-500">({progress.percent}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${progress.percent >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
          style={{ width: `${Math.min(100, progress.percent)}%` }}
        />
      </div>
    </div>
  );
}

// Admin Cases의 DateCategoryCount와 동일한 배지(다른 파일의 비공개 컴포넌트라 복제).
function DateCategoryCountBadge({ label, count }: { label: string; count: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
        count > 0 ? "bg-blue-50 text-blue-700 ring-blue-100" : "bg-white text-slate-400 ring-slate-200"
      }`}
      aria-label={`${label} ${count}건`}
    >
      <span>{label}</span>
      <span className={`inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none ${count > 0 ? "bg-white/80" : "bg-slate-100"}`}>
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="m7.5 5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── admin/cases/page.tsx와 동일한 디자인 시스템(Shell/KpiCard/FilterRow/FilterChip/
// EmptyState/ErrorScreen) — 다른 파일의 비공개 컴포넌트라 import할 수 없어 동일하게
// 복제했다(admin/cases/page.tsx 자체도 수정하지 않았다). Card·Button·Badge·Spacing·
// Typography 클래스를 전부 동일하게 유지한다. "문서관리" 메뉴만 이 페이지에서 active다.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-5 py-5">
            <p className="text-sm font-extrabold tracking-tight text-slate-950">VFBCAI 관리자</p>
            <p className="mt-1 text-[11px] text-slate-400">CRM WORKSPACE</p>
          </div>

          <nav className="flex-1 px-3 py-4 text-sm">
            <SidebarLink href="/admin" label="대시보드" />
            <SidebarLink href="/admin/cases" label="신청건 관리" />
            <div className="mb-2 ml-3 border-l border-slate-200 pl-3">
              <SidebarLink href="/admin/cases" label="전체 신청건" compact />
              <SidebarLink href="/admin/cases?status=unreviewed" label="미확인 문서" compact />
              <SidebarLink href="/admin/cases?status=supplement" label="보완 요청" compact />
              <SidebarLink href="/admin/cases?status=urgent" label="긴급 건" compact />
            </div>
            <SidebarLink href="/admin/documents" label="문서관리" active />
            <SidebarLink href="/admin/users" label="직원관리" />
            <SidebarDisabled label="통계" />
            <SidebarLink href="/admin/rejections" label="거절이력관리" />
          </nav>

          <div className="border-t border-slate-200 p-3">
            <AdminLogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <div>
                <p className="text-sm font-extrabold text-slate-950">VFBCAI 관리자</p>
                <p className="text-[10px] text-slate-400">CRM WORKSPACE</p>
              </div>
              <AdminLogoutButton />
            </div>
          </header>

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({
  href,
  label,
  active = false,
  compact = false,
}: {
  href: string;
  label: string;
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mb-1 flex items-center rounded-lg px-3 py-2 transition ${compact ? "text-xs" : "text-sm font-medium"} ${
        active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {label}
    </Link>
  );
}

function SidebarDisabled({ label }: { label: string }) {
  return (
    <div className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400">
      <span>{label}</span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">준비중</span>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <p className="text-xs font-medium text-slate-400">실시간 데이터 기준</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-400">{caption}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div className="w-20 shrink-0 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-blue-700 bg-blue-700 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState({ message = "표시할 데이터가 없습니다." }: { message?: string }) {
  return <div className="flex min-h-40 items-center justify-center p-8 text-sm text-slate-400">{message}</div>;
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">데이터를 불러오는 중 문제가 발생했습니다.</p>
        <p className="mt-2 text-sm text-red-600">{message}</p>
      </div>
    </main>
  );
}

function SearchIconGlyph() {
  return <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />;
}
