"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LanguageMenu from "./LanguageMenu";
import NotificationBell from "./NotificationBell";
import HeaderUserMenu from "./HeaderUserMenu";

const DEFAULT_MESSAGE_HREF = "/mypage/chat";
const DEFAULT_LOGIN_HREF = "/login";

// [STEP20-1~4] 홈 화면 우측 상단 로그인/마이페이지 헤더 (UI 전용)
//
// - 로그인 상태 판단: 기존에 프로젝트 전역에서 이미 쓰고 있는
//   supabase.auth.getSession() + onAuthStateChange()를 그대로 재사용한다
//   (src/app/mypage/page.tsx, src/app/consultation/page.tsx 등과 동일 패턴).
//   새로운 로그인 시스템/신규 API는 만들지 않는다.
// - 로그인 후 표시할 이름과 "메시지" 링크(leadId)는 기존
//   /api/mypage-data(POST, accessToken)를 그대로 호출해서 가져온다 —
//   이 엔드포인트는 이미 마이페이지에서 쓰이고 있는 것과 완전히
//   동일하다(새 API 없음). messageHref는 src/app/mypage/page.tsx의
//   messageActiveId 계산과 동일한 규칙(선택된 신청 건이 없으면 첫 번째
//   신청 건 id 사용)을 그대로 따른다 — leadId를 하드코딩하지 않는다.
// - 로그아웃은 Supabase 표준 SDK 메서드(supabase.auth.signOut())를
//   호출한 뒤 "/"로 이동한다. 별도 API 라우트를 새로 만들지 않는다.
// - [STEP20-4/STEP20-5] "로그인" 버튼: next 파라미터는 로그인이 필요한
//   보호된 화면(/mypage 및 그 하위 경로)에서만 붙인다. 홈페이지("/") 등
//   그 외 페이지에서는 "/login"만 사용한다(STEP20-5에서 확정된 규칙 —
//   SiteHeader는 현재 홈페이지에서만 쓰이므로 사실상 대부분 plain
//   "/login"이 되고, 향후 이 헤더가 /mypage 계열 화면에도 쓰이게 될
//   경우를 대비해 조건을 남겨둔다). pathname은 next/navigation의
//   usePathname(), 쿼리스트링은 브라우저 표준 API인
//   window.location.search를 사용했다(useSearchParams는 페이지 정적
//   렌더링 시 Suspense 경계가 추가로 필요해, 헤더처럼 항상 렌더되는
//   공통 UI에는 더 무거운 선택이라 판단해 사용하지 않았다). 로그인
//   페이지(src/app/login/page.tsx)의 sanitizeNext()가 "/mypage" 하위
//   경로인지 다시 한 번 검증하므로, 여기서는 값을 조합만 하고 최종
//   보안 검증은 하지 않는다.
export default function SiteHeader() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [messageHref, setMessageHref] = useState(DEFAULT_MESSAGE_HREF);
  const [loginHref, setLoginHref] = useState(DEFAULT_LOGIN_HREF);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 보호된 화면(/mypage, /mypage/...)에서만 next를 붙인다. 그 외
    // 페이지(홈페이지 등)에서는 next 없이 순수 "/login"만 사용한다.
    const isProtectedPage = pathname === "/mypage" || pathname.startsWith("/mypage/");
    if (!isProtectedPage) {
      setLoginHref(DEFAULT_LOGIN_HREF);
      return;
    }

    const next = `${pathname}${window.location.search}`;
    setLoginHref(`${DEFAULT_LOGIN_HREF}?next=${encodeURIComponent(next)}`);
  }, [pathname]);

  useEffect(() => {
    let active = true;

    async function loadProfile(accessToken: string) {
      try {
        const response = await fetch("/api/mypage-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        setName(data?.name ?? null);

        // src/app/mypage/page.tsx의 messageActiveId 규칙 중 "선택된 신청
        // 건이 없을 때"에 해당하는 폴백(첫 번째 신청 건)만 그대로 재사용.
        const items = Array.isArray(data?.items) ? data.items : [];
        const firstItemId = items[0]?.id ?? null;
        setMessageHref(firstItemId ? `/mypage/chat?leadId=${firstItemId}` : DEFAULT_MESSAGE_HREF);
      } catch {
        // 헤더 이름/메시지 링크는 부가 정보이므로, 실패해도 기본값을 유지한다.
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const accessToken = data.session?.access_token;
      setIsSignedIn(Boolean(accessToken));
      if (accessToken) loadProfile(accessToken);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const accessToken = session?.access_token;
      setIsSignedIn(Boolean(accessToken));
      if (accessToken) {
        loadProfile(accessToken);
      } else {
        setName(null);
        setMessageHref(DEFAULT_MESSAGE_HREF);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    setName(null);
    setMessageHref(DEFAULT_MESSAGE_HREF);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={30} height={30} />
          <span className="text-[15px] font-extrabold tracking-tight text-blue-900">VFBCAI</span>
        </Link>

        {/* 데스크톱 우측 클러스터 */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <LanguageMenu />
          {isSignedIn && <NotificationBell unreadCount={0} />}
          <HeaderUserMenu
            isSignedIn={isSignedIn}
            name={name}
            messageHref={messageHref}
            loginHref={loginHref}
            onSignOut={handleSignOut}
          />
        </div>

        {/* 모바일: ☰ 메뉴 / 🌐 / 👤 */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
            aria-label="메뉴"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <LanguageMenu />
          <HeaderUserMenu
            isSignedIn={isSignedIn}
            name={name}
            messageHref={messageHref}
            loginHref={loginHref}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* 모바일 메뉴 패널 — 기존 페이지 앵커(#check/#verify/#register)만 재사용, 새 경로 없음 */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="#check"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              직접확인하기 (CHECK)
            </Link>
            <Link
              href="#verify"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              직접검토하기 (VERIFY)
            </Link>
            <Link
              href="#register"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              직접허가받기 (REGISTER)
            </Link>
            {isSignedIn && (
              <Link
                href="/mypage"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                마이페이지
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
