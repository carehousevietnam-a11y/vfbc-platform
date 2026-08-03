import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

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
  check: {
    label: "직접확인하기 (CHECK)",
    badgeColor: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
  },
  verify: {
    label: "직접검토하기 (VERIFY)",
    badgeColor: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  },
  permit: {
    label: "직접허가받기 (PERMIT)",
    badgeColor: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
  },
  consultation: {
    label: "상담문의",
    badgeColor: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100",
  },
  unclassified: {
    label: "미분류",
    badgeColor: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  },
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

function getServiceLabel(serviceType: string) {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];

  const key = toPrefixKey(serviceType);
  if (SERVICE_LABELS[key]) return SERVICE_LABELS[key];

  if (key.startsWith("verify")) {
    const sub = key.replace(/^verify_?/, "");
    return sub ? `VERIFY · ${sub}` : "VERIFY";
  }
  if (key.startsWith("permit")) {
    const sub = key.replace(/^permit_?/, "");
    return sub ? `PERMIT · ${sub}` : "PERMIT";
  }
  if (key.startsWith("register")) {
    const sub = key.replace(/^register_?/, "");
    return sub ? `PERMIT · ${sub}` : "PERMIT";
  }
  return serviceType;
}

function getServiceIcon(serviceType: string) {
  const key = toPrefixKey(serviceType);

  if (key === "permit_company") return "🏢";
  if (key === "permit_franchise") return "🏪";
  if (key.includes("fire_safety")) return "🧯";
  if (key.includes("restaurant")) return "🍽️";
  if (key.includes("cosmetics")) return "🧴";
  if (key.includes("environment")) return "🌿";
  if (key.includes("hygiene")) return "🧼";
  if (key.includes("medical_device")) return "🩺";
  if (key === "trc") return "🪪";
  if (key === "wp") return "💼";
  if (key === "tamtru") return "🏠";
  if (key === "driving_license") return "🚗";
  if (key.startsWith("verify_admin")) return "📄";
  if (key.startsWith("verify_fraud")) return "🛡️";
  if (key.startsWith("verify_real_estate")) return "🏘️";
  if (key.startsWith("verify_tax")) return "🧾";
  if (key.startsWith("verify_unclear")) return "🔎";
  if (key === "consultation") return "💬";
  return "📌";
}

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  possible: {
    label: "가능",
    color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  },
  conditional: {
    label: "조건부 가능",
    color: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  },
  impossible: {
    label: "어려움",
    color: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  },
};

