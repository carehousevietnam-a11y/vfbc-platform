/**
 * CASE_01 Phase2>P1 실질 축 — Brief v3 조합 전수 + 확장 그리드.
 */
import {
  case01Phase1SubstantiveAxisCount,
  case01Phase2ExceedsPhase1SubstantiveDepth,
  case01Phase2SubstantiveAxisCountOnPath,
  case01Phase2SubstantiveAxisSymbolsOnPath,
} from "../../src/lib/adminVerifyProfiling.ts";

const DEMAND_BY_BRIEF = [
  { brief: "payment", value: "payment" },
  { brief: "attend", value: "attend_explain" },
  { brief: "supplement", value: "supplement" },
  { brief: "correct", value: "correct_record" },
  { brief: "unclear", value: "demand_unclear" },
];

const FACTS = [
  { brief: "match", value: "match" },
  { brief: "date_place", value: "date_place_wrong" },
  { brief: "cannot_compare", value: "cannot_compare_yet" },
];

const RESPONSE = [
  { brief: "has_responded", value: "has_responded" },
  { brief: "no_contact", value: "no_contact_yet" },
];

const NOTICE_DELIVERY = [
  "del_in_person",
  "del_phone_message",
  "del_written",
  "del_not_received_yet",
];

const COMPARE_GAPS = [
  "gap_notice_incomplete",
  "gap_memory_timeline",
  "gap_hearsay_channel",
  "gap_records_not_found",
  "gap_language_access",
];

function describeCombo({ r, demand, fact, notice, gap }) {
  const bits = [r.brief, demand.brief, fact.brief];
  if (r.value === "no_contact_yet" && notice) bits.push(`L=${notice}`);
  if (fact.value === "cannot_compare_yet" && gap) bits.push(`gap=${gap}`);
  return bits.join(" × ");
}

export function runCase01Phase2SubstantiveDepthAudit() {
  const under = [];
  let total = 0;
  for (const r of RESPONSE) {
    for (const demand of DEMAND_BY_BRIEF) {
      for (const fact of FACTS) {
        const noticeList = r.value === "no_contact_yet" ? NOTICE_DELIVERY : [null];
        for (const notice of noticeList) {
          const gapList = fact.value === "cannot_compare_yet" ? COMPARE_GAPS : [null];
          for (const gap of gapList) {
            total += 1;
            const answers = {
              case01_customerResponded: r.value,
              case01_authorityDemand: demand.value,
              case01_factRelationship: fact.value,
            };
            if (notice) answers.case01_noticeDeliveryFact = notice;
            if (gap) answers.case01_factCompareGap = gap;

            if (!case01Phase2ExceedsPhase1SubstantiveDepth(answers)) {
              const p1 = case01Phase1SubstantiveAxisCount(answers);
              under.push({
                describe: describeCombo({ r, demand, fact, notice, gap }),
                p1,
                p2: case01Phase2SubstantiveAxisCountOnPath(answers),
                symbols: case01Phase2SubstantiveAxisSymbolsOnPath(answers).join(","),
              });
            }
          }
        }
      }
    }
  }
  return { under, total };
}
