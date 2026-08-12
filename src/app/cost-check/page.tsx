"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Home,
  IdCard,
  Landmark,
  Scale,
  Sparkles,
} from "lucide-react";
import { PrimaryButton, SelectionCard, InfoBox } from "@/components/ui";
import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_MARKET_NOTE,
  COST_CHECK_SERVICES,
  type CostCheckServiceId,
  type DocPrepStatus,
  docPrepHint,
  evaluateCostQuote,
  formatCostAmount,
  getCostCheckService,
} from "@/lib/costCheck";

type Step = "service" | "amount" | "prep" | "result";

const SERVICE_ICONS = {
  tamtru: Home,
  trc: IdCard,
  wp: FileText,
  company: Building2,
  notary: Scale,
} as const;

const SERVICE_TONES = {
  tamtru: "cyan",
  trc: "blue",
  wp: "green",
  company: "purple",
  notary: "amber",
} as const;

const DOC_PREP_OPTIONS: { id: DocPrepStatus; label: string; description: string }[] = [
  { id: "unknown", label: "잘 모르겠음", description: "아직 서류 준비 상태를 확인하지 않았어요" },
  { id: "not_started", label: "아직 시작 전", description: "필요 서류를 거의 준비하지 않았어요" },
  { id: "partial", label: "일부 준비됨", description: "일부 서류만 준비된 상태예요" },
  { id: "ready", label: "대체로 준비됨", description: "제출 가능한 서류가 대부분 갖춰졌어요" },
];

const VERDICT_STYLES = {
  very_low: {
    badge: "bg-amber-100 text-amber-800",
    ring: "ring-amber-200",
    label: "주의 필요",
  },
  low: {
    badge: "bg-sky-100 text-sky-800",
    ring: "ring-sky-200",
    label: "낮은 편",
  },
  fair: {
    badge: "bg-emerald-100 text-emerald-800",
    ring: "ring-emerald-200",
    label: "적정",
  },
  high: {
    badge: "bg-orange-100 text-orange-800",
    ring: "ring-orange-200",
    label: "높은 편",
  },
} as const;

