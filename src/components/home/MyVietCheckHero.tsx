"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileText,
  Files,
  GitCompare,
  Lock,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "비자 연장 비용",
  "받은 견적 확인",
] as const;

const ENGINE_PILLARS = [
  { key: "check", label: "CHECK", href: "/check", icon: ShieldCheck, tone: "blue" },
  { key: "verify", label: "VERIFY", href: "/verify", icon: Scale, tone: "emerald" },
  { key: "register", label: "REGISTER", href: "/register", icon: FileText, tone: "amber" },
  { key: "protect", label: "PROTECT", href: "/protect", icon: Lock, tone: "violet" },
] as const;

const PILLAR_TONE_CLASSES: Record<string, { bg: string; text: string; accent: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-900", accent: "border-t-blue-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-t-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", accent: "border-t-amber-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", accent: "border-t-violet-600" },
};

const EXAMPLE_CHIP_KEYS = [
  "hero.chip.wp",
  "hero.chip.trc",
  "hero.chip.company",
  "hero.chip.visa",
  "hero.chip.quote",
] as const;

const VALUE_BADGES = [
  { key: "hero.badges.cost", icon: CircleDollarSign },
  { key: "hero.badges.timeline", icon: Clock },
  { key: "hero.badges.documents", icon: Files },
  { key: "hero.badges.compare", icon: GitCompare },
] as const;

function ValueBadges() {
  const { t } = useLocale();
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {VALUE_BADGES.map(({ key, icon: Icon }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600"
        >
          <Icon size={14} className="text-blue-800" strokeWidth={2.2} aria-hidden />
          {t(key)}
        </span>
      ))}
    </div>
  );
}

function HeroToPreviewArrow() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-full top-16 mr-0 hidden h-[80px] w-[76px] text-blue-800 lg:block"
      viewBox="0 0 76 80"
      fill="none"
    >
      <path
        d="M8 64c8-28 28-48 56-54"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M54 4.5 70 14 52 22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExamplePreviewCard() {
  const { t } = useLocale();
  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] lg:ml-auto">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <CheckCircle2 size={13} strokeWidth={2.4} aria-hidden />
        {t("hero.preview.tag")}
      </span>
      <p className="mt-3 break-keep text-[13.5px] font-medium leading-snug text-slate-700">
        {t("hero.preview.question")}
      </p>
      <dl className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <dt className="text-slate-500">{t("hero.preview.costLabel")}</dt>
          <dd className="font-semibold text-blue-900">{t("hero.preview.costValue")}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <dt className="text-slate-500">{t("hero.preview.stepsLabel")}</dt>
          <dd className="font-semibold text-blue-900">{t("hero.preview.stepsValue")}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <dt className="text-slate-500">{t("hero.preview.docsLabel")}</dt>
          <dd className="font-semibold text-blue-900">{t("hero.preview.docsValue")}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <dt className="shrink-0 text-slate-500">{t("hero.preview.compareLabel")}</dt>
          <dd className="flex flex-wrap items-center justify-end gap-1.5 font-semibold">
            <span className="text-emerald-600">{t("hero.preview.compareGood")}</span>
            <span className="text-slate-300">/</span>
            <span className="text-amber-600">{t("hero.preview.compareCaution")}</span>
            <span className="text-slate-300">/</span>
            <span className="text-red-500">{t("hero.preview.compareBad")}</span>
          </dd>
        </div>
      </dl>
      <p className="mt-4 break-keep text-[11px] leading-relaxed text-slate-400">
        {t("hero.preview.disclaimer")}
      </p>
    </div>
  );
}

function ExampleChips({ onSelect }: { onSelect: (chip: string) => void }) {
  const { t } = useLocale();
  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400">{t("hero.homeChipsLabel")}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip, index) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-900 hover:shadow-[0_2px_6px_rgba(30,58,138,0.08)]"
          >
            {t(EXAMPLE_CHIP_KEYS[index])}
          </button>
        ))}
      </div>
    </div>
  );
}

