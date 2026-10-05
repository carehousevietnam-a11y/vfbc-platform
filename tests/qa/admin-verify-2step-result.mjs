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
  formatAdminVerifyAiReportContentPlainText,
  adminVerifyFreePdfTextContainsInternalCodes,
  resolveAdminPhase1SimpleUploadFromActivities,
  ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER,
  ADMIN_VERIFY_FREE_PDF_EMPTY_FINDINGS_LINE,
  ADMIN_VERIFY_FREE_PDF_EXECUTIVE_HEADLINE,
  ADMIN_VERIFY_FREE_PDF_EXECUTIVE_SUBLINE,
  ADMIN_VERIFY_FREE_PDF_METRIC_REQUIREMENTS,
  ADMIN_VERIFY_FREE_PDF_METRIC_GAPS,
  ADMIN_VERIFY_FREE_PDF_METRIC_STATUS,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_NEXT_ACTION,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_WITH_UPLOAD,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_WITH_UPLOAD,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD,
  isAdminVerifyFreePdfTrafficAuthority,
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

const { buildMypagePdfBytesForQaHarness } = await import("../../src/lib/mypagePdfExecutiveRender.ts");
const { PDFDocument } = await import("pdf-lib");
const { createRequire } = await import("node:module");
const require = createRequire(path.join(repoRoot, "package.json"));
const { PDFParse } = require("pdf-parse");

const F18D_FREE_SHELL_FORBIDDEN = ["문서 검토 완료", "진단 완료", "5/5", "0건"];
const F18D_FREE_SHELL_REQUIRED = [
  ADMIN_VERIFY_FREE_PDF_EXECUTIVE_HEADLINE,
  ADMIN_VERIFY_FREE_PDF_EXECUTIVE_SUBLINE,
  ADMIN_VERIFY_FREE_PDF_METRIC_REQUIREMENTS,
  ADMIN_VERIFY_FREE_PDF_METRIC_GAPS,
  ADMIN_VERIFY_FREE_PDF_METRIC_STATUS,
  ADMIN_VERIFY_FREE_PDF_DASHBOARD_NEXT_ACTION,
];

const PAID_PDF_SHELL_365F401 = {
  mustInclude: [
    "문서 검토 완료",
    "현재 입력자료 기준으로 우선 검토가 완료되었습니다.",
    "진단 완료",
  ],
  mustExclude: [
    ADMIN_VERIFY_FREE_PDF_EXECUTIVE_HEADLINE,
    ADMIN_VERIFY_FREE_PDF_METRIC_REQUIREMENTS,
    ADMIN_VERIFY_FREE_PDF_METRIC_GAPS,
    ADMIN_VERIFY_FREE_PDF_DASHBOARD_NEXT_ACTION,
  ],
};

async function extractVerifyAdminMypagePdf(activities, leadId) {
  const bytes = await buildMypagePdfBytesForQaHarness({
    leadId,
    serviceType: "verify_admin",
    result: "conditional",
    createdAt: "2026-01-01T00:00:00.000Z",
    activities,
  });
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPageCount();
  const parser = new PDFParse({ data: Buffer.from(bytes) });
  const parsed = await parser.getText();
  await parser.destroy();
  return { pages, text: parsed.text ?? "" };
}

function assertF18dFreePdfShell(label, pdfText) {
  for (const forbidden of F18D_FREE_SHELL_FORBIDDEN) {
    if (pdfText.includes(forbidden)) {
      fail.push(`F-18d ${label}: free PDF shell must not contain "${forbidden}"`);
    }
  }
  for (const required of F18D_FREE_SHELL_REQUIRED) {
    if (!pdfText.includes(required)) {
      fail.push(`F-18d ${label}: free PDF shell must contain "${required}"`);
    }
  }
}

function assertF18dFreeBodyGuards(label, content) {
  if (!content || content.includesPhase2Block) {
    fail.push(`F-18d ${label}: must be free PDF content`);
    return;
  }
  const plain = formatAdminVerifyAiReportContentPlainText(content);
  if (plain.includes("고객 상황 · 행정문서")) {
    fail.push(`F-18d ${label}: must not contain 고객 상황 · 행정문서`);
  }
  const goalLine = content.execSummary.find((line) => line.startsWith("확인 목적 ·"));
  const goalText = goalLine?.replace(/^확인 목적 ·\s*/, "") ?? "";
  if (goalText) {
    const plainBeforeActions = plain.split("RECOMMENDED ACTIONS")[0] ?? plain;
    if (countOccurrences(plainBeforeActions, goalText) > 1) {
      fail.push(`F-18d ${label}: 확인 목적 sentence must appear once`);
    }
    if (plainBeforeActions.includes(`✓ 확인 목적 · ${goalText}`)) {
      fail.push(`F-18d ${label}: must not duplicate 확인 목적 in EVIDENCE`);
    }
  }
}

