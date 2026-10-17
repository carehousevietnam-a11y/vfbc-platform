import type { ReactNode } from "react";

type IconProps = { className?: string };

const stroke = {
  stroke: "#071A33",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const fillTone = "#2563EB";

function HubSvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 56 56" aria-hidden>
      {children}
    </svg>
  );
}

/** 조회/발급 — 돋보기 + 문서 */
export function HubIconInquiry({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <rect x="22" y="12" width="22" height="28" rx="3" fill={fillTone} fillOpacity={0.16} {...stroke} />
      <path d="M20 34h12M20 40h8" fill="none" {...stroke} />
      <circle cx="18" cy="22" r="7" fill={fillTone} fillOpacity={0.22} {...stroke} />
      <path d="M23 27l5 5" fill="none" {...stroke} />
    </HubSvg>
  );
}

/** 신청/제출 — 편지봉투 + 화살표 */
export function HubIconApply({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <path d="M14 20h28l-14 10-14-10z" fill={fillTone} fillOpacity={0.28} {...stroke} />
      <path d="M14 20v18h28V20" fill={fillTone} fillOpacity={0.1} {...stroke} />
      <path d="M36 32l6 4-6 4" fill="none" {...stroke} />
      <path d="M30 36h12" fill="none" {...stroke} />
    </HubSvg>
  );
}

/** 신고/납부 — 계산기 */
export function HubIconDeclare({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <rect x="14" y="10" width="28" height="36" rx="4" fill={fillTone} fillOpacity={0.14} {...stroke} />
      <rect x="18" y="16" width="20" height="8" rx="1" fill={fillTone} fillOpacity={0.35} />
      <rect x="18" y="28" width="7" height="7" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="27" y="28" width="7" height="7" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="18" y="38" width="7" height="7" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="27" y="38" width="7" height="7" rx="1" fill={fillTone} fillOpacity={0.45} />
    </HubSvg>
  );
}

function ShortSvg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden>
      {children}
    </svg>
  );
}

const shortStroke = { ...stroke, strokeWidth: 1.5 };

export function ShortcutIconCalendar({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <rect x="5" y="7" width="22" height="20" rx="2" fill={fillTone} fillOpacity={0.12} {...shortStroke} />
      <path d="M5 13h22M10 5v4M22 5v4" fill="none" {...shortStroke} />
    </ShortSvg>
  );
}

export function ShortcutIconSettings({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <circle cx="16" cy="16" r="4" fill={fillTone} fillOpacity={0.35} {...shortStroke} />
      <path
        d="M16 5v3M16 24v3M5 16h3M24 16h3M8.2 8.2l2.1 2.1M21.7 21.7l2.1 2.1M8.2 23.8l2.1-2.1M21.7 10.3l2.1-2.1"
        fill="none"
        {...shortStroke}
      />
    </ShortSvg>
  );
}
