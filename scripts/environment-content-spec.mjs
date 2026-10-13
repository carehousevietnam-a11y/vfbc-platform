// ENVIRONMENT(환경 허가) content spec. 근거: 환경보호법(72/2020/QH14), 시행령 08/2022/NĐ-CP(05/2025 개정).
// 기존 판정(src/app/register/environment/page.tsx): 등록 확정 + 배출·방지시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
const { C } = K;
const p = "ev";
export const labels = {
  ...K.commonLabels,
  st_new_project: "새 공장·사업장 준비", st_expand: "생산 규모 확대", st_renew: "환경 허가 갱신", st_check: "현재 시설 점검 대비", st_unsure: "어떤 절차인지 모름",
  in_manufacturing: "일반 제조", in_food: "식품 가공", in_chemical: "화학·도장", in_textile: "섬유·염색", in_warehouse: "물류·창고",
  env_installed: "배출·방지시설 설치 완료", env_building: "방지시설 공사 중", env_designing: "방지시설 설계 중", env_none: "방지시설 없음", env_unknown: "필요한 시설을 모름",
  em_wastewater: "폐수 발생", em_air: "배기가스·먼지 발생", em_waste: "산업 폐기물 발생", em_noise: "소음·진동 발생", em_unknown: "배출 종류를 모름",
  as_done: "환경영향평가 완료", as_in_progress: "환경영향평가 진행 중", as_registration: "환경 등록 대상", as_none: "평가·등록 안 함", as_unknown: "평가 대상 여부를 모름",
  sc_large: "대규모 사업장", sc_mid: "중간 규모 사업장", sc_small: "소규모 사업장", sc_unknown: "규모 기준을 모름",
  mo_auto: "자동 측정 장비 설치", mo_periodic: "정기 측정 계약", mo_none: "측정 계획 없음", mo_unknown: "측정 의무를 모름",
  wc_licensed: "허가받은 처리 업체와 계약", wc_landlord: "산업단지가 처리", wc_none: "처리 계약 없음", wc_unknown: "처리 방법을 모름",
  lo_ip: "산업단지 안", lo_cluster: "공업 지구", lo_residential: "주거 지역 인근", lo_rural: "농촌 지역", lo_unknown: "입지 기준을 모름",
  nb_none: "주민 민원 없음", nb_concern: "주민 우려 있음", nb_complaint: "민원 접수됨", nb_unknown: "주민 반응을 모름",
};
export const questions = [
  { code: "Q1", stage: 1, prompt: "환경과 관련해 어떤 절차가 필요하고, 어떤 업종의 사업장인가요?", f: [`${p}_stage`, `${p}_industry`], choices: [
    C("**새 공장이나 사업장**을 준비하고 있습니다.", "부품이나 제품을 만드는 일반 제조 공장입니다.", ["st_new_project", "in_manufacturing"], { card: "새 제조 공장의 환경 절차를 준비하는 상황입니다" }),
    C("**생산 규모를 늘리려고** 합니다.", "원료를 가공해 식품을 만드는 공장을 운영하고 있습니다.", ["st_expand", "in_food"], { card: "식품 가공 공장의 규모를 늘리려는 상황입니다" }),
    C("**기존 환경 허가를 갱신**해야 합니다.", "화학 원료를 쓰거나 도장 작업을 하는 공장입니다.", ["st_renew", "in_chemical"], { card: "화학·도장 공장의 환경 허가를 갱신하는 상황입니다" }),
    C("**환경 점검에 대비**하려고 합니다.", "섬유를 짜거나 물들이는 염색 작업을 하고 있습니다.", ["st_check", "in_textile"], { card: "섬유·염색 공장의 환경 점검에 대비하는 상황입니다" }),
    C("**어떤 절차가 필요한지** 모르겠습니다.", "물건을 보관하고 나누는 물류 창고를 운영하려고 합니다.", ["st_unsure", "in_warehouse"], { card: "물류 창고에 필요한 환경 절차부터 확인할 상황입니다" }),
  ] },
  K.registrationQuestion(p, "Q2", "사업자 등록은 어디까지 진행되었고, 누구 이름으로 환경 절차를 진행하실 예정인가요?"),
  { code: "Q3", stage: 1, prompt: "배출·방지시설은 갖추었고, 사업장에서 주로 어떤 오염물이 나오나요?", f: [`${p}_facility`, `${p}_emission`], choices: [
    C("**배출·방지시설을 모두** 설치했습니다.", "생산 과정에서 폐수가 나와서 폐수 처리 시설을 갖추었습니다.", ["env_installed", "em_wastewater"], { card: "방지시설을 갖추었고 폐수가 나오는 상황입니다" }),
    C("**방지시설 공사를 하고** 있습니다.", "기계가 돌아가는 동안 배기가스와 먼지가 많이 나옵니다.", ["env_building", "em_air"], { card: "방지시설 공사 중이고 배기가스가 나오는 상황입니다" }),
    C("**방지시설을 설계**하고 있습니다.", "생산 과정에서 따로 처리해야 하는 산업 폐기물이 나옵니다.", ["env_designing", "em_waste"], { card: "방지시설 설계 중이고 폐기물이 나오는 상황입니다" }),
    C("**방지시설을 따로** 갖추지 않았습니다.", "기계 소음과 진동이 주변에 들릴 정도로 납니다.", ["env_none", "em_noise"], { card: "방지시설 없이 소음·진동이 나는 상황입니다" }),
    C("**어떤 시설이 필요한지** 모르겠습니다.", "어떤 오염물이 얼마나 나오는지도 확인하지 못했습니다.", ["env_unknown", "em_unknown"], { card: "배출 종류와 필요한 시설을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "환경영향평가나 환경 등록은 진행했고, 사업장 규모는 어느 정도인가요?", f: [`${p}_assessment`, `${p}_scale`], choices: [
    C("**환경영향평가를** 마쳤습니다.", "하루 생산량이 많은 대규모 사업장으로 운영하고 있습니다.", ["as_done", "sc_large"], { card: "환경영향평가를 마친 대규모 사업장인 상황입니다" }),
    C("**환경영향평가를 진행**하고 있습니다.", "중간 정도 규모의 생산 시설을 계획하고 있습니다.", ["as_in_progress", "sc_mid"], { card: "평가가 진행 중인 중간 규모 사업장인 상황입니다" }),
    C("**환경 등록만 하면** 되는 것으로 알고 있습니다.", "작은 규모라서 오염물 배출이 많지 않습니다.", ["as_registration", "sc_small"], { card: "환경 등록 대상인 소규모 사업장으로 아는 상황입니다" }),
    C("**평가나 등록을** 하지 않았습니다.", "사업장 규모가 어느 기준에 해당하는지 모르겠습니다.", ["as_none", "sc_unknown"], { card: "평가·등록을 하지 않았고 규모 기준을 모르는 상황입니다" }),
    C("**평가 대상인지** 모르겠습니다.", "중간 정도 규모라서 어떤 환경 절차가 맞는지 궁금합니다.", ["as_unknown", "sc_mid"], { card: "평가 대상 여부를 확인해야 하는 상황입니다" }),
  ] },
  K.concernQuestion(p, "Q5", "**우리 사업장이 환경 허가 대상인지** 모르겠습니다."),
  K.docsQuestion(p, "Q6", "**사업자 등록증, 공장 도면, 배출·방지시설 설명서를 모두** 준비했습니다.", [
    "서류가 갖춰졌으니 도면의 시설 위치와 실제 설치 위치가 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 배출량 자료와 방지시설 설명서가 빠졌는지부터 확인하세요.",
    "업종과 규모별로 환경 허가·등록·평가 중 무엇이 필요한지 먼저 확인하세요.",
    "업종과 생산량, 배출 종류를 먼저 정리하면 필요한 서류가 정해집니다.",
  ]),
  { code: "Q7", stage: 2, prompt: "오염물 측정은 어떻게 하고 있고, 폐기물은 어떤 업체가 처리하나요?", f: [`${p}_monitoring`, `${p}_wasteContract`], choices: [
    C("**자동 측정 장비를** 설치했습니다.", "정부 허가를 받은 폐기물 처리 업체와 계약을 맺었습니다.", ["mo_auto", "wc_licensed"], { r: "측정 기록과 처리 계약서를 함께 보관해 두면 점검 때 바로 보여 줄 수 있습니다." }),
    C("**측정 업체와 정기 측정** 계약을 맺었습니다.", "산업단지에서 폐기물을 함께 처리해 주고 있습니다.", ["mo_periodic", "wc_landlord"], { r: "산업단지 처리가 우리 폐기물 종류까지 포함하는지 확인하고 측정 결과를 보관하세요." }),
    C("**측정 계획을 아직** 세우지 않았습니다.", "폐기물 처리 업체와 계약을 맺지 않았습니다.", ["mo_none", "wc_none"], { r: "측정과 폐기물 처리 계약이 없으면 허가가 어려울 수 있으니 업체부터 정하세요." }),
    C("**측정 의무가 있는지** 모르겠습니다.", "폐기물을 어떻게 처리해야 하는지도 잘 모릅니다.", ["mo_unknown", "wc_unknown"], { r: "업종과 규모에 따라 측정 의무가 정해지니 그 기준부터 확인하고 처리 방법을 정하세요." }),
    C("**자동 측정 장비 설치를** 검토하고 있습니다.", "폐기물 처리 계약은 허가받은 업체와 맺어 두었습니다.", ["mo_reviewing", "wc_licensed"], { r: "자동 측정이 의무인지 먼저 확인하고, 의무라면 설치 일정을 허가 일정에 맞추세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "사업장은 어떤 지역에 있고, 주변 주민의 민원이나 우려가 있나요?", f: [`${p}_location`, `${p}_neighbors`], choices: [
    C("**산업단지 안**에 있습니다.", "사업장 주변 주민의 민원이나 걱정은 들은 적이 없습니다.", ["lo_ip", "nb_none"], { r: "산업단지 안이면 단지의 환경 기준과 공용 처리 시설을 먼저 확인하세요." }),
    C("**공업 지구**에 있습니다.", "주민들이 냄새나 소음을 걱정한다는 이야기를 몇 번 들었습니다.", ["lo_cluster", "nb_concern"], { r: "주민 우려가 있다면 배출 저감 계획을 미리 준비해 두면 절차가 부드러워집니다." }),
    C("**주거 지역 가까이**에 있습니다.", "이미 주민 민원이 관할 기관에 한 번 들어온 적이 있습니다.", ["lo_residential", "nb_complaint"], { r: "주거지 인근 민원은 허가에 큰 영향을 줄 수 있으니 민원 내용과 조치를 먼저 정리하세요." }),
    C("**농촌 지역**에 있습니다.", "주변 주민들이 우리 사업장을 어떻게 생각하는지 아직 모릅니다.", ["lo_rural", "nb_unknown"], { r: "농촌 지역은 물과 토양 영향이 중요하게 보일 수 있으니 배출 관리 계획을 준비하세요." }),
    C("**입지 기준이 있는지** 모르겠습니다.", "지금까지 주민 민원이나 걱정은 들어 본 적이 없습니다.", ["lo_unknown", "nb_none"], { r: "업종에 따라 입지 제한이 있을 수 있으니 사업장 위치가 적합한지 먼저 확인하세요." }),
  ] },
  K.timelineQuestion(p, "Q9", [
    "한 달은 환경 절차에 매우 빠듯하니 시설 자료와 서류를 바로 준비하세요.",
    "시설 공사가 끝나는 날을 기준으로 환경 절차 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 설계 단계에서 배출 기준을 먼저 맞추고 공사를 진행하세요.",
    "가동 시작 시점을 정해야 공사와 환경 절차 일정을 맞출 수 있습니다.",
    "환경 절차 없이 가동 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요.",
  ]),
  K.quoteQuestion(p, "Q10", "항목이 나뉘어 있으니 평가 보고서 작성, 측정, 허가 신청이 각각 포함되는지 확인하세요."),
  K.submitQuestion(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "허가를 받은 뒤 정기 보고는 누가 맡을 예정이고, 담당 직원이 있나요?", f: [`${p}_reporting`, `${p}_staff`], choices: [
    C("**환경 담당 직원**이 정기 보고를 맡습니다.", "환경 관련 교육을 받은 직원이 이미 일하고 있습니다.", ["rp_staff", "es_trained"], { r: "담당 직원이 있으니 보고 일정표를 만들어 놓치지 않도록 관리하세요." }),
    C("**외부 컨설팅 업체**에 맡기려고 합니다.", "회사 안에는 환경 업무를 아는 직원이 없습니다.", ["rp_consultant", "es_none"], { r: "외부에 맡기더라도 회사 안에서 자료를 모아 줄 담당자를 정해 두세요." }),
    C("**공장장이 함께** 맡을 예정입니다.", "환경 업무를 맡을 담당 직원을 새로 뽑을 계획입니다.", ["rp_manager", "es_hiring"], { r: "공장장이 함께 맡으면 보고 기한을 놓치기 쉬우니 일정 알림을 만들어 두세요." }),
    C("**정기 보고가 있는지** 몰랐습니다.", "환경 업무를 맡을 사람을 아직 정하지 못했습니다.", ["rp_unknown", "es_none"], { r: "허가 뒤에도 정기 보고 의무가 있을 수 있으니 범위와 기한부터 확인하세요." }),
    C("**본사에서 원격으로** 관리하려고 합니다.", "현지에는 환경 업무를 맡을 직원이 따로 없습니다.", ["rp_hq", "es_remote"], { r: "현지 보고는 베트남어로 해야 할 수 있으니 현지 담당자를 함께 두세요." }),
  ] },
  K.areaQuestion(p, "Q13", "환경 허가는 규모에 따라 지역 농업환경 담당 기관이나 중앙 부처가 받으니 규모 기준부터 확인하세요."),
];
Object.assign(labels, { mo_reviewing: "자동 측정 장비 검토 중", rp_staff: "환경 담당 직원이 보고", rp_consultant: "외부 업체가 보고", rp_manager: "공장장이 보고", rp_unknown: "정기 보고를 모름", rp_hq: "본사에서 원격 관리", es_trained: "교육받은 담당 직원 있음", es_none: "담당 직원 없음", es_hiring: "담당 직원 채용 예정", es_remote: "현지 담당 직원 없음" });
export const cardTitles = { Q1: "절차와 업종", Q2: "사업자 등록", Q3: "방지시설과 배출", Q4: "평가와 규모" };
export const summaries = K.summariesFor(p, [
  "환경 절차 비용은 평가 보고서 작성, 측정, 방지시설, 대행료로 나뉩니다. 업종과 규모에 따라 허가·등록·평가 중 필요한 것이 달라지니 그 기준부터 확인하세요.",
  "환경 절차는 업종과 규모에 따라 환경영향평가, 환경 허가, 환경 등록으로 나뉘며, 공장 도면, 배출량 자료, 방지시설 설명서가 기본입니다.",
  "환경 절차는 서류 검토와 현장 확인에 시간이 걸리고, 방지시설이 갖춰져야 진행할 수 있습니다. 공사 일정과 환경 일정을 함께 맞추세요.",
  "환경 허가 대상은 업종, 생산량, 배출 종류와 사업장 위치에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "견적은 평가 보고서, 측정, 허가 신청, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 가동 전에 방지시설 작동과 측정 기록을 한 번 더 확인하세요", rules: [
  ...K.commonRiskRules(p),
  { id: "facility", clauses: [[`${p}_facility`, ["env_designing", "env_none", "env_unknown"]]], sentence: "배출·방지시설이 갖춰지지 않으면 환경 절차를 진행하기 어려워 시설부터 갖춰야 합니다" },
  { id: "assessment", clauses: [[`${p}_assessment`, ["as_none", "as_unknown"]]], sentence: "환경영향평가 대상인데 진행하지 않으면 사업이 멈출 수 있어 대상 여부부터 확인하세요" },
  { id: "waste", clauses: [[`${p}_wasteContract`, ["wc_none", "wc_unknown"]]], sentence: "폐기물 처리 계약이 없으면 허가가 어려울 수 있어 허가받은 처리 업체부터 정하세요" },
  { id: "complaint", clauses: [[`${p}_neighbors`, ["nb_complaint"]]], sentence: "주민 민원이 있었다면 민원 내용과 조치 기록을 먼저 정리해야 합니다" },
] };
export const phase2Titles = { Q6: "신청 서류", Q7: "측정과 폐기물 처리", Q8: "입지와 주민", Q9: "일정과 가동 시작", Q10: "견적과 비용", Q11: "제출 방식", Q12: "정기 보고와 담당자", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "소방 허가 확인", clauses: [[`${p}_stage`, ["st_new_project", "st_expand"]]], sentence: "공장을 새로 짓거나 늘린다면 소방 허가 직접 인허가 받기에서 소방 준비도 함께 점검해 보실 수 있습니다.", path: "/verify/fire" },
  { name: "전문가 진행", clauses: [[`${p}_timeline`, ["tl_already", "tl_urgent"]], [`${p}_neighbors`, ["nb_complaint"]], [`${p}_helpWanted`, ["help_full"]]], sentence: "이미 가동 중이거나 민원이 있다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["업종·규모별 절차 확인", "배출량과 방지시설 정리", "측정과 폐기물 계약", "입지 적합성 확인", "정기 보고 담당자 지정"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "환경보호법 (제72/2020/QH14호): 환경영향평가, 환경 허가, 환경 등록 대상 구분", publisher: "베트남 국회", kind: "보도 기준", urls: ["https://thuvienphapluat.vn/hoi-dap-phap-luat/doi-tuong-nao-can-co-giay-phep-moi-truong-138019034.html"], note: "대상 기준과 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "환경보호법 시행령 (제08/2022/NĐ-CP호, 2025년 개정)", publisher: "베트남 정부", kind: "보도 기준", urls: [], note: "제05/2025/NĐ-CP호 개정이 있는 사실은 확인함(이차 자료 기준). 개정 내용은 원문 대조 필요" },
] } };
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: [...K.commonTier(p).full, [`${p}_neighbors`, ["nb_complaint"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: K.commonTier(p).accompany },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { env_installed: "secured", env_building: "unsecured", env_designing: "unsecured", env_none: "unsecured", env_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_facility` };
export const pageRule = { file: "src/app/register/environment/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