function EnginePillars() {
  const { t } = useLocale();
  return (
    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {ENGINE_PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        const tone = PILLAR_TONE_CLASSES[pillar.tone];
        return (
          <Link
            key={pillar.key}
            id={pillar.key}
            href={pillar.href}
            className={`group scroll-mt-24 flex flex-row items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left no-underline shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,58,138,0.10)] lg:flex-col lg:items-start lg:border-t-[3px] lg:p-6 lg:hover:-translate-y-1 ${tone.accent}`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl lg:h-12 lg:w-12 ${tone.bg}`}
              aria-hidden
            >
              <Icon size={22} className={tone.text} strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1">
              <h2 className="text-[11px] font-bold tracking-[0.18em] text-blue-900">{pillar.label}</h2>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug text-slate-800 lg:mt-1 lg:text-[15px]">
                {t(`pillar.${pillar.key}.subtitle`)}
              </p>
              <p className="mt-1.5 hidden break-keep text-[13px] leading-relaxed text-slate-500 lg:block">
                {t(`pillar.${pillar.key}.line`)}
              </p>
              <span className="mt-4 hidden items-center gap-1 text-[12.5px] font-semibold text-blue-900 transition-colors group-hover:text-[#152a63] lg:inline-flex">
                {t(`hero.engineCta.${pillar.key}`)}
                <ArrowRight
                  size={14}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
            <ChevronRight size={18} aria-hidden className="shrink-0 text-slate-400 lg:hidden" />
          </Link>
        );
      })}
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
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-start">
            <div className="order-1 min-w-0 w-full lg:w-7/12 lg:pr-12">
              <span className="mb-5 inline-flex max-w-full items-center gap-1.5 break-keep rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:text-[12.5px]">
                {t("hero.eyebrow")}
              </span>
              <h1 className="break-keep text-[2.25rem] font-bold leading-[1.22] tracking-tight text-blue-900 sm:text-[2.75rem] lg:text-[3.125rem]">
                {t("hero.titleLine1")}
                <br />
                {t("hero.titleBeforeHighlight")}
                <span className="text-amber-600">{t("hero.titleHighlight")}</span>
                {t("hero.titleAfterHighlight")}
              </h1>
              <p className="mt-5 max-w-[36rem] break-keep text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
                {t("hero.subtitle")}
              </p>
              <ValueBadges />
            </div>

            <div className="relative order-3 mt-6 min-w-0 w-full lg:order-2 lg:mt-1 lg:w-5/12">
              <div className="relative lg:ml-auto lg:max-w-[420px]">
                <HeroToPreviewArrow />
                <ExamplePreviewCard />
              </div>
            </div>

            <form id="hero-query" onSubmit={handleSubmit} className="order-2 mt-8 w-full lg:order-3 lg:mt-10">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-6 shadow-[0_4px_20px_rgba(15,23,42,0.07)] sm:px-7 sm:py-7">
                <label htmlFor="hero-query-input" className="flex items-start gap-2.5 text-[18px] font-bold leading-snug text-blue-900 sm:text-[20px]">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[13px] font-bold text-white"
                    aria-hidden
                  >
                    !
                  </span>
                  <span className="break-keep">
                    {t("hero.homeTitleBefore")}
                    <span className="text-amber-600">{t("hero.homeTitleHighlight")}</span>
                    {t("hero.homeTitleAfter")}
                  </span>
                </label>
                <p className="mt-2 break-keep pl-9 text-[13px] leading-relaxed text-slate-500 sm:text-[14px]">
                  {t("hero.homeLead")}
                </p>

                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl border bg-[#faf8f5]/70 py-1.5 pl-3.5 pr-1.5 transition-colors ${
                    isFocused ? "border-blue-200 bg-white" : "border-slate-200/90"
                  } ${showError ? "ring-2 ring-red-200" : ""}`}
                >
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
                    placeholder={t("hero.homePlaceholder")}
                    className="min-h-10 min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[16px]"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-900 px-3.5 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(30,58,138,0.18)] transition-all hover:bg-[#152a63] sm:min-h-11 sm:px-5 sm:text-[14px]"
                  >
                    {t("hero.homeSubmit")}
                    <ArrowRight size={15} />
                  </button>
                </div>

                {showError ? (
                  <p className="mt-2 text-xs font-medium text-red-600">{t("hero.error")}</p>
                ) : null}

                <ExampleChips onSelect={handleChipSelect} />
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-14 sm:px-6 sm:py-20">
          <p className="break-keep text-center text-[18px] font-bold leading-relaxed text-blue-900 sm:text-[20px]">
            {t("hero.pillarsLeadBefore")}
            <span className="text-amber-600">{t("hero.pillarsLeadHighlight")}</span>
            {t("hero.pillarsLeadAfter")}
          </p>
          <EnginePillars />
        </div>
      </section>
    </>
  );
}
