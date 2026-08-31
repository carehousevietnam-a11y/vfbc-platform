"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Droplets,
  FilePlus,
  Flame,
  FlaskConical,
  Leaf,
  Stethoscope,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { getRegisterServiceItems } from "@/components/home/HomeServiceAccordion";
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
import {
  buildEngineServicePickHref,
  getMasterFunnelRedirectForQuery,
  routeHeroToMasterFunnel,
} from "@/lib/masterFunnelEntry";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const REGISTER_CHIPS = [
  { chip: "법인설립 비용", key: "hero.chip.company" },
  { chip: "인허가 요건 확인", key: "hero.chip.permit" },
] as const;

const REGISTER_CHECKLIST_ITEMS = [
  "register.checklist.requirement",
  "register.checklist.documents",
  "register.checklist.duration",
  "register.checklist.authority",
  "register.checklist.process",
  "register.checklist.source",
] as const;

const REGISTER_HOOKS: Record<string, string> = {
  company: "잘못 만들면 못 고침",
  restaurant: "무허가 영업 시 즉시 폐쇄",
  fire: "미필증 시 영업정지",
  hygiene: "단속 1순위 항목",
  environment: "누락 시 가동중단",
  cosmetics: "무허가 시 전량 회수",
  "medical-device": "무허가 유통은 형사처벌",
  franchise: "미등록 시 계약 무효",
};

const REGISTER_SERVICE_VISUAL: Record<string, EngineServiceVisual> = {
  company: { icon: Building2, bg: "bg-blue-50", text: "text-blue-900", accent: "border-t-blue-700" },
  restaurant: { icon: UtensilsCrossed, bg: "bg-amber-50", text: "text-amber-700", accent: "border-t-amber-600" },
  fire: { icon: Flame, bg: "bg-red-50", text: "text-red-600", accent: "border-t-red-600" },
  hygiene: { icon: Droplets, bg: "bg-cyan-50", text: "text-cyan-700", accent: "border-t-cyan-600" },
  environment: { icon: Leaf, bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-t-emerald-600" },
  cosmetics: { icon: FlaskConical, bg: "bg-pink-50", text: "text-pink-700", accent: "border-t-pink-600" },
  "medical-device": { icon: Stethoscope, bg: "bg-violet-50", text: "text-violet-700", accent: "border-t-violet-600" },
  franchise: { icon: Store, bg: "bg-slate-100", text: "text-slate-700", accent: "border-t-slate-600" },
};

export default function RegisterLandingClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const services = getRegisterServiceItems();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim() ?? "";
    const redirectHref = getMasterFunnelRedirectForQuery(q, "register");
    if (redirectHref) {
      router.replace(redirectHref);
      return;
    }
    if (q) setQuery(q);
  }, [router]);

  function focusInput() {
    const el = document.getElementById("register-query-input");
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
    router.push(routeHeroToMasterFunnel(trimmed, "register"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitQuery();
  }

  function serviceLabel(key: string, field: "title" | "desc", fallback: string) {
    const translated = t(`register.service.${key}.${field}`);
    return translated === `register.service.${key}.${field}` ? fallback : translated;
  }

  return (
    <EngineLandingMain>
      <EngineTopSection>
        <EngineBreadcrumb engine="REGISTER" />
        <EngineHero
          engine="REGISTER"
          title={t("pillar.register.subtitle")}
          description={t("pillar.register.body")}
          deco={<FilePlus strokeWidth={1.75} className={ENGINE_SECTION_ICON} />}
        />
        <EngineComposer
          formId="register-query"
          inputId="register-query-input"
          query={query}
          isFocused={isFocused}
          showError={showError}
          chips={REGISTER_CHIPS}
          title="무엇을 진행하고 싶으세요?"
          emphasis="무료로 직접 진행하세요"
          placeholder="예) 식당 허가는?"
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

      <EngineServiceSection engine="REGISTER" lead={t("register.selectLead")}>
        {services.map((item) => {
          const title = serviceLabel(item.key, "title", item.title);
          return (
          <EngineServiceCard
            key={item.key}
            href={buildEngineServicePickHref(item.href, title)}
            title={title}
            desc={serviceLabel(item.key, "desc", item.desc)}
            cta={t("pillar.register.cta")}
            hook={REGISTER_HOOKS[item.key]}
            visual={REGISTER_SERVICE_VISUAL[item.key]}
          />
          );
        })}
      </EngineServiceSection>

      <EngineChecklistSection lead={t("register.checklistLead")} items={REGISTER_CHECKLIST_ITEMS} />
      <EngineDisclaimerSection />
    </EngineLandingMain>
  );
}
