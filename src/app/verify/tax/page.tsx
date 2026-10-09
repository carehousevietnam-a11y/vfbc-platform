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
  buildTaxExpertHandoffMeta,
  buildTaxMemberVerifyMeta,
  buildTaxPhase2PersistMeta,
  createTaxVerifyMasterPackBridge,
  resolveTaxCaseFromAnswers,
  restoreTaxAnswersFromVerifyMeta,
} from "@/lib/contentPacks/tax/taxPack";
import {
  buildPhase2DocumentsHandoffUrl,
  clearPhase2HandoffSnapshot,
  getVerifyPhase2HandoffConfig,
  readPhase2HandoffSnapshot,
  writePhase2HandoffSnapshot,
} from "@/lib/verifyMasterPhase2Handoff";
import RealEstateVerifyLeadCapture from "../real-estate/RealEstateVerifyLeadCapture";

const TAX_LANDING: MasterLandingConfig = {
  engine: "verify",
  serviceLabel: "세금",
  shortServiceLabel: "세금",
  costServiceId: "tax",
  specialtyLine: "베트남 법률전문 AI",
  hookTitle: "세금 안내만 보고 송금하거나 정보를 보내지 마세요.",
  hookBody:
    "급여, 개인 소득, 임대·해외 소득, 부가가치세(VAT)·전자 인보이스, 법인세 중 지금 확인이 필요한 상황을 먼저 정리합니다.",
  persuasionHeadline: "내 상황을 먼저 확인하면 빠뜨리기 쉬운 자료와 기한을 구분할 수 있습니다.",
  reviewTitle: "검토 항목 안내",
  reviewIntro: "누구의 세금인지, 기한과 세무기관 연락, 가진 자료를 구분해 확인합니다.",
  reviewChecks: [
    { title: "개인 소득", body: "급여, 계약 소득, 임대·해외 소득과 세금 처리 자료를 확인합니다." },
    { title: "사업 세금", body: "전자 인보이스와 법인세 신고 자료를 실제 거래·회계자료와 대조합니다." },
    { title: "세무기관 연락", body: "안내, 제출 요청, 납부 통지, 사칭이 의심되는 연락을 구분합니다." },
  ],
  reviewNeeds: [
    { title: "자료", items: ["급여·소득 자료", "MST·여권 자료", "인보이스·법인세 자료"] },
    { title: "기한", items: ["신고·납부 기한을 알고 있는지", "이미 지난 것으로 보이는지"] },
    { title: "연락", items: ["세무기관 연락이 있는지", "송금·정보 제공 전 확인이 필요한지"] },
  ],
  reviewRecommendation:
    "세액이나 납부의무는 답변만으로 정하지 않습니다. 자료와 신고·납부 기록을 함께 확인합니다.",
  guideTitle: "확인 방법",
  guideIntro: "질문에 답한 뒤 1차 결과를 확인하고, 필요하면 추가 질문과 자료 확인으로 이어갑니다.",
  guideItems: [
    { title: "상황", body: "개인 세금인지 사업 세금인지, 어떤 소득·거래인지 확인합니다." },
    { title: "자료", body: "지금 가진 자료와 아직 연결되지 않은 기록을 구분합니다." },
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "세무 절차 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
};

const VERIFY_SERVICE_TYPE = "verify_tax" as const;
const MEMBER_VERIFY_LEAD_TIMEOUT_MS = 45_000;
const PHASE1_ATTACH_STORAGE_FAIL_MESSAGE = "첨부 저장 실패, 다시 시도";

async function uploadTaxPhase1Evidence(
  leadId: string,
  evidenceFile: File,
): Promise<{ ok: true; storagePath: string } | { ok: false }> {
  const rawExt = evidenceFile.name.split(".").pop() || "";
  const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `verify-tax/${leadId}.${safeExt}`;
  const { error: uploadError } = await supabase.storage.from("documents").upload(path, evidenceFile);
  if (uploadError) {
    console.error(uploadError);
    return { ok: false };
  }
  return { ok: true, storagePath: path };
}

export default function TaxVerifyMasterPage() {
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
  const verifyMasterPackBridge = useMemo(() => createTaxVerifyMasterPackBridge(), []);

  const lang = useMemo<SupportedLanguage>(
    () => resolveLanguage(searchParams.get("lang")),
    [searchParams],
  );
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  const applyRestoredVerify = useCallback((restored: RestoredVerifyLead) => {
    const meta = restored.verifyMeta;
    if (meta) {
      const restoredAnswers = restoreTaxAnswersFromVerifyMeta(meta);
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
          const uploaded = await uploadTaxPhase1Evidence(newLeadId, evidenceFile);
          if (uploaded.ok) {
            storagePath = uploaded.storagePath;
            fileName = evidenceFile.name;
            setPhase1AttachStorageFailed(false);
          } else {
            setPhase1AttachStorageFailed(true);
          }
        }
        const verifyMeta = buildTaxMemberVerifyMeta(
          answers,
          storagePath && fileName ? { storagePath, file_name: fileName } : null,
        );
        const created = await awaitMemberVerifyLeadInsert(
          insertMemberVerifyLead({
            serviceType: VERIFY_SERVICE_TYPE,
            sourcePage: "/verify/tax",
            tag: "VERIFY_TAX",
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
      const { error: leadErr } = await supabase.from("leads").insert({
        id: newLeadId,
        name,
        phone,
        address,
        email: email || null,
        kakao_id: kakaoId,
        zalo_id: zaloId,
        service_type: VERIFY_SERVICE_TYPE,
        result: null,
        source_page: "/verify/tax",
      });
      if (leadErr) {
        console.error(leadErr);
        setHandoffError("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setSubmitting(false);
        return;
      }
      let storagePath: string | null = null;
      const evidenceFile = phase1EvidenceFileRef.current;
      if (evidenceFile && evidenceFile.size > 0) {
        const uploaded = await uploadTaxPhase1Evidence(newLeadId, evidenceFile);
        if (uploaded.ok) {
          storagePath = uploaded.storagePath;
          setPhase1AttachStorageFailed(false);
        } else {
          setPhase1AttachStorageFailed(true);
        }
      }
      const verifyMeta = buildTaxMemberVerifyMeta(
        answers,
        storagePath && evidenceFile ? { storagePath, file_name: evidenceFile.name } : null,
      );
      await supabase.from("crm_activities").insert({
        lead_id: newLeadId,
        action: "verify_lead",
        tag: "VERIFY_TAX",
        meta: verifyMeta,
      });
      const socialContacts = buildSocialContacts({
        kakaoValue: kakaoId,
        zaloValue: zaloId,
        primaryKey: messengers.primary.key,
        secondaryKey: messengers.secondary.key,
      });
      const { data: existingActivity } = await supabase
        .from("crm_activities")
        .select("id, meta")
        .eq("lead_id", newLeadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existingActivity?.id) {
        const existingMeta =
          existingActivity.meta && typeof existingActivity.meta === "object" ? existingActivity.meta : {};
        await supabase
          .from("crm_activities")
          .update({ meta: { ...existingMeta, socialContacts, preferredLanguage: lang } })
          .eq("id", existingActivity.id);
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
        tag: "VERIFY_TAX",
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
          tag: "VERIFY_TAX",
          meta: buildTaxExpertHandoffMeta(profilingAnswers),
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
    const uploaded = await uploadTaxPhase1Evidence(targetLeadId, file);
    if (uploaded.ok) {
      setPhase1AttachStorageFailed(false);
      if (leadId) {
        const answerSnapshot = (phase1AnswersRef.current ?? profilingSeedAnswers) as Record<string, string>;
        const verifyMeta = buildTaxMemberVerifyMeta(answerSnapshot, {
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
      const result = await persistAdminVerifyLeadMeta(leadId, buildTaxPhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/tax] Phase 2 meta persist failed:", result);
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
      const result = await persistAdminVerifyLeadMeta(leadId, buildTaxPhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/tax] Phase 2 meta persist failed:", result);
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
      const result = await persistAdminVerifyLeadMeta(leadId, buildTaxPhase2PersistMeta(answers, 2));
      if (!result.ok) {
        console.error("[verify/tax] Phase 2 pre-upload persist failed:", result);
        setHandoffError(result.message);
        return;
      }
      const packCaseId = resolveTaxCaseFromAnswers(answers);
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
          title={TAX_LANDING.shortServiceLabel ?? TAX_LANDING.serviceLabel}
          description={TAX_LANDING.hookBody}
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
            config={TAX_LANDING}
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