function assertF18eDashboardInputScope(label, content, expectUploadInInputScope) {
  if (!content?.executiveDashboardSupplementLines?.length) {
    fail.push(`F-18e ${label}: missing dashboard supplement lines`);
    return;
  }
  const inputScopeLine = content.executiveDashboardSupplementLines[0] ?? "";
  if (expectUploadInInputScope) {
    if (!inputScopeLine.includes("간단 업로드 제출 사실")) {
      fail.push(`F-18e ${label}: upload sample must include 간단 업로드 제출 사실 in 입력 범위`);
    }
  } else {
    if (inputScopeLine !== ADMIN_VERIFY_FREE_PDF_DASHBOARD_INPUT_SCOPE_NO_UPLOAD) {
      fail.push(`F-18e ${label}: no-upload sample must use short 입력 범위 line`);
    }
    if (inputScopeLine.includes("업로드")) {
      fail.push(`F-18e ${label}: no-upload sample must not mention 업로드 in 입력 범위`);
    }
  }
}

function assertF18fReviewScopeLine(label, content, expectUpload) {
  if (!content?.executiveDashboardSupplementLines?.[1]) {
    fail.push(`F-18f ${label}: missing 검토 범위 supplement line`);
    return;
  }
  const reviewLine = content.executiveDashboardSupplementLines[1];
  if (expectUpload) {
    if (reviewLine !== ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_WITH_UPLOAD) {
      fail.push(`F-18f ${label}: upload sample must use short 검토 범위 with upload wording`);
    }
  } else {
    if (reviewLine !== ADMIN_VERIFY_FREE_PDF_DASHBOARD_REVIEW_SCOPE_NO_UPLOAD) {
      fail.push(`F-18f ${label}: no-upload sample must use no-upload 검토 범위 line`);
    }
    if (reviewLine.includes("제출 파일")) {
      fail.push(`F-18f ${label}: no-upload 검토 범위 must not contain 제출 파일`);
    }
  }
}

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

const trafficGoal = "이 통지가 제 상황에 해당하는지 확인하고 싶습니다";
const f18ScenarioTrafficUpload = [
  {
    action: "verify_lead",
    meta: {
      storagePath: "verify-admin/lead-traffic/notice.pdf",
      submitted_document: { document_type: "통지서" },
      admin_verify_answers_json: JSON.stringify({
        caseCustomerInput: trafficGoal,
        case01_authorityDemand: "traffic",
      }),
      case_resolution_json: JSON.stringify({
        goal: { value: trafficGoal },
        authority: { value: "교통국·운전면허 관련 기관" },
        document: { value: "위반 통지서" },
        currentStage: { value: "통지 수령 직후" },
        riskSignals: [],
      }),
    },
  },
];

const f18ScenarioOtherNoUpload = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({
        case01_authorityDemand: "payment",
        caseCustomerInput: "세무 관련 안내를 받았습니다.",
      }),
      case_resolution_json: JSON.stringify({
        goal: { value: "안내 내용이 제 경우에 해당하는지 확인" },
        authority: { value: "세무·납세 관련 기관" },
        document: { value: "납부 안내" },
        riskSignals: [],
      }),
    },
  },
];

const f18ScenarioSparse = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "payment" }),
      case_resolution_json: JSON.stringify({
        goal: { value: "행정 통지 대응" },
        riskSignals: [],
      }),
    },
  },
];

const f18TrafficContent = buildAdminVerifyAiReportContentFromActivities(
  f18ScenarioTrafficUpload,
  "lead-traffic",
);
const f18OtherContent = buildAdminVerifyAiReportContentFromActivities(
  f18ScenarioOtherNoUpload,
  "lead-other",
);
const f18SparseContent = buildAdminVerifyAiReportContentFromActivities(
  f18ScenarioSparse,
  "lead-sparse",
);

const f18ScenarioCustomImmigration = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "immigration" }),
      case_resolution_json: JSON.stringify({
        goal: { value: "체류 관련 안내 확인" },
        authority: { value: "출입국·외국인등록·거주 관련 기관" },
        document: { value: "체류 안내" },
        riskSignals: [],
      }),
    },
  },
];

