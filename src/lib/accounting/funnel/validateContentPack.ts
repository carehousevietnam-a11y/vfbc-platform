import { analyzeEntryPathStage2 } from "./pathAnalysis";
import { isPackI18nEmpty } from "./packI18n";
import type {
  AccountingEntryContentPack,
  AccountingFunnelEntryId,
  AccountingPackQuestion,
  AccountingPackShowIfClause,
} from "./types";

/** 경로당 노출 2단계 질문 상한 (P7c 설정값) */
export const ACCOUNTING_FUNNEL_PATH_STAGE2_MAX = 3;

export type AccountingPackValidationOptions = {
  pathStage2Max?: number | null;
};

export type AccountingPackValidationResult = {
  ok: boolean;
  errors: string[];
  pathStats?: ReturnType<typeof analyzeEntryPathStage2>;
};

const MAX_CHOICES = 5;
const MIN_STAGE2_RATIO = 0.6;

export function isAccountingPackSlotEmpty(pack: AccountingEntryContentPack): boolean {
  return pack.stage1.length === 0 && pack.stage2.length === 0;
}

function validateShowIfClause(
  errors: string[],
  prefix: string,
  showIf: AccountingPackShowIfClause,
  stage1Ids: Set<string>,
  stage1ChoiceIds: Map<string, Set<string>>,
) {
  if (!stage1Ids.has(showIf.question_id)) {
    errors.push(`${prefix}: show_if references unknown stage1 question ${showIf.question_id}`);
    return;
  }
  const choices = stage1ChoiceIds.get(showIf.question_id);
  for (const choiceId of showIf.choice_ids) {
    if (!choices?.has(choiceId)) {
      errors.push(`${prefix}: show_if unknown choice ${showIf.question_id}=${choiceId}`);
    }
  }
}

function pushQuestionErrors(
  errors: string[],
  prefix: string,
  question: AccountingPackQuestion,
  stage1Ids: Set<string>,
  stage1ChoiceIds: Map<string, Set<string>>,
  isStage2: boolean,
) {
  if (!question.text || typeof question.text.ko !== "string" || typeof question.text.vi !== "string") {
    errors.push(`${prefix}: question text must include ko and vi`);
  } else if (isPackI18nEmpty(question.text)) {
    errors.push(`${prefix}: empty question text`);
  }
  if (typeof question.allow_direct_input !== "boolean") {
    errors.push(`${prefix}: allow_direct_input missing`);
  }
  if (!Object.prototype.hasOwnProperty.call(question, "sources")) {
    errors.push(`${prefix}: sources field missing`);
  } else if (!Array.isArray(question.sources)) {
    errors.push(`${prefix}: sources must be array`);
  }
  if (question.choices.length > MAX_CHOICES) {
    errors.push(`${prefix}: more than ${MAX_CHOICES} choices`);
  }
  for (const choice of question.choices) {
    if (!choice.label || typeof choice.label.ko !== "string" || typeof choice.label.vi !== "string") {
      errors.push(`${prefix}: choice ${choice.id} label must include ko and vi`);
    } else if (isPackI18nEmpty(choice.label)) {
      errors.push(`${prefix}: empty choice label (${choice.id})`);
    }
  }
  if (isStage2 && question.show_if) {
    validateShowIfClause(errors, prefix, question.show_if, stage1Ids, stage1ChoiceIds);
  }
}

export function validateAccountingEntryContentPack(
  pack: AccountingEntryContentPack,
  options: AccountingPackValidationOptions = {},
): AccountingPackValidationResult {
  const errors: string[] = [];

  if (isAccountingPackSlotEmpty(pack)) {
    return { ok: true, errors: [], pathStats: analyzeEntryPathStage2(pack) };
  }

  const stage1Ids = new Set(pack.stage1.map((q) => q.id));
  const stage1ChoiceIds = new Map<string, Set<string>>();
  for (const q of pack.stage1) {
    stage1ChoiceIds.set(q.id, new Set(q.choices.map((c) => c.id)));
  }

  pack.stage1.forEach((q, i) => {
    pushQuestionErrors(errors, `stage1[${i}] ${q.id}`, q, stage1Ids, stage1ChoiceIds, false);
  });
  pack.stage2.forEach((q, i) => {
    pushQuestionErrors(errors, `stage2[${i}] ${q.id}`, q, stage1Ids, stage1ChoiceIds, true);
  });

  const total = pack.stage1.length + pack.stage2.length;
  const ratio = total === 0 ? 0 : pack.stage2.length / total;
  if (ratio < MIN_STAGE2_RATIO) {
    errors.push(`stage2 ratio ${ratio.toFixed(3)} below ${MIN_STAGE2_RATIO}`);
  }

  const pathStats = analyzeEntryPathStage2(pack);
  if (pathStats.pathCount > 0 && pathStats.minVisibleStage2 < 1) {
    errors.push(`path with zero visible stage2 questions (min=${pathStats.minVisibleStage2})`);
  }

  const max =
    options.pathStage2Max === undefined ? ACCOUNTING_FUNNEL_PATH_STAGE2_MAX : options.pathStage2Max;
  if (max != null && pathStats.maxVisibleStage2 > max) {
    errors.push(`path stage2 max ${pathStats.maxVisibleStage2} exceeds limit ${max}`);
  }

  return { ok: errors.length === 0, errors, pathStats };
}

export function validateAccountingFunnelBundle(
  bundle: Record<AccountingFunnelEntryId, AccountingEntryContentPack>,
  options: AccountingPackValidationOptions = {},
): { ok: boolean; byEntry: Record<AccountingFunnelEntryId, AccountingPackValidationResult> } {
  const byEntry = {} as Record<AccountingFunnelEntryId, AccountingPackValidationResult>;
  let ok = true;
  for (const entryId of Object.keys(bundle) as AccountingFunnelEntryId[]) {
    const pack = bundle[entryId];
    if (pack.entry_id !== entryId) {
      byEntry[entryId] = {
        ok: false,
        errors: [`entry_id mismatch: ${pack.entry_id}`],
      };
      ok = false;
      continue;
    }
    const result = validateAccountingEntryContentPack(pack, options);
    byEntry[entryId] = result;
    if (!result.ok) ok = false;
  }
  return { ok, byEntry };
}