export default function CostCheckPage() {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<CostCheckServiceId | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [docPrep, setDocPrep] = useState<DocPrepStatus>("unknown");

  const service = serviceId ? getCostCheckService(serviceId) : null;

  const parsedAmount = useMemo(() => {
    const normalized = amountInput.replace(/,/g, "").trim();
    if (!normalized) return null;
    const value = Number(normalized);
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
  }, [amountInput]);

  const evaluation = useMemo(() => {
    if (!service || parsedAmount == null) return null;
    return evaluateCostQuote(service, parsedAmount);
  }, [service, parsedAmount]);

  function resetFlow() {
    setStep("service");
    setServiceId(null);
    setAmountInput("");
    setDocPrep("unknown");
  }

  function goToAmount() {
    if (!serviceId) return;
    setStep("amount");
  }

  function goToPrep() {
    if (parsedAmount == null) return;
    setStep("prep");
  }

  function showResult() {
    if (parsedAmount == null || !service) return;
    setStep("result");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            홈으로
          </Link>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-800">
            무료 · 회원가입 없음
          </span>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-900 text-white">
              <Landmark size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
                Cost Check
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                행정비용 적정성 진단
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                받으신 견적이 정부 공식 수수료와 시장 참고 범위 대비 어느 정도인지
                규칙 기반으로 빠르게 확인합니다. VFBCAI 서비스 가격은 표시하지 않습니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-500">
            {[
              { key: "service", label: "1. 서비스" },
              { key: "amount", label: "2. 견적" },
              { key: "prep", label: "3. 서류" },
              { key: "result", label: "4. 결과" },
            ].map((item) => (
              <div
                key={item.key}
                className={`rounded-xl px-2 py-2 ${
                  step === item.key ? "bg-blue-900 text-white" : "bg-slate-50 text-slate-500"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {step === "service" && (
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">어떤 서비스 견적인가요?</h2>
            <p className="mt-1 text-sm text-slate-500">해당하는 항목을 선택해주세요.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {COST_CHECK_SERVICES.map((item) => {
                const Icon = SERVICE_ICONS[item.id];
                return (
                  <SelectionCard
                    key={item.id}
                    title={item.label}
                    description={item.description}
                    icon={Icon}
                    tone={SERVICE_TONES[item.id]}
                    selected={serviceId === item.id}
                    onClick={() => setServiceId(item.id)}
                  />
                );
              })}
            </div>
            <div className="mt-6">
              <PrimaryButton disabled={!serviceId} onClick={goToAmount}>
                다음: 견적 금액 입력
              </PrimaryButton>
            </div>
          </section>
        )}

        {step === "amount" && service && (
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">견적받은 금액을 입력해주세요</h2>
            <p className="mt-1 text-sm text-slate-500">
              {service.label} · {service.currency === "USD" ? "USD 기준" : "VND 기준"}
            </p>
            <label className="mt-5 block">
              <span className="text-xs font-semibold text-slate-700">견적 금액</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="text-sm font-semibold text-slate-500">
                  {service.currency === "USD" ? "$" : "₫"}
                </span>
                <input
                  type="number"
                  min={1}
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder={service.currency === "USD" ? "예: 320" : "예: 150000"}
                  className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
                />
                <span className="text-xs font-medium text-slate-400">{service.currency}</span>
              </div>
            </label>
            <div className="mt-4 flex gap-2">
              <PrimaryButton variant="secondary" onClick={() => setStep("service")}>
                이전
              </PrimaryButton>
              <PrimaryButton disabled={parsedAmount == null} onClick={goToPrep}>
                다음: 서류 준비 상태
              </PrimaryButton>
            </div>
          </section>
        )}

        {step === "prep" && service && (
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">서류 준비 상태 (선택)</h2>
            <p className="mt-1 text-sm text-slate-500">
              선택 사항입니다. 결과 안내 문구에만 반영됩니다.
            </p>
            <div className="mt-5 grid gap-3">
              {DOC_PREP_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.id}
                  title={option.label}
                  description={option.description}
                  tone="slate"
                  selected={docPrep === option.id}
                  onClick={() => setDocPrep(option.id)}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <PrimaryButton variant="secondary" onClick={() => setStep("amount")}>
                이전
              </PrimaryButton>
              <PrimaryButton onClick={showResult}>결과 보기</PrimaryButton>
            </div>
          </section>
        )}

        {step === "result" && service && evaluation && parsedAmount != null && (
          <section className="mt-5 space-y-5">
            <div
              className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-2 sm:p-8 ${VERDICT_STYLES[evaluation.verdict].ring}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${VERDICT_STYLES[evaluation.verdict].badge}`}
                >
                  {VERDICT_STYLES[evaluation.verdict].label}
                </span>
                <span className="text-xs text-slate-500">{service.label}</span>
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-950">{evaluation.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{evaluation.summary}</p>
              <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {evaluation.detail}
              </p>
              {docPrepHint(docPrep) && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{docPrepHint(docPrep)}</p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-base font-bold text-slate-900">비용 비교 요약</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">입력 견적</dt>
                  <dd className="font-bold text-slate-900">
                    {formatCostAmount(parsedAmount, service.currency)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">정부 공식 수수료</dt>
                  <dd className="max-w-[60%] text-right font-semibold text-slate-800">
                    {service.governmentFee}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">시장 참고 범위</dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {formatCostAmount(service.marketMin, service.currency)} ~{" "}
                    {formatCostAmount(service.marketMax, service.currency)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">출처</dt>
                  <dd className="max-w-[60%] text-right text-xs leading-relaxed text-slate-600">
                    {service.source}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">{service.marketNote}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{COST_CHECK_MARKET_NOTE}</p>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-blue-900">
                <Sparkles size={18} />
                <p className="text-sm font-bold">정확한 진단은 VFBCAI에서</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
                이 도구는 견적 적정성 참고용입니다. 내 상황에 맞는 가능성·필요 서류·진행
                전략은 VFBCAI 진단을 통해 확인할 수 있습니다.
              </p>
              <Link
                href={service.ctaHref}
                className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-900 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-950"
              >
                {service.ctaLabel}
                <ArrowRight size={16} />
              </Link>
            </div>

            <InfoBox>{COST_CHECK_DISCLAIMER}</InfoBox>

            <div className="flex gap-2">
              <PrimaryButton variant="secondary" onClick={() => setStep("prep")}>
                입력 수정
              </PrimaryButton>
              <PrimaryButton variant="outline" onClick={resetFlow}>
                처음부터 다시
              </PrimaryButton>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
