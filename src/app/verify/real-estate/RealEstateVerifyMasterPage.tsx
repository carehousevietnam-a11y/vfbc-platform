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
import { resolveLanguage, type SupportedLanguage } from "@/lib/customerRegistrationValidation";
import { MESSENGERS_BY_LANGUAGE } from "@/lib/messenger";
import { parseExplicitMasterFunnelTab } from "@/lib/masterFunnelEntry";
import { isLoggedInMember } from "@/lib/restoreCheckLead";
import {
  awaitMemberVerifyLeadInsert,
  insertMemberVerifyLead,
  loadVerifyMemberEntryState,
} from "@/lib/restoreVerifyLead";
import { supabase } from "@/lib/supabase";
import {
  buildRealEstatePackMemberVerifyMeta,
  createRealEstateVerifyMasterPackBridge,
} from "@/lib/verifyMasterPackBridge";
import RealEstateVerifyLeadCapture from "./RealEstateVerifyLeadCapture";

const REPORT_TITLE =
  MASTER_LANDING_REAL_ESTATE.shortServiceLabel ?? MASTER_LANDING_REAL_ESTATE.serviceLabel;

const VERIFY_SERVICE_TYPE = "verify_real-estate" as const;

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
  const [signupRiskLevel, setSignupRiskLevel] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const memberSubmitStartedRef = useRef(false);
  const phase1AnswersRef = useRef<Record<string, string> | null>(null);
  const verifyMasterPackBridge = useMemo(() => createRealEstateVerifyMasterPackBridge(), []);

  const lang = useMemo<SupportedLanguage>(
    () => resolveLanguage(searchParams.get("lang")),
    [searchParams],
  );
  const messengers = MESSENGERS_BY_LANGUAGE[lang];

  useEffect(() => {
    let cancelled = false;

    async function initMemberState() {
      const { loggedIn } = await loadVerifyMemberEntryState(VERIFY_SERVICE_TYPE, {
        allowRestore: false,
      });
      if (!cancelled && loggedIn) setSkipSignup(true);
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
  }, []);

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

  const handleAdminVerifyPhase1Complete = useCallback(
    (answers: Record<string, string>, evidenceFile?: File | null) => {
      phase1AnswersRef.current = answers;
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
            onContinue={() => {}}
            verifyMasterPackBridge={verifyMasterPackBridge}
            adminVerifyGate={{
              adminVerifySkipSignup: skipSignup,
              adminVerifySignupComplete: adminMasterSignupComplete,
              adminVerifyPhase1EvidenceComplete,
              adminVerifyPhase2UploadComplete: false,
              adminVerifyMemberSubmitting: submitting,
              onAdminVerifyPhase1Complete: (answers, evidenceFile) =>
                handleAdminVerifyPhase1Complete(answers, evidenceFile ?? undefined),
              adminVerifyLeadCaptureSlot:
                !skipSignup && adminMasterSignupPending && !adminMasterSignupComplete ? (
                  <RealEstateVerifyLeadCapture
                    riskLevel={signupRiskLevel}
                    onComplete={() => {
                      setAdminMasterSignupComplete(true);
                      setAdminMasterSignupPending(false);
                    }}
                  />
                ) : null,
            }}
          />
        </div>
      </div>
    </FunnelPageShell>
  );
}
