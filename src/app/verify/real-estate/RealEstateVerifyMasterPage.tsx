"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import {
  MasterFunnelLanding,
  MASTER_LANDING_REAL_ESTATE,
  type MasterFunnelContextTab,
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
import { buildRealEstatePackExpertHandoffMeta } from "@/lib/contentPacks/realEstate/realEstatePackMypageFields";
import type { AnswerMap } from "@/lib/contentPacks/realEstate/types";
import { parseExplicitMasterFunnelTab } from "@/lib/masterFunnelEntry";
import {
  ensureBrowserSessionForResultToken,
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
import { buildRealEstatePackPhase2PersistMeta, restorePackAnswersFromVerifyMeta } from "@/lib/contentPacks/realEstate/packPhase2Persist";
import { resolveCaseFromAnswers } from "@/lib/contentPacks/runner";
import {
  buildRealEstatePackMemberVerifyMeta,
  createRealEstateVerifyMasterPackBridge,
} from "@/lib/verifyMasterPackBridge";
import {
  buildPhase2DocumentsHandoffUrl,
  clearPhase2HandoffSnapshot,
  getVerifyPhase2HandoffConfig,
  readPhase2HandoffSnapshot,
  writePhase2HandoffSnapshot,
} from "@/lib/verifyMasterPhase2Handoff";
import RealEstateVerifyLeadCapture from "./RealEstateVerifyLeadCapture";

const REPORT_TITLE =
  MASTER_LANDING_REAL_ESTATE.shortServiceLabel ?? MASTER_LANDING_REAL_ESTATE.serviceLabel;

const VERIFY_SERVICE_TYPE = "verify_real-estate" as const;
const MEMBER_VERIFY_LEAD_TIMEOUT_MS = 45_000;

export default function RealEstateVerifyMasterPage() {
  const searchParams = useSearchParams();
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>(
    () => parseExplicitMasterFunnelTab(searchParams.get("tab")) ?? "review",
  );
  const [skipSignup, setSkipSignup] = useState(false);
  const [adminMasterSignupComplete, setAdminMasterSignupComplete] = useState(false);
  const [adminMasterSignupPending, setAdminMasterSignupPending] = useState(false);
  const [adminVerifyPhase1EvidenceComplete, setAdminVerifyPhase1EvidenceComplete] =
    useState(false);
  const [adminVerifyPhase2UploadComplete, setAdminVerifyPhase2UploadComplete] = useState(false);
  const [adminVerifyPhase2DocumentsAnyUploaded, setAdminVerifyPhase2DocumentsAnyUploaded] =
    useState(false);
  const [signupRiskLevel, setSignupRiskLevel] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [signupFieldErrors, setSignupFieldErrors] = useState<FieldErrors>({});
  const [signupConsentOpen, setSignupConsentOpen] = useState(false);
  const [aiReportRequesting, setAiReportRequesting] = useState(false);
  const [expertRequesting, setExpertRequesting] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [resultToken, setResultToken] = useState<string | null>(null);
  const [profilingSeedAnswers, setProfilingSeedAnswers] = useState<Record<string, string>>({});
  const memberSubmitStartedRef = useRef(false);
  const phase1AnswersRef = useRef<Record<string, string> | null>(null);
  const phase1EvidenceFileRef = useRef<File | null>(null);
  const profilingAnswersRef = useRef<Record<string, string> | null>(null);
  const verifyMasterPackBridge = useMemo(() => createRealEstateVerifyMasterPackBridge(), []);

  const lang = useMemo<SupportedLanguage>(
    () => resolveLanguage(searchParams.get("lang")),
    [searchParams],
  );
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  const applyRestoredVerify = useCallback((restored: RestoredVerifyLead) => {
    const meta = restored.verifyMeta;
    if (meta) {
      const restoredAnswers = restorePackAnswersFromVerifyMeta(meta);
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
    if (
      typeof meta?.storagePath === "string" ||
      typeof meta?.file_name === "string"
    ) {
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
    if (!adminVerifyPhase2UploadComplete) return;
    let cancelled = false;
    void (async () => {
      const ok = await navigateToMypageWithResultToken(resultToken);
      if (cancelled) return;
      if (!ok) window.location.href = "/mypage";
    })();
    return () => {
      cancelled = true;
    };
  }, [adminVerifyPhase2UploadComplete, resultToken]);

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
    if (
      Object.keys(profilingSeedAnswers).length === 0 &&
      !adminVerifyPhase2UploadComplete
    ) {
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
  }, [
    profilingSeedAnswers,
    adminVerifyPhase2UploadComplete,
    adminVerifyPhase2DocumentsAnyUploaded,
  ]);

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
        let storagePath: string | null = null;
        let fileName: string | undefined;
        if (evidenceFile && evidenceFile.size > 0) {
          const rawExt = evidenceFile.name.split(".").pop() || "";
          const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
          const path = `verify-real-estate/${newLeadId}.${safeExt}`;
          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(path, evidenceFile);
          if (!uploadError) {
            storagePath = path;
            fileName = evidenceFile.name;
          } else {
            console.error(uploadError);
          }
        }

        const verifyMeta = buildRealEstatePackMemberVerifyMeta(
          answers,
          storagePath && fileName ? { storagePath, file_name: fileName } : null,
        );

        const created = await awaitMemberVerifyLeadInsert(
          insertMemberVerifyLead({
            serviceType: VERIFY_SERVICE_TYPE,
            sourcePage: "/verify/real-estate",
            tag: "VERIFY_REAL_ESTATE",
            verifyMeta,
            lang,
            primaryMessengerKey: messengers.primary.key,
            secondaryMessengerKey: messengers.secondary.key,
            leadId: newLeadId,
          }),
        );

        if (!created.ok) {
          if (created.reason === "no_contact") {
            releaseMemberHandoffToSignupRetry();
          } else {
            releaseMemberHandoffToSignupRetry(
              "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            );
          }
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
        if (err instanceof Error && err.message === "insertMemberVerifyLead_timeout") {
          releaseMemberHandoffToSignupRetry(
            "접수가 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
          );
        } else {
          releaseMemberHandoffToSignupRetry(
            "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      }
    },
    [lang, messengers.primary.key, messengers.secondary.key, verifyMasterPackBridge],
  );

  const handleLandingContinue = useCallback(async () => {
    const { loggedIn, restored } = await loadVerifyMemberEntryState(VERIFY_SERVICE_TYPE, {
      allowRestore: true,
    });
    if (loggedIn) setSkipSignup(true);
    if (restored) {
      applyRestoredVerify(restored);
    }
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
        source_page: "/verify/real-estate",
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
        const rawExt = evidenceFile.name.split(".").pop() || "";
        const safeExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
        const path = `verify-real-estate/${newLeadId}.${safeExt}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(path, evidenceFile);
        if (!uploadError) storagePath = path;
        else console.error(uploadError);
      }

      const verifyMeta = buildRealEstatePackMemberVerifyMeta(
        answers,
        storagePath && evidenceFile
          ? { storagePath, file_name: evidenceFile.name }
          : null,
      );

      await supabase.from("crm_activities").insert({
        lead_id: newLeadId,
        action: "verify_lead",
        tag: "VERIFY_REAL_ESTATE",
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
          existingActivity.meta && typeof existingActivity.meta === "object"
            ? existingActivity.meta
            : {};
        await supabase
          .from("crm_activities")
          .update({ meta: { ...existingMeta, socialContacts, preferredLanguage: lang } })
          .eq("id", existingActivity.id);
      }

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
        tag: "VERIFY_REAL_ESTATE",
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
        const caseHandoffMeta = buildRealEstatePackExpertHandoffMeta(
          profilingAnswers as AnswerMap,
        );
        const { error } = await supabase.from("crm_activities").insert({
          lead_id: leadId,
          action: "expert_review_request",
          tag: "VERIFY_REAL_ESTATE",
          meta: caseHandoffMeta,
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

  const handleAdminVerifyPhase1Complete = useCallback(
    (answers: Record<string, string>, evidenceFile?: File | null) => {
      phase1AnswersRef.current = answers;
      phase1EvidenceFileRef.current = evidenceFile ?? null;
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
      const partialMeta = buildRealEstatePackPhase2PersistMeta(answers, 2);
      const result = await persistAdminVerifyLeadMeta(leadId, partialMeta);
      if (!result.ok) {
        console.error("[verify/real-estate] Phase 2 meta persist failed:", result);
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
      const partialMeta = buildRealEstatePackPhase2PersistMeta(answers, 2);
      const result = await persistAdminVerifyLeadMeta(leadId, partialMeta);
      if (!result.ok) {
        console.error("[verify/real-estate] Phase 2 meta persist failed:", result);
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
      const partialMeta = buildRealEstatePackPhase2PersistMeta(answers, 2);
      const result = await persistAdminVerifyLeadMeta(leadId, partialMeta);
      if (!result.ok) {
        console.error("[verify/real-estate] Phase 2 pre-upload persist failed:", result);
        setHandoffError(result.message);
        return;
      }
      const packCaseId = resolveCaseFromAnswers(answers);
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
          title={REPORT_TITLE}
          description={MASTER_LANDING_REAL_ESTATE.hookBody}
          titleClassName="font-bold lg:text-[25px]"
          verifyEyebrowClassName="font-normal"
          descriptionClassName="mt-1.5 break-keep text-pretty text-[13px] leading-relaxed text-slate-500"
          className="mb-5 [&>div:last-child]:mt-0 lg:pl-[33px]"
        />
        {handoffError ? (
          <p className="mb-3 text-[13px] text-red-600" role="alert">{handoffError}</p>
        ) : null}
        <div className="lg:[&>div:first-child]:hidden">
          <MasterFunnelLanding
            config={MASTER_LANDING_REAL_ESTATE}
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
              onAdminVerifyMetaPersist: (answers, phase) =>
                void handleAdminVerifyMetaPersist(answers, phase),
              onAdminVerifyPhase2Complete: (answers) =>
                void handleAdminVerifyPhase2Complete(answers),
              onAdminVerifyPhase2DocumentsHandoff: (answers) =>
                void handleAdminVerifyPhase2DocumentsHandoff(answers),
              onAdminVerifyEnterPhase2: () => {
                setAdminVerifyPhase2UploadComplete(false);
                setAdminVerifyPhase2DocumentsAnyUploaded(false);
              },
              onAdminVerifyPersonalizedContinue: () => void handleAiReportRequest(),
              onAdminVerifyAiReport: () => void handleAiReportRequest(),
              onAdminVerifyExpert: (answers) => void handleExpertRequest(answers),
              adminVerifyAiReportRequesting: aiReportRequesting,
              adminVerifyExpertRequesting: expertRequesting,
              adminVerifyAiReportError: aiReportError,
              adminVerifyExpertError: expertError,
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
