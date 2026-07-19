"use client";

// src/app/mypage/page.tsx
//
// 고객용 My Page 1차 버전.
// 로그인 방식은 새로 만들지 않는다 — /r 결과확인 페이지에서 이미 자동으로
// 생기는 Supabase Auth 세션(auto-login/route.ts, magiclink 방식)을 그대로
// 사용한다. 이 페이지에 처음 들어왔을 때 세션이 없으면, 새 로그인 화면을
// 만드는 대신 기존에 받은 결과확인 링크로 안내한다.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  Paperclip,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CategoryKey = "check" | "verify" | "register" | "consultation" | "unclassified";

const CATEGORY_BADGE: Record<CategoryKey, { label: string; className: string }> = {
  check: { label: "CHECK", className: "bg-blue-50 text-blue-700" },
  verify: { label: "VERIFY", className: "bg-gray-100 text-gray-600" },
  register: { label: "REGISTER", className: "bg-amber-50 text-amber-700" },
  consultation: { label: "상담", className: "bg-teal-50 text-teal-700" },
  unclassified: { label: "안내", className: "bg-gray-100 text-gray-500" },
};

const RESULT_LABELS: Record<string, { label: string; className: string }> = {
  possible: { label: "가능", className: "text-emerald-700" },
  conditional: { label: "조건부 가능", className: "text-amber-700" },
  impossible: { label: "어려움", className: "text-red-700" },
};

type MyPageItem = {
  id: string;
  category: CategoryKey;
  serviceLabel: string;
  result: string | null;
  feasibilityScore: number | null;
  status: string;
  hasExpertReview: boolean;
  hasAgency: boolean;
  hasAttachment: boolean;
  createdAt: string;
};

type LoadState = "checking" | "signed-out" | "loading" | "ready" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadCard({ item }: { item: MyPageItem }) {
  const [expanded, setExpanded] = useState(false);
  const badge = CATEGORY_BADGE[item.category];
  const resultInfo = item.result ? RESULT_LABELS[item.result] ?? null : null;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>
          {badge.label}
        </span>
        <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
      </div>

      <p className="mt-3 text-base font-bold text-gray-900">{item.serviceLabel}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
          <Clock size={12} /> {item.status}
        </span>
        {resultInfo && (
          <span className={`inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold ${resultInfo.className}`}>
            결과 {resultInfo.label}
          </span>
        )}
        {typeof item.feasibilityScore === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
            <FileCheck2 size={12} /> 자가진단 {item.feasibilityScore}%
          </span>
        )}
        {item.hasAttachment && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
            <Paperclip size={12} /> 첨부서류
          </span>
        )}
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline"
      >
        상세 내역 보기 {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">전문가 검토 요청</span>
            <span className="font-medium text-gray-800">{item.hasExpertReview ? "요청함" : "요청 전"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">대행 신청</span>
            <span className="font-medium text-gray-800">{item.hasAgency ? "신청 완료" : "미신청"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">접수일</span>
            <span className="font-medium text-gray-800">{formatDate(item.createdAt)}</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">
            정확한 진행 상황과 세부 사유는 담당자가 확인 후 카카오톡 또는
            잘로(Zalo)로 안내드립니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyPage() {
  const [state, setState] = useState<LoadState>("checking");
  const [name, setName] = useState<string | null>(null);
  const [items, setItems] = useState<MyPageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setState("signed-out");
        return;
      }

      setState("loading");
      try {
        const res = await fetch("/api/mypage-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            setState("signed-out");
            return;
          }
          setErrorMessage(data?.error ?? "정보를 불러오지 못했습니다.");
          setState("error");
          return;
        }

        setName(data.name ?? null);
        setItems(data.items ?? []);
        setState("ready");
      } catch (err) {
        console.error("mypage fetch failed:", err);
        setErrorMessage("서버와 통신 중 문제가 발생했습니다.");
        setState("error");
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBCAI · 마이페이지
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          {name ? `${name}님의 신청 내역` : "내 신청 내역"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          지금까지 접수하신 서비스와 진행 상태를 확인하실 수 있습니다.
        </p>

        {state === "checking" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">확인 중...</p>
          </div>
        )}

        {state === "loading" && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-gray-500">신청 내역을 불러오는 중...</p>
          </div>
        )}

        {state === "signed-out" && (
          <div className="mt-8 rounded-3xl bg-white border border-amber-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-lg font-bold text-gray-900">로그인이 필요합니다</p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              이전에 서비스를 신청하셨다면, 결과 안내 이메일 또는 문자로 받으신
              &quot;결과 확인&quot; 링크로 접속하시면 자동으로 로그인되어
              마이페이지를 이용하실 수 있습니다.
            </p>
            <p className="mt-3 text-xs text-gray-400 leading-relaxed">
              링크를 찾을 수 없으시면 담당자에게 문의해주세요.
            </p>
            <Link
              href="/consultation"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
            >
              <MessageSquare size={16} /> 상담 문의하기
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {state === "ready" && (
          <div className="mt-6 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <p className="text-sm text-gray-500">아직 접수하신 신청 내역이 없습니다.</p>
              </div>
            ) : (
              items.map((item) => <LeadCard key={item.id} item={item} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}
