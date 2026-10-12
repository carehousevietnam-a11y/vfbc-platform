// HYGIENE(식품 위생 허가) content spec. 근거: 식품안전법(55/2010/QH12), 시행령 15/2018/NĐ-CP.
// 기존 판정(src/app/register/hygiene/page.tsx): 등록 확정 + 위생시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
const { C } = K;
const p = "hy";
export const labels = {
  ...K.commonLabels,
  st_new: "새로 위생 허가 신청", st_renew: "기존 위생 허가 갱신", st_change: "시설·주소 변경 후 재신청", st_export: "수출용 위생 확인 필요", st_unsure: "어떤 허가인지 모름",
  pt_processed: "가공식품 제조", pt_bakery: "제과·제빵 생산", pt_beverage: "음료·주류 생산", pt_packaged: "포장 식품 유통", pt_central: "센트럴 키친",
  fac_done: "위생시설 구비 완료", fac_partial: "일부 시설만 구비", fac_building: "시설 공사 중", fac_outsourced: "다른 공장에 생산 위탁", fac_unknown: "필요한 시설을 모름",
  ln_one_way: "원료부터 완제품까지 한 방향 동선", ln_mixed: "동선이 일부 겹침", ln_shared: "다른 업체와 공간 공유", ln_none: "동선 구분 없음", ln_unknown: "동선 기준을 모름",
  sh_done: "종사자 건강검진 완료", sh_some: "일부 종사자만 검진", sh_not_yet: "종사자 검진 전", sh_no_staff: "아직 종사자 없음", sh_unknown: "검진 필요 여부를 모름",
  ht_done: "위생 교육 수료", ht_planned: "위생 교육 예정", ht_none: "위생 교육 안 함", ht_unknown: "교육 필요 여부를 모름",
  qc_haccp: "식품 안전 관리 인증 보유", qc_test: "제품 검사 결과서 보유", qc_planned: "검사 예정", qc_none: "검사·인증 없음", qc_unknown: "필요한 검사를 모름",
  lb_ready: "베트남어 표시 준비", lb_draft: "표시 초안만 있음", lb_none: "표시 준비 전", lb_unknown: "표시 기준을 모름",
  wt_tested: "생산용 물 검사 완료", wt_city: "수돗물 사용", wt_well: "지하수 사용", wt_unknown: "물 검사 필요 여부를 모름", wt_source_unknown: "생산용 물 출처를 모름",
  pc_contract: "해충 방제 계약", pc_self: "자체 방제", pc_none: "방제 계획 없음", pc_unknown: "방제 기준을 모름",
};
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 위생 허가가 필요하고, 생산하거나 다루는 식품은 어떤 종류인가요?", f: [`${p}_stage`, `${p}_product`], choices: [
    C("**새로 위생 허가를** 받으려고 합니다.", "소스나 반찬 같은 가공식품을 직접 만들어 팔려고 합니다.", ["st_new", "pt_processed"], { card: "가공식품 생산 시설로 새로 허가를 받으려는 상황입니다" }),
    C("**기존 위생 허가를 갱신**하려고 합니다.", "빵과 과자를 만드는 제과·제빵 시설을 운영하고 있습니다.", ["st_renew", "pt_bakery"], { card: "제과·제빵 시설의 허가를 갱신하려는 상황입니다" }),
    C("**시설이나 주소가 바뀌어** 다시 받아야 합니다.", "음료나 주류를 병에 담아 생산하고 있습니다.", ["st_change", "pt_beverage"], { card: "음료 생산 시설이 바뀌어 다시 신청하는 상황입니다" }),
    C("**수출하려고 위생 확인**이 필요합니다.", "포장된 식품을 들여와 나누어 유통하는 일을 합니다.", ["st_export", "pt_packaged"], { card: "포장 식품 유통으로 수출용 확인이 필요한 상황입니다" }),
    C("**어떤 허가가 필요한지** 모르겠습니다.", "여러 매장에 음식을 보내는 중앙 주방을 운영하려고 합니다.", ["st_unsure", "pt_central"], { card: "중앙 주방에 필요한 허가부터 확인할 상황입니다" }),
  ] },
  K.registrationQuestion(p, "Q2", "사업자 등록은 어디까지 진행되었고, 누구 이름으로 허가를 받으실 예정인가요?"),
  { code: "Q3", stage: 1, prompt: "조리·저장·세척 같은 위생시설은 갖추었고, 작업 동선은 어떻게 되어 있나요?", f: [`${p}_facility`, `${p}_flow`], choices: [
    C("**위생시설을 모두** 갖추었습니다.", "원료가 들어와 완제품이 나갈 때까지 한 방향으로 움직입니다.", ["fac_done", "ln_one_way"], { card: "위생시설과 한 방향 작업 동선을 갖춘 상황입니다" }),
    C("**일부 시설만** 갖추었습니다.", "원료와 완제품이 움직이는 동선이 일부 겹치는 구간이 있습니다.", ["fac_partial", "ln_mixed"], { card: "시설이 일부만 있고 동선이 겹치는 상황입니다" }),
    C("**시설 공사를 하고** 있습니다.", "같은 건물의 다른 업체와 공간을 함께 쓰고 있습니다.", ["fac_building", "ln_shared"], { card: "시설 공사 중이고 공간을 함께 쓰는 상황입니다" }),
    C("**다른 공장에 생산을** 맡기려고 합니다.", "작업 공간을 구역별로 나누지 않고 하나로 쓰고 있습니다.", ["fac_outsourced", "ln_none"], { card: "생산을 위탁하고 작업 구역 구분이 없는 상황입니다" }),
    C("**어떤 시설이 필요한지** 모르겠습니다.", "작업 동선을 어떻게 나누어야 하는지도 잘 모릅니다.", ["fac_unknown", "ln_unknown"], { card: "필요한 시설과 동선 기준을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "식품을 다루는 종사자의 건강검진은 마쳤고, 위생 교육은 받았나요?", f: [`${p}_staffHealth`, `${p}_training`], choices: [
    C("**종사자 모두 건강검진을** 마쳤습니다.", "식품 위생 교육도 받아서 수료 확인서를 가지고 있습니다.", ["sh_done", "ht_done"], { card: "종사자 검진과 위생 교육을 모두 마친 상황입니다" }),
    C("**일부 종사자만 검진을** 받았습니다.", "식품 위생 교육은 다음 달에 다 함께 받을 예정입니다.", ["sh_some", "ht_planned"], { card: "일부만 검진했고 위생 교육을 앞둔 상황입니다" }),
    C("**종사자 건강검진을 아직** 받지 않았습니다.", "식품 위생 교육도 아직 받지 않은 상태입니다.", ["sh_not_yet", "ht_none"], { card: "종사자 검진과 위생 교육이 모두 남은 상황입니다" }),
    C("**아직 종사자를 뽑지** 않았습니다.", "종사자를 뽑은 뒤에 위생 교육을 받게 할 생각입니다.", ["sh_no_staff", "ht_planned"], { card: "종사자 채용 전이라 검진과 교육이 남은 상황입니다" }),
    C("**건강검진이 필요한지** 모르겠습니다.", "위생 교육을 받아야 하는지도 확인하지 못했습니다.", ["sh_unknown", "ht_unknown"], { card: "검진과 교육 필요 여부를 확인할 상황입니다" }),
  ] },
  K.concernQuestion(p, "Q5", "**우리 시설이 허가 대상인지** 모르겠습니다."),
  K.docsQuestion(p, "Q6", "**신청서, 사업자 등록증, 시설 설명서와 도면을 모두** 준비했습니다.", [
    "서류가 갖춰졌으니 도면의 구역 표시와 실제 시설이 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 시설 설명서와 종사자 서류가 빠졌는지부터 확인하세요.",
    "위생 허가 기본 서류(신청서, 등록증, 시설 설명과 도면, 종사자 검진·교육)를 먼저 받으세요.",
    "식품 종류에 따라 담당 기관과 서류가 달라지니 그 기준부터 확인하세요.",
  ]),
  { code: "Q7", stage: 2, prompt: "제품의 안전 검사나 인증은 받았고, 베트남어 제품 표시는 준비되었나요?", f: [`${p}_quality`, `${p}_label`], choices: [
    C("**식품 안전 관리 인증을** 받았습니다.", "베트남어로 된 제품 표시도 모두 준비해 두었습니다.", ["qc_haccp", "lb_ready"], { r: "인증을 이미 받은 시설은 위생 증명서가 면제될 수 있으니 인증서 유효 기간부터 확인하세요." }),
    C("**제품 검사 결과서를** 가지고 있습니다.", "제품 표시는 초안만 만들어 두고 아직 확정하지 않았습니다.", ["qc_test", "lb_draft"], { r: "검사 결과서의 날짜와 검사 항목이 제품과 맞는지 확인하고 표시 문안을 확정하세요." }),
    C("**제품 검사를 받을** 예정입니다.", "베트남어로 된 제품 표시는 아직 준비하지 못했습니다.", ["qc_planned", "lb_none"], { r: "검사 결과가 나와야 표시 문안을 확정할 수 있으니 검사 일정을 먼저 잡으세요." }),
    C("**검사나 인증을 받은 적이** 없습니다.", "제품 표시에 어떤 내용을 넣어야 하는지 모르겠습니다.", ["qc_none", "lb_unknown"], { r: "제품 종류별로 필요한 검사 항목을 먼저 확인하고 표시 기준도 함께 알아보세요." }),
    C("**어떤 검사가 필요한지** 모르겠습니다.", "베트남어 표시를 준비해 두었는데 기준에 맞는지 궁금합니다.", ["qc_unknown", "lb_ready"], { r: "표시 문안을 기준과 대조해 보고, 필요한 검사 항목을 함께 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "생산에 쓰는 물은 검사했고, 해충 방제는 어떻게 관리하고 계신가요?", f: [`${p}_water`, `${p}_pest`], choices: [
    C("**생산에 쓰는 물을 검사**했습니다.", "해충 방제 업체와 매달 방제하는 정기 계약을 맺었습니다.", ["wt_tested", "pc_contract"], { r: "물 검사 결과서와 방제 계약서를 함께 보관해 두면 현장 확인 때 바로 보여 줄 수 있습니다." }),
    C("**수돗물을 그대로** 쓰고 있습니다.", "해충 방제는 업체 없이 직원들이 직접 하고 있습니다.", ["wt_city", "pc_self"], { r: "수돗물도 검사를 요구받을 수 있으니 확인하고, 자체 방제 기록을 남겨 두세요." }),
    C("**지하수를 끌어다** 쓰고 있습니다.", "해충 방제를 어떻게 할지 계획은 아직 세우지 않았습니다.", ["wt_well", "pc_none"], { r: "지하수는 수질 검사가 꼭 필요할 수 있으니 검사부터 받고 방제 계획도 세우세요." }),
    C("**물 검사가 필요한지** 모르겠습니다.", "해충 방제 업체와 정기적으로 방제하는 계약을 맺어 두었습니다.", ["wt_unknown", "pc_contract"], { r: "생산용 물 검사 필요 여부를 먼저 확인하고, 방제 기록은 그대로 보관하세요." }),
    C("**물을 어디서 받는지** 정확히 모르겠습니다.", "해충 방제를 어떤 기준으로 해야 하는지도 모릅니다.", ["wt_source_unknown", "pc_unknown"], { r: "물 출처와 방제 기준을 함께 확인하면 현장 확인을 한 번에 준비할 수 있습니다." }),
  ] },
  K.timelineQuestion(p, "Q9", [
    "한 달은 시설 확인까지 빠듯하니 종사자 검진과 서류를 바로 시작하세요.",
    "공사가 끝나는 날을 기준으로 서류 제출 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 시설 기준을 미리 확인하고 공사를 진행하세요.",
    "생산 시작 시점을 정해야 공사와 허가 일정을 맞출 수 있습니다.",
    "허가 없이 생산 중이라면 제재를 받을 수 있으니 허가 신청을 바로 서두르세요.",
  ]),
  K.quoteQuestion(p, "Q10", "항목이 나뉘어 있으니 위생 허가, 제품 검사, 표시 검토가 각각 포함되는지 확인하세요."),
  K.submitQuestion(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "생산한 식품을 어디에 팔 예정이고, 판매 전에 따로 신고가 필요한지 알고 계신가요?", f: [`${p}_market`, `${p}_declare`], choices: [
    C("**베트남 안에서 직접** 판매합니다.", "판매 전에 제품 신고를 해야 하는지 이미 확인했습니다.", ["mk_domestic", "dc_known"], { r: "제품 신고가 필요한 품목이면 위생 허가와 함께 신고 서류도 준비하세요." }),
    C("**마트나 유통사를 통해** 판매합니다.", "유통사가 요구하는 서류가 따로 있는 것 같습니다.", ["mk_retail", "dc_partner"], { r: "유통사는 위생 증명서와 검사 결과서를 요구하는 경우가 많으니 미리 받아 두세요." }),
    C("**해외로 수출**하려고 합니다.", "수출할 나라가 요구하는 위생 기준을 아직 확인하지 못했습니다.", ["mk_export", "dc_unknown"], { r: "수출국이 요구하는 위생 증명이 따로 있을 수 있으니 수입국 기준부터 확인하세요." }),
    C("**온라인으로** 판매하려고 합니다.", "판매를 시작하기 전에 따로 신고가 필요한지 모르겠습니다.", ["mk_online", "dc_unknown"], { r: "온라인 판매도 제품 정보와 표시 기준을 지켜야 하니 판매 전 신고 여부를 확인하세요." }),
    C("**판매처를 아직** 정하지 못했습니다.", "판매 전 제품 신고가 무엇인지도 이번에 처음 들어 봤습니다.", ["mk_unsure", "dc_unknown"], { r: "판매처가 정해지면 필요한 신고와 서류가 정해지니 판매 계획부터 세우세요." }),
  ] },
  K.areaQuestion(p, "Q13", "식품 종류에 따라 보건·농업·산업무역 담당 기관 중 어디로 내는지가 달라지니 그것부터 확인하세요."),
];
labels.mk_domestic = "국내 직접 판매"; labels.mk_retail = "마트·유통사 판매"; labels.mk_export = "해외 수출"; labels.mk_online = "온라인 판매"; labels.mk_unsure = "판매처 미정";
labels.dc_known = "판매 전 신고 여부 확인"; labels.dc_partner = "유통사 요구 서류 있음"; labels.dc_unknown = "신고 필요 여부를 모름";
export const cardTitles = { Q1: "허가 종류와 식품", Q2: "사업자 등록", Q3: "위생시설과 동선", Q4: "종사자 검진과 교육" };
export const summaries = K.summariesFor(p, [
  "위생 허가 비용은 정부 비용 외에 시설 공사, 종사자 검진과 교육, 제품 검사, 대행료로 나뉩니다. 서류 목록을 받아 시간이 걸리는 검진과 검사부터 시작하세요.",
  "식품 생산 시설은 위생 조건을 갖춘 시설임을 확인받는 증명서가 기본이고, 신청서, 등록증, 시설 설명과 도면, 종사자 검진·교육 서류가 필요합니다. 식품 종류에 따라 담당 기관이 다릅니다.",
  "서류가 갖춰진 뒤 현장 확인을 거쳐 증명서가 나오며, 시설 공사가 끝나야 확인을 받을 수 있습니다. 공사 일정과 허가 일정을 함께 맞추세요.",
  "위생 허가는 식품 종류와 시설 규모, 이미 받은 인증에 따라 대상과 절차가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "견적은 위생 허가, 제품 검사, 표시 검토, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 시설과 종사자 서류의 날짜를 한 번 더 확인하세요", rules: [
  ...K.commonRiskRules(p),
  { id: "facility", clauses: [[`${p}_facility`, ["fac_partial", "fac_building", "fac_unknown"]]], sentence: "위생시설이 갖춰지지 않으면 현장 확인에서 보완 요구를 받을 수 있어 시설부터 마쳐야 합니다" },
  { id: "flow", clauses: [[`${p}_flow`, ["ln_mixed", "ln_shared", "ln_none"]]], sentence: "원료와 완제품 동선이 겹치면 위생 기준에 맞지 않을 수 있어 배치를 먼저 확인하세요" },
  { id: "staff", clauses: [[`${p}_staffHealth`, ["sh_not_yet", "sh_unknown"]]], sentence: "종사자의 건강검진과 위생 교육이 끝나야 신청할 수 있어 일정부터 잡아야 합니다" },
  { id: "water", clauses: [[`${p}_water`, ["wt_well"]]], sentence: "지하수를 쓰면 수질 검사가 필요할 수 있어 검사부터 받아야 합니다" },
] };
export const phase2Titles = { Q6: "신청 서류", Q7: "제품 검사와 표시", Q8: "생산용 물과 해충 방제", Q9: "허가 일정과 생산 시작", Q10: "견적과 비용", Q11: "국적과 제출 방식", Q12: "판매처와 신고", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "전문가 진행", clauses: [[`${p}_timeline`, ["tl_already", "tl_urgent"]], [`${p}_helpWanted`, ["help_full"]]], sentence: "이미 생산 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["식품 종류별 담당 기관 확인", "위생시설과 동선 점검", "종사자 검진과 위생 교육", "제품 검사와 표시", "제출 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "식품안전법 시행령 (제15/2018/NĐ-CP호): 식품 위생 조건 확인 증명서 대상과 예외(식품 안전 관리 인증을 받은 시설 등)", publisher: "베트남 정부", kind: "법령(해설 자료로 확인)", urls: ["https://thuvienphapluat.vn/hoi-dap-phap-luat/10-truong-hop-khong-can-cap-giay-chung-nhan-an-toan-thuc-pham-269611.html"], note: "조문 번호와 담당 기관 구분은 공식 원문 대조 필요" },
  { id: "2", name: "식품안전법 (제55/2010/QH12호)", publisher: "베트남 국회", kind: "법령(이차 자료로 확인)", urls: [], note: "조문 번호는 공식 원문 대조 필요" },
] } };
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: K.commonTier(p).full },
  { tier: "accompany", label: "작성과 제출 동행", clauses: K.commonTier(p).accompany },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { fac_done: "secured", fac_partial: "unsecured", fac_building: "unsecured", fac_outsourced: null, fac_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_facility` };
export const pageRule = { file: "src/app/register/hygiene/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
