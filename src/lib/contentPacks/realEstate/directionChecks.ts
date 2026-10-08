import type { AnswerMap, RealEstateCaseId } from "./types";
import { realEstatePackBundle } from "./packBundle";

const RECEIVE_MARKERS = /돌려받|받지 못|못 받|안 받|미수령|돌려주지 않|반환받/;
const GIVE_MARKERS = /돌려주지|주지 않|지급하지|몰수|공제|요구받/;

function optionTail(label: string): string {
  const parts = label.split(/[—–-]/);
  return (parts[1] ?? parts[0]).trim();
}

/** RE02 phase1 — 선택 라벨 방향어 vs m1 분쟁 요약 방향 (L-64) */
export function re02DirectionMismatch(answers: AnswerMap, m1: string): boolean {
  const bundle = realEstatePackBundle();
  const caseId: RealEstateCaseId = "RE02";
  const disputeId = answers.re02_dispute_type
    ? "re02_dispute_type"
    : answers.re02_dispute_type_holder
      ? "re02_dispute_type_holder"
      : null;
  if (!disputeId) return false;
  const node = bundle.nodes[caseId]?.find((n) => n.id === disputeId);
  const v = answers[disputeId];
  if (!node?.options || v == null) return false;
  const opt = node.options.find((o) => o.value === String(v));
  if (!opt) return false;
  const tail = optionTail(opt.label);
  if (!RECEIVE_MARKERS.test(tail)) return false;
  if (/돌려받/.test(m1)) return false;
  return /돌려주지 않는|주지 않는/.test(m1);
}
