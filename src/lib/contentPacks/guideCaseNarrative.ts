import type { ArticleSection, CaseQa } from "@/lib/contentPacks/types";

/** VFBCAI 차별점 — 검증 불가한 절대 우월 표현 금지 */
export const VFBCAI_DIFFERENTIATION =
  "VFBCAI는 베트남 법령·행정 기준에 특화된 Legal RAG를 사용합니다. 질문만 보는 것이 아니라, 사용자가 입력한 사건 내용·첨부 문서·증거를 함께 기준으로 관련 법령과 행정 자료를 찾아 사건을 구조화하고, 어떤 부분을 확인해야 하는지 근거 중심으로 안내합니다.";

export const VFBCAI_WHY_UPLOAD =
  "같은 서류라도 사건 맥락에 따라 확인 포인트가 달라집니다. 계약 조건, 송금 시점, 기관 통지 내용, 보유 증거를 함께 알려주셔야 내 사건에 맞는 확인이 가능합니다. 일반적인 설명만으로는 놓치는 부분이 생길 수 있습니다.";

export const GUIDE_HERO_CORE_MESSAGE =
  "사건 + 증거자료 + 관련 베트남 법령·행정 기준을 함께 검토합니다.";

export const VFBCAI_REVIEW_SUMMARY =
  "VFBCAI는 베트남 법령·행정에 특화된 기준을 바탕으로 사용자가 입력한 사건과 자료를 함께 검토합니다.";

export const VFBCAI_REVIEW_FLOW_VISUAL = [
  "사건 이해",
  "자료 확인",
  "베트남 법령·행정 기준 적용",
  "교차 검토",
  "위험·누락·쟁점 정리",
  "결과와 다음 행동 안내",
] as const;

export const VFBCAI_APPROACH_STEPS = [
  {
    title: "내 사건 이해하기",
    desc: "지금 어떤 상황인지, 무엇이 걱정되는지부터 파악합니다.",
  },
  {
    title: "자료 확인",
    desc: "계약서·공문·통지서·송금내역 등 제출 자료를 확인합니다.",
  },
  {
    title: "법령 적용",
    desc: "베트남 관련 법령·행정 기준을 사건에 맞게 적용합니다.",
  },
  {
    title: "교차 검토",
    desc: "사건·자료·법령을 함께 놓고 대조합니다.",
  },
  {
    title: "결과와 다음 행동 안내",
    desc: "확인해야 할 사항과 다음 단계를 정리합니다.",
  },
] as const;

export const GUIDE_EVIDENCE_NOTE =
  "증거자료를 함께 확인하면 사건의 사실관계를 더 구체적으로 확인할 수 있습니다.";

/** Guide 상세 상단 7단계 프로세스 — 플랫폼 공통 */
export const GUIDE_REVIEW_PROCESS_STEPS = [
  { step: 1, title: "상황 입력", desc: "지금 어떤 단계인지, 무엇이 걱정되는지" },
  { step: 2, title: "증거자료 제출", desc: "계약서·행정서류·송금내역 등" },
  { step: 3, title: "법령·행정 기준 적용", desc: "베트남 관련 법령·행정 기준 확인" },
  { step: 4, title: "교차 검토", desc: "사건 × 증거 × 법령을 함께 대조" },
  { step: 5, title: "위험·누락 확인", desc: "놓치기 쉬운 문제·누락·쟁점 점검" },
  { step: 6, title: "검토 결과 리포트", desc: "확인 포인트·권장 조치 방향 정리" },
  { step: 7, title: "다음 행동 안내", desc: "단정이 아닌 확인·대응 가이드" },
] as const;

export const GUIDE_HERO_TAGLINE =
  "내 사건을 그냥 읽어보는 것과, 실제 자료를 놓고 확인하는 것은 다릅니다.";

export const VFBCAI_REVIEW_APPROACH = [
  "사건 내용을 먼저 이해합니다.",
  "사용자가 제출한 자료를 확인합니다.",
  "베트남 법령·행정 기준과 함께 교차 검토합니다.",
  "문제·위험·누락과 다음 행동을 근거 중심으로 정리합니다.",
] as const;

