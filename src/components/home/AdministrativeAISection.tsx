"use client";

import Link from "next/link";
import { Headphones, MessageCircle } from "lucide-react";

export default function AdministrativeAISection() {
  return (
    <section className="border-t border-slate-200/70 bg-[#faf8f5]">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-2.5 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-[#faf8f5] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-900 shadow-sm ring-1 ring-slate-100">
              <MessageCircle size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-blue-900">
                무엇이 문제인지 모르겠다면 AI에게 먼저 물어보세요
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">24시간 AI 상담사가 답변합니다</p>
            </div>
          </div>
          <Link
            href="/ai"
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-blue-900 transition-colors hover:bg-blue-50"
          >
            AI 상담 시작하기
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-900/10 bg-blue-900 px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Headphones size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">
                정확한 해결이 필요하다면 전문가와 상담하세요
              </p>
              <p className="mt-0.5 text-[11px] text-blue-100">VFBCAI 전문 상담사가 맞춤 솔루션을 제공합니다</p>
            </div>
          </div>
          <Link
            href="/consultation"
            className="shrink-0 rounded-xl bg-white px-4 py-2 text-[11px] font-semibold text-blue-900 transition-colors hover:bg-blue-50"
          >
            전문가 상담 신청
          </Link>
        </div>
      </div>
    </section>
  );
}
