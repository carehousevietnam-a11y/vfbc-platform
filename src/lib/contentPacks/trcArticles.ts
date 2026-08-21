import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList } from "@/lib/anonymousLegalGuide";
import { guidePath } from "@/lib/contentPacks/paths";

const UPDATED = "2026-08-21";
const TRC_DOCS = getAnonymousDocumentList("trc");
const TRC_LAW_LINE =
  "거주·체류와 관련해 자주 언급되는 법령·통달로 04/2016/TT-BNG, 47/2014/QH13(입출국·체류법) 등이 있습니다. 다만 귀하의 비자·고용 형태에 적용되는 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.";
const TRC_PROCESS_STEPS = [
  "서류를 한곳에 모은다 — 스캔·사본 위주로 정리",
  "관할 출입국·거주 관리 기관(공안)에 신청한다",
  "심사 후 발급 — 중간에 보완 요청이 올 수 있다",
];

export const TRC_DOCUMENTS_ARTICLE: PublishedArticle = {
  slug: "trc-required-documents",
  intentId: "trc-documents",
  serviceType: "trc",
  serviceLabel: "거주증(TRC)",
  title: "베트남 거주증(TRC) 필요 서류, 한눈에 보기",
  subtitle: "외국인 대상 참고 가이드 · 개인 상황에 따라 달라질 수 있습니다.",
  metaDescription:
    "베트남 거주증(TRC) 신청에 필요한 서류 목록과 일반적인 진행 순서를 정리했습니다. 외국인 체류·거주 행정 가이드.",
  updatedAt: UPDATED,
  articleType: "info",
  funnelHref: "/check/trc",
  funnelCtaLabel: "내 상황 확인하기",
  relatedSlug: "trc-how-to-apply",
  caseLanding: {
    question: "베트남 거주증(TRC) 신청에 어떤 서류가 필요한가?",
    directAnswer:
      "일반적으로 여권, 비자, 재직증명서, 회사서류가 필요하고, 주소지 관련 자료 등이 추가로 요청될 수 있습니다. 비자 종류·회사 형태에 따라 목록이 달라집니다.",
    officialBasis: [
      "04/2016/TT-BNG (외국인 체류·거주 관련 행정 통달)",
      "47/2014/QH13 (입출국·체류법)",
      "구체 조항(Điều/Khoản)은 비자·고용 형태마다 다르므로 이 글만으로 법적 확정을 내리기는 어렵습니다.",
    ],
    costNote:
      "거주증 진행 비용은 정부 수수료와 대행 범위가 나뉩니다. 이 페이지에는 금액을 적지 않습니다. 내 견적이 적정한지는 COST CHECK에서, 내 조건은 CHECK에서 확인하세요.",
    process: TRC_PROCESS_STEPS,
    conditions: [
      "외국인 직장인·체류자 기준으로 일반적으로 요구되는 목록입니다.",
      "비자 종류·회사 형태에 따라 추가 요청이 있을 수 있습니다.",
      "한곳에서 “이것만 내면 된다”고 단정하기는 어렵습니다.",
    ],
    cases: [
      {
        title: "회사에서는 회사 서류만 있으면 된다고 하는 경우",
        body: "인사·총무 안내는 회사 제출분에 초점이 맞춰져 있는 경우가 많습니다. 본인 여권·비자·주소지 자료는 별도로 빠지기 쉽습니다.",
      },
      {
        title: "커뮤니티에서는 임대계약서가 꼭 필요하다고 하는 경우",
        body: "거주지 증빙이 추가로 요청되는 사례가 있어 그렇게 말하는 경우가 있습니다. 모든 비자·고용 형태에 동일하게 적용된다고 보기는 어렵습니다.",
      },
    ],
    comparison: [
      {
        label: "회사 안내",
        text: "회사 서류·재직 증빙 중심으로 안내되는 경우가 많습니다.",
      },
      {
        label: "커뮤니티 경험담",
        text: "본인이 겪은 추가 요청(주소지 등)을 일반 규칙처럼 전하는 경우가 있습니다.",
      },
      {
        label: "이 가이드",
        text: "공통으로 많이 요구되는 서류와, 상황에 따라 추가되는 서류를 나눠 봅니다.",
      },
    ],
    cautions: [
      "이 내용은 AI가 제공하는 참고용 가이드이며, 실제 진행은 전문가와 상의하시기 바랍니다.",
      "정확한 확인은 VFBCAI 마이페이지 또는 VFBCAI 전문가팀 상담을 이용해 주세요.",
      "커뮤니티·회사·AI 안내가 달라도, 절차 자체가 여러 개인 것은 아닙니다. 준비물만 상황마다 달라지는 경우가 많습니다.",
    ],
    qa: [
      {
        q: "거주증(TRC) 신청에 어떤 서류가 필요한가요?",
        a: "일반적으로 여권, 비자, 재직증명서, 회사서류가 필요하며, 주소지 관련 자료 등이 추가로 요청될 수 있습니다.",
      },
      {
        q: "이 안내는 법적 확정 답변인가요?",
        a: "아닙니다. 참고용 가이드이며, 정확한 확인은 VFBCAI 마이페이지 또는 VFBCAI 전문가팀 상담을 이용해 주세요.",
      },
    ],
    relatedQuestions: [
      { question: "거주증 신청 순서가 제각각으로 들릴 때", href: guidePath("trc-how-to-apply") },
      { question: "내 조건에 맞는 서류인지 확인하기", href: "/check/trc" },
      { question: "거주증 견적이 적정한지 보기", href: "/cost-check?tab=review&q=거주증" },
    ],
    sources: [
      { label: "04/2016/TT-BNG", detail: "외국인 체류·거주 관련 행정 통달 (참고)" },
      { label: "47/2014/QH13", detail: "입출국·체류법 (참고)" },
      { label: "VFBCAI 참고 가이드", detail: "개인 상황에 따른 확정은 CHECK·전문가 확인이 필요합니다." },
    ],
  },
  sections: [
    {
      type: "p",
      text: "베트남에서 거주증(Thẻ tạm thường trú, TRC)을 준비하실 때 가장 먼저 궁금한 것이 서류 목록인 경우가 많습니다. 아래는 외국인 직장인·체류자 기준으로 일반적으로 요구되는 서류를 VFBCAI가 정리한 참고용 가이드입니다. 비자 종류·회사 형태에 따라 추가 요청이 있을 수 있습니다.",
    },
    { type: "h2", text: "필요 서류 (참고)" },
    {
      type: "bullets",
      items: TRC_DOCS,
    },
    {
      type: "p",
      text: "한곳에서 “이것만 내면 된다”고 단정하기는 어렵지만, 위 목록 순서로 준비하시면 대부분의 경우 심사·보완 대응이 훨씬 수월합니다.",
    },
    { type: "h2", text: "신청은 어떻게 진행되나요?" },
    {
      type: "p",
      text: "보통 ① 서류 준비 → ② 관할 출입국·거주 관리 기관(공안) 신청 → ③ 심사 후 발급 순입니다. 유형에 따라 면접·추가 서류 요청이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.",
    },
    { type: "h2", text: "관련 법령 (참고)" },
    {
      type: "p",
      text: TRC_LAW_LINE,
    },
  ],
};

