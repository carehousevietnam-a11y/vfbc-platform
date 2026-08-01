"use client";

// admin/cases/[leadId]/page.tsx(Server Component)에서 렌더링되는 작은 클라이언트
// 아일랜드. 버튼 클릭 → 로딩상태 → fetch(Blob) → 자동 다운로드까지의 상호작용은
// 클라이언트 상태가 필요해 Server Component 안에 직접 넣을 수 없다. 이 파일
// 하나만 새로 추가했고, page.tsx는 이 컴포넌트를 import해서 렌더링하는 것 외에
// Server Component 성격을 그대로 유지한다.
//
// POST /api/admin/case-pdf(src/app/api/admin/case-pdf/route.ts)는 전혀 수정하지
// 않았다. 이 컴포넌트는 그 API를 호출만 한다.

import { useState } from "react";
import { FileText } from "lucide-react";

export default function ExecutivePdfButton({ leadId }: { leadId: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/case-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (!res.ok) {
        throw new Error("failed");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `vfbcai-admin-case-${leadId}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF 다운로드 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-[14px] font-bold text-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileText size={14} />
        {downloading ? "PDF 생성 중..." : "Executive PDF"}
      </button>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
