import type { ArticleIntentId, PublishedArticle } from "@/lib/contentPacks/types";
import { getAnonymousDocumentList, PROCESS_BY_GROUP } from "@/lib/anonymousLegalGuide";
import {
  DIRECT_PERMIT_COMPANY_GUIDE,
  DIRECT_PERMIT_COMPANY_ITEMS,
  getCostCheckService,
} from "@/lib/costCheck";
import {
  buildCaseOrientedQa,
  buildCaseOrientedSections,
  type CaseNarrativeSpec,
} from "@/lib/contentPacks/guideCaseNarrative";
import { getRequiredDocuments } from "@/lib/requiredDocuments";

const UPDATED = "2026-08-28";

const REGISTER_PROCESS_STEPS = [
  "서류 준비",
  "관할 등록·허가 기관 신청",
  "심사·현장 확인 후 승인 — 업종에 따라 추가 서류를 요청받을 수 있음",
];

const REGISTER_DURATION_NOTE =
  "업종·관할·준비 상태에 따라 추가 서류·현장 확인이 있을 수 있으니, 일정에 여유를 두시는 것이 좋습니다.";

type RegisterGuideSpec = {
  slug: string;
  intentId: ArticleIntentId;
  /** getRequiredDocuments / getAnonymousDocumentList 키 */
  docServiceType: string;
  funnelHref: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  question: string;
  why: string;
  /** true면 costCheck `company` 수수료 표시. 그 외는 미연결 안내만. */
  showOfficialCost: boolean;
  costLookupNote: string;
  narrative: CaseNarrativeSpec;
  conditions: string[];
  cases: { title: string; body: string }[];
  cautions: string[];
};

