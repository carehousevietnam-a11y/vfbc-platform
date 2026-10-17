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

export function HubIconInquiry({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <rect x="14" y="10" width="26" height="34" rx="3" fill={fillTone} fillOpacity={0.18} {...stroke} />
      <circle cx="22" cy="22" r="5" fill="none" {...stroke} />
      <path d="M26 26l6 6" fill="none" {...stroke} />
      <path d="M20 34h14M20 40h10" fill="none" {...stroke} />
    </HubSvg>
  );
}

export function HubIconProof({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <path
        d="M16 12h22l4 6v26a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z"
        fill={fillTone}
        fillOpacity={0.15}
        {...stroke}
      />
      <circle cx="36" cy="36" r="7" fill={fillTone} fillOpacity={0.35} {...stroke} />
      <path d="M33 36h6M36 33v6" stroke="#fff" strokeWidth={1.5} fill="none" />
    </HubSvg>
  );
}

export function HubIconApply({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <path d="M14 18h28v28H14z" fill={fillTone} fillOpacity={0.12} {...stroke} />
      <path d="M18 14h20l2 4H16l2-4z" fill={fillTone} fillOpacity={0.28} {...stroke} />
      <path d="M34 30l6 6-6 6" fill="none" {...stroke} />
      <path d="M22 36h16" fill="none" {...stroke} />
    </HubSvg>
  );
}

export function HubIconDeclare({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <rect x="12" y="14" width="32" height="30" rx="4" fill={fillTone} fillOpacity={0.14} {...stroke} />
      <rect x="18" y="20" width="8" height="6" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="28" y="20" width="8" height="6" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="18" y="30" width="8" height="6" rx="1" fill={fillTone} fillOpacity={0.45} />
      <rect x="28" y="30" width="8" height="6" rx="1" fill={fillTone} fillOpacity={0.45} />
      <path d="M18 42h20" fill="none" {...stroke} />
    </HubSvg>
  );
}

export function HubIconConsult({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <path d="M14 22a14 14 0 0 1 28 0v6a14 14 0 0 1-28 0v-6z" fill={fillTone} fillOpacity={0.2} {...stroke} />
      <path d="M20 38h16M28 32v6" fill="none" {...stroke} />
      <circle cx="22" cy="26" r="2" fill={fillTone} />
      <circle cx="34" cy="26" r="2" fill={fillTone} />
    </HubSvg>
  );
}

export function HubIconAgent({ className }: IconProps) {
  return (
    <HubSvg className={className}>
      <circle cx="28" cy="18" r="8" fill={fillTone} fillOpacity={0.22} {...stroke} />
      <path d="M14 46c0-9 6.5-16 14-16s14 7 14 16" fill={fillTone} fillOpacity={0.12} {...stroke} />
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

export function ShortcutIconTxn({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <path d="M8 6h16v20H8z" fill={fillTone} fillOpacity={0.12} {...shortStroke} />
      <path d="M11 12h10M11 17h10" fill="none" {...shortStroke} />
    </ShortSvg>
  );
}

export function ShortcutIconExcel({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <rect x="6" y="4" width="20" height="24" rx="2" fill={fillTone} fillOpacity={0.12} {...shortStroke} />
      <path d="M12 10l3 6-3 6M17 10l3 6-3 6" fill="none" {...shortStroke} />
    </ShortSvg>
  );
}

export function ShortcutIconEvidence({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <path d="M8 22V10l8-4 8 4v12l-8 4-8-4z" fill={fillTone} fillOpacity={0.14} {...shortStroke} />
      <path d="M16 6v20M16 14l6-3M16 14l-6-3" fill="none" {...shortStroke} />
      <path d="M20 8v6l4 2" stroke={fillTone} strokeWidth={1.75} fill="none" />
    </ShortSvg>
  );
}

export function ShortcutIconReceipt({ className }: IconProps) {
  return (
    <ShortSvg className={className}>
      <path
        d="M9 5h14v22l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5V5z"
        fill={fillTone}
        fillOpacity={0.12}
        {...shortStroke}
      />
      <path d="M12 11h8M12 15h8M12 19h5" fill="none" {...shortStroke} />
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
