type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HubIconInquiry({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="10" y="8" width="28" height="32" rx="3" {...stroke} />
      <path d="M16 18h16M16 24h12M16 30h8" {...stroke} />
    </svg>
  );
}

export function HubIconProof({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M14 10h20l4 6v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" {...stroke} />
      <path d="M34 16H18a2 2 0 0 1-2-2V10" {...stroke} />
      <path d="M20 28l4 4 8-10" {...stroke} />
    </svg>
  );
}

export function HubIconApply({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M12 14h24v26H12z" {...stroke} />
      <path d="M18 22h12M18 28h12M18 34h8" {...stroke} />
      <path d="M20 8h8l2 6H18l2-6z" {...stroke} />
    </svg>
  );
}

export function HubIconDeclare({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="10" y="12" width="28" height="26" rx="3" {...stroke} />
      <path d="M16 20h16M16 26h10" {...stroke} />
      <path d="M24 8v6" {...stroke} />
      <circle cx="24" cy="32" r="3" {...stroke} />
    </svg>
  );
}

export function HubIconConsult({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M12 14a12 12 0 0 1 24 0v8a12 12 0 0 1-24 0v-8z" {...stroke} />
      <path d="M18 36h12M24 30v6" {...stroke} />
    </svg>
  );
}

export function HubIconAgent({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="16" r="6" {...stroke} />
      <path d="M12 40c0-8 5-14 12-14s12 6 12 14" {...stroke} />
      <path d="M32 12l4-2v8l-4-2" {...stroke} />
    </svg>
  );
}

export function ShortcutIconCalendar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" {...stroke} strokeWidth={1.5} />
      <path d="M4 9h16M8 3v4M16 3v4" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

export function ShortcutIconTxn({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 4h12v16H6z" {...stroke} strokeWidth={1.5} />
      <path d="M9 8h6M9 12h6" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

export function ShortcutIconExcel({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" {...stroke} strokeWidth={1.5} />
      <path d="M9 8l2 4-2 4M13 8l2 4-2 4" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

export function ShortcutIconEvidence({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M6 18V6l6-3 6 3v12l-6 3-6-3z" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

export function ShortcutIconReceipt({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path d="M7 4h10v16l-2-1-2 1-2-1-2 1-2-1V4z" {...stroke} strokeWidth={1.5} />
    </svg>
  );
}

export function ShortcutIconSettings({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="3" {...stroke} strokeWidth={1.5} />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        {...stroke}
        strokeWidth={1.5}
      />
    </svg>
  );
}
