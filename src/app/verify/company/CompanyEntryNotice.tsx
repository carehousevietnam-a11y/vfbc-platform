"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  COMPANY_ENTRY_CUSTOM_CODE,
  COMPANY_ENTRY_QUESTIONS,
  COMPANY_ENTRY_STORAGE_KEY,
  companyEntryChoice,
} from "@/lib/landings/companyEntry";

/**
 * 법인설립 랜딩 3단계 질문에서 고른 내용을 퍼널 입구에 보여 준다.
 * 질문·판정 로직은 건드리지 않는 안내 줄이다. 직접 입력 글은 같은 브라우저(sessionStorage)에서만 읽는다.
 */
export default function CompanyEntryNotice() {
  const params = useSearchParams();
  const [custom, setCustom] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(COMPANY_ENTRY_STORAGE_KEY);
      setCustom(raw ? (JSON.parse(raw) as Record<string, string>) : {});
    } catch {
      setCustom({});
    }
  }, []);

  const rows = COMPANY_ENTRY_QUESTIONS.flatMap((q) => {
    const code = params.get(q.key);
    if (!code) return [];
    if (code === COMPANY_ENTRY_CUSTOM_CODE) {
      const text = typeof custom[q.key] === "string" ? custom[q.key].trim() : "";
      return text ? [{ label: q.summaryLabel, text }] : [];
    }
    const c = companyEntryChoice(q.key, code);
    return c ? [{ label: q.summaryLabel, text: c.lead }] : [];
  });

  if (rows.length === 0) return null;

  return (
    <div
      className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-600 break-keep"
      data-company-entry-notice
    >
      <p className="font-semibold text-slate-800">선택하신 상황</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="text-slate-400">{r.label}</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">|</span>
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
