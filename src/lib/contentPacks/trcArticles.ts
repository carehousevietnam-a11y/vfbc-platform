import type { PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList } from "@/lib/anonymousLegalGuide";
import { guidePath } from "@/lib/contentPacks/paths";
import {
  buildCaseOrientedQa,
  buildCaseOrientedSections,
  TRC_DOCUMENTS_NARRATIVE,
  TRC_GUIDE_NARRATIVE,
} from "@/lib/contentPacks/guideCaseNarrative";

const UPDATED = "2026-08-21";
const TRC_DOCS = getAnonymousDocumentList("trc");
const TRC_LAW_LINE =
  "거주·체류와 관련해 자주 언급되는 법령·통달로 04/2016/TT-BNG, 47/2014/QH13(입출국·체류법) 등이 있습니다. 다만 귀하의 비자·고용 형태에 적용되는 구체 조항(Điều/Khoản)은 사례마다 달라, 이 글만으로 법적 확정을 내리기는 어렵습니다.";
const TRC_RELATED_LAWS = [
  "관련 법령: 04/2016/TT-BNG, 47/2014/QH13 (구체 조항은 이 페이지에 없습니다)",
];
const TRC_PROCESS_STEPS = [
  "서류를 한곳에 모은다 — 스캔·사본 위주로 정리",
  "관할 출입국·거주 관리 기관(공안)에 신청한다",
  "심사 후 발급 — 중간에 보완 요청이 올 수 있다",
];
const TRC_DURATION_NOTE =
  "유형에 따라 면접·추가 서류 요청이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.";

export const TRC_DOCUMENTS_ARTICLE: PublishedArticle = {
  slug: "trc-required-documents",
  intentId: "trc-documents",
  serviceType: "trc",
  serviceLabel: "거주증(TRC)",
  title: "베트남 거주증(TRC) 필요 서류, 한눈에 보기",
  subtitle: "외국인 대상 참고 가이드 · 개인 상황에 따라 달라질 수 있습니다.",
  metaDescription:
    "베트남 거주증(TRC) 준비 때 자주 모으는 참고 항목은 여권, 비자, 재직증명서, 회사서류입니다. 주소지 자료는 추가로 요청될 수 있습니다.",
  updatedAt: UPDATED,
  articleType: "info",
  funnelHref: "/check/trc",
  funnelCtaLabel: "내 상황을 직접 확인하기",
  relatedSlug: "trc-how-to-apply",
  caseLanding: {
    question: "베트남 거주증(TRC) 신청에 어떤 서류를 준비하면 되나?",
    directAnswer:
      "참고 목록 기준으로는 여권, 비자, 재직증명서, 회사서류를 먼저 모으고, 주소지 관련 자료는 요청될 수 있어 함께 챙겨 두는 경우가 많습니다.",
    why: "비자 종류, 회사 형태, 거주지, 이전 신청 이력에 따라 요구 서류가 달라질 수 있기 때문입니다. 한곳의 목록만으로 확정 제출 목록이라고 보기 어렵습니다.",
    officialBasis: TRC_RELATED_LAWS,
    costNote: "",
    durationNote: "",
    process: [],
    showDocuments: true,
    showOfficialCost: false,
    conditions: [
      "아래 목록은 외국인 직장인·체류자 기준으로 자주 모으는 참고 항목입니다.",
      "비자 종류·회사 형태에 따라 추가 요청이 있을 수 있습니다.",
      "회사서류와 기타 관련 자료의 세부 구성은 이 목록에 정해져 있지 않습니다.",
    ],
    cases: [
      {
        title: "대표적인 상황: 회사에서는 회사 서류만 있으면 된다고 하는 경우",
        body: "인사·총무 안내는 회사 제출분에 초점이 맞춰져 있는 경우가 많습니다. 본인 여권·비자·주소지 자료는 별도로 빠지기 쉽습니다.",
      },
      {
        title: "대표적인 상황: 커뮤니티에서는 임대계약서가 꼭 필요하다고 하는 경우",
        body: "거주지 증빙이 추가로 요청되는 경우가 있어 그렇게 말하는 경우가 있습니다. 모든 비자·고용 형태에 동일하게 적용된다고 보기는 어렵습니다.",
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
        label: "참고 나누기",
        text: "자주 모으는 항목과, 상황에 따라 추가되는 항목을 나눠 봅니다.",
      },
    ],
    cautions: [
      "회사 서류만 준비하면 된다고 생각하고 본인 여권·비자를 빠뜨리는 경우",
      "커뮤니티에서 들은 임대계약서를 모든 경우에 필수라고 단정하는 경우",
      "한곳의 목록만 보고 확정 제출 목록이라고 단정하는 경우",
    ],
    qa: buildCaseOrientedQa("거주증(TRC)", TRC_DOCUMENTS_NARRATIVE, [
      {
        q: "임대계약서는 항상 필요한가요?",
        a: "아닙니다. 거주지 증빙이 추가로 요청되는 경우는 있지만, 모든 비자·고용 형태에 동일하게 필수라고 단정하기는 어렵습니다.",
      },
      {
        q: "회사 서류만 준비하면 되나요?",
        a: "회사 안내는 회사 제출분에 초점이 맞춰진 경우가 많습니다. 참고 목록에는 여권, 비자, 재직증명서, 회사서류가 함께 있고, 주소지 관련 자료는 있으면 제출 항목입니다.",
      },
      {
        q: "주소지 관련 자료는 꼭 내야 하나요?",
        a: "참고 목록에서는 ‘있으면 제출’입니다. 추가로 요청될 수는 있으나, 모든 경우에 필수라고 단정하지는 않습니다.",
      },
    ]),
    relatedQuestions: [
      { question: "신청 순서가 제각각으로 들릴 때는 어떻게 하면 되나?", href: guidePath("trc-how-to-apply") },
    ],
    sources: [
      {
        label: "VFBCAI 참고 서류 목록",
        detail: "같은 플랫폼의 거주증 서류 항목(우선 제출·있으면 제출). 법령 조항에서 추출한 확정 목록이 아닙니다.",
      },
      {
        label: "04/2016/TT-BNG, 47/2014/QH13",
        detail: "관련 법령 번호(참고). 위 서류 목록의 근거로 인용하지 않습니다.",
      },
    ],
  },
  sections: buildCaseOrientedSections(TRC_DOCUMENTS_NARRATIVE, [
    { type: "h2", text: "필요 서류 (참고)" },
    { type: "bullets", items: TRC_DOCS },
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
    { type: "p", text: TRC_LAW_LINE },
  ]),
};