export const VFBCAI_ACTION_FLOW = [
  "내 상황 입력 — 지금 어떤 단계인지, 무엇이 걱정되는지",
  "질문에 답하기 — 사건 유형·진행 단계·확인하고 싶은 포인트",
  "증거자료 업로드 — 계약서·행정서류·송금내역·대화 기록 등",
  "사건 내용 분석 — 입력·첨부 자료를 기준으로 구조화",
  "관련 베트남 법령·행정 기준 확인 — Legal RAG 근거 검색",
  "내 사건 맞춤 결과 리포트 — 확인 포인트·권장 조치 방향",
  "다음에 무엇을 해야 하는지 Guide — 단정이 아닌 확인·대응 안내",
];

export type CaseNarrativeSpec = {
  /** 사용자 불안·걱정 — 질문형 문장 */
  anxieties: string[];
  /** 이 사건에서 무엇을 봐야 하는가 */
  caseCheckpoints: { title: string; body: string }[];
  /** 계약·서명·송금·제출 전 */
  beforeAction: string[];
  /** 이미 진행한 뒤 */
  afterAction: string[];
  /** 문제 발생 시 확보할 증거 */
  evidenceWhenProblem: string[];
};

export function buildCaseOrientedSections(
  narrative: CaseNarrativeSpec,
  middleSections: ArticleSection[],
  closingNote?: string
): ArticleSection[] {
  const sections: ArticleSection[] = [
    {
      type: "p",
      text: "법률 백과사전을 찾으러 온 것이 아니라, 내 돈·계약·서류·사업이 괜찮을지 걱정되어 이 글을 읽고 계실 수 있습니다. 그 걱정은 흔한 편입니다.",
    },
    { type: "h2", text: "지금 이런 걱정, 하고 계신가요?" },
    { type: "bullets", items: narrative.anxieties },
    { type: "h2", text: "이 사건에서 무엇을 봐야 하나요?" },
    {
      type: "bullets",
      items: narrative.caseCheckpoints.map((c) => `${c.title} — ${c.body}`),
    },
    { type: "h2", text: "서명·제출·송금 전에 확인할 것" },
    { type: "bullets", items: narrative.beforeAction },
    { type: "h2", text: "이미 진행한 뒤에 확인할 것" },
    { type: "bullets", items: narrative.afterAction },
    { type: "h2", text: "문제가 생겼다면 지금 확보할 증거" },
    { type: "bullets", items: narrative.evidenceWhenProblem },
    ...middleSections,
    { type: "h2", text: "VFBCAI는 무엇이 다른가요?" },
    { type: "p", text: VFBCAI_DIFFERENTIATION },
    { type: "h2", text: "왜 내 자료를 입력해야 하나요?" },
    { type: "p", text: VFBCAI_WHY_UPLOAD },
    { type: "h2", text: "지금 내 상황부터 확인하기" },
    { type: "numbered", items: VFBCAI_ACTION_FLOW },
    {
      type: "p",
      text: closingNote ?? "아래 「내 상황을 직접 확인하기」에서 내 사건에 맞는 1차 확인을 시작할 수 있습니다. 법적 결과를 단정하지 않으며, 확인이 필요한 부분을 짚어 드립니다.",
    },
  ];
  return sections;
}

export function buildCaseOrientedQa(
  serviceLabel: string,
  narrative: CaseNarrativeSpec,
  extraQa: CaseQa[] = []
): CaseQa[] {
  return [
    {
      q: `${serviceLabel} — 지금 제가 뭘 먼저 확인해야 하나요?`,
      a:
        narrative.caseCheckpoints
          .slice(0, 2)
          .map((c) => c.title)
          .join(", ") +
        "부터 보는 경우가 많습니다. 내 단계(전/후)에 맞는 항목을 함께 확인하세요.",
    },
    {
      q: "이미 신청했거나 서류를 냈는데, 늦었나요?",
      a: "늦었다고 단정할 수는 없습니다. 다만 보완·반려 대응과 기한 확인이 우선일 수 있습니다. 제출본·통지·대화 기록을 먼저 모아 두세요.",
    },
    {
      q: "왜 VFBCAI에 내 서류를 올려야 하나요?",
      a: VFBCAI_WHY_UPLOAD,
    },
    ...extraQa,
  ];
}