function buildRegisterGuide(spec: RegisterGuideSpec): PublishedArticle {
  const required = getRequiredDocuments(spec.docServiceType);
  const docs = getAnonymousDocumentList(spec.docServiceType);
  const companyCost = spec.showOfficialCost ? getCostCheckService("company") : null;

  const directAnswer = companyCost
    ? `진행은 ${REGISTER_PROCESS_STEPS[0]} → ${REGISTER_PROCESS_STEPS[1]} → ${REGISTER_PROCESS_STEPS[2].replace(
        / —.*/,
        ""
      )} 순으로 보시면 되고, 핵심 서류는 ${required.documents.join(", ")}입니다. 비용은 정부 수수료와 대행·번역·후속 비용을 함께 확인하는 것이 좋습니다.`
    : `진행은 ${REGISTER_PROCESS_STEPS[0]} → ${REGISTER_PROCESS_STEPS[1]} → ${REGISTER_PROCESS_STEPS[2].replace(
        / —.*/,
        ""
      )} 순으로 보시면 되고, 핵심 서류는 ${required.documents.join(", ")}입니다. ${spec.costLookupNote}`;

  const costNote = companyCost
    ? `${companyCost.lookupGuide} 정부 수수료 참고: ${companyCost.governmentFee} (출처: ${companyCost.source}).`
    : spec.costLookupNote;

  const costComparison = companyCost
    ? `${companyCost.governmentFee} (출처: ${companyCost.source}). 견적 비교 시 대행·번역·후속 포함 여부를 확인하세요.`
    : spec.costLookupNote;

  const sources: PublishedArticle["caseLanding"]["sources"] = [
    {
      label: "VFBCAI 참고 서류 목록",
      detail: `같은 플랫폼의 ${required.serviceLabel} 서류 항목(우선 제출·있으면 제출). 법령 조항에서 추출한 확정 목록이 아닙니다.`,
    },
  ];
  if (companyCost) {
    sources.push({
      label: companyCost.source,
      detail: `정부 수수료 ${companyCost.governmentFee} — 비용 안내에만 사용`,
    });
  }

  const middleSections: PublishedArticle["sections"] = [
    { type: "h2", text: "진행 순서" },
    { type: "p", text: PROCESS_BY_GROUP.register },
    { type: "h2", text: "필요 서류 (참고)" },
    { type: "bullets", items: docs },
    {
      type: "p",
      text: "사업 형태·영업장·관할에 따라 추가 요청이 있을 수 있습니다. 위 목록을 기준으로 먼저 모아 두시면 보완 대응이 수월합니다.",
    },
    { type: "h2", text: "비용은 어떻게 보나요?" },
    { type: "p", text: costNote },
  ];

  if (companyCost) {
    middleSections.push(
      { type: "h2", text: "직접 진행 시 참고 항목" },
      { type: "p", text: DIRECT_PERMIT_COMPANY_GUIDE },
      {
        type: "bullets",
        items: DIRECT_PERMIT_COMPANY_ITEMS.map((item) => `${item.label}: ${item.amount}`),
      }
    );
  }

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
      officialBasis: [],
      costNote,
      durationNote: REGISTER_DURATION_NOTE,
      process: REGISTER_PROCESS_STEPS,
      showDocuments: true,
      showOfficialCost: spec.showOfficialCost,
      conditions: spec.conditions,
      cases: spec.cases,
      comparison: [
        { label: "진행", text: PROCESS_BY_GROUP.register },
        {
          label: "서류",
          text: `우선 제출: ${required.documents.join(", ")}. 있으면 제출: ${(required.optionalDocuments ?? []).join(", ")}.`,
        },
        { label: "비용", text: costComparison },
      ],
      cautions: spec.cautions,
      qa: buildCaseOrientedQa(required.serviceLabel, spec.narrative, [
        {
          q: `${required.serviceLabel} 진행 순서는 어떻게 되나요?`,
          a: PROCESS_BY_GROUP.register,
        },
        {
          q: "어떤 서류를 먼저 준비하면 되나요?",
          a: `참고 목록 기준 우선 제출은 ${required.documents.join(", ")}입니다. ${(required.optionalDocuments ?? []).slice(0, 2).join(", ")} 등은 있으면 제출 항목입니다.`,
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

const PENDING_COST =
  "전용 공식 수수료·시장가격 데이터가 아직 연결되지 않아 임의 금액을 표시하지 않습니다. 정확한 안내는 준비 상태 확인 후 이어집니다.";

export const COMPANY_GUIDE_SLUG = "company-setup-process-and-cost";
export const RESTAURANT_GUIDE_SLUG = "restaurant-permit-process-and-cost";
export const HYGIENE_GUIDE_SLUG = "hygiene-permit-process-and-cost";
export const FIRE_SAFETY_GUIDE_SLUG = "fire-safety-permit-process-and-cost";
export const COSMETICS_GUIDE_SLUG = "cosmetics-permit-process-and-cost";
export const ENVIRONMENT_GUIDE_SLUG = "environment-permit-process-and-cost";
export const MEDICAL_DEVICE_GUIDE_SLUG = "medical-device-permit-process-and-cost";
export const FRANCHISE_GUIDE_SLUG = "franchise-registration-process-and-cost";

export const COMPANY_GUIDE_ARTICLE = buildRegisterGuide({
  slug: COMPANY_GUIDE_SLUG,
  intentId: "register-company-guide",
  docServiceType: "register_company_individual",
  funnelHref: "/register/company",
  title: "베트남 법인설립 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "법인설립은 서류 준비 → 관할 등록 신청 → 심사 후 승인 순으로 진행됩니다. 개인 투자 기준으로 여권·잔고증명·주소 자료가 핵심이며, 정부 고시 수수료와 인감·전자서명 등 실무 비용을 함께 확인하세요.",
  question: "베트남 법인설립 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "투자 형태(개인·법인), 주소·자본 준비, 후속 인허가에 따라 준비물과 견적 구성이 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: true,
  costLookupNote: "",
  narrative: {
    anxieties: [
      "법인 없이 사업하면 나중에 문제가 생길까?",
      "서류가 빠져서 반려되면 시간과 돈을 다시 써야 하나?",
      "정부 수수료만 보면 싼데, 실제로는 얼마나 더 드는 걸까?",
      "개인 투자와 법인 투자 중 내 경우에 맞는 서류가 뭔지 헷갈린다.",
    ],
    caseCheckpoints: [
      { title: "투자 형태", body: "개인·법인 투자에 따라 필요 서류가 달라집니다." },
      { title: "본점·자본 증빙", body: "주소·잔고증명·자본금 관련 자료를 점검합니다." },
      { title: "핵심 제출 서류", body: "여권·정관·위임 등 우선 제출 항목을 모읍니다." },
      { title: "후속 인허가", body: "업종에 따라 추가 허가가 이어질 수 있습니다." },
      { title: "비용 구성", body: "정부 수수료와 대행·인감·후속 비용을 나눠 봅니다." },
    ],
    beforeAction: [
      "개인·법인 투자 형태를 정하고 필요 서류 목록을 맞춥니다.",
      "본점 주소·자본 증빙을 준비합니다.",
      "정부 수수료와 대행·번역·후속 비용을 함께 견적 봅니다.",
      "신청 전에 서류 누락·형식 오류를 점검합니다.",
    ],
    afterAction: [
      "반려·보완 요청 사유를 정리하고 추가 서류를 준비합니다.",
      "등록 후 세무·인허가 등 후속 절차 일정을 잡습니다.",
      "제출본과 기관 요구를 다시 대조합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출했던 서류 사본",
      "대행사·등록 기관과의 대화·이메일",
      "송금·수수료 납부 영수증",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 법인설립·개인 투자 참고 항목입니다.",
    "법인 투자인 경우 투자법인 등록증·정관·재무자료 등 추가 항목이 안내됩니다.",
    "정부 고시 수수료 외 인감·전자서명·세무 초기설정 등 실무 비용이 함께 발생할 수 있습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 투자 형태마다 달라집니다. 먼저 공통 순서와 핵심 서류를 정리한 뒤, 정부 수수료와 대행·후속 비용을 나눠 보는 것이 덜 헷갈립니다.",
    },
    {
      title: "대표적인 상황: 정부 수수료만 보고 견적이 싸다고 느끼는 경우",
      body: "등록·공고 수수료는 상대적으로 낮을 수 있으나, 번역·공증·대행·후속 인허가가 견적에 크게 반영되는 경우가 많습니다. 포함 항목을 구분해서 보세요.",
    },
  ],
  cautions: [
    "개인 투자와 법인 투자 서류 차이를 확인하지 않는 경우",
    "정부 수수료만 보고 대행·후속 비용을 빠뜨리는 경우",
    "본점 주소·자본 증빙 준비를 확인하지 않고 진행을 단정하는 경우",
  ],
});

export const RESTAURANT_GUIDE_ARTICLE = buildRegisterGuide({
  slug: RESTAURANT_GUIDE_SLUG,
  intentId: "register-restaurant-guide",
  docServiceType: "register_restaurant",
  funnelHref: "/register/restaurant",
  title: "베트남 식당허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "식당허가는 서류 준비 → 관할 신청 → 심사·현장 확인 후 승인 순으로 진행됩니다. 사업자·임대차·건강검진서가 핵심이며, 위생·소방 등 추가 절차 가능성을 함께 확인하세요.",
  question: "베트남 식당허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "영업장 준비 상태, 위생·소방 연계, 관할·업종에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `식당허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "인허가 없이 영업했다가 단속당할까?",
      "식당허가만 되면 끝인 줄 알았는데 위생·소방도 필요한가?",
      "영업장 임대·건강검진을 안 해두면 반려될까?",
      "견적이 제각각인데 뭘 기준으로 봐야 하지?",
    ],
    caseCheckpoints: [
      { title: "영업장 준비", body: "임대차·사업장 주소·시설 상태를 봅니다." },
      { title: "사업자·건강검진", body: "사업자등록·종사자 건강검진서 등 핵심 서류를 모읍니다." },
      { title: "연계 인허가", body: "위생·소방 등 추가 절차 가능성을 확인합니다." },
      { title: "관할·업종", body: "관할 기관과 업종 분류에 맞는 서류를 준비합니다." },
    ],
    beforeAction: [
      "영업장 임대·건강검진·사업자 자료를 먼저 모읍니다.",
      "위생·소방 연계 필요 여부를 확인합니다.",
      "확인된 비용만 비교하고 임의 금액에 단정하지 않습니다.",
    ],
    afterAction: [
      "반려·현장 확인 보완 요청에 맞춰 추가 서류를 준비합니다.",
      "영업 개시 전 연계 허가 완료 여부를 점검합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출 서류 사본",
      "임대계약·건강검진·사업자 관련 자료",
      "현장 확인·대행사 대화 기록",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 식당허가 참고 항목입니다.",
    "위생·소방 관련 자료는 있으면 제출·연계 확인이 필요한 경우가 많습니다.",
    "사업 조건에 따라 한 번의 신청으로 끝나지 않을 수 있습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 영업장·관할마다 달라집니다. 먼저 공통 서류와 준비 상태를 정리한 뒤, 확인된 비용만 비교하는 것이 안전합니다.",
    },
    {
      title: "대표적인 상황: 식당허가만 되면 끝이라고 듣는 경우",
      body: "위생·소방 등 추가 확인이 이어질 수 있습니다. 확인되지 않은 2·3차 절차·비용은 표시하지 않으며, 준비 상태를 먼저 확인하세요.",
    },
  ],
  cautions: [
    "위생·소방 연계 가능성을 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "영업장 임대·건강검진 준비를 빠뜨리는 경우",
  ],
});

export const HYGIENE_GUIDE_ARTICLE = buildRegisterGuide({
  slug: HYGIENE_GUIDE_SLUG,
  intentId: "register-hygiene-guide",
  docServiceType: "register_hygiene",
  funnelHref: "/register/hygiene",
  title: "베트남 위생허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "위생허가는 서류 준비 → 관할 신청 → 심사·현장 확인 후 승인 순으로 진행됩니다. 사업자·임대차·평면도·건강검진서가 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question: "베트남 위생허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "시설 배치, 종사자 준비, 관할·업종에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `위생허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "위생허가 없이 영업하면 벌금·영업정지가 될까?",
      "평면도·시설 사진이 부족하면 반려될까?",
      "종사자 교육·건강검진을 빠뜨리면 어떻게 되지?",
      "커뮤니티 견적만 믿어도 될까?",
    ],
    caseCheckpoints: [
      { title: "시설 배치", body: "평면도·시설 사진·배치가 요건에 맞는지 봅니다." },
      { title: "종사자 준비", body: "건강검진·위생교육 등 종사자 관련 서류를 확인합니다." },
      { title: "사업자·임대", body: "사업자등록·임대차 등 기본 서류를 모읍니다." },
      { title: "관할·업종", body: "관할과 업종에 따른 추가 요청을 점검합니다." },
    ],
    beforeAction: [
      "평면도·시설 사진·건강검진서를 먼저 준비합니다.",
      "종사자 위생교육 등 있으면 제출 항목을 확인합니다.",
      "연결된 공식 비용 데이터만 참고합니다.",
    ],
    afterAction: [
      "현장 확인·보완 요청에 맞춰 시설·서류를 보완합니다.",
      "기존 반려·보완 이력이 있으면 함께 정리합니다.",
    ],
    evidenceWhenProblem: [
      "반려·현장 확인 통지, 제출 서류",
      "시설 사진·평면도·교육 이수 증빙",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 위생허가 참고 항목입니다.",
    "종사자 위생교육·시설 사진 등은 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 시설·관할마다 달라집니다. 먼저 핵심 서류를 모은 뒤, 연결된 비용 데이터만 참고하세요.",
    },
    {
      title: "대표적인 상황: 커뮤니티 견적만으로 비교하는 경우",
      body: "포함 범위가 제각각일 수 있습니다. 공식 수수료 데이터가 연결되기 전에는 임의 금액을 단정하지 마세요.",
    },
  ],
  cautions: [
    "시설·종사자 준비를 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "기존 보완·반려 이력을 빠뜨리는 경우",
  ],
});

export const FIRE_SAFETY_GUIDE_ARTICLE = buildRegisterGuide({
  slug: FIRE_SAFETY_GUIDE_SLUG,
  intentId: "register-fire-safety-guide",
  docServiceType: "register_fire_safety",
  funnelHref: "/register/fire-safety",
  title: "베트남 소방허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "소방허가는 서류 준비 → 관할 신청 → 심사·현장 확인 후 승인 순으로 진행됩니다. 사업자·임대차·평면도·소방시설 자료가 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question: "베트남 소방허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "건축·소방시설 상태, 안전관리자 선임, 관할에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `소방허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "소방허가 없이 오픈하면 단속·영업정지가 될까?",
      "소방시설·배치도가 부족하면 현장 확인에서 막힐까?",
      "안전관리자 선임을 안 하면 반려될까?",
      "시설 사진만 있으면 된다고 들었는데 맞나?",
    ],
    caseCheckpoints: [
      { title: "소방시설·배치", body: "평면도·소방시설·배치도를 점검합니다." },
      { title: "안전관리", body: "소방안전관리자·소방계획서 등 필요 여부를 봅니다." },
      { title: "사업장·임대", body: "사업자·임대차·시설 사진을 모읍니다." },
      { title: "기존 검사 이력", body: "과거 소방검사·보완 이력이 있으면 함께 확인합니다." },
    ],
    beforeAction: [
      "평면도·소방시설 자료·시설 사진을 준비합니다.",
      "안전관리자 선임·소방계획서 필요 여부를 봅니다.",
      "관할 기관 요구와 참고 서류 목록을 대조합니다.",
    ],
    afterAction: [
      "현장 확인 후 보완 요청에 맞춰 시설을 정비합니다.",
      "기존 검사·보완 이력을 제출 자료에 포함합니다.",
    ],
    evidenceWhenProblem: [
      "반려·현장 확인 통지, 제출 서류",
      "소방시설·배치도·점검 기록",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 소방허가 참고 항목입니다.",
    "소방안전관리자·소방계획서 등은 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 시설·관할마다 달라집니다. 먼저 평면도·소방시설 자료를 정리하세요.",
    },
    {
      title: "대표적인 상황: 시설 사진만 있으면 된다고 듣는 경우",
      body: "배치도·점검 자료·관리자 선임 등이 함께 요구될 수 있습니다. 참고 목록을 기준으로 누락을 확인하세요.",
    },
  ],
  cautions: [
    "소방시설·배치도 준비를 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "기존 소방검사·보완 이력을 빠뜨리는 경우",
  ],
});

export const COSMETICS_GUIDE_ARTICLE = buildRegisterGuide({
  slug: COSMETICS_GUIDE_SLUG,
  intentId: "register-cosmetics-guide",
  docServiceType: "register_cosmetics",
  funnelHref: "/register/cosmetics",
  title: "베트남 화장품허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "화장품허가는 서류 준비 → 관할 신청 → 심사 후 승인 순으로 진행됩니다. 사업자·위임장·CFS·전성분표가 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question: "베트남 화장품허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "제품·제조사 자료, 유통 방식, 관할에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `화장품허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "수입·판매 전 허가 없이 하면 압수·벌금이 될까?",
      "CFS·전성분표가 없으면 아예 시작도 못 하나?",
      "제품마다 서류가 다른데 뭘 먼저 준비해야 하지?",
      "대행 견적이 천차만별인데 기준이 뭔지 모르겠다.",
    ],
    caseCheckpoints: [
      { title: "제조사·위임", body: "위임장·제조사 자료·CFS를 확인합니다." },
      { title: "제품·성분", body: "전성분표·라벨·PIF 등 제품별 자료를 봅니다." },
      { title: "유통 방식", body: "수입·판매·보관 방식에 따른 서류를 점검합니다." },
      { title: "사업자 기본", body: "사업자등록 등 기본 제출 서류를 모읍니다." },
    ],
    beforeAction: [
      "위임장·CFS·전성분표를 먼저 모읍니다.",
      "제품별 추가자료(있으면 제출)를 목록으로 정리합니다.",
      "확인된 비용만 비교합니다.",
    ],
    afterAction: [
      "심사·보완 요청에 맞춰 제품별 자료를 보완합니다.",
      "유통·보관 시설 관련 요청이 있으면 대응합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출 서류 사본",
      "제조사 위임·CFS·성분·라벨 자료",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 화장품허가 참고 항목입니다.",
    "PIF·라벨·품질관리 자료는 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 제품마다 달라집니다. 먼저 위임장·CFS·전성분표를 모으세요.",
    },
    {
      title: "대표적인 상황: 제품마다 요구가 다르다는 안내를 듣는 경우",
      body: "공통 참고 목록을 기준으로 두고, 제품별 추가자료는 있으면 제출 항목으로 나눠 보시면 됩니다.",
    },
  ],
  cautions: [
    "제조사 위임·CFS·성분자료를 빠뜨리는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "제품별 추가자료를 확인하지 않는 경우",
  ],
});

