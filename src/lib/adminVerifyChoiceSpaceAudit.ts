import { LAYER_J_CLAUSE_MAP } from "@/lib/adminVerifyJudgmentClauses.data";
import {
  ADMIN_VERIFY_CHOICE_SPACE_METADATA,
  type ChoiceSpaceQuestionMeta,
} from "@/lib/adminVerifyChoiceSpaceMetadata";
import { getAdminVerifySituationalChoiceFieldIds } from "@/lib/adminVerifyProfiling";

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

function clausePolarity(clause: string): "positive" | "negative" | "neutral" {
  if (/없|불명|어렵|모르|미확인|막힌|차이|다를/.test(clause)) return "negative";
  if (/확인|일치|있는 상태|받았|제출/.test(clause)) return "positive";
  return "neutral";
}

export type ChoiceSpaceAuditFailure = {
  caseCode: string;
  fieldId: string;
  test: "A" | "B" | "C" | "META";
  detail: string;
};

export function runAdminVerifyChoiceSpaceAudit(): ChoiceSpaceAuditFailure[] {
  const failures: ChoiceSpaceAuditFailure[] = [];
  const situationalIds = getAdminVerifySituationalChoiceFieldIds();

  for (const fieldId of situationalIds) {
    const meta = ADMIN_VERIFY_CHOICE_SPACE_METADATA[fieldId];
    const caseCode = fieldId.match(/^case(\d+)/)?.[1]?.padStart(2, "0") ?? "??";
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
      failures.push({
        caseCode,
        fieldId,
        test: "A",
        detail: `uncovered feasible combo: ${comboKey(combo)}`,
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
      if (!clauseKey) continue;
      const clause = LAYER_J_CLAUSE_MAP[clauseKey] ?? "";
      const inferred = clausePolarity(clause);
      if (opt.polarity !== inferred && !(opt.polarity === "neutral" && inferred === "negative")) {
        failures.push({
          caseCode,
          fieldId,
          test: "B",
          detail: `slug ${opt.slug}: meta polarity ${opt.polarity} vs clause ${inferred} — "${clause}"`,
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
