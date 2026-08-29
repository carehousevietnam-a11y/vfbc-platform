import type { ArticleIntentId, PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList, PROCESS_BY_GROUP } from "@/lib/anonymousLegalGuide";
import { getCostCheckService, type CostCheckServiceId } from "@/lib/costCheck";
import {
  buildCaseOrientedQa,
  buildCaseOrientedSections,
  type CaseNarrativeSpec,
} from "@/lib/contentPacks/guideCaseNarrative";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

const UPDATED = "2026-08-28";

const VERIFY_PROCESS_STEPS = [
  "서류·계약서 준비",
  "검토 요청 — 상황 설명·첨부 자료 제출",
  "검토 결과에 따른 다음 조치 — 보완·이의·신고·협상 등",
];

const VERIFY_DURATION_NOTE =
  "문서 유형·분량·긴급 여부·관할에 따라 추가 자료 요청이 있을 수 있으니, 기한이 있는 통지는 우선 확인하세요.";

type VerifyGuideSpec = {
  slug: string;
  intentId: ArticleIntentId;
  docServiceType: string;
  costServiceId: CostCheckServiceId;
  funnelHref: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  question: string;
  why: string;
  reviewChecks: { title: string; body: string }[];
  narrative: CaseNarrativeSpec;
  conditions: string[];
  cases: { title: string; body: string }[];
  cautions: string[];
  officialUrl: string;
  officialNote: string;
};

function buildVerifyGuide(spec: VerifyGuideSpec): PublishedArticle {
  const required = getRequiredDocuments(spec.docServiceType);
  const docs = getAnonymousDocumentList(spec.docServiceType);
  const cost = getCostCheckService(spec.costServiceId);
  const costNote = cost.lookupGuide;

  const directAnswer = `진행은 ${VERIFY_PROCESS_STEPS[0]} → ${VERIFY_PROCESS_STEPS[1]} → ${VERIFY_PROCESS_STEPS[2]} 순으로 보시면 되고, 핵심 자료는 ${required.documents.join(", ")}입니다. ${costNote}`;

  const reviewSummary = spec.reviewChecks.map((item) => `${item.title}: ${item.body}`).join(" ");

  const sources: PublishedArticle["caseLanding"]["sources"] = [
    {
      label: "VFBCAI 참고 자료 목록",
      detail: `같은 플랫폼의 ${required.serviceLabel} 검토 참고 항목. 법령 조항에서 추출한 확정 목록이 아닙니다.`,
    },
    {
      label: "국가공공서비스포털",
      detail: spec.officialNote,
    },
  ];

  const middleSections: PublishedArticle["sections"] = [
    { type: "h2", text: "이 서비스에서 집중 검토하는 영역" },
    {
      type: "bullets",
      items: spec.reviewChecks.map((item) => `${item.title} — ${item.body}`),
    },
    { type: "h2", text: "검토 진행 순서" },
    { type: "p", text: PROCESS_BY_GROUP.verify },
    { type: "h2", text: "필요 자료 (참고)" },
    { type: "bullets", items: docs },
    { type: "h2", text: "비용·주의사항" },
    { type: "p", text: costNote },
    {
      type: "p",
      text: "확인된 상담가격·시장 참고 금액이 없는 항목은 임의 금액을 표시하지 않습니다. 견적·안내를 받을 때 검토 범위·번역·긴급 여부 포함 여부를 구분해서 확인하세요.",
    },
    { type: "h2", text: "법령·공식 근거" },
    {
      type: "p",
      text: `${spec.officialNote} 구체 법령 조항(Điều/Khoản)은 문서 유형·관할·사안마다 달라 이 글만으로 법적 확정을 내리기 어렵습니다.`,
    },
  ];

  const sections = buildCaseOrientedSections(spec.narrative, middleSections);

  return {
    slug: spec.slug,
    intentId: spec.intentId,
    serviceType: spec.docServiceType,
    serviceLabel: required.serviceLabel,
    title: spec.title,
    subtitle: spec.subtitle,
    metaDescription: spec.metaDescription,
    updatedAt: UPDATED,
    articleType: "info",
    funnelHref: spec.funnelHref,
    funnelCtaLabel: "내 상황을 직접 확인하기",
    caseLanding: {
      question: spec.question,
      directAnswer,
      why: spec.why,
      officialBasis: [spec.officialNote],
      costNote,
      durationNote: VERIFY_DURATION_NOTE,
      process: VERIFY_PROCESS_STEPS,
      showDocuments: true,
      showOfficialCost: false,
      conditions: spec.conditions,
      cases: spec.cases,
      comparison: [
        { label: "검토 흐름", text: PROCESS_BY_GROUP.verify },
        {
          label: "검토 대상",
          text: reviewSummary,
        },
        {
          label: "필요 자료",
          text: `우선: ${required.documents.join(", ")}. 참고: ${(required.optionalDocuments ?? []).join(", ")}.`,
        },
        { label: "비용", text: costNote },
      ],
      cautions: spec.cautions,
      qa: buildCaseOrientedQa(required.serviceLabel, spec.narrative, [
        {
          q: "사전 검토와 사후 검토의 차이는 무엇인가요?",
          a: "사전 검토는 제출·계약·송금 전 위험을 확인하는 것이고, 사후 검토는 이미 반려·통지·분쟁·피해가 발생한 뒤 대응 방향을 점검하는 것입니다.",
        },
        {
          q: "어떤 자료를 먼저 준비하면 되나요?",
          a: `참고 목록 기준 우선 자료는 ${required.documents.join(", ")}입니다.`,
        },
        {
          q: "비용은 어떻게 확인하나요?",
          a: costNote,
        },
      ]),
      relatedQuestions: [],
      sources,
    },
    sections,
  };
}