export const ENVIRONMENT_GUIDE_ARTICLE = buildRegisterGuide({
  slug: ENVIRONMENT_GUIDE_SLUG,
  intentId: "register-environment-guide",
  docServiceType: "register_environment",
  funnelHref: "/register/environment",
  title: "베트남 환경허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "환경허가는 서류 준비 → 관할 신청 → 심사·현장 확인 후 승인 순으로 진행됩니다. 사업자·입지·공정·환경영향 관련 자료가 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question: "베트남 환경허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "사업장 규모·공정·배출 형태, 관할에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `환경허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "환경허가 없이 공장·폐수 배출하면 영업이 막힐까?",
      "측정자료·환경영향 평가가 없으면 반려될까?",
      "공정·규모에 따라 서류가 달라진다는데 내 경우는?",
      "입지만 정하면 된다고 들었는데 더 필요한 게 있나?",
    ],
    caseCheckpoints: [
      { title: "입지·공정", body: "사업장 입지·공정·배출 형태를 정리합니다." },
      { title: "환경영향", body: "환경영향·폐수·대기·폐기물 관련 자료를 봅니다." },
      { title: "측정·시설", body: "배출시설·측정자료 등 있으면 제출 항목을 확인합니다." },
      { title: "사업자·관할", body: "사업자등록·관할 기관 요구를 맞춥니다." },
    ],
    beforeAction: [
      "입지·공정·환경영향 자료를 먼저 정리합니다.",
      "폐수·대기·폐기물 관련 추가 요청 가능성을 봅니다.",
      "측정자료 등 있으면 제출 항목을 준비합니다.",
    ],
    afterAction: [
      "심사·현장 확인 보완에 맞춰 자료를 보완합니다.",
      "기존 환경허가·보완 이력이 있으면 함께 제출합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출 서류",
      "입지·공정·측정·환경영향 관련 자료",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 환경허가 참고 항목입니다.",
    "배출시설·측정자료 등은 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 공정·관할마다 달라집니다. 먼저 입지·공정·환경영향 자료를 정리하세요.",
    },
    {
      title: "대표적인 상황: 측정자료 없이 진행하려 하는 경우",
      body: "폐수·대기·소음·폐기물 관련 자료가 추가 요청될 수 있습니다. 있으면 제출 항목을 함께 확인하세요.",
    },
  ],
  cautions: [
    "공정·입지 자료를 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "기존 환경허가·보완 이력을 빠뜨리는 경우",
  ],
});

export const MEDICAL_DEVICE_GUIDE_ARTICLE = buildRegisterGuide({
  slug: MEDICAL_DEVICE_GUIDE_SLUG,
  intentId: "register-medical-device-guide",
  docServiceType: "register_medical_device",
  funnelHref: "/register/medical-device",
  title: "베트남 의료기기 수입·유통허가 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "의료기기 수입·유통허가는 서류 준비 → 관할 신청 → 심사 후 승인 순으로 진행됩니다. 사업자·위임·분류·품질·창고 자료가 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question:
    "베트남 의료기기 수입·유통허가 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "제품 분류·품질문서, 보관·유통 시설, 관할에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `의료기기 수입·유통허가 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "허가 없이 수입·판매하면 압수·처벌이 될까?",
      "제품 분류·품질문서가 없으면 신청 자체가 안 되나?",
      "창고·보관 시설 자료를 안 갖추면 반려될까?",
      "CFS·ISO·시험성적서 중 뭐가 먼저인지 헷갈린다.",
    ],
    caseCheckpoints: [
      { title: "제품 분류", body: "의료기기 분류에 따른 서류 요건을 봅니다." },
      { title: "품질·제조", body: "CFS·ISO·시험성적서 등 품질 관련 자료를 확인합니다." },
      { title: "보관·유통", body: "창고·유통시설 자료가 핵심인지 점검합니다." },
      { title: "위임·사업자", body: "제조사 위임·사업자등록 등 기본 서류를 모읍니다." },
    ],
    beforeAction: [
      "위임·분류·품질·창고 자료를 먼저 모읍니다.",
      "제품별 추가자료(있으면 제출)를 정리합니다.",
      "보관·유통시설 요건을 참고 목록과 대조합니다.",
    ],
    afterAction: [
      "심사·보완 요청에 맞춰 품질·시설 자료를 보완합니다.",
      "수입·유통 전 최종 허가 상태를 확인합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출 서류",
      "CFS·ISO·시험성적·창고 관련 자료",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 의료기기 수입·유통허가 참고 항목입니다.",
    "CFS·ISO·시험성적서 등은 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 제품·분류마다 달라집니다. 먼저 위임·분류·품질·창고 자료를 모으세요.",
    },
    {
      title: "대표적인 상황: 창고 자료 없이 진행하려 하는 경우",
      body: "보관·유통시설 자료가 핵심 목록에 포함되어 있습니다. 누락 여부를 먼저 확인하세요.",
    },
  ],
  cautions: [
    "제품 분류·품질문서를 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "창고·유통시설 자료를 빠뜨리는 경우",
  ],
});

