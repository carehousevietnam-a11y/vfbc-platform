"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RefreshCw, Search } from "lucide-react";

type Lead = {
  id: string;
  display_id: string | null;
  created_at: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  kakao_id: string | null;
  zalo_id: string | null;
  service_type: string | null;
  result: string | null;
  source_page: string | null;
  status: string | null;
};

type CategoryKey = "all" | "check" | "verify" | "register" | "consultation";

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "check", label: "직접확인하기 (CHECK)" },
  { key: "verify", label: "직접검토하기 (VERIFY)" },
  { key: "register", label: "직접허가받기 (REGISTER)" },
  { key: "consultation", label: "상담" },
];

// admin/cases와 동일한 분류 원칙 사용:
// permit_ / register_ 접두사 → register, verify_ 접두사 → verify,
// consultation은 정확히 일치, 나머지(WP/TRC/땀주/운전면허 등)는 check
function getCategory(serviceType: string | null): CategoryKey {
  if (!serviceType) return "all";
  if (serviceType.startsWith("permit_")) return "register";
  if (serviceType.startsWith("register_")) return "register";
  if (serviceType.startsWith("verify_")) return "verify";
  if (serviceType === "consultation") return "consultation";
  return "check"; // tamtru, trc, wp, driving-license 등
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesTab = tab === "all" || getCategory(lead.service_type) === tab;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        lead.name?.toLowerCase().includes(q) ||
        lead.phone?.toLowerCase().includes(q) ||
        lead.display_id?.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [leads, tab, query]);

  const counts = useMemo(() => {
    const map: Record<CategoryKey, number> = {
      all: leads.length,
      check: 0,
      verify: 0,
      register: 0,
      consultation: 0,
    };
    leads.forEach((lead) => {
      map[getCategory(lead.service_type)] += 1;
    });
    return map;
  }, [leads]);

  function goToDetail(id: string) {
    router.push(`/admin/leads/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          VFBCAI ADMIN
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            리드 관리
          </h1>
          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>

        {/* 탭 */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                tab === t.key
                  ? "bg-blue-900 text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "bg-white text-gray-500 border border-gray-100 hover:-translate-y-0.5"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 ${tab === t.key ? "text-blue-200" : "text-gray-400"}`}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="mt-4 relative max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 전화번호, ID로 검색"
            className="w-full h-10 rounded-full border border-gray-200 bg-white pl-9 pr-4 text-sm focus:border-blue-900 focus:outline-none"
          />
        </div>

        {/* 리스트 */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">일시</th>
                <th className="px-5 py-3 font-semibold">이름</th>
                <th className="px-5 py-3 font-semibold">전화번호</th>
                <th className="px-5 py-3 font-semibold">서비스</th>
                <th className="px-5 py-3 font-semibold">결과</th>
                <th className="px-5 py-3 font-semibold">경로</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-gray-400">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-gray-400">
                    데이터가 없습니다
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => goToDetail(lead.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToDetail(lead.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${lead.name || "이름 없음"} 리드 상세보기`}
                    className="cursor-pointer border-b border-gray-50 last:border-0 outline-none transition-colors hover:bg-gray-50/60 focus-visible:bg-blue-50/60 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-900"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-blue-900">
                      {lead.display_id ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {lead.name || "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lead.phone || "-"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                        {lead.service_type || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lead.result || "-"}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {lead.source_page || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