/** CHECK — 거주증(TRC) 서류 */
export const TRC_DOCUMENTS_NARRATIVE: CaseNarrativeSpec = {
  anxieties: [
    "회사에서는 회사 서류만 있으면 된다는데, 내 여권·비자는 또 필요한가?",
    "임대계약서가 꼭 필요한 건지, 커뮤니티마다 말이 다르다.",
    "서류가 빠지면 반려될까? 뭘 먼저 모아야 하지?",
    "비자 종류에 따라 서류가 달라진다는데, 내 경우는 뭔가?",
  ],
  caseCheckpoints: [
    { title: "본인 신분·체류", body: "여권·비자가 유효하고 신청 조건과 맞는지 봅니다." },
    { title: "고용·회사 서류", body: "재직증명·회사 제출분이 내 고용 형태와 맞는지 확인합니다." },
    { title: "거주지 증빙", body: "주소지·임대 관련 자료가 추가 요청될 수 있는지 봅니다." },
    { title: "이전 신청 이력", body: "기존 TRC·보완·반려 이력이 있으면 함께 정리합니다." },
  ],
  beforeAction: [
    "여권·비자·재직증명·회사서류를 먼저 모읍니다.",
    "비자·고용 형태를 한 줄로 적고 추가 서류 가능성을 봅니다.",
    "회사 안내와 본인 명의 서류를 구분해 점검합니다.",
  ],
  afterAction: [
    "반려·보완 통지 사유와 기한을 정리합니다.",
    "누락·형식 오류를 보완한 뒤 재신청 방향을 잡습니다.",
    "관할 공안 요구와 제출본을 다시 대조합니다.",
  ],
  evidenceWhenProblem: [
    "반려·보완 통지, 제출 서류 사본",
    "회사 HR·대행사와의 대화·이메일",
    "여권·비자·주소지 관련 자료",
  ],
};

/** CHECK — 거주증(TRC) 진행 */
export const TRC_GUIDE_NARRATIVE: CaseNarrativeSpec = {
  anxieties: [
    "회사·커뮤니티·AI 말이 다 달라서 어디서부터 해야 할지 모르겠다.",
    "절차가 여러 개인 것 같아 더 헷갈린다.",
    "어디서 신청하는지, 회사가 해주는지 본인이 가는지도 불분명하다.",
    "서류는 모았는데 내 비자 유형에 맞는지 확신이 없다.",
  ],
  caseCheckpoints: [
    { title: "공통 서류 먼저", body: "자주 모으는 항목을 한곳에 정리합니다." },
    { title: "내 비자·고용 형태", body: "E비자·재직 형태 등을 한 줄로 적고 추가분을 봅니다." },
    { title: "신청 관할", body: "현재 거주 지역 관할 공안 기준을 확인합니다." },
    { title: "대행 vs 직접", body: "회사 HR 대행인지 본인 신청인지 구분합니다." },
  ],
  beforeAction: [
    "공통 서류 목록을 기준으로 먼저 모읍니다.",
    "비자·고용 형태를 한 줄로 정리합니다.",
    "관할 공안·신청 방식(대행/직접)을 확인합니다.",
  ],
  afterAction: [
    "심사·보완 요청에 맞춰 추가 서류를 준비합니다.",
    "면접·추가 확인이 있으면 일정과 준비물을 맞춥니다.",
  ],
  evidenceWhenProblem: [
    "제출·접수 증빙, 반려·보완 통지",
    "회사·공안과의 대화·안내 자료",
  ],
};

