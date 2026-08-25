import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList, PROCESS_BY_GROUP } from "@/lib/anonymousLegalGuide";
import { getCostCheckService } from "@/lib/costCheck";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

export const WP_GUIDE_SLUG = "wp-process-and-cost";

const UPDATED = "2026-08-22";
const WP_DOCS = getAnonymousDocumentList("wp");
const WP_REQUIRED = getRequiredDocuments("wp");
const WP_COST = getCostCheckService("wp");
const WP_RELATED_LAWS = [
  "관련 법령: 152/2020/NĐ-CP, 11/2020/TT-BLĐTBXH (구체 조항은 이 페이지에 없습니다)",
];
const WP_PROCESS_STEPS = [
  "서류 준비",
  "관할 출입국·거주 관리 기관 신청",
  "심사 후 발급 — 유형에 따라 추가 서류를 요청받을 수 있음",
];
const WP_DURATION_NOTE =
  "유형에 따라 추가 서류 요청이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.";

export const WP_GUIDE_ARTICLE: PublishedArticle = {
  slug: WP_GUIDE_SLUG,
  intentId: "wp-guide",
  serviceType: "wp",
  serviceLabel: WP_REQUIRED.serviceLabel,
  title: "베트남 노동허가(WP) 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "노동허가(WP)는 서류 준비 → 관할 기관 신청 → 심사 후 발급 순으로 진행됩니다. 핵심 서류는 여권, 학력증명서, 범죄경력증명서, 건강진단서이며, 비용은 정부 수수료와 대행·번역 비용을 함께 확인하세요.",
  updatedAt: UPDATED,
  articleType: "info",
  funnelHref: "/check/wp",
  funnelCtaLabel: "내 상황 확인하기",
  caseLanding: {
    question:
      "베트남 노동허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
    directAnswer: `진행은 ${WP_PROCESS_STEPS[0]} → ${WP_PROCESS_STEPS[1]} → ${WP_PROCESS_STEPS[2].replace(
      / —.*/,
      ""
    )} 순으로 보시면 되고, 핵심 서류는 ${WP_REQUIRED.documents.join(", ")}입니다. 비용은 정부 수수료(${WP_COST.governmentFee})와 대행·번역 비용을 함께 확인하는 것이 좋습니다.`,
    why: "학력·경력·직무 형태, 회사 제출 방식, 관할 지역에 따라 준비물과 수수료가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
    officialBasis: WP_RELATED_LAWS,
    costNote: `${WP_COST.lookupGuide} 정부 수수료 참고: ${WP_COST.governmentFee} (출처: ${WP_COST.source}).`,
    durationNote: WP_DURATION_NOTE,
    process: WP_PROCESS_STEPS,
    showDocuments: true,
    showOfficialCost: true,
    conditions: [
      "아래 서류 목록은 VFBCAI 플랫폼의 노동허가(WP) 참고 항목입니다.",
      "회사 HR이 대행하는 경우도 있고, 본인이 직접 준비하는 경우도 있습니다.",
      "재직·경력 관련 자료와 기존 노동허가·보완·반려 관련 자료는 있으면 제출 항목입니다.",
    ],
    cases: [
      {
        title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
        body: "절차는 같은 흐름이고, 서류와 비용만 상황마다 달라집니다. 먼저 공통 순서와 핵심 서류를 정리한 뒤, 정부 수수료와 견적 범위를 나눠 보는 것이 덜 헷갈립니다.",
      },
      {
        title: "대표적인 상황: 회사 안내와 커뮤니티 견적이 크게 다른 경우",
        body: "회사 안내는 회사 제출분에, 커뮤니티 견적은 대행·번역·지역 수수료가 섞여 있을 수 있습니다. 정부 수수료와 대행 비용이 함께 포함됐는지부터 확인하세요.",
      },
    ],
    comparison: [
      {
        label: "진행",
        text: PROCESS_BY_GROUP.check,
      },
      {
        label: "서류",
        text: `우선 제출: ${WP_REQUIRED.documents.join(", ")}. 있으면 제출: ${(WP_REQUIRED.optionalDocuments ?? []).join(", ")}.`,
      },
      {
        label: "비용",
        text: `${WP_COST.governmentFee} (출처: ${WP_COST.source}). 견적 비교 시 대행·번역 포함 여부를 확인하세요.`,
      },
    ],
    cautions: [
      "회사 서류만 준비하면 된다고 생각하고 본인 여권·학력증명서를 빠뜨리는 경우",
      "정부 수수료 없이 대행료만 보고 비교하는 경우",
      "관할 지역 수수료 차이를 확인하지 않고 견적을 단정하는 경우",
    ],
    qa: [
      {
        q: "노동허가 진행 순서는 어떻게 되나요?",
        a: PROCESS_BY_GROUP.check,
      },
      {
        q: "어떤 서류를 먼저 준비하면 되나요?",
        a: `참고 목록 기준 우선 제출은 ${WP_REQUIRED.documents.join(", ")}입니다. 재직·경력 관련 자료와 기존 노동허가·보완·반려 관련 자료는 있으면 제출 항목입니다.`,
      },
      {
        q: "비용은 어디까지가 정부 수수료인가요?",
        a: `${WP_COST.lookupGuide} 참고 정부 수수료는 ${WP_COST.governmentFee}이며, 출처는 ${WP_COST.source}입니다.`,
      },
    ],
    relatedQuestions: [],
    sources: [
      {
        label: "VFBCAI 참고 서류 목록",
        detail: "같은 플랫폼의 노동허가(WP) 서류 항목(우선 제출·있으면 제출). 법령 조항에서 추출한 확정 목록이 아닙니다.",
      },
      {
        label: WP_COST.source,
        detail: `정부 수수료 ${WP_COST.governmentFee} — 비용 안내에만 사용`,
      },
      {
        label: "152/2020/NĐ-CP, 11/2020/TT-BLĐTBXH",
        detail: "관련 법령 번호(참고). 위 서류 목록의 근거로 인용하지 않습니다.",
      },
    ],
  },
  sections: [
    {
      type: "p",
      text: "베트남 노동허가(Work Permit, WP)를 준비할 때 진행 순서, 필요 서류, 비용을 한꺼번에 정리하고 싶은 경우가 많습니다. 아래는 VFBCAI가 같은 플랫폼 데이터를 바탕으로 정리한 참고용 가이드입니다.",
    },
    { type: "h2", text: "진행 순서" },
    {
      type: "p",
      text: PROCESS_BY_GROUP.check,
    },
    { type: "h2", text: "필요 서류 (참고)" },
    {
      type: "bullets",
      items: WP_DOCS,
    },
    {
      type: "p",
      text: "학력·경력·직무 형태에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "비용은 어떻게 보나요?" },
    {
      type: "p",
      text: `${WP_COST.lookupGuide} 참고 정부 수수료는 ${WP_COST.governmentFee}이며, 출처는 ${WP_COST.source}입니다. 견적은 정부 수수료와 대행·번역 비용이 함께 포함됐는지 확인하세요.`,
    },
    { type: "h2", text: "관련 법령 (참고)" },
    {
      type: "p",
      text: "노동허가와 관련해 자주 언급되는 법령으로 152/2020/NĐ-CP, 11/2020/TT-BLĐTBXH 등이 있습니다. 다만 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.",
    },
  ],
};

export const WP_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [WP_GUIDE_ARTICLE.slug]: WP_GUIDE_ARTICLE,
};