export const ADMIN_GUIDE_SLUG = "admin-document-review-guide";
export const REAL_ESTATE_GUIDE_SLUG = "real-estate-document-review-guide";
export const FRAUD_GUIDE_SLUG = "fraud-document-review-guide";
export const TAX_GUIDE_SLUG = "tax-document-review-guide";
export const UNCLEAR_GUIDE_SLUG = "unclear-document-review-guide";

export const ADMIN_GUIDE_ARTICLE = buildVerifyGuide({
  slug: ADMIN_GUIDE_SLUG,
  intentId: "verify-admin-guide",
  docServiceType: "verify_admin",
  costServiceId: "admin",
  funnelHref: "/verify/admin",
  title: "베트남 행정문서 검토·확인 포인트, 한눈에 보기",
  subtitle: "제출·계약 전 사전 검토와 문제 발생 후 사후 검토 흐름을 참고용으로 정리합니다.",
  metaDescription:
    "행정문서 검토는 출입국·노동·세무·투자 공문서의 요건·누락·위험 조항을 사전에 확인하거나, 반려·통지 후 대응 방향을 점검할 때 이용합니다. 필요 자료와 확인 포인트를 참고하세요.",
  question: "베트남 행정문서는 무엇을 검토하고 어떤 순서로 확인하면 되나요?",
  why: "기관·문서 유형·제출 단계에 따라 확인 항목이 달라지고, 서명·제출 전과 반려·통지 후에 필요한 검토가 다르기 때문입니다.",
  narrative: {
    anxieties: [
      "이 행정서류가 진짜 맞는 걸까? 형식이나 도장이 이상한 것 같다.",
      "행정기관에서 이 서류를 받아줄까? 제출 전에 뭔가 빠진 건 아닐까?",
      "회사가 준 서류만 있으면 된다고 했는데, 내 명의 서류가 또 필요할까?",
      "이미 제출했는데 반려·보완 통지가 왔다 — 뭘 잘못했을까?",
    ],
    caseCheckpoints: [
      { title: "문서의 진위", body: "원본·사본, 도장·서명, 발급 형식이 정상인지 확인합니다." },
      { title: "발급기관·권한", body: "출입국·노동·세무·투자등록 등 관할 기관과 발급 권한이 맞는지 봅니다." },
      { title: "날짜·기간", body: "유효기간·신청 기한·통지 기한을 놓치면 불이익이 커질 수 있습니다." },
      { title: "필수 기재사항", body: "이름·비자·사업자번호 등 누락·오기재가 없는지 확인합니다." },
      { title: "다른 서류와의 일치", body: "여권·비자·계약서·번역본이 서로 맞는지 대조합니다." },
      { title: "행정절차상 문제", body: "제출 요건·형식·공증·영사확인 필요 여부를 점검합니다." },
    ],
    beforeAction: [
      "제출·서명 전에 원본과 번역본이 일치하는지 대조합니다.",
      "관할 기관·접수 창구·필수 서류 목록을 공식 안내와 맞춰 봅니다.",
      "회사 제출분과 본인 명의 서류(여권·비자·주소지 등)를 함께 점검합니다.",
      "불리한 조항·누락 항목이 없는지 계약·신청서를 읽습니다.",
    ],
    afterAction: [
      "반려·보완 통지의 사유와 기한을 먼저 정리합니다.",
      "누락·형식 오류를 보완한 뒤 재제출 방향을 잡습니다.",
      "기관 요구와 제출본이 맞는지 다시 대조합니다.",
      "분쟁·이의가 필요한지, 어떤 근거로 대응할지 확인합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지 원본, 제출했던 서류 사본",
      "기관·대행사와의 이메일·메신저·통화 기록",
      "원본·번역본·공증본 전체",
      "송금·수수료 납부 영수증(해당 시)",
    ],
  },
  reviewChecks: [
    {
      title: "사전 검토 (Prevent Review)",
      body: "제출·계약 전 — 행정기관 제출서류, 계약서, 법인·투자·노동·인허가·세무·번역·공증 서류의 요건·누락·위험 조항을 확인합니다.",
    },
    {
      title: "사후 검토 (Case Review)",
      body: "문제 발생 후 — 기관 반려·보완 요구, 계약 분쟁, 투자·노동·인허가·세무 문제, 소송·사기 피해 등 대응 단계를 점검합니다.",
    },
    {
      title: "확인 포인트",
      body: "제출 요건과 형식, 누락 서류, 불리한 조항, 원본·번역 일치, 공증·인증·영사확인 필요 여부를 확인합니다.",
    },
    {
      title: "관할 기관",
      body: "출입국·노동·세무·투자등록·사업자등록 등 관할에 따라 제출 절차·필요 서류가 달라질 수 있습니다.",
    },
  ],
  conditions: [
    "아래 자료 목록은 VFBCAI 플랫폼의 행정문서 검토 참고 항목입니다.",
    "비자·거주증·노동허가·세무·투자 등 문서 유형에 따라 추가 요청이 있을 수 있습니다.",
    "번역·공증·영사확인 필요 여부는 제출 기관·문서 유형에 따라 달라집니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 회사 안내만 보고 본인 서류를 빠뜨리는 경우",
      body: "회사 제출분 안내와 본인 여권·비자·주소지 자료는 별도로 요구될 수 있습니다. 제출 전 본인 명의 서류를 함께 점검하세요.",
    },
    {
      title: "대표적인 상황: 반려 통지를 받고 보완 없이 재제출하는 경우",
      body: "반려·보완 요구 사유를 먼저 정리한 뒤, 누락·형식 오류를 보완하는 것이 재신청의 출발점입니다.",
    },
  ],
  cautions: [
    "서명·제출 전 요건·기한을 확인하지 않는 경우",
    "원본과 번역본 불일치를 놓치는 경우",
    "관할 기관·접수 창구를 확인하지 않고 제출하는 경우",
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "출입국·노동·세무 등 행정 서류 관련 안내는 국가공공서비스포털에서 확인할 수 있습니다.",
});

