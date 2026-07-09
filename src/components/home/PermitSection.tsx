"use client";

import Link from "next/link";
import {
  Building2,
  UtensilsCrossed,
  Flame,
  Droplets,
  Leaf,
  FlaskConical,
  Stethoscope,
  LucideIcon,
} from "lucide-react";

type PermitItem = {
  key: string;
  title: string;
  hook: string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

const PERMIT_ITEMS: PermitItem[] = [
  {
    key: "company",
    title: "법인설립",
    hook: "잘못 만들면 못 고침",
    desc: "IRC·ERC 포함 설립 절차",
    icon: Building2,
    href: "/register/company",
  },
  {
    key: "restaurant",
    title: "식당허가",
    hook: "무허가 영업 시 즉시 폐쇄",
    desc: "요식업 영업허가",
    icon: UtensilsCrossed,
    href: "/register/restaurant",
  },
  {
    key: "fire",
    title: "소방허가",
    hook: "미필증 시 영업정지",
    desc: "소방시설 안전 인증",
    icon: Flame,
    href: "/register/fire-safety",
  },
  {
    key: "hygiene",
    title: "위생허가",
    hook: "단속 1순위 항목",
    desc: "식품·위생 안전 인증",
    icon: Droplets,
    href: "/register/hygiene",
  },
  {
    key: "environment",
    title: "환경허가",
    hook: "누락 시 가동중단",
    desc: "환경영향평가·배출허가",
    icon: Leaf,
    href: "/register/environment",
  },
  {
    key: "cosmetics",
    title: "화장품허가",
    hook: "무허가 시 전량 회수",
    desc: "화장품 제조·유통 허가",
    icon: FlaskConical,
    href: "/register/cosmetics",
  },
  {
    key: "medical-device",
    title: "의료기기허가",
    hook: "무허가 유통은 형사처벌",
    desc: "의료기기 수입·유통 허가",
    icon: Stethoscope,
    href: "/register/medical-device",
  },
];

export default function PermitSection() {
  return (
    <section id="register" className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            직접허가받기
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-amber-700">베트남 인허가전문 AI</span>
            {" "}— 법인설립부터 업종별 허가까지 한 번에 안내받으세요
          </p>
        </div>
        <Link
          href="/register"
          className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
        >
          모든 허가 →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {PERMIT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex flex-col rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="inline-block self-start rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                {item.hook}
              </span>
              <Icon className="mt-3 text-amber-700" size={24} strokeWidth={1.75} />
              <p className="mt-2 text-base font-bold tracking-tight text-gray-900">
                {item.title}
              </p>
              <p className="mt-1 text-[12px] text-gray-500 leading-snug">
                {item.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:gap-1.5 transition-all">
                허가 절차 확인 →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
