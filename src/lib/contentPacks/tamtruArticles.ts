import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList, PROCESS_BY_GROUP } from "@/lib/anonymousLegalGuide";
import { getCostCheckService } from "@/lib/costCheck";
import {
  buildCaseOrientedQa,
  buildCaseOrientedSections,
  TAMTRU_NARRATIVE,
} from "@/lib/contentPacks/guideCaseNarrative";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

export const TAMTRU_GUIDE_SLUG = "tamtru-process-and-cost";

const UPDATED = "2026-08-28";
const TAMTRU_DOCS = getAnonymousDocumentList("tamtru");
const TAMTRU_REQUIRED = getRequiredDocuments("tamtru");
const TAMTRU_COST = getCostCheckService("tamtru");
const TAMTRU_RELATED_LAWS = [
  "관련 법령: 04/2016/TT-BNG, 47/2014/QH13 (구체 조항은 이 페이지에 없습니다)",
];
const TAMTRU_PROCESS_STEPS = [
  "서류 준비",
  "관할 출입국·거주 관리 기관 신청",
  "심사 후 발급 — 유형에 따라 추가 서류를 요청받을 수 있음",
];
const TAMTRU_DURATION_NOTE =
  "유형에 따라 추가 서류 요청이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.";

export const TAMTRU_GUIDE_ARTICLE: PublishedArticle = {
  slug: TAMTRU_GUIDE_SLUG,
  intentId: "tamtru-guide",
  serviceType: "tamtru",
  serviceLabel: TAMTRU_REQUIRED.serviceLabel,
  title: "베트남 임시거주등록(땀주) 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "임시거주등록(땀주)은 서류 준비 → 관할 기관 신청 → 심사 후 발급 순으로 진행됩니다. 핵심 서류는 여권, 임대차계약서, 주소지 증빙이며, 신고 자체 정부 수수료는 무료인 경우가 많고 대행·이동 비용은 별도입니다.",
  updatedAt: UPDATED,
  articleType: "info",
  funnelHref: "/check/tamtru",
  funnelCtaLabel: "내 상황을 직접 확인하기",
  caseLanding: {
    question:
      "베트남 임시거주등록(땀주) 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
    directAnswer: `진행은 ${TAMTRU_PROCESS_STEPS[0]} → ${TAMTRU_PROCESS_STEPS[1]} → ${TAMTRU_PROCESS_STEPS[2].replace(
      / —.*/,
      ""
    )} 순으로 보시면 되고, 핵심 서류는 ${TAMTRU_REQUIRED.documents.join(", ")}입니다. 비용은 정부 수수료(${TAMTRU_COST.governmentFee})와 대행·이동·서류 준비 비용을 함께 확인하는 것이 좋습니다.`,
    why: "숙소 형태(호텔·게스트하우스 vs 개인주택·아파트), 집주인 협조 여부, 관할·시점에 따라 준비물과 실비 구성이 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
    officialBasis: TAMTRU_RELATED_LAWS,
    costNote: `${TAMTRU_COST.lookupGuide} 정부 수수료 참고: ${TAMTRU_COST.governmentFee} (출처: ${TAMTRU_COST.source}).`,
    durationNote: TAMTRU_DURATION_NOTE,
    process: TAMTRU_PROCESS_STEPS,
    showDocuments: true,
    showOfficialCost: true,
    conditions: [
      "아래 서류 목록은 VFBCAI 플랫폼의 임시거주등록(땀주) 참고 항목입니다.",
      "호텔·게스트하우스는 숙박업소가 투숙객 등록을 처리하는 경우가 많고, 개인주택·아파트는 본인·집주인 협조가 필요한 경우가 많습니다.",
      "집주인 또는 관리사무소 관련 자료와 기존 등록·보완·반려 관련 자료는 있으면 제출 항목입니다.",
    ],
    cases: [
      {
        title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
        body: "절차는 같은 흐름이고, 서류와 실비만 상황마다 달라집니다. 먼저 공통 순서와 핵심 서류를 정리한 뒤, 정부 수수료(무료인 경우)와 대행·이동 비용을 나눠 보는 것이 덜 헷갈립니다.",
      },
      {
        title: "대표적인 상황: 호텔과 개인주택 안내가 다르게 들리는 경우",
        body: "호텔·게스트하우스는 업소 측 등록 의무 안내가 많고, 개인주택은 임대계약·주소지 증빙·집주인 협조 안내가 섞여 있을 수 있습니다. 숙소 형태부터 나눈 뒤 서류를 보시면 됩니다.",
      },
    ],
    comparison: [
      {
        label: "진행",
        text: PROCESS_BY_GROUP.check,
      },
      {
        label: "서류",
        text: `우선 제출: ${TAMTRU_REQUIRED.documents.join(", ")}. 있으면 제출: ${(TAMTRU_REQUIRED.optionalDocuments ?? []).join(", ")}.`,
      },
      {
        label: "비용",
        text: `${TAMTRU_COST.governmentFee} (출처: ${TAMTRU_COST.source}). 견적 비교 시 대행·이동·서류 준비 포함 여부를 확인하세요.`,
      },
    ],
    cautions: [
      "호텔과 개인주택을 구분하지 않고 같은 서류만 준비하는 경우",
      "정부 수수료가 없다고 해서 대행·이동 비용까지 없다고 단정하는 경우",
      "집주인 협조·주소지 증빙을 확인하지 않고 진행을 단정하는 경우",
    ],
    qa: buildCaseOrientedQa(TAMTRU_REQUIRED.serviceLabel, TAMTRU_NARRATIVE, [
      {
        q: "임시거주등록(땀주) 진행 순서는 어떻게 되나요?",
        a: PROCESS_BY_GROUP.check,
      },
      {
        q: "어떤 서류를 먼저 준비하면 되나요?",
        a: `참고 목록 기준 우선 제출은 ${TAMTRU_REQUIRED.documents.join(", ")}입니다. 집주인 또는 관리사무소 관련 자료와 기존 등록·보완·반려 관련 자료는 있으면 제출 항목입니다.`,
      },
      {
        q: "비용은 어디까지가 정부 수수료인가요?",
        a: `${TAMTRU_COST.lookupGuide} 참고 정부 수수료는 ${TAMTRU_COST.governmentFee}이며, 출처는 ${TAMTRU_COST.source}입니다.`,
      },
    ]),
    relatedQuestions: [],
    sources: [
      {
        label: "VFBCAI 참고 서류 목록",
        detail:
          "같은 플랫폼의 임시거주등록(땀주) 서류 항목(우선 제출·있으면 제출). 법령 조항에서 추출한 확정 목록이 아닙니다.",
      },
      {
        label: TAMTRU_COST.source,
        detail: `정부 수수료 ${TAMTRU_COST.governmentFee} — 비용 안내에만 사용`,
      },
      {
        label: "04/2016/TT-BNG, 47/2014/QH13",
        detail: "관련 법령 번호(참고). 위 서류 목록의 근거로 인용하지 않습니다.",
      },
    ],
  },
  sections: buildCaseOrientedSections(TAMTRU_NARRATIVE, [
    { type: "h2", text: "진행 순서" },
    { type: "p", text: PROCESS_BY_GROUP.check },
    { type: "h2", text: "필요 서류 (참고)" },
    { type: "bullets", items: TAMTRU_DOCS },
    {
      type: "p",
      text: "숙소 형태·집주인 협조 여부에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "비용은 어떻게 보나요?" },
    {
      type: "p",
      text: `${TAMTRU_COST.lookupGuide} 참고 정부 수수료는 ${TAMTRU_COST.governmentFee}이며, 출처는 ${TAMTRU_COST.source}입니다. 견적은 대행·이동·서류 준비 비용이 함께 포함됐는지 확인하세요.`,
    },
    { type: "h2", text: "관련 법령 (참고)" },
    {
      type: "p",
      text: "임시거주·체류와 관련해 자주 언급되는 법령으로 04/2016/TT-BNG, 47/2014/QH13 등이 있습니다. 다만 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.",
    },
  ]),
};

export const TAMTRU_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [TAMTRU_GUIDE_ARTICLE.slug]: TAMTRU_GUIDE_ARTICLE,
};