export const REAL_ESTATE_GUIDE_ARTICLE = buildVerifyGuide({
  slug: REAL_ESTATE_GUIDE_SLUG,
  intentId: "verify-real-estate-guide",
  docServiceType: "verify_real-estate",
  costServiceId: "real-estate",
  funnelHref: "/verify/real-estate",
  title: "베트남 부동산 문서 검토·확인 포인트, 한눈에 보기",
  subtitle: "임대·매매 계약 전 사전 검토와 분쟁 발생 후 사후 검토 흐름을 참고용으로 정리합니다.",
  metaDescription:
    "부동산 문서 검토는 매매·임대차 계약서, 소유권 증빙, 보증금·특약 조항을 서명 전에 확인하거나, 분쟁 발생 후 대응 방향을 점검할 때 이용합니다.",
  question: "베트남 부동산 계약서는 무엇을 검토하고 어떤 순서로 확인하면 되나요?",
  why: "매매·임대 유형, 보증금 조건, 소유권 증빙, 관할에 따라 확인 항목이 달라지기 때문입니다.",
  narrative: {
    anxieties: [
      "계약했는데 괜찮을까? 보증금을 돌려받을 수 있을까?",
      "등기부등본 없이 서명해도 될까? 소유권이 진짜 맞는 걸까?",
      "임대인·매도인이 계약서에 적힌 사람과 같은 사람인지 어떻게 확인하지?",
      "이미 보증금을 보냈는데 문제가 생긴 것 같다 — 뭘 모아야 할까?",
    ],
    caseCheckpoints: [
      { title: "소유권·사용권 서류", body: "등기부등본 등 소유권 증빙과 계약 대상이 일치하는지 봅니다." },
      { title: "계약 당사자", body: "임대인·매도인·대리인 명의·신분이 서류와 맞는지 확인합니다." },
      { title: "권리관계", body: "저당·임차·분쟁·인허가 제한 등 권리관계를 점검합니다." },
      { title: "계약조건", body: "보증금 반환·해지·위약·임대료·특약 조항을 읽습니다." },
      { title: "보증금·대금 지급", body: "지급 조건·영수·계좌 명의가 계약과 맞는지 봅니다." },
    ],
    beforeAction: [
      "등기부등본·소유권 증빙을 받고 계약 당사자와 대조합니다.",
      "보증금 반환 조건·해지·위약 조항을 서명 전에 읽습니다.",
      "임대·매매 대상물의 실제 상태·인허가를 현장·서류로 확인합니다.",
      "송금 계좌 명의가 계약 당사자와 일치하는지 봅니다.",
    ],
    afterAction: [
      "계약서·송금 내역·대화 기록을 보존합니다.",
      "보증금 미반환·임대료 분쟁 시 계약 조항과 실제 지급 내역을 대조합니다.",
      "명의·소유권 불일치가 의심되면 관련 서류를 다시 모읍니다.",
      "분쟁 대응 전에 어떤 조항·증거가 핵심인지 정리합니다.",
    ],
    evidenceWhenProblem: [
      "계약서 원본·사본, 보증금·대금 송금 내역",
      "등기부등본·소유권 관련 서류",
      "임대인·중개인과의 대화·이메일·통화 기록",
      "현장 사진·열쇠·영수증 등 거래 증빙",
    ],
  },
  reviewChecks: [
    {
      title: "사전 검토",
      body: "매매·임대차 계약서, 계약금·중도금 서류, 소유권 증빙, 인허가·분쟁 소지 서류의 조항·누락·위험을 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "매매대금 미지급, 임대료·보증금 반환 거부, 소유권·명의 분쟁, 인허가 문제 등 발생 후 대응 방향을 점검합니다.",
    },
    {
      title: "보증금·특약",
      body: "보증금 반환 조건, 해지·위약 조항, 임대인·매도인 의무가 계약서에 어떻게 적혀 있는지 확인합니다.",
    },
    {
      title: "서류 일치",
      body: "등기부등본 등 소유권 서류와 계약 조건이 서로 일치하는지, 누락·불일치가 없는지 확인합니다.",
    },
  ],
  conditions: [
    "아래 자료 목록은 VFBCAI 플랫폼의 부동산 문서 검토 참고 항목입니다.",
    "관할·부동산 유형에 따라 추가 서류·현장 확인이 요청될 수 있습니다.",
    "확인되지 않은 수수료·세금은 임의로 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 보증금만 보고 계약서 특약을 확인하지 않는 경우",
      body: "보증금 반환 조건·해지 조항이 계약서마다 다릅니다. 금액뿐 아니라 조항 전체를 함께 검토하는 것이 좋습니다.",
    },
    {
      title: "대표적인 상황: 등기부등본 없이 계약만 진행하는 경우",
      body: "소유권 증빙과 계약 상대방 명의가 일치하는지 확인하지 않으면 이후 분쟁 위험이 커질 수 있습니다.",
    },
  ],
  cautions: [
    "서명 전 보증금·위약 조항을 확인하지 않는 경우",
    "소유권 증빙과 계약 당사자 정보 불일치를 놓치는 경우",
    "분쟁 발생 후 증거(대화·송금 내역)를 보존하지 않는 경우",
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "부동산 거래·등록 관련 안내는 국가공공서비스포털에서 관할 지역별로 확인할 수 있습니다.",
});

