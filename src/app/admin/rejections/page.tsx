// src/app/admin/rejections/page.tsx
//
// previous_rejections 테이블 조회 화면.
// 서비스별(WP/TRC/땀주/운전면허) 대분류 카드 → 개별 기록 목록 2단계 구조.
// 리드로 전환된 기록은 해당 고객 상세 프로필(/admin/cases/[id])로 바로 연결됨.

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
};

function getServiceLabel(serviceType: string) {
  return SERVICE_LABELS[serviceType] ?? serviceType;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ko-KR");
}

export default async function AdminRejectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const service = (typeof sp.service === "string" && sp.service) || null;

  const { data: rows, error } = await supabaseAdmin
    .from("previous_rejections")
    .select("id, service_type, source_page, reason, linked_lead_id, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">
          데이터를 불러오는 중 문제가 발생했습니다: {error.message}
        </p>
      </main>
    );
  }

  const records = rows ?? [];

  // 연결된 리드의 이름·전화번호를 같이 보여주기 위해 조회
  const linkedLeadIds = Array.from(
    new Set(
      records
        .map((r) => r.linked_lead_id)
        .filter((id): id is string => !!id)
    )
  );
  const { data: linkedLeads } = linkedLeadIds.length
    ? await supabaseAdmin
        .from("leads")
        .select("id, name, phone")
        .in("id", linkedLeadIds)
    : { data: [] as { id: string; name: string | null; phone: string | null }[] };
  const leadById = new Map((linkedLeads ?? []).map((l) => [l.id, l]));

  // 서비스별 집계
  const byService = new Map<string, { total: number; linked: number }>();
  for (const r of records) {
    const key = r.service_type ?? "미상";
    const cur = byService.get(key) ?? { total: 0, linked: 0 };
    cur.total += 1;
    if (r.linked_lead_id) cur.linked += 1;
    byService.set(key, cur);
  }
  const serviceRows = Array.from(byService.entries()).sort(
    (a, b) => b[1].total - a[1].total
  );

  const filtered = service ? records.filter((r) => r.service_type === service) : records;
  const totalLinked = records.filter((r) => r.linked_lead_id).length;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            VFBCAI 관리자
          </p>
          <AdminLogoutButton />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          <Link href="/admin/cases" className="hover:text-gray-600 hover:underline">
            AI 진단 리포트
          </Link>
          <span>/</span>
          <Link
            href="/admin/rejections"
            className={
              service ? "hover:text-gray-600 hover:underline" : "text-gray-700 font-medium"
            }
          >
            거절이력
          </Link>
          {service && (
            <>
              <span>/</span>
              <span className="text-gray-700 font-medium">{getServiceLabel(service)}</span>
            </>
          )}
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          타 기관 거절이력
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          총 {records.length}건 · 리드로 전환된 건 {totalLinked}건
        </p>

        {/* LEVEL 1: 서비스별 카드 */}
        {!service && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {serviceRows.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2">아직 데이터가 없습니다.</p>
            )}
            {serviceRows.map(([svcType, stat]) => (
              <Link
                key={svcType}
                href={`/admin/rejections?service=${svcType}`}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
              >
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  {getServiceLabel(svcType)}
                </span>
                <div className="mt-3 flex gap-4">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.total}</p>
                    <p className="text-[11px] text-gray-400">전체 건수</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.linked}</p>
                    <p className="text-[11px] text-gray-400">리드 전환</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* LEVEL 2: 개별 기록 목록 */}
        {service && (
          <div className="mt-6 space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400">데이터가 없습니다.</p>
            )}
            {filtered.map((r) => {
              const lead = r.linked_lead_id ? leadById.get(r.linked_lead_id) : null;
              return (
                <div
                  key={r.id}
                  className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      {getServiceLabel(r.service_type)}
                    </span>
                    {lead ? (
                      <Link
                        href={`/admin/cases/${r.linked_lead_id}`}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:underline"
                      >
                        {lead.name ?? "이름 미상"} 프로필로 보기 →
                      </Link>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        익명 (미전환)
                      </span>
                    )}
                  </div>
                  {r.reason ? (
                    <details className="group mt-3">
                      <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 group-open:line-clamp-none">
                          {r.reason}
                        </p>
                        <span className="mt-1 inline-block text-[11px] font-semibold text-blue-900 group-open:hidden">
                          더 보기 ▾
                        </span>
                        <span className="mt-1 hidden text-[11px] font-semibold text-gray-400 group-open:inline-block">
                          접기 ▴
                        </span>
                      </summary>
                    </details>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">사유 미기재</p>
                  )}
                  {lead?.phone && (
                    <p className="mt-1 text-[11px] text-gray-400">{lead.phone}</p>
                  )}
                  <p className="mt-2 text-[11px] text-gray-400">
                    {formatDate(r.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
