import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  FileCheck,
  Flag,
  FolderOpen,
  GitBranch,
  ListChecks,
  MessageSquare,
  Scale,
  Search,
  ShieldAlert,
  Target,
  User,
  type LucideIcon,
} from "lucide-react";
import type { RequiredDocumentConfig } from "@/lib/requiredDocuments";
import type { PublishedArticle } from "@/lib/contentPacks/types";
import {
  GUIDE_EVIDENCE_NOTE,
  GUIDE_HERO_CORE_MESSAGE,
  GUIDE_REVIEW_PROCESS_STEPS,
  VFBCAI_APPROACH_STEPS,
  VFBCAI_REVIEW_SUMMARY,
} from "@/lib/contentPacks/guideCaseNarrative";
import type { ParsedGuideView } from "@/lib/contentPacks/parseGuideArticleView";

const ICON_STROKE = 1.75;
const NAVY = "text-[#0B2A6B]";
const MUTED = "text-[#556070]";
const BORDER = "border-[#D6E4FB]";
const CARD = `rounded-[12px] border ${BORDER} bg-white`;
const SECTION_TITLE = `text-[22px] font-bold leading-tight ${NAVY} sm:text-2xl`;

const PROCESS_ICONS: LucideIcon[] = [
  MessageSquare,
  FolderOpen,
  Scale,
  Search,
  ShieldAlert,
  FileBarChart,
  Flag,
];

const CHECKPOINT_META: { icon: LucideIcon; bg: string; color: string }[] = [
  { icon: FileCheck, bg: "bg-emerald-50", color: "text-emerald-600" },
  { icon: ListChecks, bg: "bg-blue-50", color: "text-blue-700" },
  { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-600" },
  { icon: ArrowUpRight, bg: "bg-violet-50", color: "text-violet-600" },
];

const APPROACH_ICONS: LucideIcon[] = [User, FolderOpen, Scale, Search, FileBarChart];

function GuideIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon className={className} strokeWidth={ICON_STROKE} aria-hidden />;
}

type GuideCaseVisualProps = {
  article: PublishedArticle;
  view: ParsedGuideView;
  docs: RequiredDocumentConfig;
  showDocuments: boolean;
  showHero?: boolean;
};

export function GuideCaseHero({ article, showHero = true }: { article: PublishedArticle; showHero?: boolean }) {
  if (!showHero) return null;

  return (
    <header className="border-b border-[#E8EFF9] pb-8 sm:pb-10">
      <p className="text-sm font-medium text-blue-900/70">
        VFBCAI 가이드 &gt; {article.serviceLabel}
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_19.5rem] lg:gap-10">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-[#D6E4FB] bg-[#F5F8FF] px-3 py-1 text-sm font-medium text-blue-900">
            {article.serviceLabel}
          </span>
          <h1 className={`mt-4 break-keep text-[1.75rem] font-bold leading-[1.25] tracking-tight sm:text-[2rem] ${NAVY}`}>
            {article.title}
          </h1>
          {article.subtitle ? (
            <p className={`mt-4 break-keep text-base leading-relaxed sm:text-[17px] ${MUTED}`}>
              {article.subtitle}
            </p>
          ) : null}
        </div>
        <aside className={`${CARD} p-5`}>
          <div className="flex items-center gap-2">
            <GuideIcon icon={Target} className="h-5 w-5 text-blue-800" />
            <p className="text-[15px] font-semibold text-blue-900">이 가이드의 핵심</p>
          </div>
          <p className={`mt-3 break-keep text-[15px] font-medium leading-relaxed ${NAVY}`}>
            {GUIDE_HERO_CORE_MESSAGE}
          </p>
          <p className={`mt-3 break-keep text-sm leading-relaxed ${MUTED}`}>{VFBCAI_REVIEW_SUMMARY}</p>
        </aside>
      </div>
    </header>
  );
}

