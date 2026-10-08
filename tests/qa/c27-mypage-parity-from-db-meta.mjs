/**
 * C2.7 — derive mypage fields from DB-shaped meta (not HTTP /api/mypage-data)
 */
import { buildRealEstateVerifyMypagePackExtras } from "../../src/lib/contentPacks/realEstate/realEstatePackMypageFields.ts";
import { isVerifyMasterPaidMypageItem } from "../../src/lib/adminVerifyMypageFields.ts";

const bafMeta = {
  real_estate_pack_v1: "true",
  real_estate_pack_case_id: "RE02",
  admin_verify_profile_phase: "2",
  admin_phase2_documents_upload_complete: "1",
  admin_phase2_documents_any_uploaded: "0",
  real_estate_pack_grade2: "2",
  real_estate_pack_phase2_summary:
    "세입자로서 맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못한 상황이며, 계약은 기간이 지나 종료되었습니다. 2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
  real_estate_pack_caution_count: "0",
  real_estate_pack_headline: "1차에서 확인된 주의 사항이 유지되는 상태입니다",
  admin_verify_answers_json: "{}",
};

const activities = [{ action: "verify_lead", meta: bafMeta }];
const extras = buildRealEstateVerifyMypagePackExtras(activities);
const paid = isVerifyMasterPaidMypageItem({
  serviceType: "verify_real-estate",
  phase2Complete: extras.phase2Complete,
  hasDiagnosis: true,
});
console.log(
  JSON.stringify(
    {
      note: "code derivation from V1 DB meta snapshot — HTTP mypage-data NOT VERIFIED (C2.9: no grade2×25; use stage.progressPercent + grade label on UI)",
      phase2Complete: extras.phase2Complete,
      realEstatePackGrade2: extras.realEstatePackGrade2,
      mypage_grade_label:
        extras.realEstatePackGrade2 != null
          ? extras.realEstatePackGrade2 >= 2
            ? "주의 요망"
            : "양호"
          : null,
      verify_stage_progress_hint: "hasDiagnosis only → 50%; +expert_review_request → 75%",
      phase2SummaryLines: extras.phase2SummaryLines,
      isVerifyMasterPaidMypageItem: paid,
      expect_upload_complete: "1",
      expect_any_uploaded: "0",
      gate_ok: bafMeta.admin_phase2_documents_upload_complete === "1",
    },
    null,
    2,
  ),
);
