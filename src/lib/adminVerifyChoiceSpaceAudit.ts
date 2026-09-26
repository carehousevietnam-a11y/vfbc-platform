import {
  LAYER_J_CLAUSE_MAP,
  LAYER_J_CLAUSE_POLARITY_MAP,
} from "@/lib/adminVerifyJudgmentClauses.data";
import {
  ADMIN_VERIFY_CHOICE_SPACE_METADATA,
  type ChoiceSpaceQuestionMeta,
} from "@/lib/adminVerifyChoiceSpaceMetadata";
import {
  ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP,
  getAdminVerifySituationalChoiceFieldIds,
  isAdminDirectExplainOption,
} from "@/lib/adminVerifyProfiling";

const MAX_CONTENT_CHOICES_PER_QUESTION = 5;
const MAX_CONTENT_CHOICES_CASE05 = 6;

function maxContentChoicesForField(fieldId: string): number {
  return fieldId.startsWith("case05_") ? MAX_CONTENT_CHOICES_CASE05 : MAX_CONTENT_CHOICES_PER_QUESTION;
}

export function getAdminVerifyCase0106ChoiceFieldIds(): string[] {
  return Object.keys(ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP)
    .filter((fieldId) => /^case0[1-6]_/.test(fieldId))
    .sort();
}

function isDirectInputChoiceOption(opt: { value: string; label: string }): boolean {
  if (opt.value === "direct_explain") return true;
  return isAdminDirectExplainOption(opt);
}

export function countAdminVerifyContentChoices(
  options: readonly { value: string; label: string }[],
): number {
  return options.filter((opt) => !isDirectInputChoiceOption(opt)).length;
}

function comboDelegatedToDirectInput(
  meta: ChoiceSpaceQuestionMeta,
  combo: Record<string, string>,
): boolean {
  const key = comboKey(combo);
  const delegations = meta.directInputDelegations ?? [];
  return delegations.some(
    (row) => row.reason.trim().length > 0 && row.comboKeys.includes(key),
  );
}

function cartesianProduct(
  dimensions: ChoiceSpaceQuestionMeta["dimensions"],
): Record<string, string>[] {
  let combos: Record<string, string>[] = [{}];
  for (const dim of dimensions) {
    const next: Record<string, string>[] = [];
    for (const base of combos) {
      for (const value of dim.values) {
        next.push({ ...base, [dim.id]: value });
      }
    }
    combos = next;
  }
  return combos;
}

function comboKey(combo: Record<string, string>): string {
  return Object.keys(combo)
    .sort()
    .map((k) => `${k}=${combo[k]}`)
    .join("|");
}

function isInfeasible(meta: ChoiceSpaceQuestionMeta, combo: Record<string, string>): boolean {
  return meta.infeasible.some((row) =>
    Object.entries(row.facts).every(([k, v]) => combo[k] === v),
  );
}

function comboCovered(meta: ChoiceSpaceQuestionMeta, combo: Record<string, string>): boolean {
  return meta.options.some((opt) =>
    Object.entries(opt.facts).every(([k, v]) => combo[k] === v),
  );
}

export type ChoiceSpaceAuditFailure = {
  caseCode: string;
  fieldId: string;
  test: "A" | "B" | "C" | "D" | "META";
  detail: string;
};

function fieldCaseCode(fieldId: string): string {
  return fieldId.match(/^case(\d+)/)?.[1]?.padStart(2, "0") ?? "??";
}

export function runAdminVerifyChoiceSpaceAudit(): ChoiceSpaceAuditFailure[] {
  const failures: ChoiceSpaceAuditFailure[] = [];

  for (const fieldId of getAdminVerifyCase0106ChoiceFieldIds()) {
    const options = ADMIN_VERIFY_MERGED_FIELD_OPTION_MAP[fieldId];
    if (!options?.length) continue;
    const contentCount = countAdminVerifyContentChoices(options);
    const maxContent = maxContentChoicesForField(fieldId);
    if (contentCount > maxContent) {
      failures.push({
        caseCode: fieldCaseCode(fieldId),
        fieldId,
        test: "D",
        detail: `content choices ${contentCount} > ${maxContent} (DI excluded)`,
      });
    }
  }

  const situationalIds = getAdminVerifySituationalChoiceFieldIds();

  for (const fieldId of situationalIds) {
    const meta = ADMIN_VERIFY_CHOICE_SPACE_METADATA[fieldId];
    const caseCode = fieldCaseCode(fieldId);
    if (!meta) {
      failures.push({
        caseCode,
        fieldId,
        test: "META",
        detail: "choice space metadata missing (dimensions/infeasible/options)",
      });
      continue;
    }

    const feasible = cartesianProduct(meta.dimensions).filter((c) => !isInfeasible(meta, c));
    const missing = feasible.filter((c) => !comboCovered(meta, c));
    for (const combo of missing) {
      if (comboDelegatedToDirectInput(meta, combo)) {
        continue;
      }
      failures.push({
        caseCode,
        fieldId,
        test: "A",
        detail: `uncovered feasible combo (no DI delegation+reason): ${comboKey(combo)}`,
      });
    }

    const duplicateOptions = new Map<string, string[]>();
    for (const opt of meta.options) {
      const key = comboKey(opt.facts);
      const list = duplicateOptions.get(key) ?? [];
      list.push(opt.slug);
      duplicateOptions.set(key, list);
    }
    for (const [key, slugs] of duplicateOptions) {
      if (slugs.length > 1) {
        failures.push({
          caseCode,
          fieldId,
          test: "C",
          detail: `duplicate facts within question: ${key} → [${slugs.join(", ")}]`,
        });
      }
    }

    for (const opt of meta.options) {
      if (!opt.polarity) continue;
      const clauseKey = Object.keys(LAYER_J_CLAUSE_MAP).find((k) =>
        k.endsWith(`|${fieldId}|${opt.slug}`),
      );
      if (!clauseKey) {
        failures.push({
          caseCode,
          fieldId,
          test: "META",
          detail: `slug ${opt.slug}: Layer J clause missing for polarity tag compare`,
        });
        continue;
      }
      const clauseTag = LAYER_J_CLAUSE_POLARITY_MAP[clauseKey];
      if (!clauseTag) {
        failures.push({
          caseCode,
          fieldId,
          test: "META",
          detail: `slug ${opt.slug}: judgment clause polarity tag missing (${clauseKey})`,
        });
        continue;
      }
      const clause = LAYER_J_CLAUSE_MAP[clauseKey] ?? "";
      if (opt.polarity !== clauseTag) {
        failures.push({
          caseCode,
          fieldId,
          test: "B",
          detail: `slug ${opt.slug}: choice polarity ${opt.polarity} vs judgment tag ${clauseTag} — "${clause}"`,
        });
      }
    }
  }

  const dimensionOwners = new Map<string, string>();
  for (const [fieldId, meta] of Object.entries(ADMIN_VERIFY_CHOICE_SPACE_METADATA)) {
    for (const dim of meta.dimensions) {
      const sig = `${dim.id}::${dim.values.join(",")}`;
      const prior = dimensionOwners.get(sig);
      if (prior && prior !== fieldId) {
        failures.push({
          caseCode: "cross",
          fieldId,
          test: "C",
          detail: `dimension ${dim.id} duplicates ${prior} without new branch value`,
        });
      } else {
        dimensionOwners.set(sig, fieldId);
      }
    }
  }

  return failures;
}