const f18ScenarioCustomTrafficOtherDoc = [
  {
    action: "verify_lead",
    meta: {
      admin_verify_answers_json: JSON.stringify({ case01_authorityDemand: "traffic" }),
      case_resolution_json: JSON.stringify({
        goal: { value: "안내 내용 확인" },
        authority: { value: "교통국·운전면허 관련 기관" },
        document: { value: "행정 안내" },
        riskSignals: [],
      }),
    },
  },
];

const f18CustomImmigrationContent = buildAdminVerifyAiReportContentFromActivities(
  f18ScenarioCustomImmigration,
  "lead-custom-imm",
);
const f18CustomTrafficOtherDocContent = buildAdminVerifyAiReportContentFromActivities(
  f18ScenarioCustomTrafficOtherDoc,
  "lead-custom-traffic-doc",
);

function assertF18cInputAlignment(label, plain, { expectTrafficAuthority, forbidTongjiseo, expectEmptyFindingsLine }) {
  if (expectTrafficAuthority && !plain.includes("교통국")) {
    fail.push(`F-18c ${label}: traffic sample must keep 교통국 wording`);
  }
  if (expectTrafficAuthority === false && plain.includes("교통국")) {
    fail.push(`F-18c ${label}: non-traffic sample must not contain 교통국`);
  }
  if (forbidTongjiseo && plain.includes("통지서")) {
    fail.push(`F-18c ${label}: must not contain 통지서 substring`);
  }
  const hasEmptyLine = plain.includes(ADMIN_VERIFY_FREE_PDF_EMPTY_FINDINGS_LINE);
  if (expectEmptyFindingsLine && !hasEmptyLine) {
    fail.push(`F-18c ${label}: sparse sample must include empty-findings line`);
  }
  if (expectEmptyFindingsLine === false && hasEmptyLine) {
    fail.push(`F-18c ${label}: must not include empty-findings line`);
  }
  if (plain.includes("이previous")) {
    fail.push(`F-18c ${label}: must not contain 이previous typo`);
  }
}

function assertF18cCustomSample(label, content, authorityValue, documentValue) {
  if (!content || content.includesPhase2Block) {
    fail.push(`F-18c ${label}: must be free content`);
    return;
  }
  const plain = formatAdminVerifyAiReportContentPlainText(content);
  if (documentValue && !plain.includes(documentValue)) {
    fail.push(`F-18c ${label}: must reflect document input`);
  }
  if (authorityValue && !plain.includes(authorityValue)) {
    fail.push(`F-18c ${label}: must reflect authority input`);
  }
  const traffic = isAdminVerifyFreePdfTrafficAuthority(authorityValue);
  if (!traffic && plain.includes("교통국")) {
    fail.push(`F-18c ${label}: must not inject 교통국 for non-traffic authority`);
  }
  if (traffic && !plain.includes("교통국")) {
    fail.push(`F-18c ${label}: traffic authority must keep 교통국 mandatory lines`);
  }
  const docTrim = documentValue?.trim() ?? "";
  if (docTrim && !docTrim.includes("통지서") && plain.includes("통지서")) {
    fail.push(`F-18c ${label}: must not inject 통지서 when document input has none`);
  }
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    const at = haystack.indexOf(needle, idx);
    if (at < 0) break;
    count += 1;
    idx = at + needle.length;
  }
  return count;
}