export const TRC_GUIDE_ARTICLE: PublishedArticle = {
  slug: "trc-how-to-apply",
  intentId: "trc-guide",
  serviceType: "trc",
  serviceLabel: "거주증(TRC)",
  title: "베트남 거주증 신청, 어렵지 않아요",
  subtitle: "말이 제각각일 때, 진행 순서와 서류를 차분히 정리합니다.",
  metaDescription:
    "거주증(TRC) 진행은 같은 순서입니다. 공통 서류를 먼저 모으고, 비자·고용 형태를 적은 뒤 추가분만 확인하세요.",
  updatedAt: UPDATED,
  articleType: "story",
  funnelHref: "/check/trc",
  funnelCtaLabel: "내 상황을 직접 확인하기",
  relatedSlug: "trc-required-documents",
  caseLanding: {
    question: "거주증 신청, 말이 제각각일 때 어떻게 하면 되나?",
    directAnswer:
      "같은 순서이므로, 공통 서류를 먼저 모으고 비자·고용 형태를 한 줄로 적은 다음 추가분만 확인하면 됩니다.",
    why: "회사·커뮤니티·AI 안내가 달라도 절차 자체가 여러 개인 것은 아닙니다. 준비물이 비자 종류, 고용 형태, 거주지, 이전 신청 이력에 따라 달라질 수 있습니다.",
    officialBasis: TRC_RELATED_LAWS,
    costNote: "",
    durationNote: TRC_DURATION_NOTE,
    process: TRC_PROCESS_STEPS,
    showDocuments: false,
    showOfficialCost: false,
    conditions: [
      "회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
      "신청 관할은 현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다.",
    ],
    cases: [
      {
        title: "대표적인 상황: 회사·커뮤니티·AI 안내가 모두 다르게 들리는 경우",
        body: "회사에서는 “회사 서류만 있으면 된다”, 커뮤니티에서는 “임대계약서가 꼭 필요하다”, AI에게 물어보면 또 다른 목록이 나옵니다. 순서를 여러 개로 나누지 말고, 공통 준비와 내 경우 추가분만 나누면 됩니다.",
      },
      {
        title: "대표적인 상황: 어디서 신청하는지부터 막히는 경우",
        body: "현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다. 회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
      },
    ],
    comparison: [
      {
        label: "지금 할 일 1",
        text: "공통으로 자주 모으는 항목부터 한곳에 정리합니다. 항목 자체는 서류 가이드를 참고하세요.",
      },
      {
        label: "지금 할 일 2",
        text: "내 비자·고용 형태를 한 줄로 적습니다. 예: E비자, 현지 법인 재직.",
      },
      {
        label: "지금 할 일 3",
        text: "그다음 내 경우에만 추가로 필요한 항목을 확인합니다.",
      },
    ],
    cautions: [
      "안내가 다르면 절차가 여러 개라고 생각하는 경우",
      "신청 관할을 확인하지 않고 진행하는 경우",
      "이 글의 법령 번호만으로 구체 조항 적용을 확정하려는 경우",
    ],
    qa: buildCaseOrientedQa("거주증(TRC)", TRC_GUIDE_NARRATIVE, [
      {
        q: "회사 말과 커뮤니티 말이 다르면 어떤 절차를 따라야 하나요?",
        a: "절차 자체는 같고 준비물만 상황마다 달라지는 경우가 많습니다. 공통 서류를 먼저 모은 뒤, 내 비자·고용 형태에 따른 추가분을 확인하세요.",
      },
      {
        q: "어디서 신청하나요?",
        a: "현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다. 회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
      },
      {
        q: "다음에 무엇을 하면 되나요?",
        a: "공통 서류를 먼저 모으고, 내 비자·고용 형태를 한 줄로 정리한 뒤, 추가로 필요한 항목만 확인하면 됩니다.",
      },
    ]),
    relatedQuestions: [
      { question: "어떤 서류를 먼저 준비하면 되나?", href: guidePath("trc-required-documents") },
    ],
    sources: [
      {
        label: "04/2016/TT-BNG, 47/2014/QH13",
        detail: "관련 법령 번호(참고). 구체 조항과 서류 목록의 근거로 쓰지 않습니다.",
      },
    ],
  },
  sections: buildCaseOrientedSections(TRC_GUIDE_NARRATIVE, [
    { type: "h2", text: "Step 1 — 필요 서류 정리" },
    { type: "bullets", items: TRC_DOCS },
    {
      type: "p",
      text: "비자·고용 형태에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "Step 2 — 진행 순서" },
    { type: "numbered", items: TRC_PROCESS_STEPS },
    {
      type: "p",
      text: "“어디서 신청하나요?”가 헷갈리시면, 현재 거주 지역을 관할하는 공안(출입국·거주 관리)을 기준으로 보시면 됩니다. 회사 HR이 대행하는 경우도 있고, 본인이 직접 가는 경우도 있습니다.",
    },
    { type: "h2", text: "Step 3 — 법령은 방향만 잡으면 충분합니다" },
    {
      type: "p",
      text: "자주 언급되는 근거로 04/2016/TT-BNG(외국인 체류·거주 관련 행정 통달), 47/2014/QH13(입출국·체류법) 등이 있습니다. 다만 “제 비자에는 정확히 몇 조가 적용되나요?”까지는 개별 사건 확인이 필요합니다.",
    },
    {
      type: "p",
      text: "말이 다르다고 해서 절차가 여러 개 있는 것은 아닙니다. 같은 절차인데, 준비물만 사람마다 다르게 느껴지는 것에 가깝습니다.",
    },
  ]),
};

export const TRC_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [TRC_DOCUMENTS_ARTICLE.slug]: TRC_DOCUMENTS_ARTICLE,
  [TRC_GUIDE_ARTICLE.slug]: TRC_GUIDE_ARTICLE,
};
