"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, PenLine, Lock, Landmark, Scale, Stamp, ArrowRight } from "lucide-react";

const ENGINE_STEPS = [
  { key: "check", label: "CHECK", desc: "가능 여부 확인", icon: Search },
  { key: "verify", label: "VERIFY", desc: "서류 문제 확인", icon: ShieldCheck },
  { key: "register", label: "REGISTER", desc: "등록 진행", icon: PenLine },
  { key: "protect", label: "PROTECT", desc: "문제 발생 전 보호", icon: Lock },
] as const;

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="bg-white">
      {/* 관공서 신뢰 마커: 상단 얇은 바 + 기관명 라벨 */}
      <div className="h-[3px] bg-blue-900" />

      <div className="mx-auto max-w-2xl px-6 pt-16 pb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBC · 베트남 외국인 비즈니스센터청
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          베트남 체류와 사업,<br />안전하게
        </h1>
        <p className="mt-4 text-base text-gray-500 leading-relaxed">
          체류부터 사업까지, VFBC가 외국인의 모든 순간을 함께합니다
        </p>

        <form onSubmit={handleSearch} className="mt-8 mx-auto flex max-w-lg gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="땀주, 노동허가, 거주증, 운전면허..."
            className="h-14 flex-1 rounded-full border border-gray-200 bg-gray-50 px-6 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10"
          />
          <button
            type="submit"
            className="h-14 w-14 shrink-0 rounded-full bg-blue-900 text-white shadow-sm hover:bg-blue-950 transition-colors flex items-center justify-center"
            aria-label="검색"
          >
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* 세 킬러 콘텐츠 브랜드 카드 */}
      <div className="mx-auto max-w-5xl px-6 pb-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {/* 킬러 1: 직접확인하기 */}
          <a
            href="#check"
            className="group rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-900 text-white">
              <Landmark size={20} />
            </div>
            <p className="mt-4 text-lg font-bold tracking-tight text-gray-900">직접확인하기</p>
            <p className="mt-0.5 text-xs font-semibold text-blue-900">베트남 행정전문 AI</p>
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              거주증·노동허가·땀주·운전면허 — 지금 놓치면 벌금이나 강제출국까지 갈 수 있습니다.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 group-hover:gap-2 transition-all">
              1분 만에 확인하기 <ArrowRight size={13} />
            </span>
          </a>

          {/* 킬러 2: 직접검토하기 */}
          <a
            href="#verify"
            className="group rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <Scale size={20} />
            </div>
            <p className="mt-4 text-lg font-bold tracking-tight text-gray-900">직접검토하기</p>
            <p className="mt-0.5 text-xs font-semibold text-gray-600">베트남 법률전문 AI</p>
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              행정·부동산·세무 문서와 의심스러운 계약서 — 서명 전에 AI가 먼저 검토해드립니다.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 group-hover:gap-2 transition-all">
              무료로 검토받기 <ArrowRight size={13} />
            </span>
          </a>

          {/* 킬러 3: 직접허가받기 */}
          <a
            href="#register"
            className="group rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-700 text-white">
              <Stamp size={20} />
            </div>
            <p className="mt-4 text-lg font-bold tracking-tight text-gray-900">직접허가받기</p>
            <p className="mt-0.5 text-xs font-semibold text-amber-700">베트남 인허가전문 AI</p>
            <p className="mt-3 text-[13px] text-gray-500 leading-relaxed">
              법인설립부터 식당·소방·위생·환경·화장품·의료기기 허가까지 한 번에 안내받으세요.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 group-hover:gap-2 transition-all">
              허가 절차 확인하기 <ArrowRight size={13} />
            </span>
          </a>
        </div>
      </div>

      {/* Engine explainer */}
      <div className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-3xl bg-gray-50 px-8 py-8">
          <p className="text-center text-sm font-semibold text-gray-900">
            CHECK → VERIFY → REGISTER → PROTECT
          </p>
          <p className="mt-1 text-center text-xs text-gray-400">
            4단계로 안전한 베트남 생활을 준비하세요
          </p>

          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {ENGINE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="text-center">
                  <Icon className="mx-auto text-gray-400" size={22} strokeWidth={1.75} />
                  <p className="mt-2 text-xs font-bold tracking-tight text-gray-900">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
