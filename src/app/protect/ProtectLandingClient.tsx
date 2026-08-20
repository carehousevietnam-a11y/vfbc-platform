"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bell, FolderLock, MessageCircle, Clock3 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const PROTECT_FEATURES = [
  {
    key: "timeline",
    icon: Clock3,
    title: "진행 타임라인",
    desc: "신청 처리 내역을 시간순으로 확인합니다",
    href: "/mypage#timeline",
  },
  {
    key: "wallet",
    icon: FolderLock,
    title: "서류 지갑",
    desc: "업로드한 서류와 만료일을 한곳에서 관리합니다",
    href: "/mypage#wallet",
  },
  {
    key: "notifications",
    icon: Bell,
    title: "알림 센터",
    desc: "신청 관련 주요 안내를 확인합니다",
    href: "/mypage#notifications",
  },
  {
    key: "chat",
    icon: MessageCircle,
    title: "담당자와 상담",
    desc: "진행 상황에 대해 AI와 담당자에게 바로 문의합니다",
    href: "/mypage/chat",
  },
] as const;

export default function ProtectLandingClient() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-slate-200/80 bg-[#faf8f5]">
        <div className="mx-auto flex h-12 w-full max-w-[1040px] items-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            <ArrowLeft size={14} aria-hidden />
            {t("check.backHome")}
          </Link>
        </div>
      </header>

      <section className="bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
          <div className="max-w-[720px]">
            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-blue-900">PROTECT</p>
            <h1 className="break-keep text-[1.875rem] font-bold leading-[1.28] tracking-tight text-blue-900 sm:text-[2.125rem] lg:text-[2.35rem]">
              {t("pillar.protect.subtitle")}
            </h1>
            <p className="mt-3.5 max-w-[36rem] break-keep text-[15px] leading-relaxed text-slate-600 sm:text-base">
              {t("pillar.protect.body")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
          <p className="break-keep text-[15px] font-medium leading-relaxed text-blue-900">
            보호할 수 있는 것
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROTECT_FEATURES.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:p-5"
                >
                  <ItemIcon className="text-blue-900" size={22} strokeWidth={1.75} aria-hidden />
                  <p className="mt-3 text-[14px] font-bold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
          <Link
            href="/mypage"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-900 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#152a63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            마이페이지 바로가기
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
