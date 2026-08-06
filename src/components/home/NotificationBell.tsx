"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

// [STEP20-1] 알림 벨 아이콘 — UI 전용 컴포넌트.
// 실제 알림 API가 아직 없으므로 unreadCount는 호출부(SiteHeader)에서
// Mock 값(0)을 그대로 넘겨준다. 이 컴포넌트 자체는 count를 어디서
// 가져오는지 전혀 모르므로, 나중에 실제 API 연동으로 교체할 때도
// 이 파일은 손댈 필요가 없다(호출부의 값만 바뀌면 됨).
export default function NotificationBell({
  unreadCount = 0,
  href = "/mypage#notifications",
}: {
  unreadCount?: number;
  href?: string;
}) {
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      className="relative flex h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold text-gray-600 transition hover:bg-gray-100"
      aria-label={hasUnread ? `알림 (읽지 않음 ${unreadCount}건)` : "알림"}
    >
      <span className="relative">
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">알림</span>
    </Link>
  );
}
