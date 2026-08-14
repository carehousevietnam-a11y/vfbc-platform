"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  ClipboardList,
  Coins,
  Landmark,
  MessageSquareText,
  Receipt,
  Scale,
  Search,
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
  { icon: Building2, label: "정부 수수료", sub: "공식 기준" },
  { icon: BarChart3, label: "시장 범위", sub: "참고 구간" },
  { icon: Receipt, label: "받은 견적", sub: "적정성 검토" },
] as const;

function EngineTiles({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
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
            <p className="mt-2 text-[9px] font-bold tracking-wider text-teal-700">{tile.label}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-600">{tile.title}</p>
          </a>
        );
      })}
    </div>
  );
}

function MetricPreview({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0A1628] p-3 ${className}`}>
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
  );
}

function QueryInput({
  query,
  setQuery,
  isFocused,
  setIsFocused,
  showError,
  id = "check-desk-query",
  size = "default",
}: {
  query: string;
  setQuery: (v: string) => void;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
  showError: boolean;
  id?: string;
  size?: "default" | "large";
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Calculator size={14} className="text-teal-600" />
        비용·절차·견적 질문 입력
      </label>
      <div
        className={`mt-2.5 rounded-2xl border-2 bg-white transition-all ${
          showError
            ? "border-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.15)]"
            : isFocused
              ? "border-teal-400 shadow-[0_0_0_4px_rgba(45,212,191,0.15)]"
              : "border-slate-200"
        }`}
      >
        <div className={`flex items-center gap-3 px-4 ${size === "large" ? "py-4" : "py-3.5"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400 text-slate-900">
            <Search size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              여기에 입력하세요
            </p>
            <input
              id={id}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={INPUT_PLACEHOLDER}
              className={`mt-0.5 w-full border-0 bg-transparent p-0 font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 ${
                size === "large" ? "text-base" : "text-sm"
              }`}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
      {showError ? (
        <p className="mt-2 text-xs font-medium text-red-500">질문을 입력한 뒤 확인 버튼을 눌러주세요.</p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          서류·절차·비용·견적을 한 번에 입력하면 AI가 계산·검증합니다.
        </p>
      )}
    </div>
  );
}