export const FRAUD_GUIDE_ARTICLE = buildVerifyGuide({
  slug: FRAUD_GUIDE_SLUG,
  intentId: "verify-fraud-guide",
  docServiceType: "verify_fraud",
  costServiceId: "fraud",
  funnelHref: "/verify/fraud",
  title: "베트남 사기·의심 문서 검토·확인 포인트, 한눈에 보기",
  subtitle: "송금·계약 전 사전 검토와 피해 발생 후 사후 검토 흐름을 참고용으로 정리합니다.",
  metaDescription:
    "사기문서 검토는 투자·대출·온라인 거래 제안서의 비정상 조건을 송금 전에 확인하거나, 피해 발생 후 증거 보전·대응 순서를 점검할 때 이용합니다.",
  question: "베트남에서 의심되는 사기 문서는 무엇을 검토하고 어떻게 대응하면 되나요?",
  why: "사기 유형·피해 단계·증거 보존 상태에 따라 확인 항목과 권장 조치가 달라지기 때문입니다.",
  narrative: {
    anxieties: [
      "돈을 이미 보냈는데 돌려받을 수 있을까?",
      "수익률이 너무 좋아 보이는데, 사기는 아닐까?",
      "계약서는 받았는데 상대방·계좌가 믿을 만한지 모르겠다.",
      "피해가 난 뒤라 증거를 어떻게 모아야 할지 막막하다.",
    ],
    caseCheckpoints: [
      { title: "상대방·거래 구조", body: "투자·대출·제휴 제안의 상대방·법인·계좌 구조를 봅니다." },
      { title: "계약·송금·영수증·대화", body: "약속과 실제 송금·대화 내용이 맞는지 대조합니다." },
      { title: "허위 설명·불일치", body: "비현실적 수익·긴급 송금 압박·서류 불일치를 점검합니다." },
      { title: "돈의 흐름", body: "누구에게·언제·얼마가 갔는지 추적합니다." },
      { title: "확보해야 할 증거", body: "대화·이체·계약 원본을 보존할 수 있는지 봅니다." },
    ],
    beforeAction: [
      "비현실적 수익·긴급 송금 요구가 있으면 멈추고 서류·계좌를 확인합니다.",
      "공식 채널이 아닌 연락·계좌는 별도로 검증합니다.",
      "계약서·제안서의 당사자·조건·환불 조항을 읽습니다.",
      "추가 송금 전에 상대방 신원·서류 진위를 점검합니다.",
    ],
    afterAction: [
      "대화·이체·계약 원본을 삭제하지 말고 보존합니다.",
      "추가 송금을 멈추고 피해 규모·시점을 정리합니다.",
      "신고·분쟁 대응에 필요한 증거 목록을 만듭니다.",
      "회수 가능 여부는 단정하지 않고, 확인·대응 순서를 잡습니다.",
    ],
    evidenceWhenProblem: [
      "계약서·제안서·영수증 원본",
      "은행·송금 앱 이체 내역·스크린샷",
      "카카오·Zalo·이메일·통화 기록",
      "상대방 명함·계좌·신분 관련 자료",
    ],
  },
  reviewChecks: [
    {
      title: "사전 검토",
      body: "투자·대출·온라인 거래·결혼·연애·사업제휴 제안서·계약서의 비정상 조건·허위 수익·선입금 요구를 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "투자금 미회수, 선입금 편취, 먹튀, 신뢰 이용 피해 등 발생 후 신고·증거 보전·대응 순서를 점검합니다.",
    },
    {
      title: "위험 신호",
      body: "비현실적 수익률, 긴급 송금 압박, 공식 채널이 아닌 연락, 서류·계좌 정보 불일치 등을 확인합니다.",
    },
    {
      title: "증거 보전",
      body: "대화·이체 내역·계약서 원본을 보존하고, 추가 송금 전에 대응 방향을 확인합니다.",
    },
  ],
  conditions: [
    "아래 자료 목록은 VFBCAI 플랫폼의 사기·피해 문서 검토 참고 항목입니다.",
    "형사·민사 대응 필요 여부는 사안·관할에 따라 달라질 수 있습니다.",
    "확인되지 않은 회수 가능성·처벌 결과는 단정하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 수익률만 보고 송금하는 경우",
      body: "비현실적 수익·긴급 송금 요구는 사기 의심 신호일 수 있습니다. 계좌·서류·연락처를 먼저 점검하세요.",
    },
    {
      title: "대표적인 상황: 피해 후 대화·이체 기록을 삭제하는 경우",
      body: "신고·분쟁 대응에 필요한 증거가 사라질 수 있습니다. 가능한 한 원본을 보존하세요.",
    },
  ],
  cautions: [
    "송금 전 제안서·계약서 진위를 확인하지 않는 경우",
    "증거 자료를 보존하지 않고 추가 송금하는 경우",
    "회수 가능성을 단정하고 대응을 미루는 경우",
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "사기·분쟁 관련 공식 신고·안내는 관할 기관·국가공공서비스포털에서 확인할 수 있습니다.",
});

