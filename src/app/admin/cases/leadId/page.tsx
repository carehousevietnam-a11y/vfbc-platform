// src/app/admin/cases/[leadId]/page.tsx

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  wp: "노동허가(WP)",
  trc: "거주증(TRC)",
  tamtru: "땀주",
  "driving-license": "운전면허",
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "낮음", color: "text-emerald-700 bg-emerald-50" },
  medium: { label: "중간", color: "text-amber-700 bg-amber-50" },
  high: { label: "높음", color: "text-red-700 bg-red-50" },
};

export default async function AdminCaseDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  const { data: activities } = await supabaseAdmin
    .from("crm_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  const diagnosisActivities = (activities ?? []).filter(
    (a) => (a.meta as any)?.expertBrief
  );
  const latestDiagnosis = diagnosisActivities[diagnosisActivities.length - 1];
  const expertBrief = (latestDiagnosis?.meta as any)?.expertBrief;
  const feasibilityScore = (latestDiagnosis?.meta as any)?.feasibilityScore;

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">해당 리드를 찾을 수 없습니다.</p>
        <Link
          href="/admin/cases"
          className="mt-4 inline-block text-xs text-blue-900 hover:underline"
        >
          ← 목록으로
        </Link>
      </main>
    );
  }

  const riskInfo = expertBrief?.riskLevel
    ? RISK_LABELS[expertBrief.riskLevel]
    : null;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/admin/cases"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 목록으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBC 관리자 · {SERVICE_LABELS[lead.service_type] ?? lead.service_type}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {lead.name}
        </h1>

        {/* 고객 정보 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">고객 정보</p>
          <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-gray-500">전화번호</span>
            <span className="font-medium text-gray-900">{lead.phone}</span>
            <span className="text-gray-500">이메일</span>
            <span className="font-medium text-gray-900">
              {lead.email ?? "-"}
            </span>
            <span className="text-gray-500">주소</span>
            <span className="font-medium text-gray-900">
              {lead.address ?? "-"}
            </span>
            <span className="text-gray-500">카카오톡</span>
            <span className="font-medium text-gray-900">
              {lead.kakao_id ?? "-"}
            </span>
            <span className="text-gray-500">잘로</span>
            <span className="font-medium text-gray-900">
              {lead.zalo_id ?? "-"}
            </span>
            <span className="text-gray-500">접수일</span>
            <span className="font-medium text-gray-900">
              {new Date(lead.created_at).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>

        {/* AI 전문가용 진단 리포트 */}
        {expertBrief ? (
          <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">
                AI 전문가용 진단 리포트
              </p>
              {typeof feasibilityScore === "number" && (
                <span className="text-sm font-bold text-gray-900">
                  {feasibilityScore}%
                </span>
              )}
            </div>
            {riskInfo && (
              <span
                className={`inline-block mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${riskInfo.color}`}
              >
                리스크 {riskInfo.label}
              </span>
            )}

            {expertBrief.checkedItems?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">
                  항목별 확인 결과
                </p>
                <div className="mt-2 space-y-2">
                  {expertBrief.checkedItems.map((item: any, i: number) => (
                    <div key={i} className="rounded-xl bg-gray-50 px-3 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        {item.passed ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-600 shrink-0"
                          />
                        ) : (
                          <AlertTriangle
                            size={14}
                            className="text-amber-600 shrink-0"
                          />
                        )}
                        {item.label}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 pl-[22px]">
                        {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expertBrief.rejectionRisks?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">
                  반려 위험 요인
                </p>
                <ol className="mt-2 space-y-1 list-decimal pl-4">
                  {[...expertBrief.rejectionRisks]
                    .sort((a: any, b: any) => a.rank - b.rank)
                    .map((r: any, i: number) => (
                      <li key={i} className="text-xs text-red-700">
                        {r.reason}
                      </li>
                    ))}
                </ol>
              </div>
            )}

            {expertBrief.recommendedSteps?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">
                  권장 조치
                </p>
                <ul className="mt-2 space-y-1">
                  {expertBrief.recommendedSteps.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 pl-1">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {expertBrief.similarCases?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">
                  유사 사례
                </p>
                <ul className="mt-2 space-y-1">
                  {expertBrief.similarCases.map((c: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 pl-1">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 text-xs text-gray-400">
            이 리드에는 아직 AI 전문가용 진단 데이터가 없습니다.
          </div>
        )}

        {/* 활동 타임라인 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">활동 타임라인</p>
          <div className="mt-2 space-y-2">
            {(activities ?? []).map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-gray-600">{a.action}</span>
                <span className="text-gray-400 shrink-0">
                  {new Date(a.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
