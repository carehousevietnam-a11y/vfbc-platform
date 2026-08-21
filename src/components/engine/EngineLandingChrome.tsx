"use client";

import { Fragment, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Files,
  GitCompare,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export const ENGINE_CONTAINER = "mx-auto w-full max-w-[960px] px-4 sm:px-6";
const ENGINE_SECTION_PAD = "py-10 sm:py-12 lg:py-5";

const COMPOSER_GUIDES = [
  { titleKey: "hero.badges.cost", lineKey: "hero.preview.costLabel", icon: CircleDollarSign },
  { titleKey: "hero.badges.timeline", lineKey: "hero.preview.stepsLabel", icon: Clock },
  { titleKey: "hero.badges.documents", lineKey: "hero.preview.docsLabel", icon: Files },
  { titleKey: "hero.badges.compare", lineKey: "hero.preview.compareLabel", icon: GitCompare },
] as const;

export type EngineChip = { chip: string; key: string };

export type EngineServiceVisual = {
  icon: LucideIcon;
  bg: string;
  text: string;
  accent: string;
};

export function EngineLandingMain({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-white">{children}</main>;
}

export function EngineTopSection({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white">
      <div className={`${ENGINE_CONTAINER} pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-5 lg:pt-4`}>{children}</div>
    </section>
  );
}

export function EngineBreadcrumb({ engine }: { engine: string }) {
  const { t } = useLocale();
  return (
    <nav className="mb-5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500 lg:mb-4">
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
      <span className="font-semibold tracking-[0.14em] text-blue-900">{engine}</span>
    </nav>
  );
}

export function EngineHero({
  engine,
  title,
  description,
}: {
  engine: string;
  title: string;
  description: string;
}) {
  return (
    <div className="w-full">
      <h1 className="break-keep text-[2.25rem] font-bold leading-[1.22] tracking-tight text-blue-900 sm:text-[2.75rem] lg:text-[2.25rem]">
        {engine}
      </h1>
      <p className="mt-3 break-keep text-[18px] font-bold leading-snug text-blue-900 sm:text-[20px] lg:mt-2 lg:text-[15px]">
        {title}
      </p>
      <p className="mt-4 break-keep text-[15px] leading-relaxed text-slate-600 sm:text-[16px] lg:mt-2 lg:text-[14px]">
        {description}
      </p>
    </div>
  );
}

function EngineComposerTitle({
  htmlFor,
  title,
  emphasis,
}: {
  htmlFor: string;
  title: string;
  emphasis?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-start gap-2.5 text-blue-900">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 text-[13px] font-bold text-white"
        aria-hidden
      >
        !
      </span>
      <span className="min-w-0">
        <span className="block break-keep text-[18px] font-bold leading-snug sm:text-[20px] lg:text-[16px]">
          {title}
        </span>
        {emphasis ? (
          <span className="mt-1.5 block break-keep text-[17px] font-bold leading-snug text-amber-600 sm:text-[19px] lg:text-[16px]">
            {emphasis}
          </span>
        ) : null}
      </span>
    </label>
  );
}

function EngineComposerGuides() {
  const { t } = useLocale();
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-3 lg:flex lg:items-center lg:gap-0">
      {COMPOSER_GUIDES.map(({ titleKey, lineKey, icon: Icon }, index) => (
        <Fragment key={titleKey}>
          <div className="flex min-w-0 items-center gap-2 lg:shrink-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 lg:h-6 lg:w-6" aria-hidden>
              <Icon size={15} className="text-blue-800" strokeWidth={2.25} />
            </span>
            <span className="min-w-0">
              <span className="block break-keep text-[12.5px] font-semibold leading-tight text-blue-900">
                {t(titleKey)}
              </span>
              <span className="mt-0.5 block break-keep text-[11.5px] leading-snug text-slate-500">
                {t(lineKey)}
              </span>
            </span>
          </div>
          {index < COMPOSER_GUIDES.length - 1 ? (
            <span aria-hidden className="mx-2 hidden min-w-8 flex-1 items-center lg:flex">
              <span className="h-0 w-full border-t border-dashed border-blue-300" />
              <ArrowRight size={12} className="-ml-px shrink-0 text-blue-400" strokeWidth={2.25} />
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function EngineChipRow({
  chips,
  onSelect,
}: {
  chips: readonly EngineChip[];
  onSelect: (chip: string) => void;
}) {
  const { t } = useLocale();
  if (chips.length === 0) return null;

  return (
    <div className="mt-5 lg:mt-3">
      <p className="text-[11px] font-semibold tracking-wide text-slate-400">{t("hero.chipsLabel")}</p>
      <div className="mt-2.5 flex flex-wrap gap-2 xl:flex-nowrap">
        {chips.map((item) => (
          <button
            key={item.chip}
            type="button"
            onClick={() => onSelect(item.chip)}
            className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:px-4 sm:py-2 lg:px-3.5 lg:py-1.5"
          >
            {t(item.key)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EngineComposer({
  formId,
  inputId,
  query,
  isFocused,
  showError,
  chips,
  title,
  emphasis,
  onSubmit,
  onQueryChange,
  onFocus,
  onBlur,
  onChipSelect,
}: {
  formId: string;
  inputId: string;
  query: string;
  isFocused: boolean;
  showError: boolean;
  chips: readonly EngineChip[];
  title?: string;
  emphasis?: string;
  onSubmit: (e: FormEvent) => void;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onChipSelect: (chip: string) => void;
}) {
  const { t } = useLocale();

  return (
    <form id={formId} onSubmit={onSubmit} className="mt-8 w-full lg:mt-5">
      <div className="rounded-[1.5rem] border border-blue-200 bg-white px-5 py-7 shadow-[0_0_0_4px_rgba(30,64,175,0.06)] sm:px-8 sm:py-8 lg:rounded-2xl lg:px-4 lg:py-4">
        <EngineComposerTitle htmlFor={inputId} title={title ?? t("hero.inputLabel")} emphasis={emphasis} />
        <p className="mt-2 break-keep pl-9 text-[13px] leading-relaxed text-slate-500 sm:text-[14px] lg:text-[13px]">
          {t("hero.homeLead")}
        </p>

        <div
          className={`mt-5 flex items-center gap-2 rounded-xl border bg-white py-2 pl-3.5 pr-1.5 transition-shadow lg:mt-4 ${
            isFocused
              ? "border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.16)]"
              : "border-slate-300"
          } ${showError ? "border-red-300 shadow-[0_0_0_4px_rgba(252,165,165,0.45)]" : ""}`}
        >
          <Search size={18} aria-hidden className="shrink-0 text-slate-400" />
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={t("hero.placeholder")}
            className="min-h-11 min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:min-h-12 sm:text-[16px] lg:min-h-11 lg:text-[15px]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#152a63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 sm:min-h-12 sm:px-5 sm:text-[14px] lg:min-h-11 lg:px-4 lg:text-[13px]"
          >
            {t("hero.submit")}
            <ArrowRight size={15} />
          </button>
        </div>

        {showError ? <p className="mt-2 text-xs font-medium text-red-600">{t("hero.error")}</p> : null}

        <EngineComposerGuides />
        <EngineChipRow chips={chips} onSelect={onChipSelect} />
      </div>
    </form>
  );
}

export function EngineServiceSection({
  engine,
  lead,
  children,
  footer,
}: {
  engine: string;
  lead: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="border-t border-slate-200/70 bg-white">
      <div className={`${ENGINE_CONTAINER} ${ENGINE_SECTION_PAD}`}>
        <p className="text-[11px] font-bold tracking-[0.18em] text-blue-900">{engine}</p>
        <p className="mt-2 break-keep text-[18px] font-bold leading-relaxed text-blue-900 sm:text-[20px] lg:text-[16px]">
          {lead}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-4 lg:grid-cols-4 lg:gap-3">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </section>
  );
}

export function EngineServiceCard({
  href,
  title,
  desc,
  cta,
  hook,
  visual,
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
  hook?: string;
  visual?: EngineServiceVisual;
}) {
  const Icon = visual?.icon;
  return (
    <Link
      href={href}
      aria-label={`${title} ${cta}`}
      className={`group flex flex-row items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left no-underline shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,58,138,0.10)] lg:flex-col lg:items-start lg:border-t-[3px] lg:p-4 lg:hover:-translate-y-1 ${visual?.accent ?? ""}`}
    >
      {Icon ? (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl lg:h-10 lg:w-10 ${visual?.bg ?? "bg-blue-50"}`}
          aria-hidden
        >
          <Icon size={22} className={visual?.text ?? "text-blue-900"} strokeWidth={2.25} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-slate-800 lg:mt-1 lg:text-[15px]">
          {title}
        </span>
        {hook ? (
          <span className="mt-1.5 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
            {hook}
          </span>
        ) : null}
        <span className="mt-1.5 block break-keep text-[13px] leading-relaxed text-slate-500">{desc}</span>
        <span className="mt-4 hidden items-center gap-1 text-[12.5px] font-semibold text-blue-900 transition-colors group-hover:text-[#152a63] lg:mt-3 lg:inline-flex">
          {cta}
          <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
      <ChevronRight size={18} aria-hidden className="shrink-0 text-slate-400 lg:hidden" />
    </Link>
  );
}

export function EngineChecklistSection({
  lead,
  items,
}: {
  lead: string;
  items: readonly string[];
}) {
  const { t } = useLocale();
  if (items.length === 0) return null;

  return (
    <section className="border-t border-slate-200/70 bg-white">
      <div className={`${ENGINE_CONTAINER} ${ENGINE_SECTION_PAD}`}>
        <p className="break-keep text-[18px] font-bold leading-relaxed text-blue-900 sm:text-[20px] lg:text-[16px]">
          {lead}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:mt-4 lg:grid-cols-6">
          {items.map((key) => (
            <li key={key} className="flex items-start gap-2.5 bg-white p-4 lg:p-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 lg:h-7 lg:w-7" aria-hidden>
                <Check size={15} className="text-blue-900" />
              </span>
              <span className="break-keep text-[13px] leading-relaxed text-slate-700">{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function EngineDisclaimerSection() {
  const { t } = useLocale();
  return (
    <section className="border-t border-slate-200/70 bg-white">
      <div className={`${ENGINE_CONTAINER} ${ENGINE_SECTION_PAD}`}>
        <p className="break-keep text-[13px] leading-relaxed text-slate-500">
          {t("ai.disclaimer")}
        </p>
      </div>
    </section>
  );
}
