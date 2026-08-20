"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Scale, ShieldAlert, ShieldCheck } from "lucide-react";
import { routeByKeywords } from "@/lib/smartRouter";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EXAMPLE_CHIPS = [
  "노동허가 비용",
  "거주증 비용",
  "법인설립 비용",
  "받은 견적 확인",
] as const;

const ENGINE_PILLARS = [
  { key: "check", label: "CHECK", href: "/check", icon: ShieldCheck, tone: "blue" },
  { key: "verify", label: "VERIFY", href: "/verify", icon: Scale, tone: "emerald" },
  { key: "register", label: "REGISTER", href: "/register", icon: FileText, tone: "amber" },
  { key: "protect", label: "PROTECT", href: "/protect", icon: ShieldAlert, tone: "violet" },
] as const;
const PILLAR_TONE_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-900" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700" },
};

const EXAMPLE_CHIP_KEYS = [
  "hero.chip.wp",
  "hero.chip.trc",
  "hero.chip.company",
  "hero.chip.quote",
] as const;

function ExampleChips({ onSelect }: { onSelect: (chip: string) => void }) {
  const { t } = useLocale();
  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {EXAMPLE_CHIPS.map((chip, index) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-900 hover:shadow-[0_2px_6px_rgba(30,58,138,0.08)]"
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
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ENGINE_PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        const tone = PILLAR_TONE_CLASSES[pillar.tone];
        return (
          <Link
            key={pillar.key}
            id={pillar.key}
            href={pillar.href}
            className="group scroll-mt-24 flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 text-left no-underline shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200/70 hover:shadow-[0_6px_16px_rgba(30,58,138,0.08)]"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.bg}`}
              aria-hidden
            >
              <Icon size={20} className={tone.text} strokeWidth={2.25} />
            </span>
            <h2 className="mt-3.5 text-[11px] font-bold tracking-[0.18em] text-blue-900">
              {pillar.label}
            </h2>
            <p className="mt-1 text-[14px] font-semibold leading-snug text-slate-800">
              {t(`pillar.${pillar.key}.subtitle`)}
            </p>
            <p className="mt-1.5 break-keep text-[13px] leading-relaxed text-slate-500">
              {t(`pillar.${pillar.key}.line`)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-blue-900 transition-colors group-hover:text-[#152a63]">
              {t(`pillar.${pillar.key}.cta`)}
              <ArrowRight
                size={14}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
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
      <section className="bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
          <div className="max-w-[720px]">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:text-[12.5px]">
              {t("hero.eyebrow")}
            </span>
            <h1 className="break-keep text-[2rem] font-bold leading-[1.26] tracking-tight text-blue-900 sm:text-[2.375rem] lg:text-[2.625rem]">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleBeforeHighlight")}
              <span className="text-amber-600">{t("hero.titleHighlight")}</span>
              {t("hero.titleAfterHighlight")}
            </h1>
            <p className="mt-4 max-w-[36rem] break-keep text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
              {t("hero.subtitle")}
            </p>
          </div>

          <form id="hero-query" onSubmit={handleSubmit} className="mt-7 sm:mt-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-blue-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-900" aria-hidden />
                  {t("hero.badge")}
                </span>
                <nav className="flex items-center gap-3 text-[11px] font-medium text-slate-400" aria-hidden>
                  <span>질문</span>
                  <span>비용</span>
                  <span>확인</span>
                </nav>
              </div>

              <label htmlFor="hero-query-input" className="mt-3.5 block text-[13.5px] font-medium text-slate-700">
                {t("hero.inputLabel")}
              </label>

              <div
                className={`mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-stretch ${
                  showError ? "rounded-xl ring-2 ring-red-200" : ""
                }`}
              >
                <div
                  className={`flex min-h-12 min-w-0 flex-1 items-center rounded-xl border bg-[#faf8f5]/70 px-3.5 transition-colors ${
                    isFocused ? "border-blue-200 bg-white" : "border-slate-200/90"
                  }`}
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
                    placeholder={t("hero.placeholder")}
                    className="w-full border-0 bg-transparent p-0 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-900 px-5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:bg-[#152a63] sm:w-auto sm:min-w-[96px]"
                >
                  {t("hero.submit")}
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
      </section>

      <section className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-10 sm:px-6 sm:py-14">
          <p className="break-keep text-[15px] font-semibold leading-relaxed text-blue-900 sm:text-base">
            {t("hero.pillarsLead")}
          </p>
          <EnginePillars />
        </div>
      </section>
    </>
  );
}
