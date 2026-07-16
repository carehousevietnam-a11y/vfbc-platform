// src/app/admin/cases/page.tsx

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

// ── service_type 정규화 (화면 표시용, DB는 건드리지 않음) ──────
// 구버전 코드에서 다른 값으로 저장된 리드를 최신 값과 동일하게 인식시키기 위한 별칭 처리.
// 새로운 별칭이 생기면 여기 한 줄만 추가하면 됨.
const SERVICE_TYPE_ALIASES: Record<string, string> = {
  register_company: "permit_company", // register/company 페이지 구버전에서 저장된 값
};

function normalizeServiceType(serviceType: string | null | undefined): string | null {
  if (!serviceType) return serviceType ?? null;
  return SERVICE_TYPE_ALIASES[serviceType] ?? serviceType;
}

// ── 서비스 → 대분류 매핑 ────────────────────────────────
// CHECK(직접확인하기)는 여기 목록에 명시적으로 추가해야 함.
// VERIFY(직접검토하기)는 service_type이 "verify"로 시작하면 자동 인식.
// PERMIT(직접허가받기)는 service_type이 "permit"으로 시작하면 자동 인식.
// CONSULTATION(상담문의)은 service_type이 정확히 "consultation"이면 자동 인식.
// 어느 쪽에도 안 걸리면 "unclassified"로 모아서 놓치지 않게 함.
const CHECK_SERVICE_TYPES = ["wp", "trc", "tamtru", "driving-license"];

type CategoryKey = "check" | "verify" | "permit" | "consultation" | "unclassified";

function getCategory(serviceType: string | null | undefined): CategoryKey {
  const normalized = normalizeServiceType(serviceType);
  if (!normalized) return "unclassified";
  if (normalized === "consultation") return "consultation";
  if (normalized.startsWith("verify")) return "verify";
  if (normalized.startsWith("permit")) return "permit";
  if (CHECK_SERVICE_TYPES.includes(normalized)) return "check";
  return "unclassified";
}

const CATEGORY_INFO: Record<
  CategoryKey,
  { label: string; badgeColor: string }
> = {
  check: {
    label: "직접확인하기 (CHECK)",
    badgeColor: "bg-blue-50 text-blue-800",
  },
  verify: {
    label: "직접검토하기 (VERIFY)",
    badgeColor: "bg-gray-100 text-gray-600",
  },
  permit: {
    label: "직접허가받기 (PERMIT)",
    badgeColor: "bg-purple-50 text-purple-800",
  },
  consultation: {
    label: "상담문의",
    badgeColor: "bg-teal-50 text-teal-800",
  },
  unclassified: {
    label: "미분류 (매핑 필요)",
    badgeColor: "bg-amber-50 text-amber-800",
  },
};

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
  consultation: "일반 상담문의",
};

function getServiceLabel(serviceType: string) {
  if (SERVICE_LABELS[serviceType]) return SERVICE_LABELS[serviceType];
  if (serviceType.startsWith("verify")) {
    const sub = serviceType.replace(/^verify_?/, "");
    return sub ? `VERIFY · ${sub}` : "VERIFY";
  }
  if (serviceType.startsWith("permit")) {
    const sub = serviceType.replace(/^permit_?/, "");
    return sub ? `PERMIT · ${sub}` : "PERMIT";
  }
  return serviceType;
}

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  possible: { label: "가능", color: "text-emerald-700 bg-emerald-50" },
  conditional: { label: "조건부 가능", color: "text-amber-700 bg-amber-50" },
  impossible: { label: "어려움", color: "text-red-700 bg-red-50" },
};

