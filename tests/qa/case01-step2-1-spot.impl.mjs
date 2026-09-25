/**
 * CASE_01 STEP2-1 — engine spot (LEVEL 3): M01 Profile synthesis, M02 result truncate.
 */
import { buildAdminVerifyPersonalizedResult } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  CASE01_DATE_PLACE_DETAIL_KEY,
  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
  attachCaseResolutionSnapshot,
  buildCaseResolutionProfile,
} from "../../src/lib/adminVerifyProfiling.ts";

const phase1Base = {
  situation: "received_document",
  stage: "case",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
  case01_violationContent: "traffic",
  case01_confirmGoal: "fact_difference",
  case01_customerResponded: "has_responded",
  case01_deadline: "uncertain",
  case01_authorityDemand: "attendance",
};

const partialDiff = attachCaseResolutionSnapshot({
  ...phase1Base,
  case01_factRelationship: "partial_situation",
  case01_actualSituation: "partial",
  [CASE01_FACT_DIFFERENCE_DETAIL_KEY]: "기관 안내와 실제 속도가 다릅니다",
});

const partialProfile = buildCaseResolutionProfile(partialDiff);
const partialProfilePass = (partialProfile.actualSituation.value ?? "").includes(
  "기관 안내와 실제 속도",
);
const diffSourcePass = partialProfile.actualSituation.source === CASE01_FACT_DIFFERENCE_DETAIL_KEY;

const datePlace = attachCaseResolutionSnapshot({
  ...phase1Base,
  case01_factRelationship: "date_place_wrong",
  case01_actualSituation: "deny",
  [CASE01_DATE_PLACE_DETAIL_KEY]: "2024년 3월, 다른 지역에 있었습니다",
});

const dateProfile = buildCaseResolutionProfile(datePlace);
const datePlaceProfilePass = (dateProfile.actualSituation.value ?? "").includes("2024년 3월");
const dateSourcePass = dateProfile.actualSituation.source === CASE01_DATE_PLACE_DETAIL_KEY;

const longDetail = "가".repeat(150);
const longAnswers = attachCaseResolutionSnapshot({
  ...partialDiff,
  [CASE01_FACT_DIFFERENCE_DETAIL_KEY]: longDetail,
});
const personalized = buildAdminVerifyPersonalizedResult(longAnswers);
const diffAction = personalized.actions.find((a) => a.startsWith("응답 기준 차이:"));
const truncatePass =
  Boolean(diffAction) &&
  diffAction.includes("…") &&
  !diffAction.includes(longDetail) &&
  diffAction.length <= "응답 기준 차이: ".length + 121;

const pass =
  partialProfilePass &&
  diffSourcePass &&
  datePlaceProfilePass &&
  dateSourcePass &&
  truncatePass;

console.log(
  JSON.stringify(
    {
      pass,
      level: 3,
      partialProfilePass,
      diffSourcePass,
      datePlaceProfilePass,
      dateSourcePass,
      truncatePass,
      diffActionLen: diffAction?.length ?? null,
    },
    null,
    2,
  ),
);
process.exitCode = pass ? 0 : 1;
