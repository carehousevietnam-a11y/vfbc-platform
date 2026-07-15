// src/app/admin/cases/page.tsx

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

const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  possible: { label: "가능", color: "text-emerald-700 bg-emerald-50" },
  conditional: { label: "조건부 가능", color: "text-amber-700 bg-amber-50" },
  impossible: { label: "어려움", color: "text-red-700 bg-red-50" },
};

export default async function AdminCasesPage() {
  const { data: activities, error } = await supabaseAdmin
    .from("crm_activities")
    .select("id, lead_id, action, tag, meta, created_at")
    .not("meta", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">
          데이터를 불러오는 중 문제가 발생했습니다: {error.message}
        </p>
      </main>
    );
  }

  const leadIds = Array.from(
    new Set((activities ?? []).map((a) => a.lead_id).filter(Boolean))
  );

  const { data: leads } = leadIds.length
    ? await supabaseAdmin
        .from("leads")
        .select("id, name, phone, email, service_type, result, created_at")
        .in("id", leadIds)
    : { data: [] as any[] };

  const leadMap = new Map((leads ?? []).map((l) => [l.id, l]));

  // lead_id별로 가장 최근 진단 activity 1건만 노출
  const seen = new Set<string>();
  const rows = (activities ?? []).filter((a) => {
    if (!a.lead_id || seen.has(a.lead_id)) return false;
    seen.add(a.lead_id);
    return true;
  });

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBC 관리자
        </p>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            AI 진단 리포트 목록
          </h1>
          <AdminLogoutButton />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          최근 진단 요청 {rows.length}건. 클릭하면 전문가용 상세 리포트를 볼
          수 있습니다.
        </p>

        <div className="mt-6 space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-gray-400">
              아직 쌓인 진단 데이터가 없습니다.
            </p>
          )}
          {rows.map((row) => {
            const lead = leadMap.get(row.lead_id);
            const service =
              SERVICE_LABELS[lead?.service_type ?? ""] ??
              lead?.service_type ??
              "-";
            const resultInfo = RESULT_LABELS[lead?.result ?? ""] ?? null;
            const score = (row.meta as any)?.feasibilityScore;

            return (
              <Link
                key={row.id}
                href={`/admin/cases/${row.lead_id}`}
                className="block rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {lead?.name ?? "이름 미상"} · {service}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {lead?.phone}
                      {lead?.email ? ` · ${lead.email}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {typeof score === "number" && (
                      <p className="text-sm font-bold text-gray-900">
                        {score}%
                      </p>
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
                  {new Date(row.created_at).toLocaleString("ko-KR")}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
