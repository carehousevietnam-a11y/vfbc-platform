"use client";

import Link from "next/link";
import { CreditCard, Briefcase, Home, Car, ArrowRight, LucideIcon } from "lucide-react";

type CheckItem = {
  key: string;
  title: string;
  hook: string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

const CHECK_ITEMS: CheckItem[] = [
  {
    key: "trc",
    title: "거주증",
    hook: "만료 시 벌금 위험",
    desc: "TRC 발급 가능 여부를 직접 확인하세요",
    icon: CreditCard,
    href: "/check/trc",
  },
  {
    key: "wp",
    title: "노동허가",
    hook: "무허가 근무 적발 위험",
    desc: "Work Permit 발급 가능 여부를 확인하세요",
    icon: Briefcase,
    href: "/check/wp",
  },
  {
    key: "tamtru",
    title: "땀주",
    hook: "12시간 이내 신고 필요",
    desc: "임시거주 등록 상태를 지금 확인하세요",
    icon: Home,
    href: "/check/tamtru",
  },
  {
    key: "license",
    title: "운전면허",
    hook: "국제면허 미인정 사례 있음",
    desc: "베트남 면허 전환 가능 여부를 확인하세요",
    icon: Car,
    href: "/check/driving-license",
  },
];

export default function CheckSection() {
  return (
    <section id="check" className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            직접확인하기
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-blue-900">베트남 행정전문 AI</span>
            {" "}— 1분 만에 가능 여부를 직접 확인하세요
          </p>
        </div>
        <Link
          href="/services"
          className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
        >
          모든 서비스 →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CHECK_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex flex-col rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="inline-block self-start rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                {item.hook}
              </span>
              <Icon className="mt-3 text-blue-900" size={24} strokeWidth={1.75} />
              <p className="mt-2 text-base font-bold tracking-tight text-gray-900">
                {item.title}
              </p>
              <p className="mt-1 text-[12px] text-gray-500 leading-snug">
                {item.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 group-hover:gap-1.5 transition-all">
                지금 확인 <ArrowRight size={12} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
