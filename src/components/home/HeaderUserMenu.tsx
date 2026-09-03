"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  ChevronDown,
  LayoutDashboard,
  FileCheck2,
  MessageSquare,
  Bell,
  LogOut,
} from "lucide-react";

// [STEP20-2~4] 로그인 전/후 헤더 우측 사용자 영역.
// - 로그인 전: "로그인" 버튼 → 호출부(SiteHeader)가 전달하는 loginHref
//   (예: /login?next=/mypage/chat?leadId=xxxx)로 이동한다. STEP20-4부터는
//   "/login" 고정 문자열을 여기서 직접 쓰지 않고, 현재 페이지로 복귀할 수
//   있도록 SiteHeader가 계산한 값을 그대로 전달받는다.
// - 로그인 후: 이름 + 드롭다운(마이페이지/신청현황/메시지/알림/로그아웃).
//   메뉴 디자인은 기존 src/app/mypage/page.tsx의 TopHeader/DesktopSidebar
//   톤(rounded-xl, 아이콘+라벨 조합)을 그대로 따른다.
//   "메시지" 링크는 leadId를 하드코딩하지 않고, 호출부(SiteHeader)가
//   src/app/mypage/page.tsx와 동일한 방식(첫 번째 신청 건 id)으로 계산한
//   messageHref를 그대로 전달받아 사용한다.
export default function HeaderUserMenu({
  isSignedIn,
  name,
  messageHref,
  loginHref,
  onSignOut,
  compactPc = false,
  align = "right",
}: {
  isSignedIn: boolean;
  name: string | null;
  messageHref: string;
  loginHref: string;
  onSignOut: () => void;
  compactPc?: boolean;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isSignedIn) {
    return (
      <Link
        href={loginHref}
        className={`flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3.5 text-[12px] font-semibold text-gray-700 transition hover:bg-gray-100${compactPc ? " lg:h-9 lg:px-3 lg:text-[11px]" : ""}`}
      >
        <User size={16} />
        <span className="hidden sm:inline">로그인</span>
      </Link>
    );
  }

  const displayName = name ?? "고객";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold text-gray-700 transition hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-white">
          <User size={15} />
        </span>
        <span className="hidden sm:inline">{displayName}님</span>
        <ChevronDown size={14} className="hidden text-gray-400 sm:block" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-12 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="border-b border-gray-100 px-3.5 py-2.5">
            <p className="text-[13px] font-bold text-gray-900">{displayName}님</p>
          </div>

          <Link
            href="/mypage"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 transition hover:bg-gray-50"
          >
            <LayoutDashboard size={15} className="text-gray-400" />
            마이페이지
          </Link>
          <Link
            href="/mypage#applications"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 transition hover:bg-gray-50"
          >
            <FileCheck2 size={15} className="text-gray-400" />
            신청현황
          </Link>
          <Link
            href={messageHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 transition hover:bg-gray-50"
          >
            <MessageSquare size={15} className="text-gray-400" />
            메시지
          </Link>
          <Link
            href="/mypage#notifications"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 transition hover:bg-gray-50"
          >
            <Bell size={15} className="text-gray-400" />
            알림
          </Link>

          <div className="mt-1 border-t border-gray-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={15} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
