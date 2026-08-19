"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageMenu from "./LanguageMenu";
import NotificationBell from "./NotificationBell";
import HeaderUserMenu from "./HeaderUserMenu";

const DEFAULT_MESSAGE_HREF = "/mypage/chat";
const DEFAULT_LOGIN_HREF = "/login";

const HOME_NAV_ITEMS = [
  { href: "#check", label: "CHECK", sub: "확인" },
  { href: "#verify", label: "VERIFY", sub: "검증" },
  { href: "#register", label: "REGISTER", sub: "진행" },
  { href: "#protect", label: "PROTECT", sub: "보호" },
] as const;

const NAV_SUB_KEYS = {
  "#check": "nav.check",
  "#verify": "nav.verify",
  "#register": "nav.register",
  "#protect": "nav.protect",
} as const;

export default function SiteHeader() {
  const { t } = useLocale();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [messageHref, setMessageHref] = useState(DEFAULT_MESSAGE_HREF);
  const [loginHref, setLoginHref] = useState(DEFAULT_LOGIN_HREF);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAiPage = pathname === "/ai";
  const useHomeStyleHeader = isHome || isAiPage;

  useEffect(() => {
    if (typeof window === "undefined") return;

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

  if (useHomeStyleHeader) {
    return (
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[3.75rem] max-w-[1100px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900/[0.06] ring-1 ring-blue-900/10">
              <ShieldCheck size={18} className="text-blue-900" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-bold tracking-tight text-blue-900">
                MY VIET CHECK
              </p>
              <p className="truncate text-[10px] font-medium text-slate-500">by VFBCAI</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {HOME_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-center transition-colors hover:bg-[#faf8f5]"
              >
                <span className="block text-[10px] font-bold tracking-[0.14em] text-blue-900">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                  {t(NAV_SUB_KEYS[item.href])}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-1 sm:flex">
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

            <Link
              href={isAiPage ? "/check" : "#hero-query"}
              className="hidden rounded-xl border border-blue-900/10 bg-blue-900 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#152a63] sm:inline-flex"
            >
              {t("header.diagnose")}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label={t("header.menu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {HOME_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50"
                >
                  <span className="text-[13px] font-semibold text-slate-800">{item.label}</span>
                  <span className="text-[12px] text-slate-500">{t(NAV_SUB_KEYS[item.href])}</span>
                </Link>
              ))}
              <Link
                href={isAiPage ? "/check" : "#hero-query"}
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-xl bg-blue-900 px-3 py-2.5 text-center text-[13px] font-semibold text-white"
              >
                {t("header.diagnose")}
              </Link>
              <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
                <LanguageMenu />
                <HeaderUserMenu
                  isSignedIn={isSignedIn}
                  name={name}
                  messageHref={messageHref}
                  loginHref={loginHref}
                  onSignOut={handleSignOut}
                />
              </div>
            </nav>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/vfbcai-shield-logo.png" alt="VFBCAI" width={30} height={30} />
          <span className="text-[15px] font-extrabold tracking-tight text-blue-900">VFBCAI</span>
        </Link>

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

        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100"
            aria-label={t("header.menu")}
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

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="#check"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t("header.checkSelf")}
            </Link>
            <Link
              href="#verify"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t("header.verifySelf")}
            </Link>
            <Link
              href="#register"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t("header.registerSelf")}
            </Link>
            {isSignedIn && (
              <Link
                href="/mypage"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
              >
                {t("header.mypage")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
