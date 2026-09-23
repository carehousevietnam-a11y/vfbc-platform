"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ENGINE_CONTAINER } from "@/components/engine/EngineLandingChrome";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  getCheckServiceItems,
  getRegisterServiceItems,
  getVerifyServiceItems,
} from "@/components/home/HomeServiceAccordion";
import LanguageMenu from "./LanguageMenu";
import NotificationBell from "./NotificationBell";
import HeaderUserMenu from "./HeaderUserMenu";
import {
  selectionHeaderEngineClasses,
  selectionHeaderServiceClasses,
  selectionNavLinkClasses,
} from "@/components/ui/selectionInteraction";
import { cn } from "@/lib/cn";

const DEFAULT_MESSAGE_HREF = "/mypage/chat";
const DEFAULT_LOGIN_HREF = "/login";

const HOME_NAV_ITEMS = [
  { href: "/check", label: "CHECK", subKey: "nav.check" as const, engine: "check" as const },
  { href: "/verify", label: "VERIFY", subKey: "nav.verify" as const, engine: "verify" as const },
  { href: "/register", label: "REGISTER", subKey: "nav.register" as const, engine: "register" as const },
  { href: "/protect", label: "PROTECT", subKey: "nav.protect" as const, engine: "protect" as const },
] as const;

/** ProtectLandingClient에 정의된 실제 PROTECT 항목 */
const PROTECT_SERVICE_ITEMS = [
  { title: "진행 타임라인", href: "/mypage#timeline" },
  { title: "서류 지갑", href: "/mypage#wallet" },
  { title: "알림 센터", href: "/mypage#notifications" },
  { title: "담당자와 상담", href: "/mypage/chat" },
] as const;

type EngineKey = "check" | "verify" | "register" | "protect";

/** PC(sm+) 헤더 스케일 — Mobile 기본값은 변경하지 않음 */
const HEADER_PC_SHELL = "sm:pt-3 sm:pb-2";
const HEADER_PC_ROW =
  "sm:min-h-[42px] sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2";
const HEADER_PC_BRAND_LINK = "sm:shrink-0 sm:justify-self-start sm:gap-2";
const HEADER_PC_SHIELD_BOX = "sm:h-8 sm:w-8 sm:rounded-lg";
const HEADER_PC_SHIELD_ICON = "sm:h-4 sm:w-4";
const HEADER_PC_BRAND_TITLE =
  "sm:whitespace-nowrap sm:text-[14px] sm:font-bold sm:tracking-tight sm:text-[#0B2A6B]";
const HEADER_PC_BRAND_SUB = "sm:whitespace-nowrap sm:text-[10px] sm:font-medium sm:text-slate-500";
const HEADER_PC_GNB_NAV = "sm:col-start-2 sm:justify-self-center sm:flex-none";
const HEADER_PC_GNB_GAP = "sm:gap-4";
const HEADER_PC_GNB_BTN = "sm:px-2 sm:py-0.5";
const HEADER_PC_GNB_EN = "sm:text-[12px] sm:font-medium sm:tracking-[0.1em]";
const HEADER_PC_GNB_KO = "sm:text-[10px] sm:font-medium sm:text-slate-600";

function resolveActiveEngine(pathname: string): EngineKey | null {
  if (pathname === "/check" || pathname.startsWith("/check/")) return "check";
  if (pathname === "/verify" || pathname.startsWith("/verify/")) return "verify";
  if (pathname === "/register" || pathname.startsWith("/register/")) return "register";
  if (pathname === "/protect" || pathname.startsWith("/protect/")) return "protect";
  return null;
}

function isServiceActive(pathname: string, href: string): boolean {
  const pathOnly = href.split("#")[0] || href;
  if (pathname === pathOnly) return true;
  if (pathOnly !== "/" && pathname.startsWith(`${pathOnly}/`)) return true;
  return false;
}

/** 모바일 상단 2단 네비 — VERIFY 불확실 항목만 짧은 라벨 */
function level2NavLabel(title: string, href: string) {
  if (href === "/verify/unclear") {
    return (
      <>
        <span className="whitespace-nowrap sm:hidden">불확실 문서</span>
        <span className="hidden sm:inline">{title}</span>
      </>
    );
  }
  return title;
}

