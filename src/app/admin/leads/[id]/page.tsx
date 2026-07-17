// src/app/admin/leads/[id]/page.tsx
//
// VERIFY 5종(admin/real-estate/fraud/tax/unclear) 리드 상세보기.
// admin/cases/[leadId]/page.tsx(CHECK용)와 동일한 시각적 패턴을 따르되,
// verifyDiagnosis.ts의 ExpertBrief 구조와 meta 필드명(expert_brief,
// 스네이크케이스)에 맞춰 작성됨.

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, Paperclip } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  verify_admin: "행정문서 검토",
  "verify_real-estate": "부동산 문서 검토",
  verify_fraud: "사기문서 검토",
  verify_tax: "세무문서 검토",
  verify_unclear: "불확실한 서류 검토",
};

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "낮음", color: "text-emerald-700 bg-emerald-50" },
  medium: { label: "중간", color: "text-amber-700 bg-amber-50" },
  high: { label: "높음", color: "text-red-700 bg-red-50" },
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data: activities } = await supabaseAdmin
    .from("crm_activities")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: true });

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#fafafa] p-10">
        <p className="text-sm text-red-600">해당 리드를 찾을 수 없습니다.</p>
        <Link
          href="/admin/leads"
          className="mt-4 inline-block text-xs text-blue-900 hover:underline"
        >
          ← 목록으로
        </Link>
      </main>
    );
  }

  // 최초 접수 시 첨부한 서류 정보 (verify_lead 활동의 meta.file_url / file_name)
  const uploadActivity = (activities ?? []).find(
    (a) => (a.meta as any)?.file_url
  );
  const fileUrl = (uploadActivity?.meta as any)?.file_url ?? null;
  const fileName = (uploadActivity?.meta as any)?.file_name ?? null;

  // 전문가 검토 요청 시 저장된 expert_brief (스네이크케이스 필드명 주의)
  const expertActivities = (activities ?? []).filter(
    (a) => (a.meta as any)?.expert_brief
  );
  const latestExpert = expertActivities[expertActivities.length - 1];
  const expertBrief = (latestExpert?.meta as any)?.expert_brief;

  const riskInfo = expertBrief?.riskLevel ? RISK_LABELS[expertBrief.riskLevel] : null;

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 목록으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBCAI 관리자 · VERIFY · {SERVICE_LABELS[lead.service_type as string] ?? lead.service_type}
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
            <span className="font-medium text-gray-900">{lead.email ?? "-"}</span>
            <span className="text-gray-500">주소</span>
            <span className="font-medium text-gray-900">{lead.address ?? "-"}</span>
            <span className="text-gray-500">카카오톡</span>
            <span className="font-medium text-gray-900">{lead.kakao_id ?? "-"}</span>
            <span className="text-gray-500">잘로</span>
            <span className="font-medium text-gray-900">{lead.zalo_id ?? "-"}</span>
            <span className="text-gray-500">접수일</span>
            <span className="font-medium text-gray-900">
              {new Date(lead.created_at).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>

        {/* 첨부 서류 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">첨부 서류</p>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-900 hover:underline"
            >
              <Paperclip size={13} /> {fileName ?? "첨부파일 열기"}
            </a>
          ) : (
            <p className="mt-2 text-xs text-gray-400">첨부된 서류가 없습니다.</p>
          )}
        </div>

        {/* AI 전문가용 진단 리포트 */}
        {expertBrief ? (
          <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">AI 전문가용 진단 리포트</p>
              {riskInfo && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${riskInfo.color}`}
                >
                  리스크 {riskInfo.label}
                </span>
              )}
            </div>

            {expertBrief.summary && (
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                {expertBrief.summary}
              </p>
            )}

            {expertBrief.checkedItems?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">항목별 확인 결과</p>
                <div className="mt-2 space-y-2">
                  {expertBrief.checkedItems.map((item: any, i: number) => (
                    <div key={i} className="rounded-xl bg-gray-50 px-3 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        {item.passed ? (
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        )}
                        {item.label}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 pl-[22px]">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expertBrief.rejectionRisks?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700">주요 위험 요인</p>
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
                <p className="text-xs font-semibold text-gray-700">권장 조치</p>
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
                <p className="text-xs font-semibold text-gray-700">유사 사례</p>
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
            이 리드는 아직 전문가 검토를 요청하지 않아 AI 진단 데이터가 없습니다.
          </div>
        )}

        {/* 활동 타임라인 */}
        <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold text-gray-700">활동 타임라인</p>
          <div className="mt-2 space-y-2">
            {(activities ?? []).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 text-xs">
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
