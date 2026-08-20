"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { getRegisterServiceItems } from "@/components/home/HomeServiceAccordion";
import { routeByKeywords } from "@/lib/smartRouter";
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

export default function RegisterLandingClient() {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const services = getRegisterServiceItems();

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
    const { href } = routeByKeywords(trimmed);
    router.push(href);
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
    <main className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-slate-200/80 bg-[#faf8f5]">
        <div className="mx-auto flex h-12 w-full max-w-[1040px] items-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 transition-colors hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
          >
            <ArrowLeft size={14} aria-hidden />
            {t("check.backHome")}
          </Link>
        </div>
      </header>

      <section className="bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10">
          <div className="max-w-[720px]">
            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-blue-900">REGISTER</p>
            <h1 className="break-keep text-[1.875rem] font-bold leading-[1.28] tracking-tight text-blue-900 sm:text-[2.125rem] lg:text-[2.35rem]">
              {t("pillar.register.subtitle")}
            </h1>
            <p className="mt-3.5 max-w-[36rem] break-keep text-[15px] leading-relaxed text-slate-600 sm:text-base">
              {t("pillar.register.body")}
            </p>
          </div>

          <form id="register-query" onSubmit={handleSubmit} className="mt-7 sm:mt-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5 sm:py-4">
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

              <label htmlFor="register-query-input" className="mt-3 block text-[13px] font-medium text-slate-700">
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
                    id="register-query-input"
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
                  className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-blue-900 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#152a63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:w-auto sm:min-w-[96px]"
                >
                  {t("hero.submit")}
                  <ArrowRight size={15} />
                </button>
              </div>

              {showError ? (
                <p className="mt-2 text-xs font-medium text-red-600">{t("hero.error")}</p>
              ) : null}

              <div className="mt-4">
                <p className="text-[11px] font-medium tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {REGISTER_CHIPS.map((item) => (
                    <button
                      key={item.chip}
                      type="button"
                      onClick={() => handleChipSelect(item.chip)}
                      className="rounded-full border border-slate-200/90 bg-[#faf8f5] px-2.5 py-1 text-[12px] text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
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

      <section className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
          <p className="break-keep text-[15px] font-medium leading-relaxed text-blue-900">
            {t("register.selectLead")}
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2">
            {services.map((item) => {
              const title = serviceLabel(item.key, "title", item.title);
              const desc = serviceLabel(item.key, "desc", item.desc);
              const cta = t("pillar.register.cta");

              return (
                <div
                  key={item.key}
                  className="border-t border-slate-200/80 py-4 last:border-b sm:odd:border-r sm:odd:pr-8 sm:even:pl-8 sm:[&:nth-child(n+3)]:border-b"
                >
                  <Link
                    href={item.href}
                    aria-label={`${title} ${cta}`}
                    className="group flex w-full items-end justify-between gap-3 text-left no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:gap-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-snug text-slate-700">{title}</span>
                      <span className="mt-1 block break-keep text-[13px] leading-relaxed text-slate-500">
                        {desc}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-[12px] font-medium text-blue-900 transition-colors group-hover:text-[#152a63]">
                      {cta}
                      <ChevronDown
                        size={16}
                        aria-hidden
                        className="-rotate-90 shrink-0 text-blue-900/70"
                      />
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-[#faf8f5]">
        <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
          <p className="break-keep text-[15px] font-medium leading-relaxed text-blue-900">
            {t("register.checklistLead")}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {REGISTER_CHECKLIST_ITEMS.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-blue-900" aria-hidden />
                <span className="text-[13px] leading-relaxed text-slate-700">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