function assertFreePdfGuards(label, activities, content, expectUploadLines) {
  if (!content || content.includesPhase2Block) {
    fail.push(`F-18 ${label}: must be free content without phase2 block`);
    return;
  }
  const plain = formatAdminVerifyAiReportContentPlainText(content);
  if (adminVerifyFreePdfTextContainsInternalCodes(plain)) {
    fail.push(`F-18 ${label}: plain text must not contain internal codes`);
  }
  if (/2차|admin_phase2|phase2_upload|document-upload\//.test(plain)) {
    fail.push(`F-18 ${label}: free PDF must not contain phase2-related strings`);
  }
  const goalLine = content.execSummary.find((line) => line.startsWith("확인 목적 ·"));
  const goalText = goalLine?.replace(/^확인 목적 ·\s*/, "") ?? "";
  const plainBeforeActions = plain.split("RECOMMENDED ACTIONS")[0] ?? plain;
  if (goalText && countOccurrences(plainBeforeActions, goalText) > 1) {
    fail.push(`F-18 ${label}: customer goal must appear once (exec summary only)`);
  }
  const hasImmediate = content.recommendedAction.some((line) => line.includes("즉시"));
  const hasNext = content.recommendedAction.some((line) => line.includes("다음"));
  const hasFinal = content.recommendedAction.some((line) => line.includes("최종"));
  if (!hasImmediate || !hasNext || !hasFinal) {
    fail.push(`F-18 ${label}: recommended actions must include immediate/next/final steps`);
  }
  const upload = resolveAdminPhase1SimpleUploadFromActivities(
    activities,
    JSON.parse(activities[0].meta.admin_verify_answers_json),
  );
  const hasSubmitLine = plain.includes("제출 자료 ·");
  const hasDisclaimer = plain.includes(ADMIN_VERIFY_FREE_PDF_PHASE1_UPLOAD_DISCLAIMER);
  if (expectUploadLines) {
    if (!upload) fail.push(`F-18 ${label}: fixture must resolve phase1 upload`);
    if (!hasSubmitLine || !hasDisclaimer) {
      fail.push(`F-18 ${label}: upload fixture must include submit line and disclaimer`);
    }
  } else if (hasSubmitLine || hasDisclaimer) {
    fail.push(`F-18 ${label}: no-upload fixture must omit submit/disclaimer lines`);
  }
  if (!content.mandatoryDocumentLines?.length) {
    fail.push(`F-18 ${label}: free PDF must include mandatoryDocumentLines`);
  }
  if (!content.executiveDashboardSupplementLines?.length) {
    fail.push(`F-18 ${label}: free PDF must include dashboard supplement lines`);
  }
  const detailReviewConfirmCount = (plain.match(/상세 검토에서 확인/g) ?? []).length;
  if (detailReviewConfirmCount > 1) {
    fail.push(`F-18b ${label}: detail-review disclaimer phrase must appear at most once`);
  }
  if (plain.includes("확인되지 않았으나")) {
    fail.push(`F-18b ${label}: must not contain 확인되지 않았으나`);
  }
  if (plain.includes("기본적인 상황 정리가 완료")) {
    fail.push(`F-18b ${label}: must not contain generic phase1 completion line`);
  }
}

const f18SamplePlainTexts = {
  trafficUpload: formatAdminVerifyAiReportContentPlainText(f18TrafficContent),
  otherNoUpload: formatAdminVerifyAiReportContentPlainText(f18OtherContent),
  sparse: formatAdminVerifyAiReportContentPlainText(f18SparseContent),
};

const paidRegressionExpected = {
  execSummary: [
    "결론 · 입력하신 내용 기준으로 즉시 대응이 필요한 위험요인은 확인되지 않았습니다.",
    "확인 목적 · 행정 통지 대응",
    "문서 · 위반 통지서",
  ],
  recommendedAction: ["① 다음 조치 · 통지서 원본의 기한과 요구 내용을 다시 확인해 주세요."],
  includesPhase2Block: true,
  hasMandatoryOverride: false,
  hasDashboardSupplement: false,
};

