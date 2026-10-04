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
  shouldUseVerifyAdminExpertFlowDashboard,
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
  fail.push("verify_admin aiOnly result must use slim aside panel");
if (shouldUseVerifyAdminMypageSlimAside(freeAdminItem) !== false)
  fail.push("verify_admin expert dashboard must not use slim aside (aiOnly only)");
if (shouldUseVerifyAdminMypageSlimAside(paidItem) !== false)
  fail.push("verify_admin expert dashboard (paid) must not use slim aside");
if (shouldUseVerifyAdminExpertFlowDashboard(freeAdminItem) !== true)
  fail.push("verify_admin after expert request must use expert flow dashboard path");
if (shouldUseVerifyAdminExpertFlowDashboard(paidItem) !== true)
  fail.push("verify_admin paid must use expert flow dashboard path");
if (shouldUseVerifyAdminExpertFlowDashboard(freeAdminAiOnly) !== false)
  fail.push("verify_admin aiOnly must not use expert flow dashboard flag");
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
  fail.push("verify_admin aiOnly must show main wallet footer");
if (verifyAdminMypageShowsMainWalletFooter(freeAdminItem) !== false)
  fail.push("verify_admin expert dashboard must not show main wallet footer");
if (verifyAdminMypageShowsMainWalletFooter(paidItem) !== false)
  fail.push("verify_admin expert dashboard must not show main wallet footer");
if (verifyAdminMypageShowsRollingStrip(freeAdminAiOnly) !== true)
  fail.push("verify_admin aiOnly must show rolling strip");
if (verifyAdminMypageShowsRollingStrip(freeAdminItem) !== false)
  fail.push("verify_admin expert dashboard must not show rolling strip");
if (verifyAdminMypageShowsRollingStrip(paidItem) !== false)
  fail.push("verify_admin expert dashboard must not show rolling strip");
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
const verifyAdminSidePanelBody = mypagePageSrc.slice(
  mypagePageSrc.indexOf("function VerifyAdminMypageSidePanel"),
  mypagePageSrc.indexOf("/** 일반 고객")
);
const sideSummaryIdx = verifyAdminSidePanelBody.indexOf("VerifyAdminApplicationSummaryCard");
const sideNotifIdx = verifyAdminSidePanelBody.indexOf("GeneralCustomerNotificationCard");
const sideEmergencyIdx = verifyAdminSidePanelBody.indexOf("EmergencyHelpCard");
if (sideEmergencyIdx < 0)
  fail.push("F-16 verify_admin aiOnly slim aside must include EmergencyHelpCard");
if (sideSummaryIdx < 0 || sideNotifIdx < sideSummaryIdx || sideEmergencyIdx < sideNotifIdx)
  fail.push("F-16 slim aside order must be summary → notification → emergency help");
if (verifyAdminSidePanelBody.includes("mobileExpertAccordion"))
  fail.push("F-16 free emergency help must not use expert mobile accordion");
if (MYPAGE_WALLET_SLOT_TITLE_CLASS.includes("min-h-[2.75rem]"))
  fail.push("F-16 wallet slot title must not use fixed min-h 2-line reserve");
if (/min-h-\[(132|190)px\]\s+flex-1/.test(mypagePageSrc))
  fail.push("F-16 free wallet preview must use fixed preview height not flex-1 stretch");
if (!mypagePageSrc.includes('previewHeight = legacyPreviewHeight'))
  fail.push("F-16 wallet preview height must use legacy d2871f8 fixed heights");
if (!mypagePageSrc.includes("flex min-w-[420px] items-start"))
  fail.push("StepProgress inner track must match d2871f8 min-w-[420px] for non-free-global layout");
if (/<main className="[^"]*overflow-x-hidden/.test(mypagePageSrc))
  fail.push("main must not use global overflow-x-hidden (F-12 restore)");
if (!mypagePageSrc.includes("freeVerifyAdminLegibilityLayout"))
  fail.push("wallet F-11 legibility must be gated by freeVerifyAdminLegibilityLayout");
if (!mypagePageSrc.includes("function VerifyAdminExpertFlowDashboard"))
  fail.push("verify_admin expertFlow must use VerifyAdminExpertFlowDashboard (d2871f8 block)");
if (!mypagePageSrc.includes('activeItem.serviceType === "verify_admin"'))
  fail.push("verify_admin expertFlow must branch on serviceType not phase2Complete alone");
const expertDashboardBody = mypagePageSrc.slice(
  mypagePageSrc.indexOf("function VerifyAdminExpertFlowDashboard"),
  mypagePageSrc.indexOf("function Dashboard(")
);
if (expertDashboardBody.includes("VerifyAdminMypageMainWalletFooter"))
  fail.push("expert dashboard must not include main wallet footer");
