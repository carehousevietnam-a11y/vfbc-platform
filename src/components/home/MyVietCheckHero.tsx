"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, PenLine, Scale, Search } from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import HomeServiceAccordion from "@/components/home/HomeServiceAccordion";

const INPUT_PLACEHOLDER = "노동허가 진행 비용이 얼마나 드나요?";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const ENGINE_PILLARS = [
  {
    key: "check",
    label: "CHECK",
    title: "확인",
    desc: "비용·자격·등록 가능 여부를 스스로 확인합니다.",
    icon: Search,
    href: "#check",
  },
  {
    key: "verify",
    label: "VERIFY",
    title: "검증",
    desc: "받은 견적과 서류가 정상 범위인지 검토합니다.",
    icon: Scale,
    href: "#verify",
  },
  {
    key: "register",
    label: "REGISTER",
    title: "진행",
    desc: "법인설립부터 업종별 인허가까지 안내합니다.",
    icon: PenLine,
    href: "#register",
  },
  {
    key: "protect",
    label: "PROTECT",
    title: "보호",
    desc: "만료·분쟁·사기 위험을 미리 점검합니다.",
    icon: Lock,
    href: "#protect",
  },
] as const;

function ExampleChips({ onSelect }: { onSelect: (chip: string) => void }) {
  return (
    <div className="mt-5">
      <p className="text-center text-[11px] font-medium text-slate-400">추천 질문</p>
      <div className="mt-2.5 flex flex-wrap justify-center gap-2">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
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
    const el = document.getElementById("hero-query-input");
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-10 text-center sm:px-6 sm:pb-14 sm:pt-16">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.5rem] sm:leading-[1.15]">
            베트남에서 돈 쓰기 전에,
            <br />
            먼저 직접 확인하세요.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
            비용 · 절차 · 필요서류 · 받은 견적까지 확인할 수 있습니다.
            <span className="mt-2 block">
              질문 하나로 정부 공식 비용과 시장 범위,
              <br className="hidden sm:block" />
              견적 적정성을 한 번에 확인하세요.
            </span>
          </p>

          <form id="hero-query" onSubmit={handleSubmit} className="mt-8 sm:mt-10">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-900">
                  행정·법률 확인기
                </span>
              </div>
              <label htmlFor="hero-query-input" className="sr-only">
                질문 입력
              </label>

              <div
                className={`mt-4 flex flex-col gap-3 sm:flex-row sm:items-center ${
                  showError ? "rounded-2xl ring-2 ring-red-300" : ""
                }`}
              >
                <div
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border bg-slate-50/80 px-4 py-3.5 transition-colors ${
                    isFocused ? "border-blue-300 bg-white" : "border-slate-200"
                  }`}
                >
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    id="hero-query-input"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (e.target.value.trim()) setShowError(false);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={INPUT_PLACEHOLDER}
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-base"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-950 sm:min-w-[108px]"
                >
                  확인
                  <ArrowRight size={16} />
                </button>
              </div>

              {showError ? (
                <p className="mt-2 text-xs font-medium text-red-500">
                  질문을 입력한 뒤 확인 버튼을 눌러주세요.
                </p>
              ) : (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  서류·절차·비용·견적을 한 번에 입력하면 AI가 계산·검증합니다.
                </p>
              )}

              <ExampleChips onSelect={handleChipSelect} />
            </div>
          </form>
        </div>
      </section>

      <section id="protect" className="border-t border-slate-100 bg-slate-50/40">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
          <p className="text-center text-sm font-semibold text-slate-700 sm:text-base">
            판단은 본인이 합니다. 우리는 확인할 근거를 제공합니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {ENGINE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <a
                  key={pillar.key}
                  href={pillar.href}
                  className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-left transition-colors hover:border-blue-100 hover:bg-blue-50/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-900 shadow-sm ring-1 ring-slate-100">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <p className="mt-4 text-[10px] font-bold tracking-[0.18em] text-blue-900">
                    {pillar.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{pillar.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{pillar.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 sm:px-6 sm:pb-12">
          <div className="flex items-center gap-3 pt-8 sm:pt-10">
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
