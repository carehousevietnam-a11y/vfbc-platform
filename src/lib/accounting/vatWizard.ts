/** VAT 신고 ①~⑥ wizard — stored in declarations.computed._wizard */

import type { I18nLang } from "./accountingI18nTexts";

export type VatWizardStepMeta = {
  savedAt: string;
  savedBy: string;
  lang: I18nLang;
};

export type VatWizardState = {
  revision: number;
  step: number;
  filingKind: "regular" | "amended";
  periodKey: string;
  steps: Record<string, VatWizardStepMeta>;
};

export type VatComputedWithWizard = Record<string, unknown> & {
  fields?: Record<string, unknown>;
  warnings?: string[];
  _wizard?: VatWizardState;
};

export function parseVatWizard(computed: unknown): VatWizardState | null {
  if (!computed || typeof computed !== "object") return null;
  const w = (computed as VatComputedWithWizard)._wizard;
  if (!w || typeof w !== "object") return null;
  const step = Number(w.step);
  if (!Number.isFinite(step) || step < 1 || step > 6) return null;
  const filingKind = w.filingKind === "amended" ? "amended" : "regular";
  const periodKey = typeof w.periodKey === "string" ? w.periodKey : "";
  const steps: Record<string, VatWizardStepMeta> = {};
  if (w.steps && typeof w.steps === "object") {
    for (const [k, v] of Object.entries(w.steps as Record<string, VatWizardStepMeta>)) {
      if (!v || typeof v !== "object") continue;
      if (typeof v.savedAt !== "string" || typeof v.savedBy !== "string") continue;
      steps[k] = {
        savedAt: v.savedAt,
        savedBy: v.savedBy,
        lang: v.lang === "vi" ? "vi" : "ko",
      };
    }
  }
  const revision = Number(w.revision);
  return {
    revision: Number.isFinite(revision) && revision >= 0 ? revision : 0,
    step,
    filingKind,
    periodKey,
    steps,
  };
}

export function mergeWizardIntoComputed(
  computed: Record<string, unknown>,
  wizard: VatWizardState
): Record<string, unknown> {
  return { ...computed, _wizard: wizard };
}

export function declarationWizardLocked(status: string): boolean {
  return status === "expert_review" || status === "filed_manual";
}

export function stepMemoField(step: number): string {
  return `step_memo_${step}`;
}
