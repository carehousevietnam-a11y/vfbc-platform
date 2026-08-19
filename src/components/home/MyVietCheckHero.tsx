"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
  { key: "check", label: "CHECK", href: "#check" },
  { key: "verify", label: "VERIFY", href: "#verify" },
  { key: "register", label: "REGISTER", href: "#register" },
  { key: "protect", label: "PROTECT", href: "#protect" },
] as const;

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
      <p className="text-[11px] font-medium tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLE_CHIPS.map((chip, index) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="rounded-full border border-slate-200/90 bg-[#faf8f5] px-2.5 py-1 text-[12px] text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-900"
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
      <section className="bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
          <div className="max-w-[720px]">
            <p className="mb-3 text-[12px] font-medium tracking-[0.04em] text-slate-500 sm:text-[13px]">
              {t("hero.eyebrow")}
            </p>
            <h1 className="break-keep text-[1.875rem] font-bold leading-[1.28] tracking-tight text-blue-900 sm:text-[2.125rem] lg:text-[2.35rem]">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleBeforeHighlight")}
              <span className="text-amber-600">{t("hero.titleHighlight")}</span>
              {t("hero.titleAfterHighlight")}
            </h1>
            <p className="mt-3.5 max-w-[36rem] break-keep text-[15px] leading-relaxed text-slate-600 sm:text-base">
              {t("hero.subtitle")}
            </p>
          </div>

          <form id="hero-query" onSubmit={handleSubmit} className="mt-7 sm:mt-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-blue-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-900" aria-hidden />
                  {t("hero.badge")}
                </span>
                <nav className="hidden items-center gap-3 text-[11px] font-medium text-slate-400 sm:flex" aria-hidden>
                  <span>질문</span>
                  <span>비용</span>
                  <span>확인</span>
                </nav>
              </div>

              <label htmlFor="hero-query-input" className="mt-3 block text-[13px] font-medium text-slate-700">
                {t("hero.inputLabel")}
              </label>

              <div
                className={`mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch ${
                  showError ? "rounded-xl ring-2 ring-red-200" : ""
                }`}
              >
                <div
                  className={`flex min-h-11 min-w-0 flex-1 items-center rounded-xl border bg-[#faf8f5]/70 px-3.5 transition-colors ${
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
                  className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-900 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#152a63] sm:w-auto sm:min-w-[96px]"
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

      <section id="protect" className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
          <p className="break-keep text-[15px] font-medium leading-relaxed text-blue-900">
            {t("hero.pillarsLead")}
          </p>

          <dl className="mt-6 divide-y divide-slate-200/80 border-y border-slate-200/80">
            {ENGINE_PILLARS.map((pillar) => (
              <div key={pillar.key}>
                <a
                  href={pillar.href}
                  className="flex min-h-11 items-baseline justify-between gap-4 py-3.5 transition-colors hover:text-blue-900"
                >
                  <dt className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-blue-900">
                    {pillar.label}
                  </dt>
                  <dd className="min-w-0 text-right text-[14px] leading-snug text-slate-600">
                    {t(`pillar.${pillar.key}.desc1`)}
                  </dd>
                </a>
              </div>
            ))}
          </dl>

          <div id="home-service-detail" className="mt-8 scroll-mt-24">
            <HomeServiceAccordion hideSectionHeaders />
          </div>
        </div>
      </section>
    </>
  );
}