export const TRC_GUIDE_ARTICLE: PublishedArticle = {
  slug: "trc-how-to-apply",
  intentId: "trc-guide",
  serviceType: "trc",
  serviceLabel: "거주증(TRC)",
  title: "베트남 거주증 신청, 어렵지 않아요",
  subtitle: "말이 제각각일 때, 진행 순서와 서류를 차분히 정리합니다.",
  metaDescription:
    "거주증(TRC) 신청이 헷갈리실 때 읽는 외국인 가이드. 진행 순서, 필요 서류, 관련 법령을 정리했습니다.",
  updatedAt: UPDATED,
  articleType: "story",
  funnelHref: "/check/trc",
  funnelCtaLabel: "내 상황 확인하기",
  relatedSlug: "trc-required-documents",
  caseLanding: {
    question: "거주증 신청, 말이 제각각일 때 어떻게 하면 되나?",
    directAnswer:
      "절차는 같고 준비물만 상황마다 다릅니다. 공통 서류를 먼저 모은 뒤, 내 비자·고용 형태에 따른 추가분만 확인하면 됩니다.",
    officialBasis: [
      "04/2016/TT-BNG (외국인 체류·거주 관련 행정 통달)",
      "47/2014/QH13 (입출국·체류법)",
      "“제 비자에는 정확히 몇 조가 적용되나요?”까지는 개별 사건 확인이 필요합니다.",
    ],
    costNote:
      "거주증 진행 비용은 정부 수수료와 대행 범위가 나뉩니다. 이 페이지에는 금액을 적지 않습니다. 말이 엇갈릴 때는 서류를 먼저 정리한 뒤, 비용은 COST CHECK에서, 내 경우는 CHECK에서 맞춰 보는 것이 덜 헷갈립니다.",
    process: TRC_PROCESS_STEPS,
    conditions: [
      "현재 비자 종류, 고용 형태, 거주지, 이전 신청 이력에 따라 요구 서류가 달라집니다.",
      "회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
      "신청 관할은 현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다.",
    ],
    cases: [
      {
        title: "회사·커뮤니티·AI 안내가 모두 다르게 들리는 경우",
        body: "회사에서는 “회사 서류만 있으면 된다”, 커뮤니티에서는 “임대계약서가 꼭 필요하다”, AI에게 물어보면 또 다른 목록이 나옵니다. 헷갈리는 것이 이상한 상황이 아닙니다. 거주증은 현재 비자 종류, 고용 형태, 거주지, 이전 신청 이력에 따라 요구 서류가 달라지기 때문입니다.",
      },
      {
        title: "어디서 신청하는지부터 막히는 경우",
        body: "현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다. 회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
      },
    ],
    comparison: [
      {
        label: "공통 서류",
        text: "여권, 비자, 재직증명서, 회사서류처럼 대부분의 경우에 먼저 모으는 목록입니다.",
      },
      {
        label: "내 경우만 추가",
        text: "주소지 관련 자료, 기존 거주증·보완·반려 관련 자료 등은 이력·거주지에 따라 달라집니다.",
      },
      {
        label: "지금 할 일",
        text: "공통 서류를 먼저 정리하고, 비자·고용 형태를 한 줄로 적은 뒤 맞춤 확인으로 추가분만 짚습니다.",
      },
    ],
    cautions: [
      "이 내용은 AI가 제공하는 참고용 가이드이며, 실제 진행은 전문가와 상의하시기 바랍니다.",
      "말이 다르다고 해서 절차가 여러 개 있는 것은 아닙니다. 같은 절차인데, 준비물만 사람마다 다르게 느껴지는 것에 가깝습니다.",
      "법령은 방향을 잡는 용도이며, 구체 조항 적용은 개별 확인이 필요합니다.",
    ],
    qa: [
      {
        q: "회사 말과 커뮤니티 말이 다르면 어떤 절차를 따라야 하나요?",
        a: "절차 자체는 같고 준비물만 상황마다 달라지는 경우가 많습니다. 공통 서류를 먼저 모은 뒤, 내 비자·고용 형태에 따른 추가분을 확인하세요.",
      },
      {
        q: "이 안내는 법적 확정 답변인가요?",
        a: "아닙니다. 참고용 가이드이며, 정확한 확인은 VFBCAI 마이페이지 또는 VFBCAI 전문가팀 상담을 이용해 주세요.",
      },
    ],
    relatedQuestions: [
      { question: "거주증 필요 서류 한눈에 보기", href: guidePath("trc-required-documents") },
      { question: "내 상황으로 진행 순서 확인하기", href: "/check/trc" },
      { question: "거주증 견적이 적정한지 보기", href: "/cost-check?tab=review&q=거주증" },
    ],
    sources: [
      { label: "04/2016/TT-BNG", detail: "외국인 체류·거주 관련 행정 통달 (참고)" },
      { label: "47/2014/QH13", detail: "입출국·체류법 (참고)" },
      { label: "VFBCAI 참고 가이드", detail: "개인 상황에 따른 확정은 CHECK·전문가 확인이 필요합니다." },
    ],
  },
  sections: [
    {
      type: "p",
      text: "거주증(TRC) 준비를 시작하면 회사에서는 “회사 서류만 있으면 된다”고 하고, 커뮤니티에서는 “임대계약서가 꼭 필요하다”고 하며, AI에게 물어보면 또 다른 목록이 나옵니다. 헷갈리는 것이 이상한 상황이 아닙니다. 거주증은 현재 비자 종류, 고용 형태, 거주지, 이전 신청 이력에 따라 요구 서류가 달라지기 때문입니다.",
    },
    {
      type: "p",
      text: "정리하면, 공통으로 많이 요구되는 것과 나의 경우에만 추가로 필요한 것을 나누어 생각하면 됩니다.",
    },
    { type: "h2", text: "Step 1 — 필요 서류 정리" },
    {
      type: "bullets",
      items: TRC_DOCS,
    },
    {
      type: "p",
      text: "비자·고용 형태에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "Step 2 — 진행 순서" },
    {
      type: "numbered",
      items: TRC_PROCESS_STEPS,
    },
    {
      type: "p",
      text: "“어디서 신청하나요?”가 헷갈리시면, 현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다. 회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
    },
    { type: "h2", text: "Step 3 — 법령은 방향만 잡으면 충분합니다" },
    {
      type: "p",
      text: "자주 언급되는 근거로 04/2016/TT-BNG(외국인 체류·거주 관련 행정 통달), 47/2014/QH13(입출국·체류법) 등이 있습니다. 다만 “제 비자에는 정확히 몇 조가 적용되나요?”까지는 개별 사건 확인이 필요합니다. 커뮤니티 말과 AI 말이 엇갈릴 때는, 서류를 먼저 정리한 뒤 맞춤 확인 도구로 한 번 더 맞춰 보는 것이 가장 덜 헷갈리는 방법입니다.",
    },
    { type: "h2", text: "지금 당장 무엇을 하면 될까요?" },
    {
      type: "numbered",
      items: [
        "필요 서류를 위 목록 기준으로 먼저 정리",
        "내 비자·고용 형태를 한 줄로 정리 (예: E비자, 현지 법인 재직)",
        "맞춤 확인으로 내 경우에 추가로 필요한 것만 짚어 보기",
      ],
    },
    {
      type: "p",
      text: "말이 다르다고 해서 절차가 여러 개 있는 것은 아닙니다. 같은 절차인데, 준비물만 사람마다 다르게 느껴지는 것에 가깝습니다.",
    },
  ],
};

export const TRC_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [TRC_DOCUMENTS_ARTICLE.slug]: TRC_DOCUMENTS_ARTICLE,
  [TRC_GUIDE_ARTICLE.slug]: TRC_GUIDE_ARTICLE,
};
