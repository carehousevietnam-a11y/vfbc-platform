/**
 * C2.4 D-4 — 서버 로직 단위 스모크 (live HTTP/DB 없음)
 * persist meta 키 allowlist · expert handoff · AI tag · lead service_type
 */
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { buildRealEstatePackPhase2PersistMeta } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";
import {
  buildRealEstatePackExpertHandoffMeta,
  buildRealEstateVerifyMypagePackExtras,
} from "../../src/lib/contentPacks/realEstate/realEstatePackMypageFields.ts";
import { isVerifyMasterPaidMypageItem } from "../../src/lib/adminVerifyMypageFields.ts";

const ALLOWED = new Set([
  "admin_verify_answers_json",
  "admin_verify_profile_phase",
  "admin_phase2_documents_upload_complete",
  "admin_phase2_documents_any_uploaded",
  "real_estate_pack_v1",
  "real_estate_pack_case_id",
  "real_estate_pack_grade2",
  "real_estate_pack_phase2_summary",
  "real_estate_pack_caution_count",
  "real_estate_pack_headline",
]);

const VERIFY_SERVICE_TYPE = "verify_real-estate";
const AI_TAG = "VERIFY_REAL_ESTATE";
const EXPERT_ACTION = "expert_review_request";
const AI_ACTION = "ai_report_request";

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function walkPhase2(caseId, phase1) {
  const bundle = realEstatePackBundle();
  const answers = { ...phase1 };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = firstOptionFor(node);
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

let disallowedKey = 0;
let missingGrade = 0;
let expertKeysOk = 0;
const caseId = "RE01";
const phase1 = [...enumeratePhase1Combinations(caseId)][0];
const answers = walkPhase2(caseId, phase1);
const persist = buildRealEstatePackPhase2PersistMeta(answers, 2);
for (const key of Object.keys(persist)) {
  if (!ALLOWED.has(key)) disallowedKey++;
}
if (!persist.real_estate_pack_grade2 || !persist.real_estate_pack_phase2_summary) {
  missingGrade++;
}

const expert = buildRealEstatePackExpertHandoffMeta(answers);
if (
  expert.admin_verify_answers_json &&
  expert.real_estate_pack_case_id === "RE01" &&
  expert.admin_verify_profile_phase === "2"
) {
  expertKeysOk = 1;
}

const contract = {
  lead_insert: {
    service_type: VERIFY_SERVICE_TYPE,
    source_page: "/verify/real-estate",
    crm_action: "verify_lead",
    crm_tag: AI_TAG,
  },
  ai_report_request: { action: AI_ACTION, tag: AI_TAG },
  expert_review_request: { action: EXPERT_ACTION, tag: AI_TAG },
  persist_meta_keys_sample: Object.keys(persist).sort(),
};

let mypageZeroDocGate = 0;
let mypageWithDocGate = 0;
for (const anyUploaded of [false, true]) {
  const gateActivities = [
    {
      action: "verify_lead",
      meta: {
        ...persist,
        admin_phase2_documents_upload_complete: "1",
        admin_phase2_documents_any_uploaded: anyUploaded ? "1" : "0",
      },
    },
  ];
  const extras = buildRealEstateVerifyMypagePackExtras(gateActivities);
  const paid = isVerifyMasterPaidMypageItem({
    serviceType: VERIFY_SERVICE_TYPE,
    phase2Complete: extras.phase2Complete,
    hasDiagnosis: true,
  });
  if (!extras.phase2Complete || !paid || !extras.realEstatePackGrade2) {
    if (anyUploaded) mypageWithDocGate++;
    else mypageZeroDocGate++;
  }
}

const fail =
  disallowedKey > 0 ||
  missingGrade > 0 ||
  expertKeysOk !== 1 ||
  mypageZeroDocGate > 0 ||
  mypageWithDocGate > 0
    ? 1
    : 0;

console.log(
  JSON.stringify(
    {
      disallowed_persist_keys: disallowedKey,
      missing_grade_or_summary: missingGrade,
      expert_handoff_ok: expertKeysOk === 1,
      mypage_phase2_gate_zero_docs: mypageZeroDocGate,
      mypage_phase2_gate_with_docs: mypageWithDocGate,
      http_live_db: "NOT VERIFIED — unit contract only",
      contract,
      fail,
    },
    null,
    2,
  ),
);

process.exit(fail);
