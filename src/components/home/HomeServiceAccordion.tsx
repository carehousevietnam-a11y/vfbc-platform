"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  Car,
  ChevronDown,
  CreditCard,
  Droplets,
  FileQuestion,
  FileText,
  Flame,
  FlaskConical,
  Home,
  Landmark,
  Leaf,
  LucideIcon,
  Receipt,
  Scale,
  Stamp,
  Stethoscope,
  Store,
  UtensilsCrossed,
} from "lucide-react";

export type AccordionKey = "check" | "verify" | "register";
type CardVariant = "check" | "verify" | "register";

type ServiceItem = {
  key: string;
  title: string;
  hook: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  danger?: boolean;
};

type AccordionSection = {
  key: AccordionKey;
  id: string;
  title: string;
  expertLabel: string;
  expertLabelClass: string;
  description: string;
  toggleLabel: string;
  icon: LucideIcon;
  iconClass: string;
  toggleClass: string;
  gridClass: string;
  cardVariant: CardVariant;
  items: ServiceItem[];
};

const ACCORDION_SECTIONS: AccordionSection[] = [
  {
    key: "check",
    id: "check",
    title: "직접 확인하기",
    expertLabel: "베트남 행정전문 AI",
    expertLabelClass: "text-blue-900",
    description:
      "비용·자격·등록 가능 여부를 1분 만에 스스로 확인합니다. 거주증·노동허가·운전면허·법인설립까지 4개 서비스를 지원합니다.",
    toggleLabel: "전체 확인",
    icon: Landmark,
    iconClass: "bg-blue-50 text-blue-900",
    toggleClass: "text-blue-900",
    gridClass: "grid-cols-2 sm:grid-cols-4",
    cardVariant: "check",
    items: [
      {
        key: "trc",
        title: "거주증",
        hook: "만료 시 벌금 위험",
        desc: "TRC 발급 가능 여부를 직접 확인하세요",
        icon: CreditCard,
        href: "/check/trc",
      },
      {
        key: "wp",
        title: "노동허가",
        hook: "무허가 근무 적발 위험",
        desc: "Work Permit 발급 가능 여부를 확인하세요",
        icon: Briefcase,
        href: "/check/wp",
      },
      {
        key: "tamtru",
        title: "땀주",
        hook: "12시간 이내 신고 필요",
        desc: "임시거주 등록 상태를 지금 확인하세요",
        icon: Home,
        href: "/check/tamtru",
      },
      {
        key: "license",
        title: "운전면허",
        hook: "국제면허 미인정 사례 있음",
        desc: "베트남 면허 전환 가능 여부를 확인하세요",
        icon: Car,
        href: "/check/driving-license",
      },
    ],
  },
  {
    key: "verify",
    id: "verify",
    title: "직접 검토하기",
    expertLabel: "베트남 법률전문 AI",
    expertLabelClass: "text-gray-900",
    description:
      "받은 견적이나 서류가 정상 범위인지 직접 검토합니다. 계약서·세무문서·사기의심 문서까지 5개 항목을 지원합니다.",
    toggleLabel: "전체 검토",
    icon: Scale,
    iconClass: "bg-gray-100 text-gray-800",
    toggleClass: "text-gray-800",
    gridClass: "grid-cols-2 sm:grid-cols-5",
    cardVariant: "verify",
    items: [
      {
        key: "admin",
        title: "행정문서 리뷰",
        hook: "서명 전 필수 확인",
        desc: "출입국·노동·세무 공문서",
        icon: FileText,
        href: "/verify/admin",
      },
      {
        key: "real-estate",
        title: "부동산 문서 리뷰",
        hook: "보증금 미반환 주의",
        desc: "임대·매매 계약서",
        icon: Building2,
        href: "/verify/real-estate",
      },
      {
        key: "fraud",
        title: "사기문서 리뷰",
        hook: "투자사기 사전탐지",
        desc: "투자·거래 사기 의심 문서",
        icon: AlertTriangle,
        href: "/verify/fraud",
        danger: true,
      },
      {
        key: "tax",
        title: "세무문서 리뷰",
        hook: "계좌동결 위험",
        desc: "세금 고지서·신고서",
        icon: Receipt,
        href: "/verify/tax",
      },
      {
        key: "unclear",
        title: "불확실한 서류 검토",
        hook: "기한 놓치면 위험",
        desc: "어떤 서류인지 모를 때",
        icon: FileQuestion,
        href: "/verify/unclear",
      },
    ],
  },
  {
    key: "register",
    id: "register",
    title: "직접 허가받기",
    expertLabel: "베트남 인허가전문 AI",
    expertLabelClass: "text-amber-700",
    description:
      "법인설립부터 업종별 인허가까지 실제 행정·법률 업무를 진행합니다. 식당·소방·위생 등 8개 업종을 지원합니다.",
    toggleLabel: "전체 허가",
    icon: Stamp,
    iconClass: "bg-amber-50 text-amber-700",
    toggleClass: "text-amber-700",
    gridClass: "grid-cols-2 sm:grid-cols-4",
    cardVariant: "register",
    items: [
      {
        key: "company",
        title: "법인설립",
        hook: "잘못 만들면 못 고침",
        desc: "IRC·ERC 포함 설립 절차",
        icon: Building2,
        href: "/register/company",
      },
      {
        key: "restaurant",
        title: "식당허가",
        hook: "무허가 영업 시 즉시 폐쇄",
        desc: "요식업 영업허가",
        icon: UtensilsCrossed,
        href: "/register/restaurant",
      },
      {
        key: "fire",
        title: "소방허가",
        hook: "미필증 시 영업정지",
        desc: "소방시설 안전 인증",
        icon: Flame,
        href: "/register/fire-safety",
      },
      {
        key: "hygiene",
        title: "위생허가",
        hook: "단속 1순위 항목",
        desc: "식품·위생 안전 인증",
        icon: Droplets,
        href: "/register/hygiene",
      },
      {
        key: "environment",
        title: "환경허가",
        hook: "누락 시 가동중단",
        desc: "환경영향평가·배출허가",
        icon: Leaf,
        href: "/register/environment",
      },
      {
        key: "cosmetics",
        title: "화장품허가",
        hook: "무허가 시 전량 회수",
        desc: "화장품 제조·유통 허가",
        icon: FlaskConical,
        href: "/register/cosmetics",
      },
      {
        key: "medical-device",
        title: "의료기기허가",
        hook: "무허가 유통은 형사처벌",
        desc: "의료기기 수입·유통 허가",
        icon: Stethoscope,
        href: "/register/medical-device",
      },
      {
        key: "franchise",
        title: "프랜차이즈 등록",
        hook: "미등록 시 계약 무효",
        desc: "가맹사업 등록·계약 허가",
        icon: Store,
        href: "/register/franchise",
      },
    ],
  },
];

