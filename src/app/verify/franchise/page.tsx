"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import {
  MasterFunnelLanding,
  type MasterFunnelContextTab,
  type MasterLandingConfig,
} from "@/components/cost-check/MasterFunnelLanding";
import { getVerifyFormFunnelHeaderAlignProps } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  resolveLanguage,
  validateLeadForm,
  buildSocialContacts,
  type FieldErrors,
  type SupportedLanguage,
} from "@/lib/customerRegistrationValidation";
import { MESSENGERS_BY_LANGUAGE } from "@/lib/messenger";
import { saveLeadContact } from "@/lib/leadContact";
import { recordAiReportRequestAndNotify } from "@/lib/aiReportRequest";
import { parseExplicitMasterFunnelTab } from "@/lib/masterFunnelEntry";
import {
  ensureBrowserSessionForResultToken,
  establishBrowserSessionFromResultToken,
  navigateToMypageWithResultToken,
  isLoggedInMember,
} from "@/lib/restoreCheckLead";
import {
  awaitMemberVerifyLeadInsert,
  insertMemberVerifyLead,
  loadVerifyMemberEntryState,
  type RestoredVerifyLead,
} from "@/lib/restoreVerifyLead";
import { shouldAllowVerifyMemberRestoreOnMount } from "@/lib/verifyMemberRestorePolicy";
import { supabase } from "@/lib/supabase";
import { submitLeadIntake } from "@/lib/leadIntakeClient";
import { persistAdminVerifyLeadMeta } from "@/lib/persistAdminVerifyLeadMeta";
import {
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY,
  ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY,
  ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_ANSWERS_KEY,
  ADMIN_PROFILING_COMPLETE_META_FLAG,
  ADMIN_RESTORED_PROFILE_PHASE_KEY,
  type AdminVerifyProfilePhase,
} from "@/lib/adminVerifyProfiling";
import {
  buildFranchiseExpertHandoffMeta,
  buildFranchiseMemberVerifyMeta,
  buildFranchisePhase2PersistMeta,
  createFranchiseVerifyMasterPackBridge,
  resolveFranchiseCaseFromAnswers,
  restoreFranchiseAnswersFromVerifyMeta,
} from "@/lib/contentPacks/franchise/franchisePack";
import {
  buildPhase2DocumentsHandoffUrl,
  clearPhase2HandoffSnapshot,
  getVerifyPhase2HandoffConfig,
  readPhase2HandoffSnapshot,
  writePhase2HandoffSnapshot,
} from "@/lib/verifyMasterPhase2Handoff";
import RealEstateVerifyLeadCapture from "../real-estate/RealEstateVerifyLeadCapture";

