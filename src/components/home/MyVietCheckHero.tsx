"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Calculator,
  ClipboardList,
  FileText,
  Landmark,
  MessageSquareText,
  Receipt,
  Scale,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import { ReviewScoreGauge } from "@/components/cost-check/ReviewScoreGauge";
import HomeServiceAccordion from "@/components/home/HomeServiceAccordion";

const INPUT_PLACEHOLDER = "노동허가 진행 비용이 얼마인가요?";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const ENGINE_TILES = [
  { key: "check", label: "CHECK", title: "직접 확인", icon: Landmark, href: "#check" },
  { key: "verify", label: "VERIFY", title: "직접 검토", icon: Scale, href: "#verify" },
  { key: "register", label: "REGISTER", title: "직접 허가", icon: Stamp, href: "#register" },
] as const;

const PREVIEW_METRICS = [
  { icon: Building2, label: "정부 수수료", sub: "공식 기준 확인" },
  { icon: BarChart3, label: "시장 범위", sub: "참고 구간 비교" },
  { icon: Receipt, label: "받은 견적", sub: "적정성 검토" },
] as const;

function InputField({
  icon: Icon,
  label,
  hint,
  children,
  active,
}: {
  icon: typeof FileText;
  label: string;
  hint: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 transition-all ${
        active
          ? "border-teal-400/60 bg-teal-50/30 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-teal-400 text-slate-900" : "bg-white text-slate-500 shadow-sm"
          }`}
        >
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700">{label}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function MyVietCheckHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const { href } = routeByKeywords(trimmed);
    router.push(href);
  }

  return (
    <>
      {/* Dark hero shell */}
      <section className="bg-[#0A1628] text-white">
        <div className="mx-auto max-w-lg px-5 pb-10 pt-8 sm:max-w-xl sm:px-6 sm:pt-10">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/15 ring-1 ring-teal-400/30">
              <ShieldCheck size={22} className="text-teal-400" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-slate-400">
                Vietnam Government Office Verification
              </p>
              <p className="text-lg font-bold tracking-tight">
                MY VIET CHECK
                <span className="ml-1.5 text-sm font-normal text-slate-400">by VFBCAI</span>
              </p>
            </div>
          </div>

          {/* Hook */}
          <h1 className="mt-6 text-2xl font-bold leading-snug tracking-tight sm:text-[1.65rem]">
            베트남에서 돈 쓰기 전에,
            <br />
            <span className="text-teal-400">먼저 직접 확인</span>하세요.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            행정·법률·인허가 비용과 절차를 AI가 계산하고 검증합니다.
          </p>

          {/* Main card */}
          <form onSubmit={handleSubmit} className="mt-7">
            <div className="overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              {/* Gauge zone */}
              <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 pb-2 pt-5">
                <ReviewScoreGauge size="semi" empty />
                <div className="mx-auto -mt-1 mb-3 w-fit rounded-full bg-[#0A1628] px-4 py-1.5">
                  <p className="text-[11px] font-semibold text-teal-400">
                    자가 검증 대기 · 질문 입력 후 확인
                  </p>
                </div>
              </div>

              {/* Engine tiles */}
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 px-4 py-4">
                {ENGINE_TILES.map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <a
                      key={tile.key}
                      href={tile.href}
                      className="flex flex-col items-center rounded-2xl bg-teal-50/60 px-2 py-3 text-center transition-colors hover:bg-teal-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/20 text-teal-600">
                        <Icon size={17} strokeWidth={1.75} />
                      </div>
                      <p className="mt-2 text-[9px] font-bold tracking-wider text-teal-700">
                        {tile.label}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-600">{tile.title}</p>
                    </a>
                  );
                })}
              </div>

              {/* Input fields */}
              <div className="space-y-3 px-4 py-4">
                <InputField
                  icon={FileText}
                  label="서류·업무 질문"
                  hint="예: 노동허가증, 거주증, 법인설립"
                >
                  <p className="text-sm text-slate-400">아래 입력란에 함께 확인됩니다</p>
                </InputField>

                <InputField
                  icon={ClipboardList}
                  label="절차·기간 확인"
                  hint="필요 서류와 처리 순서 안내"
                >
                  <p className="text-sm text-slate-400">질문 입력 시 자동 확인</p>
                </InputField>

                <InputField
                  icon={Calculator}
                  label="비용·견적 계산"
                  hint="정부 수수료 · 시장 범위 · 받은 견적"
                  active
                >
                  <input
                    id="check-desk-query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={INPUT_PLACEHOLDER}
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="off"
                    aria-label="비용·견적 질문 입력"
                  />
                </InputField>
              </div>

              {/* Metric preview */}
              <div className="mx-4 mb-4 rounded-2xl bg-[#0A1628] p-3">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  확인 결과 미리보기
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PREVIEW_METRICS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-xl bg-slate-800/80 px-2 py-2.5 text-center ring-1 ring-slate-700/50"
                      >
                        <Icon size={14} className="mx-auto text-teal-400/80" />
                        <p className="mt-1 text-[10px] font-semibold text-slate-200">{item.label}</p>
                        <p className="mt-0.5 text-[9px] text-slate-500">{item.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-5">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-400 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-teal-400/25 transition-colors hover:bg-teal-300"
                >
                  <MessageSquareText size={18} />
                  AI 비용 확인 시작하기
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
              비용 · 절차 · 필요서류 · 내가 받은 견적까지 확인할 수 있습니다.
            </p>
          </form>

          {/* Example chips */}
          <div className="mt-5">
            <p className="mb-2 text-center text-[10px] font-medium text-slate-500">예시 질문</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setQuery(chip);
                    document.getElementById("check-desk-query")?.focus();
                  }}
                  className="rounded-full border border-slate-700 bg-slate-800/50 px-3.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-teal-400/40 hover:bg-teal-400/10 hover:text-teal-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accordion on white */}
      <section className="bg-white">
        <div className="mx-auto max-w-lg px-5 pb-12 sm:max-w-xl sm:px-6">
          <div className="flex items-center gap-3 pt-8">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <HomeServiceAccordion />
        </div>
      </section>
    </>
  );
}