export function getCheckServiceItems(): Array<{
  key: string;
  title: string;
  desc: string;
  href: string;
}> {
  const section = ACCORDION_SECTIONS.find((item) => item.key === "check");
  return (section?.items ?? []).map(({ key, title, desc, href }) => ({
    key,
    title,
    desc,
    href,
  }));
}

function AccordionItemCard({
  item,
  variant,
  compact = false,
}: {
  item: ServiceItem;
  variant: CardVariant;
  compact?: boolean;
}) {
  const ItemIcon = item.icon;
  const checkClass = compact
    ? "group flex flex-col rounded-xl border border-slate-200/80 bg-white p-3"
    : "group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:p-5";
  const verifyClass = compact
    ? "group flex flex-col items-center rounded-xl border border-slate-200/80 bg-white px-2.5 py-3.5 text-center"
    : "group flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-3 py-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:px-4 sm:py-6";
  const registerClass = compact
    ? "group flex flex-col rounded-xl border border-slate-200/80 bg-white p-3"
    : "group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:p-5";

  if (variant === "check") {
    return (
      <Link href={item.href} className={checkClass}>
        <span className="inline-block self-start rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
          {item.hook}
        </span>
        <ItemIcon className="mt-3 text-blue-900" size={24} strokeWidth={1.75} />
        <p className="mt-2 text-base font-bold tracking-tight text-gray-900">{item.title}</p>
        <p className="mt-1 text-[12px] leading-snug text-gray-500">{item.desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-900 transition-all group-hover:gap-1.5">
          지금 확인 <ArrowRight size={12} />
        </span>
      </Link>
    );
  }

  if (variant === "verify") {
    return (
      <Link href={item.href} className={verifyClass}>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
            item.danger ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.hook}
        </span>
        <ItemIcon
          className={`mt-3 ${item.danger ? "text-red-600" : "text-gray-900"}`}
          size={22}
          strokeWidth={1.75}
        />
        <p className="mt-2 text-[13px] font-bold leading-snug text-gray-900">{item.title}</p>
        <p className="mt-1 text-[11px] leading-snug text-gray-500">{item.desc}</p>
      </Link>
    );
  }

  return (
    <Link href={item.href} className={registerClass}>
      <span className="inline-block self-start rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
        {item.hook}
      </span>
      <ItemIcon className="mt-3 text-amber-700" size={24} strokeWidth={1.75} />
      <p className="mt-2 text-base font-bold tracking-tight text-gray-900">{item.title}</p>
      <p className="mt-1 text-[12px] leading-snug text-gray-500">{item.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 transition-all group-hover:gap-1.5">
        허가 절차 확인 <ArrowRight size={12} />
      </span>
    </Link>
  );
}

export default function HomeServiceAccordion({
  hideSectionHeaders = false,
  openKey: openKeyProp,
  onToggle,
}: {
  hideSectionHeaders?: boolean;
  openKey?: AccordionKey | null;
  onToggle?: (key: AccordionKey) => void;
}) {
  const [uncontrolledOpenKey, setUncontrolledOpenKey] = useState<AccordionKey | null>(null);
  const isControlled = openKeyProp !== undefined && typeof onToggle === "function";
  const openKey = isControlled ? (openKeyProp ?? null) : uncontrolledOpenKey;

  useEffect(() => {
    if (isControlled) return;

    function syncFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash === "check" || hash === "verify" || hash === "register") {
        setUncontrolledOpenKey(hash);
      } else if (hash === "protect") {
        setUncontrolledOpenKey("verify");
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [isControlled]);

  function toggleSection(key: AccordionKey) {
    if (isControlled) {
      onToggle?.(key);
      return;
    }
    setUncontrolledOpenKey((current) => (current === key ? null : key));
  }

  if (hideSectionHeaders && !openKey) {
    return null;
  }

  return (
    <div className="mt-0 space-y-3">
      {ACCORDION_SECTIONS.map((section) => {
        const isOpen = openKey === section.key;
        const SectionIcon = section.icon;
        const panelId = `home-service-panel-${section.key}`;

        if (hideSectionHeaders) {
          if (!isOpen) return null;
          return (
            <div key={section.key} id={panelId} role="region" className="overflow-hidden pb-4">
              <div className={`grid gap-2 sm:gap-3 ${section.gridClass}`}>
                {section.items.map((item) => (
                  <AccordionItemCard
                    key={item.key}
                    item={item}
                    variant={section.cardVariant}
                    compact={hideSectionHeaders}
                  />
                ))}
              </div>
            </div>
          );
        }

        return (
          <div
            key={section.key}
            id={section.id}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full px-4 py-4 text-left sm:px-5 sm:py-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${section.iconClass}`}
                >
                  <SectionIcon size={18} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-sm font-semibold text-gray-900 sm:text-[15px]">{section.title}</p>
                    <span className={`text-[11px] font-semibold sm:text-xs ${section.expertLabelClass}`}>
                      {section.expertLabel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-gray-500 sm:text-[13px]">
                    {section.description}
                  </p>
                  <span
                    className={`mt-3 inline-flex items-center gap-1 text-[12px] font-semibold ${section.toggleClass}`}
                  >
                    {section.toggleLabel}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </div>
              </div>
            </button>

            <div
              id={panelId}
              className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100/80 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                  <div className={`grid gap-3 sm:gap-4 ${section.gridClass}`}>
                    {section.items.map((item) => (
                      <AccordionItemCard key={item.key} item={item} variant={section.cardVariant} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
