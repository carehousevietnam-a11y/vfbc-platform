"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildVerifyAdminRollingStripItems,
  type MypageRollingStripItem,
} from "@/lib/mypageLinkCatalog";
import { VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE } from "@/lib/adminVerifyMypageFields";

const AUTO_ADVANCE_MS = 4500;

function rollingLinkInitial(label: string): string {
  const chars = [...label.trim()];
  return chars[0] ?? "?";
}

function RollingStripIcon({ item }: { item: MypageRollingStripItem }) {
  if (item.iconSrc) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        <Image src={item.iconSrc} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
      </span>
    );
  }

  const initial = rollingLinkInitial(item.label);
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[13px] font-extrabold text-[#0d2a6b]"
      aria-hidden
    >
      {initial}
    </span>
  );
}

function RollingStripCard({ item }: { item: MypageRollingStripItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      data-rolling-item={item.id}
      className="flex h-[56px] min-w-[148px] max-w-[200px] shrink-0 snap-start items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition hover:border-blue-200 sm:min-w-[168px]"
    >
      <RollingStripIcon item={item} />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold text-slate-400">{item.regionLabel}</span>
        <span className="block truncate text-[12px] font-bold text-slate-900">{item.label}</span>
      </span>
    </a>
  );
}

export function VerifyAdminMypageRollingStrip() {
  const items = useMemo(() => buildVerifyAdminRollingStripItems(), []);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-rolling-item]");
      const step = card ? card.offsetWidth + 12 : 172;
      el.scrollBy({ left: direction * step, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion]
  );

  useEffect(() => {
    if (reduceMotion || paused || items.length === 0) return;
    const id = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      } else {
        scrollByStep(1);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, items.length, scrollByStep]);

  if (items.length === 0) return null;

  return (
    <section
      className="min-w-0 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      aria-label={VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-extrabold tracking-[-0.02em] text-slate-950">
          {VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE}
        </p>
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <button
            type="button"
            aria-label="이전"
            onClick={() => scrollByStep(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="다음"
            onClick={() => scrollByStep(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative mt-3 min-w-0">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {items.map((item) => (
            <RollingStripCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
