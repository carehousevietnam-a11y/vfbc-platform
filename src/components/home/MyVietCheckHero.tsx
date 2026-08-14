"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  Coins,
  Landmark,
  Receipt,
  Scale,
  Search,
  Stamp,
} from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";

const INPUT_PLACEHOLDER = "노동허가 진행 비용이 얼마인가요?";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const COMPRESSED_SECTIONS = [
  {
    key: "check",
    title: "직접 확인하기",
    subtitle: "비용·자격·등록 가능 여부",
    items: "거주증 · 노동허가 · 운전면허 · 법인설립",
    cta: "전체 확인",
    href: "#check",
    icon: Landmark,
    iconClass: "bg-blue-50 text-blue-900",
    ctaClass: "text-blue-900",
  },
  {
    key: "verify",
    title: "직접 검토하기",
    subtitle: "받은 견적·서류의 적정성",
    items: "견적 · 계약서 · 세무 · 서류",
    cta: "전체 검토",
    href: "#verify",
    icon: Scale,
    iconClass: "bg-gray-100 text-gray-800",
    ctaClass: "text-gray-800",
  },
  {
    key: "register",
    title: "직접 허가받기",
    subtitle: "실제 행정·법률 업무 진행",
    items: "법인설립 · 식당허가 · 공장허가",
    cta: "전체 허가",
    href: "#register",
    icon: Stamp,
    iconClass: "bg-amber-50 text-amber-700",
    ctaClass: "text-amber-700",
  },
] as const;

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

        {/* Check Desk */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            {/* 상단: 질문 입력 */}
            <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Scale size={14} className="text-gray-400 shrink-0" />
                무엇이 궁금하신가요?
              </p>
              <div className="mt-2.5 flex items-center gap-2.5">
                <Search size={18} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={INPUT_PLACEHOLDER}
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* 중단: 태그 + CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gray-600">
                  <Coins size={12} className="text-gray-400" />
                  COST
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gray-600">
                  <ClipboardList size={12} className="text-gray-400" />
                  PROCEDURE
                </span>
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition-colors"
              >
                직접 확인
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 하단: 3열 디스플레이 */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
              <div className="flex flex-col items-center gap-1 px-2 py-3 text-center sm:px-3 sm:py-3.5">
                <Building2 size={15} className="text-gray-400" />
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 leading-tight">
                  정부 수수료
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2 py-3 text-center sm:px-3 sm:py-3.5">
                <BarChart3 size={15} className="text-gray-400" />
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 leading-tight">
                  시장 범위
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2 py-3 text-center sm:px-3 sm:py-3.5">
                <Receipt size={15} className="text-gray-400" />
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 leading-tight">
                  받은 견적
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] sm:text-xs text-gray-400 leading-relaxed">
            비용 · 절차 · 필요서류 · 내가 받은 견적까지 확인할 수 있습니다.
          </p>
        </form>

        {/* 예시 질문 칩 */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuery(chip)}
              className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 또는 구분선 */}
        <div className="mt-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* 압축 3개 섹션 */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {COMPRESSED_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.key}
                href={section.href}
                className="group flex flex-col rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${section.iconClass}`}
                  >
                    <Icon size={17} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500 leading-snug">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-gray-400 leading-snug">{section.items}</p>
                <span
                  className={`mt-3 inline-flex items-center gap-1 text-[11px] font-semibold ${section.ctaClass} group-hover:gap-1.5 transition-all`}
                >
                  {section.cta}
                  <ArrowRight size={12} />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
