"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
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

type AccordionKey = "check" | "verify" | "register";

type ServiceItem = {
  key: string;
  title: string;
  icon: LucideIcon;
  href: string;
  iconClass?: string;
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
    items: [
      { key: "trc", title: "거주증", icon: CreditCard, href: "/check/trc", iconClass: "text-blue-900" },
      { key: "wp", title: "노동허가", icon: Briefcase, href: "/check/wp", iconClass: "text-blue-900" },
      { key: "tamtru", title: "땀주", icon: Home, href: "/check/tamtru", iconClass: "text-blue-900" },
      {
        key: "license",
        title: "운전면허",
        icon: Car,
        href: "/check/driving-license",
        iconClass: "text-blue-900",
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
    gridClass: "grid-cols-2 sm:grid-cols-3",
    items: [
      { key: "admin", title: "행정문서", icon: FileText, href: "/verify/admin" },
      { key: "real-estate", title: "부동산", icon: Building2, href: "/verify/real-estate" },
      {
        key: "fraud",
        title: "사기의심",
        icon: AlertTriangle,
        href: "/verify/fraud",
        iconClass: "text-red-600",
      },
      { key: "tax", title: "세무문서", icon: Receipt, href: "/verify/tax" },
      { key: "unclear", title: "불확실서류", icon: FileQuestion, href: "/verify/unclear" },
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
    items: [
      { key: "company", title: "법인설립", icon: Building2, href: "/register/company", iconClass: "text-amber-700" },
      {
        key: "restaurant",
        title: "식당",
        icon: UtensilsCrossed,
        href: "/register/restaurant",
        iconClass: "text-amber-700",
      },
      { key: "fire", title: "소방", icon: Flame, href: "/register/fire-safety", iconClass: "text-amber-700" },
      { key: "hygiene", title: "위생", icon: Droplets, href: "/register/hygiene", iconClass: "text-amber-700" },
      { key: "environment", title: "환경", icon: Leaf, href: "/register/environment", iconClass: "text-amber-700" },
      {
        key: "cosmetics",
        title: "화장품",
        icon: FlaskConical,
        href: "/register/cosmetics",
        iconClass: "text-amber-700",
      },
      {
        key: "medical-device",
        title: "의료기기",
        icon: Stethoscope,
        href: "/register/medical-device",
        iconClass: "text-amber-700",
      },
      { key: "franchise", title: "프랜차이즈", icon: Store, href: "/register/franchise", iconClass: "text-amber-700" },
    ],
  },
];

export default function HomeServiceAccordion() {
  const [openKey, setOpenKey] = useState<AccordionKey | null>(null);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash === "check" || hash === "verify" || hash === "register") {
        setOpenKey(hash);
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function toggleSection(key: AccordionKey) {
    setOpenKey((current) => (current === key ? null : key));
  }

  return (
    <div className="mt-6 space-y-3">
      {ACCORDION_SECTIONS.map((section) => {
        const isOpen = openKey === section.key;
        const SectionIcon = section.icon;

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
              className={`grid transition-[grid-template-rows] duration-150 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100/80 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                  <div className={`grid gap-3 ${section.gridClass}`}>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white px-3 py-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
                        >
                          <ItemIcon
                            className={item.iconClass ?? "text-gray-900"}
                            size={22}
                            strokeWidth={1.75}
                          />
                          <p className="mt-2 text-[12px] font-bold leading-snug text-gray-900 sm:text-[13px]">
                            {item.title}
                          </p>
                        </Link>
                      );
                    })}
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
