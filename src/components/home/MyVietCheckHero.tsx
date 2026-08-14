"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routeByKeywords } from "@/lib/smartRouter";

const PLACEHOLDER_EXAMPLES = [
  "노동허가 비용이 얼마인가요?",
  "거주증 발급 수수료가 적정한가요?",
  "법인설립 대행 견적을 검토해주세요",
  "땀주 등록 절차가 궁금합니다",
  "베트남에서 직원을 해고할 수 있나요?",
];

export default function MyVietCheckHero() {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

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

      <div className="mx-auto max-w-xl px-6 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-900">
          MY VIET CHECK
        </p>
        <p className="mt-1 text-[11px] text-gray-400">by VFBCAI</p>

        <h1 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          내가 직접 확인합니다.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-700">
          베트남에서 무엇이 궁금한가요?
        </p>

        <form onSubmit={handleSubmit} className="mt-5 mx-auto max-w-lg">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg bg-blue-900 py-3.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
          >
            확인하기
          </button>
        </form>

        <p className="mt-6 text-[11px] sm:text-xs leading-relaxed text-gray-400 max-w-md mx-auto">
          공식정보 · 법령 · 공공자료 · 확인 가능한 시장정보
          <br />
          출처와 기준일을 함께 제공합니다.
        </p>
      </div>
    </section>
  );
}
