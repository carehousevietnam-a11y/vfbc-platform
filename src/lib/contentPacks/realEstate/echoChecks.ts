import type { AnswerMap, RealEstateCaseId } from "./types";
import { realEstatePackBundle } from "./packBundle";

function optionTail(label: string): string {
  const parts = label.split(/[—–-]/);
  return (parts[1] ?? parts[0]).trim().replace(/\.$/, "");
}

function fullLabel(label: string): string {
  return label.trim().replace(/\.$/, "");
}

/** m2/m3 문장이 phase1 선택 라벨과 완전 일치(echo) */
export function metricEchoesOptionLabel(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  metricLine: string,
  metricIndex: number,
): boolean {
  if (metricIndex < 1 || !metricLine.trim()) return false;
  const fieldIds = realEstatePackBundle().phase1Order?.[caseId] ?? [];
  const line = metricLine.trim().replace(/\.$/, "");
  for (const qid of fieldIds) {
    const node = realEstatePackBundle().nodes[caseId]?.find((n) => n.id === qid);
    if (!node?.options) continue;
    const v = answers[qid];
    if (v == null) continue;
    const opt = node.options.find((o) => o.value === String(v));
    if (!opt) continue;
    const tail = optionTail(opt.label);
    const full = fullLabel(opt.label);
    if (line === tail || line === full) return true;
    if (line === opt.label.trim().replace(/\.$/, "")) return true;
  }
  return false;
}
