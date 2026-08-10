import type { PublishedArticle } from "@/lib/contentPacks/types";

const UPDATED = "2026-03-09";

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
  funnelCtaLabel: "내 상황에 맞게 확인하기",
  relatedSlug: "trc-how-to-apply",
  sections: [
    {
      type: "p",
      text: "베트남에서 거주증(Thẻ tạm thường trú, TRC)을 준비하실 때 가장 먼저 궁금한 것이 서류 목록인 경우가 많습니다. 아래는 외국인 직장인·체류자 기준으로 일반적으로 요구되는 서류를 VFBCAI가 정리한 참고용 가이드입니다. 비자 종류·회사 형태에 따라 추가 요청이 있을 수 있습니다.",
    },
    { type: "h2", text: "우선 챙기면 좋은 서류" },
    {
      type: "bullets",
      items: [
        "여권 — 신분 및 국적 확인용",
        "비자 — 현재 체류 자격",
        "재직증명서 — 근로·체류 목적 확인",
        "회사서류 — 사업자등록, 고용 관계 등 (회사에서 발급)",
      ],
    },
    { type: "h2", text: "있으면 함께 제출하는 서류" },
    {
      type: "bullets",
      items: [
        "주소지 관련 자료 — 임대차, 거주 확인 등",
        "기존 거주증·보완·반려 관련 자료 — 갱신·재신청 시",
        "기타 관련 자료 — 기관에서 추가로 요청할 수 있는 항목",
      ],
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
      text: "거주·체류와 관련해 자주 언급되는 법령·통달로 04/2016/TT-BNG, 47/2014/QH13(입출국·체류법) 등이 있습니다. 다만 귀하의 비자·고용 형태에 적용되는 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.",
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
  funnelCtaLabel: "3분 안에 내 상황 확인하기",
  relatedSlug: "trc-required-documents",
  sections: [
    {
      type: "p",
      text: "거주증(TRC) 준비를 시작하면 회사에서는 “회사 서류만 있으면 된다”고 하고, 커뮤니티에서는 “임대계약서가 꼭 필요하다”고 하며, AI에게 물어보면 또 다른 목록이 나옵니다. 헷갈리는 것이 이상한 상황이 아닙니다. 거주증은 현재 비자 종류, 고용 형태, 거주지, 이전 신청 이력에 따라 요구 서류가 달라지기 때문입니다.",
    },
    {
      type: "p",
      text: "정리하면, 공통으로 많이 요구되는 것과 나의 경우에만 추가로 필요한 것을 나누어 생각하면 됩니다.",
    },
    { type: "h2", text: "Step 1 — 공통으로 먼저 준비할 서류" },
    {
      type: "p",
      text: "대부분의 외국인 직장인·체류자에게 공통으로 거론되는 서류는 여권, 비자, 재직증명서, 회사서류입니다. 주소지 관련 자료나 기존 거주증·보완·반려 서류는 있으면 함께 준비하세요. 리스트가 길게 느껴지시면 앞 네 가지만 먼저 모으셔도 됩니다.",
    },
    { type: "h2", text: "Step 2 — 진행 순서" },
    {
      type: "numbered",
      items: [
        "서류를 한곳에 모은다 — 스캔·사본 위주로 정리",
        "관할 출입국·거주 관리 기관(공안)에 신청한다",
        "심사 후 발급 — 중간에 보완 요청이 올 수 있다",
      ],
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
        "여권·비자·재직증명서·회사서류부터 준비",
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