const timelineBeforeExpert = buildVerifyAdminMypageTimelineRecent({
  activityLog: [{ label: "AI 검토 완료", createdAt: "2026-01-01T00:00:00.000Z" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  hasDiagnosis: true,
  hasExpertReview: false,
  currentStepLabel: "자체 진단 완료",
});

const fail = [];
assertFreePdfGuards("traffic+upload", f18ScenarioTrafficUpload, f18TrafficContent, true);
assertFreePdfGuards("other-no-upload", f18ScenarioOtherNoUpload, f18OtherContent, false);
assertFreePdfGuards("sparse", f18ScenarioSparse, f18SparseContent, false);
assertF18cInputAlignment("traffic+upload", f18SamplePlainTexts.trafficUpload, {
  expectTrafficAuthority: true,
  forbidTongjiseo: false,
  expectEmptyFindingsLine: false,
});
assertF18cInputAlignment("other-no-upload", f18SamplePlainTexts.otherNoUpload, {
  expectTrafficAuthority: false,
  forbidTongjiseo: true,
  expectEmptyFindingsLine: false,
});
assertF18cInputAlignment("sparse", f18SamplePlainTexts.sparse, {
  expectTrafficAuthority: false,
  forbidTongjiseo: true,
  expectEmptyFindingsLine: true,
});
assertF18cCustomSample(
  "custom-immigration",
  f18CustomImmigrationContent,
  "출입국·외국인등록·거주 관련 기관",
  "체류 안내",
);
assertF18cCustomSample(
  "custom-traffic-other-doc",
  f18CustomTrafficOtherDocContent,
  "교통국·운전면허 관련 기관",
  "행정 안내",
);

const f18dPageMeasures = {};
const f18dPdfPlainSamples = {};
for (const [label, scenario, content] of [
  ["A", f18ScenarioTrafficUpload, f18TrafficContent],
  ["B", f18ScenarioOtherNoUpload, f18OtherContent],
  ["C", f18ScenarioSparse, f18SparseContent],
]) {
  const extracted = await extractVerifyAdminMypagePdf(scenario, `f18d-fixture-${label.toLowerCase()}`);
  f18dPageMeasures[label] = extracted.pages;
  f18dPdfPlainSamples[label] = extracted.text;
  if (extracted.pages !== 1) {
    fail.push(`F-18d ${label}: free PDF must be 1 page (measured ${extracted.pages})`);
  }
  assertF18dFreePdfShell(label, extracted.text);
  assertF18dFreeBodyGuards(label, content);
  assertF18eDashboardInputScope(label, content, label === "A");
  assertF18fReviewScopeLine(label, content, label === "A");
}

const paidPdfExtracted365 = await extractVerifyAdminMypagePdf(paidActivities, "f18d-paid-fixture");
for (const snippet of PAID_PDF_SHELL_365F401.mustInclude) {
  if (!paidPdfExtracted365.text.includes(snippet)) {
    fail.push(`F-18d paid PDF regression: missing 365f401 shell "${snippet}"`);
  }
}
for (const snippet of PAID_PDF_SHELL_365F401.mustExclude) {
  if (paidPdfExtracted365.text.includes(snippet)) {
    fail.push(`F-18d paid PDF regression: must not contain free shell "${snippet}"`);
  }
}

const paidRegressionSnapshot = {
  execSummary: paidPdfContent?.execSummary ?? [],
  recommendedAction: paidPdfContent?.recommendedAction ?? [],
  includesPhase2Block: paidPdfContent?.includesPhase2Block ?? false,
  hasMandatoryOverride: Boolean(paidPdfContent?.mandatoryDocumentLines?.length),
  hasDashboardSupplement: Boolean(paidPdfContent?.executiveDashboardSupplementLines?.length),
};
if (JSON.stringify(paidRegressionSnapshot) !== JSON.stringify(paidRegressionExpected)) {
  fail.push("F-18 paid PDF content regression guard failed");
}
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
if (!verifyAdminSidePanelBody.includes("collapsible"))
  fail.push("F-16 free emergency help must use collapsible accordion on PC and mobile");
if (!mypagePageSrc.includes("verify-admin-free-emergency-panel"))
  fail.push("F-16 free emergency accordion must define panel id for aria-controls");
if (!mypagePageSrc.includes("const [collapsibleOpen, setCollapsibleOpen] = useState(false)"))
  fail.push("F-16 free emergency accordion must default to collapsed");
const emergencyCardBody = mypagePageSrc.slice(
  mypagePageSrc.indexOf("function EmergencyHelpCard"),
  mypagePageSrc.indexOf("function HelpCard")
);
if (!/freeCollapsible[\s\S]*aria-expanded=\{accordionOpen\}/.test(emergencyCardBody))
  fail.push("F-16 free emergency toggle must use aria-expanded on button header");
if (!mypagePageSrc.includes("verifyAdminFreeWalletExpanded"))
  fail.push("F-17 free wallet expanded state must be lifted to MyPage");
if (!mypagePageSrc.includes("pcGovernmentLinksInAside"))
  fail.push("F-17 must wire pcGovernmentLinksInAside from wallet expanded state");
if (!mypagePageSrc.includes("function VerifyAdminFreeGovernmentLinksAsideCard"))
  fail.push("F-17 must define PC aside government links accordion card");
if (!mypagePageSrc.includes("verify-admin-free-government-links-panel"))
  fail.push("F-17 government links aside card must use aria-controls panel id");
if (!mypagePageSrc.includes("buildVerifyAdminRollingStripItems()"))
  fail.push("F-17 aside government links must reuse buildVerifyAdminRollingStripItems");
if (!mypagePageSrc.includes("verifyAdminFreeWalletExpanded ? \"xl:hidden\" : \"\""))
  fail.push("F-17 PC wallet expanded must hide bottom rolling strip with xl:hidden only");
if (!mypagePageSrc.includes("hidden xl:block"))
  fail.push("F-17 PC government links card must be hidden on mobile (xl:block wrapper)");
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
if (!emergencyCardBody.includes("verify-admin-expert-emergency-panel"))
  fail.push("F-15 emergency mobile toggle must use expert panel id for aria-controls");
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
  f18SamplePlainTexts,
  f18dPageMeasures,
  paidPdfExtracted365: { pages: paidPdfExtracted365.pages },
  paidRegressionSnapshot,
  timelineBeforeExpert,
  ok: fail.length === 0,
  fail,
};

console.log(JSON.stringify(report, null, 2));
if (fail.length > 0) process.exit(1);
