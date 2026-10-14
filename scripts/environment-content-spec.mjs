// ENVIRONMENT(환경 허가) content spec. 근거: 환경보호법(72/2020/QH14), 시행령 08/2022/NĐ-CP(05/2025 개정).
// 기존 판정(src/app/register/environment/page.tsx): 등록 확정 + 배출·방지시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
import * as V from "./register-voice-spec.mjs";
const { C } = K;
const p = "ev";
export const labels = {
  ...K.commonLabels,
  ...V.voiceLabels,
  if_new_factory: "새 공장 환경 절차 확인", if_expand: "규모 확대 시 절차 확인", if_renew: "환경 허가 갱신 준비 확인", if_inspection: "환경 점검 대비 확인", if_which: "창고의 환경 절차 필요 여부 확인",
  in_manufacturing: "일반 제조", in_food: "식품 가공", in_chemical: "화학·도장", in_textile: "섬유·염색", in_warehouse: "물류·창고",
  env_installed: "배출·방지시설 설치 완료", env_building: "방지시설 공사 중", env_designing: "방지시설 설계 중", env_none: "방지시설 없음", env_unknown: "필요한 시설을 모름",
  em_wastewater: "폐수 발생", em_air: "배기가스·먼지 발생", em_waste: "산업 폐기물 발생", em_noise: "소음·진동 발생", em_unknown: "배출 종류를 모름",
  as_done: "환경영향평가 완료", as_in_progress: "환경영향평가 진행 중", as_registration: "환경 등록 대상", as_none: "평가·등록 안 함", as_unknown: "평가 대상 여부를 모름",
  sc_large: "대규모 사업장", sc_mid: "중간 규모 사업장", sc_small: "소규모 사업장", sc_unknown: "규모 기준을 모름",
  wc_licensed: "허가받은 처리 업체와 계약", wc_landlord: "산업단지가 처리", wc_none: "처리 계약 없음", wc_unknown: "처리 방법을 모름", wc_self: "직접 처리·폐기", wk_match: "계약 폐기물 종류 확인", wk_hazard: "단지의 위험 폐기물 처리 확인", wk_find: "허가 업체 찾는 방법 확인", wk_self_rule: "직접 처리 허용 범위 확인", wk_classify: "폐기물 종류 구분 확인",
  lo_ip: "산업단지 안", lo_cluster: "공업 지구", lo_residential: "주거 지역 인근", lo_rural: "농촌 지역", lo_unknown: "입지 기준을 모름",
  nb_none: "주민 민원 없음", nb_concern: "주민 우려 있음", nb_complaint: "민원 접수됨", nb_unknown: "주민 반응을 모름",
};
const cfg = {
  noun: "환경 허가",
  openObj: "공장 가동을",
  openTopic: "공장 가동은",
  dateWord: "가동 시작 날짜",
  openNow: "이미 공장을 가동하고 있습니다.",
  fitout: "시설 공사가 끝나는 날에 맞춰",
  operatingD: "공장 가동을 이미 시작했는데 환경 허가가 아직 확인되지 않았습니다.",
  docsR: [
    "서류가 갖춰졌으니 도면의 시설 위치와 실제 설치 위치가 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 배출량 자료와 방지시설 설명서가 빠졌는지부터 확인하세요.",
    "업종과 규모별로 환경 허가·등록·평가 중 무엇이 필요한지 먼저 확인하세요.",
    "업종과 생산량, 배출 종류를 먼저 정리하면 필요한 서류가 정해집니다.",
  ],
};
const tlR = [
    "한 달은 환경 절차에 매우 빠듯하니 시설 자료와 서류를 바로 준비하세요.",
    "시설 공사가 끝나는 날을 기준으로 환경 절차 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 설계 단계에서 배출 기준을 먼저 맞추고 공사를 진행하세요.",
    "가동 시작 시점을 정해야 공사와 환경 절차 일정을 맞출 수 있습니다.",
    "환경 절차 없이 가동 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요.",
];
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 업종의 사업장이고, 환경 절차에서 가장 막막한 부분은 어디인가요?", f: [`${p}_industry`, `${p}_industryFocus`], choices: [
    C("**부품이나 제품을 만드는 공장을** 새로 세우려고 합니다.", "환경 허가를 받아야 하는지 환경영향평가를 받아야 하는지 사람마다 말이 다릅니다.", ["in_manufacturing","if_new_factory"], { card: "새 제조 공장에 필요한 환경 절차를 확인하려는 상황입니다" }),
    C("**식품을 가공하는 공장입니다.**", "생산을 늘리려면 환경 절차를 처음부터 다시 해야 하는지 모르겠습니다.", ["in_food","if_expand"], { card: "식품 공장의 규모 확대 시 환경 절차를 확인하려는 상황입니다" }),
    C("**화학 원료를 쓰거나 도장 작업을 하는 공장이고, 환경 허가는 이미 받았습니다.**", "갱신 시기가 다가오는데 뭘 다시 준비해야 하는지 걱정입니다.", ["in_chemical","if_renew"], { card: "화학·도장 공장의 환경 허가 갱신 준비를 확인하려는 상황입니다" }),
    C("**섬유를 짜거나 염색하는 공장입니다.**", "폐수가 많이 나오는 작업이라 환경 점검이 나오면 어떻게 대비해야 할지 불안합니다.", ["in_textile","if_inspection"], { card: "섬유·염색 공장의 환경 점검 대비를 확인하려는 상황입니다" }),
    C("**물건을 보관하고 나누는 물류 창고입니다.**", "공장이 아닌 창고도 환경 절차를 받아야 하는지 아무도 확실히 말해 주지 않습니다.", ["in_warehouse","if_which"], { card: "물류 창고에 환경 절차가 필요한지 확인하려는 상황입니다" }),
  ] },
  V.registration(p, "Q2", cfg),
  { code: "Q3", stage: 1, prompt: "오염을 막는 설비는 어디까지 갖추셨고, 주로 어떤 오염물이 나오나요?", f: [`${p}_facility`, `${p}_emission`], choices: [
    C("**방지 설비는 다 설치했습니다.**", "생산 과정에서 나오는 폐수를 그 설비로 처리하고 있습니다.", ["env_installed","em_wastewater"], { card: "방지시설을 갖추고 폐수를 처리하는 상황입니다" }),
    C("**설비 공사를 하고 있습니다.**", "기계에서 나오는 배기가스와 먼지를 줄이려고 하는데 충분할지 모르겠습니다.", ["env_building","em_air"], { card: "방지시설 공사 중이고 배기가스를 줄이려는 상황입니다" }),
    C("**설비를 설계하고 있습니다.**", "따로 처리해야 하는 산업 폐기물이 나오는데 어떻게 다뤄야 할지 막막합니다.", ["env_designing","em_waste"], { card: "방지시설 설계 중이고 폐기물을 다룰 상황입니다" }),
    C("**방지 설비를 따로 갖추지 못했습니다.**", "기계 소음과 진동이 주변에 들릴 정도로 나서 민원이 올까 걱정입니다.", ["env_none","em_noise"], { card: "방지시설 없이 소음·진동이 나는 상황입니다" }),
    C("**뭐가 필요한지** 모르겠습니다.", "어떤 오염물이 얼마나 나오는지도 몰라서 어떤 설비가 필요한지 정하지 못했습니다.", ["env_unknown","em_unknown"], { card: "배출 종류와 필요한 시설을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "환경영향평가나 환경 등록 이야기는 들어 보셨고, 우리 사업장 규모는 어느 정도인가요?", f: [`${p}_assessment`, `${p}_scale`], choices: [
    C("**환경영향평가는 마쳤습니다.**", "하루 생산량이 많은 대규모로 운영하고 있는데 평가 후에 따로 할 일이 있는지 궁금합니다.", ["as_done","sc_large"], { card: "환경영향평가를 마친 대규모 사업장인 상황입니다" }),
    C("**환경영향평가를 진행 중입니다.**", "중간 정도 규모로 계획하고 있는데 이 규모가 평가 대상이 맞는지 궁금합니다.", ["as_in_progress","sc_mid"], { card: "평가가 진행 중인 중간 규모 사업장인 상황입니다" }),
    C("**환경 등록만 하면 된다고 들었습니다.**", "규모가 작아서 오염물이 많이 나오지 않기 때문이라고 하는데 맞는지 모르겠습니다.", ["as_registration","sc_small"], { card: "환경 등록 대상인 소규모 사업장으로 아는 상황입니다" }),
    C("**평가도 등록도 하지 않았습니다.**", "우리 사업장 규모가 어느 기준에 해당하는지도 모르겠습니다.", ["as_none","sc_unknown"], { card: "평가·등록을 하지 않았고 규모 기준을 모르는 상황입니다" }),
    C("**평가 대상인지** 모르겠습니다.", "규모가 대규모와 소규모 사이라서 어느 쪽 절차를 따라야 하는지 궁금합니다.", ["as_unknown","sc_between"], { card: "평가 대상 여부와 규모 기준을 확인해야 하는 상황입니다" }),
  ] },
  V.feeling(p, "Q5", cfg),
  V.docs(p, "Q6", cfg),
  { code: "Q7", stage: 2, prompt: "공장에서 나오는 폐기물은 어떻게 처리하고 계시고, 어떤 점이 가장 걱정되나요?", f: [`${p}_wasteContract`, `${p}_wasteKind`], choices: [
    C("**허가받은 처리 업체와 계약했습니다.**", "계약서에 적힌 폐기물 종류가 우리 공장에서 나오는 것과 맞는지 확인하지 못했습니다.", ["wc_licensed","wk_match"], { r: "계약서의 폐기물 종류와 우리 공장의 실제 폐기물을 대조하고 처리 기록을 함께 보관하세요." }),
    C("**산업단지가 폐기물을 함께 처리해 줍니다.**", "단지 처리에 위험한 폐기물까지 포함되는지 모르겠습니다.", ["wc_landlord","wk_hazard"], { r: "산업단지 처리가 우리 폐기물 종류까지 포함하는지 단지 운영 기관에 먼저 확인하세요." }),
    C("**처리 업체와 계약한 곳이 없습니다.**", "어떤 업체가 허가를 받은 업체인지 찾는 방법부터 모르겠습니다.", ["wc_none","wk_find"], { r: "계약이 없으면 허가가 어려울 수 있으니 허가받은 처리 업체 목록을 담당 기관에서 확인하세요." }),
    C("**폐기물을 직접 처리하거나 버리고** 있습니다.", "그렇게 해도 되는지, 기록을 남겨야 하는지 몰라서 불안합니다.", ["wc_self","wk_self_rule"], { r: "산업 폐기물은 직접 처리가 제한될 수 있으니 허용 범위와 기록 의무를 먼저 확인하세요." }),
    C("**어떻게 처리해야 하는지** 모르겠습니다.", "우리 공장 폐기물이 위험 폐기물인지 일반 폐기물인지부터 모르겠습니다.", ["wc_unknown","wk_classify"], { r: "폐기물 종류를 먼저 구분해야 처리 방법이 정해지니 성분 자료를 모아 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "사업장은 어떤 지역에 있고, 주변 주민들이 불편해한다는 이야기는 들어 보셨나요?", f: [`${p}_location`, `${p}_neighbors`], choices: [
    C("**산업단지 안에 있습니다.**", "주변 주민이 불편해한다는 이야기는 들은 적이 없는데 입지 기준은 따로 있는지 궁금합니다.", ["lo_ip","nb_none"], { r: "산업단지 안이면 단지의 환경 기준과 공용 처리 시설을 먼저 확인하세요." }),
    C("**공업 지구에 있습니다.**", "주민들이 냄새나 소음을 걱정한다는 이야기를 몇 번 들었습니다.", ["lo_cluster","nb_concern"], { r: "주민 우려가 있다면 배출 저감 계획을 미리 준비해 두면 절차가 부드러워집니다." }),
    C("**주거 지역 가까이에 있습니다.**", "이미 주민 민원이 관할 기관에 한 번 들어온 적이 있습니다.", ["lo_residential","nb_complaint"], { r: "주거지 인근 민원은 허가에 큰 영향을 줄 수 있으니 민원 내용과 조치를 먼저 정리하세요." }),
    C("**농촌 지역에 있습니다.**", "주변 주민들이 우리 사업장을 어떻게 생각하는지 아직 모릅니다.", ["lo_rural","nb_unknown"], { r: "농촌 지역은 물과 토양 영향이 중요하게 보일 수 있으니 배출 관리 계획을 준비하세요." }),
    C("**이 지역에서 해도 되는지** 모르겠습니다.", "주변에 주거지가 있는지 확인하지 못해서 주민 민원이 생길지도 가늠이 안 됩니다.", ["lo_unknown","nb_unknown"], { r: "업종에 따라 입지 제한이 있을 수 있으니 사업장 위치가 적합한지 먼저 확인하세요." }),
  ] },
  V.timeline(p, "Q9", cfg, tlR),
  V.asked(p, "Q10"),
  V.submit(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "허가를 받은 뒤 환경 상태를 정기적으로 보고해야 한다는데, 그 일은 누가 맡을 예정인가요?", f: [`${p}_reporting`, `${p}_staff`], choices: [
    C("**환경 담당 직원이 맡습니다.**", "환경 관련 교육을 받은 직원이 이미 일하고 있습니다.", ["rp_staff","es_trained"], { r: "담당 직원이 있으니 보고 일정표를 만들어 놓치지 않도록 관리하세요." }),
    C("**외부 컨설팅 업체에 맡기려고** 합니다.", "회사 안에는 환경 업무를 아는 직원이 없습니다.", ["rp_consultant","es_none"], { r: "외부에 맡기더라도 회사 안에서 자료를 모아 줄 담당자를 정해 두세요." }),
    C("**공장장이 함께 맡을 예정입니다.**", "환경 업무만 맡을 담당 직원은 아직 없어서 새로 뽑을 계획입니다.", ["rp_manager","es_hiring"], { r: "공장장이 함께 맡으면 보고 기한을 놓치기 쉬우니 일정 알림을 만들어 두세요." }),
    C("**그런 보고가 있는지** 몰랐습니다.", "환경 업무를 맡을 사람을 아직 정하지 못했습니다.", ["rp_unknown","es_none"], { r: "허가 뒤에도 정기 보고 의무가 있을 수 있으니 범위와 기한부터 확인하세요." }),
    C("**본사에서 원격으로 관리하려고** 합니다.", "현지에는 환경 업무를 맡을 직원이 따로 없습니다.", ["rp_hq","es_remote"], { r: "현지 보고는 베트남어로 해야 할 수 있으니 현지 담당자를 함께 두세요." }),
  ] },
  V.area(p, "Q13", "환경 허가는 규모에 따라 지역 농업환경 담당 기관이나 중앙 부처가 받으니 규모 기준부터 확인하세요."),
];
export const cardTitles = { Q1: "업종과 확인할 점", Q2: "사업자 등록", Q3: "방지시설과 배출", Q4: "평가와 규모" };
export const summaries = V.summaries(p, [
  "환경 절차는 업종과 규모에 따라 환경영향평가, 환경 허가, 환경 등록으로 나뉘며, 공장 도면, 배출량 자료, 방지시설 설명서가 기본입니다.",
  "환경 절차는 서류 검토와 현장 확인에 시간이 걸리고, 방지시설이 갖춰져야 진행할 수 있습니다. 공사 일정과 환경 일정을 함께 맞추세요.",
  "환경 허가 대상은 업종, 생산량, 배출 종류와 사업장 위치에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "환경 허가 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다.",
  "환경 허가 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 가동 전에 방지시설 작동과 측정 기록을 한 번 더 확인하세요", rules: [
  ...V.riskRules(p),
  { id: "facility", clauses: [[`${p}_facility`, ["env_designing", "env_none", "env_unknown"]]], sentence: "배출·방지시설이 갖춰지지 않으면 환경 절차를 진행하기 어려워 시설부터 갖춰야 합니다" },
  { id: "assessment", clauses: [[`${p}_assessment`, ["as_none", "as_unknown"]]], sentence: "환경영향평가 대상인데 진행하지 않으면 사업이 멈출 수 있어 대상 여부부터 확인하세요" },
  { id: "waste", clauses: [[`${p}_wasteContract`, ["wc_none", "wc_unknown", "wc_self"]]], sentence: "폐기물 처리 계약이 없으면 허가가 어려울 수 있어 허가받은 처리 업체부터 정하세요" },
  { id: "complaint", clauses: [[`${p}_neighbors`, ["nb_complaint"]]], sentence: "주민 민원이 있었다면 민원 내용과 조치 기록을 먼저 정리해야 합니다" },
] };
export const phase2Titles = { Q6: "신청 서류", Q7: "폐기물 처리와 종류", Q8: "입지와 주민", Q9: "일정과 가동 시작", Q10: "지금까지 받은 안내", Q11: "제출 방식", Q12: "정기 보고와 담당자", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "소방 허가 확인", clauses: [[`${p}_industryFocus`, ["if_new_factory", "if_expand"]]], sentence: "공장을 새로 짓거나 늘린다면 소방 허가 직접 인허가 받기에서 소방 준비도 함께 점검해 보실 수 있습니다.", path: "/verify/fire" },
  V.connectionPro(p, "이미 가동 중이거나 민원이 있다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요."),
];
export const afterResultGuide = ["업종·규모별 절차 확인", "배출량과 방지시설 정리", "측정과 폐기물 계약", "입지 적합성 확인", "정기 보고 담당자 지정"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "환경보호법 (제72/2020/QH14호): 환경영향평가, 환경 허가, 환경 등록 대상 구분", publisher: "베트남 국회", kind: "보도 기준", urls: ["https://thuvienphapluat.vn/hoi-dap-phap-luat/doi-tuong-nao-can-co-giay-phep-moi-truong-138019034.html"], note: "대상 기준과 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "환경보호법 시행령 (제08/2022/NĐ-CP호, 2025년 개정)", publisher: "베트남 정부", kind: "보도 기준", urls: [], note: "제05/2025/NĐ-CP호 개정이 있는 사실은 확인함(이차 자료 기준). 개정 내용은 원문 대조 필요" },
] } };
export const tierRules = V.tier(p);
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { env_installed: "secured", env_building: "unsecured", env_designing: "unsecured", env_none: "unsecured", env_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_facility` };
export const pageRule = { file: "src/app/register/environment/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
