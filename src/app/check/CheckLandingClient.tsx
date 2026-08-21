"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Car,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Files,
  GitCompare,
  Home,
  Search,
} from "lucide-react";
import { getCheckServiceItems } from "@/components/home/HomeServiceAccordion";
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

const CHECK_COMPOSER_GUIDES = [
  { titleKey: "hero.badges.cost", lineKey: "hero.preview.costLabel", icon: CircleDollarSign },
  { titleKey: "hero.badges.timeline", lineKey: "hero.preview.stepsLabel", icon: Clock },
  { titleKey: "hero.badges.documents", lineKey: "hero.preview.docsLabel", icon: Files },
  { titleKey: "hero.badges.compare", lineKey: "hero.preview.compareLabel", icon: GitCompare },
] as const;

const CHECK_SERVICE_VISUAL: Record<
  string,
  { icon: typeof CreditCard; bg: string; text: string; accent: string }
> = {
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

  const inputLabel = t("hero.inputLabel");
  const inputHighlight = "돈을 쓰려고";
  const inputHighlightIndex = inputLabel.indexOf(inputHighlight);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10">
          <nav className="mb-5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500 sm:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 transition-colors hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <ArrowLeft size={14} aria-hidden />
              {t("check.backHome")}
            </Link>
            <span className="text-slate-300" aria-hidden>
              /
            </span>
            <span className="font-semibold tracking-[0.14em] text-blue-900">CHECK</span>
          </nav>

          <div className="w-full">
            <h1 className="break-keep text-[2.25rem] font-bold leading-[1.12] tracking-tight text-blue-900 sm:text-[2.75rem] lg:text-[3.5rem]">
              CHECK
            </h1>
            <p className="mt-3 break-keep text-[22px] font-bold leading-snug text-blue-900 sm:text-[28px] lg:text-[32px]">
              {t("pillar.check.subtitle")}
            </p>
            <p className="mt-4 max-w-3xl break-keep text-[15px] leading-relaxed text-slate-600 sm:text-[17px] lg:text-[18px]">
              {t("pillar.check.body")}
            </p>
          </div>

          <form id="check-query" onSubmit={handleSubmit} className="mt-6 w-full lg:mt-8">
            <div className="rounded-[1.75rem] border border-blue-200 bg-white px-5 py-7 shadow-[0_0_0_4px_rgba(30,64,175,0.06)] sm:px-12 sm:py-12">
              <label htmlFor="check-query-input" className="flex items-start gap-3 text-blue-900">
                <span
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[14px] font-bold text-white"
                  aria-hidden
                >
                  !
                </span>
                <span className="min-w-0">
                  <span className="block break-keep text-[22px] font-bold leading-snug sm:text-[28px]">
                    {inputHighlightIndex >= 0 ? (
                      <>
                        {inputLabel.slice(0, inputHighlightIndex)}
                        <span className="text-amber-600">{inputHighlight}</span>
                        {inputLabel.slice(inputHighlightIndex + inputHighlight.length)}
                      </>
                    ) : (
                      inputLabel
                    )}
                  </span>
                </span>
              </label>
              <p className="mt-3 break-keep pl-11 text-[14px] leading-relaxed text-slate-500 sm:text-[16px]">
                {t("hero.homeLead")}
              </p>

              <div
                className={`mt-6 flex items-center gap-3 rounded-2xl border bg-white py-2.5 pl-4 pr-2 transition-shadow ${
                  isFocused
                    ? "border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.16)]"
                    : "border-slate-300"
                } ${showError ? "border-red-300 shadow-[0_0_0_4px_rgba(252,165,165,0.45)]" : ""}`}
              >
                <Search size={20} aria-hidden className="shrink-0 text-slate-400" />
                <input
                  id="check-query-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value.trim()) setShowError(false);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t("hero.placeholder")}
                  className="min-h-14 min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:min-h-16 sm:text-[18px]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-14 shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-900 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#152a63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:min-h-16 sm:px-8 sm:text-[16px]"
                >
                  {t("hero.submit")}
                  <ArrowRight size={16} />
                </button>
              </div>

              {showError ? (
                <p className="mt-2 text-xs font-medium text-red-600">{t("hero.error")}</p>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3 lg:flex lg:items-center lg:gap-0">
                {CHECK_COMPOSER_GUIDES.map(({ titleKey, lineKey, icon: Icon }, index) => (
                  <Fragment key={titleKey}>
                    <div className="flex min-w-0 items-center gap-3 lg:shrink-0">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50" aria-hidden>
                        <Icon size={20} className="text-blue-800" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0">
                        <span className="block break-keep text-[14px] font-bold leading-tight text-blue-900 sm:text-[15px]">
                          {t(titleKey)}
                        </span>
                        <span className="mt-0.5 block break-keep text-[13px] leading-snug text-slate-500">
                          {t(lineKey)}
                        </span>
                      </span>
                    </div>
                    {index < CHECK_COMPOSER_GUIDES.length - 1 ? (
                      <span aria-hidden className="mx-3 hidden min-w-10 flex-1 items-center lg:flex">
                        <span className="h-0 w-full border-t border-dashed border-blue-300" />
                        <ArrowRight size={14} className="-ml-px shrink-0 text-blue-400" strokeWidth={2.25} />
                      </span>
                    ) : null}
                  </Fragment>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-[12px] font-semibold tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
                <div className="mt-3 flex flex-wrap gap-2.5 xl:flex-nowrap">
                  {CHECK_CHIPS.map((item) => (
                    <button
                      key={item.chip}
                      type="button"
                      onClick={() => handleChipSelect(item.chip)}
                      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:px-6 sm:py-2.5 sm:text-[15px]"
                    >
                      {t(item.key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="text-[11px] font-bold tracking-[0.18em] text-blue-900">CHECK</p>
          <p className="mt-2 break-keep text-[20px] font-bold leading-relaxed text-blue-900 sm:text-[24px]">
            {t("check.selectLead")}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {services.map((item) => {
              const title = serviceLabel(item.key, "title", item.title);
              const desc = serviceLabel(item.key, "desc", item.desc);
              const cta = t("pillar.check.cta");
              const hook = CHECK_HOOKS[item.key];
              const visual = CHECK_SERVICE_VISUAL[item.key];
              const Icon = visual?.icon;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-label={`${title} ${cta}`}
                  className={`group flex min-h-[5.5rem] flex-row items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 text-left no-underline shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,58,138,0.10)] lg:min-h-[340px] lg:flex-col lg:items-start lg:border-t-[3px] lg:p-8 lg:hover:-translate-y-1 ${visual?.accent ?? ""}`}
                >
                  {Icon ? (
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl lg:h-16 lg:w-16 ${visual.bg}`}
                      aria-hidden
                    >
                      <Icon size={28} className={visual.text} strokeWidth={2.25} />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold leading-snug text-slate-800 lg:mt-2 lg:text-[20px]">
                      {title}
                    </span>
                    {hook ? (
                      <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600">
                        {hook}
                      </span>
                    ) : null}
                    <span className="mt-2 block break-keep text-[13px] leading-relaxed text-slate-500 lg:text-[14px]">
                      {desc}
                    </span>
                    <span className="mt-5 hidden items-center gap-1 text-[13px] font-semibold text-blue-900 transition-colors group-hover:text-[#152a63] lg:inline-flex">
                      {cta}
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
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="break-keep text-[20px] font-bold leading-relaxed text-blue-900 sm:text-[24px]">
            {t("check.checklistLead")}
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
            {CHECKLIST_ITEMS.map((key) => (
              <li key={key} className="flex items-start gap-3 bg-white p-5 sm:p-6">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50" aria-hidden>
                  <Check size={18} className="text-blue-900" />
                </span>
                <span className="break-keep text-[14px] leading-relaxed text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
