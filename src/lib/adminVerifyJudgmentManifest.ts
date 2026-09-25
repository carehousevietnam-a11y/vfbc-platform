import { getAdminVerifyChoiceOptionsForField } from "@/lib/adminVerifyProfiling";
import {
  LAYER_J_JUDGMENT_FIELD_SPECS,
  LAYER_J_LEGACY_SLUGS,
  type LayerJJudgmentFieldSpec,
} from "@/lib/adminVerifyJudgmentFieldRegistry";
import { resolveLayerJClause } from "@/lib/adminVerifyJudgmentClauses";

export type JudgmentCatalogRow = {
  caseCode: string;
  outlet: string;
  fieldId: string;
  questionLabel: string;
  slug: string;
  choiceLabel: string;
  legacySlug: boolean;
};

export type JudgmentManifestRow = JudgmentCatalogRow & {
  clause: string;
};

function manifestKey(
  caseCode: string,
  outlet: string,
  fieldId: string,
  slug: string,
): string {
  return `${caseCode}|${outlet}|${fieldId}|${slug}`;
}

/** 선택지 catalog 자동 추출 (Layer J commit 1). */
export function getAdminVerifyJudgmentChoiceCatalog(): JudgmentCatalogRow[] {
  const rows: JudgmentCatalogRow[] = [];
  for (const spec of LAYER_J_JUDGMENT_FIELD_SPECS) {
    const options = getAdminVerifyChoiceOptionsForField(spec.fieldId);
    if (!options?.length) continue;
    for (const opt of options) {
      rows.push({
        caseCode: spec.caseCode,
        outlet: spec.outlet,
        fieldId: spec.fieldId,
        questionLabel: spec.questionLabel,
        slug: opt.value,
        choiceLabel: opt.label,
        legacySlug: LAYER_J_LEGACY_SLUGS.has(opt.value),
      });
    }
  }
  return rows;
}

export function buildJudgmentManifestRows(): JudgmentManifestRow[] {
  const catalog = getAdminVerifyJudgmentChoiceCatalog();
  return catalog.map((row) => {
    const spec = LAYER_J_JUDGMENT_FIELD_SPECS.find(
      (s) =>
        s.caseCode === row.caseCode &&
        s.outlet === row.outlet &&
        s.fieldId === row.fieldId,
    );
    const clause = resolveLayerJClause({
      spec: spec!,
      slug: row.slug,
      choiceLabel: row.choiceLabel,
    });
    return { ...row, clause };
  });
}

/** J2 — manifest clause 또는 other/DI fallback. */
export function formatJudgmentClause(input: {
  spec: LayerJJudgmentFieldSpec;
  slug: string;
  choiceLabel: string;
  note?: string;
}): string {
  if (input.slug === "other" || input.slug === "direct_explain") {
    const body = input.note?.trim() || input.choiceLabel;
    return `${input.spec.otherItemLabel}: ${body}`;
  }
  return resolveLayerJClause(input);
}

export function assertLayerJManifestCoverage(): void {
  const catalog = getAdminVerifyJudgmentChoiceCatalog();
  const missing: string[] = [];
  for (const row of catalog) {
    const spec = LAYER_J_JUDGMENT_FIELD_SPECS.find(
      (s) =>
        s.caseCode === row.caseCode &&
        s.outlet === row.outlet &&
        s.fieldId === row.fieldId,
    );
    if (!spec) continue;
    try {
      resolveLayerJClause({ spec, slug: row.slug, choiceLabel: row.choiceLabel });
    } catch {
      missing.push(manifestKey(row.caseCode, row.outlet, row.fieldId, row.slug));
    }
  }
  if (missing.length > 0) {
    throw new Error(`Layer J manifest missing ${missing.length} clause(s): ${missing.slice(0, 8).join(", ")}…`);
  }
}
