"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, MessageSquare, CheckCircle2, Pencil } from "lucide-react";
import { MESSENGERS_KO } from "@/lib/messenger";
import { supabase } from "@/lib/supabase";
import { getLeadContact, saveLeadContact, LeadContact } from "@/lib/leadContact";

const CASE_LABELS: Record<string, string> = {
  "tamtru-landlord-dispute": "땀주 · 집주인 분쟁",
  "tamtru-agency": "땀주 · 대행 신청",
  "trc-application": "거주증(TRC) 신청",
  "trc-conditional": "거주증(TRC) 조건 확인",
  "wp-application": "노동허가(WP) 신청",
  "wp-conditional": "노동허가(WP) 보완 확인",
  "wp-impossible": "노동허가(WP) 대안 상담",
  "driving-license": "운전면허 전환",
  "driving-license-new": "운전면허 신규 취득",
};

function maskPhone(phone: string) {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4);
}

function ConsultationForm() {
  const params = useSearchParams();
  const caseKey = params.get("case");
  const caseLabel =
    (caseKey &&
      (CASE_LABELS[caseKey] ||
        (caseKey.startsWith("register-")
          ? "인허가 상담"
          : caseKey.startsWith("verify-")
          ? "문서 검토 상담"
          : null))) ||
    null;

  const [contact, setContact] = useState<LeadContact | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [useManualForm, setUseManualForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const messengers = MESSENGERS_KO;

  useEffect(() => {
    async function loadContact() {
      // 1순위: 같은 세션 내 방금 남긴 정보(sessionStorage)
      const stored = getLeadContact();
      if (stored) {
        setContact(stored);
        setCheckedStorage(true);
        return;
      }

      // 2순위: 로그인된 계정이면 프로필에서 자동으로 가져오기
      // (이메일 링크로 비밀번호 설정 후 들어온 경우 등, sessionStorage가 비어있는 상황 대응)
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("name, phone, address, kakao_id, zalo_id")
          .eq("id", user.id)
          .single();

        if (profile && profile.name && profile.phone) {
          setContact({
            name: profile.name,
            phone: profile.phone,
            address: profile.address || "",
            kakao_id: profile.kakao_id || null,
            zalo_id: profile.zalo_id || null,
          });
          setLoggedInUserId(user.id);
        }
      }

      setCheckedStorage(true);
    }

    loadContact();
  }, []);

  async function insertConsultation(data: LeadContact) {
    setSubmitting(true);
    setError(null);
    const leadId = crypto.randomUUID();

    const { error: err } = await supabase.from("leads").insert({
      id: leadId,
      name: data.name,
      phone: data.phone,
      address: data.address,
      kakao_id: data.kakao_id || null,
      zalo_id: data.zalo_id || null,
      service_type: "consultation",
      result: caseKey || null,
      source_page: "/consultation",
      user_id: loggedInUserId,
    });

    if (err) {
      console.error(err);
      setError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }

    await supabase.from("crm_activities").insert({
      lead_id: leadId,
      action: "consultation_request",
      tag: "CONSULTATION",
    });

    saveLeadContact(data);
    setSubmitting(false);
    setSubmitted(true);
  }

  function handleQuickConfirm() {
    if (!contact) return;
    insertConsultation(contact);
  }

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: LeadContact = {
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      kakao_id: (fd.get("kakao_id") as string) || null,
      zalo_id: (fd.get("zalo_id") as string) || null,
    };
    insertConsultation(data);
  }

  const showQuickConfirm = checkedStorage && contact && !useManualForm && !submitted;
  const showManualForm = checkedStorage && (!contact || useManualForm) && !submitted;

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
          VFBC · 상담신청
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          전문가 상담 신청
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {caseLabel
            ? `${caseLabel} 관련해서 담당자가 직접 확인해드립니다.`
            : "이름·연락처만 남기면 담당자가 직접 연락드립니다."}
        </p>

        <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {/* 이미 남겨주신 정보(또는 로그인된 계정 정보)가 있는 경우 - 바로 확인만 */}
          {showQuickConfirm && contact && (
            <>
              <MessageSquare className="text-blue-900" size={28} />
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {loggedInUserId
                  ? "가입하신 계정 정보로 바로 상담 신청할까요?"
                  : "조금 전 남겨주신 정보로 바로 상담 신청할까요?"}
              </p>
              <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 space-y-1">
                <p>{contact.name}</p>
                <p>{maskPhone(contact.phone)}</p>
                <p className="text-gray-500">{contact.address}</p>
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <button
                onClick={handleQuickConfirm}
                disabled={submitting}
                className="mt-5 w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
              >
                {submitting ? "접수 중..." : "네, 이 정보로 신청하기"}
              </button>
              <button
                onClick={() => setUseManualForm(true)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                <Pencil size={12} /> 다른 정보로 입력할게요
              </button>
            </>
          )}

          {/* 저장된 정보 없거나, 직접 입력 선택한 경우 */}
          {showManualForm && (
            <>
              <MessageSquare className="text-blue-900" size={28} />
              <form onSubmit={handleManualSubmit} className="mt-5 space-y-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="이름"
                  defaultValue={contact?.name || ""}
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="전화번호"
                  defaultValue={contact?.phone || ""}
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="현재 거주지 주소 (예: Quận 1, TP.HCM)"
                  defaultValue={contact?.address || ""}
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                />
                <textarea
                  name="message"
                  placeholder="상담 내용 (선택)"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-900 focus:outline-none resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="kakao_id"
                    placeholder={`${messengers.primary.label} ID (선택)`}
                    defaultValue={contact?.kakao_id || ""}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    name="zalo_id"
                    placeholder={`${messengers.secondary.label} ID (선택)`}
                    defaultValue={contact?.zalo_id || ""}
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm focus:border-blue-900 focus:outline-none"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-blue-900 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60 transition-colors"
                >
                  {submitting ? "접수 중..." : "상담 신청하기"}
                </button>
              </form>
              <p className="mt-3 text-[11px] text-gray-400">
                입력하신 정보는 상담 안내 목적으로만 사용됩니다.
              </p>
            </>
          )}

          {submitted && (
            <div>
              <CheckCircle2 className="text-emerald-600" size={28} />
              <p className="mt-4 text-lg font-bold text-gray-900">
                상담 신청이 접수되었습니다
              </p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                담당자가 {messengers.primary.label} 또는 {messengers.secondary.label}
                로 곧 연락드립니다. 메시지가 오지 않으면 알려주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={null}>
      <ConsultationForm />
    </Suspense>
  );
}
