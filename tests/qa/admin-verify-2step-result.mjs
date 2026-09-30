import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
ensureTsxRuntime(import.meta.url);

const {
  isAdminPhase2DocumentsUploadComplete,
  shouldIncludeAdminPhase2PdfSection,
  shouldSendAiReportConfirmEmail,
  shouldInsertExpertReviewRequest,
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
  ok: fail.length === 0,
  fail,
};

console.log(JSON.stringify(report, null, 2));
if (fail.length > 0) process.exit(1);