function ExampleChips({
  onSelect,
  variant = "dark",
}: {
  onSelect: (chip: string) => void;
  variant?: "dark" | "light";
}) {
  return (
    <div>
      <p
        className={`mb-2 text-[10px] font-medium ${
          variant === "dark" ? "text-center text-slate-500" : "text-slate-400"
        }`}
      >
        예시 질문 — 클릭하면 입력란에 채워집니다
      </p>
      <div className={`flex flex-wrap gap-2 ${variant === "dark" ? "justify-center" : ""}`}>
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className={
              variant === "dark"
                ? "rounded-full border border-slate-700 bg-slate-800/50 px-3.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-teal-400/40 hover:bg-teal-400/10 hover:text-teal-300"
                : "rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-700 transition-colors hover:border-teal-400/50 hover:bg-teal-50"
            }
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MyVietCheckHero() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  function focusInput() {
    for (const elId of ["check-desk-query", "check-desk-query-desktop"]) {
      const el = document.getElementById(elId);
      if (el && el.getBoundingClientRect().width > 0) {
        el.focus();
        return;
      }
    }
  }

  function handleChipSelect(chip: string) {
    setQuery(chip);
    setShowError(false);
    focusInput();
  }

  function submitQuery() {
    const trimmed = query.trim();
    if (!trimmed) {
      setShowError(true);
      focusInput();
      return;
    }
    setShowError(false);
    const { href } = routeByKeywords(trimmed);
    router.push(href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitQuery();
  }

  const costProcedureTags = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-600">
        <Coins size={12} className="text-slate-400" />
        COST
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-600">
        <ClipboardList size={12} className="text-slate-400" />
        PROCEDURE
      </span>
    </div>
  );

  const submitButton = (
    <button
      type="submit"
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-400 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-teal-400/25 transition-colors hover:bg-teal-300 lg:w-auto lg:px-8"
    >
      <MessageSquareText size={18} />
      AI 비용 확인 시작하기
      <ArrowRight size={16} className="hidden lg:block" />
    </button>
  );

  return (
    <>
      <section className="bg-[#0A1628] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-6 sm:pt-10">
          {/* Brand — 공통 */}
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

          <form onSubmit={handleSubmit}>
            {/* ── 모바일: 세로 스택 카드 ── */}
            <div className="mt-6 lg:hidden">
              <h1 className="text-2xl font-bold leading-snug tracking-tight">
                베트남에서 돈 쓰기 전에,
                <br />
                <span className="text-teal-400">먼저 직접 확인</span>하세요.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                행정·법률·인허가 비용과 절차를 AI가 계산하고 검증합니다.
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 pb-2 pt-4">
                  <ReviewScoreGauge size="semi" empty />
                  <div className="mx-auto -mt-1 mb-2 w-fit rounded-full bg-[#0A1628] px-4 py-1.5">
                    <p className="text-[11px] font-semibold text-teal-400">
                      자가 검증 대기 · 질문 입력 후 확인
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-100 px-4 py-4">
                  <EngineTiles />
                </div>

                <div className="space-y-4 px-4 py-4">
                  <QueryInput
                    query={query}
                    setQuery={(v) => {
                      setQuery(v);
                      if (v.trim()) setShowError(false);
                    }}
                    isFocused={isFocused}
                    setIsFocused={setIsFocused}
                    showError={showError}
                  />
                  {costProcedureTags}
                  <MetricPreview />
                  {submitButton}
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
                비용 · 절차 · 필요서류 · 내가 받은 견적까지 확인할 수 있습니다.
              </p>

              <div className="mt-5">
                <ExampleChips onSelect={handleChipSelect} variant="dark" />
              </div>
            </div>

            {/* ── PC: 좌(게이지·브랜딩) + 우(입력·CTA) 2단 ── */}
            <div className="mt-8 hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
              {/* Left: gauge + hook + tiles */}
              <div className="col-span-5">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  베트남에서 돈 쓰기 전에,
                  <br />
                  <span className="text-teal-400">먼저 직접 확인</span>하세요.
                </h1>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                  행정·법률·인허가 비용과 절차를
                  <br />
                  AI가 계산하고 검증합니다.
                </p>

                <div className="mt-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                  <ReviewScoreGauge size="semi" empty />
                  <div className="mx-auto mt-2 w-fit rounded-full bg-teal-400/10 px-4 py-1.5 ring-1 ring-teal-400/20">
                    <p className="text-xs font-semibold text-teal-400">
                      자가 검증 대기 · 질문 입력 후 확인
                    </p>
                  </div>
                </div>

                <EngineTiles className="mt-6" />
              </div>

              {/* Right: 입력 패널 */}
              <div className="col-span-7">
                <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-800">
                      <MessageSquareText size={12} />
                      질문 입력
                    </span>
                    <span className="text-slate-300">+</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                      <Calculator size={12} />
                      비용 계산
                    </span>
                  </div>

                  <div className="mt-5">
                    <QueryInput
                      query={query}
                      setQuery={(v) => {
                        setQuery(v);
                        if (v.trim()) setShowError(false);
                      }}
                      isFocused={isFocused}
                      setIsFocused={setIsFocused}
                      showError={showError}
                      id="check-desk-query-desktop"
                      size="large"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {costProcedureTags}
                    <div className="hidden xl:block">{submitButton}</div>
                  </div>

                  <MetricPreview className="mt-5" />

                  <div className="mt-5 xl:hidden">{submitButton}</div>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <ExampleChips onSelect={handleChipSelect} variant="light" />
                  </div>
                </div>

                <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
                  비용 · 절차 · 필요서류 · 내가 받은 견적까지 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-6">
          <div className="flex items-center gap-3 pt-8 lg:pt-10">
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
