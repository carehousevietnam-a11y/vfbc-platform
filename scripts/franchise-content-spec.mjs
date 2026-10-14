// FRANCHISE(프랜차이즈 등록) content spec. 근거: 상법(36/2005/QH11), 시행령 35/2006/NĐ-CP(08/2018 개정).
// 기존 판정(src/app/register/franchise/page.tsx): 등록 확정 + 직영점 운영 이력 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
import * as V from "./register-voice-spec.mjs";
const { C } = K;
const p = "fr";
export const labels = {
  ...K.commonLabels,
  ...V.voiceLabels,
  st_inbound: "해외 브랜드를 베트남에 가맹", st_master: "베트남 마스터 가맹 계약", st_local_brand: "베트남 브랜드 가맹 확장", st_change: "등록 내용 변경", st_unsure: "어떤 절차인지 모름",
  bz_food: "음식·음료", bz_retail: "소매·편의점", bz_education: "교육·학원", bz_beauty: "미용·뷰티", bz_service: "그 밖의 서비스",
  oh_over1y: "운영 1년 이상", oh_home_over1y: "본국에서 1년 이상 운영", oh_under1y: "운영 1년 미만", oh_new: "아직 운영 전", oh_unknown: "운영 기간을 모름",
  ou_many: "여러 매장 운영", ou_one: "매장 한 곳 운영", ou_popup: "임시 매장만 운영", ou_none: "운영 매장 없음", ou_unknown: "매장 수를 모름",
  cm_ready: "가맹계약서·운영 매뉴얼 준비", cm_contract_only: "계약서만 있음", cm_draft: "초안만 있음", cm_none: "계약서·매뉴얼 없음", cm_unknown: "필요한 서류를 모름",
  tm_registered_vn: "베트남 상표 등록", tm_applied_vn: "베트남 상표 출원 중", tm_home_only: "본국 상표만 등록", tm_none: "상표 등록 안 함", tm_unknown: "상표 등록 상태를 모름",
  ds_ready: "가맹 소개서 준비", ds_draft: "소개서 초안", ds_none: "소개서 없음", ds_unknown: "소개서 필요 여부를 모름",
  fee_set: "가맹비·로열티 확정", fee_draft: "가맹비 초안", fee_unknown: "가맹비 구조를 모름",
  rg_known: "등록 기관을 알고 있음", rg_unknown: "등록 기관을 모름",
};
const cfg = {
  noun: "가맹 사업 등록",
  openObj: "가맹점 모집을",
  openTopic: "가맹점 모집은",
  dateWord: "모집 시작 날짜",
  openNow: "이미 가맹점을 모집하고 있습니다.",
  fitout: "가맹 계약 준비가 끝나는 날에 맞춰",
  conflictWho: "본사, 업체, 지인이",
  operatingD: "가맹점 모집을 이미 시작했는데 등록이 아직 확인되지 않았습니다.",
  docsR: [
    "서류가 갖춰졌으니 브랜드명과 회사명이 서류마다 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 가맹 소개서와 상표 서류가 빠졌는지부터 확인하세요.",
    "해외 브랜드를 들여오는 등록 기본 서류(신청서, 가맹 소개서, 본사 서류, 상표 서류)를 먼저 받으세요.",
    "해외 브랜드인지 베트남 브랜드인지에 따라 등록 여부가 달라지니 그 기준부터 확인하세요.",
  ],
};
const tlR = [
    "한 달은 해외 서류 인증까지 빠듯하니 본사 서류를 바로 요청하세요.",
    "첫 가맹점 개점일을 기준으로 등록 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 상표 등록과 가맹 소개서를 먼저 완성하세요.",
    "가맹 사업 시작 시점을 정해야 등록과 모집 일정을 맞출 수 있습니다.",
    "등록 없이 가맹 사업을 하고 있다면 제재를 받을 수 있으니 바로 등록하세요.",
];
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 브랜드로 어떻게 가맹 사업을 하시려고 하고, 지금 가장 막막한 점은 무엇인가요?", f: [`${p}_stage`, `${p}_business`], choices: [
    C("**해외 외식 브랜드를 베트남에 가맹으로** 들여오려고 합니다.", "음식이나 음료를 파는 브랜드라 어떤 등록부터 해야 하는지 모르겠습니다.", ["st_inbound","bz_food"], { card: "해외 외식 브랜드를 가맹으로 들여오려는 상황입니다" }),
    C("**편의점이나 소매점 브랜드의 베트남 전체 가맹권을** 받는 계약을 하려고 합니다.", "어떤 절차가 필요한지 감이 안 잡힙니다.", ["st_master","bz_retail"], { card: "소매 브랜드의 베트남 전체 가맹권을 받으려는 상황입니다" }),
    C("**베트남에서 키운 교육 브랜드를** 가맹으로 늘리려고 합니다.", "학원이나 교육 서비스도 등록 대상인지 헷갈립니다.", ["st_local_brand","bz_education"], { card: "베트남 교육 브랜드를 가맹으로 늘리려는 상황입니다" }),
    C("**이미 등록한 뷰티 브랜드의 내용을** 바꿔야 합니다.", "미용실이나 피부 관리실 브랜드인데 등록 내용을 어떻게 바꾸는지 모르겠습니다.", ["st_change","bz_beauty"], { card: "뷰티 브랜드의 등록 내용을 바꾸려는 상황입니다" }),
    C("**세탁이나 청소 같은 생활 서비스 브랜드인데** 어떤 절차가 필요한지조차 모르겠습니다.", "등록 대상인지부터 모릅니다.", ["st_unsure","bz_service"], { card: "서비스 브랜드에 필요한 절차부터 확인할 상황입니다" }),
  ] },
  V.registration(p, "Q2", cfg),
  { code: "Q3", stage: 1, prompt: "가맹하려는 브랜드는 본사가 직접 얼마나 운영해 봤고, 직영 매장은 몇 곳인가요?", f: [`${p}_history`, `${p}_outlets`], choices: [
    C("**베트남에서 1년 넘게 직접** 운영했습니다.", "베트남에 직영 매장을 여러 곳 운영하고 있습니다.", ["oh_over1y","ou_many"], { card: "베트남에서 1년 넘게 여러 매장을 운영한 상황입니다" }),
    C("**본국에서 1년 넘게** 운영해 왔습니다.", "베트남에는 아직 직영 매장이 한 곳뿐입니다.", ["oh_home_over1y","ou_one"], { card: "본국에서 1년 넘게 운영했고 베트남 매장은 한 곳인 상황입니다" }),
    C("**운영한 지 1년이 안 됐습니다.**", "행사장이나 쇼핑몰의 임시 매장으로만 운영해 보았습니다.", ["oh_under1y","ou_popup"], { card: "운영 1년 미만이고 임시 매장만 운영한 상황입니다" }),
    C("**아직 운영을 시작하지 않았습니다.**", "본사가 직접 운영하는 매장은 아직 한 곳도 없는데 가맹을 시작해도 되는지 모르겠습니다.", ["oh_new","ou_none"], { card: "운영 전이라 직영 매장이 없는 상황입니다" }),
    C("**운영 기간을 정확히** 모르겠습니다.", "본사가 매장을 몇 곳 운영하는지도 확인하지 못했습니다.", ["oh_unknown","ou_unknown"], { card: "운영 기간과 매장 수를 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "가맹계약서와 운영 매뉴얼은 준비하셨고, 브랜드 상표는 베트남에 등록하셨나요?", f: [`${p}_contract`, `${p}_trademark`], choices: [
    C("**가맹계약서와 운영 매뉴얼을 다 준비했습니다.**", "계약서에 쓰는 브랜드 상표도 베트남에 이미 등록해 두었습니다.", ["cm_ready","tm_registered_vn"], { card: "계약서·매뉴얼과 베트남 상표 등록을 갖춘 상황입니다" }),
    C("**가맹계약서만 준비했습니다.**", "계약서에 쓸 브랜드 상표는 베트남에 출원해 심사를 기다리고 있습니다.", ["cm_contract_only","tm_applied_vn"], { card: "계약서만 있고 상표 심사를 기다리는 상황입니다" }),
    C("**계약서와 매뉴얼 초안만 있습니다.**", "계약서에 쓸 브랜드 상표는 본국에만 등록되어 있고 베트남에는 없습니다.", ["cm_draft","tm_home_only"], { card: "서류 초안만 있고 베트남 상표가 없는 상황입니다" }),
    C("**계약서와 매뉴얼을 아직 못 만들었습니다.**", "계약서에 쓸 브랜드 상표를 등록해 본 적이 없습니다.", ["cm_none","tm_none"], { card: "계약서·매뉴얼과 상표 등록이 모두 남은 상황입니다" }),
    C("**어떤 서류가 필요한지** 모르겠습니다.", "계약서에 쓸 브랜드 상표가 어디에 등록되어 있는지도 확인하지 못했습니다.", ["cm_unknown","tm_unknown"], { card: "필요한 서류와 상표 상태를 확인해야 하는 상황입니다" }),
  ] },
  V.feeling(p, "Q5", cfg),
  V.docs(p, "Q6", cfg),
  { code: "Q7", stage: 2, prompt: "가맹 희망자에게 줄 가맹 소개서는 준비하셨고, 가맹비와 로열티는 정하셨나요?", f: [`${p}_disclosure`, `${p}_fees`], choices: [
    C("**가맹 소개서를 준비했습니다.**", "가맹비와 매달 받을 로열티 구조도 이미 정해 두었습니다.", ["ds_ready","fee_set"], { r: "소개서의 가맹비 내용과 계약서의 금액이 같은지만 확인하세요." }),
    C("**가맹 소개서 초안만 있습니다.**", "가맹비와 로열티도 초안만 있고 아직 확정하지 않았습니다.", ["ds_draft","fee_draft"], { r: "가맹비가 확정되어야 소개서를 완성할 수 있으니 금액 구조부터 정하세요." }),
    C("**가맹 소개서가 아직 없습니다.**", "가맹비와 로열티를 어떻게 정해야 할지 모르겠습니다.", ["ds_none","fee_unknown"], { r: "해외 브랜드 등록에는 가맹 소개서가 필요하니 가맹비 구조와 함께 만들어야 합니다." }),
    C("**소개서가 필요한지** 모르겠습니다.", "가맹비와 로열티는 본사가 정한 금액을 그대로 쓰려고 합니다.", ["ds_unknown","fee_set"], { r: "본사 금액을 쓰더라도 베트남 상황에 맞는지 확인하고 소개서 필요 여부를 알아보세요." }),
    C("**본사 소개서를 베트남어로 번역하고** 있습니다.", "가맹비는 베트남 시장에 맞춰 다시 정하려고 합니다.", ["ds_translating","fee_draft"], { r: "번역할 때 가맹비와 지원 내용이 베트남 계약 조건과 맞는지 함께 고치세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "가맹 사업을 등록하는 기관은 알아보셨고, 가맹점 모집은 언제 시작하실 예정인가요?", f: [`${p}_registry`, `${p}_recruit`], choices: [
    C("**등록 기관을 알고 있습니다.**", "등록을 모두 마친 뒤에 가맹점 모집을 시작할 예정입니다.", ["rg_known","rc_after"], { r: "등록이 끝나야 해외 브랜드 가맹을 시작할 수 있으니 순서를 그대로 지키세요." }),
    C("**등록 기관을 모릅니다.**", "그런데 가맹점 모집을 이미 시작해서 희망자 상담을 받고 있습니다.", ["rg_unknown","rc_started"], { r: "등록 전에 모집을 시작하면 문제가 될 수 있으니 등록 기관부터 확인하고 서두르세요." }),
    C("**산업무역부에 등록한다고 들었습니다.**", "가맹점을 언제부터 모집할지는 아직 정하지 않았습니다.", ["rg_ministry","rc_unsure"], { r: "해외 브랜드는 산업무역부 등록 대상인 경우가 많으니 서류를 그 기준으로 준비하세요." }),
    C("**베트남 브랜드라 등록이 필요 없다고 들었습니다.**", "가맹점 모집을 다음 달부터 시작하려고 하는데 맞는지 모르겠습니다.", ["rg_domestic","rc_soon"], { r: "베트남 안에서만 하는 가맹은 등록이 필요 없을 수 있지만 계약 조건은 법을 따라야 합니다." }),
    C("**등록이 필요한지** 모르겠습니다.", "가맹점을 언제부터 모집해야 할지도 아직 모르겠습니다.", ["rg_unsure","rc_unknown"], { r: "브랜드가 어디서 시작했는지에 따라 등록 여부가 정해지니 그 기준부터 확인하세요." }),
  ] },
  V.timeline(p, "Q9", cfg, tlR),
  V.asked(p, "Q10"),
  V.submit(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "가맹점에 어떤 지원을 하실 계획이고, 가맹점 관리는 누가 맡을 예정인가요?", f: [`${p}_support`, `${p}_manager`], choices: [
    C("**교육과 매장 운영 지원을 모두** 하려고 합니다.", "본사 직원이 베트남에 상주하며 가맹점을 관리합니다.", ["sp_full","mg_hq_resident"], { r: "지원 내용을 계약서와 소개서에 똑같이 적어 두면 분쟁을 줄일 수 있습니다." }),
    C("**초기 교육만** 제공하려고 합니다.", "베트남 협력 회사에 가맹점 관리를 맡기려고 합니다.", ["sp_training","mg_partner"], { r: "협력 회사에 맡기면 관리 권한과 책임 범위를 계약으로 정해 두세요." }),
    C("**원재료 공급까지 함께** 하려고 합니다.", "본사에서 원격으로 가맹점을 관리할 예정입니다.", ["sp_supply","mg_remote"], { r: "원재료를 공급하면 수입·유통 허가가 따로 필요할 수 있으니 함께 확인하세요." }),
    C("**브랜드 사용권만** 주려고 합니다.", "가맹점 관리를 누가 맡을지 아직 정하지 못했습니다.", ["sp_brand_only","mg_unsure"], { r: "브랜드만 빌려주는 방식이 가맹에 해당하는지 먼저 확인하는 것이 좋습니다." }),
    C("**어떤 지원을 할지** 아직 정하지 않았습니다.", "마스터 가맹 회사가 관리를 맡을 예정입니다.", ["sp_unsure","mg_master"], { r: "지원 범위가 정해져야 가맹비와 계약서를 정할 수 있으니 운영 방식부터 정리하세요." }),
  ] },
  V.area(p, "Q13", "해외 브랜드 가맹 등록은 산업무역부가 받는 경우가 많으니 그 기준부터 확인하세요."),
];
export const cardTitles = { Q1: "절차와 업종", Q2: "사업자 등록", Q3: "운영 이력과 매장", Q4: "계약서와 상표" };
export const summaries = V.summaries(p, [
  "해외 브랜드를 베트남에 가맹으로 들여오면 등록이 필요하고, 등록 신청서, 가맹 소개서, 본사 사업자 서류, 상표 서류가 기본입니다. 베트남 안의 가맹은 등록이 필요 없을 수 있습니다.",
  "서류가 갖춰지면 등록 처리는 빠른 편이지만, 본사 서류의 영사 인증과 상표 등록에 시간이 걸립니다. 인증과 상표부터 시작하세요.",
  "해외 브랜드 가맹은 직영 운영 이력 등 조건이 있어 운영 기간을 먼저 확인해야 합니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "프랜차이즈 등록 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다.",
  "프랜차이즈 등록 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 등록 전에 브랜드명과 회사명이 서류마다 같은지 확인하세요", rules: [
  ...V.riskRules(p),
  { id: "history", clauses: [[`${p}_history`, ["oh_under1y", "oh_new", "oh_unknown"]]], sentence: "가맹 사업은 일정 기간 이상 운영한 이력이 필요할 수 있어 운영 기간부터 확인해야 합니다" },
  { id: "trademark", clauses: [[`${p}_trademark`, ["tm_home_only", "tm_none", "tm_unknown"]]], sentence: "베트남에 상표가 등록되지 않으면 브랜드를 지키기 어려워 상표 출원을 먼저 하세요" },
  { id: "contract", clauses: [[`${p}_contract`, ["cm_none", "cm_unknown"]]], sentence: "가맹계약서와 운영 매뉴얼이 없으면 등록과 모집이 어려워 먼저 만들어야 합니다" },
  { id: "recruit", clauses: [[`${p}_recruit`, ["rc_started"]]], sentence: "등록 전에 가맹점 모집을 시작했다면 문제가 될 수 있어 등록부터 서둘러야 합니다" },
] };
export const phase2Titles = { Q6: "등록 서류", Q7: "가맹 소개서와 가맹비", Q8: "등록 기관과 모집 시기", Q9: "일정과 사업 시작", Q10: "지금까지 받은 안내", Q11: "제출 방식", Q12: "가맹점 지원과 관리", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "식당 허가 확인", clauses: [[`${p}_business`, ["bz_food"]]], sentence: "외식 브랜드라면 매장마다 식당 허가가 필요하니 식당 허가 직접 인허가 받기에서 함께 점검해 보실 수 있습니다.", path: "/verify/restaurant" },
  V.connectionPro(p, "이미 모집을 시작했거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요."),
];
export const afterResultGuide = ["등록 대상 여부 확인", "운영 이력 정리", "상표 등록 확인", "가맹 소개서와 계약서", "등록 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "프랜차이즈 시행령 (제35/2006/NĐ-CP호): 가맹 사업 조건(운영 1년 이상)과 해외 가맹 등록(산업무역부)", publisher: "베트남 정부", kind: "보도 기준", urls: ["https://luatvietan.vn/nhuong-quyen-thuong-mai-nuoc-ngoai-tai-viet-nam.html", "https://luatminhkhue.vn/quy-dinh-ve-dieu-kien-nhuong-quyen-thuong-mai-moi-nhat.aspx"], note: "영업 1년 이상 요건은 2018년 개정 후에도 유지되고 해외 가맹 등록은 산업무역부라는 점은 확인함(이차 자료 기준). 이 시행령을 대체한 새 시행령은 찾지 못함. 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "상법 (제36/2005/QH11호): 프랜차이즈 정의와 계약", publisher: "베트남 국회", kind: "보도 기준", urls: [], note: "조문 번호는 공식 원문 대조 필요" },
] } };
export const tierRules = V.tier(p);
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { oh_over1y: "secured", oh_home_over1y: "secured", oh_under1y: "unsecured", oh_new: "unsecured", oh_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_history` };
export const pageRule = { file: "src/app/register/franchise/page.tsx", line: 'registrationStatus === "confirmed" && operatingHistoryStatus === "secured" ? "possible" : "conditional";' };
