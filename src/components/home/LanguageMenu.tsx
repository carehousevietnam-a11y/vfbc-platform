"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";

// [STEP20-1] 언어 선택 드롭다운 — UI 전용.
// 실제 번역/다국어 전환 로직은 다음 STEP에서 구현하며, 이 컴포넌트는
// 선택된 언어를 로컬 state로만 표시한다(다른 로직에 영향 없음).
const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

export default function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof LANGUAGES)[number]["code"]>("ko");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-[12px] font-semibold text-gray-600 transition hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe size={18} />
        <span className="hidden sm:inline">Language</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              onClick={() => {
                setSelected(lang.code);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] text-gray-700 transition hover:bg-gray-50"
            >
              {lang.label}
              {selected === lang.code && <Check size={14} className="text-blue-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
