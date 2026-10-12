// RESTAURANT(식당 허가) content spec. 근거: 식품안전법(55/2010/QH12), 시행령 15/2018/NĐ-CP, 소방법(55/2024/QH15)·시행령 105/2025.
// 기존 판정(src/app/register/restaurant/page.tsx computeRestaurantDiagnosis): 등록 확정 + 영업장 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
const { C } = K;
const p = "rs";
export const labels = {
  ...K.commonLabels,
  st_new: "새로 오픈 준비", st_renew: "운영 중 허가 갱신", st_takeover: "인수한 매장 명의 변경", st_add_alcohol: "주류 판매 추가", st_unsure: "어떤 허가인지 모름",
  vn_restaurant: "일반 식당", vn_cafe: "카페", vn_bar: "술집·바", vn_hotel: "호텔 안 식당", vn_delivery: "배달 전문 주방",
  prem_signed: "매장 임대 계약 완료", prem_owned: "본인·회사 소유 건물", prem_provisional: "매장 가계약", prem_candidate: "후보 매장만 있음", prem_undecided: "매장 미정",
  sz_small: "50석 이하 소형", sz_mid: "50석에서 100석", sz_large: "100석 넘는 대형", sz_multi: "2층 이상 매장", sz_unknown: "규모 미정",
  hf_ready: "위생·소방 시설 준비 완료", hf_building: "시설 공사 중", hf_not_yet: "시설 준비 전", hf_landlord: "건물주가 소방 담당", hf_unknown: "필요한 시설을 모름",
  kt_separated: "조리·세척·보관 구역 분리", kt_partial: "일부 구역만 분리", kt_open: "주방 구역 구분 없음", kt_shared: "다른 매장과 주방 공유", kt_unknown: "주방 기준을 모름",
  sh_done: "직원 건강검진 완료", sh_some: "일부 직원만 검진", sh_not_yet: "직원 검진 전", sh_no_staff: "아직 직원 없음", sh_unknown: "검진 필요 여부를 모름",
  ft_done: "위생 교육 수료", ft_planned: "위생 교육 예정", ft_none: "위생 교육 안 함", ft_unknown: "교육 필요 여부를 모름",
  al_none: "주류 판매 안 함", al_beer: "맥주·와인을 매장에서 판매", al_spirits: "도수 높은 술까지 판매", al_takeaway: "주류 포장 판매", al_unsure: "주류 판매 여부 미정",
  hr_day: "낮 영업 위주", hr_night: "밤늦게까지 영업", hr_24h: "24시간 영업", hr_unsure: "영업 시간 미정",
  ing_contract: "식재료 납품 계약 있음", ing_market: "시장에서 직접 구매", ing_import: "수입 식재료 사용", ing_mixed: "여러 곳에서 구매", ing_unknown: "식재료 증빙을 모름",
  ws_contract: "쓰레기·폐유 처리 계약", ws_building: "건물에서 함께 처리", ws_none: "처리 계약 없음", ws_unknown: "처리 방법을 모름",
};
export const questions = [
  { code: "Q1", stage: 1, prompt: "식당과 관련해 어떤 허가가 필요하고, 매장은 어떤 형태로 운영하실 예정인가요?", f: [`${p}_stage`, `${p}_venue`], choices: [
    C("**새로 매장을 열려고** 준비하고 있습니다.", "손님이 앉아서 식사하는 일반 식당으로 운영하려고 합니다.", ["st_new", "vn_restaurant"], { card: "새로 일반 식당을 열려고 준비하는 상황입니다" }),
    C("**운영 중인 매장의 허가를** 다시 받아야 합니다.", "음료와 간단한 디저트를 파는 카페로 운영하고 있습니다.", ["st_renew", "vn_cafe"], { card: "운영 중인 카페의 허가를 다시 받는 상황입니다" }),
    C("**다른 사람의 매장을 인수**했습니다.", "술을 주로 파는 술집이나 바 형태로 운영하려고 합니다.", ["st_takeover", "vn_bar"], { card: "매장을 인수해 술집 형태로 운영하려는 상황입니다" }),
    C("**주류 판매를 추가**하려고 합니다.", "호텔 안에 있는 식당으로 투숙객과 외부 손님을 함께 받습니다.", ["st_add_alcohol", "vn_hotel"], { card: "호텔 안 식당에 주류 판매를 더하려는 상황입니다" }),
    C("**어떤 허가가 필요한지** 모르겠습니다.", "매장 없이 배달만 하는 주방으로 운영하려고 합니다.", ["st_unsure", "vn_delivery"], { card: "배달 전문 주방에 필요한 허가부터 확인할 상황입니다" }),
  ] },
  K.registrationQuestion(p, "Q2", "사업자 등록은 어디까지 진행되었고, 누구 이름으로 허가를 받으실 예정인가요?"),
  { code: "Q3", stage: 1, prompt: "영업할 매장은 확보되었고, 매장의 규모는 어느 정도인가요?", f: [`${p}_premises`, `${p}_size`], choices: [
    C("**매장 임대 계약을 마쳤습니다.**", "손님 좌석이 50석 이하인 작은 규모의 매장으로 운영합니다.", ["prem_signed", "sz_small"], { card: "매장 계약을 마친 50석 이하 매장인 상황입니다" }),
    C("**본인이나 회사 소유의 건물**입니다.", "좌석이 50석에서 100석 정도 되는 중간 규모입니다.", ["prem_owned", "sz_mid"], { card: "소유 건물에서 중간 규모로 운영하는 상황입니다" }),
    C("**가계약만 해 둔 상태**입니다.", "손님 좌석이 100석을 넘는 큰 규모의 매장으로 운영합니다.", ["prem_provisional", "sz_large"], { card: "대형 매장을 가계약한 상황입니다" }),
    C("**후보 매장만** 알아보고 있습니다.", "2층 이상으로 된 넓은 매장을 생각하고 있습니다.", ["prem_candidate", "sz_multi"], { card: "2층 이상 후보 매장만 있는 상황입니다" }),
    C("**매장을 아직** 정하지 못했습니다.", "매장의 좌석 수와 규모도 아직 정해지지 않았습니다.", ["prem_undecided", "sz_unknown"], { card: "매장과 규모부터 정해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "위생·소방 시설은 어디까지 준비되었고, 주방은 구역이 나뉘어 있나요?", f: [`${p}_hygieneFire`, `${p}_kitchen`], choices: [
    C("**위생·소방 시설 준비를** 마쳤습니다.", "조리, 세척, 식재료 보관 구역이 서로 나뉘어 있습니다.", ["hf_ready", "kt_separated"], { card: "위생·소방 시설과 주방 구역을 갖춘 상황입니다" }),
    C("**시설 공사를 하고** 있습니다.", "주방의 일부 구역만 나누어 두었고 나머지는 공사 중입니다.", ["hf_building", "kt_partial"], { card: "시설 공사 중이고 주방 구역이 일부만 나뉜 상황입니다" }),
    C("**시설 준비를 아직** 시작하지 않았습니다.", "주방이 하나로 트여 있어서 구역 구분이 없습니다.", ["hf_not_yet", "kt_open"], { card: "시설 준비 전이고 주방 구역 구분이 없는 상황입니다" }),
    C("**건물주가 소방을** 맡는다고 들었습니다.", "같은 건물의 다른 매장과 주방을 함께 쓰고 있습니다.", ["hf_landlord", "kt_shared"], { card: "소방은 건물주 담당이고 주방을 함께 쓰는 상황입니다" }),
    C("**어떤 시설이 필요한지** 모르겠습니다.", "주방을 어떤 기준으로 나누어야 하는지도 잘 모릅니다.", ["hf_unknown", "kt_unknown"], { card: "필요한 시설과 주방 기준을 확인해야 하는 상황입니다" }),
  ] },
  K.concernQuestion(p, "Q5", "**우리 매장이 허가 대상인지** 모르겠습니다."),
  K.docsQuestion(p, "Q6", "**신청서, 사업자 등록증, 임대차 계약서, 시설 도면을 모두** 준비했습니다.", [
    "서류가 갖춰졌으니 도면의 구역 표시와 실제 매장이 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 시설 도면과 직원 서류가 빠졌는지부터 확인하세요.",
    "식당 위생 허가에 필요한 기본 서류(신청서, 등록증, 시설 설명, 직원 검진·교육)를 먼저 받으세요.",
    "매장 규모와 판매 품목에 따라 서류가 달라지니 그 기준부터 확인하세요.",
  ]),
  { code: "Q7", stage: 2, prompt: "주방 직원의 건강검진은 마쳤고, 식품 위생 교육은 받았나요?", f: [`${p}_staffHealth`, `${p}_foodTraining`], choices: [
    C("**직원 모두 건강검진을** 마쳤습니다.", "식품 위생 교육도 받아서 수료 확인서를 가지고 있습니다.", ["sh_done", "ft_done"], { r: "검진 결과서와 교육 확인서의 날짜가 유효한지만 확인해 함께 제출하세요." }),
    C("**일부 직원만 건강검진을** 받았습니다.", "식품 위생 교육은 다음 달에 받을 예정입니다.", ["sh_some", "ft_planned"], { r: "남은 직원 검진과 위생 교육 날짜를 정해 신청 전에 모두 마치도록 일정을 잡으세요." }),
    C("**직원 건강검진을 아직** 받지 않았습니다.", "식품 위생 교육도 아직 받지 않은 상태입니다.", ["sh_not_yet", "ft_none"], { r: "주방 직원은 건강검진과 위생 교육이 필요하니 가장 먼저 일정을 잡으세요." }),
    C("**아직 직원을 뽑지** 않았습니다.", "직원을 뽑은 뒤에 위생 교육을 받게 할 생각입니다.", ["sh_no_staff", "ft_planned"], { r: "채용 직후 검진과 교육을 받도록 채용 일정과 허가 일정을 함께 맞추세요." }),
    C("**건강검진이 필요한지** 모르겠습니다.", "위생 교육을 받아야 하는지도 확인하지 못했습니다.", ["sh_unknown", "ft_unknown"], { r: "음식을 다루는 직원은 검진과 교육 대상이 되는 경우가 많으니 필요한 범위를 먼저 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "매장에서 술을 판매하실 예정이고, 영업 시간은 주로 언제인가요?", f: [`${p}_alcohol`, `${p}_hours`], choices: [
    C("**술은 판매하지** 않습니다.", "점심과 낮 시간 위주로 영업하고 저녁 늦게는 문을 닫습니다.", ["al_none", "hr_day"], { r: "주류를 팔지 않으면 주류 판매 등록은 필요하지 않으니 위생·소방에 집중하세요." }),
    C("**맥주나 와인을 매장에서** 판매하려고 합니다.", "저녁부터 밤늦게까지 영업할 예정입니다.", ["al_beer", "hr_night"], { r: "매장에서 술을 팔면 주류 판매 관련 등록이 필요할 수 있으니 위생 허가와 함께 준비하세요." }),
    C("**도수가 높은 술까지** 판매하려고 합니다.", "24시간 문을 열고 영업하는 것을 생각하고 있습니다.", ["al_spirits", "hr_24h"], { r: "도수가 높은 술과 심야 영업은 조건이 더 까다로울 수 있으니 먼저 가능 여부를 확인하세요." }),
    C("**술을 포장해서 파는 것**도 생각하고 있습니다.", "낮 시간 위주로 영업하지만 주말에는 늦게까지 엽니다.", ["al_takeaway", "hr_day"], { r: "포장 판매는 매장 내 판매와 다른 등록이 필요할 수 있으니 판매 방식을 먼저 정하세요." }),
    C("**술을 팔지 아직** 정하지 못했습니다.", "매장의 영업 시간도 아직 정해지지 않은 상태입니다.", ["al_unsure", "hr_unsure"], { r: "주류 판매 여부에 따라 필요한 등록이 달라지니 메뉴 구성을 먼저 정하세요." }),
  ] },
  K.timelineQuestion(p, "Q9", [
    "한 달은 시설 점검까지 빠듯하니 서류와 직원 검진을 바로 시작하세요.",
    "공사가 끝나는 날을 기준으로 서류 제출 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 시설 기준을 미리 확인하고 공사를 진행하세요.",
    "오픈 날짜를 정해야 공사와 허가 일정을 맞출 수 있습니다.",
    "허가 없이 영업 중이라면 제재를 받을 수 있으니 허가 신청을 바로 서두르세요.",
  ]),
  K.quoteQuestion(p, "Q10", "항목이 나뉘어 있으니 위생 허가, 소방, 주류 판매 등록이 각각 포함되는지 확인하세요."),
  K.submitQuestion(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "식재료는 어디서 들여오고, 음식물 쓰레기와 폐유는 어떻게 처리하실 예정인가요?", f: [`${p}_ingredients`, `${p}_waste`], choices: [
    C("**식재료 납품 계약**을 맺은 곳이 있습니다.", "쓰레기와 폐유를 처리하는 업체와도 계약을 맺었습니다.", ["ing_contract", "ws_contract"], { r: "납품 계약서와 처리 계약서를 함께 보관해 두면 점검 때 바로 보여 줄 수 있습니다." }),
    C("**시장에서 직접** 사 오려고 합니다.", "건물에서 쓰레기를 함께 처리해 주는 것으로 알고 있습니다.", ["ing_market", "ws_building"], { r: "직접 구매하면 구입 영수증을 모아 두고, 건물 처리 방식이 매장 폐유도 포함하는지 확인하세요." }),
    C("**수입 식재료를** 많이 쓸 예정입니다.", "쓰레기와 폐유 처리 계약은 아직 맺지 않았습니다.", ["ing_import", "ws_none"], { r: "수입 식재료는 수입 통관과 표시 서류를 받아 두고, 폐유 처리 업체도 미리 정하세요." }),
    C("**여러 곳에서 나누어** 사 오려고 합니다.", "음식물 쓰레기를 어떻게 처리해야 하는지 모르겠습니다.", ["ing_mixed", "ws_unknown"], { r: "구매처마다 영수증이나 계약서를 모아 두고, 지역의 쓰레기 처리 방법을 확인하세요." }),
    C("**식재료 증빙이 필요한지** 모르겠습니다.", "쓰레기 처리 계약도 아직 생각해 보지 않았습니다.", ["ing_unknown", "ws_none"], { r: "식재료 출처를 보여 줄 서류가 요구될 수 있으니 구매 방식부터 정하세요." }),
  ] },
  K.areaQuestion(p, "Q13", "식당 위생 허가는 지역의 보건·식품 안전 담당 기관이 받는 경우가 많으니 그곳부터 확인하세요."),
];
export const cardTitles = { Q1: "허가 종류와 매장 형태", Q2: "사업자 등록", Q3: "매장과 규모", Q4: "위생·소방 시설" };
export const summaries = K.summariesFor(p, [
  "식당 허가 비용은 정부 비용 외에 시설 공사, 직원 검진과 교육, 대행료로 나뉩니다. 서류 목록을 받아 시간이 걸리는 직원 검진부터 시작하세요.",
  "식당은 식품 위생 조건을 갖춘 시설임을 확인받는 증명서가 기본이고, 신청서, 사업자 등록증, 시설 설명, 직원 검진·교육 서류가 필요합니다. 호텔 안 식당 등 일부는 예외가 있습니다.",
  "서류가 갖춰진 뒤 현장 확인을 거쳐 허가가 나오며, 시설 공사가 끝나야 확인을 받을 수 있습니다. 공사 일정과 허가 일정을 함께 맞추세요.",
  "식당은 매장 형태와 규모, 주류 판매 여부에 따라 필요한 허가가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "견적은 위생 허가, 소방, 주류 판매 등록, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다.",
]);
export const risks = {
  max: 4,
  fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 시설과 직원 서류의 날짜를 한 번 더 확인하세요",
  rules: [
    ...K.commonRiskRules(p),
    { id: "premises", clauses: [[`${p}_premises`, ["prem_candidate", "prem_undecided"]]], sentence: "매장이 확보되지 않으면 시설 확인을 받을 수 없어 매장 계약부터 마쳐야 합니다" },
    { id: "facility", clauses: [[`${p}_hygieneFire`, ["hf_not_yet", "hf_unknown"]]], sentence: "위생·소방 시설이 준비되지 않으면 현장 확인에서 보완 요구를 받을 수 있습니다" },
    { id: "kitchen", clauses: [[`${p}_kitchen`, ["kt_open", "kt_shared"]]], sentence: "주방 구역이 나뉘지 않았거나 공유하면 위생 기준에 맞지 않을 수 있어 배치를 먼저 확인하세요" },
    { id: "staff", clauses: [[`${p}_staffHealth`, ["sh_not_yet", "sh_unknown"]]], sentence: "주방 직원의 건강검진과 위생 교육이 끝나야 신청할 수 있어 일정부터 잡아야 합니다" },
    { id: "alcohol", clauses: [[`${p}_alcohol`, ["al_spirits", "al_takeaway"]]], sentence: "주류 판매 방식에 따라 별도 등록이 필요할 수 있어 판매 방식을 먼저 정해야 합니다" },
  ],
};
export const phase2Titles = { Q6: "신청 서류", Q7: "직원 검진과 위생 교육", Q8: "주류 판매와 영업 시간", Q9: "허가 일정과 오픈", Q10: "견적과 비용", Q11: "국적과 제출 방식", Q12: "식재료와 쓰레기 처리", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  { name: "전문가 진행", clauses: [[`${p}_timeline`, ["tl_already", "tl_urgent"]], [`${p}_helpWanted`, ["help_full"]]], sentence: "이미 영업 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["매장 계약 확인", "위생·소방 시설 점검", "직원 검진과 위생 교육", "주류 판매 여부 결정", "제출 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "식품안전법 시행령 (제15/2018/NĐ-CP호): 식품 위생 조건 확인 증명서 대상과 예외(호텔 안 식당, 노점 등은 증명서 대신 조건 준수)", publisher: "베트남 정부", kind: "법령(해설 자료로 확인)", urls: ["https://thuvienphapluat.vn/hoi-dap-phap-luat/10-truong-hop-khong-can-cap-giay-chung-nhan-an-toan-thuc-pham-269611.html"], note: "조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호)", publisher: "베트남 국회 / 정부", kind: "법령(해설 자료로 확인)", urls: ["https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html"], note: "매장 규모별 소방 대상은 원문 대조 필요" },
] } };
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: K.commonTier(p).full },
  { tier: "accompany", label: "작성과 제출 동행", clauses: K.commonTier(p).accompany },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { prem_signed: "secured", prem_owned: "secured", prem_provisional: null, prem_candidate: "unsecured", prem_undecided: "unsecured" },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_premises` };
export const pageRule = { file: "src/app/register/restaurant/page.tsx", line: 'registrationStatus === "confirmed" && premisesStatus === "secured" ? "possible" : "conditional";' };
