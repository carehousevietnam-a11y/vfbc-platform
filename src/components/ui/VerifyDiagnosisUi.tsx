"use client";

import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, UserCheck } from "lucide-react";
import type { DiagnosisResult } from "@/lib/verifyDiagnosis";
import PrimaryButton from "./PrimaryButton";
import {
  VERIFY_AI_REVIEW_CARD_DESC,
  VERIFY_AI_REVIEW_CTA_FOOTNOTE,
  VERIFY_DIAGNOSIS_LIMIT_NOTICE,
  VERIFY_DIAGNOSIS_NEXT_SUBTITLE,
  VERIFY_DIAGNOSIS_NEXT_TITLE,
  VERIFY_DIRECT_CARD_DESC,
  VERIFY_EXPERT_CARD_DESC,
  VERIFY_EXPERT_CTA_FOOTNOTE,
  VERIFY_RISK_FACTOR_CARD_CAPTION,
} from "./verifyFunnelCopy";
/** VERIFY riskLevel 시각화 — 실제 riskLevel 값만 사용(임의 점수 없음) */
export function RiskGauge({
  riskLevel,
  size = 104,
}: {
  riskLevel: "low" | "medium" | "high";
  size?: number;
}) {
  const isLow = riskLevel === "low";
  const ringColor = isLow ? "#059669" : riskLevel === "medium" ? "#D97706" : "#DC2626";
  const label = isLow ? "낮음" : riskLevel === "medium" ? "보통" : "높음";
  const fillRatio = isLow ? 1 / 3 : riskLevel === "medium" ? 2 / 3 : 1;
  const scale = size / 104;
  const strokeWidth = 7 * scale;
  const r = 46 * scale;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fillRatio)}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`flex items-center justify-center rounded-full ${
            isLow ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
          style={{ width: 20 * scale, height: 20 * scale }}
        >
          {isLow ? <CheckCircle2 size={12 * scale} /> : <AlertTriangle size={12 * scale} />}
        </span>
        <strong className="mt-0.5 font-black leading-none text-gray-900" style={{ fontSize: 15 * scale }}>
          위험도
        </strong>
        <span
          className={`mt-0.5 font-bold ${
            isLow ? "text-emerald-600" : riskLevel === "medium" ? "text-amber-600" : "text-red-600"
          }`}
          style={{ fontSize: 12 * scale }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

type OverviewItem = {
  n: number;
  label: string;
  visual: ReactNode;
  pill: ReactNode;
  caption: string;
  outcome?: "current" | "next";
};

/** 동적 위험요인 라벨을 카드 pill용 짧은 상태 표현으로 정제(원본 데이터·의미 유지) */
function compactRiskFactorStatus(label: string): string {
  if (label.includes("첨부되지 않")) return "서류 미첨부";
  if (label.includes("사진으로 첨부")) return "사진 첨부";
  if (label.includes("문서 파일로 접수")) return "문서 첨부";
  if (label.includes("아직 없습니다")) return "확인 대기";

  const beforeEmDash = label.split("—")[0]?.trim();
  if (beforeEmDash && beforeEmDash.length <= 14) return beforeEmDash;

  const stripped = label.replace(/\([^)]*\)/g, "").trim();
  const beforeParticle = stripped.split(/이(?=\s)/)[0]?.trim();
  if (beforeParticle && beforeParticle.length >= 4 && beforeParticle.length <= 14) {
    return beforeParticle;
  }

  if (stripped.length <= 14) return stripped;
  return "추가 확인 필요";
}

const OVERVIEW_ICON_WRAP = "flex h-12 w-12 items-center justify-center";

export function VerifyResultOverviewCards({  diagnosis,
  docCount,
}: {
  diagnosis: DiagnosisResult;
  docCount: number;
}) {
  const { riskLevel } = diagnosis.expertBrief;
  const riskLabel = riskLevel === "low" ? "낮음" : riskLevel === "medium" ? "보통" : "높음";
  const topRiskFactor =
    diagnosis.report?.riskFactors?.[0]?.label ??
    diagnosis.checklist.find((c) => c.level === "critical")?.label ??
    diagnosis.checklist[0]?.label ??
    "확인된 주요 위험요인이 아직 없습니다";

  const riskFactorStatus = compactRiskFactorStatus(topRiskFactor);
  const riskPillTone =
    riskLevel === "low"
      ? "bg-emerald-50 text-emerald-700"
      : riskLevel === "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  const aiOpinionText = riskLevel === "low" ? "정상" : "확인필요";
  const aiOpinionTone =
    riskLevel === "low"
      ? "bg-emerald-50 text-emerald-700"
      : riskLevel === "medium"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  const items: OverviewItem[] = [
    {
      n: 1,
      label: "위험도",
      visual: <RiskGauge riskLevel={riskLevel} size={52} />,
      pill: <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${riskPillTone}`}>{riskLabel}</span>,
      caption: "입력 상황 기준 1차 위험도",
      outcome: "current",
    },
    {
      n: 2,
      label: "주요 위험요인",
      visual: (
        <div className={`${OVERVIEW_ICON_WRAP} rounded-full bg-amber-50`}>
          <AlertTriangle className="text-amber-600" size={22} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          {riskFactorStatus}
        </span>
      ),
      caption: VERIFY_RISK_FACTOR_CARD_CAPTION,
      outcome: "current",    },
    {
      n: 3,
      label: "AI 1차 분석 의견",
      visual: (
        <div className={`${OVERVIEW_ICON_WRAP} rounded-full bg-gray-100`}>
          <UserCheck className="text-gray-700" size={22} />
        </div>
      ),
      pill: (
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${aiOpinionTone}`}>{aiOpinionText}</span>
      ),
      caption: "법률전문 AI 1차 의견",      outcome: "current",
    },
    {
      n: 4,
      label: "추가 확인자료",
      visual: (
        <div className={`${OVERVIEW_ICON_WRAP} rounded-full bg-blue-50`}>
          <FileText className="text-blue-700" size={22} />
        </div>
      ),
      pill: (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-800">          {docCount > 0 ? `필요 ${docCount}개` : "확인 필요"}
        </span>
      ),
      caption: "AI Review 전 필요 자료",
      outcome: "current",
    },
    {
      n: 5,
      label: "전체 리포트",
      visual: (
        <div className={`${OVERVIEW_ICON_WRAP} rounded-full border border-dashed border-[#94A3B8] bg-white`}>
          <ArrowRight className="text-[#0B2A6B]" size={18} />
        </div>
      ),
      pill: (
        <span className="rounded-full border border-dashed border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-800">
          AI Review 후
        </span>
      ),
      caption: "다음 단계 결과물",      outcome: "next",
    },
  ];

  return (
    <>
      <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
        현재 확인된 내용
      </p>

      <div className="mt-3 hidden overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white sm:grid sm:grid-cols-5 sm:divide-x sm:divide-[#E2E8F0]">
        {items.map((item) => (
          <div
            key={item.n}
            className={`flex flex-col items-center gap-2 p-3.5 text-center ${
              item.outcome === "next"
                ? "border-l border-dashed border-[#94A3B8] bg-[#F8FAFC] sm:border-l"
                : ""
            }`}
          >
            <div className="flex w-full min-w-0 flex-col items-start gap-1">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  item.outcome === "next" ? "text-[#64748B]" : "invisible"
                }`}
              >
                다음 단계
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    item.outcome === "next" ? "bg-[#0B2A6B]/80" : "bg-[#0B2A6B]"
                  }`}
                >
                  {item.n}
                </span>
                <span className="break-keep text-[11px] font-semibold leading-[1.4] text-gray-700">{item.label}</span>
              </div>
            </div>
            <div className="flex h-12 items-center justify-center">{item.visual}</div>
            <div className="flex min-h-[26px] w-full min-w-0 items-center justify-center">{item.pill}</div>
            <p className="break-keep text-[11px] leading-[1.5] text-[#64748B] [overflow-wrap:normal]">
              {item.caption}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white sm:hidden">
        {items.map((item, index) => (
          <div
            key={item.n}
            className={`flex items-start justify-between gap-3 p-3.5 ${
              index > 0 ? "border-t border-[#E2E8F0]" : ""
            } ${item.outcome === "next" ? "border-t border-dashed border-[#94A3B8] bg-[#F8FAFC]" : ""}`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  item.outcome === "next" ? "bg-[#0B2A6B]/80" : "bg-[#0B2A6B]"
                }`}
              >
                {item.n}
              </span>
              <div className="min-w-0 flex-1">
                {item.outcome === "next" ? (
                  <span className="block text-[10px] font-semibold text-[#64748B]">다음 단계</span>
                ) : null}
                <span className="break-keep text-sm font-medium leading-[1.4] text-gray-700">{item.label}</span>
                {item.n === 2 ? (
                  <p className="mt-1 break-keep text-[11px] font-bold leading-[1.5] text-amber-800 [overflow-wrap:normal]">
                    {riskFactorStatus}
                  </p>
                ) : null}
                {item.n === 2 ? (
                  <p className="mt-0.5 break-keep text-[11px] leading-[1.5] text-[#64748B] [overflow-wrap:normal]">
                    {VERIFY_RISK_FACTOR_CARD_CAPTION}
                  </p>
                ) : null}
              </div>
            </div>
            {item.n !== 2 ? <div className="shrink-0 pt-0.5">{item.pill}</div> : null}
          </div>
        ))}
      </div>
    </>
  );
}
function buildVerifyResultSummaryParts(diagnosis: DiagnosisResult) {
  const { riskLevel, summary } = diagnosis.expertBrief;
  const riskLabel = riskLevel === "low" ? "낮은" : riskLevel === "medium" ? "보통" : "높은";
  const judgment = `입력하신 사건유형·설명을 기준으로 위험도는 '${riskLabel}' 수준으로 1차 분류되었습니다.`;
  const analysis = diagnosis.report?.analysisOpinion ?? summary;
  return { judgment, analysis };
}

export function VerifyResultSummaryCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const { judgment, analysis } = buildVerifyResultSummaryParts(diagnosis);

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2A6B] text-[10px] font-bold text-white">
          AI
        </span>
        <p className="text-sm font-bold text-gray-900">AI 1차 분석 결과</p>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[11px] font-semibold tracking-tight text-[#0B2A6B]">현재 판단</p>
          <p className="mt-1 break-keep text-[13px] leading-[1.55] text-gray-700 [overflow-wrap:normal]">{judgment}</p>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-[11px] font-semibold tracking-tight text-[#0B2A6B]">분석 근거</p>
          <p className="mt-1 break-keep text-[13px] leading-[1.55] text-gray-700 [overflow-wrap:normal]">{analysis}</p>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-[11px] font-semibold tracking-tight text-[#0B2A6B]">확인이 필요한 부분</p>
          <p className="mt-1 break-keep text-[13px] leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
            {VERIFY_DIAGNOSIS_LIMIT_NOTICE}
          </p>
        </div>
      </div>
    </div>
  );
}
export function VerifyDiagnosisNextSteps({
  onAiReview,
  aiReportRequesting,
  aiReportError,
  onExpert,
  expertRequesting,
  expertError,
  onDirect,
}: {
  onAiReview: () => void;
  aiReportRequesting: boolean;
  aiReportError: string | null;
  onExpert: () => void;
  expertRequesting: boolean;
  expertError: string | null;
  onDirect: () => void;
}) {
  return (
    <>
      <p className="mt-5 break-keep text-sm font-bold text-gray-900">{VERIFY_DIAGNOSIS_NEXT_TITLE}</p>
      <p className="mt-1 break-keep text-xs leading-[1.55] text-[#64748B] [overflow-wrap:normal]">
        {VERIFY_DIAGNOSIS_NEXT_SUBTITLE}
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-3 sm:items-stretch">
        <div className="relative flex h-full flex-col rounded-2xl border border-[#0B2A6B] bg-white p-4 shadow-[0_1px_3px_rgba(11,42,107,0.08)]">
          <span className="absolute -top-2.5 left-4 rounded-full bg-[#0B2A6B] px-2.5 py-0.5 text-[10px] font-bold text-white">
            필수
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">AI Review 진행하기</p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">
            {VERIFY_AI_REVIEW_CARD_DESC}
          </p>
          <div className="mt-auto pt-4">
            <PrimaryButton onClick={onAiReview} loading={aiReportRequesting}>
              {aiReportRequesting ? "이동 중..." : "AI Review 진행하기"}
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] leading-[1.5] text-slate-500">
              {aiReportError ? (
                <span className="text-red-600">{aiReportError}</span>
              ) : (
                VERIFY_AI_REVIEW_CTA_FOOTNOTE
              )}
            </p>
          </div>
        </div>

        <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            추천
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">전문가 검토 요청하기</p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">
            {VERIFY_EXPERT_CARD_DESC}
          </p>
          <div className="mt-auto pt-4">
            <PrimaryButton variant="outline" onClick={onExpert} loading={expertRequesting}>
              전문가 검토 요청하기
            </PrimaryButton>
            <p className="mt-2 min-h-[32px] text-center text-[11px] leading-[1.5] text-slate-500">
              {expertError ? <span className="text-red-600">{expertError}</span> : VERIFY_EXPERT_CTA_FOOTNOTE}
            </p>
          </div>
        </div>

        <div className="relative flex h-full flex-col rounded-2xl border border-gray-100 bg-[#FAFBFC] p-4">
          <span className="absolute -top-2.5 left-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
            신중
          </span>
          <p className="mt-1 min-h-[40px] text-sm font-bold leading-[1.4] text-gray-900">직접 검토 진행하기</p>
          <p className="mt-2 min-h-[54px] break-keep text-xs leading-[1.55] text-gray-500 [overflow-wrap:normal]">            {VERIFY_DIRECT_CARD_DESC}
          </p>
          <div className="mt-auto pt-4">
            <PrimaryButton
              variant="outline"
              onClick={onDirect}
              className="border-gray-200 text-gray-600 shadow-none hover:bg-gray-50"
            >
              직접 검토 진행하기
            </PrimaryButton>
            <div className="mt-2 min-h-[32px]" aria-hidden />
          </div>
        </div>
      </div>
    </>
  );
}