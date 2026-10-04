import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const mypagePageSrc = fs.readFileSync(path.join(repoRoot, "src/app/mypage/page.tsx"), "utf8");

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
  verifyAdminPaidMypageShowsTopActionRow,
  verifyAdminPaidMypageUsesDualCardLayout,
  verifyAdminPaidAiReportCtaInAiResultCard,
  verifyAdminPaidExpertCtaInCurrentStatusCard,
  verifyAdminPaidStatusCardUsesUnifiedStructure,
  VERIFY_ADMIN_PAID_STATUS_GUIDE_BEFORE,
  VERIFY_ADMIN_PAID_STATUS_GUIDE_AFTER,
  VERIFY_ADMIN_PAID_STATUS_BADGE_BEFORE,
  VERIFY_ADMIN_PAID_STATUS_BADGE_AFTER,
  VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_BEFORE,
  VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_AFTER,
  VERIFY_ADMIN_PAID_STATUS_ESTIMATE_BEFORE,
  VERIFY_ADMIN_PAID_STATUS_ESTIMATE_AFTER,
  VERIFY_ADMIN_PAID_STATUS_FOOTER_AFTER,
  isVerifyAdminMypageItem,
  resolveVerifyAdminApplicationSummaryStatus,
  shouldUseVerifyAdminMypageSlimAside,
  VERIFY_ADMIN_SUMMARY_STATUS_FREE,
  VERIFY_ADMIN_SUMMARY_STATUS_PAID_BEFORE,
  VERIFY_ADMIN_SUMMARY_STATUS_PAID_AFTER,
  verifyAdminMypageShowsMainWalletFooter,
  verifyAdminMypageShowsRollingStrip,
  shouldHideVerifyAdminWalletDocumentCount,
  VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE,
} = await import("../../src/lib/adminVerifyMypageFields.ts");

const {
  buildVerifyAdminRollingStripItems,
  MYPAGE_PUBLIC_LINKS,
  MYPAGE_VN_PUBLIC_LINKS,
  MYPAGE_VIETNAM_LIFE_LABELS,
  MYPAGE_RECOMMENDED_SERVICE_TITLES,
} = await import("../../src/lib/mypageLinkCatalog.ts");

const { MYPAGE_WALLET_SLOT_TITLE_CLASS, mypageWalletSlotTitleClassIsLegible } = await import(
  "../../src/lib/mypageWalletSlotUi.ts"
);

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
if (verifyAdminPaidMypageShowsTopActionRow() !== false)
  fail.push("paid verify_admin must not show top action row box");
if (verifyAdminPaidMypageUsesDualCardLayout() !== true)
  fail.push("paid verify_admin must use AiResultCard + CurrentStatusCard grid");
if (verifyAdminPaidAiReportCtaInAiResultCard() !== true)
  fail.push("paid verify_admin AI report CTA must live in AiResultCard");
if (verifyAdminPaidExpertCtaInCurrentStatusCard() !== true)
  fail.push("paid verify_admin expert CTA must live in CurrentStatusCard");
if (verifyAdminPaidStatusCardUsesUnifiedStructure() !== true)
  fail.push("paid verify_admin status card must use unified structure");
if (VERIFY_ADMIN_PAID_STATUS_GUIDE_BEFORE !==
  "AI 분석 결과를 바탕으로 전문가가 직접 다음 대응 방향을 안내해 드립니다.")
  fail.push("paid status guide before request");
if (VERIFY_ADMIN_PAID_STATUS_GUIDE_AFTER !== "담당 전문가가 제출하신 자료를 검토하고 있습니다.")
  fail.push("paid status guide after request");
if (VERIFY_ADMIN_PAID_STATUS_BADGE_BEFORE !== "연결 대기")
  fail.push("paid status badge before must be connection pending");
if (VERIFY_ADMIN_PAID_STATUS_BADGE_AFTER !== "담당 전문가")
  fail.push("paid status badge after must be assigned expert");
if (VERIFY_ADMIN_PAID_STATUS_BADGE_BEFORE === VERIFY_ADMIN_PAID_STATUS_BADGE_AFTER)
  fail.push("paid status badges must differ by request state");
if (VERIFY_ADMIN_PAID_STATUS_FOOTER_AFTER !== "전문가에게 전달되어 진행 중입니다")
  fail.push("paid status footer after request");
if (VERIFY_ADMIN_PAID_STATUS_GUIDE_BEFORE.includes("검토 중"))
  fail.push("guide before must not use reviewing wording");
if (VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_BEFORE !== "전문가 진행 요청")
  fail.push("paid next step tile before request");
if (VERIFY_ADMIN_PAID_STATUS_NEXT_STEP_AFTER !== "전문가 안내 대기 준비")
  fail.push("paid next step tile after request");
if (VERIFY_ADMIN_PAID_STATUS_ESTIMATE_BEFORE !== "요청 후 2~5 영업일")
  fail.push("paid estimate tile before request");
