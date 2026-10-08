import type { ContentPackNode } from "./types";
import type { AnswerMap } from "./types";
import type { RealEstateCaseId } from "./types";
import { nodeVisible as engineNodeVisible } from "../engine/packRunner";
import { realEstatePackBundle } from "./packBundle";

const bundle = realEstatePackBundle();

export function normalizeShowIf(raw: string): string {
  const base = raw.replace(/`/g, "").split("/")[0].trim();
  if (base.startsWith("항상")) return "항상";
  return base.replace(/\s+또는\s+/g, " OR ").replace(/\s+그리고\s+/g, " AND ");
}

export function nodeVisibleForPack(
  node: ContentPackNode,
  answers: AnswerMap,
  caseId: RealEstateCaseId,
): boolean {
  const showIf = normalizeShowIf(node.showIf ?? "항상");
  return engineNodeVisible(bundle, { ...node, showIf }, answers, caseId);
}
