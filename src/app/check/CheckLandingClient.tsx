"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Car, ClipboardCheck, CreditCard, Home, Info, ListChecks, ShieldCheck } from "lucide-react";
import { getCheckServiceItems } from "@/components/home/HomeServiceAccordion";
import {
  EngineBreadcrumb,
  EngineChecklistSection,
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

const CHECK_CHIPS = [
  { chip: "노동허가 비용", key: "hero.chip.wp" },
  { chip: "거주증 비용", key: "hero.chip.trc" },
] as const;

const CHECKLIST_ITEMS = [
  "check.checklist.eligibility",
  "check.checklist.officialFee",
  "check.checklist.documents",
  "check.checklist.duration",
  "check.checklist.process",
  "check.checklist.source",
] as const;

const CHECK_HOOKS: Record<string, string> = {
  trc: "만료 시 벌금 위험",
  wp: "무허가 근무 적발 위험",
  tamtru: "12시간 이내 신고 필요",
  license: "국제면허 미인정 사례 있음",
};

const CHECK_SECTION_ICON = "h-[22px] w-[22px] text-blue-900/70 lg:h-8 lg:w-8";

const CHECK_SERVICE_VISUAL: Record<string, EngineServiceVisual> = {
  trc: { icon: CreditCard, bg: "bg-blue-50", text: "text-blue-900", accent: "border-t-blue-700" },
  wp: { icon: Briefcase, bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-t-emerald-600" },
  tamtru: { icon: Home, bg: "bg-violet-50", text: "text-violet-700", accent: "border-t-violet-600" },
  license: { icon: Car, bg: "bg-amber-50", text: "text-amber-700", accent: "border-t-amber-600" },
};

export default function CheckLandingClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const services = getCheckServiceItems();

  function focusInput() {
    const el = document.getElementById("check-query-input");
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

  function serviceLabel(key: string, field: "title" | "desc", fallback: string) {
    const translated = t(`check.service.${key}.${field}`);
    return translated === `check.service.${key}.${field}` ? fallback : translated;
  }

  return (
    <EngineLandingMain>
      <EngineTopSection>
        <EngineBreadcrumb engine="CHECK" />
        <EngineHero
          engine="CHECK"
          title={t("pillar.check.subtitle")}
          description={t("pillar.check.body")}
          deco={<ShieldCheck strokeWidth={1.75} className={CHECK_SECTION_ICON} />}
        />
        <EngineComposer
          formId="check-query"
          inputId="check-query-input"
          query={query}
          isFocused={isFocused}
          showError={showError}
          chips={CHECK_CHIPS}
          title="무엇을 확인하고 싶으세요?"
          emphasis="무료로 직접 확인하세요"
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
        engine="CHECK"
        lead={t("check.selectLead")}
        deco={<ClipboardCheck strokeWidth={1.75} className={CHECK_SECTION_ICON} />}
      >
        {services.map((item) => (
          <EngineServiceCard
            key={item.key}
            href={item.href}
            title={serviceLabel(item.key, "title", item.title)}
            desc={serviceLabel(item.key, "desc", item.desc)}
            cta={t("pillar.check.cta")}
            hook={CHECK_HOOKS[item.key]}
            visual={CHECK_SERVICE_VISUAL[item.key]}
          />
        ))}
      </EngineServiceSection>

      <EngineChecklistSection
        lead={t("check.checklistLead")}
        items={CHECKLIST_ITEMS}
        deco={<ListChecks strokeWidth={1.75} className={CHECK_SECTION_ICON} />}
      />
      <EngineDisclaimerSection deco={<Info strokeWidth={1.75} className={CHECK_SECTION_ICON} />} />
    </EngineLandingMain>
  );
}
