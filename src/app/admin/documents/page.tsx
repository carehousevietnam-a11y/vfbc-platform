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
  ShieldCheck,
  Sparkles,
  Search as SearchIcon,
  ExternalLink,
  Download,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

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

// ── 문서 상태 ──
// 프로젝트에 문서 단위 승인/반려 데이터가 없으므로, 같은 신청건에 이미 기록된 실제
// action만으로 4가지 상태를 판단한다. "보완요청"이 최우선이다(다른 상태보다 먼저 확인해야
// 하는 실무 우선순위 — admin/cases/page.tsx의 status=supplement 필터와 동일한 기준).
type DocStatusKey = "submitted" | "reviewing" | "completed" | "supplement";

const STATUS_META: Record<DocStatusKey, { label: string; badge: string; dot: string }> = {
  submitted: { label: "제출", badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100", dot: "bg-blue-500" },
  reviewing: { label: "검토중", badge: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100", dot: "bg-violet-500" },
  completed: { label: "검토완료", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100", dot: "bg-emerald-500" },
  supplement: { label: "보완요청", badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100", dot: "bg-amber-500" },
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

type DocumentRow = {
  key: string;
  leadId: string;
  customerName: string;
  customerContact: string;
  serviceType: string;
  serviceLabel: string;
  category: CategoryKey;
  docLabel: string;
  fileName: string | null;
  fileSize: number | null;
  uploadedAt: string;
  status: DocStatusKey;
  nextAction: string;
  storagePath: string;
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
        fileName: d.fileName,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt,
        status: computeStatus(d.leadId),
        nextAction: nextActionLabel(actions),
        storagePath: d.storagePath,
      };
    })
    // leads 조회 범위(최근 2000건)에 없는 리드의 문서는 표시하지 않는다(존재하지 않는 리드
    // 추측 방지 — leadById에 없으면 customerName 등을 임의로 채우지 않고 제외한다).
    .filter((d) => leadById.has(d.leadId));

  // ── KPI: Admin Cases의 KPI 카드와 동일하게 전체 스코프(필터 적용 전) 기준 ──
  const totalDocuments = allDocuments.length;
  const unreviewedCount = allDocuments.filter((d) => d.status === "submitted" || d.status === "reviewing").length;
  const completedCount = allDocuments.filter((d) => d.status === "completed").length;
  const supplementCount = allDocuments.filter((d) => d.status === "supplement").length;

  const normalizedQuery = q.toLowerCase();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
        <KpiCard label="미검토" value={unreviewedCount} caption="검토 대기 중" icon={<Sparkles size={18} />} />
        <KpiCard label="검토 완료" value={completedCount} caption="전문가 진행요청 완료" icon={<ShieldCheck size={18} />} />
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
            <button type="submit" className="h-12 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800">
              검색
            </button>
            {hasActiveFilter && (
              <Link href="/admin/documents" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                전체 초기화
              </Link>
            )}
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {documentsWithUrls.length === 0 ? (
          <EmptyState message={hasActiveFilter ? "조건에 맞는 문서가 없습니다." : undefined} />
        ) : (
          <>
            <div className="hidden lg:block">
              <DocumentTable documents={documentsWithUrls} />
            </div>
            <div className="divide-y divide-slate-100 lg:hidden">
              {documentsWithUrls.map((d) => (
                <DocumentMobileCard key={d.key} doc={d} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>필터 결과 {filteredDocuments.length}건</span>
        <span>최대 {DISPLAY_LIMIT}건 표시</span>
      </div>
    </Shell>
  );
}

type DocumentWithUrl = DocumentRow & { signedUrl: string | null };

function DocumentTable({ documents }: { documents: DocumentWithUrl[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-left">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            <th className="w-[16%] px-5 py-3">고객</th>
            <th className="w-[13%] px-3 py-3">서비스</th>
            <th className="w-[16%] px-3 py-3">문서명</th>
            <th className="w-[12%] px-3 py-3">업로드일</th>
            <th className="w-[9%] px-3 py-3">상태</th>
            <th className="w-[10%] px-3 py-3">담당자</th>
            <th className="w-[12%] px-3 py-3">다음조치</th>
            <th className="w-[6%] px-3 py-3 text-center">다운로드</th>
            <th className="w-[6%] px-5 py-3 text-center">미리보기</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {documents.map((d) => {
            const statusMeta = STATUS_META[d.status];
            const categoryInfo = CATEGORY_INFO[d.category];
            return (
              <tr key={d.key} className="group transition hover:bg-blue-50/40">
                <td className="px-5 py-3.5 align-middle">
                  <p className="truncate text-sm font-semibold text-slate-950">{d.customerName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{d.customerContact}</p>
                </td>
                <td className="px-3 py-3.5 align-middle">
                  <p className="truncate text-sm font-medium text-slate-800">{d.serviceLabel}</p>
                  <span className={`mt-1 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryInfo.badgeColor}`}>
                    {categoryInfo.label}
                  </span>
                </td>
                <td className="px-3 py-3.5 align-middle">
                  <Link href={`/admin/cases/${d.leadId}`} className="block truncate text-sm font-bold text-blue-700 hover:underline">
                    {d.docLabel}
                  </Link>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {d.fileName ?? "-"}
                    {d.fileSize !== null ? ` · ${formatFileSize(d.fileSize)}` : ""}
                  </p>
                </td>
                <td className="px-3 py-3.5 align-middle text-xs text-slate-500">{formatDateTime(d.uploadedAt)}</td>
                <td className="px-3 py-3.5 align-middle">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${statusMeta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                </td>
                <td className="px-3 py-3.5 align-middle text-xs font-semibold text-slate-700">VFBCAI 담당자</td>
                <td className="px-3 py-3.5 align-middle text-xs text-slate-600">{d.nextAction}</td>
                <td className="px-3 py-3.5 text-center align-middle">
                  {d.signedUrl ? (
                    <a href={d.signedUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-blue-300 hover:text-blue-700" title="다운로드">
                      <Download size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center align-middle">
                  {d.signedUrl ? (
                    <a href={d.signedUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:border-blue-300 hover:text-blue-700" title="미리보기">
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DocumentMobileCard({ doc }: { doc: DocumentWithUrl }) {
  const statusMeta = STATUS_META[doc.status];
  const categoryInfo = CATEGORY_INFO[doc.category];
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{doc.customerName}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{doc.customerContact}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
            {statusMeta.label}
          </span>
        </div>

        <Link href={`/admin/cases/${doc.leadId}`} className="mt-3 block truncate text-sm font-bold text-blue-700 hover:underline">
          {doc.docLabel}
        </Link>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {doc.fileName ?? "-"}
          {doc.fileSize !== null ? ` · ${formatFileSize(doc.fileSize)}` : ""}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400">서비스</p>
            <p className="mt-1 truncate font-semibold text-slate-800">{doc.serviceLabel}</p>
          </div>
          <div>
            <p className="text-slate-400">다음조치</p>
            <p className="mt-1 truncate font-semibold text-slate-800">{doc.nextAction}</p>
          </div>
          <div>
            <p className="text-slate-400">업로드일</p>
            <p className="mt-1 font-semibold text-slate-800">{formatDateTime(doc.uploadedAt)}</p>
          </div>
          <div>
            <p className="text-slate-400">담당자</p>
            <p className="mt-1 font-semibold text-slate-800">VFBCAI 담당자</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryInfo.badgeColor}`}>{categoryInfo.label}</span>
          {doc.signedUrl ? (
            <>
              <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <Download size={12} /> 다운로드
              </a>
              <a href={doc.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
                <ExternalLink size={12} /> 미리보기
              </a>
            </>
          ) : (
            <span className="text-[11px] text-slate-300">파일 링크 없음</span>
          )}
        </div>

        <Link
          href={`/admin/cases/${doc.leadId}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          신청건 상세 열기
        </Link>
      </div>
    </div>
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
            <SidebarDisabled label="직원관리" />
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
