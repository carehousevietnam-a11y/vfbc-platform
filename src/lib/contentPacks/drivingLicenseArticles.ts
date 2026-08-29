import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList, PROCESS_BY_GROUP } from "@/lib/anonymousLegalGuide";
import { getCostCheckService } from "@/lib/costCheck";
import {
  buildCaseOrientedQa,
  buildCaseOrientedSections,
  DRIVING_NARRATIVE,
} from "@/lib/contentPacks/guideCaseNarrative";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

export const DRIVING_LICENSE_GUIDE_SLUG = "driving-license-process-and-cost";

const UPDATED = "2026-08-28";
const DRIVING_DOCS = getAnonymousDocumentList("driving-license");
const DRIVING_REQUIRED = getRequiredDocuments("driving-license");
const DRIVING_COST = getCostCheckService("driving-license");
const DRIVING_RELATED_LAWS = [
  "관련 법령: 04/2016/TT-BNG, 47/2014/QH13 (구체 조항은 이 페이지에 없습니다)",
];
const DRIVING_PROCESS_STEPS = [
  "서류 준비",
  "관할 출입국·거주 관리 기관 신청",
  "심사 후 발급 — 유형에 따라 추가 서류를 요청받을 수 있음",
];
const DRIVING_DURATION_NOTE =
  "유형에 따라 추가 서류 요청이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.";

