"use client";

import { useCallback, useMemo, useState } from "react";
import { useClientMounted } from "../useClientMounted";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { uiAccountingLocale } from "../localeFormat";
import { accountingFunnelEntryById } from "./entries";
import { AccountingFunnelExpertCta } from "./AccountingFunnelExpertCta";
import { resolvePackI18n } from "./packI18n";
import { visibleStage2ForAnswers } from "./pathAnalysis";
import { persistAccountingFunnelEvidenceSession } from "./funnelEvidenceSession";
import { uploadAccountingFunnelPhase1Evidence } from "./uploadPhase1Evidence";
import type { Stage1AnswerMap } from "./pathAnalysis";
import { resolveLanguageNoteSentence, resolveResultVariant } from "./resolveFirstResult";
import {
  type AccountingEntryContentPack,
  type AccountingEntryResultPack,
  type AccountingFunnelEntryId,
  type AccountingResultVariant,
} from "./types";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "../uiCatalog";

type FunnelStep = "questions" | "documents" | "first_result";

type Props = {
  entryId: AccountingFunnelEntryId;
  enabled: boolean;
  pack: AccountingEntryContentPack;
  resultPack: AccountingEntryResultPack;
};

export function AccountingFunnelClient({ entryId, enabled, pack, resultPack }: Props) {
  const { locale: siteLocale, setLocale: setSiteLocale } = useLocale();
  const locale = uiAccountingLocale(siteLocale);
  const meta = accountingFunnelEntryById(entryId);
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);
  const returnPath = `/verify/accounting/${meta.routeSegment}`;

  const [step, setStep] = useState<FunnelStep>("questions");
  const [stage1Index, setStage1Index] = useState(0);
  const [stage2Index, setStage2Index] = useState(0);
  const [stage1Answers, setStage1Answers] = useState<Stage1AnswerMap>({});
  const [stage2Answers, setStage2Answers] = useState<Stage1AnswerMap>({});
  const [leadId] = useState(() => `acct-funnel-${Date.now()}`);
  const [evidenceError, setEvidenceError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mounted = useClientMounted();

  const visibleStage2 = useMemo(
    () => pack.stage2.filter((q) => visibleStage2ForAnswers(pack, stage1Answers).includes(q.id)),
    [pack, stage1Answers],
  );

  const firstResultVariant = useMemo(
    () => resolveResultVariant(resultPack, stage1Answers),
    [resultPack, stage1Answers],
  );
  const languageNote = useMemo(
    () => resolveLanguageNoteSentence(resultPack, pack, stage1Answers),
    [resultPack, pack, stage1Answers],
  );

  const onStage1Choice = useCallback(
    (choiceId: string) => {
      const q = pack.stage1[stage1Index];
      if (!q) return;
      const next = { ...stage1Answers, [q.id]: choiceId };
      setStage1Answers(next);
      if (stage1Index + 1 < pack.stage1.length) {
        setStage1Index(stage1Index + 1);
      } else {
        setStage1Index(pack.stage1.length);
        setStage2Index(0);
      }
    },
    [pack.stage1, stage1Answers, stage1Index],
  );

  const onStage2Choice = useCallback(
    (choiceId: string) => {
      const q = visibleStage2[stage2Index];
      if (!q) return;
      const next = { ...stage2Answers, [q.id]: choiceId };
      setStage2Answers(next);
      if (stage2Index + 1 < visibleStage2.length) {
        setStage2Index(stage2Index + 1);
      } else {
        setStep("documents");
      }
    },
    [visibleStage2, stage2Answers, stage2Index],
  );

  const onEvidenceSelected = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setUploading(true);
      setEvidenceError(false);
      const result = await uploadAccountingFunnelPhase1Evidence(entryId, leadId, file);
      setUploading(false);
      if (!result.ok) {
        setEvidenceError(true);
        return;
      }
      persistAccountingFunnelEvidenceSession(entryId, result.storagePath);
      setStep("first_result");
    },
    [entryId, leadId],
  );

  if (!mounted) {
    return (
      <FunnelPageShell engine="verify" width="verify">
        <div className="py-16 text-center" data-testid="accounting-funnel-boot">
          <p className="text-sm text-[#6B7A90]">{accountingMessage("ko", "accounting.funnel.expert.loading")}</p>
        </div>
      </FunnelPageShell>
    );
  }

  if (!enabled) {
    return (
      <FunnelPageShell engine="verify" width="verify">
        <div className="flex justify-end gap-2 px-1 pt-4">
          <button
            type="button"
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${locale === "ko" ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"}`}
            onClick={() => setSiteLocale("ko")}
            data-testid="accounting-funnel-locale-ko"
          >
            {t("accounting.funnel.locale.ko")}
          </button>
          <button
            type="button"
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${locale === "vi" ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"}`}
            onClick={() => setSiteLocale("vi")}
            data-testid="accounting-funnel-locale-vi"
          >
            {t("accounting.funnel.locale.vi")}
          </button>
        </div>
        <div data-testid="accounting-funnel-unavailable" className="py-16 text-center">
          <p className="text-base font-semibold text-[#3D4B63]">{t("accounting.funnel.unavailable")}</p>
        </div>
      </FunnelPageShell>
    );
  }

  const title = t(meta.titleKey);
  const description = t(meta.leadKey);

  return (
    <FunnelPageShell engine="verify" width="verify">
      <FunnelPageHeader engine="verify" title={title} description={description} hideHomeChrome />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${locale === "ko" ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"}`}
          onClick={() => setSiteLocale("ko")}
          data-testid="accounting-funnel-locale-ko"
        >
          {t("accounting.funnel.locale.ko")}
        </button>
        <button
          type="button"
          className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${locale === "vi" ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"}`}
          onClick={() => setSiteLocale("vi")}
          data-testid="accounting-funnel-locale-vi"
        >
          {t("accounting.funnel.locale.vi")}
        </button>
      </div>
      <div className="mt-6 space-y-6" data-testid="accounting-funnel-active">
        <ol className="flex flex-wrap gap-2 text-xs font-semibold text-[#3D4B63]">
          {(["questions", "documents", "first_result"] as FunnelStep[]).map((s) => (
            <li
              key={s}
              className={`rounded-full px-3 py-1 ${step === s ? "bg-[#071A33] text-white" : "bg-[#F7F9FC]"}`}
            >
              {t(`accounting.funnel.step.${s}` as AccountingMessageKey)}
            </li>
          ))}
        </ol>

        {step === "questions" && (
          <section data-testid="accounting-funnel-questions">
            {stage1Index < pack.stage1.length ? (
              <QuestionCard locale={locale} question={pack.stage1[stage1Index]} onPick={onStage1Choice} />
            ) : stage2Index < visibleStage2.length ? (
              <QuestionCard locale={locale} question={visibleStage2[stage2Index]} onPick={onStage2Choice} />
            ) : (
              <button
                type="button"
                className="min-h-11 rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white"
                onClick={() => setStep("documents")}
              >
                {t("accounting.funnel.action.continue")}
              </button>
            )}
          </section>
        )}

        {step === "documents" && (
          <section data-testid="accounting-funnel-documents" className="space-y-3">
            <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.documents.lead")}</p>
            <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold text-[#071A33]">
              {uploading ? t("accounting.evidence.uploading") : t("accounting.funnel.documents.upload")}
              <input
                type="file"
                className="sr-only"
                onChange={(e) => onEvidenceSelected(e.target.files?.[0])}
              />
            </label>
            {evidenceError ? (
              <p className="text-sm text-[#B42318]">{t("accounting.evidence.error")}</p>
            ) : null}
            <button
              type="button"
              className="text-sm font-semibold text-[#3D4B63] underline"
              onClick={() => setStep("first_result")}
            >
              {t("accounting.funnel.documents.skip")}
            </button>
          </section>
        )}

        {step === "first_result" && (
          <section
            data-testid="accounting-funnel-first-result"
            className="space-y-4 rounded-xl border border-[#E3E8F0] bg-[#F7F9FC] p-6"
          >
            <h2 className="text-lg font-bold text-[#071A33]">{t("accounting.funnel.first_result.title")}</h2>
            <FirstResultBody t={t} variant={firstResultVariant} languageNote={languageNote} />
            <p className="text-sm text-[#3D4B63]">{t("accounting.funnel.signup.lead")}</p>
            <AccountingFunnelExpertCta locale={locale} returnPath={returnPath} />
          </section>
        )}

      </div>
    </FunnelPageShell>
  );
}

function FirstResultBody({
  t,
  variant,
  languageNote,
}: {
  t: (key: AccountingMessageKey) => string;
  variant: AccountingResultVariant | null;
  languageNote: string | null;
}) {
  if (!variant) {
    return (
      <p className="text-sm text-[#3D4B63]" data-testid="accounting-funnel-first-result-missing">
        {t("accounting.funnel.first_result.disclaimer")}
      </p>
    );
  }

  const showSources = variant.sources.length > 0;

  return (
    <div className="space-y-4 rounded-lg border border-[#E3E8F0] bg-white p-4 sm:p-5">
      <p
        className="text-[15px] leading-7 text-[#071A33] sm:text-base"
        data-testid="accounting-funnel-first-result-summary"
      >
        {variant.summary}
      </p>
      {languageNote ? (
        <p
          className="text-sm leading-6 text-[#3D4B63]"
          data-testid="accounting-funnel-first-result-language-note"
        >
          {languageNote}
        </p>
      ) : null}
      <div>
        <h3 className="text-sm font-bold text-[#071A33]">{t("accounting.funnel.first_result.check_items")}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#3D4B63]">
          {variant.check_items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#071A33]">{t("accounting.funnel.first_result.next_prep")}</h3>
        <p className="mt-2 text-sm leading-6 text-[#3D4B63]" data-testid="accounting-funnel-first-result-guide">
          {variant.guide}
        </p>
      </div>
      {showSources ? (
        <div data-testid="accounting-funnel-first-result-sources">
          <h3 className="text-sm font-bold text-[#071A33]">{t("accounting.funnel.first_result.sources")}</h3>
          <ul className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#3D4B63]">
            {variant.sources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {!showSources ? (
        <p
          className="border-t border-[#E3E8F0] pt-4 text-xs leading-5 text-[#6B7A90]"
          data-testid="accounting-funnel-first-result-disclaimer"
        >
          {t("accounting.funnel.first_result.disclaimer")}
        </p>
      ) : null}
    </div>
  );
}

function QuestionCard({
  locale,
  question,
  onPick,
}: {
  locale: AccountingLocale;
  question: AccountingEntryContentPack["stage1"][number];
  onPick: (choiceId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[#E3E8F0] bg-white p-5" data-question-id={question.id}>
      <h3 className="text-base font-bold text-[#071A33]">{resolvePackI18n(question.text, locale)}</h3>
      <ul className="mt-4 space-y-2">
        {question.choices.map((choice) => (
          <li key={choice.id}>
            <button
              type="button"
              className="w-full min-h-11 rounded-lg border border-[#E3E8F0] px-4 text-left text-sm font-semibold text-[#3D4B63] hover:border-[#071A33]"
              onClick={() => onPick(choice.id)}
            >
              {resolvePackI18n(choice.label, locale)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
