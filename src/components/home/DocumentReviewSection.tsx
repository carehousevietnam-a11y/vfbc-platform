"use client";

import Link from "next/link";
import {
  FileText,
  Building2,
  AlertTriangle,
  Receipt,
  FileQuestion,
  LucideIcon,
} from "lucide-react";

type DocItem = {
  key: string;
  title: string;
  hook: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  danger?: boolean;
};

const DOC_ITEMS: DocItem[] = [
  {
    key: "admin",
    title: "행정문서 리뷰",
    hook: "서명 전 필수 확인",
    desc: "출입국·노동·세무 공문서",
    icon: FileText,
    href: "/verify/admin",
  },
  {
    key: "real-estate",
    title: "부동산 문서 리뷰",
    hook: "보증금 미반환 주의",
    desc: "임대·매매 계약서",
    icon: Building2,
    href: "/verify/real-estate",
  },
  {
    key: "fraud",
    title: "사기문서 리뷰",
    hook: "투자사기 사전탐지",
    desc: "투자·거래 사기 의심 문서",
    icon: AlertTriangle,
    href: "/verify/fraud",
    danger: true,
  },
  {
    key: "tax",
    title: "세무문서 리뷰",
    hook: "계좌동결 위험",
    desc: "세금 고지서·신고서",
    icon: Receipt,
    href: "/verify/tax",
  },
  {
    key: "unclear",
    title: "불확실한 서류 검토",
    hook: "기한 놓치면 위험",
    desc: "어떤 서류인지 모를 때",
    icon: FileQuestion,
    href: "/verify/unclear",
  },
];

export default function DocumentReviewSection() {
  return (
    <section id="verify" className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            직접검토하기
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">베트남 법률전문 AI</span>
            {" "}— 가지고 있는 서류, 정말 사용 가능한 서류입니까?
          </p>
        </div>
        <Link
          href="/verify"
          className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
        >
          모든 항목 →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {DOC_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex flex-col items-center rounded-2xl bg-white border border-gray-100 px-4 py-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  item.danger ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.hook}
              </span>
              <Icon
                className={`mt-3 ${item.danger ? "text-red-600" : "text-gray-900"}`}
                size={22}
                strokeWidth={1.75}
              />
              <p className="mt-2 text-[13px] font-bold text-gray-900 leading-snug">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-gray-500 leading-snug">
                {item.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