const FRANCHISE_LANDING: MasterLandingConfig = {
  engine: "verify",
  serviceLabel: "프랜차이즈 등록 직접 인허가 받기",
  shortServiceLabel: "프랜차이즈 등록 직접 인허가 받기",
  costServiceId: "franchise",
  specialtyLine: "베트남 법률전문 AI",
  hookTitle: "프랜차이즈 등록, 지금 내 브랜드에 무엇이 필요한지 먼저 정리해 보세요.",
  hookBody: "브랜드 출처와 운영 이력, 가맹계약서와 상표, 가맹 소개서를 나누어 준비할 일을 안내합니다.",
  persuasionHeadline: "상황을 나누어 보면 필요한 서류와 순서가 보입니다.",
  reviewTitle: "확인 항목 안내",
  reviewIntro: "사업자 등록, 운영 이력, 계약서와 상표, 가맹 소개서를 나누어 확인합니다.",
  reviewChecks: [
    { title: "브랜드와 이력", body: "해외 브랜드인지와 직영 운영 이력을 살펴봅니다." },
    { title: "계약서와 상표", body: "가맹계약서, 운영 매뉴얼, 베트남 상표 등록을 살펴봅니다." },
    { title: "등록과 모집", body: "가맹 소개서, 등록 기관, 모집 시기를 살펴봅니다." },
  ],
  reviewNeeds: [
    { title: "자료", items: ["본사 사업자 서류", "상표 서류", "가맹계약서"] },
    { title: "소개", items: ["가맹 소개서", "운영 매뉴얼"] },
    { title: "일정", items: ["등록 목표일", "모집 시작일"] },
  ],
  reviewRecommendation: "허가 가능 여부는 답변만으로 정하지 않습니다. 가진 자료와 함께 확인할 사항을 안내합니다.",
  guideTitle: "확인 방법",
  guideIntro: "질문에 답한 뒤 1차 결과를 확인하고, 필요하면 추가 질문과 자료 확인으로 이어갑니다.",
  guideItems: [
    { title: "상황", body: "브랜드 출처와 운영 이력, 계약서와 상표를 확인합니다." },
    { title: "자료", body: "지금 가진 서류와 부족한 서류를 구분합니다." },
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "공공 절차 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
};

const VERIFY_SERVICE_TYPE = "verify_franchise" as const;
/** 2차 개인화 결과 패널. Admin은 자료 화면에서 /mypage로 가므로 호출하지 않는다. */
const FRANCHISE_PHASE2_PERSONALIZED_PANEL: boolean = false;
const MEMBER_VERIFY_LEAD_TIMEOUT_MS = 45_000;
const PHASE1_ATTACH_STORAGE_FAIL_MESSAGE = "첨부 저장 실패, 다시 시도";

async function uploadFranchisePhase1Evidence(
  leadId: string,
  evidenceFile: File,
): Promise<{ ok: true; storagePath: string } | { ok: false }> {
  const rawExt = evidenceFile.name.split(".").pop() || "";
  const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `verify-franchise/${leadId}.${safeExt}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(path, evidenceFile);
  if (uploadError) {
    console.error(uploadError);
    return { ok: false };
  }
  return { ok: true, storagePath: path };
}

export default function FranchiseVerifyMasterPage() {
  const searchParams = useSearchParams();
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>(
    () => parseExplicitMasterFunnelTab(searchParams.get("tab")) ?? "review",
  );
  const [skipSignup, setSkipSignup] = useState(false);
  const [adminMasterSignupComplete, setAdminMasterSignupComplete] = useState(false);
  const [adminMasterSignupPending, setAdminMasterSignupPending] = useState(false);
  const [adminVerifyPhase1EvidenceComplete, setAdminVerifyPhase1EvidenceComplete] = useState(false);
  const [adminVerifyPhase2UploadComplete, setAdminVerifyPhase2UploadComplete] = useState(false);
  const [adminVerifyPhase2DocumentsAnyUploaded, setAdminVerifyPhase2DocumentsAnyUploaded] =
    useState(false);
  const [signupRiskLevel, setSignupRiskLevel] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [signupFieldErrors, setSignupFieldErrors] = useState<FieldErrors>({});
  const [signupConsentOpen, setSignupConsentOpen] = useState(false);
  const [aiReportRequesting, setAiReportRequesting] = useState(false);
  const [aiSummaryNavigating, setAiSummaryNavigating] = useState(false);
  const [expertRequesting, setExpertRequesting] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [phase1AttachStorageFailed, setPhase1AttachStorageFailed] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [profilingSeedAnswers, setProfilingSeedAnswers] = useState<Record<string, string>>({});
  const memberSubmitStartedRef = useRef(false);
  const pendingMemberLeadIdRef = useRef<string | null>(null);
  const phase1AnswersRef = useRef<Record<string, string> | null>(null);
  const phase1EvidenceFileRef = useRef<File | null>(null);
  const profilingAnswersRef = useRef<Record<string, string> | null>(null);
  const verifyMasterPackBridge = useMemo(() => createFranchiseVerifyMasterPackBridge(), []);

  const lang = useMemo<SupportedLanguage>(
    () => resolveLanguage(searchParams.get("lang")),
    [searchParams],
  );
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  const applyRestoredVerify = useCallback((restored: RestoredVerifyLead) => {
    const meta = restored.verifyMeta;
    if (meta) {
      const restoredAnswers = restoreFranchiseAnswersFromVerifyMeta(meta);
      if (restoredAnswers && Object.keys(restoredAnswers).length > 0) {
        setProfilingSeedAnswers(restoredAnswers);
      }
      if (meta[ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_META_KEY] === "1") {
        setAdminVerifyPhase2UploadComplete(true);
      }
      if (meta[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_META_KEY] === "1") {
        setAdminVerifyPhase2DocumentsAnyUploaded(true);
      }
    }
    setLeadId(restored.leadId);
    setResultToken(restored.resultToken);
    setAdminMasterSignupComplete(true);
    setAdminMasterSignupPending(false);
    if (typeof meta?.storagePath === "string" || typeof meta?.file_name === "string") {
      setAdminVerifyPhase1EvidenceComplete(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initMemberState() {
      const allowRestore = shouldAllowVerifyMemberRestoreOnMount(window.location.search);
      const { loggedIn, restored } = await loadVerifyMemberEntryState(VERIFY_SERVICE_TYPE, {
        allowRestore,
      });
      if (!cancelled && loggedIn) setSkipSignup(true);
      if (!cancelled && restored) applyRestoredVerify(restored);
    }
    void initMemberState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN") return;
      void isLoggedInMember().then((loggedIn) => {
        if (!cancelled && loggedIn) setSkipSignup(true);
      });
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applyRestoredVerify]);

  useEffect(() => {
    if (!FRANCHISE_PHASE2_PERSONALIZED_PANEL) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("phase2_upload_return") !== "1") return;
    setAdminVerifyPhase2UploadComplete(true);
    setAdminMasterSignupComplete(true);
    const snapshot = readPhase2HandoffSnapshot(VERIFY_SERVICE_TYPE);
    if (snapshot?.answers && Object.keys(snapshot.answers).length > 0) {
      setProfilingSeedAnswers(snapshot.answers);
    }
    if (snapshot?.leadId) setLeadId(snapshot.leadId);
    if (snapshot?.resultToken) setResultToken(snapshot.resultToken);
    if (snapshot?.anyUploaded) setAdminVerifyPhase2DocumentsAnyUploaded(true);
    clearPhase2HandoffSnapshot(VERIFY_SERVICE_TYPE);
    const cfg = getVerifyPhase2HandoffConfig(VERIFY_SERVICE_TYPE);
    if (cfg) window.history.replaceState({}, "", cfg.verifyReturnPath);
  }, []);


  useEffect(() => {
    if (!skipSignup || adminMasterSignupComplete || !submitting) return;
    const timer = window.setTimeout(() => {
      if (!memberSubmitStartedRef.current) return;
      memberSubmitStartedRef.current = false;
      setSkipSignup(false);
      setAdminMasterSignupPending(true);
      setHandoffError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSubmitting(false);
    }, MEMBER_VERIFY_LEAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [skipSignup, submitting, adminMasterSignupComplete]);

  const verifyMasterSeedAnswers = useMemo(() => {
    if (Object.keys(profilingSeedAnswers).length === 0 && !adminVerifyPhase2UploadComplete) {
      return undefined;
    }
    return {
      ...profilingSeedAnswers,
      ...(adminVerifyPhase2UploadComplete
        ? {
            [ADMIN_RESTORED_PROFILE_PHASE_KEY]: "2",
            [ADMIN_PROFILING_COMPLETE_META_FLAG]: "1",
            [ADMIN_PHASE2_DOCUMENTS_UPLOAD_COMPLETE_ANSWERS_KEY]: "1",
            ...(adminVerifyPhase2DocumentsAnyUploaded
              ? { [ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY]: "1" }
              : {}),
          }
        : {}),
    };
  }, [profilingSeedAnswers, adminVerifyPhase2UploadComplete, adminVerifyPhase2DocumentsAnyUploaded]);

  const submitAsMember = useCallback(
    async (answers: Record<string, string>, evidenceFile?: File | null) => {
      if (memberSubmitStartedRef.current) return;
      memberSubmitStartedRef.current = true;
      setSubmitting(true);
      setHandoffError(null);
      const releaseMemberHandoffToSignupRetry = (errorMessage?: string | null) => {
        memberSubmitStartedRef.current = false;
        setSkipSignup(false);
        setAdminMasterSignupPending(true);
        setSignupRiskLevel(verifyMasterPackBridge.getSignupRiskLevel(answers));
        setHandoffError(errorMessage ?? null);
        setSubmitting(false);
      };
      try {
        const newLeadId = crypto.randomUUID();
        pendingMemberLeadIdRef.current = newLeadId;
        let storagePath: string | null = null;
        let fileName: string | undefined;
        if (evidenceFile && evidenceFile.size > 0) {
          const uploaded = await uploadFranchisePhase1Evidence(newLeadId, evidenceFile);
          if (uploaded.ok) {
            storagePath = uploaded.storagePath;
            fileName = evidenceFile.name;
            setPhase1AttachStorageFailed(false);
          } else {
            setPhase1AttachStorageFailed(true);
          }
        }
        const verifyMeta = buildFranchiseMemberVerifyMeta(
          answers,
          storagePath && fileName ? { storagePath, file_name: fileName } : null,
        );
        const created = await awaitMemberVerifyLeadInsert(
          insertMemberVerifyLead({
            serviceType: VERIFY_SERVICE_TYPE,
            sourcePage: "/verify/franchise",
            tag: "VERIFY_FRAUD",
            verifyMeta,
            lang,
            primaryMessengerKey: messengers.primary.key,
            secondaryMessengerKey: messengers.secondary.key,
            leadId: newLeadId,
          }),
        );
        if (!created.ok) {
          releaseMemberHandoffToSignupRetry(
            created.reason === "no_contact"
              ? null
              : "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          );
          return;
        }
        setLeadId(created.leadId);
        setResultToken(created.resultToken);
        setProfilingSeedAnswers(answers);
        setAdminMasterSignupComplete(true);
        setAdminMasterSignupPending(false);
        setSubmitting(false);
      } catch (err) {
        console.error(err);
        releaseMemberHandoffToSignupRetry(
          err instanceof Error && err.message === "insertMemberVerifyLead_timeout"
            ? "접수가 지연되고 있습니다. 잠시 후 다시 시도해주세요."
            : "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    },
    [lang, messengers.primary.key, messengers.secondary.key, verifyMasterPackBridge],
  );

  const handleLandingContinue = useCallback(async () => {
    const { loggedIn, restored } = await loadVerifyMemberEntryState(VERIFY_SERVICE_TYPE, {
      allowRestore: true,
    });
    if (loggedIn) setSkipSignup(true);
    if (restored) applyRestoredVerify(restored);
  }, [applyRestoredVerify]);

  const handleSignupSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      const fd = new FormData(e.currentTarget);
      if (fd.get("agreeTerms") !== "on") {
        setSignupConsentOpen(true);
        return;
      }
      const answers = phase1AnswersRef.current;
      if (!answers) return;
      setSubmitting(true);
      setHandoffError(null);
      const newLeadId = crypto.randomUUID();
      const name = String(fd.get("name") || "");
      const phone = String(fd.get("phone") || "");
      const address = String(fd.get("address") || "");
      const email = (fd.get("email") as string) || "";
      const kakaoId = (fd.get("kakao_id") as string) || null;
      const zaloId = (fd.get("zalo_id") as string) || null;
      const { valid, errors } = validateLeadForm(
        { name, phone, address, email, kakao_id: kakaoId, zalo_id: zaloId },
        lang,
      );
      if (!valid) {
        setSignupFieldErrors(errors);
        setHandoffError(Object.values(errors)[0] || null);
        setSubmitting(false);
        return;
      }
      setSignupFieldErrors({});
      let storagePath: string | null = null;
      const evidenceFile = phase1EvidenceFileRef.current;
      if (evidenceFile && evidenceFile.size > 0) {
        const uploaded = await uploadFranchisePhase1Evidence(newLeadId, evidenceFile);
        if (uploaded.ok) {
          storagePath = uploaded.storagePath;
          setPhase1AttachStorageFailed(false);
        } else {
          setPhase1AttachStorageFailed(true);
        }
      }
      const verifyMeta = buildFranchiseMemberVerifyMeta(
        answers,
        storagePath && evidenceFile ? { storagePath, file_name: evidenceFile.name } : null,
      );
      const socialContacts = buildSocialContacts({
        kakaoValue: kakaoId,
        zaloValue: zaloId,
        primaryKey: messengers.primary.key,
        secondaryKey: messengers.secondary.key,
      });
      const intake = await submitLeadIntake(
        {
          id: newLeadId,
          name,
          phone,
          address,
          email: email || null,
          kakao_id: kakaoId,
          zalo_id: zaloId,
          service_type: VERIFY_SERVICE_TYPE,
          result: null,
          source_page: "/verify/franchise",
        },
        {
          action: "verify_lead",
          tag: "VERIFY_FRAUD",
          meta: { ...verifyMeta, socialContacts, preferredLanguage: lang },
        },
      );
      if (!intake.ok) {
        console.error(intake.error);
        setHandoffError(
          intake.error === "rate_limited"
            ? "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
            : "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
        setSubmitting(false);
        return;
      }
      const sessionRes = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: newLeadId,
          name,
          phone,
          email,
          address,
          lang,
          kakao_id: kakaoId,
          zalo_id: zaloId,
        }),
      });
      if (!sessionRes.ok) {
        setHandoffError("접수 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      const sessionBody = (await sessionRes.json().catch(() => null)) as { token?: string } | null;
      if (typeof sessionBody?.token !== "string") {
        setHandoffError("로그인 세션을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      const sessionReady = await establishBrowserSessionFromResultToken(sessionBody.token);
      if (!sessionReady) {
        setHandoffError("로그인 세션 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      setResultToken(sessionBody.token);
      saveLeadContact({ name, phone, address, kakao_id: kakaoId, zalo_id: zaloId });
      setLeadId(newLeadId);
      setProfilingSeedAnswers(answers);
      setAdminMasterSignupComplete(true);
      setAdminMasterSignupPending(false);
      setSubmitting(false);
    },
    [lang, messengers.primary.key, messengers.secondary.key, submitting],
  );

  const handleAiReportRequest = useCallback(async () => {
    if (!leadId) return;
    setAiReportRequesting(true);
    setAiReportError(null);
    try {
      const hasSession = await ensureBrowserSessionForResultToken(resultToken);
      if (!resultToken && !hasSession) {
        setAiReportError("로그인 정보를 준비하지 못했습니다. 다시 신청해주세요.");
        setAiReportRequesting(false);
        return;
      }
      await recordAiReportRequestAndNotify({
        leadId,
        tag: "VERIFY_FRAUD",
        token: resultToken ?? undefined,
      });
      window.location.href = "/mypage";
    } catch {
      setAiReportError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
      setAiReportRequesting(false);
    }
  }, [leadId, resultToken]);

  const handleExpertRequest = useCallback(
    async (expertAnswers?: Record<string, string>) => {
      if (!leadId) return;
      setExpertRequesting(true);
      setExpertError(null);
      try {
        const profilingAnswers =
          expertAnswers && Object.keys(expertAnswers).length > 0
            ? expertAnswers
            : profilingAnswersRef.current ?? profilingSeedAnswers;
        if (expertAnswers && Object.keys(expertAnswers).length > 0) {
          profilingAnswersRef.current = expertAnswers;
          setProfilingSeedAnswers(expertAnswers);
        }
        const { error } = await supabase.from("crm_activities").insert({
          lead_id: leadId,
          action: "expert_review_request",
          tag: "VERIFY_FRAUD",
          meta: buildFranchiseExpertHandoffMeta(profilingAnswers),
        });
        if (error) throw error;
        window.location.href = "/mypage";
      } catch {
        setExpertError("접수 중 문제가 발생했습니다. 다시 시도해주세요.");
        setExpertRequesting(false);
      }
    },
    [leadId, profilingSeedAnswers],
  );

  const handlePhase1AttachStorageRetry = useCallback(async () => {
    const file = phase1EvidenceFileRef.current;
    const targetLeadId = leadId ?? pendingMemberLeadIdRef.current;
    if (!file || file.size <= 0 || !targetLeadId) return;
    const uploaded = await uploadFranchisePhase1Evidence(targetLeadId, file);
    if (uploaded.ok) {
      setPhase1AttachStorageFailed(false);
      if (leadId) {
        const answerSnapshot = (phase1AnswersRef.current ?? profilingSeedAnswers) as Record<string, string>;
        const verifyMeta = buildFranchiseMemberVerifyMeta(answerSnapshot, {
          storagePath: uploaded.storagePath,
          file_name: file.name,
        });
        await persistAdminVerifyLeadMeta(leadId, verifyMeta as Record<string, string>);
      }
    } else {
      setPhase1AttachStorageFailed(true);
    }
  }, [leadId, profilingSeedAnswers]);

  const handleAdminVerifyPhase1Complete = useCallback(
    (answers: Record<string, string>, evidenceFile?: File | null) => {
      phase1AnswersRef.current = answers;
      phase1EvidenceFileRef.current = evidenceFile ?? null;
      if (!evidenceFile?.size) setPhase1AttachStorageFailed(false);
      setAdminVerifyPhase1EvidenceComplete(true);
      if (skipSignup) {
        void submitAsMember(answers, evidenceFile ?? null);
        return;
      }
      setSignupRiskLevel(verifyMasterPackBridge.getSignupRiskLevel(answers));
      setAdminMasterSignupPending(true);
    },
    [skipSignup, submitAsMember, verifyMasterPackBridge],
  );

  const handleAdminVerifyMetaPersist = useCallback(
    async (answers: Record<string, string>, profilePhase: AdminVerifyProfilePhase) => {
      if (!leadId || profilePhase !== 2) return;
      const result = await persistAdminVerifyLeadMeta(leadId, buildFranchisePhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/franchise] Phase 2 meta persist failed:", result);
        setHandoffError(result.message);
      }
    },
    [leadId],
  );

  const handleAdminVerifyPhase2Complete = useCallback(
    async (answers: Record<string, string>) => {
      profilingAnswersRef.current = answers;
      setProfilingSeedAnswers(answers);
      if (!leadId) return;
      const result = await persistAdminVerifyLeadMeta(leadId, buildFranchisePhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/franchise] Phase 2 meta persist failed:", result);
        setHandoffError(result.message);
      }
    },
    [leadId],
  );

  const handleAdminVerifyPhase2DocumentsHandoff = useCallback(
    async (answers: Record<string, string>) => {
      if (!leadId) {
        setHandoffError("접수 정보가 없어 자료 제출 단계로 이동할 수 없습니다. 로그인 후 다시 시도해 주세요.");
        return;
      }
      profilingAnswersRef.current = answers;
      setProfilingSeedAnswers(answers);
      const result = await persistAdminVerifyLeadMeta(leadId, buildFranchisePhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/franchise] Phase 2 pre-upload persist failed:", result);
        setHandoffError(result.message);
        return;
      }
      const packCaseId = resolveFranchiseCaseFromAnswers(answers);
      writePhase2HandoffSnapshot(VERIFY_SERVICE_TYPE, {
        leadId,
        answers,
        resultToken,
        packCaseId,
      });
      window.location.href = buildPhase2DocumentsHandoffUrl(leadId, VERIFY_SERVICE_TYPE, {
        packCaseId,
      });
    },
    [leadId, resultToken],
  );

  async function handleFreeAiSummaryNavigate() {
    setAiSummaryNavigating(true);
    try {
      const ok = await navigateToMypageWithResultToken(resultToken);
      if (!ok) setAiSummaryNavigating(false);
    } catch {
      setAiSummaryNavigating(false);
    }
  }

  return (
    <FunnelPageShell engine="verify" width="verify">
      <div
        data-screen01-content
        className={cn(
          "mx-auto w-full max-w-[960px] -mx-4 px-4 lg:mx-auto lg:px-0",
          "lg:[&_.grid.gap-3:has(>button)]:!grid-cols-1 lg:[&_.grid.gap-3:has(>button)]:!max-w-none lg:[&_.grid.gap-3:has(>button)>button]:!h-auto",
        )}
      >
        <FunnelPageHeader
          engine="verify"
          hideHomeChrome
          {...getVerifyFormFunnelHeaderAlignProps(false, "form", skipSignup)}
          title={FRANCHISE_LANDING.shortServiceLabel ?? FRANCHISE_LANDING.serviceLabel}
          description={FRANCHISE_LANDING.hookBody}
          titleClassName="font-bold lg:text-[25px]"
          verifyEyebrowClassName="font-normal"
          descriptionClassName="mt-1.5 break-keep text-pretty text-[13px] leading-relaxed text-slate-500"
          className="mb-5 [&>div:last-child]:mt-0 lg:pl-[33px]"
        />
        {handoffError ? (
          <p className="mb-3 text-[13px] text-red-600" role="alert">
            {handoffError}
          </p>
        ) : null}
        <div className="lg:[&>div:first-child]:hidden">
          <MasterFunnelLanding
            config={FRANCHISE_LANDING}
            activeTab={contextTab}
            onTabChange={setContextTab}
            onContinue={() => void handleLandingContinue()}
            verifyMasterPackBridge={verifyMasterPackBridge}
            verifyMasterSeedAnswers={verifyMasterSeedAnswers}
            adminVerifyGate={{
              adminVerifySkipSignup: skipSignup,
              adminVerifySignupComplete: adminMasterSignupComplete,
              adminVerifyPhase1EvidenceComplete,
              adminVerifyPhase2UploadComplete,
              adminVerifyMemberSubmitting: submitting,
              onAdminVerifyPhase1Complete: (answers, evidenceFile) =>
                handleAdminVerifyPhase1Complete(answers, evidenceFile ?? undefined),
              onAdminVerifyMetaPersist: (answers, phase) => void handleAdminVerifyMetaPersist(answers, phase),
              onAdminVerifyPhase2Complete: (answers) => void handleAdminVerifyPhase2Complete(answers),
              onAdminVerifyPhase2DocumentsHandoff: (answers) =>
                void handleAdminVerifyPhase2DocumentsHandoff(answers),
              onAdminVerifyEnterPhase2: () => {
                setAdminVerifyPhase2UploadComplete(false);
                setAdminVerifyPhase2DocumentsAnyUploaded(false);
              },
              onAdminVerifyPersonalizedContinue: () => void handleAiReportRequest(),
              onAdminVerifyAiReport: () => void handleAiReportRequest(),
              onAdminVerifyExpert: (answers) => void handleExpertRequest(answers),
              onAdminVerifyAiSummary: () => void handleFreeAiSummaryNavigate(),
              adminVerifyAiSummaryNavigating: aiSummaryNavigating,
              adminVerifyAiReportRequesting: aiReportRequesting,
              adminVerifyExpertRequesting: expertRequesting,
              adminVerifyAiReportError: aiReportError,
              adminVerifyExpertError: expertError,
              adminVerifyPhase1AttachStorageError: phase1AttachStorageFailed
                ? PHASE1_ATTACH_STORAGE_FAIL_MESSAGE
                : null,
              onAdminVerifyPhase1AttachStorageRetry: () => void handlePhase1AttachStorageRetry(),
              adminVerifyLeadCaptureSlot:
                !skipSignup && adminMasterSignupPending && !adminMasterSignupComplete ? (
                  <RealEstateVerifyLeadCapture
                    riskLevel={signupRiskLevel}
                    submitting={submitting}
                    error={handoffError}
                    fieldErrors={signupFieldErrors}
                    consentOpen={signupConsentOpen}
                    onConsentToggle={() => setSignupConsentOpen((v) => !v)}
                    onSubmit={(ev) => void handleSignupSubmit(ev)}
                  />
                ) : null,
            }}
          />
        </div>
      </div>
    </FunnelPageShell>
  );
}
