"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OfficialSourceEntry } from "@/lib/costCheck";
import { getLeadContact } from "@/lib/leadContact";
import { resolveWpRegionFromText, type WpRegionKey } from "@/lib/resolveWpRegion";
import { supabase } from "@/lib/supabase";
import { OfficialSourceList } from "@/components/cost-check/OfficialSourceList";

type RegionSource = "question" | "session" | "profile";

type WpRegionalOfficialFeeProps = {
  sources?: OfficialSourceEntry[];
  question?: string;
};

function filterSourcesByRegion(
  sources: OfficialSourceEntry[],
  region: WpRegionKey
): OfficialSourceEntry[] {
  return sources.filter((entry) => entry.region === region);
}

function regionContextLabel(source: RegionSource): string {
  if (source === "question") return "질문에 포함된 지역";
  return "회원님의 신청 지역";
}

export function WpRegionalOfficialFee({ sources, question }: WpRegionalOfficialFeeProps) {
  const [profileAddress, setProfileAddress] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        if (!cancelled) setProfileChecked(true);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("address")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setProfileAddress(profile?.address?.trim() || null);
        setProfileChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const resolution = useMemo(() => {
    const fromQuestion = question ? resolveWpRegionFromText(question) : null;
    if (fromQuestion) {
      return { region: fromQuestion, source: "question" as const };
    }

    const sessionAddress = getLeadContact()?.address;
    const fromSession = sessionAddress ? resolveWpRegionFromText(sessionAddress) : null;
    if (fromSession) {
      return { region: fromSession, source: "session" as const };
    }

    const fromProfile = profileAddress ? resolveWpRegionFromText(profileAddress) : null;
    if (fromProfile) {
      return { region: fromProfile, source: "profile" as const };
    }

    return { region: null, source: null };
  }, [question, profileAddress]);

  if (!sources || sources.length === 0) return null;

  if (!profileChecked && !resolution.region) {
    return null;
  }

  if (!resolution.region) {
    return (
      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          ※ 정부 공식 수수료는 신청 지역에 따라 달라질 수 있습니다.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">
            내 지역의 정확한 정부 비용을 확인하고 싶으신가요?
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            회원가입 시 입력한 주소를 기준으로 관할 지역을 확인하여 현재 적용되는 정부 공식
            비용을 안내해드립니다.
          </p>
          <Link
            href="/mypage"
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            내 정보 확인
          </Link>
        </div>
      </div>
    );
  }

  const filtered = filterSourcesByRegion(sources, resolution.region);
  if (filtered.length === 0) {
    return (
      <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          ※ 정부 공식 수수료는 신청 지역에 따라 달라질 수 있습니다.
        </p>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-900">
            확인된 지역({resolution.region})에 대한 공식 수수료 자료가 아직 준비되지
            않았습니다.
          </p>
          <Link
            href="/mypage"
            className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline hover:text-slate-900"
          >
            내 정보 확인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <OfficialSourceList
      sources={filtered}
      regionLabel={`${regionContextLabel(resolution.source!)}: ${resolution.region}`}
    />
  );
}
