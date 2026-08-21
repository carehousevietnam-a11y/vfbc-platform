"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, FolderLock, MessageCircle, Clock3 } from "lucide-react";
import {
  EngineBreadcrumb,
  EngineComposer,
  EngineDisclaimerSection,
  EngineHero,
  EngineLandingMain,
  EngineServiceCard,
  EngineServiceSection,
  EngineTopSection,
  type EngineServiceVisual,
} from "@/components/engine/EngineLandingChrome";
import { routeByKeywords } from "@/lib/smartRouter";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const PROTECT_FEATURES = [
  {
    key: "timeline",
    title: "진행 타임라인",
    desc: "신청 처리 내역을 시간순으로 확인합니다",
    href: "/mypage#timeline",
  },
  {
    key: "wallet",
    title: "서류 지갑",
    desc: "업로드한 서류와 만료일을 한곳에서 관리합니다",
    href: "/mypage#wallet",
  },
  {
    key: "notifications",
    title: "알림 센터",
    desc: "신청 관련 주요 안내를 확인합니다",
    href: "/mypage#notifications",
  },
  {
    key: "chat",
    title: "담당자와 상담",
    desc: "진행 상황에 대해 AI와 담당자에게 바로 문의합니다",
    href: "/mypage/chat",
  },
] as const;

const PROTECT_SERVICE_VISUAL: Record<string, EngineServiceVisual> = {
  timeline: { icon: Clock3, bg: "bg-blue-50", text: "text-blue-900", accent: "border-t-blue-700" },
  wallet: { icon: FolderLock, bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-t-emerald-600" },
  notifications: { icon: Bell, bg: "bg-amber-50", text: "text-amber-700", accent: "border-t-amber-600" },
  chat: { icon: MessageCircle, bg: "bg-violet-50", text: "text-violet-700", accent: "border-t-violet-600" },
};

export default function ProtectLandingClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);

  function focusInput() {
    const el = document.getElementById("protect-query-input");
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleChipSelect(chip: string) {
    setQuery(chip);
    setShowError(false);
    focusInput();
  }

  function submitQuery() {
    const trimmed = query.trim();
    if (!trimmed) {
      setShowError(true);
      focusInput();
      return;
    }
    setShowError(false);
    const { href } = routeByKeywords(trimmed);
    router.push(href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitQuery();
  }

  return (
    <EngineLandingMain>
      <EngineTopSection>
        <EngineBreadcrumb engine="PROTECT" />
        <EngineHero
          engine="PROTECT"
          title={t("pillar.protect.subtitle")}
          description={t("pillar.protect.body")}
        />
        <EngineComposer
          formId="protect-query"
          inputId="protect-query-input"
          query={query}
          isFocused={isFocused}
          showError={showError}
          chips={[]}
          onSubmit={handleSubmit}
          onQueryChange={(value) => {
            setQuery(value);
            if (value.trim()) setShowError(false);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChipSelect={handleChipSelect}
        />
      </EngineTopSection>

      <EngineServiceSection
        engine="PROTECT"
        lead="보호할 수 있는 것"
        footer={
          <Link
            href="/mypage"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#152a63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:min-h-12 sm:px-6 sm:text-[14px]"
          >
            마이페이지 바로가기
            <ArrowRight size={15} />
          </Link>
        }
      >
        {PROTECT_FEATURES.map((item) => (
          <EngineServiceCard
            key={item.key}
            href={item.href}
            title={item.title}
            desc={item.desc}
            cta={t("pillar.protect.cta")}
            visual={PROTECT_SERVICE_VISUAL[item.key]}
          />
        ))}
      </EngineServiceSection>

      <EngineDisclaimerSection />
    </EngineLandingMain>
  );
}
