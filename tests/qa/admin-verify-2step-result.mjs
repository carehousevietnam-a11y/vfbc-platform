import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
ensureTsxRuntime(import.meta.url);

const {
  isAdminPhase2DocumentsUploadComplete,
  shouldIncludeAdminPhase2PdfSection,
  shouldSendAiReportConfirmEmail,
  shouldInsertExpertReviewRequest,
  isVerifyAdminPaidMypageItem,
  shouldUseGeneralCustomerMypageLayout,
  buildVerifyAdminPaidPhase1SummaryLines,
} = await import("../../src/lib/adminVerifyMypageFields.ts");

const freeActivities = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
    },
  },
];

const paidActivities = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
      admin_phase2_documents_upload_complete: "1",
    },
  },
];

const freeComplete = isAdminPhase2DocumentsUploadComplete(freeActivities);
const paidComplete = isAdminPhase2DocumentsUploadComplete(paidActivities);
const pdfFree = shouldIncludeAdminPhase2PdfSection(freeActivities);
const pdfPaid = shouldIncludeAdminPhase2PdfSection(paidActivities);
const pdfAnswersOnly = shouldIncludeAdminPhase2PdfSection([
  {
    action: "verify_lead",
    meta: { admin_verify_answers_json: "{\"a\":\"1\"}" },
  },
]);

const emailFirst = shouldSendAiReportConfirmEmail("VERIFY_ADMIN", false);
const emailSecond = shouldSendAiReportConfirmEmail("VERIFY_ADMIN", true);
const emailOtherRepeat = shouldSendAiReportConfirmEmail("VERIFY_TAX", true);
const expertFirst = shouldInsertExpertReviewRequest(false);
const expertSecond = shouldInsertExpertReviewRequest(true);

const paidItem = {
  serviceType: "verify_admin",
  phase2Complete: true,
  hasDiagnosis: true,
  hasExpertReview: true,
  hasAgency: false,
  result: "conditional",
  feasibilityScore: null,
};
const freeAdminItem = {
  serviceType: "verify_admin",
  phase2Complete: false,
  hasDiagnosis: true,
  hasExpertReview: true,
  hasAgency: false,
  result: "conditional",
  feasibilityScore: null,
};
const paidLayout = shouldUseGeneralCustomerMypageLayout(paidItem);
const freeExpertLayout = shouldUseGeneralCustomerMypageLayout(freeAdminItem);
const paidFlag = isVerifyAdminPaidMypageItem(paidItem);
const phase1Dedupe = buildVerifyAdminPaidPhase1SummaryLines({
  caseSummaryHeadline: "같은 문장",
  caseSummaryBullets: ["같은 문장", "두번째 요약"],
});

const fail = [];
if (freeComplete !== false) fail.push("phase2Complete free should be false");
if (paidComplete !== true) fail.push("phase2Complete paid should be true");
if (pdfFree !== false) fail.push("PDF phase2 section free should be false");
if (pdfPaid !== true) fail.push("PDF phase2 section paid should be true");
if (pdfAnswersOnly !== false) fail.push("PDF must not use answers JSON alone");
if (emailFirst !== true) fail.push("AI email first VERIFY_ADMIN should send");
if (emailSecond !== false) fail.push("AI email second VERIFY_ADMIN should skip");
if (emailOtherRepeat !== true) fail.push("other tag email must stay unchanged");
if (expertFirst !== true) fail.push("expert first insert");
if (expertSecond !== false) fail.push("expert second skip");
if (paidLayout !== true) fail.push("paid verify_admin keeps general layout after expert request");
if (freeExpertLayout !== false) fail.push("free verify_admin with expert should not use general-only layout");
if (paidFlag !== true) fail.push("paid mypage item flag");
if (!phase1Dedupe.includes("두번째 요약") || phase1Dedupe.includes("같은 문장"))
  fail.push("phase1 summary dedupes headline duplicate");

const report = {
  freeComplete,
  paidComplete,
  pdfFree,
  pdfPaid,
  pdfAnswersOnly,
  emailFirst,
  emailSecond,
  emailOtherRepeat,
  expertFirst,
  expertSecond,
  paidLayout,
  freeExpertLayout,
  paidFlag,
  phase1Dedupe,
  ok: fail.length === 0,
  fail,
};

console.log(JSON.stringify(report, null, 2));
if (fail.length > 0) process.exit(1);
