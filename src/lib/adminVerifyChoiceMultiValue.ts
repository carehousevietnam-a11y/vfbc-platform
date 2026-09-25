/** §7 v3 목록형 + CASE_01 A1/A2 — 복수 선택 저장 (JSON array string). */

import { canonicalizeAdminVerifyChoiceSlug } from "@/lib/adminVerifyChoiceSlugCanonical";

export const ADMIN_VERIFY_MULTI_CHOICE_FIELD_IDS = new Set<string>([
  "case01_evidence",
  "case01_compareRecordGap",
  "case03_evidence",
  "case04_evidence",
  "case04_addDocDetail",
  "case04_modifyDetail",
  "case04_evidenceDetail",
  "case05_evidence",
  "case05_submittedDocsDetail",
]);

const MULTI_EXCLUSIVE_ALONE = new Set<string>(["none"]);

export function isAdminVerifyMultiChoiceField(fieldId: string): boolean {
  return ADMIN_VERIFY_MULTI_CHOICE_FIELD_IDS.has(fieldId);
}

export function parseAdminVerifyMultiChoice(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      /* legacy single */
    }
  }
  return [trimmed];
}

export function serializeAdminVerifyMultiChoice(slugs: string[]): string {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0]!;
  return JSON.stringify(unique);
}

export function normalizeAdminVerifyMultiChoiceRaw(
  fieldId: string,
  raw: string | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const canonical = parseAdminVerifyMultiChoice(raw).map((slug) =>
    canonicalizeAdminVerifyChoiceSlug(fieldId, slug),
  );
  const deduped = [...new Set(canonical.filter(Boolean))];
  if (deduped.length === 0) return undefined;
  const alone = deduped.find((s) => MULTI_EXCLUSIVE_ALONE.has(s));
  if (alone) return alone;
  const filtered = deduped.filter((s) => !MULTI_EXCLUSIVE_ALONE.has(s));
  if (filtered.length === 0) return undefined;
  return serializeAdminVerifyMultiChoice(filtered);
}

export function getAdminVerifyEffectiveChoiceSlugs(
  fieldId: string,
  raw: string | undefined,
): string[] {
  if (!raw?.trim()) return [];
  if (!isAdminVerifyMultiChoiceField(fieldId)) {
    const one = canonicalizeAdminVerifyChoiceSlug(fieldId, raw.trim());
    return one ? [one] : [];
  }
  const normalized = normalizeAdminVerifyMultiChoiceRaw(fieldId, raw);
  if (!normalized) return [];
  return parseAdminVerifyMultiChoice(normalized).map((slug) =>
    canonicalizeAdminVerifyChoiceSlug(fieldId, slug),
  );
}

export function adminVerifyAnswerIncludesSlug(
  fieldId: string,
  raw: string | undefined,
  slug: string,
): boolean {
  const target = canonicalizeAdminVerifyChoiceSlug(fieldId, slug);
  return getAdminVerifyEffectiveChoiceSlugs(fieldId, raw).includes(target);
}

export function toggleAdminVerifyMultiChoiceSlug(
  fieldId: string,
  raw: string | undefined,
  slug: string,
): string {
  const canonical = canonicalizeAdminVerifyChoiceSlug(fieldId, slug);
  let slugs = getAdminVerifyEffectiveChoiceSlugs(fieldId, raw);
  if (MULTI_EXCLUSIVE_ALONE.has(canonical)) {
    slugs = slugs.includes(canonical) ? [] : [canonical];
  } else {
    slugs = slugs.filter((s) => !MULTI_EXCLUSIVE_ALONE.has(s));
    if (slugs.includes(canonical)) {
      slugs = slugs.filter((s) => s !== canonical);
    } else {
      slugs = [...slugs, canonical];
    }
  }
  return serializeAdminVerifyMultiChoice(slugs);
}

export function formatAdminVerifyMultiChoiceAnswerLabel(
  fieldId: string,
  raw: string | undefined,
  labelFor: (slug: string) => string,
): string | null {
  const slugs = getAdminVerifyEffectiveChoiceSlugs(fieldId, raw);
  if (slugs.length === 0) return null;
  return slugs.map((slug) => labelFor(slug)).join(" · ");
}

export function isAdminVerifyMultiChoiceFieldComplete(
  fieldId: string,
  raw: string | undefined,
  options: readonly { value: string }[],
): boolean {
  const slugs = getAdminVerifyEffectiveChoiceSlugs(fieldId, raw);
  if (slugs.length === 0) return false;
  if (slugs.includes("other")) {
    return true;
  }
  const allowed = new Set(options.map((o) => o.value));
  return slugs.every((s) => allowed.has(s));
}