function GuideCustomerCaseBlock({ article }: { article: PublishedArticle }) {
  const summary = article.caseLanding.customerSituationSummary;
  const points = article.caseLanding.customerReviewPoints ?? [];
  if (!summary || points.length === 0) return null;

  return (
    <section aria-labelledby="guide-customer-case" className={`${CARD} p-5 sm:p-6`}>
      <h2 id="guide-customer-case" className={`text-lg font-semibold ${NAVY}`}>
        이번 사건에서 확인할 내용
      </h2>
      <p className={`mt-3 break-keep text-[15px] leading-relaxed ${MUTED}`}>{summary}</p>
      <ul className="mt-4 space-y-2">
        {points.map((point, index) => (
          <li key={point} className={`flex gap-2.5 text-[15px] leading-relaxed ${NAVY}`}>
            <span className="shrink-0 font-semibold text-blue-800">{index + 1}.</span>
            <span className="break-keep">{point}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-4 break-keep text-sm leading-relaxed ${MUTED}`}>{GUIDE_EVIDENCE_NOTE}</p>
    </section>
  );
}

export function GuideCaseVisual({
  article,
  view,
  docs,
  showDocuments,
  showHero = true,
}: GuideCaseVisualProps) {
  const landing = article.caseLanding;
  const materialItems = buildMaterialItems(view, docs, showDocuments);

  return (
    <div className={`${showHero ? "mt-10" : "mt-0"} space-y-12 sm:space-y-14`}>
      <GuideCustomerCaseBlock article={article} />

      <section aria-labelledby="guide-process-flow">
        <div className="flex items-center gap-2">
          <GuideIcon icon={GitBranch} className="h-5 w-5 text-blue-800" />
          <h2 id="guide-process-flow" className={SECTION_TITLE}>
            한눈에 보는 사건 검토 과정
          </h2>
        </div>
        <p className={`mt-2 text-[15px] sm:text-[16px] ${MUTED}`}>
          내 사건 · 증거자료 · 베트남 법령·행정 기준을 함께 확인하는 흐름입니다.
        </p>

        <div className={`mt-6 ${CARD} p-4 sm:p-6`}>
          <ol className="relative space-y-0 lg:hidden">
            {GUIDE_REVIEW_PROCESS_STEPS.map((step, index) => {
              const Icon = PROCESS_ICONS[index];
              const isLast = index === GUIDE_REVIEW_PROCESS_STEPS.length - 1;
              return (
                <li key={step.step} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast ? (
                    <span
                      className="absolute left-[1.375rem] top-12 h-[calc(100%-3rem)] w-px bg-[#D6E4FB]"
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative z-10 flex shrink-0 flex-col items-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6E4FB] bg-[#F5F8FF] text-base font-bold text-blue-900">
                      {step.step}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <GuideIcon icon={Icon} className="h-6 w-6 text-blue-800" />
                    <p className={`mt-2 text-base font-semibold ${NAVY}`}>{step.title}</p>
                    <p className={`mt-1.5 text-sm leading-relaxed ${MUTED}`}>{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="hidden lg:flex lg:items-start lg:justify-between">
            {GUIDE_REVIEW_PROCESS_STEPS.map((step, index) => {
              const Icon = PROCESS_ICONS[index];
              const isLast = index === GUIDE_REVIEW_PROCESS_STEPS.length - 1;
              return (
                <div key={step.step} className="flex min-w-0 flex-1 items-start">
                  <div className="min-w-0 flex-1 px-1 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#D6E4FB] bg-[#F5F8FF] text-base font-bold text-blue-900">
                      {step.step}
                    </div>
                    <GuideIcon icon={Icon} className="mx-auto mt-3 h-6 w-6 text-blue-800" />
                    <p className={`mt-2 text-[15px] font-semibold leading-snug ${NAVY}`}>{step.title}</p>
                    <p className={`mt-1.5 text-sm leading-relaxed ${MUTED}`}>{step.desc}</p>
                  </div>
                  {!isLast ? (
                    <ChevronRight className="mx-0.5 mt-4 h-5 w-5 shrink-0 text-[#B8C9E6]" strokeWidth={ICON_STROKE} aria-hidden />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-[12px] border border-[#D6E4FB] bg-[#F5F8FF] px-5 py-6 sm:px-8 sm:py-7">
          <p className="text-sm font-semibold text-blue-900">VFBCAI 검토 공식</p>
          <div className="mt-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-2">
            <FormulaItem icon={User} label="사건 정보" />
            <span className="text-lg text-[#B8C9E6]">+</span>
            <FormulaItem icon={FolderOpen} label="증거자료" />
            <span className="text-lg text-[#B8C9E6]">+</span>
            <FormulaItem icon={Scale} label="베트남 법령·행정 기준" />
            <span className="hidden text-lg text-[#B8C9E6] sm:inline">=</span>
            <span className="text-lg text-[#B8C9E6] sm:hidden">↓</span>
            <FormulaItem icon={ShieldAlert} label="위험·누락·다음 행동" accent />
          </div>
          <div className={`mt-5 hidden text-center text-[15px] font-medium sm:block ${NAVY}`}>
            <p>교차 검토 → 위험 · 누락 · 쟁점 → 검토 결과 → 다음 행동</p>
          </div>
        </div>
      </section>

      {view.caseCheckpoints.length > 0 ? (
        <section aria-labelledby="guide-checkpoints">
          <h2 id="guide-checkpoints" className={SECTION_TITLE}>
            이 사건에서 가장 먼저 확인할 것
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {view.caseCheckpoints.slice(0, 4).map((item, index) => {
              const meta = CHECKPOINT_META[index % CHECKPOINT_META.length];
              const Icon = meta.icon;
              return (
                <div key={item.title} className={`${CARD} flex h-full flex-col px-5 py-5`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${meta.bg}`}>
                    <GuideIcon icon={Icon} className={`h-5 w-5 ${meta.color}`} />
                  </span>
                  <p className={`mt-4 text-base font-semibold ${NAVY}`}>{item.title}</p>
                  {item.body ? (
                    <p className={`mt-2 text-sm leading-relaxed ${MUTED}`}>{item.body}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {(view.beforeAction.length > 0 || view.afterAction.length > 0) && (
        <section aria-labelledby="guide-before-after" className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          {view.beforeAction.length > 0 ? (
            <div className={`${CARD} p-5 sm:p-6`}>
              <h2 id="guide-before-after" className={`text-lg font-semibold ${NAVY}`}>
                진행 전
              </h2>
              <p className={`mt-1 text-sm ${MUTED}`}>무엇을 먼저 확인할까</p>
              <ul className="mt-4 space-y-2.5">
                {view.beforeAction.map((item) => (
                  <li key={item} className={`flex gap-2.5 text-[15px] leading-relaxed ${NAVY}`}>
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
                    <span className="break-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {view.afterAction.length > 0 ? (
            <div className={`${CARD} p-5 sm:p-6`}>
              <h2 className={`text-lg font-semibold ${NAVY}`}>문제가 발생한 후</h2>
              <p className={`mt-1 text-sm ${MUTED}`}>무엇을 확보하고 확인할까</p>
              <ul className="mt-4 space-y-2.5">
                {view.afterAction.map((item) => (
                  <li key={item} className={`flex gap-2.5 text-[15px] leading-relaxed ${NAVY}`}>
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900/70" />
                    <span className="break-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      <section aria-labelledby="guide-vfbcai-approach" className="grid gap-6 lg:grid-cols-[1fr_18.5rem] lg:gap-8">
        <div>
          <h2 id="guide-vfbcai-approach" className={SECTION_TITLE}>
            VFBCAI는 무엇을 어떻게 확인하나요?
          </h2>
          <div className="mt-6 space-y-4">
            {VFBCAI_APPROACH_STEPS.map((step, index) => {
              const Icon = APPROACH_ICONS[index];
              return (
                <div key={step.title} className={`${CARD} flex gap-4 px-4 py-4 sm:px-5 sm:py-4`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F8FF]">
                    <GuideIcon icon={Icon} className="h-5 w-5 text-blue-800" />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[15px] font-semibold ${NAVY}`}>{step.title}</p>
                    <p className={`mt-1 text-sm leading-relaxed ${MUTED}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          {landing.cautions.length > 0 ? (
            <aside className={`${CARD} p-5`}>
              <p className="text-[15px] font-semibold text-red-700">자주 하는 실수</p>
              <ul className="mt-3 space-y-2">
                {landing.cautions.slice(0, 4).map((item) => (
                  <li key={item} className={`flex gap-2 text-sm leading-relaxed ${MUTED}`}>
                    <span className="shrink-0 font-bold text-red-500" aria-hidden>
                      ✕
                    </span>
                    <span className="break-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
          {materialItems.length > 0 ? (
            <aside className={`${CARD} p-5`}>
              <p className="text-[15px] font-semibold text-emerald-700">필요한 자료</p>
              <p className={`mt-1 text-sm ${MUTED}`}>무엇을 준비하면 좋을까요?</p>
              <ul className="mt-3 space-y-2">
                {materialItems.map((item) => (
                  <li key={item} className={`flex gap-2 text-sm leading-relaxed ${MUTED}`}>
                    <span className="shrink-0 font-bold text-emerald-600" aria-hidden>
                      ✓
                    </span>
                    <span className="break-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function FormulaItem({
  icon,
  label,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold sm:text-[15px] ${
        accent ? "border-amber-200 bg-amber-50 text-amber-800" : `border-[#D6E4FB] bg-white ${NAVY}`
      }`}
    >
      <GuideIcon icon={icon} className={`h-4 w-4 ${accent ? "text-amber-700" : "text-blue-800"}`} />
      {label}
    </span>
  );
}

function buildMaterialItems(
  view: ParsedGuideView,
  docs: RequiredDocumentConfig,
  showDocuments: boolean
): string[] {
  const items: string[] = [];
  if (showDocuments) {
    items.push(...docs.documents);
    if (docs.optionalDocuments) items.push(...docs.optionalDocuments);
  }
  if (view.evidenceWhenProblem.length > 0) {
    for (const item of view.evidenceWhenProblem) {
      if (!items.includes(item)) items.push(item);
    }
  }
  return items.slice(0, 8);
}
