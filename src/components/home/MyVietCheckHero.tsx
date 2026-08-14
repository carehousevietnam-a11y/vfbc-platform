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
  MessageSquareText,
  Receipt,
  Scale,
  Search,
} from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import HomeServiceAccordion from "@/components/home/HomeServiceAccordion";

const INPUT_PLACEHOLDER = "노동허가 진행 비용이 얼마인가요?";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const CALC_DISPLAY = [
  { icon: Building2, label: "정부 수수료", hint: "공식 기준" },
  { icon: BarChart3, label: "시장 범위", hint: "참고 구간" },
  { icon: Receipt, label: "받은 견적", hint: "적정성 검토" },
] as const;

export default function MyVietCheckHero() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const { href } = routeByKeywords(trimmed);
    router.push(href);
  }

  return (
    <section className="bg-white">
      <div className="h-[3px] bg-blue-900" />

      <div className="mx-auto max-w-2xl px-6 pt-10 pb-12 sm:pt-14 sm:pb-14">
        {/* Hook */}
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-900">
            MY VIET CHECK
            <span className="font-normal text-gray-400"> · by VFBCAI</span>
          </p>

          <h1 className="mt-5 text-2xl sm:text-[1.75rem] font-bold tracking-tight text-gray-900 leading-snug">
            베트남에서 돈 쓰기 전에,
            <br />
            먼저 직접 확인하세요.
          </h1>

          <p className="mt-4 text-sm sm:text-[15px] text-gray-600 leading-relaxed max-w-lg mx-auto">
            행정·법률·인허가 비용과 절차를 직접 확인하고 판단할 수 있습니다.
          </p>
        </div>

        {/* Check Desk — 질문 입력 + 비용 계산기 */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
            {/* 헤더: 듀얼 아이덴티티 */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-900 shadow-sm ring-1 ring-blue-900/10">
                  <MessageSquareText size={12} />
                  질문 입력
                </span>
                <span className="text-[10px] font-medium text-slate-300">+</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <Calculator size={12} />
                  비용 계산
                </span>
              </div>
              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">CHECK DESK</p>
            </div>

            {/* 입력 영역 — 명확한 필드 박스 */}
            <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
              <label
                htmlFor="check-desk-query"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
              >
                <Scale size={14} className="shrink-0 text-blue-900" />
                무엇이 궁금하신가요?
              </label>

              <div
                className={`mt-3 rounded-xl border-2 bg-white transition-all duration-150 ${
                  isFocused
                    ? "border-blue-900 shadow-[0_0_0_4px_rgba(30,58,138,0.08)]"
                    : "border-slate-200 shadow-inner"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5 sm:py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
                    <Search size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-900/70">
                      여기에 입력하세요
                    </p>
                    <input
                      id="check-desk-query"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={INPUT_PLACEHOLDER}
                      className="mt-0.5 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[15px]"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                비용·절차·견적 등 궁금한 내용을 입력하면 AI가 바로 계산·확인해 드립니다.
              </p>
            </div>

            {/* 중단: 태그 + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
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
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-950 sm:text-[13px]"
              >
                직접 확인
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 하단: 계산기 디스플레이 */}
            <div className="bg-slate-900 px-3 py-3 sm:px-4 sm:py-3.5">
              <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                확인 결과 미리보기
              </p>
              <div className="grid grid-cols-3 divide-x divide-slate-700/80 rounded-lg bg-slate-800/60 ring-1 ring-slate-700/50">
                {CALC_DISPLAY.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center gap-1 px-2 py-3 text-center sm:px-3 sm:py-3.5"
                    >
                      <Icon size={15} className="text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-200 sm:text-[11px]">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-slate-500">{item.hint}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] sm:text-xs text-gray-400 leading-relaxed">
            비용 · 절차 · 필요서류 · 내가 받은 견적까지 확인할 수 있습니다.
          </p>
        </form>

        {/* 예시 질문 칩 */}
        <div className="mt-4">
          <p className="mb-2 text-center text-[10px] font-medium text-slate-400">예시 질문</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  document.getElementById("check-desk-query")?.focus();
                }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 shadow-sm transition-colors hover:border-blue-900/30 hover:bg-blue-50/50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* 또는 구분선 */}
        <div className="mt-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <HomeServiceAccordion />
      </div>
    </section>
  );
}
