// COSMETICS(화장품 허가) content spec. 근거: 화장품 관리 통달(06/2011/TT-BYT), 보건부 약품관리국 화장품 관리 공문(1149/QLD-MP, 2025).
// 기존 판정(src/app/register/cosmetics/page.tsx): 등록 확정 + 보관 시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
import * as V from "./register-voice-spec.mjs";
const { C } = K;
const p = "cs";
export const labels = {
  ...K.commonLabels,
  ...V.voiceLabels,
  pf_import: "수입 제품 신고 서류 확인", pf_local: "국내 생산 제품 신고 확인", pf_renew: "신고 번호 갱신 준비 확인", pf_change: "신고 내용 변경 확인", pf_which: "제품별 신고 절차 확인",
  pr_skincare: "기초 화장품", pr_makeup: "색조 화장품", pr_hair: "헤어 제품", pr_body: "바디·세정 제품", pr_mixed: "여러 종류 함께",
  wh_own: "자체 창고 보유", wh_3pl: "물류 위탁 창고", wh_planned: "창고 계약 예정", wh_none: "창고 없음", wh_unknown: "보관 시설 필요 여부를 모름",
  sc_controlled: "온도·습도 관리", sc_basic: "일반 보관", sc_shared: "다른 물건과 함께 보관", sc_unknown: "보관 기준을 모름",
  sd_ready: "성분표·안전성 자료 완비", sd_partial: "성분표만 있음", sd_requested: "제조사에 요청 중", sd_none: "자료 없음", sd_unknown: "필요한 자료를 모름",
  ma_loa: "제조사 위임장 보유", ma_pending: "위임장 요청 중", ma_none: "위임장 없음", ma_own_brand: "자사 브랜드 제품", ma_unknown: "위임장 필요 여부를 모름",
  cfs_legalized: "자유판매증명서 인증 완료", cfs_issued: "자유판매증명서 발급, 인증 전", cfs_requested: "자유판매증명서 요청 중", cfs_none: "자유판매증명서 없음", cfs_unknown: "증명서 필요 여부를 모름",
  cf_validity: "증명서 유효 기간 확인", cf_legalize_how: "영사 인증 방법과 기간 확인", cf_issue_time: "제조사 발급 기간과 내용 확인", cf_alternative: "대체 서류 확인", cf_need: "증명서 필요 대상 확인",
  ch_online: "온라인 판매", ch_shop: "매장 판매", ch_distributor: "유통사 공급", ch_spa: "피부관리실 공급", ch_unsure: "판매처 미정",
  ad_none: "광고 계획 없음", ad_sns: "소셜미디어 광고", ad_influencer: "인플루언서 홍보", ad_claims: "효능 강조 광고", ad_unknown: "광고 기준을 모름",
};
const cfg = {
  noun: "화장품 신고번호",
  openObj: "판매를",
  openTopic: "판매는",
  dateWord: "판매 시작 날짜",
  openNow: "이미 판매를 하고 있습니다.",
  fitout: "창고와 제품 준비가 끝나는 날에 맞춰",
  conflictWho: "제조사, 업체, 지인이",
  operatingD: "판매를 이미 시작했는데 신고 번호가 아직 확인되지 않았습니다.",
  docsR: [
    "서류가 갖춰졌으니 제품명과 성분이 서류마다 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 위임장과 자유판매증명서가 빠졌는지부터 확인하세요.",
    "수입 화장품 신고 기본 서류(신고서, 위임장, 자유판매증명서, 성분표)를 먼저 받으세요.",
    "수입 제품인지 국내 생산 제품인지에 따라 서류가 달라지니 그 기준부터 확인하세요.",
  ],
};
const tlR = [
    "한 달은 해외 서류 인증까지 빠듯하니 위임장과 증명서를 바로 요청하세요.",
    "제품이 들어오는 날을 기준으로 신고 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 제품별 서류를 하나씩 완성한 뒤 함께 신고하세요.",
    "판매 시작 시점을 정해야 수입과 신고 일정을 맞출 수 있습니다.",
    "신고 없이 판매 중이라면 회수 명령 등 제재를 받을 수 있으니 바로 신고하세요.",
];
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 화장품을 판매하시려는지, 그리고 신고에서 가장 막막한 부분은 어디인가요?", f: [`${p}_product`, `${p}_productFocus`], choices: [
    C("**기초 화장품을 수입해서** 팔려고 합니다.", "판매 신고가 필요한지, 서류를 뭘 내야 하는지 사람마다 말이 다릅니다.", ["pr_skincare","pf_import"], { card: "수입 기초 화장품의 신고 서류를 확인하려는 상황입니다" }),
    C("**립스틱이나 파운데이션 같은 색조 화장품을** 팔려고 합니다.", "베트남에서 직접 만든 색조 제품도 같은 신고를 하는지 모르겠습니다.", ["pr_makeup","pf_local"], { card: "국내 생산 색조 화장품의 신고를 확인하려는 상황입니다" }),
    C("**샴푸나 트리트먼트 같은 헤어 제품을** 팔고 있습니다.", "이미 받은 신고 번호를 갱신할 때 뭘 다시 내야 하는지 걱정입니다.", ["pr_hair","pf_renew"], { card: "헤어 제품의 신고 번호 갱신을 확인하려는 상황입니다" }),
    C("**바디로션이나 세정 제품을** 팔고 있습니다.", "성분이나 포장이 바뀌면 신고한 내용도 바꿔야 하는지 모르겠습니다.", ["pr_body","pf_change"], { card: "바디 제품의 신고 내용 변경을 확인하려는 상황입니다" }),
    C("**여러 종류의 화장품을 함께** 팔려고 합니다.", "제품마다 신고가 따로 필요한지, 어디서부터 시작해야 하는지 감이 안 잡힙니다.", ["pr_mixed","pf_which"], { card: "여러 제품에 필요한 신고 절차를 확인하려는 상황입니다" }),
  ] },
  V.registration(p, "Q2", cfg),
  { code: "Q3", stage: 1, prompt: "제품을 보관할 창고는 마련하셨고, 보관할 때 온도나 습도는 어떻게 관리하고 계신가요?", f: [`${p}_warehouse`, `${p}_storage`], choices: [
    C("**자체 창고가 있습니다.**", "온도와 습도를 매일 기록하며 관리하고 있는데 이 기록을 신고 때 내야 하는지 궁금합니다.", ["wh_own","sc_controlled"], { card: "자체 창고에서 온도·습도를 관리하는 상황입니다" }),
    C("**물류 회사 창고에 맡기고 있습니다.**", "일반 상온 창고에서 다른 화물과 나누어 보관하는데 화장품 기준에 맞는지 모르겠습니다.", ["wh_3pl","sc_basic"], { card: "물류 위탁 창고에 일반 보관하는 상황입니다" }),
    C("**창고를 곧 계약할 예정입니다.**", "다른 물건과 같은 공간에 같이 보관하게 될 것 같은데 괜찮은지 걱정입니다.", ["wh_planned","sc_shared"], { card: "창고 계약 전이고 함께 보관할 예정인 상황입니다" }),
    C("**창고 없이 사무실에 두고** 있습니다.", "화장품을 어떤 기준으로 보관해야 하는지 모르겠습니다.", ["wh_none","sc_unknown"], { card: "창고 없이 보관 기준을 확인해야 하는 상황입니다" }),
    C("**창고가 꼭 필요한지** 모르겠습니다.", "지금은 보관 환경을 따로 관리하지 않고 일반적으로 두고 있습니다.", ["wh_unknown","sc_basic"], { card: "보관 시설 필요 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "제품 성분표와 안전성 자료는 받으셨고, 제조사에서 판매를 맡긴다는 서류도 받으셨나요?", f: [`${p}_safetyData`, `${p}_authorization`], choices: [
    C("**성분표와 안전성 자료를 다 받았습니다.**", "제조사로부터 판매를 맡긴다는 위임장도 받아 두었습니다.", ["sd_ready","ma_loa"], { card: "성분·안전성 자료와 위임장을 모두 갖춘 상황입니다" }),
    C("**성분표만 가지고 있습니다.**", "제조사에 판매 위임장을 보내 달라고 요청해 둔 상태입니다.", ["sd_partial","ma_pending"], { card: "성분표만 있고 위임장을 기다리는 상황입니다" }),
    C("**제조사에 자료를 요청하고 있습니다.**", "위임장은 아직 받지 못했고 받을 수 있을지도 모릅니다.", ["sd_requested","ma_none"], { card: "자료와 위임장을 모두 기다리는 상황입니다" }),
    C("**자료를 아직 받지 못했습니다.**", "우리 회사 브랜드 제품이라 위임장은 필요 없을 것 같은데 맞는지 모르겠습니다.", ["sd_none","ma_own_brand"], { card: "자사 브랜드이지만 성분 자료가 없는 상황입니다" }),
    C("**어떤 자료가 필요한지** 모르겠습니다.", "제조사 위임장이 필요한지도 아직 확인하지 못했습니다.", ["sd_unknown","ma_unknown"], { card: "필요한 자료와 위임장 여부를 확인할 상황입니다" }),
  ] },
  V.feeling(p, "Q5", cfg),
  V.docs(p, "Q6", cfg),
  { code: "Q7", stage: 2, prompt: "수입 제품이면 제조국에서 받는 자유판매증명서가 필요하다는데, 지금 어떻게 되어 있나요?", f: [`${p}_cfs`, `${p}_cfsFocus`], choices: [
    C("**증명서를 받아 영사 인증까지 마쳤습니다.**", "인증받은 증명서의 유효 기간이 신고할 때까지 남아 있을지 걱정입니다.", ["cfs_legalized","cf_validity"], { r: "증명서의 발급일과 유효 기간을 확인하고, 신고 접수 전에 만료되지 않도록 일정을 잡으세요." }),
    C("**증명서는 받았지만 인증은 아직입니다.**", "영사 인증을 어디서 어떻게 받는지, 얼마나 걸리는지 모르겠습니다.", ["cfs_issued","cf_legalize_how"], { r: "영사 인증에 시간이 걸리니 바로 신청하고, 인증 기간을 포함해 신고 일정을 잡으세요." }),
    C("**제조사에 증명서를 요청해 두었습니다.**", "발급까지 얼마나 걸리는지, 어떤 내용이 들어가야 하는지 모르겠습니다.", ["cfs_requested","cf_issue_time"], { r: "증명서가 나오는 대로 인증을 받을 수 있도록 일정을 잡고, 필요한 기재 내용을 제조사에 미리 알려 주세요." }),
    C("**증명서가 없습니다.**", "제조사가 발급해 주지 않을 때 대신 쓸 수 있는 서류가 있는지 궁금합니다.", ["cfs_none","cf_alternative"], { r: "수입 제품은 생산국의 판매 증명이 필요한 경우가 많으니 제조사에 먼저 요청하고 대체 서류도 확인하세요." }),
    C("**증명서가 필요한지** 모르겠습니다.", "수입 제품과 국내 생산 제품 중 어느 쪽에 필요한지도 헷갈립니다.", ["cfs_unknown","cf_need"], { r: "수입 여부에 따라 증명서 필요 여부가 정해지니 그 기준부터 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "제품은 어디에서 판매하실 예정이고, 광고나 홍보는 어떻게 하실 계획인가요?", f: [`${p}_channel`, `${p}_ads`], choices: [
    C("**온라인으로** 판매하려고 합니다.", "소셜미디어 광고를 꾸준히 할 계획인데 광고 문구에 기준이 있는지 궁금합니다.", ["ch_online","ad_sns"], { r: "온라인 판매와 광고도 신고된 제품 정보와 같아야 하니 광고 문구를 신고 내용과 맞추세요." }),
    C("**직접 운영하는 매장에서** 팔려고 합니다.", "광고 없이 매장에서만 알릴 생각인데 진열 전에 확인할 표시가 있는지 궁금합니다.", ["ch_shop","ad_none"], { r: "매장 판매는 신고 번호와 표시가 제품에 붙어 있는지 진열 전에 확인하세요." }),
    C("**유통사에 공급**하려고 합니다.", "유통사가 인플루언서 영상 홍보를 요구할 수 있다는데 홍보 문구 기준을 모르겠습니다.", ["ch_distributor","ad_influencer"], { r: "유통사는 신고 확인서를 요구하는 경우가 많고, 홍보 문구도 과장되지 않게 관리하세요." }),
    C("**피부관리실에 공급**하려고 합니다.", "피부 개선 효과를 설명하며 공급하고 싶은데 어디까지 말해도 되는지 모르겠습니다.", ["ch_spa","ad_claims"], { r: "치료 효과처럼 보이는 표현은 화장품 광고에서 문제가 될 수 있으니 문구를 먼저 점검하세요." }),
    C("**판매처를 아직** 정하지 못했습니다.", "판매처가 정해지지 않아 광고에 어떤 기준이 있는지도 아직 모릅니다.", ["ch_unsure","ad_unknown"], { r: "판매처와 광고 방식이 정해지면 필요한 확인이 정해지니 계획부터 세우세요." }),
  ] },
  V.timeline(p, "Q9", cfg, tlR),
  V.asked(p, "Q10"),
  V.submit(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "신고할 제품은 몇 개쯤 되고, 앞으로 제품을 더 늘릴 계획도 있으신가요?", f: [`${p}_count`, `${p}_expand`], choices: [
    C("**제품 한두 개만** 신고하려고 합니다.", "당분간은 판매 제품을 더 늘릴 계획이 없습니다.", ["cnt_few","ex_none"], { r: "제품이 적으면 제품별 서류를 한 번에 완성해 함께 신고하는 것이 빠릅니다." }),
    C("**제품 열 개 정도**를 신고하려고 합니다.", "반응을 보고 다음 분기에 제품을 더 늘릴 예정입니다.", ["cnt_ten","ex_next"], { r: "제품이 많으면 제품별 신고가 각각 필요할 수 있으니 우선 판매할 제품부터 정하세요." }),
    C("**제품이 수십 개입니다.**", "한 브랜드의 제품 전체를 한꺼번에 수입해서 들여오려고 합니다.", ["cnt_many","ex_brand"], { r: "제품이 많을수록 서류 관리가 중요하니 제품별 서류 목록표를 먼저 만드세요." }),
    C("**세트 제품으로** 신고하려고 합니다.", "세트 구성이 계절마다 자주 바뀔 수 있어서 그때마다 다시 신고해야 하는지 걱정입니다.", ["cnt_set","ex_changes"], { r: "세트 구성이 바뀌면 신고 내용도 바꿔야 할 수 있으니 구성을 먼저 고정하세요." }),
    C("**몇 개를 신고할지** 아직 모르겠습니다.", "앞으로 제품을 더 늘릴지도 아직 정하지 않았습니다.", ["cnt_unsure","ex_unsure"], { r: "판매할 제품 목록이 정해져야 신고 범위와 비용을 정할 수 있습니다." }),
  ] },
  V.area(p, "Q13", "수입 화장품은 보건부 약품관리국, 국내 생산 제품은 지역 보건 담당 기관이 받는 경우가 많으니 확인하세요."),
];
export const cardTitles = { Q1: "제품 종류와 확인할 점", Q2: "사업자 등록", Q3: "창고와 보관", Q4: "성분 자료와 위임장" };
export const summaries = V.summaries(p, [
  "수입 화장품은 판매 전 제품 신고가 필요하고, 신고서, 제조사 위임장, 자유판매증명서, 성분표가 기본입니다. 신고 번호는 정해진 기간 동안 유효합니다.",
  "서류가 갖춰지면 신고 처리는 빠른 편이지만, 위임장과 자유판매증명서의 영사 인증에 시간이 가장 많이 듭니다. 인증부터 시작하면 일정을 줄일 수 있습니다.",
  "화장품 신고 대상은 제품 용도와 성분에 따라 정해지며, 의약품처럼 보이는 제품은 다른 절차가 필요할 수 있습니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "화장품 신고 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다.",
  "화장품 신고 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신고 전에 제품명과 성분이 서류마다 같은지 확인하세요", rules: [
  ...V.riskRules(p),
  { id: "warehouse", clauses: [[`${p}_warehouse`, ["wh_planned", "wh_none"]]], sentence: "보관 시설이 확보되지 않으면 판매 준비가 늦어질 수 있어 창고부터 정해야 합니다" },
  { id: "auth", clauses: [[`${p}_authorization`, ["ma_none", "ma_unknown"]]], sentence: "제조사 위임장이 없으면 수입 화장품을 신고할 수 없어 위임장부터 받아야 합니다" },
  { id: "cfs", clauses: [[`${p}_cfs`, ["cfs_none", "cfs_unknown"]]], sentence: "수입 제품은 생산국의 판매 증명이 필요한 경우가 많아 제조사에 먼저 요청해야 합니다" },
  { id: "claims", clauses: [[`${p}_ads`, ["ad_claims"]]], sentence: "치료 효과처럼 보이는 광고는 문제가 될 수 있어 광고 문구를 먼저 점검해야 합니다" },
] };
export const phase2Titles = { Q6: "신고 서류", Q7: "자유판매증명서 확인", Q8: "판매처와 광고", Q9: "신고 일정과 판매 시작", Q10: "지금까지 받은 안내", Q11: "제출 방식", Q12: "제품 수와 확장 계획", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  V.connectionPro(p, "이미 판매 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요."),
];
export const afterResultGuide = ["판매할 제품 목록 확정", "위임장과 증명서 인증", "성분표와 표시 확인", "보관 창고 확보", "신고 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "화장품 관리 보건부 통달 (제06/2011/TT-BYT호): 판매 전 화장품 신고와 서류", publisher: "베트남 보건부", kind: "보도 기준", urls: ["https://apolatlegal.com/wp-content/uploads/2025/11/Thong-tu-06-2011-TT-BYT-1.pdf", "https://thuvienphapluat.vn/hoi-dap-phap-luat/phieu-cong-bo-san-pham-my-pham-la-gi-thoi-han-dung-cua-phieu-cong-bo-san-pham-my-pham-trong-bao-lau-138001519.html"], note: "신고 번호 유효 기간(5년)은 제10조로 확인함(이차 자료 기준). 그 외 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "화장품 관리 강화 약품관리국 공문 (제1149/QLD-MP호, 2025)", publisher: "베트남 보건부 약품관리국", kind: "보도 기준", urls: ["https://thuvienphapluat.vn/cong-van/The-thao-Y-te/Cong-van-1149-QLD-MP-2025-tang-cuong-cong-tac-quan-ly-my-pham-653934.aspx"], note: "점검 강화 내용은 원문 확인" },
] } };
export const tierRules = V.tier(p);
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { wh_own: "secured", wh_3pl: "secured", wh_planned: "unsecured", wh_none: "unsecured", wh_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_warehouse` };
export const pageRule = { file: "src/app/register/cosmetics/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
