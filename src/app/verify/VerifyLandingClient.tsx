"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Building2, FileQuestion, FileText, Receipt, Scale } from "lucide-react";
import { getVerifyServiceItems } from "@/components/home/HomeServiceAccordion";
import {
  ENGINE_SECTION_ICON,
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

const VERIFY_CHIPS = [
  { chip: "받은 견적 확인", key: "hero.chip.quote" },
  { chip: "임대계약서 검토", key: "hero.chip.contract" },
] as const;

const VERIFY_CHECKLIST_ITEMS = [
  "verify.checklist.legalRisk",
  "verify.checklist.contractValidity",
  "verify.checklist.marketRange",
  "verify.checklist.missingDocs",
  "verify.checklist.expertReview",
  "verify.checklist.source",
] as const;

const VERIFY_HOOKS: Record<string, string> = {
  admin: "서명 전 필수 확인",
  "real-estate": "보증금 미반환 주의",
  fraud: "투자사기 사전탐지",
  tax: "계좌동결 위험",
  unclear: "기한 놓치면 위험",
};

const VERIFY_SERVICE_VISUAL: Record<string, EngineServiceVisual> = {
  admin: { icon: FileText, bg: "bg-blue-50", text: "text-blue-900", accent: "border-t-blue-700" },
  "real-estate": { icon: Building2, bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-t-emerald-600" },
  fraud: { icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600", accent: "border-t-red-600" },
  tax: { icon: Receipt, bg: "bg-amber-50", text: "text-amber-700", accent: "border-t-amber-600" },
  unclear: { icon: FileQuestion, bg: "bg-violet-50", text: "text-violet-700", accent: "border-t-violet-600" },
};

export default function VerifyLandingClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const services = getVerifyServiceItems();

  function focusInput() {
    const el = document.getElementById("verify-query-input");
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
    const translated = t(`verify.service.${key}.${field}`);
    return translated === `verify.service.${key}.${field}` ? fallback : translated;
  }

  return (
    <EngineLandingMain>
      <EngineTopSection>
        <EngineBreadcrumb engine="VERIFY" />
        <EngineHero
          engine="VERIFY"
          title={t("pillar.verify.subtitle")}
          description={t("pillar.verify.body")}
          deco={<Scale strokeWidth={1.75} className={ENGINE_SECTION_ICON} />}
        />
        <EngineComposer
          formId="verify-query"
          inputId="verify-query-input"
          query={query}
          isFocused={isFocused}
          showError={showError}
          chips={VERIFY_CHIPS}
          title="무엇을 검토하고 싶으세요?"
          emphasis="무료로 직접 검토하세요"
          placeholder="예) 이 임대계약서가 안전한지 검토해 주세요."
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

      <EngineServiceSection engine="VERIFY" lead={t("verify.selectLead")}>
        {services.map((item) => (
          <EngineServiceCard
            key={item.key}
            href={item.href}
            title={serviceLabel(item.key, "title", item.title)}
            desc={serviceLabel(item.key, "desc", item.desc)}
            cta={t("pillar.verify.cta")}
            hook={VERIFY_HOOKS[item.key]}
            visual={VERIFY_SERVICE_VISUAL[item.key]}
          />
        ))}
      </EngineServiceSection>

      <EngineChecklistSection lead={t("verify.checklistLead")} items={VERIFY_CHECKLIST_ITEMS} />
      <EngineDisclaimerSection />
    </EngineLandingMain>
  );
}
