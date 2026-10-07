/**
 * G항 — 슬롯 미전달 시 Admin 1차 SSR subtitle 동일 증명
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AdminVerifyFirstResultPanel,
  FIRST_RESULT_DEFAULT_NO_RISK_BODY,
  FIRST_RESULT_DEFAULT_NO_RISK_TITLE,
} from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const sampleData = {
  stageLabel: "검토",
  statusHeadline: "확인이 필요한 부분이 있습니다",
  statusTone: "caution",
  situationSummary: "입력하신 내용을 바탕으로 1차 자가진단한 결과, 몇 가지는 직접 한 번 더 확인해 보시는 편이 좋겠습니다.",
  gradeFilled: 2,
  gradeLabel: "주의 요망 (2단계)",
  keyMetrics: [
    { label: "01. 상황", title: "t", footnote: "f1", status: "ok" },
    { label: "02. 확인 목표", title: "t", footnote: "f2", status: "caution" },
    { label: "03. 대응·자료", title: "t", footnote: "f3", status: "ok" },
  ],
  cautions: ["주의 항목"],
  unconfirmed: [],
  actions: ["a1"],
  referenceDateLabel: "2026.10.07",
  caseClassificationLabel: "CASE",
};

function strip(html) {
  return html.replace(/\s+/g, " ").trim();
}

const withoutSlots = strip(
  renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data: sampleData,
      onContinue: () => {},
      domain: "admin",
    }),
  ),
);

const withEmptyFirstResult = strip(
  renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data: sampleData,
      onContinue: () => {},
      domain: "admin",
      contentSlots: {},
    }),
  ),
);

const emptyCautionsData = { ...sampleData, cautions: [] };

const noRiskWithoutSlots = strip(
  renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data: emptyCautionsData,
      onContinue: () => {},
      domain: "admin",
    }),
  ),
);

const noRiskWithEmptySlots = strip(
  renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data: emptyCautionsData,
      onContinue: () => {},
      domain: "admin",
      contentSlots: {},
    }),
  ),
);

const identical = withoutSlots === withEmptyFirstResult;
const noRiskIdentical = noRiskWithoutSlots === noRiskWithEmptySlots;
const hasDefaultSubtitle = withoutSlots.includes("반려 방지 핵심 포인트");
const hasDefaultNoRisk =
  noRiskWithoutSlots.includes(FIRST_RESULT_DEFAULT_NO_RISK_TITLE) &&
  noRiskWithoutSlots.includes(FIRST_RESULT_DEFAULT_NO_RISK_BODY);

console.log(
  JSON.stringify(
    { identical, noRiskIdentical, hasDefaultSubtitle, hasDefaultNoRisk, length: withoutSlots.length },
    null,
    2,
  ),
);
if (!identical || !noRiskIdentical || !hasDefaultSubtitle || !hasDefaultNoRisk) process.exit(1);
