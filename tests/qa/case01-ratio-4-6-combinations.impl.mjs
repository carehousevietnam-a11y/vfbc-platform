/**
 * CASE_01 4:6 — Brief v3 §5 조합 전수 + 확장 그리드(안내 수신·비교불가 사유).
 */
import {
  case01Phase1SubstantiveAxisCount,
  case01Phase2MeetsRatio46,
  case01Phase2Ratio46MinimumP2,
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
  "del_written_only",
  "del_not_received_yet",
];

const COMPARE_GAPS = [
  "gap_notice_incomplete",
  "gap_memory_timeline",
  "gap_hearsay_channel",
  "gap_records_not_found",
  "gap_language_access",
];

/** §5 표 30행 — 기대 4:6 (미달 6건 = #1·4·7·10) */
const BRIEF30_EXPECT = {
  "has_responded|payment|match": "미달",
  "has_responded|payment|date_place": "PASS",
  "has_responded|payment|cannot_compare": "PASS",
  "has_responded|attend|match": "미달",
  "has_responded|attend|date_place": "PASS",
  "has_responded|attend|cannot_compare": "PASS",
  "has_responded|supplement|match": "미달",
  "has_responded|supplement|date_place": "PASS",
  "has_responded|supplement|cannot_compare": "PASS",
  "has_responded|correct|match": "미달",
  "has_responded|correct|date_place": "PASS",
  "has_responded|correct|cannot_compare": "PASS",
  "has_responded|unclear|match": "PASS",
  "has_responded|unclear|date_place": "PASS",
  "has_responded|unclear|cannot_compare": "PASS",
  "no_contact|payment|match": "PASS",
  "no_contact|payment|date_place": "PASS",
  "no_contact|payment|cannot_compare": "PASS",
  "no_contact|attend|match": "PASS",
  "no_contact|attend|date_place": "PASS",
  "no_contact|attend|cannot_compare": "PASS",
  "no_contact|supplement|match": "PASS",
  "no_contact|supplement|date_place": "PASS",
  "no_contact|supplement|cannot_compare": "PASS",
  "no_contact|correct|match": "PASS",
  "no_contact|correct|date_place": "PASS",
  "no_contact|correct|cannot_compare": "PASS",
  "no_contact|unclear|match": "PASS",
  "no_contact|unclear|date_place": "PASS",
  "no_contact|unclear|cannot_compare": "PASS",
};

function buildStandardAnswers({ r, demand, fact }) {
  const answers = {
    case01_customerResponded: r.value,
    case01_authorityDemand: demand.value,
    case01_factRelationship: fact.value,
  };
  if (r.value === "no_contact_yet") {
    answers.case01_noticeDeliveryFact = "del_phone_message";
  }
  if (fact.value === "cannot_compare_yet") {
    answers.case01_factCompareGap = "gap_hearsay_channel";
  }
  return answers;
}

function comboKey(parts) {
  return parts.join("|");
}

function describeCombo({ r, demand, fact, notice, gap }) {
  const bits = [r.brief, demand.brief, fact.brief];
  if (r.value === "no_contact_yet" && notice) bits.push(`L=${notice}`);
  if (fact.value === "cannot_compare_yet" && gap) bits.push(`gap=${gap}`);
  return bits.join(" × ");
}

export function runCase01Ratio46CombinationAudit() {
  const brief30Mismatches = [];
  for (const r of RESPONSE) {
    for (const demand of DEMAND_BY_BRIEF) {
      for (const fact of FACTS) {
        const answers = buildStandardAnswers({ r, demand, fact });
        const key = comboKey([r.brief, demand.brief, fact.brief]);
        const expected = BRIEF30_EXPECT[key];
        const pass = case01Phase2MeetsRatio46(answers);
        const label = pass ? "PASS" : "미달";
        if (expected && label !== expected) {
          brief30Mismatches.push({
            key,
            expected,
            actual: label,
            p1: case01Phase1SubstantiveAxisCount(answers),
            p2: case01Phase2SubstantiveAxisCountOnPath(answers),
            floor: case01Phase2Ratio46MinimumP2(case01Phase1SubstantiveAxisCount(answers)),
            symbols: case01Phase2SubstantiveAxisSymbolsOnPath(answers).join(","),
          });
        }
      }
    }
  }

  const under = [];
  let total = 0;
  for (const r of RESPONSE) {
    for (const demand of DEMAND_BY_BRIEF) {
      for (const fact of FACTS) {
        const noticeList =
          r.value === "no_contact_yet" ? NOTICE_DELIVERY : [null];
        for (const notice of noticeList) {
          const gapList =
            fact.value === "cannot_compare_yet" ? COMPARE_GAPS : [null];
          for (const gap of gapList) {
            total += 1;
            const answers = {
              case01_customerResponded: r.value,
              case01_authorityDemand: demand.value,
              case01_factRelationship: fact.value,
            };
            if (notice) answers.case01_noticeDeliveryFact = notice;
            if (gap) answers.case01_factCompareGap = gap;

            if (!case01Phase2MeetsRatio46(answers)) {
              const p1 = case01Phase1SubstantiveAxisCount(answers);
              under.push({
                describe: describeCombo({ r, demand, fact, notice, gap }),
                p1,
                p2: case01Phase2SubstantiveAxisCountOnPath(answers),
                floor: case01Phase2Ratio46MinimumP2(p1),
                symbols: case01Phase2SubstantiveAxisSymbolsOnPath(answers).join(","),
              });
            }
          }
        }
      }
    }
  }

  return { brief30Mismatches, under, total };
}
