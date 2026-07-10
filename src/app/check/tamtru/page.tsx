"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Home as HomeIcon,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { saveLeadContact } from "@/lib/leadContact";

type Housing = "hotel" | "personal" | null;
type Choice = "self" | "agency" | null;
type Timing = "within12" | "within24" | "over24" | null;
type LinkGate = "ask" | "revealed" | "declined";

const TAMTRU_OFFICIAL_URL = "https://evisa.xuatnhapcanh.gov.vn/en_US/web/guest/home";

type FormState = {
  name: string;
  phone: string;
  address: string;
  email: string;
  kakaoId: string;
  zaloId: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  address: "",
  email: "",
  kakaoId: "",
  zaloId: "",
};

export default function TamTruCheckPage() {
  const [housing, setHousing] = useState<Housing>(null);
  const [landlordIssue, setLandlordIssue] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<Choice>(null);
  const [timing, setTiming] = useState<Timing>(null);

  const [selfLeadSubmitted, setSelfLeadSubmitted] = useState(false);
  const [selfLeadId, setSelfLeadId] = useState<string | null>(null);
  const [selfForm, setSelfForm] = useState<FormState>(EMPTY_FORM);
  const [linkGate, setLinkGate] = useState<LinkGate>("ask");

  const [agencyLeadSubmitted, setAgencyLeadSubmitted] = useState(false);
  const [agencyForm, setAgencyForm] = useState<FormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [emailProvided, setEmailProvided] = useState(false);

  const messengers = MESSENGERS_KO;
  const showLegalEscalation = landlordIssue === true;

  // 셀프 등록 정보를 이미 입력했다면, 대행 전환 시 재입력 없이 그대로 재사용
  const hasExistingContact = selfLeadSubmitted && !!selfLeadId;

  function reset() {
    setHousing(null);
    setLandlordIssue(null);
    setChoice(null);
    setTiming(null);
    setSelfLeadSubmitted(false);
    setSelfLeadId(null);
    setAgencyLeadSubmitted(false);
    setSelfForm(EMPTY_FORM);
    setAgencyForm(EMPTY_FORM);
    setSaveError(null);
    setEmailProvided(false);
    setLinkGate("ask");
  }

  async function insertLead(form: FormState, action: string, tag: string) {
    const leadId = crypto.randomUUID();
    const { error: leadError } = await supabase.from("leads").insert({
      id: leadId,
      name: form.name,
      phone: form.phone,
      address: form.address,
      email: form.email || null,
      kakao_id: form.kakaoId || null,
      zalo_id: form.zaloId || null,
      service_type: "tamtru",
      result: choice,
      source_page: "/check/tamtru",
    });

    if (leadError) {
      console.error("leads insert error:", leadError);
      throw leadError;
    }

    const { error: crmError } = await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action,
      tag,
    });
    if (crmError) console.error("crm_activities insert error:", crmError);

    // 계정은 이 호출 안에서 조용히, 완전히 생성/가입 완료된다 (사용자에게 노출 안 됨)
    try {
      const res = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("lead-submit API error:", errBody);
      }
    } catch (apiErr) {
      console.error("lead-submit fetch failed:", apiErr);
    }

    saveLeadContact({
      name: form.name,
      phone: form.phone,
      address: form.address,
      kakao_id: form.kakaoId,
      zalo_id: form.zaloId,
    });

    return leadId;
  }

  async function handleSelfLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const leadId = await insertLead(selfForm, "self_guide_request", "TAMTRU");
      setSelfLeadId(leadId);
      setEmailProvided(!!selfForm.email);
      setLinkGate("ask");
      setSelfLeadSubmitted(true);
    } catch {
      setSaveError("저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  // 이미 셀프 등록 정보가 있는 경우: 재입력 없이 기존 lead에 대행전환 활동만 기록
  async function handleAgencyQuickConfirm() {
    if (!selfLeadId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase.from("crm_activities").insert({
        lead_id: selfLeadId,
        action: "agency_upgrade_request",
        tag: "TAMTRU",
      });
      if (error) throw error;
      setAgencyLeadSubmitted(true);
    } catch {
      setSaveError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  // 처음부터 대행을 선택한 경우 (셀프 정보 없음): 신규 리드 생성
  async function handleAgencyLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await insertLead(agencyForm, "agency_request", "TAMTRU");
      setEmailProvided(!!agencyForm.email);
      setAgencyLeadSubmitted(true);
    } catch {
      setSaveError("저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="h-[3px] bg-blue-900" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> 홈으로
        </Link>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          직접확인하기 · 베트남 행정전문 AI
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          땀주 (임시거주등록) 확인
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          숙소 형태에 따라 등록 방법이 다릅니다. 몇 가지만 확인할게요.
        </p>

        {showLegalEscalation ? (
          <div className="mt-8 rounded-3xl bg-white border border-red-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ShieldAlert className="text-red-600" size={28} />
            <p className="mt-4 text-lg font-bold text-gray-900">
              법률긴급구조센터로 바로 연결이 필요합니다
            </p>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              집주인이 임시거주 등록을 거부하거나 금전을 요구하는 경우, 단순
              행정 문제가 아니라 분쟁·갈취 사안으로 다뤄야 합니다. VNK LAW
              전문 변호사가 직접 확인합니다.
            </p>
            <Link
              href="/consultation?case=tamtru-landlord-dispute"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              법률긴급구조센터 상담 신청
            </Link>
            <button
              onClick={reset}
              className="mt-3 block text-xs text-gray-400 hover:text-gray-600"
            >
              처음부터 다시 확인하기
            </button>
          </div>
        ) : (
          <>
            {!housing && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  1. 현재 숙소 형태가 어떻게 되시나요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setHousing("hotel")}
                    className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <Building className="text-blue-900" size={22} />
                    <p className="mt-3 text-sm font-bold text-gray-900">
                      호텔 · 게스트하우스
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      숙박업소에 머무는 경우
                    </p>
                  </button>
                  <button
                    onClick={() => setHousing("personal")}
                    className="flex flex-col items-start rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <HomeIcon className="text-blue-900" size={22} />
                    <p className="mt-3 text-sm font-bold text-gray-900">
                      개인주택 · 아파트 · 지인집
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      임대 또는 지인 거주
                    </p>
                  </button>
                </div>
              </div>
            )}

            {housing === "hotel" && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  등록 의무는 숙박업소에 있습니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  호텔·게스트하우스는 법적으로 투숙객의 임시거주 등록을 직접
                  처리해야 합니다. 프론트 데스크에서 처리 여부를 확인만
                  하시면 됩니다.
                </p>
                <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  체크인 시 여권을 제출하지 않으셨다면, 지금 프론트에
                  문의하세요.
                </div>
                <button
                  onClick={reset}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600"
                >
                  다른 숙소 형태로 다시 확인하기
                </button>
              </div>
            )}

            {housing === "personal" && !choice && landlordIssue === null && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  2. 집주인이 등록을 거부하거나 금전을 요구하시나요?
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLandlordIssue(true)}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-red-200 hover:-translate-y-0.5 transition-all"
                  >
                    네, 그렇습니다
                  </button>
                  <button
                    onClick={() => setLandlordIssue(false)}
                    className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                  >
                    아니요
                  </button>
                </div>
              </div>
            )}

            {housing === "personal" && landlordIssue === false && !choice && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  3. 어떻게 진행하시겠어요?
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setChoice("self")}
                    className="rounded-2xl bg-white border border-gray-100 p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-sm font-bold text-gray-900">
                      셀프로 직접 등록
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      관할 사이트 링크와 가이드를 무료로 안내해드립니다
                    </p>
                  </button>
                  <button
                    onClick={() => setChoice("agency")}
                    className="rounded-2xl bg-blue-900 p-5 text-left text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-blue-950 hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-sm font-bold">VFBC가 대행</p>
                    <p className="mt-1 text-xs text-blue-100">
                      서류 준비부터 접수까지 전문가가 처리 ($20~50)
                    </p>
                  </button>
                </div>
              </div>
            )}

            {choice && !timing && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-900">
                  4. 베트남에 도착(또는 숙소 이동)하신 지 얼마나 되셨나요?
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { key: "within12", label: "12시간 이내" },
                    { key: "within24", label: "12~24시간" },
                    { key: "over24", label: "24시간 초과" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setTiming(opt.key as Timing)}
                      className="rounded-2xl bg-white border border-gray-100 p-4 text-sm font-semibold text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 셀프 등록: 링크 노출 전 리드 정보 수집 */}
            {choice === "self" && timing && !selfLeadSubmitted && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {timing === "over24" && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    신고 기한(12~24시간)이 이미 지났을 수 있습니다. 서둘러
                    등록을 진행하세요.
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">
                  관할 신고 사이트 안내받기
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  이름·연락처만 남기면 30초 안에 내 지역 신고 사이트를
                  보내드려요. 등록 중 막히면 바로 대행 전환도 가능합니다.
                </p>

                <form onSubmit={handleSelfLeadSubmit} className="mt-5 space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="이름"
                    value={selfForm.name}
                    onChange={(e) => setSelfForm({ ...selfForm, name: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="전화번호"
                    value={selfForm.phone}
                    onChange={(e) => setSelfForm({ ...selfForm, phone: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                    value={selfForm.address}
                    onChange={(e) => setSelfForm({ ...selfForm, address: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 -mt-1">
                    주소가 있어야 관할 phường(동) 사이트를 정확히 찾아드릴 수 있어요.
                  </p>
                  <input
                    type="email"
                    placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
                    value={selfForm.email}
                    onChange={(e) => setSelfForm({ ...selfForm, email: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={`${messengers.primary.label} ID (선택)`}
                      value={selfForm.kakaoId}
                      onChange={(e) => setSelfForm({ ...selfForm, kakaoId: e.target.value })}
                      className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder={`${messengers.secondary.label} ID (선택)`}
                      value={selfForm.zaloId}
                      onChange={(e) => setSelfForm({ ...selfForm, zaloId: e.target.value })}
                      className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors disabled:opacity-60"
                  >
                    {saving ? "저장 중..." : "30초 안에 내 지역 사이트 받기"}
                  </button>
                </form>
                <p className="mt-3 text-[11px] text-gray-400">
                  입력하신 정보는 상담 안내 목적으로만 사용되며, 등록 진행에
                  문제가 생기면 담당자가 먼저 연락드릴 수 있습니다.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}

            {/* 셀프 등록: 정보 제출 완료 — 사이트 이동 전 후킹 Y/N */}
            {choice === "self" && timing && selfLeadSubmitted && linkGate !== "revealed" && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <Sparkles className="text-blue-900" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  {timing === "over24"
                    ? "지금 이동하지 않으면 신고 기한을 놓칠 수 있어요"
                    : "관할 사이트로 바로 이동해서 등록을 시작할까요?"}
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  이동 후에도 입력하신 정보는 자동으로 저장되어 언제든 다시
                  확인하실 수 있어요. 지금 이용하시면 비자·노동허가·거주증
                  만료 임박 알림과 베트남 법률 최신 뉴스까지 무료로
                  받아보실 수 있습니다.
                </p>

                {linkGate === "declined" && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                    준비되시면 아래 버튼을 다시 눌러 이동하실 수 있어요.
                  </p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setLinkGate("revealed")}
                    className="flex-1 h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors"
                  >
                    네, 사이트로 이동할게요
                  </button>
                  <button
                    onClick={() => setLinkGate("declined")}
                    className="h-12 px-5 rounded-full border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    나중에 할게요
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}

            {/* 셀프 등록: 이동 확정 후 가이드 + 링크 노출 */}
            {choice === "self" && timing && selfLeadSubmitted && linkGate === "revealed" && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  셀프 등록 가이드
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  관할 phường(동) 공안 온라인 신고 사이트에서 무료로 직접
                  등록하실 수 있습니다. 여권 정보, 임대계약서, 집주인 정보가
                  필요합니다.
                </p>
                <a
                  href={TAMTRU_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 hover:underline"
                >
                  관할 지역 신고 사이트 바로가기 <ExternalLink size={14} />
                </a>
                <p className="mt-2 text-[11px] text-gray-400">
                  베트남 출입국관리국 공식 사이트로 이동합니다. 상단 언어를
                  영어로 전환 후 &quot;Declare temporary residence for
                  foreigners&quot; 항목을 이용하세요.
                </p>
                {emailProvided && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    입력하신 이메일로도 안내 링크를 보내드렸어요.
                  </p>
                )}
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-500">
                    혼자 진행하기 어렵거나 진행 중 막히면 언제든 대행으로
                    전환할 수 있습니다.
                  </p>
                  <button
                    onClick={() => setChoice("agency")}
                    className="mt-3 text-xs font-semibold text-blue-900 hover:underline"
                  >
                    대신 VFBC 대행 신청하기 →
                  </button>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}

            {/* 대행: 이미 셀프 정보가 있는 경우 → 재입력 없이 원클릭 전환 */}
            {choice === "agency" && timing && hasExistingContact && !agencyLeadSubmitted && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {timing === "over24" && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    신고 기한이 이미 지났을 가능성이 높습니다. 지금 접수하면
                    가장 빠르게 처리해드릴 수 있어요.
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">
                  정보 다시 입력하지 않아도 됩니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  방금 남겨주신 이름·연락처·주소 그대로 대행 접수가
                  진행됩니다. 셀프로 계속 진행하다 시간만 흘러 벌금 위험이
                  커지는 것보다, 지금 바로 전문가에게 맡기는 게 가장
                  안전합니다.
                </p>
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-900">
                  {selfForm.name} · {selfForm.phone}
                </div>
                {saveError && <p className="mt-3 text-xs text-red-600">{saveError}</p>}
                <button
                  onClick={handleAgencyQuickConfirm}
                  disabled={saving}
                  className="mt-5 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors disabled:opacity-60"
                >
                  {saving ? "접수 중..." : "대행 신청하기"}
                </button>
                <button
                  onClick={() => setChoice("self")}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  셀프 등록으로 돌아가기
                </button>
              </div>
            )}

            {/* 대행: 셀프 정보 없이 바로 선택한 경우 → 신규 입력 */}
            {choice === "agency" && timing && !hasExistingContact && !agencyLeadSubmitted && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                {timing === "over24" && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">
                    <Clock size={16} className="mt-0.5 shrink-0" />
                    신고 기한이 지났을 가능성이 높습니다. 빠른 처리가
                    필요합니다.
                  </div>
                )}
                <p className="text-lg font-bold text-gray-900">
                  VFBC 땀주 등록 대행
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-900">
                  예상 비용은 문자로 보내드리겠습니다
                </p>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  여권, 임대계약서만 보내주시면 관할 사이트 신고부터 완료
                  확인까지 대신 처리해드립니다.
                </p>

                <form onSubmit={handleAgencyLeadSubmit} className="mt-5 space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="이름"
                    value={agencyForm.name}
                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="전화번호"
                    value={agencyForm.phone}
                    onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                    value={agencyForm.address}
                    onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="이메일 (선택 — 결과를 이메일로도 받아보세요)"
                    value={agencyForm.email}
                    onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={`${messengers.primary.label} ID (선택)`}
                      value={agencyForm.kakaoId}
                      onChange={(e) => setAgencyForm({ ...agencyForm, kakaoId: e.target.value })}
                      className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder={`${messengers.secondary.label} ID (선택)`}
                      value={agencyForm.zaloId}
                      onChange={(e) => setAgencyForm({ ...agencyForm, zaloId: e.target.value })}
                      className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 transition-colors disabled:opacity-60"
                  >
                    {saving ? "저장 중..." : "대행 신청하기"}
                  </button>
                </form>
                <p className="mt-3 text-[11px] text-gray-400">
                  입력하신 정보는 상담 안내 목적으로만 사용됩니다.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}

            {/* 대행: 접수 완료 (양쪽 경로 공통, 상담 중간단계 없이 바로 종료) */}
            {choice === "agency" && timing && agencyLeadSubmitted && (
              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CheckCircle2 className="text-emerald-600" size={28} />
                <p className="mt-4 text-lg font-bold text-gray-900">
                  대행 신청이 완료되었습니다
                </p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  담당자가 서류를 확인한 뒤 {messengers.primary.label} 또는{" "}
                  {messengers.secondary.label}로 예상 비용과 진행 절차를
                  안내드립니다. 별도로 상담을 신청하지 않으셔도 됩니다.
                </p>
                {emailProvided && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    메시지가 오지 않으면 알려주세요 — 이메일도 확인해주세요.
                  </p>
                )}
                <button
                  onClick={reset}
                  className="mt-6 block text-xs text-gray-400 hover:text-gray-600"
                >
                  처음부터 다시 확인하기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