// ── 날짜 헬퍼 ───────────────────────────────────────────
function dateKeyOf(createdAt: string) {
  return new Date(createdAt).toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDateKey(dateKey: string) {
  const d = new Date(dateKey + "T00:00:00Z");
  return `${d.getUTCFullYear()}.${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
}

// ── 페이지 ──────────────────────────────────────────────
export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = (typeof sp.category === "string" && sp.category) || null;
  const service = (typeof sp.service === "string" && sp.service) || null;
  const date = (typeof sp.date === "string" && sp.date) || null;

  // 1) 전체 leads 조회 (모든 레벨의 집계 기준)
  const { data: allLeads, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, email, service_type, result, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (leadsError) {
    return <ErrorScreen message={leadsError.message} />;
  }

  // service_type을 정규화한 뒤 사용 — 구버전 값(register_company 등)을 최신 값과 통합.
  // DB 원본은 건드리지 않고 화면 표시 단계에서만 치환.
  const leads = (allLeads ?? []).map((l) => ({
    ...l,
    service_type: normalizeServiceType(l.service_type),
  }));

  // 2) 대행신청(agency_upgrade_request) 활동 조회 → lead_id 집합으로 변환
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

  // ── LEVEL 4: 카테고리+서비스+날짜 → 개별 고객 리스트 ──
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
      <Shell>
        <Breadcrumb category={category as CategoryKey} service={service} date={date} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {getServiceLabel(service)} · {formatDateKey(date)}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{dayLeads.length}건</p>

        <div className="mt-6 space-y-3">
          {dayLeads.length === 0 && (
            <p className="text-sm text-gray-400">해당 날짜의 데이터가 없습니다.</p>
          )}
          {dayLeads.map((lead) => {
            const meta = metaByLead.get(lead.id);
            const score = meta?.feasibilityScore;
            const risk = meta?.expertBrief?.riskLevel;
            const resultInfo = RESULT_LABELS[lead.result ?? ""] ?? null;
            const isAgency = agencyLeadIds.has(lead.id);

            return (
              <Link
                key={lead.id}
                href={`/admin/cases/${lead.id}`}
                className="block rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        {lead.name ?? "이름 미상"}
                      </p>
                      {isAgency && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          대행신청
                        </span>
                      )}
                      {risk && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            risk === "high"
                              ? "bg-red-50 text-red-700"
                              : risk === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          위험{" "}
                          {risk === "high" ? "높음" : risk === "medium" ? "중간" : "낮음"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {lead.phone}
                      {lead.email ? ` · ${lead.email}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {typeof score === "number" && (
                      <p className="text-sm font-bold text-gray-900">{score}%</p>
                    )}
                    {resultInfo && (
                      <span
                        className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${resultInfo.color}`}
                      >
                        {resultInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">
                  {new Date(lead.created_at).toLocaleString("ko-KR")}
                </p>
              </Link>
            );
          })}
        </div>
      </Shell>
    );
  }

  // ── LEVEL 3: 카테고리+서비스 → 날짜별 목록 ──
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
      <Shell>
        <Breadcrumb category={category as CategoryKey} service={service} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {getServiceLabel(service)}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          총 {serviceLeads.length}건 · 날짜별로 나눠 보여드립니다.
        </p>

        <div className="mt-6 rounded-2xl bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {dateRows.length === 0 && (
            <p className="p-5 text-sm text-gray-400">데이터가 없습니다.</p>
          )}
          {dateRows.map(([dateKey, stat], i) => (
            <Link
              key={dateKey}
              href={`/admin/cases?category=${category}&service=${service}&date=${dateKey}`}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${
                i === 0 ? "" : "border-t border-gray-100"
              }`}
            >
              <span className="text-sm font-semibold text-gray-900">
                {formatDateKey(dateKey)}
              </span>
              <div className="flex gap-2">
                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                  확인 {stat.checks}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  대행 {stat.agency}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  // ── LEVEL 2: 카테고리 → 서비스별 카드 ──
  if (category) {
    const catLeads = leads.filter(
      (l) => getCategory(l.service_type) === category
    );
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
      <Shell>
        <Breadcrumb category={category as CategoryKey} />
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {info.label}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          총 {catLeads.length}건. 서비스를 선택하면 날짜별로 볼 수 있습니다.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {serviceRows.length === 0 && (
            <p className="text-sm text-gray-400 col-span-2">데이터가 없습니다.</p>
          )}
          {serviceRows.map(([svcType, stat]) => (
            <Link
              key={svcType}
              href={`/admin/cases?category=${category}&service=${svcType}`}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
            >
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${info.badgeColor}`}>
                {getServiceLabel(svcType)}
              </span>
              <div className="mt-3 flex gap-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.checks}</p>
                  <p className="text-[11px] text-gray-400">확인횟수</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.agency}</p>
                  <p className="text-[11px] text-gray-400">대행신청</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Shell>
    );
  }

  // ── LEVEL 1: 대분류 카드 (기본 화면) ──
  const byCategory = new Map<CategoryKey, { checks: number; agency: number }>();
  for (const l of leads) {
    const cat = getCategory(l.service_type);
    const cur = byCategory.get(cat) ?? { checks: 0, agency: 0 };
    cur.checks += 1;
    if (agencyLeadIds.has(l.id)) cur.agency += 1;
    byCategory.set(cat, cur);
  }
  const orderedCats: CategoryKey[] = ["check", "verify", "permit", "consultation"];
  if (byCategory.has("unclassified")) orderedCats.push("unclassified");

  return (
    <Shell>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
        AI 진단 리포트 목록
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        총 {leads.length}건. 대분류를 선택하면 서비스별로 볼 수 있습니다.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {orderedCats.map((catKey) => {
          const stat = byCategory.get(catKey) ?? { checks: 0, agency: 0 };
          const info = CATEGORY_INFO[catKey];
          return (
            <Link
              key={catKey}
              href={`/admin/cases?category=${catKey}`}
              className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
            >
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${info.badgeColor}`}>
                {info.label}
              </span>
              <div className="mt-3 flex gap-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.checks}</p>
                  <p className="text-[11px] text-gray-400">확인횟수</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.agency}</p>
                  <p className="text-[11px] text-gray-400">대행신청</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {byCategory.has("unclassified") && (
        <p className="mt-4 text-xs text-amber-700">
          매핑되지 않은 service_type이 있습니다 — 코드의 CHECK_SERVICE_TYPES 또는
          SERVICE_TYPE_ALIASES 목록을 확인해주세요.
        </p>
      )}
    </Shell>
  );
}

// ── 공통 레이아웃 컴포넌트 ──────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBC 관리자
          </p>
          <AdminLogoutButton />
        </div>
        {children}
      </div>
    </main>
  );
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
    <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
      <Link href="/admin/cases" className="hover:text-gray-600 hover:underline">
        전체
      </Link>
      <span>/</span>
      <Link
        href={`/admin/cases?category=${category}`}
        className={service ? "hover:text-gray-600 hover:underline" : "text-gray-700 font-medium"}
      >
        {info.label}
      </Link>
      {service && (
        <>
          <span>/</span>
          <Link
            href={`/admin/cases?category=${category}&service=${service}`}
            className={date ? "hover:text-gray-600 hover:underline" : "text-gray-700 font-medium"}
          >
            {getServiceLabel(service)}
          </Link>
        </>
      )}
      {date && (
        <>
          <span>/</span>
          <span className="text-gray-700 font-medium">{formatDateKey(date)}</span>
        </>
      )}
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#fafafa] p-10">
      <p className="text-sm text-red-600">
        데이터를 불러오는 중 문제가 발생했습니다: {message}
      </p>
    </main>
  );
}