if (expertDashboardBody.includes("VerifyAdminMypageSidePanel"))
  fail.push("expert dashboard must not include slim side panel");
if (expertDashboardBody.includes("VerifyAdminMypageRollingStrip"))
  fail.push("expert dashboard must not include rolling strip");
if (expertDashboardBody.includes("내 신청 요약"))
  fail.push("expert dashboard must not include application summary card");
if (
  !expertDashboardBody.includes("hideRecommended={verifyAdminPaid}") ||
  !expertDashboardBody.includes("verifyAdminExpertMobileAccordion")
)
  fail.push("expert dashboard must include ExpertMainSupport with hideRecommended and mobile accordion (F-15)");
if (!expertDashboardBody.includes("VerifyAdminExpertMobileCollapsibleSection"))
  fail.push("expert dashboard mobile block must use VerifyAdminExpertMobileCollapsibleSection (F-15)");
if (!mypagePageSrc.includes("function VerifyAdminExpertMobileCollapsibleSection"))
  fail.push("F-15 mobile collapsible helper must exist");
if (!mypagePageSrc.includes("mobileExpertAccordion={verifyAdminExpertMobileAccordion}"))
  fail.push("F-15 wallet mobile accordion prop must be wired from ExpertMainSupport");
if (!expertDashboardBody.includes("EmergencyHelpCard item={activeItem} mobileExpertAccordion"))
  fail.push("F-15 expert mobile grid must include EmergencyHelpCard with mobile accordion");
const f15FivePanelIds = [
  "verify-admin-expert-wallet-panel",
  "verify-admin-expert-emergency-panel",
  "verify-admin-expert-kr-public-links",
  "verify-admin-expert-vn-public-links",
  "verify-admin-expert-vietnam-life",
];
for (const panelId of f15FivePanelIds) {
  if (!mypagePageSrc.includes(panelId))
    fail.push(`F-15 missing accordion panel id: ${panelId}`);
}
if (!mypagePageSrc.includes('aria-controls="verify-admin-expert-emergency-panel"'))
  fail.push("F-15 emergency mobile toggle must use aria-controls");
const f15CollapsibleHelper = mypagePageSrc.slice(
  mypagePageSrc.indexOf("function VerifyAdminExpertMobileCollapsibleSection"),
  mypagePageSrc.indexOf("function HeroCard")
);
const f15ToggleCount = (f15CollapsibleHelper.match(/aria-expanded=\{open\}/g) ?? []).length;
if (f15ToggleCount < 1)
  fail.push("F-15 collapsible helper must use aria-expanded on toggle button");
const f15MobileExpertSlice = expertDashboardBody.slice(
  expertDashboardBody.indexOf('className="mt-4 grid gap-5 xl:hidden"'),
  expertDashboardBody.lastIndexOf("VerifyAdminExpertMobileCollapsibleSection")
);
if ((f15MobileExpertSlice.match(/VerifyAdminExpertMobileCollapsibleSection/g) ?? []).length < 3)
  fail.push("F-15 expert mobile grid must wrap 3 link/life cards in collapsible sections");
if (!f15CollapsibleHelper.includes("useState(false)"))
  fail.push("F-15 collapsible sections must default to collapsed (useState false)");
if (!mypagePageSrc.includes('aria-controls="verify-admin-expert-wallet-panel"'))
  fail.push("F-15 wallet mobile toggle must use aria-controls");
if (!mypagePageSrc.includes("min-h-[44px] w-full items-center justify-between gap-3 text-left xl:hidden"))
  fail.push("F-15 wallet mobile toggle must use xl:hidden and min touch height");
if (!mypagePageSrc.includes("hidden xl:flex") || !mypagePageSrc.includes("hidden xl:block"))
  fail.push("F-15 PC wallet/content must stay visible with xl:flex / xl:block");
if (expertDashboardBody.includes('<PublicLinksCard title="바로가기 (한국 공공기관)" links={PUBLIC_LINKS} />'))
  fail.push("F-15 must not use always-expanded PublicLinksCard in expert mobile grid");
if (!mypagePageSrc.includes("contentOnly"))
  fail.push("F-15 mobile accordion bodies must use contentOnly cards");
if (!f15CollapsibleHelper.includes("className=\"flex min-h-[44px]"))
  fail.push("F-15 collapsible toggle must meet min touch height");
if (!mypagePageSrc.includes("ExpertAsideSupport"))
  fail.push("PC aside must include ExpertAsideSupport path for expert dashboard");

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
