import { hasCostSignal } from "@/lib/aiCostSection";
import { hasProcessSignal } from "@/lib/masterFunnelEntry";
import { guidePath } from "@/lib/contentPacks/paths";

/** CHECK Master 「더 자세히 보기」 질문 intent — 콘텐츠 분기 전 전달용 */
export const CHECK_GUIDE_INTENTS = [
  "cost",
  "process",
  "documents",
  "eligibility",
  "general",
] as const;

export type CheckGuideIntent = (typeof CHECK_GUIDE_INTENTS)[number];

/** intentRouter TRC_DOCUMENT_INTENT_RE 와 동일 계열 */
const DOCUMENT_INTENT_RE =
  /서류|준비물|필요.*(뭐|무엇)|뭐.*필요|목록|체크리스트|document|서류목록|제출.*서류/i;

const ELIGIBILITY_INTENT_RE =
  /자격|요건|가능\s*한지|신청\s*가능|발급\s*가능|받을\s*수|해당\s*되|대상\s*이|eligibility|eligible|누가\s*받|누가\s*신청/i;

export function parseCheckGuideIntent(
  value: string | null | undefined
): CheckGuideIntent | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return (CHECK_GUIDE_INTENTS as readonly string[]).includes(normalized)
    ? (normalized as CheckGuideIntent)
    : null;
}

/**
 * 질문 → 5개 intent 중 하나.
 * 우선순위: cost → documents → eligibility → process → general
 * (서류 키워드가 process 신호에도 있어 documents를 process보다 먼저)
 */
export function resolveCheckGuideIntent(question: string): CheckGuideIntent {
  const q = question.trim();
  if (!q) return "general";
  if (hasCostSignal(q)) return "cost";
  if (DOCUMENT_INTENT_RE.test(q)) return "documents";
  if (ELIGIBILITY_INTENT_RE.test(q)) return "eligibility";
  if (hasProcessSignal(q)) return "process";
  return "general";
}

/** 질문이 있으면 ?intent=&q= 유지, 없으면 기존 `/guide/{slug}` */
export function buildCheckGuideDetailHref(slug: string, question?: string): string {
  const q = question?.trim() ?? "";
  if (!q) return guidePath(slug);
  return guidePath(slug, {
    intent: resolveCheckGuideIntent(q),
    q,
  });
}