export default function SiteHeader() {
  const { t } = useLocale();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [messageHref, setMessageHref] = useState(DEFAULT_MESSAGE_HREF);
  const [loginHref, setLoginHref] = useState(DEFAULT_LOGIN_HREF);
  const [mobileOpen, setMobileOpen] = useState(false);
  /** 엔진 퍼널: 1단계 클릭 시에만 2단계 목록 펼침 (진입 시 기본 닫힘) */
  const [expandedEngine, setExpandedEngine] = useState<EngineKey | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const isAiPage = pathname === "/ai";
  const isCostCheckPage = pathname === "/cost-check" || pathname.startsWith("/cost-check/");
  const activeEngine = resolveActiveEngine(pathname);
  const isEngineNavPage = activeEngine != null;
  const useHomeStyleHeader = isHome || isAiPage || isCostCheckPage || isEngineNavPage;
  const diagnoseHref = isAiPage || isCostCheckPage || isEngineNavPage ? "/check" : "#hero-query";
  /** VERIFY 등 엔진 퍼널: 게스트형 2단 네비 (개인화 메뉴·햄버거 없음) */
  const useTwoLevelEngineNav = isEngineNavPage;

  const level2Items = useMemo(() => {
    if (expandedEngine === "check") {
      return getCheckServiceItems().map((item) => ({ title: item.title, href: item.href }));
    }
    if (expandedEngine === "verify") {
      return getVerifyServiceItems().map((item) => ({ title: item.title, href: item.href }));
    }
    if (expandedEngine === "register") {
      return getRegisterServiceItems().map((item) => ({ title: item.title, href: item.href }));
    }
    if (expandedEngine === "protect") {
      return PROTECT_SERVICE_ITEMS.map((item) => ({ title: item.title, href: item.href }));
    }
    return [];
  }, [expandedEngine]);

  useEffect(() => {
    setExpandedEngine(null);
  }, [pathname]);

  function toggleEngineNav(engine: EngineKey) {
    setExpandedEngine((prev) => (prev === engine ? null : engine));
  }
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
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div
          className={`${ENGINE_CONTAINER} ${HEADER_PC_SHELL} ${
            useTwoLevelEngineNav
              ? "flex flex-col gap-0 py-1.5"
              : "flex h-[3.75rem] items-center justify-between gap-3 lg:h-14"
          }`}
        >
          {useTwoLevelEngineNav ? (
            <>
              <div className={`flex flex-col gap-1 sm:min-h-[42px] sm:flex-row sm:items-center ${HEADER_PC_ROW}`}>
                <Link
                  href="/"
                  className={`flex w-fit shrink-0 items-center gap-2 ${HEADER_PC_BRAND_LINK}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-900/[0.06] ring-1 ring-blue-900/10 sm:rounded-xl ${HEADER_PC_SHIELD_BOX}`}
                  >
                    <ShieldCheck
                      className={`h-4 w-4 shrink-0 text-blue-900 ${HEADER_PC_SHIELD_ICON}`}
                    />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="sm:hidden">
                      <p className="truncate text-[13px] font-semibold tracking-tight text-[#0B2A6B]">
                        MY VIET CHECK
                      </p>
                      <p className="truncate text-[10px] font-medium text-slate-500">by VFBCAI</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className={HEADER_PC_BRAND_TITLE}>MY VIET CHECK</p>
                      <p className={HEADER_PC_BRAND_SUB}>by VFBCAI</p>
                    </div>
                  </div>
                </Link>

                <nav
                  aria-label="엔진 이동"
                  className={`flex w-full min-w-0 items-stretch justify-center gap-0 sm:-mb-2 sm:flex-1 sm:self-stretch ${HEADER_PC_GNB_NAV} ${HEADER_PC_GNB_GAP}`}
                >
                  {HOME_NAV_ITEMS.map((item) => {
                    const isHighlighted = expandedEngine
                      ? expandedEngine === item.engine
                      : activeEngine === item.engine;
                    const isExpanded = expandedEngine === item.engine;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls="engine-level2-nav"
                        onClick={() => toggleEngineNav(item.engine)}
                        className={cn(
                          "flex min-h-[42px] min-w-0 flex-1 flex-col items-center justify-center px-0.5 py-1 text-center sm:min-h-0 sm:flex-none sm:justify-center sm:pb-2",
                          HEADER_PC_GNB_BTN,
                          selectionHeaderEngineClasses(isHighlighted),
                        )}
                      >
                        <span
                          className={cn("block text-[11px] font-medium tracking-[0.08em]", HEADER_PC_GNB_EN)}
                        >
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-[11px] font-medium leading-none text-inherit opacity-85 sm:mt-px",
                            HEADER_PC_GNB_KO,
                          )}
                        >
                          {t(item.subKey)}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                <div className="hidden sm:block" aria-hidden />
              </div>

              {expandedEngine && level2Items.length > 0 ? (
                <nav
                  id="engine-level2-nav"
                  aria-label="서비스 이동"
                  className="mt-0.5 border-t border-slate-100 pt-1 sm:mt-1.5 sm:pt-2"
                >
                  <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1 sm:gap-x-3 sm:gap-y-1.5">
                    {level2Items.map((item) => {
                      const active = isServiceActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={false}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setExpandedEngine(null)}
                          className={cn(
                            "w-auto min-w-0 shrink-0",
                            selectionHeaderServiceClasses(active),
                          )}
                        >
                          {level2NavLabel(item.title, item.href)}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`flex min-w-0 shrink-0 items-center gap-2.5 lg:gap-2 ${HEADER_PC_BRAND_LINK}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900/[0.06] ring-1 ring-blue-900/10 ${HEADER_PC_SHIELD_BOX}`}
                >
                  <ShieldCheck size={18} className={`text-blue-900 ${HEADER_PC_SHIELD_ICON}`} />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="sm:hidden">
                    <p className="truncate text-[13px] font-bold tracking-tight text-blue-900">
                      MY VIET CHECK
                    </p>
                    <p className="truncate text-[10px] font-medium text-slate-500">by VFBCAI</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className={`${HEADER_PC_BRAND_TITLE} sm:text-blue-900`}>MY VIET CHECK</p>
                    <p className={HEADER_PC_BRAND_SUB}>by VFBCAI</p>
                  </div>
                </div>
              </Link>

              <nav aria-label="엔진 이동" className={`hidden items-center lg:flex ${HEADER_PC_GNB_GAP}`}>
                {HOME_NAV_ITEMS.map((item) => {
                  const active = activeEngine === item.engine;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "shrink-0 flex flex-col text-center rounded-lg sm:px-2.5 sm:py-1.5",
                        HEADER_PC_GNB_BTN,
                        selectionNavLinkClasses(active),
                        active ? "text-blue-900" : "text-blue-900/70",
                      )}
                    >
                      <span className={cn("block text-[10px] font-medium tracking-[0.14em]", HEADER_PC_GNB_EN)}>
                        {item.label}
                      </span>
                      <span
                        className={`mt-0.5 block text-[10px] font-medium ${
                          active ? "text-slate-600" : "text-slate-500"
                        } ${HEADER_PC_GNB_KO}`}
                      >
                        {t(item.subKey)}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden items-center gap-1 sm:flex">
                  <LanguageMenu compactPc />
                  {isSignedIn && <NotificationBell unreadCount={0} />}
                  <HeaderUserMenu
                    isSignedIn={isSignedIn}
                    name={name}
                    messageHref={messageHref}
                    loginHref={loginHref}
                    onSignOut={handleSignOut}
                    compactPc
                  />
                </div>

                <Link
                  href={diagnoseHref}
                  className="hidden rounded-xl border border-blue-900/10 bg-blue-900 px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#152a63] sm:inline-flex lg:px-3 lg:py-1.5 lg:text-[11px]"
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
            </>
          )}
        </div>

        {!useTwoLevelEngineNav && mobileOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {HOME_NAV_ITEMS.map((item) => {
                const active = activeEngine === item.engine;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5",
                      selectionNavLinkClasses(active),
                    )}
                  >
                    <span className="text-[13px] font-medium text-slate-800">{item.label}</span>
                    <span className="text-[12px] text-slate-500">{t(item.subKey)}</span>
                  </Link>
                );
              })}
              <Link
                href={diagnoseHref}
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
                  align="left"
                />
              </div>
            </nav>
          </div>
        ) : null}
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
