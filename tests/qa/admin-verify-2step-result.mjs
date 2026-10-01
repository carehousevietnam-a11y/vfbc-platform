import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
ensureTsxRuntime(import.meta.url);

const {
  isAdminPhase2DocumentsUploadComplete,
  shouldIncludeAdminPhase2PdfSection,
  shouldSendAiReportConfirmEmail,
  shouldInsertExpertReviewRequest,
  isVerifyAdminPaidMypageItem,
  shouldUseGeneralCustomerMypageLayout,
  shouldUseVerifyAdminPaidDashboard,
  buildAdminPhase1SummaryLinesFromActivities,
  buildAdminVerifyAiReportContentFromActivities,
  buildVerifyAdminMypageTimelineRecent,
  verifyAdminTimelineEntryAllowed,
  VERIFY_ADMIN_AI_REPORT_RECEIVE_LABEL,
  VERIFY_ADMIN_EXPERT_REVIEWING_LABEL,
} = await import("../../src/lib/adminVerifyMypageFields.ts");

const caseResolutionMeta = {
  case_resolution_json: JSON.stringify({
    goal: { value: "행정 통지 대응" },
    document: { value: "위반 통지서" },
    riskSignals: [],
  }),
};

const freeActivities = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
      ...caseResolutionMeta,
    },
  },
];

const paidActivities = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
      admin_phase2_documents_upload_complete: "1",
      ...caseResolutionMeta,
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
const paidItemBeforeExpert = {
  ...paidItem,
  hasExpertReview: false,
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
const freeAdminAiOnly = {
  serviceType: "verify_admin",
  phase2Complete: false,
  hasDiagnosis: true,
  hasExpertReview: false,
  hasAgency: false,
  result: "conditional",
  feasibilityScore: null,
};
const otherServiceAiOnly = {
  serviceType: "verify_tax",
  phase2Complete: false,
  hasDiagnosis: true,
  hasExpertReview: false,
  hasAgency: false,
  result: "ok",
  feasibilityScore: null,
};

const paidLayout = shouldUseGeneralCustomerMypageLayout(paidItem);
const paidLayoutBeforeExpert = shouldUseGeneralCustomerMypageLayout(paidItemBeforeExpert);
const freeExpertLayout = shouldUseGeneralCustomerMypageLayout(freeAdminItem);
const freeAiOnlyLayout = shouldUseGeneralCustomerMypageLayout(freeAdminAiOnly);
const otherServiceLayout = shouldUseGeneralCustomerMypageLayout(otherServiceAiOnly);
const paidDashboard = shouldUseVerifyAdminPaidDashboard(paidItem);
const paidFlag = isVerifyAdminPaidMypageItem(paidItem);
const phase1Lines = buildAdminPhase1SummaryLinesFromActivities(paidActivities);

const freePdfContent = buildAdminVerifyAiReportContentFromActivities(freeActivities, "lead-free");
const paidPdfContent = buildAdminVerifyAiReportContentFromActivities(paidActivities, "lead-paid");

const timelineBeforeExpert = buildVerifyAdminMypageTimelineRecent({
  activityLog: [{ label: "AI 검토 완료", createdAt: "2026-01-01T00:00:00.000Z" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  hasDiagnosis: true,
  hasExpertReview: false,
  currentStepLabel: "자체 진단 완료",
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
if (paidLayout !== false) fail.push("paid verify_admin uses expert dashboard layout after expert request");
if (paidLayoutBeforeExpert !== false)
  fail.push("paid verify_admin uses expert dashboard layout before expert request");
if (freeExpertLayout !== false) fail.push("free verify_admin with expert should not use general-only layout");
if (freeAiOnlyLayout !== true) fail.push("free verify_admin ai-only should keep general layout");
if (otherServiceLayout !== true) fail.push("other verify service ai-only layout unchanged");
if (paidDashboard !== true) fail.push("paid dashboard flag");
if (paidFlag !== true) fail.push("paid mypage item flag");
if (!Array.isArray(phase1Lines) || phase1Lines.length === 0)
  fail.push("phase1SummaryLines fixture must be non-empty from manifest");
if (VERIFY_ADMIN_AI_REPORT_RECEIVE_LABEL !== "AI 리포트 받기")
  fail.push("verify_admin AI report button label");
if (VERIFY_ADMIN_EXPERT_REVIEWING_LABEL !== "담당 전문가가 검토 중입니다")
  fail.push("verify_admin expert reviewing label");
if (!freePdfContent || freePdfContent.includesPhase2Block)
  fail.push("free PDF must not include phase2 block");
if (!paidPdfContent || !paidPdfContent.includesPhase2Block)
  fail.push("paid PDF must include phase2 block");
if (timelineBeforeExpert.some((entry) => entry.label.includes("전문가")))
  fail.push("timeline must hide expert entries before expert request");
if (verifyAdminTimelineEntryAllowed("전문가 검토 시작", false))
  fail.push("expert timeline labels must be blocked before request");

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
  paidLayoutBeforeExpert,
  freeExpertLayout,
  freeAiOnlyLayout,
  otherServiceLayout,
  paidDashboard,
  paidFlag,
  phase1Lines,
  freePdfContent: freePdfContent
    ? { includesPhase2Block: freePdfContent.includesPhase2Block }
    : null,
  paidPdfContent: paidPdfContent
    ? { includesPhase2Block: paidPdfContent.includesPhase2Block }
    : null,
  timelineBeforeExpert,
  ok: fail.length === 0,
  fail,
};

console.log(JSON.stringify(report, null, 2));
if (fail.length > 0) process.exit(1);