/** CHECK — 노동허가(WP) */
export const WP_NARRATIVE: CaseNarrativeSpec = {
  anxieties: [
    "회사 서류만 있으면 된다고 했는데, 내 학력·범죄경력 서류도 필요한가?",
    "WP 없이 일하면 문제가 생길까?",
    "정부 수수료만 보면 싼데, 실제 견적은 왜 훨씬 비싸지?",
    "반려 통지가 왔는데 뭘 보완해야 할지 모르겠다.",
  ],
  caseCheckpoints: [
    { title: "본인 신분·학력", body: "여권·학력증명·범죄경력·건강진단 등 개인 서류를 봅니다." },
    { title: "고용·직무", body: "재직·경력·직무 형태가 WP 요건과 맞는지 확인합니다." },
    { title: "회사 제출분", body: "회사 안내와 본인 준비 서류를 구분해 점검합니다." },
    { title: "비용 구성", body: "정부 수수료와 대행·번역 비용을 나눠 봅니다." },
  ],
  beforeAction: [
    "여권·학력·범죄경력·건강진단서를 먼저 준비합니다.",
    "회사 HR 안내와 본인 명의 서류를 함께 점검합니다.",
    "정부 수수료와 대행·번역 포함 여부를 견적에서 확인합니다.",
  ],
  afterAction: [
    "반려·보완 요청 사유를 정리하고 추가 서류를 준비합니다.",
    "기존 WP·보완 이력이 있으면 함께 제출합니다.",
  ],
  evidenceWhenProblem: [
    "반려·보완 통지, 제출 서류 사본",
    "회사 HR·대행사와의 대화·이메일",
    "송금·수수료 납부 영수증",
  ],
};

/** CHECK — 임시거주등록(땀주) */
export const TAMTRU_NARRATIVE: CaseNarrativeSpec = {
  anxieties: [
    "땀주 안 하면 체류에 문제가 생길까?",
    "호텔이랑 개인주택이랑 절차가 다른 것 같은데, 내 경우는?",
    "집주인 협조가 없으면 등록이 안 될까?",
    "정부 수수료가 무료라는데, 대행비는 왜 받지?",
  ],
  caseCheckpoints: [
    { title: "숙소 형태", body: "호텔·게스트하우스 vs 개인주택·아파트에 따라 준비가 달라집니다." },
    { title: "주소지 증빙", body: "임대계약·주소지 자료·집주인 협조를 봅니다." },
    { title: "본인 신분", body: "여권 등 기본 서류를 확인합니다." },
    { title: "비용 구성", body: "정부 수수료(무료인 경우)와 대행·이동 비용을 구분합니다." },
  ],
  beforeAction: [
    "숙소 형태(호텔 vs 개인주택)를 먼저 구분합니다.",
    "여권·임대계약·주소지 증빙을 준비합니다.",
    "집주인·관리사무소 협조 필요 여부를 확인합니다.",
  ],
  afterAction: [
    "보완·반려 통지에 맞춰 주소지·집주인 자료를 보완합니다.",
    "기존 등록·보완 이력이 있으면 함께 정리합니다.",
  ],
  evidenceWhenProblem: [
    "등록·반려·보완 통지, 제출 서류",
    "임대계약·집주인·관리사무소 대화 기록",
  ],
};

/** CHECK — 운전면허 전환 */
export const DRIVING_NARRATIVE: CaseNarrativeSpec = {
  anxieties: [
    "TRC 없이 면허 전환만 가능한가?",
    "본국 면허·번역공증을 안 해두면 반려될까?",
    "정부 수수료만 보면 되는 줄 알았는데 번역·공증비가 더 든다.",
    "이미 신청했는데 보완 요청이 왔다 — 뭘 더 내야 하지?",
  ],
  caseCheckpoints: [
    { title: "거주증(TRC)", body: "TRC 보유·유효 여부가 선행 조건인지 봅니다." },
    { title: "본국 면허", body: "원본·사진·유효기간을 확인합니다." },
    { title: "번역·공증", body: "번역공증본 등 요구 형식을 점검합니다." },
    { title: "비용 구성", body: "정부 수수료와 번역·공증 비용을 나눠 봅니다." },
  ],
  beforeAction: [
    "TRC·여권·본국 면허 원본을 먼저 준비합니다.",
    "번역공증본·면허 앞뒤 사진 등 요구 형식을 확인합니다.",
    "정부 수수료와 번역·공증 포함 여부를 견적에서 봅니다.",
  ],
  afterAction: [
    "보완·반려 통지에 맞춰 추가 사진·번역본을 준비합니다.",
    "기존 전환 신청·보완 이력이 있으면 함께 제출합니다.",
  ],
  evidenceWhenProblem: [
    "반려·보완 통지, 제출 서류 사본",
    "번역·공증 영수증, 대행사 대화 기록",
  ],
};