export const FRANCHISE_GUIDE_ARTICLE = buildRegisterGuide({
  slug: FRANCHISE_GUIDE_SLUG,
  intentId: "register-franchise-guide",
  docServiceType: "register_franchise",
  funnelHref: "/register/franchise",
  title: "베트남 프랜차이즈 등록 진행·서류·비용, 한눈에 보기",
  subtitle: "진행 순서, 준비 서류, 비용 확인 방법을 참고용으로 정리합니다.",
  metaDescription:
    "프랜차이즈 등록은 서류 준비 → 관할 신청 → 심사 후 승인 순으로 진행됩니다. 가맹본부 등록증·직영 이력·계약서·운영매뉴얼이 핵심이며, 확인된 비용 기준이 있을 때만 비교하세요.",
  question: "베트남 프랜차이즈 등록 진행이 어떻게 되고 서류는 무엇이 필요하며 비용은 얼마나 드나요?",
  why: "가맹본부 준비 상태, 직영 이력, 계약·매뉴얼 구성에 따라 준비물과 절차가 달라질 수 있기 때문입니다. 한 항목만 보고 확정하기 어렵습니다.",
  showOfficialCost: false,
  costLookupNote: `프랜차이즈 등록 ${PENDING_COST}`,
  narrative: {
    anxieties: [
      "프랜차이즈 등록 없이 가맹 모집하면 문제가 될까?",
      "직영점 이력·운영매뉴얼이 없으면 반려될까?",
      "계약서만 있으면 된다고 들었는데 더 필요한 게 있나?",
      "가맹본부 등록증·상표권 자료를 어디서부터 모으지?",
    ],
    caseCheckpoints: [
      { title: "가맹본부 자격", body: "등록증·직영 이력·운영 실적을 확인합니다." },
      { title: "계약·매뉴얼", body: "가맹계약서·운영매뉴얼·정보공개 자료를 봅니다." },
      { title: "상표·브랜드", body: "상표권·브랜드 관련 자료(있으면 제출)를 점검합니다." },
      { title: "교육·운영체계", body: "교육체계·가맹 운영 구조를 정리합니다." },
    ],
    beforeAction: [
      "계약서·매뉴얼·직영 이력을 먼저 정리합니다.",
      "가맹본부 등록·상표권 등 있으면 제출 항목을 확인합니다.",
      "관할 기관 요구와 참고 목록을 대조합니다.",
    ],
    afterAction: [
      "심사·보완 요청에 맞춰 계약·매뉴얼·이력 자료를 보완합니다.",
      "기존 등록·보완 이력이 있으면 함께 제출합니다.",
    ],
    evidenceWhenProblem: [
      "반려·보완 통지, 제출 서류",
      "계약서·매뉴얼·직영 이력·상표 관련 자료",
    ],
  },
  conditions: [
    "아래 서류 목록은 VFBCAI 플랫폼의 프랜차이즈 등록 참고 항목입니다.",
    "정보공개·상표권·교육체계 자료는 있으면 제출 항목입니다.",
    "확인되지 않은 수수료·대행료는 표시하지 않습니다.",
  ],
  cases: [
    {
      title: "대표적인 상황: 진행·서류·비용을 한꺼번에 물어보는 경우",
      body: "절차는 같은 흐름이고, 서류와 실비만 가맹 구조마다 달라집니다. 먼저 계약서·매뉴얼·직영 이력을 정리하세요.",
    },
    {
      title: "대표적인 상황: 계약서만 있으면 된다고 듣는 경우",
      body: "직영점 운영 이력·운영매뉴얼 등이 함께 안내됩니다. 참고 목록 기준으로 누락을 확인하세요.",
    },
  ],
  cautions: [
    "직영 이력·운영매뉴얼을 확인하지 않는 경우",
    "확인되지 않은 금액을 단정하는 경우",
    "기존 등록·보완 이력을 빠뜨리는 경우",
  ],
});

export const REGISTER_ARTICLES_BY_SLUG: Record<string, PublishedArticle> = {
  [COMPANY_GUIDE_ARTICLE.slug]: COMPANY_GUIDE_ARTICLE,
  [RESTAURANT_GUIDE_ARTICLE.slug]: RESTAURANT_GUIDE_ARTICLE,
  [HYGIENE_GUIDE_ARTICLE.slug]: HYGIENE_GUIDE_ARTICLE,
  [FIRE_SAFETY_GUIDE_ARTICLE.slug]: FIRE_SAFETY_GUIDE_ARTICLE,
  [COSMETICS_GUIDE_ARTICLE.slug]: COSMETICS_GUIDE_ARTICLE,
  [ENVIRONMENT_GUIDE_ARTICLE.slug]: ENVIRONMENT_GUIDE_ARTICLE,
  [MEDICAL_DEVICE_GUIDE_ARTICLE.slug]: MEDICAL_DEVICE_GUIDE_ARTICLE,
  [FRANCHISE_GUIDE_ARTICLE.slug]: FRANCHISE_GUIDE_ARTICLE,
};