export const DRIVING_LICENSE_GUIDE_ARTICLE: PublishedArticle = {
  slug: DRIVING_LICENSE_GUIDE_SLUG,
  intentId: "driving-license-guide",
  serviceType: "driving-license",
  serviceLabel: DRIVING_REQUIRED.serviceLabel,
  title: "베트남 외국인 운전면허 전환 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "외국인 운전면허 전환은 서류 준비 → 관할 기관 신청 → 심사 후 발급 순으로 진행됩니다. 핵심 서류는 여권, 거주증(TRC), 본국 운전면허, 번역공증본이며, 정부 수수료는 국가공공서비스 포털 기준 참고값을 확인하세요.",
  updatedAt: UPDATED,
  articleType: "info",
  funnelHref: "/check/driving-license",
  funnelCtaLabel: "내 상황을 직접 확인하기",
  caseLanding: {
    question:
      "베트남 외국인 운전면허 전환 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
    directAnswer: `진행은 ${DRIVING_PROCESS_STEPS[0]} → ${DRIVING_PROCESS_STEPS[1]} → ${DRIVING_PROCESS_STEPS[2].replace(
      / —.*/,
      ""
    )} 순으로 보시면 되고, 핵심 서류는 ${DRIVING_REQUIRED.documents.join(", ")}입니다. 비용은 정부 수수료(${DRIVING_COST.governmentFee})와 번역·공증 등 추가 비용을 함께 확인하는 것이 좋습니다.`,
    why: "거주증(TRC) 보유 여부, 본국 면허 상태, 번역·공증 범위에 따라 준비물과 실비 구성이 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
    officialBasis: DRIVING_RELATED_LAWS,
    costNote: `${DRIVING_COST.lookupGuide} 정부 수수료 참고: ${DRIVING_COST.governmentFee} (출처: ${DRIVING_COST.source}).`,
    durationNote: DRIVING_DURATION_NOTE,
    process: DRIVING_PROCESS_STEPS,
    showDocuments: true,
    showOfficialCost: true,
    conditions: [
      "아래 서류 목록은 VFBCAI 플랫폼의 운전면허 전환 참고 항목입니다.",
      "거주증(TRC)과 본국 운전면허가 선행 조건으로 안내되는 경우가 많습니다.",
      "면허 앞·뒷면 추가 사진과 기존 전환 신청·보완·반려 관련 자료는 있으면 제출 항목입니다.",
    ],
    cases: [
      {
        title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
        body: "절차는 같은 흐름이고, 서류와 비용만 상황마다 달라집니다. 먼저 공통 순서와 핵심 서류를 정리한 뒤, 정부 수수료와 번역·공증 비용을 나눠 보는 것이 덜 헷갈립니다.",
      },
      {
        title: "대표적인 상황: 커뮤니티 견적과 포털 수수료가 크게 다른 경우",
        body: "포털 안내는 정부 수수료 중심으로, 커뮤니티 견적은 번역·공증·대행이 섞여 있을 수 있습니다. 정부 수수료와 추가 비용이 함께 포함됐는지부터 확인하세요.",
      },
    ],
    comparison: [
      {
        label: "진행",
        text: PROCESS_BY_GROUP.check,
      },
      {
        label: "서류",
        text: `우선 제출: ${DRIVING_REQUIRED.documents.join(", ")}. 있으면 제출: ${(DRIVING_REQUIRED.optionalDocuments ?? []).join(", ")}.`,
      },
      {
        label: "비용",
        text: `${DRIVING_COST.governmentFee} (출처: ${DRIVING_COST.source}). 견적 비교 시 번역·공증 포함 여부를 확인하세요.`,
      },
    ],
    cautions: [
      "거주증(TRC) 없이 면허 전환만 가능하다고 단정하는 경우",
      "정부 수수료만 보고 번역·공증 비용을 빠뜨리는 경우",
      "본국 면허 원본·번역공증본 준비를 확인하지 않고 진행을 단정하는 경우",
    ],
    qa: buildCaseOrientedQa(DRIVING_REQUIRED.serviceLabel, DRIVING_NARRATIVE, [
      {
        q: "외국인 운전면허 전환 진행 순서는 어떻게 되나요?",
        a: PROCESS_BY_GROUP.check,
      },
      {
        q: "어떤 서류를 먼저 준비하면 되나요?",
        a: `참고 목록 기준 우선 제출은 ${DRIVING_REQUIRED.documents.join(", ")}입니다. 면허 앞·뒷면 추가 사진과 기존 전환 신청·보완·반려 관련 자료는 있으면 제출 항목입니다.`,
      },
      {
        q: "비용은 어디까지가 정부 수수료인가요?",
        a: `${DRIVING_COST.lookupGuide} 참고 정부 수수료는 ${DRIVING_COST.governmentFee}이며, 출처는 ${DRIVING_COST.source}입니다.`,
      },
    ]),
    relatedQuestions: [],
    sources: [
      {
        label: "VFBCAI 참고 서류 목록",
        detail:
          "같은 플랫폼의 운전면허 전환 서류 항목(우선 제출·있으면 제출). 법령 조항에서 추출한 확정 목록이 아닙니다.",
      },
      {
        label: DRIVING_COST.source,
        detail: `정부 수수료 ${DRIVING_COST.governmentFee} — 비용 안내에만 사용`,
      },
      {
        label: "04/2016/TT-BNG, 47/2014/QH13",
        detail: "관련 법령 번호(참고). 위 서류 목록의 근거로 인용하지 않습니다.",
      },
    ],
  },
  sections: buildCaseOrientedSections(DRIVING_NARRATIVE, [
    { type: "h2", text: "진행 순서" },
    { type: "p", text: PROCESS_BY_GROUP.check },
    { type: "h2", text: "필요 서류 (참고)" },
    { type: "bullets", items: DRIVING_DOCS },
    {
      type: "p",
      text: "거주증·본국 면허 상태에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "비용은 어떻게 보나요?" },
    {
      type: "p",
      text: `${DRIVING_COST.lookupGuide} 참고 정부 수수료는 ${DRIVING_COST.governmentFee}이며, 출처는 ${DRIVING_COST.source}입니다. 견적은 정부 수수료와 번역·공증 비용이 함께 포함됐는지 확인하세요.`,
    },
    { type: "h2", text: "관련 법령 (참고)" },
    {
      type: "p",
      text: "체류·거주와 관련해 자주 언급되는 법령으로 04/2016/TT-BNG, 47/2014/QH13 등이 있습니다. 다만 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.",
    },
  ]),
};

export const DRIVING_LICENSE_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [DRIVING_LICENSE_GUIDE_ARTICLE.slug]: DRIVING_LICENSE_GUIDE_ARTICLE,
};