if (VERIFY_ADMIN_PAID_STATUS_ESTIMATE_AFTER !== "2~5 영업일")
  fail.push("paid estimate tile after request");
if (!freePdfContent || freePdfContent.includesPhase2Block)
  fail.push("free PDF must not include phase2 block");
if (!paidPdfContent || !paidPdfContent.includesPhase2Block)
  fail.push("paid PDF must include phase2 block");
if (timelineBeforeExpert.some((entry) => entry.label.includes("전문가")))
  fail.push("timeline must hide expert entries before expert request");
if (verifyAdminTimelineEntryAllowed("전문가 검토 시작", false))
  fail.push("expert timeline labels must be blocked before request");
if (shouldUseVerifyAdminMypageSlimAside(freeAdminAiOnly) !== true)
  fail.push("verify_admin free must use slim aside panel");
if (shouldUseVerifyAdminMypageSlimAside(paidItem) !== false)
  fail.push("verify_admin paid must not use slim aside panel");
if (shouldUseVerifyAdminMypageSlimAside(otherServiceAiOnly) !== false)
  fail.push("non verify_admin must keep full aside widgets");
if (!isVerifyAdminMypageItem(freeAdminAiOnly))
  fail.push("verify_admin item detect");
if (resolveVerifyAdminApplicationSummaryStatus(freeAdminAiOnly) !== VERIFY_ADMIN_SUMMARY_STATUS_FREE)
  fail.push("free summary status");
if (resolveVerifyAdminApplicationSummaryStatus(paidItemBeforeExpert) !== VERIFY_ADMIN_SUMMARY_STATUS_PAID_BEFORE)
  fail.push("paid before expert summary status");
if (resolveVerifyAdminApplicationSummaryStatus(paidItem) !== VERIFY_ADMIN_SUMMARY_STATUS_PAID_AFTER)
  fail.push("paid after expert summary status");
if (verifyAdminMypageShowsMainWalletFooter(freeAdminAiOnly) !== true)
  fail.push("verify_admin free must show main wallet footer");
if (verifyAdminMypageShowsMainWalletFooter(paidItem) !== false)
  fail.push("verify_admin paid must not show main wallet footer");
if (verifyAdminMypageShowsRollingStrip(freeAdminAiOnly) !== true)
  fail.push("verify_admin free must show rolling strip");
if (verifyAdminMypageShowsRollingStrip(paidItem) !== false)
  fail.push("verify_admin paid must not show rolling strip");
if (shouldHideVerifyAdminWalletDocumentCount(0) !== true)
  fail.push("wallet must hide document count when zero");
if (shouldHideVerifyAdminWalletDocumentCount(3) !== false)
  fail.push("wallet must show document count when N>=1");
if (VERIFY_ADMIN_ROLLING_STRIP_SECTION_TITLE !== "정부기관 바로가기")
  fail.push("rolling strip title must reuse existing section name");
const rollingItems = buildVerifyAdminRollingStripItems();
const expectedRollingCount = MYPAGE_PUBLIC_LINKS.length + MYPAGE_VN_PUBLIC_LINKS.length;
if (!Array.isArray(rollingItems) || rollingItems.length !== expectedRollingCount)
  fail.push("rolling strip must include only KR+VN public link catalog items");
if (rollingItems.some((item) => !item.href))
  fail.push("rolling strip items must all have href");
const excludedRollingLabels = [...MYPAGE_VIETNAM_LIFE_LABELS, ...MYPAGE_RECOMMENDED_SERVICE_TITLES];
if (rollingItems.some((item) => excludedRollingLabels.includes(item.label)))
  fail.push("rolling strip must exclude life info and recommended service labels");
if (rollingItems.some((item) => item.label.includes("샘플")))
  fail.push("rolling strip must not contain sample labels");
const rollingIconSignatures = rollingItems.map(
  (item) => item.iconSrc ?? `badge:${item.label.charAt(0)}`
);
if (new Set(rollingIconSignatures).size < 2)
  fail.push("rolling strip icons must not all use the same fallback icon");
if (!mypageWalletSlotTitleClassIsLegible(MYPAGE_WALLET_SLOT_TITLE_CLASS))
  fail.push("wallet slot title class must avoid truncate/leading-none vertical clip");
if (!mypagePageSrc.includes("flex min-w-[420px] items-start"))
  fail.push("StepProgress inner track must match d2871f8 min-w-[420px] for non-free-global layout");
if (/<main className="[^"]*overflow-x-hidden/.test(mypagePageSrc))
  fail.push("main must not use global overflow-x-hidden (F-12 restore)");
if (!mypagePageSrc.includes("freeVerifyAdminLegibilityLayout"))
  fail.push("wallet F-11 legibility must be gated by freeVerifyAdminLegibilityLayout");
if (!mypagePageSrc.includes("ExpertMainSupport item={activeItem} hideRecommended={verifyAdminPaid}"))
  fail.push("paid verify_admin must restore d2871f8 ExpertMainSupport on expert dashboard");

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
