"use client";

import Link from "next/link";
import { MessageCircle, Headphones } from "lucide-react";

export default function AdministrativeAISection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10 space-y-4">
      {/* AI 상담 배너 (무료 진입) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gray-50 px-7 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 shadow-sm">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              무엇이 문제인지 모르겠다면 AI에게 먼저 물어보세요
            </p>
            <p className="mt-0.5 text-xs text-gray-500">24시간 AI 상담사가 답변합니다</p>
          </div>
        </div>
        <Link
          href="/ai"
          className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-gray-900 shadow-sm hover:shadow transition-shadow whitespace-nowrap"
        >
          AI 상담 시작하기
        </Link>
      </div>

      {/* 전문가 상담 배너 (유료 전환) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-blue-900 px-7 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Headphones size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">정확한 해결이 필요하다면 전문가와 상담하세요</p>
            <p className="mt-0.5 text-xs text-blue-200">VFBC 전문 상담사가 맞춤 솔루션을 제공합니다</p>
          </div>
        </div>
        <Link
          href="/consultation"
          className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-blue-900 shadow-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
        >
          전문가 상담 신청
        </Link>
      </div>
    </section>
  );
}
