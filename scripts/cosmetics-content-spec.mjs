// COSMETICS(화장품 허가) content spec. 근거: 화장품 관리 통달(06/2011/TT-BYT), 보건부 약품관리국 화장품 관리 공문(1149/QLD-MP, 2025).
// 기존 판정(src/app/register/cosmetics/page.tsx): 등록 확정 + 보관 시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
const { C } = K;
const p = "cs";
export const labels = {
  ...K.commonLabels,
  st_import: "수입 화장품 판매 신고", st_local_make: "베트남 생산 화장품 신고", st_renew: "신고 번호 갱신", st_change: "신고 내용 변경", st_unsure: "어떤 절차인지 모름",
  pr_skincare: "기초 화장품", pr_makeup: "색조 화장품", pr_hair: "헤어 제품", pr_body: "바디·세정 제품", pr_mixed: "여러 종류 함께",
  wh_own: "자체 창고 보유", wh_3pl: "물류 위탁 창고", wh_planned: "창고 계약 예정", wh_none: "창고 없음", wh_unknown: "보관 시설 필요 여부를 모름",
  sc_controlled: "온도·습도 관리", sc_basic: "일반 보관", sc_shared: "다른 물건과 함께 보관", sc_unknown: "보관 기준을 모름",
  sd_ready: "성분표·안전성 자료 완비", sd_partial: "성분표만 있음", sd_requested: "제조사에 요청 중", sd_none: "자료 없음", sd_unknown: "필요한 자료를 모름",
  ma_loa: "제조사 위임장 보유", ma_pending: "위임장 요청 중", ma_none: "위임장 없음", ma_own_brand: "자사 브랜드 제품", ma_unknown: "위임장 필요 여부를 모름",
  cfs_legalized: "자유판매증명서 인증 완료", cfs_issued: "자유판매증명서 발급, 인증 전", cfs_requested: "자유판매증명서 요청 중", cfs_none: "자유판매증명서 없음", cfs_unknown: "증명서 필요 여부를 모름",
  lb_ready: "베트남어 보조 표시 준비", lb_draft: "표시 초안만 있음", lb_none: "표시 준비 전", lb_unknown: "표시 기준을 모름",
  ch_online: "온라인 판매", ch_shop: "매장 판매", ch_distributor: "유통사 공급", ch_spa: "피부관리실 공급", ch_unsure: "판매처 미정",
  ad_none: "광고 계획 없음", ad_sns: "소셜미디어 광고", ad_influencer: "인플루언서 홍보", ad_claims: "효능 강조 광고", ad_unknown: "광고 기준을 모름",
};
export const questions = [
  { code: "Q1", stage: 1, prompt: "화장품과 관련해 어떤 절차가 필요하고, 판매하려는 제품은 어떤 종류인가요?", f: [`${p}_stage`, `${p}_product`], choices: [
    C("**수입한 화장품을 판매**하려고 합니다.", "피부에 바르는 기초 화장품을 주로 들여오려고 합니다.", ["st_import", "pr_skincare"], { card: "수입 기초 화장품의 판매 신고가 필요한 상황입니다" }),
    C("**베트남에서 만든 화장품**을 팔려고 합니다.", "립스틱이나 파운데이션 같은 색조 화장품입니다.", ["st_local_make", "pr_makeup"], { card: "베트남 생산 색조 화장품을 신고하려는 상황입니다" }),
    C("**신고 번호를 갱신**해야 합니다.", "샴푸나 트리트먼트 같은 헤어 제품을 판매하고 있습니다.", ["st_renew", "pr_hair"], { card: "헤어 제품의 신고 번호를 갱신하려는 상황입니다" }),
    C("**신고한 내용을 바꿔야** 합니다.", "바디로션이나 세정 제품의 성분이나 포장이 바뀌었습니다.", ["st_change", "pr_body"], { card: "바디 제품의 신고 내용을 바꾸려는 상황입니다" }),
    C("**어떤 절차가 필요한지** 모르겠습니다.", "여러 종류의 화장품을 한꺼번에 들여오려고 합니다.", ["st_unsure", "pr_mixed"], { card: "여러 제품에 필요한 절차부터 확인할 상황입니다" }),
  ] },
  K.registrationQuestion(p, "Q2", "사업자 등록은 어디까지 진행되었고, 누구 이름으로 화장품을 신고하실 예정인가요?"),
  { code: "Q3", stage: 1, prompt: "제품을 보관할 창고는 마련했고, 보관 환경은 어떻게 관리하고 계신가요?", f: [`${p}_warehouse`, `${p}_storage`], choices: [
    C("**자체 창고를** 가지고 있습니다.", "온도와 습도를 매일 기록하며 관리하는 보관 공간입니다.", ["wh_own", "sc_controlled"], { card: "자체 창고에서 온도·습도를 관리하는 상황입니다" }),
    C("**물류 회사 창고에** 맡기고 있습니다.", "일반 상온 창고에서 다른 화물과 나누어 보관합니다.", ["wh_3pl", "sc_basic"], { card: "물류 위탁 창고에 일반 보관하는 상황입니다" }),
    C("**창고를 곧 계약할** 예정입니다.", "다른 물건과 같은 공간에 함께 보관하게 될 것 같습니다.", ["wh_planned", "sc_shared"], { card: "창고 계약 전이고 함께 보관할 예정인 상황입니다" }),
    C("**창고 없이 사무실에** 두고 있습니다.", "화장품을 어떤 기준으로 보관해야 하는지 모르겠습니다.", ["wh_none", "sc_unknown"], { card: "창고 없이 보관 기준을 확인해야 하는 상황입니다" }),
    C("**창고가 꼭 필요한지** 모르겠습니다.", "보관 환경을 따로 관리하지 않고 일반적으로 두고 있습니다.", ["wh_unknown", "sc_basic"], { card: "보관 시설 필요 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "제품의 성분표와 안전성 자료는 준비했고, 제조사의 위임장은 받으셨나요?", f: [`${p}_safetyData`, `${p}_authorization`], choices: [
    C("**성분표와 안전성 자료를 모두** 받았습니다.", "제조사로부터 판매를 맡긴다는 위임장도 받아 두었습니다.", ["sd_ready", "ma_loa"], { card: "성분·안전성 자료와 위임장을 모두 갖춘 상황입니다" }),
    C("**성분표만** 가지고 있습니다.", "제조사에 판매 위임장을 보내 달라고 요청해 둔 상태입니다.", ["sd_partial", "ma_pending"], { card: "성분표만 있고 위임장을 기다리는 상황입니다" }),
    C("**제조사에 자료를** 요청하고 있습니다.", "위임장은 아직 받지 못했고 받을 수 있을지도 모릅니다.", ["sd_requested", "ma_none"], { card: "자료와 위임장을 모두 기다리는 상황입니다" }),
    C("**자료를 아직** 받지 못했습니다.", "우리 회사 브랜드 제품이라 위임장은 필요 없을 것 같습니다.", ["sd_none", "ma_own_brand"], { card: "자사 브랜드이지만 성분 자료가 없는 상황입니다" }),
    C("**어떤 자료가 필요한지** 모르겠습니다.", "제조사 위임장이 필요한지도 아직 확인하지 못했습니다.", ["sd_unknown", "ma_unknown"], { card: "필요한 자료와 위임장 여부를 확인할 상황입니다" }),
  ] },
  K.concernQuestion(p, "Q5", "**우리 제품이 신고 대상인지** 모르겠습니다."),
  K.docsQuestion(p, "Q6", "**신고서, 위임장, 자유판매증명서, 성분표를 모두** 준비했습니다.", [
    "서류가 갖춰졌으니 제품명과 성분이 서류마다 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 위임장과 자유판매증명서가 빠졌는지부터 확인하세요.",
    "수입 화장품 신고 기본 서류(신고서, 위임장, 자유판매증명서, 성분표)를 먼저 받으세요.",
    "수입 제품인지 국내 생산 제품인지에 따라 서류가 달라지니 그 기준부터 확인하세요.",
  ]),
  { code: "Q7", stage: 2, prompt: "수입 제품의 자유판매증명서는 받았고, 베트남어 보조 표시는 준비되었나요?", f: [`${p}_cfs`, `${p}_label`], choices: [
    C("**자유판매증명서를 받아** 영사 인증까지 마쳤습니다.", "베트남어 보조 표시도 모두 준비해 두었습니다.", ["cfs_legalized", "lb_ready"], { r: "증명서의 유효 기간과 표시 문안이 신고 내용과 같은지만 확인하세요." }),
    C("**자유판매증명서는 받았지만** 인증은 아직입니다.", "표시는 초안만 만들어 두고 확정하지 않았습니다.", ["cfs_issued", "lb_draft"], { r: "영사 인증에 시간이 걸리니 바로 신청하고, 표시 문안도 그 사이 확정하세요." }),
    C("**자유판매증명서를 요청**해 두었습니다.", "베트남어 보조 표시는 아직 준비하지 못했습니다.", ["cfs_requested", "lb_none"], { r: "증명서가 나오는 대로 인증을 받을 수 있도록 일정을 잡고 표시 준비도 시작하세요." }),
    C("**자유판매증명서가** 없습니다.", "베트남어 제품 표시에 어떤 내용을 넣어야 하는지 모르겠습니다.", ["cfs_none", "lb_unknown"], { r: "수입 제품은 생산국의 판매 증명이 필요한 경우가 많으니 제조사에 먼저 요청하세요." }),
    C("**증명서가 필요한지** 모르겠습니다.", "베트남어 보조 표시는 이미 제품마다 붙여 두었습니다.", ["cfs_unknown", "lb_ready"], { r: "수입 여부에 따라 증명서 필요 여부가 정해지니 그 기준부터 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "제품은 어디에서 판매하실 예정이고, 광고는 어떻게 하실 계획인가요?", f: [`${p}_channel`, `${p}_ads`], choices: [
    C("**온라인으로** 판매하려고 합니다.", "페이스북이나 틱톡 같은 소셜미디어 광고를 꾸준히 할 계획입니다.", ["ch_online", "ad_sns"], { r: "온라인 판매와 광고도 신고된 제품 정보와 같아야 하니 광고 문구를 신고 내용과 맞추세요." }),
    C("**직접 운영하는 매장에서** 판매합니다.", "따로 광고는 하지 않고 매장에서만 알릴 생각입니다.", ["ch_shop", "ad_none"], { r: "매장 판매는 신고 번호와 표시가 제품에 붙어 있는지 진열 전에 확인하세요." }),
    C("**유통사에 공급**하려고 합니다.", "인플루언서와 함께 영상으로 제품을 홍보하려고 합니다.", ["ch_distributor", "ad_influencer"], { r: "유통사는 신고 확인서를 요구하는 경우가 많고, 홍보 문구도 과장되지 않게 관리하세요." }),
    C("**피부관리실에 공급**하려고 합니다.", "피부 개선 효과를 강조하는 광고를 하고 싶습니다.", ["ch_spa", "ad_claims"], { r: "치료 효과처럼 보이는 표현은 화장품 광고에서 문제가 될 수 있으니 문구를 먼저 점검하세요." }),
    C("**판매처를 아직** 정하지 못했습니다.", "화장품 광고에 어떤 기준이 있는지 모르겠습니다.", ["ch_unsure", "ad_unknown"], { r: "판매처와 광고 방식이 정해지면 필요한 확인이 정해지니 계획부터 세우세요." }),
  ] },
  K.timelineQuestion(p, "Q9", [
    "한 달은 해외 서류 인증까지 빠듯하니 위임장과 증명서를 바로 요청하세요.",
    "제품이 들어오는 날을 기준으로 신고 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 제품별 서류를 하나씩 완성한 뒤 함께 신고하세요.",
    "판매 시작 시점을 정해야 수입과 신고 일정을 맞출 수 있습니다.",
    "신고 없이 판매 중이라면 회수 명령 등 제재를 받을 수 있으니 바로 신고하세요.",
  ]),
  K.quoteQuestion(p, "Q10", "항목이 나뉘어 있으니 제품 수, 서류 인증, 표시 검토가 각각 포함되는지 확인하세요."),
  K.submitQuestion(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "신고할 제품은 몇 개이고, 앞으로 제품을 더 늘릴 계획이 있으신가요?", f: [`${p}_count`, `${p}_expand`], choices: [
    C("**제품 한두 개만** 신고하려고 합니다.", "당분간은 판매 제품을 더 늘릴 계획이 없습니다.", ["cnt_few", "ex_none"], { r: "제품이 적으면 제품별 서류를 한 번에 완성해 함께 신고하는 것이 빠릅니다." }),
    C("**제품 열 개 정도를** 신고하려고 합니다.", "반응을 보고 다음 분기에 제품을 더 늘릴 예정입니다.", ["cnt_ten", "ex_next"], { r: "제품이 많으면 제품별 신고가 각각 필요할 수 있으니 우선 판매할 제품부터 정하세요." }),
    C("**제품이 수십 개**입니다.", "한 브랜드의 제품 전체를 한꺼번에 수입해서 들여오려고 합니다.", ["cnt_many", "ex_brand"], { r: "제품이 많을수록 서류 관리가 중요하니 제품별 서류 목록표를 먼저 만드세요." }),
    C("**세트 제품으로** 신고하려고 합니다.", "세트 구성이 계절마다 자주 바뀔 수 있어서 걱정입니다.", ["cnt_set", "ex_changes"], { r: "세트 구성이 바뀌면 신고 내용도 바꿔야 할 수 있으니 구성을 먼저 고정하세요." }),
    C("**몇 개를 신고할지** 아직 모르겠습니다.", "앞으로 제품을 더 늘릴지도 아직 정하지 않았습니다.", ["cnt_unsure", "ex_unsure"], { r: "판매할 제품 목록이 정해져야 신고 범위와 비용을 정할 수 있습니다." }),
  ] },
  K.areaQuestion(p, "Q13", "수입 화장품은 보건부 약품관리국, 국내 생산 제품은 지역 보건 담당 기관이 받는 경우가 많으니 확인하세요."),
];
Object.assign(labels, { cnt_few: "제품 한두 개", cnt_ten: "제품 열 개 정도", cnt_many: "제품 수십 개", cnt_set: "세트 제품", cnt_unsure: "신고 제품 수 미정", ex_none: "추가 계획 없음", ex_next: "다음 분기 추가 예정", ex_brand: "브랜드 전체 수입", ex_changes: "구성 자주 변경", ex_unsure: "추가 계획 미정" });
export const cardTitles = { Q1: "절차와 제품 종류", Q2: "사업자 등록", Q3: "창고와 보관", Q4: "성분 자료와 위임장" };
export const summaries = K.summariesFor(p, [
  "화장품 신고 비용은 정부 비용 외에 해외 서류 인증·번역, 제품 수에 따른 신고 준비, 대행료로 나뉩니다. 판매할 제품 목록을 먼저 정해야 비용을 계산할 수 있습니다.",
  "수입 화장품은 판매 전 제품 신고가 필요하고, 신고서, 제조사 위임장, 자유판매증명서, 성분표가 기본입니다. 신고 번호는 정해진 기간 동안 유효합니다.",
  "서류가 갖춰지면 신고 처리는 빠른 편이지만, 위임장과 자유판매증명서의 영사 인증에 시간이 가장 많이 듭니다. 인증부터 시작하면 일정을 줄일 수 있습니다.",
  "화장품 신고 대상은 제품 용도와 성분에 따라 정해지며, 의약품처럼 보이는 제품은 다른 절차가 필요할 수 있습니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "견적은 제품 수, 서류 인증, 표시 검토, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신고 전에 제품명과 성분이 서류마다 같은지 확인하세요", rules: [
  ...K.commonRiskRules(p),
  { id: "warehouse", clauses: [[`${p}_warehouse`, ["wh_planned", "wh_none"]]], sentence: "보관 시설이 확보되지 않으면 판매 준비가 늦어질 수 있어 창고부터 정해야 합니다" },
  { id: "auth", clauses: [[`${p}_authorization`, ["ma_none", "ma_unknown"]]], sentence: "제조사 위임장이 없으면 수입 화장품을 신고할 수 없어 위임장부터 받아야 합니다" },
  { id: "cfs", clauses: [[`${p}_cfs`, ["cfs_none", "cfs_unknown"]]], sentence: "수입 제품은 생산국의 판매 증명이 필요한 경우가 많아 제조사에 먼저 요청해야 합니다" },
  { id: "claims", clauses: [[`${p}_ads`, ["ad_claims"]]], sentence: "치료 효과처럼 보이는 광고는 문제가 될 수 있어 광고 문구를 먼저 점검해야 합니다" },
] };
export const phase2Titles = { Q6: "신고 서류", Q7: "자유판매증명서와 표시", Q8: "판매처와 광고", Q9: "신고 일정과 판매 시작", Q10: "견적과 비용", Q11: "국적과 제출 방식", Q12: "제품 수와 확장 계획", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "전문가 진행", clauses: [[`${p}_timeline`, ["tl_already", "tl_urgent"]], [`${p}_helpWanted`, ["help_full"]]], sentence: "이미 판매 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["판매할 제품 목록 확정", "위임장과 증명서 인증", "성분표와 표시 확인", "보관 창고 확보", "신고 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "화장품 관리 보건부 통달 (제06/2011/TT-BYT호): 판매 전 화장품 신고와 서류", publisher: "베트남 보건부", kind: "보도 기준", urls: ["https://apolatlegal.com/wp-content/uploads/2025/11/Thong-tu-06-2011-TT-BYT-1.pdf", "https://thuvienphapluat.vn/hoi-dap-phap-luat/phieu-cong-bo-san-pham-my-pham-la-gi-thoi-han-dung-cua-phieu-cong-bo-san-pham-my-pham-trong-bao-lau-138001519.html"], note: "신고 번호 유효 기간(5년)은 제10조로 확인함(이차 자료 기준). 그 외 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "화장품 관리 강화 약품관리국 공문 (제1149/QLD-MP호, 2025)", publisher: "베트남 보건부 약품관리국", kind: "보도 기준", urls: ["https://thuvienphapluat.vn/cong-van/The-thao-Y-te/Cong-van-1149-QLD-MP-2025-tang-cuong-cong-tac-quan-ly-my-pham-653934.aspx"], note: "점검 강화 내용은 원문 확인" },
] } };
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: K.commonTier(p).full },
  { tier: "accompany", label: "작성과 제출 동행", clauses: K.commonTier(p).accompany },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { wh_own: "secured", wh_3pl: "secured", wh_planned: "unsecured", wh_none: "unsecured", wh_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_warehouse` };
export const pageRule = { file: "src/app/register/cosmetics/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
