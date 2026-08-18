"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, PenLine, Scale, Search } from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import HomeServiceAccordion from "@/components/home/HomeServiceAccordion";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const ENGINE_PILLARS = [
  {
    key: "check",
    label: "CHECK",
    title: "확인",
    desc: ["비용·자격·등록 가능 여부를", "스스로 확인합니다."],
    icon: Search,
    href: "#check",
    iconClass: "text-blue-900 bg-blue-50/80 ring-blue-100",
    labelClass: "text-blue-900",
  },
  {
    key: "verify",
    label: "VERIFY",
    title: "검증",
    desc: ["받은 견적과 서류가 정상", "범위인지 검토합니다."],
    icon: Scale,
    href: "#verify",
    iconClass: "text-slate-800 bg-slate-50 ring-slate-200",
    labelClass: "text-slate-800",
  },
  {
    key: "register",
    label: "REGISTER",
    title: "진행",
    desc: ["법인설립부터 업종별 인허가까지", "안내합니다."],
    icon: PenLine,
    href: "#register",
    iconClass: "text-amber-800 bg-amber-50/80 ring-amber-100",
    labelClass: "text-amber-800",
  },
  {
    key: "protect",
    label: "PROTECT",
    title: "보호",
    desc: ["만료·분쟁·사기 위험을", "미리 점검합니다."],
    icon: Lock,
    href: "#protect",
    iconClass: "text-blue-900 bg-[#faf6ed] ring-amber-100/80",
    labelClass: "text-blue-900",
  },
] as const;

function CitySilhouette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-24 overflow-hidden opacity-[0.07]"
    >
      <svg
        viewBox="0 0 1200 320"
        className="absolute bottom-0 left-1/2 h-auto w-[120%] max-w-none -translate-x-1/2 text-amber-900/60"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          fill="currentColor"
          d="M0 320V220h48l24-72 36 72h40l28-88 32 88h44l20-56 28 56h52l16-40 24 40h56l12-32 20 32h64l18-48 30 48h70l22-60 34 60h80l14-36 26 36H1200V320H0Z"
        />
        <path
          fill="currentColor"
          opacity="0.55"
          d="M120 320V180l28-20 18 20 22-34 26 34 20-28 24 28 30-42 34 42V320H120Z"
        />
        <path
          fill="currentColor"
          opacity="0.4"
          d="M860 320V160l36-24 24 24 28-40 32 40 26-30 30 30V320H860Z"
        />
      </svg>
    </div>
  );
}

const EXAMPLE_CHIP_KEYS = [
  "hero.chip.wp",
  "hero.chip.trc",
  "hero.chip.company",
  "hero.chip.quote",
] as const;

function ExampleChips({ onSelect }: { onSelect: (chip: string) => void }) {
  const { t } = useLocale();
  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip, index) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="rounded-full border border-slate-200/90 bg-[#faf8f5] px-3.5 py-1.5 text-xs text-slate-700 transition-colors hover:border-amber-200 hover:bg-amber-50/60 hover:text-blue-900"
          >
            {t(EXAMPLE_CHIP_KEYS[index])}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MyVietCheckHero() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  function focusInput() {
    const el = document.getElementById("hero-query-input");
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
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#faf8f5] to-[#f7f4ef]">
        <CitySilhouette />

        <div className="relative mx-auto max-w-[820px] px-5 pb-10 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-14">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-blue-900 sm:text-[2.35rem] sm:leading-[1.18]">
            {t("hero.titleLine1")}
            <br />
            {t("hero.titleBeforeHighlight")}
            <span className="text-amber-600">{t("hero.titleHighlight")}</span>
            {t("hero.titleAfterHighlight")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            {t("hero.subtitle")}
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[14px]">
            {t("hero.subtitle2")}
            <br className="hidden sm:block" />
            {t("hero.subtitle3")}
          </p>

          <form id="hero-query" onSubmit={handleSubmit} className="mt-8 sm:mt-9">
            <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 text-left shadow-[0_16px_48px_rgba(30,58,138,0.07)] sm:p-7">
              <span className="inline-flex items-center rounded-full border border-amber-100/80 bg-[#faf6ed] px-3 py-1 text-[11px] font-bold tracking-wide text-blue-900">
                {t("hero.badge")}
              </span>

              <label htmlFor="hero-query-input" className="sr-only">
                {t("hero.inputLabel")}
              </label>

              <div
                className={`mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch ${
                  showError ? "rounded-2xl ring-2 ring-red-200" : ""
                }`}
              >
                <div
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border bg-[#faf8f5]/60 px-4 py-3.5 transition-colors ${
                    isFocused ? "border-blue-200 bg-white" : "border-slate-200/90"
                  }`}
                >
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    id="hero-query-input"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (e.target.value.trim()) setShowError(false);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t("hero.placeholder")}
                    className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[15px]"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#152a63] sm:min-w-[112px]"
                >
                  {t("hero.submit")}
                  <ArrowRight size={16} />
                </button>
              </div>

              {showError ? (
                <p className="mt-2.5 text-xs font-medium text-red-600">
                  {t("hero.error")}
                </p>
              ) : (
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400">
                  {t("hero.helper")}
                </p>
              )}

              <ExampleChips onSelect={handleChipSelect} />
            </div>
          </form>
        </div>
      </section>

      <section id="protect" className="border-t border-slate-200/60 bg-[#f7f4ef]/50">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <p className="text-center text-sm font-semibold text-blue-900 sm:text-[15px]">
            {t("hero.pillarsLead")}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {ENGINE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <a
                  key={pillar.key}
                  href={pillar.href}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white p-5 text-left shadow-[0_4px_20px_rgba(30,58,138,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_8px_28px_rgba(30,58,138,0.08)]"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${pillar.iconClass}`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <p className={`mt-4 text-[10px] font-bold tracking-[0.2em] ${pillar.labelClass}`}>
                    {pillar.label}
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">{t(`pillar.${pillar.key}.title`)}</p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                    <span className="block">{t(`pillar.${pillar.key}.desc1`)}</span>
                    <span className="block">{t(`pillar.${pillar.key}.desc2`)}</span>
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 transition-all group-hover:gap-1.5">
                    {t("hero.more")}
                    <ArrowRight size={12} />
                  </span>
                </a>
              );
            })}
          </div>

          <div id="home-service-detail" className="mt-8 scroll-mt-24">
            <HomeServiceAccordion hideSectionHeaders />
          </div>
        </div>
      </section>
    </>
  );
}