function dateKeyOf(createdAt: string) {
  return new Date(createdAt).toISOString().slice(0, 10);
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

function serviceAnchorId(dateKey: string, category: CategoryKey, serviceType: string) {
  const safeService = serviceType
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `service-${dateKey}-${category}-${safeService || "unknown"}`;
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

function formatRelativeDateTime(createdAt: string) {
  const target = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24 && target.toDateString() === now.toDateString()) {
    return `${diffHours}시간 전`;
  }

  return formatDateTime(createdAt);
}

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = (typeof sp.category === "string" && sp.category) || null;
  const service = (typeof sp.service === "string" && sp.service) || null;
  const date = (typeof sp.date === "string" && sp.date) || null;
  const q = (typeof sp.q === "string" && sp.q.trim()) || "";
  const content = (typeof sp.content === "string" && sp.content) || "all";
  const period = (typeof sp.period === "string" && sp.period) || "all";
  const filterService = (typeof sp.filterService === "string" && sp.filterService) || "all";
  const focusDate = (typeof sp.focusDate === "string" && sp.focusDate) || "";
  const focusService = (typeof sp.focusService === "string" && sp.focusService) || "";
  // 좌측 사이드바 "미확인 문서"/"보완 요청"/"긴급 건" 필터 — 새 DB 컬럼·새 action 없이
  // 아래(플랫 목록 분기)에서 실제 crm_activities.action / expertBrief·expert_brief 구조만으로 계산한다.
  const status = (typeof sp.status === "string" && sp.status) || "";

  const { data: allLeads, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, email, service_type, result, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (leadsError) {
    return <ErrorScreen message={leadsError.message} />;
  }

  const leads = (allLeads ?? []).map((l) => ({
    ...l,
    service_type: normalizeServiceType(l.service_type),
  }));

  const { data: agencyActivities, error: agencyError } = await supabaseAdmin
    .from("crm_activities")
    .select("lead_id")
    .eq("action", "agency_upgrade_request");

  if (agencyError) {
    return <ErrorScreen message={agencyError.message} />;
  }

  const agencyLeadIds = new Set(
    (agencyActivities ?? []).map((a) => a.lead_id).filter(Boolean)
  );

  if (category && service && date) {
    const dayLeads = leads.filter(
      (l) => l.service_type === service && dateKeyOf(l.created_at) === date
    );
    const leadIds = dayLeads.map((l) => l.id);

    const { data: activities } = leadIds.length
      ? await supabaseAdmin
          .from("crm_activities")
          .select("lead_id, meta, created_at")
          .in("lead_id", leadIds)
          .not("meta", "is", null)
          .order("created_at", { ascending: false })
      : { data: [] as any[] };

    const metaByLead = new Map<string, any>();
    for (const a of activities ?? []) {
      if (!metaByLead.has(a.lead_id)) metaByLead.set(a.lead_id, a.meta);
    }

    return (
      <Shell status={status}>
        <Breadcrumb category={category as CategoryKey} service={service} date={date} />
        <PageHeader
          title={`${getServiceLabel(service)} · ${formatDateKey(date)}`}
          description={`${dayLeads.length}건의 신청 내역입니다.`}
        />

        <div className="mt-6 space-y-3 lg:hidden">
          {dayLeads.length === 0 && <EmptyState />}
          {dayLeads.map((lead) => {
            const meta = metaByLead.get(lead.id);
            return (
              <LeadMobileCard
                key={lead.id}
                lead={lead}
                category={getCategory(lead.service_type)}
                isAgency={agencyLeadIds.has(lead.id)}
                isRejected={meta?.previousRejection?.rejected === true}
              />
            );
          })}
        </div>

        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <LeadTable
            leads={dayLeads}
            agencyLeadIds={agencyLeadIds}
            metaByLead={metaByLead}
          />
        </div>
      </Shell>
    );
  }

  if (category && service) {
    const serviceLeads = leads.filter((l) => l.service_type === service);
    const byDate = new Map<string, { checks: number; agency: number }>();
    for (const l of serviceLeads) {
      const key = dateKeyOf(l.created_at);
      const cur = byDate.get(key) ?? { checks: 0, agency: 0 };
      cur.checks += 1;
      if (agencyLeadIds.has(l.id)) cur.agency += 1;
      byDate.set(key, cur);
    }
    const dateRows = Array.from(byDate.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    );

    return (
      <Shell status={status}>
        <Breadcrumb category={category as CategoryKey} service={service} />
        <PageHeader
          title={getServiceLabel(service)}
          description={`총 ${serviceLeads.length}건 · 날짜별 접수 현황입니다.`}
        />

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {dateRows.length === 0 && <EmptyState />}
          {dateRows.map(([dateKey, stat], index) => (
            <Link
              key={dateKey}
              href={`/admin/cases?category=${category}&service=${service}&date=${dateKey}`}
              className={`flex items-center justify-between px-5 py-4 transition hover:bg-slate-50 ${
                index === 0 ? "" : "border-t border-slate-100"
              }`}
            >
              <span className="text-sm font-semibold text-slate-900">
                {formatDateKey(dateKey)}
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  접수 {stat.checks}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  진행요청 {stat.agency}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  if (category) {
    const catLeads = leads.filter((l) => getCategory(l.service_type) === category);
    const byService = new Map<string, { checks: number; agency: number }>();
    for (const l of catLeads) {
      const key = l.service_type ?? "미상";
      const cur = byService.get(key) ?? { checks: 0, agency: 0 };
      cur.checks += 1;
      if (agencyLeadIds.has(l.id)) cur.agency += 1;
      byService.set(key, cur);
    }
    const serviceRows = Array.from(byService.entries()).sort(
      (a, b) => b[1].checks - a[1].checks
    );
    const info = CATEGORY_INFO[category as CategoryKey] ?? CATEGORY_INFO.unclassified;

    return (
      <Shell status={status}>
        <Breadcrumb category={category as CategoryKey} />
        <PageHeader
          title={info.label}
          description={`총 ${catLeads.length}건 · 서비스를 선택해 날짜별 현황을 확인하세요.`}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {serviceRows.length === 0 && <EmptyState />}
          {serviceRows.map(([svcType, stat]) => (
            <Link
              key={svcType}
              href={`/admin/cases?category=${category}&service=${svcType}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${info.badgeColor}`}>
                    {getServiceLabel(svcType)}
                  </span>
                  <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                    {stat.checks}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">전체 신청건</p>
                </div>
                <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  진행요청 {stat.agency}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  const byCategory = new Map<CategoryKey, { checks: number; agency: number }>();
  for (const l of leads) {
    const cat = getCategory(l.service_type);
    const cur = byCategory.get(cat) ?? { checks: 0, agency: 0 };
    cur.checks += 1;
    if (agencyLeadIds.has(l.id)) cur.agency += 1;
    byCategory.set(cat, cur);
  }

  const { count: rejectionCount } = await supabaseAdmin
    .from("previous_rejections")
    .select("id", { count: "exact", head: true });

  // ── 좌측 사이드바 상태 필터(미확인 문서 / 보완 요청 / 긴급 건) ──
  // 새 컬럼·새 action·새 상태값을 추가하지 않고, 이미 이 프로젝트에 실제로 존재하는
  // crm_activities.action("document_upload", "expert_review_request")과
  // 진단 결과 meta.expertBrief(CHECK/REGISTER, camelCase) / meta.expert_brief(VERIFY,
  // snake_case)의 checkedItems.passed / rejectionRisks / riskLevel(admin/cases/[leadId]/page.tsx가
  // 이미 사용 중인 동일 구조)만으로 판단한다.
  //   - 미확인 문서: 고객이 document_upload로 서류를 제출했지만 아직 expert_review_request(전문가
  //     검토 요청)가 기록되지 않은 건
  //   - 보완 요청: 최신 진단 결과에 미충족 확인항목(checkedItems.passed===false) 또는
  //     반려위험(rejectionRisks)이 있는 건
  //   - 긴급 건: 최신 진단 결과의 riskLevel이 "high"인 건
  let statusLeadIds: Set<string> | null = null;
  if (status === "unreviewed" || status === "supplement" || status === "urgent") {
    const scopedLeadIds = leads.map((l) => l.id);
    const { data: statusActivities } = scopedLeadIds.length
      ? await supabaseAdmin
          .from("crm_activities")
          .select("lead_id, action, meta, created_at")
          .in("lead_id", scopedLeadIds)
          .order("created_at", { ascending: true })
      : { data: [] as any[] };

    const actionsByLead = new Map<string, Set<string>>();
    const briefByLead = new Map<string, any>();
    for (const a of statusActivities ?? []) {
      if (!a.lead_id) continue;
      const actionSet = actionsByLead.get(a.lead_id) ?? new Set<string>();
      if (a.action) actionSet.add(a.action);
      actionsByLead.set(a.lead_id, actionSet);

      const m = a.meta as any;
      const brief = m && typeof m === "object" ? m.expertBrief ?? m.expert_brief : null;
      if (brief) briefByLead.set(a.lead_id, brief);
    }

    statusLeadIds = new Set(
      leads
        .filter((l) => {
          const actionSet = actionsByLead.get(l.id) ?? new Set<string>();
          if (status === "unreviewed") {
            return actionSet.has("document_upload") && !actionSet.has("expert_review_request");
          }
          const brief = briefByLead.get(l.id);
          if (status === "urgent") {
            return brief?.riskLevel === "high";
          }
          // supplement
          const hasFailedItem =
            Array.isArray(brief?.checkedItems) && brief.checkedItems.some((c: any) => c?.passed === false);
          const hasRejectionRisk = Array.isArray(brief?.rejectionRisks) && brief.rejectionRisks.length > 0;
          return hasFailedItem || hasRejectionRisk;
        })
        .map((l) => l.id)
    );
  }

  const normalizedQuery = q.toLowerCase();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayLeads = leads.filter((lead) => new Date(lead.created_at) >= startOfToday);
  const todayCountByCategory = new Map<CategoryKey, number>();
  for (const lead of todayLeads) {
    const categoryKey = getCategory(lead.service_type);
    todayCountByCategory.set(
      categoryKey,
      (todayCountByCategory.get(categoryKey) ?? 0) + 1
    );
  }

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
      leads
        .filter((lead) => content === "all" || getCategory(lead.service_type) === content)
        .map((lead) => lead.service_type)
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => getServiceLabel(a).localeCompare(getServiceLabel(b), "ko"));

  const filteredLeads = leads.filter((lead) => {
    const categoryMatch = content === "all" || getCategory(lead.service_type) === content;
    const serviceMatch = filterService === "all" || lead.service_type === filterService;
    const periodMatch = !periodStart || new Date(lead.created_at) >= periodStart;
    const statusMatch = !statusLeadIds || statusLeadIds.has(lead.id);
    const searchMatch = !normalizedQuery || (() => {
      const serviceLabel = lead.service_type
        ? getServiceLabel(lead.service_type).toLowerCase()
        : "";
      return [lead.name, lead.phone, lead.email, lead.service_type, serviceLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    })();
    return categoryMatch && serviceMatch && periodMatch && statusMatch && searchMatch;
  });

  const groupedByDate = new Map<string, typeof filteredLeads>();
  for (const lead of filteredLeads) {
    const key = dateKeyOf(lead.created_at);
    const group = groupedByDate.get(key) ?? [];
    group.push(lead);
    groupedByDate.set(key, group);
  }
  const dateGroups = Array.from(groupedByDate.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );

  const serviceCount = new Set(leads.map((lead) => lead.service_type).filter(Boolean)).size;
  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const next = { q, content, period, filterService, focusDate, focusService, status, ...overrides };
    if (next.q) params.set("q", next.q);
    if (next.content && next.content !== "all") params.set("content", next.content);
    if (next.period && next.period !== "all") params.set("period", next.period);
    if (next.filterService && next.filterService !== "all") params.set("filterService", next.filterService);
    if (next.focusDate) params.set("focusDate", next.focusDate);
    if (next.focusService) params.set("focusService", next.focusService);
    if (next.status) params.set("status", next.status);
    const query = params.toString();
    return query ? `/admin/cases?${query}` : "/admin/cases";
  };

  const STATUS_LABELS: Record<string, string> = {
    unreviewed: "미확인 문서",
    supplement: "보완 요청",
    urgent: "긴급 건",
  };

  return (
    <Shell status={status}>
      <PageHeader
        title="신청건 관리"
        description={
          status && STATUS_LABELS[status]
            ? `"${STATUS_LABELS[status]}" 조건으로 필터링된 신청건입니다.`
            : "전체 신청건을 날짜와 콘텐츠별로 관리합니다."
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="전체 신청건" value={leads.length} caption="현재 조회된 전체 리드" icon={<CasesIcon />} href="/admin/cases" />
        <KpiCard label="전문가 진행요청" value={agencyLeadIds.size} caption="전문가 연결 요청 건" icon={<ExpertIcon />} />
        <KpiCard label="서비스 종류" value={serviceCount} caption="현재 접수된 서비스 유형" icon={<ServiceIcon />} />
        <KpiCard label="거절이력" value={rejectionCount ?? 0} caption="타 기관 거절 등록 건" icon={<RejectionIcon />} href="/admin/rejections" />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <form action="/admin/cases" method="get" className="flex flex-col gap-3 sm:flex-row">
            {content !== "all" && <input type="hidden" name="content" value={content} />}
            {period !== "all" && <input type="hidden" name="period" value={period} />}
            {filterService !== "all" && <input type="hidden" name="filterService" value={filterService} />}
            {status && <input type="hidden" name="status" value={status} />}
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">신청건 검색</span>
              <SearchIcon />
              <input name="q" defaultValue={q} placeholder="이름, 전화번호, 이메일, 서비스 검색" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50" />
            </label>
            <button type="submit" className="h-12 rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800">검색</button>
            {(q || content !== "all" || period !== "all" || filterService !== "all" || status) && (
              <Link href="/admin/cases" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">전체 초기화</Link>
            )}
          </form>
          {status && STATUS_LABELS[status] && (
            <div className="mt-3">
              <FilterChip href="/admin/cases" active label={`${STATUS_LABELS[status]} 필터 적용됨 · 해제`} />
            </div>
          )}
        </div>

        <div className="space-y-5 p-5">
          <FilterRow label="콘텐츠">
            {[
              ["all", "전체", todayLeads.length],
              ["check", "직접확인하기 CHECK", todayCountByCategory.get("check") ?? 0],
              ["verify", "직접검토하기 VERIFY", todayCountByCategory.get("verify") ?? 0],
              ["permit", "직접허가받기 REGISTER", todayCountByCategory.get("permit") ?? 0],
              ["consultation", "상담받기", todayCountByCategory.get("consultation") ?? 0],
            ].map(([value, label, todayCount]) => (
              <FilterChip
                key={String(value)}
                href={buildHref({ content: String(value), filterService: "all" })}
                active={content === value}
                label={String(label)}
                count={Number(todayCount)}
              />
            ))}
          </FilterRow>

          <FilterRow label="기간">
            {[["all", "전체"], ["today", "오늘"], ["7d", "최근 7일"], ["30d", "최근 30일"]].map(([value, label]) => (
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

      <div className="mt-6 space-y-6">
        {dateGroups.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState message={status ? "조건에 맞는 신청건이 없습니다." : undefined} />
          </div>
        )}
        {dateGroups.map(([dateKey, dateLeads], dateIndex) => (
          <DateContentGroup
            key={dateKey}
            dateKey={dateKey}
            leads={dateLeads}
            agencyLeadIds={agencyLeadIds}
            defaultOpen={dateIndex === 0 || focusDate === dateKey}
            focusDate={focusDate}
            focusService={focusService}
            buildHref={buildHref}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>필터 결과 {filteredLeads.length}건</span>
        <span>최대 2,000건 표시</span>
      </div>

      {byCategory.has("unclassified") && (
        <p className="mt-4 text-xs text-amber-700">매핑되지 않은 service_type이 있습니다 — CHECK_SERVICE_TYPES 또는 SERVICE_TYPE_ALIASES 목록을 확인해주세요.</p>
      )}
    </Shell>
  );
}

function DateContentGroup({
  dateKey,
  leads,
  agencyLeadIds,
  defaultOpen,
  focusDate,
  focusService,
  buildHref,
}: {
  dateKey: string;
  leads: Array<{
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    service_type: string | null;
    result: string | null;
    created_at: string;
  }>;
  agencyLeadIds: Set<string>;
  defaultOpen: boolean;
  focusDate: string;
  focusService: string;
  buildHref: (overrides: Record<string, string>) => string;
}) {
  const categoryOrder: CategoryKey[] = [
    "check",
    "verify",
    "permit",
    "consultation",
    "unclassified",
  ];

  const groupedByCategory = new Map<CategoryKey, typeof leads>();
  for (const lead of leads) {
    const category = getCategory(lead.service_type);
    const categoryLeads = groupedByCategory.get(category) ?? [];
    categoryLeads.push(lead);
    groupedByCategory.set(category, categoryLeads);
  }

  const categoryTheme: Record<
    CategoryKey,
    {
      shortLabel: string;
      dot: string;
      shell: string;
      label: string;
      count: string;
      activeService: string;
    }
  > = {
    check: {
      shortLabel: "CHECK",
      dot: "bg-blue-600",
      shell: "border-blue-100 bg-blue-50/45",
      label: "text-blue-700",
      count: "text-blue-700",
      activeService: "border-blue-200 border-l-4 border-l-blue-600 bg-white text-slate-800 ring-blue-100",
    },
    verify: {
      shortLabel: "VERIFY",
      dot: "bg-violet-600",
      shell: "border-violet-100 bg-violet-50/45",
      label: "text-violet-700",
      count: "text-violet-700",
      activeService: "border-violet-200 border-l-4 border-l-violet-600 bg-white text-slate-800 ring-violet-100",
    },
    permit: {
      shortLabel: "REGISTER",
      dot: "bg-emerald-600",
      shell: "border-emerald-100 bg-emerald-50/45",
      label: "text-emerald-700",
      count: "text-emerald-700",
      activeService: "border-emerald-200 border-l-4 border-l-emerald-600 bg-white text-slate-800 ring-emerald-100",
    },
    consultation: {
      shortLabel: "상담",
      dot: "bg-amber-500",
      shell: "border-amber-100 bg-amber-50/45",
      label: "text-amber-700",
      count: "text-amber-700",
      activeService: "border-amber-200 border-l-4 border-l-amber-500 bg-white text-slate-800 ring-amber-100",
    },
    unclassified: {
      shortLabel: "미분류",
      dot: "bg-slate-500",
      shell: "border-slate-200 bg-slate-50",
      label: "text-slate-700",
      count: "text-slate-700",
      activeService: "border-slate-300 border-l-4 border-l-slate-600 bg-white text-slate-800 ring-slate-200",
    },
  };

  const serviceGroups = new Map<
    string,
    { category: CategoryKey; leads: typeof leads }
  >();

  for (const category of categoryOrder) {
    for (const lead of groupedByCategory.get(category) ?? []) {
      const serviceType = lead.service_type ?? "미상";
      const existing = serviceGroups.get(serviceType) ?? { category, leads: [] };
      existing.leads.push(lead);
      serviceGroups.set(serviceType, existing);
    }
  }

  const sortedServices = Array.from(serviceGroups.entries()).sort(
    (a, b) => b[1].leads.length - a[1].leads.length
  );

  const requestedService =
    focusDate === dateKey && focusService && serviceGroups.has(focusService)
      ? focusService
      : "";
  const activeService =
    requestedService || (defaultOpen ? sortedServices[0]?.[0] ?? "" : "");
  const activeGroup = activeService ? serviceGroups.get(activeService) : undefined;

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 bg-slate-50 px-5 py-4 transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition group-open:rotate-90">
            <ChevronIcon />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base ring-1 ring-inset ring-blue-100" aria-hidden="true">
            📅
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {getRelativeDateLabel(dateKey) && (
                <span className="rounded-full bg-blue-700 px-2.5 py-1 text-[11px] font-bold text-white">
                  {getRelativeDateLabel(dateKey)}
                </span>
              )}
              <h2 className="text-base font-bold text-slate-950">{formatDateKey(dateKey)}</h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {leads.length}건
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">접수된 신청건 {leads.length}건</p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 pl-20 sm:w-auto sm:justify-end sm:pl-0">
          <DateCategoryCount label="CHECK" count={(groupedByCategory.get("check") ?? []).length} colorClass="bg-blue-50 text-blue-700 ring-blue-100" />
          <DateCategoryCount label="VERIFY" count={(groupedByCategory.get("verify") ?? []).length} colorClass="bg-violet-50 text-violet-700 ring-violet-100" />
          <DateCategoryCount label="REGISTER" count={(groupedByCategory.get("permit") ?? []).length} colorClass="bg-emerald-50 text-emerald-700 ring-emerald-100" />
          <DateCategoryCount label="상담" count={(groupedByCategory.get("consultation") ?? []).length} colorClass="bg-amber-50 text-amber-700 ring-amber-100" />
        </div>
      </summary>

      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="space-y-3">
          {categoryOrder.map((category) => {
            const categoryLeads = groupedByCategory.get(category) ?? [];
            if (categoryLeads.length === 0) return null;

            const byService = new Map<string, number>();
            for (const lead of categoryLeads) {
              const serviceKey = lead.service_type ?? "미상";
              byService.set(serviceKey, (byService.get(serviceKey) ?? 0) + 1);
            }

            const theme = categoryTheme[category];
            return (
              <section
                key={category}
                className={`rounded-2xl border px-4 py-4 ${theme.shell}`}
              >
                <div className="grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)] lg:items-stretch">
                  <div className="flex min-h-[104px] flex-col items-start justify-center gap-1 rounded-xl bg-white/55 px-5 py-4 lg:border-r lg:border-slate-200/80 lg:rounded-none lg:bg-transparent lg:px-0 lg:pr-6">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      <p className={`text-sm font-black tracking-[0.06em] ${theme.label}`}>
                        {theme.shortLabel}
                      </p>
                    </div>
                    <p className={`whitespace-nowrap text-4xl font-black tracking-[-0.06em] ${theme.count}`}>
                      {categoryLeads.length}
                      <span className="ml-1 text-sm font-bold">건</span>
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">해당일 접수</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from(byService.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([serviceType, count]) => {
                        const active = activeService === serviceType;
                        return (
                          <Link
                            key={serviceType}
                            href={buildHref({ focusDate: dateKey, focusService: serviceType })}
                            className={`group/service relative grid min-h-[82px] grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-4 py-3.5 shadow-sm transition hover:shadow-md ${
                              active
                                ? `${theme.activeService} ring-1`
                                : "border-white bg-white text-slate-700 hover:border-slate-200"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-lg text-base ring-1 ring-inset ${
                                active
                                  ? `${theme.label} bg-slate-50 ring-slate-200`
                                  : "bg-slate-50 ring-slate-100"
                              }`}
                              aria-hidden="true"
                            >
                              {serviceType === "미상" ? "📌" : getServiceIcon(serviceType)}
                            </span>

                            <span className="min-w-0">
                              <span className="block whitespace-nowrap text-sm font-bold text-slate-900">
                                {serviceType === "미상" ? "서비스 미상" : getServiceLabel(serviceType)}
                              </span>
                              <span className={`mt-1 block text-[11px] font-bold ${active ? theme.label : "text-slate-400"}`}>
                                {theme.shortLabel}
                              </span>
                            </span>

                            <span className="flex min-w-[54px] flex-col items-end justify-center pr-1">
                              {active && (
                                <span className={`absolute right-3 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${theme.label} bg-slate-50 ring-1 ring-inset ring-slate-200`} aria-label="선택됨">
                                  ✓
                                </span>
                              )}
                              <span className={`text-xl font-black leading-none ${active ? theme.count : "text-slate-800"}`}>
                                {count}
                              </span>
                              <span className="mt-1 text-[10px] font-semibold text-slate-400">신청</span>
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {activeGroup ? (
          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {activeService === "미상" ? "📌" : getServiceIcon(activeService)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {activeService === "미상" ? "서비스 미상" : getServiceLabel(activeService)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {CATEGORY_INFO[activeGroup.category].label}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {activeGroup.leads.length}건
              </span>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {activeGroup.leads.map((lead) => (
                <LeadMobileCard
                  key={lead.id}
                  lead={lead}
                  category={activeGroup.category}
                  isAgency={agencyLeadIds.has(lead.id)}
                  isRejected={false}
                />
              ))}
            </div>
            <div className="hidden lg:block">
              <LeadTable leads={activeGroup.leads} agencyLeadIds={agencyLeadIds} />
            </div>
          </section>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
            위 서비스 버튼을 선택하면 해당 신청건 테이블이 표시됩니다.
          </div>
        )}
      </div>
    </details>
  );
}

function DateCategoryCount({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
        count > 0 ? colorClass : "bg-white text-slate-400 ring-slate-200"
      }`}
      aria-label={`${label} ${count}건`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] leading-none ${
          count > 0 ? "bg-white/80" : "bg-slate-100"
        }`}
      >
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

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div className="w-20 shrink-0 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  const displayCount = typeof count === "number" ? (count > 99 ? "99+" : count) : null;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-blue-700 bg-blue-700 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <span>{label}</span>
      {displayCount !== null && (
        <span
          title={`오늘 신규 ${count}건`}
          aria-label={`오늘 신규 ${count}건`}
          className={`inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
            active
              ? "bg-white text-blue-700"
              : count && count > 0
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {displayCount}
        </span>
      )}
    </Link>
  );
}

function LeadTable({
  leads,
  agencyLeadIds,
  metaByLead,
}: {
  leads: Array<{
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    service_type: string | null;
    result: string | null;
    created_at: string;
  }>;
  agencyLeadIds: Set<string>;
  metaByLead?: Map<string, any>;
}) {
  if (leads.length === 0) return <EmptyState />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="w-[22%] px-5 py-3.5">고객</th>
            <th className="w-[17%] px-4 py-3.5">서비스</th>
            <th className="w-[17%] px-4 py-3.5">카테고리</th>
            <th className="w-[12%] px-4 py-3.5">진단결과</th>
            <th className="w-[14%] px-4 py-3.5">업무상태</th>
            <th className="w-[12%] px-4 py-3.5">접수일</th>
            <th className="w-[6%] px-5 py-3.5 text-right">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leads.map((lead) => {
            const category = getCategory(lead.service_type);
            const categoryInfo = CATEGORY_INFO[category];
            const resultInfo = RESULT_LABELS[lead.result ?? ""];
            const isAgency = agencyLeadIds.has(lead.id);
            const meta = metaByLead?.get(lead.id);
            const isRejected = meta?.previousRejection?.rejected === true;

            return (
              <tr key={lead.id} className="group transition hover:bg-blue-50/40">
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {(lead.name ?? "?").slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {lead.name ?? "이름 미상"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {lead.phone || lead.email || "연락처 없음"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-middle">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {lead.service_type ? getServiceLabel(lead.service_type) : "미상"}
                  </p>
                </td>
                <td className="px-4 py-4 align-middle">
                  <span className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-semibold ${categoryInfo.badgeColor}`}>
                    {categoryInfo.label}
                  </span>
                </td>
                <td className="px-4 py-4 align-middle">
                  {resultInfo ? (
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${resultInfo.color}`}>
                      {resultInfo.label}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">미지정</span>
                  )}
                </td>
                <td className="px-4 py-4 align-middle">
                  {isRejected ? (
                    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100">
                      재검토
                    </span>
                  ) : isAgency ? (
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-100">
                      전문가 진행요청
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                      접수 완료
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 align-middle text-xs text-slate-500">
                  {formatRelativeDateTime(lead.created_at)}
                </td>
                <td className="px-5 py-4 text-right align-middle">
                  <Link
                    href={`/admin/cases/${lead.id}`}
                    className="inline-flex h-9 min-w-[64px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    열기
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeadMobileCard({
  lead,
  category,
  isAgency,
  isRejected,
}: {
  lead: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    service_type: string | null;
    result: string | null;
    created_at: string;
  };
  category: CategoryKey;
  isAgency: boolean;
  isRejected: boolean;
}) {
  const categoryInfo = CATEGORY_INFO[category];
  const resultInfo = RESULT_LABELS[lead.result ?? ""];

  return (
    <div className="p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">
              {lead.name ?? "이름 미상"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {lead.phone || lead.email || "연락처 없음"}
            </p>
          </div>
          {resultInfo && (
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${resultInfo.color}`}>
              {resultInfo.label}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400">서비스</p>
            <p className="mt-1 font-semibold text-slate-800">
              {lead.service_type ? getServiceLabel(lead.service_type) : "미상"}
            </p>
          </div>
          <div>
            <p className="text-slate-400">업무상태</p>
            <p className="mt-1 font-semibold text-slate-800">
              {isRejected ? "재검토" : isAgency ? "전문가 진행요청" : "접수 완료"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryInfo.badgeColor}`}>
            {categoryInfo.label}
          </span>
          <span className="text-[11px] text-slate-400">{formatRelativeDateTime(lead.created_at)}</span>
        </div>

        <Link
          href={`/admin/cases/${lead.id}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          열기
        </Link>
      </div>
    </div>
  );
}

function Shell({ children, status = "" }: { children: React.ReactNode; status?: string }) {
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
            <SidebarLink href="/admin/cases" label="신청건 관리" active />
            <div className="mb-2 ml-3 border-l border-slate-200 pl-3">
              <SidebarLink href="/admin/cases" label="전체 신청건" compact active={!status} />
              <SidebarLink href="/admin/cases?status=unreviewed" label="미확인 문서" compact active={status === "unreviewed"} />
              <SidebarLink href="/admin/cases?status=supplement" label="보완 요청" compact active={status === "supplement"} />
              <SidebarLink href="/admin/cases?status=urgent" label="긴급 건" compact active={status === "urgent"} />
            </div>
            <SidebarLink href="/admin/documents" label="문서관리" />
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

          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
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
      className={`mb-1 flex items-center rounded-lg px-3 py-2 transition ${
        compact ? "text-xs" : "text-sm font-medium"
      } ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
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
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
        준비중
      </span>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
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
  href,
}: {
  label: string;
  value: number;
  caption: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-400">{caption}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{content}</div>;
}

function Breadcrumb({
  category,
  service,
  date,
}: {
  category: CategoryKey;
  service?: string;
  date?: string;
}) {
  const info = CATEGORY_INFO[category] ?? CATEGORY_INFO.unclassified;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
      <Link href="/admin/cases" className="hover:text-blue-700">
        전체 신청건
      </Link>
      <span>/</span>
      <Link
        href={`/admin/cases?category=${category}`}
        className={service ? "hover:text-blue-700" : "font-semibold text-slate-700"}
      >
        {info.label}
      </Link>
      {service && (
        <>
          <span>/</span>
          <Link
            href={`/admin/cases?category=${category}&service=${service}`}
            className={date ? "hover:text-blue-700" : "font-semibold text-slate-700"}
          >
            {getServiceLabel(service)}
          </Link>
        </>
      )}
      {date && (
        <>
          <span>/</span>
          <span className="font-semibold text-slate-700">{formatDateKey(date)}</span>
        </>
      )}
    </div>
  );
}

function EmptyState({ message = "표시할 데이터가 없습니다." }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center p-8 text-sm text-slate-400">
      {message}
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">
          데이터를 불러오는 중 문제가 발생했습니다.
        </p>
        <p className="mt-2 text-sm text-red-600">{message}</p>
      </div>
    </main>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CasesIcon() {
  return <IconPath d="M5 7h14M5 12h14M5 17h9" />;
}

function ExpertIcon() {
  return <IconPath d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1 2 2 4-4M2 21a6 6 0 0 1 12 0" />;
}

function ServiceIcon() {
  return <IconPath d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />;
}

function RejectionIcon() {
  return <IconPath d="M12 9v4m0 4h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />;
}

function IconPath({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
