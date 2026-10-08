import type { AnswerMap, RealEstateCaseId } from "./types";

/** Pack § 위험 신호 — 1차(phase1) 답 value. 2차 전용은 별도 표기. */
export const PHASE1_HIGH_RISK_VALUES: Record<RealEstateCaseId, string[]> = {
  RE01: ["r1_od_signer_differs", "r1_od_refused_delay", "r1_st_deposit_requested"],
  RE02: ["hd_forfeit_dispute", "hd_double_demand", "dt_deposit_forfeited"],
  RE03: ["r3_dm_terminate", "r3_dm_money_claim", "r3_dm_vacate_date"],
  RE04: ["nt_verbal_only", "sw_over_month", "sw_recurring"],
  RE05: [
    "r5_registration_rejected",
    "r5_cp_owner_unclear",
    "r5_paid_balance",
    "r5_paid_via_broker",
    "r5_cp_broker_only",
    "r5_book_mismatch",
  ],
  RE06: [],
};

export function comboIncludesHighRisk(caseId: RealEstateCaseId, answers: AnswerMap): boolean {
  const keys = PHASE1_HIGH_RISK_VALUES[caseId] ?? [];
  const selected = new Set(
    Object.values(answers).flatMap((v) => (Array.isArray(v) ? v.map(String) : [String(v ?? "")])),
  );
  return keys.some((k) => selected.has(k));
}
