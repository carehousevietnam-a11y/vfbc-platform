// src/app/admin/page.tsx
//
// VFBCAI 관리자 대시보드 (/admin 첫 화면).
// 분류 원칙은 admin/cases/page.tsx·admin/leads/page.tsx와 완전히 동일하게
// 맞춘다 — 별도 로직을 새로 고안하지 않고 그대로 재사용(복제)한다.
// leads.status 같은 존재가 확인되지 않은 컬럼은 사용하지 않고, 상담원
// 처리상태(전문가 검토요청/전문가 진행요청접수)는 crm_activities.action 값으로만
// 집계한다 (admin/leads/[id]/page.tsx와 동일한 원칙).

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

// ── 서비스 분류 (admin/cases/page.tsx · admin/leads/page.tsx · admin/leads/[id]/page.tsx와 동일) ──
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

const CATEGORY_INFO: Record<CategoryKey, { label: string; badgeColor: string }> = {
  check: { label: "CHECK", badgeColor: "bg-blue-50 text-blue-800" },
  verify: { label: "VERIFY", badgeColor: "bg-gray-100 text-gray-600" },
  register: { label: "REGISTER", badgeColor: "bg-purple-50 text-purple-800" },
  consultation: { label: "상담", badgeColor: "bg-teal-50 text-teal-800" },
  unclassified: { label: "미분류", badgeColor: "bg-amber-50 text-amber-800" },
};

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
  register_fire_safety: "소방허가", // 실제 값은 "register_fire-safety"(하이픈) — toPrefixKey로 매칭
  register_hygiene: "위생허가",
  register_medical_device: "의료기기허가", // 실제 값은 "register_medical-device"(하이픈) — toPrefixKey로 매칭
  register_franchise: "프랜차이즈 등록",
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

// admin/cases/page.tsx와 동일한 날짜 키 변환 방식(UTC 기준) — "오늘 접수"
// 집계도 기존 화면과 동일한 날짜 경계 기준을 사용한다.
function dateKeyOf(createdAt: string) {
  return new Date(createdAt).toISOString().slice(0, 10);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  service_type: string | null;
  result: string | null;
  created_at: string;
};

export default async function AdminDashboardPage() {
  // 1) 전체 리드 수 (정확한 카운트 — 아래 목록 조회의 limit과 무관하게 정확히 집계)
  const { count: totalLeads } = await supabaseAdmin
    .from("leads")
    .select("id", { count: "exact", head: true });

  // 2) 최근 리드 데이터셋 (분류·오늘접수·서비스별 현황·최근목록에 공통 사용)
  //    admin/cases/page.tsx와 동일하게 최근 2000건 기준으로 집계한다.
  const { data: allLeadsRaw, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select("id, name, phone, service_type, result, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  if (leadsError) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">
          데이터를 불러오는 중 문제가 발생했습니다: {leadsError.message}
        </p>
      </main>
    );
  }
  const allLeads = (allLeadsRaw ?? []) as LeadRow[];

  // 3) 전문가 검토 요청 / 전문가 진행요청 접수 — crm_activities.action 값 기준 정확한 카운트
  const { count: expertReviewCount } = await supabaseAdmin
    .from("crm_activities")
    .select("id", { count: "exact", head: true })
    .eq("action", "expert_review_request");

  const { count: agencyUpgradeCount } = await supabaseAdmin
    .from("crm_activities")
    .select("id", { count: "exact", head: true })
    .eq("action", "agency_upgrade_request");

  // ── 집계 ──
  const todayKey = dateKeyOf(new Date().toISOString());
  let todayCount = 0;
  const categoryCounts: Record<CategoryKey, number> = {
    check: 0,
    verify: 0,
    register: 0,
    consultation: 0,
    unclassified: 0,
  };
  const byService = new Map<string, number>();

  for (const lead of allLeads) {
    if (dateKeyOf(lead.created_at) === todayKey) todayCount += 1;

    const normalized = normalizeServiceType(lead.service_type);
    const category = getCategory(normalized);
    categoryCounts[category] += 1;

    const svcKey = normalized ?? "미상";
    byService.set(svcKey, (byService.get(svcKey) ?? 0) + 1);
  }

  const serviceRows = Array.from(byService.entries()).sort((a, b) => b[1] - a[1]);

  const recentLeads = allLeads.slice(0, 10);

  const statCards: { label: string; value: number }[] = [
    { label: "전체 리드 수", value: totalLeads ?? 0 },
    { label: "오늘 접수", value: todayCount },
    { label: "CHECK 리드 수", value: categoryCounts.check },
    { label: "VERIFY 리드 수", value: categoryCounts.verify },
    { label: "REGISTER 리드 수", value: categoryCounts.register },
    { label: "상담문의 수", value: categoryCounts.consultation },
    { label: "전문가 검토 요청 수", value: expertReviewCount ?? 0 },
    { label: "전문가 진행요청 접수 수", value: agencyUpgradeCount ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI 관리자
          </p>
          <AdminLogoutButton />
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          현재 접수·진행 현황을 한눈에 확인할 수 있습니다.
        </p>

        {/* 1~8. 요약 통계 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-[11px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            전체 리드 목록 보기 →
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/admin/cases"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            AI 진단 리포트 목록 →
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/admin/rejections"
            className="text-xs font-semibold text-blue-900 hover:underline"
          >
            타 기관 거절이력 →
          </Link>
        </div>

        {/* 9. 최근 접수 리드 목록 */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">최근 접수 리드</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">접수일</th>
                  <th className="px-4 py-3 font-semibold">이름</th>
                  <th className="px-4 py-3 font-semibold">구분</th>
                  <th className="px-4 py-3 font-semibold">서비스</th>
                  <th className="px-4 py-3 font-semibold">연락처</th>
                  <th className="px-4 py-3 font-semibold text-right">상세</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
                {recentLeads.map((lead) => {
                  const normalized = normalizeServiceType(lead.service_type);
                  const category = getCategory(normalized);
                  const info = CATEGORY_INFO[category];
                  return (
                    <tr key={lead.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {lead.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.badgeColor}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {getServiceLabel(normalized ?? "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{lead.phone || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="inline-block rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          상세보기 →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 10. 서비스 유형별 접수 현황 */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-900">서비스 유형별 접수 현황</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">구분</th>
                  <th className="px-4 py-3 font-semibold">서비스</th>
                  <th className="px-4 py-3 font-semibold text-right">건수</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-400">
                      데이터가 없습니다
                    </td>
                  </tr>
                )}
                {serviceRows.map(([svcType, count]) => {
                  const category = getCategory(svcType);
                  const info = CATEGORY_INFO[category];
                  return (
                    <tr key={svcType} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${info.badgeColor}`}>
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">{getServiceLabel(svcType)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