export const TAX_GUIDE_ARTICLE = buildVerifyGuide({
  slug: TAX_GUIDE_SLUG,
  intentId: "verify-tax-guide",
  docServiceType: "verify_tax",
  costServiceId: "tax",
  funnelHref: "/verify/tax",
  title: "베트남 세무문서 검토·확인 포인트, 한눈에 보기",
  subtitle: "고지·통지 수령 전후 검토 흐름과 확인 포인트를 참고용으로 정리합니다.",
  metaDescription:
    "세무문서 검토는 세금 고지서·계좌동결 통지의 내용·기한을 확인하거나, 신고 누락·가산세·세무조사 대응 방향을 점검할 때 이용합니다.",
  question: "베트남 세금 고지서·통지서는 무엇을 검토하고 어떤 순서로 확인하면 되나요?",
  why: "고지·신고·조사 유형과 관할·납세자 명의에 따라 확인 항목과 기한이 달라지기 때문입니다.",
  narrative: {
    anxieties: [
      "세금 고지서가 왔는데 금액이 맞는지 모르겠다.",
      "계좌동결 통지를 받았다 — 기한을 놓치면 어떻게 되지?",
      "신고를 빠뜨린 것 같은데, 가산세가 붙을까?",
      "이 거래가 세금상 어떻게 처리되는지 확신이 없다.",
    ],
    caseCheckpoints: [
      { title: "거래·소득의 성격", body: "해당 거래가 어떤 세목·신고 대상인지 봅니다." },
      { title: "세금 관련 서류", body: "고지서·신고서·조사 통지의 내용·근거를 확인합니다." },
      { title: "신고·납부 여부", body: "신고·납부·이의 기한과 실제 처리 상태를 점검합니다." },
      { title: "명의·관할", body: "사업자번호·납세자 명의·관할 세무서가 맞는지 봅니다." },
    ],
    beforeAction: [
      "거래·계약 전에 세금 처리 방식·필요 서류를 확인합니다.",
      "사업자 등록·신고 의무가 있는지 관할 기준을 봅니다.",
      "고지·통지가 오기 전에 장부·계약·송금 내역을 정리해 둡니다.",
    ],
    afterAction: [
      "고지·동결·조사 통지의 기한과 요구 사항을 먼저 정리합니다.",
      "고지 근거·산정 내역·명의 일치를 대조합니다.",
      "이의·자료 제출·납부 중 어떤 대응이 맞는지 확인합니다.",
      "이미 끝난 거래라면 계약·송금·세금 서류를 모읍니다.",
    ],
    evidenceWhenProblem: [
      "세금 고지서·계좌동결·조사 통지 원본",
      "계약서·송금·매출·비용 관련 장부·영수증",
      "사업자등록·신고 접수 증빙",
      "세무서·대행사와의 대화·제출 기록",
    ],
  },
  reviewChecks: [
    {
      title: "사전 검토",
      body: "세금 고지서·신고서류·계좌동결·가산세 통지·세무조사 자료 요청의 내용·근거·기한을 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "고지 금액 이의, 신고 누락·오류, 계좌동결 해제, 가산세·세무조사 대응 단계를 점검합니다.",
    },
    {
      title: "기한 확인",
      body: "납부·이의신청·자료 제출 기한을 놓치면 불이익이 커질 수 있어 우선 확인합니다.",
    },
    {
      title: "명의·관할",
      body: "사업자번호·납세자 명의·관할 세무서가 서류와 일치하는지 확인합니다.",
    },
  ],
  conditions: [
    "아래 자료 목록은 VFBCAI 플랫폼의 세금 문서 검토 참고 항목입니다.",
    "관할 세무서·사업장 소재지에 따라 요구가 달라질 수 있습니다.",
    "확인되지 않은 추징액·가산세율은 임의로 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 계좌동결 통지를 기한 없이 방치하는 경우",
      body: "이의·자료 제출 기한이 있을 수 있습니다. 통지 내용과 기한을 먼저 정리하세요.",
    },
    {
      title: "대표적인 상황: 고지 금액만 보고 근거 서류를 확인하지 않는 경우",
      body: "고지 근거·산정 내역·명의 일치 여부를 함께 점검해야 이의·보완 방향을 잡기 쉽습니다.",
    },
  ],
  cautions: [
    "납부·이의 기한을 확인하지 않는 경우",
    "관할·사업자 명의 불일치를 놓치는 경우",
    "세무조사 자료 요청에 무응답하는 경우",
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "세무 관련 공식 안내·신고는 국가공공서비스포털·관할 세무서 기준으로 확인할 수 있습니다.",
});

export const UNCLEAR_GUIDE_ARTICLE = buildVerifyGuide({
  slug: UNCLEAR_GUIDE_SLUG,
  intentId: "verify-unclear-guide",
  docServiceType: "verify_unclear",
  costServiceId: "notary",
  funnelHref: "/verify/unclear",
  title: "베트남 불확실한 서류 검토·확인 포인트, 한눈에 보기",
  subtitle: "발신처·내용·기한이 불분명한 서류의 확인 흐름을 참고용으로 정리합니다.",
  metaDescription:
    "불확실한 서류 검토는 정부·법원·경찰·회사·개인·출처불명 통지의 성격과 요구 사항을 파악하거나, 번역·공증 필요성을 점검할 때 이용합니다.",
  question: "베트남어·영어로 된 서류를 받았는데 무엇인지 모를 때 어떻게 확인하면 되나요?",
  why: "발신처·문서 유형·대응 기한이 불분명하면 잘못된 대응이나 기한 누락으로 이어질 수 있기 때문입니다.",
  narrative: {
    anxieties: [
      "베트남어·영어 서류를 받았는데 이게 뭔지 모르겠다.",
      "누가 보낸 건지, 가짜 통지는 아닐까?",
      "서명·송금하라고 하는데, 하기 전에 뭘 확인해야 하지?",
      "이 문서가 다른 서류랑 어떤 관계인지 연결이 안 된다.",
    ],
    caseCheckpoints: [
      { title: "이 문서가 무엇인지", body: "행정·법원·경찰·회사·개인 통지인지 성격을 파악합니다." },
      { title: "누가 발급했는지", body: "공식 기관·회사 명의, 도장·연락처·서식을 확인합니다." },
      { title: "법적·행정적 용도", body: "제출·납부·이의·출석 등 요구 행위가 무엇인지 봅니다." },
      { title: "다른 문서와의 관계", body: "비자·계약·세금·부동산 서류와 어떻게 연결되는지 봅니다." },
      { title: "제출·서명·송금 전 확인", body: "기한·금액·계좌·발신처를 검증한 뒤 대응합니다." },
    ],
    beforeAction: [
      "발신처·연락처·도장·서식이 공식인지 확인합니다.",
      "문서에 적힌 기한·요구 행위·금액을 번역해 정리합니다.",
      "출처 불명이면 서명·송금 전에 멈추고 추가 확인합니다.",
      "번역·공증·영사확인이 필요한지 제출 목적에 맞춰 봅니다.",
    ],
    afterAction: [
      "이미 기한을 넘겼다면 현재 단계에 맞는 보완·이의 방향을 봅니다.",
      "잘못된 기관에 제출했는지, 재제출이 필요한지 확인합니다.",
      "문서 성격이 파악되면 행정·세무·부동산 등 해당 검토로 이어질 수 있습니다.",
    ],
    evidenceWhenProblem: [
      "받은 서류 원본·스캔 전체",
      "발신처와의 대화·이메일·통화 기록",
      "관련 계약·비자·세금·부동산 서류",
      "송금·납부 요구가 있었다면 이체 내역",
    ],
  },
  reviewChecks: [
    {
      title: "사전 검토",
      body: "정부·법원·경찰·회사·개인·출처불명 서류의 성격·요구 사항·위험 신호를 확인합니다.",
    },
    {
      title: "사후 검토",
      body: "이미 기한을 넘겼거나 대응 중인 경우, 현재 단계에 맞는 보완·이의·신고 방향을 점검합니다.",
    },
    {
      title: "발신처 확인",
      body: "공식 기관·회사 명의 여부, 연락처·도장·서식의 정상 여부를 확인합니다.",
    },
    {
      title: "번역·공증",
      body: "제출·소송·행정 대응에 번역·공증·영사확인이 필요한지 확인합니다.",
    },
  ],
  conditions: [
    "아래 자료 목록은 VFBCAI 플랫폼의 분야 불명확 문서 검토 참고 항목입니다.",
    "문서 성격이 파악되면 행정·세무·부동산 등 해당 전문 검토로 이어질 수 있습니다.",
    "공증 수수료 참고는 costCheck `notary` 항목( Circular 257/2016/TT-BTC)에 연결된 범위만 사용합니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 통지 기한을 읽지 못해 방치하는 경우",
      body: "언어 장벽으로 기한·요구 사항을 놓치기 쉽습니다. 발신처·기한·요구 행위를 먼저 정리하세요.",
    },
    {
      title: "대표적인 상황: 출처 불명 서류에 즉시 송금·서명하는 경우",
      body: "발신처·계좌·연락처를 확인하기 전에 대응하면 추가 피해 위험이 있을 수 있습니다.",
    },
  ],
  cautions: [
    "발신처·기한 확인 없이 서명·송금하는 경우",
    "번역·공증 필요 여부를 확인하지 않는 경우",
    "문서 성격 파악 없이 잘못된 기관에 제출하는 경우",
  ],
  officialUrl: "https://dichvucong.gov.vn/",
  officialNote: "서류 성격·제출 창구는 발신 기관·관할에 따라 다르므로 공식 포털에서 추가 확인이 필요할 수 있습니다.",
});

export const VERIFY_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [ADMIN_GUIDE_ARTICLE.slug]: ADMIN_GUIDE_ARTICLE,
  [REAL_ESTATE_GUIDE_ARTICLE.slug]: REAL_ESTATE_GUIDE_ARTICLE,
  [FRAUD_GUIDE_ARTICLE.slug]: FRAUD_GUIDE_ARTICLE,
  [TAX_GUIDE_ARTICLE.slug]: TAX_GUIDE_ARTICLE,
  [UNCLEAR_GUIDE_ARTICLE.slug]: UNCLEAR_GUIDE_ARTICLE,
};
