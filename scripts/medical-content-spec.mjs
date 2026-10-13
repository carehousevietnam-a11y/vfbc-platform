// MEDICAL(의료기기 허가) content spec. 근거: 의료기기 관리 시행령 98/2021/NĐ-CP(07/2023, 04/2025 개정).
// 기존 판정(src/app/register/medical-device/page.tsx): 등록 확정 + 보관·유통시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
import * as V from "./register-voice-spec.mjs";
const { C } = K;
const p = "md";
export const labels = {
  ...K.commonLabels,
  ...V.voiceLabels,
  st_import: "의료기기 수입 판매", st_local_make: "베트남 생산 의료기기", st_trade: "의료기기 유통만", st_change: "등록 내용 변경", st_unsure: "어떤 절차인지 모름",
  cl_a: "가장 낮은 위험 등급(가)", cl_b: "낮은 위험 등급(나)", cl_c: "중간 이상 위험 등급(다)", cl_d: "가장 높은 위험 등급(라)", cl_unknown: "등급을 모름",
  wh_own: "자체 보관 창고", wh_3pl: "물류 위탁 창고", wh_planned: "창고 계약 예정", wh_none: "창고 없음", wh_unknown: "보관 시설 필요 여부를 모름",
  wc_controlled: "온도·습도 관리", wc_basic: "일반 보관", wc_cold: "냉장 보관 필요", wc_unknown: "보관 조건을 모름",
  qd_iso: "품질 경영 인증서 보유", qd_partial: "일부 품질 서류만 있음", qd_requested: "제조사에 요청 중", qd_none: "품질 서류 없음", qd_unknown: "필요한 서류를 모름",
  ma_loa: "제조사 위임장 보유", ma_pending: "위임장 요청 중", ma_none: "위임장 없음", ma_own: "자사 제품", ma_unknown: "위임장 필요 여부를 모름",
  cfs_legalized: "자유판매증명서 인증 완료", cfs_issued: "증명서 발급, 인증 전", cfs_requested: "증명서 요청 중", cfs_none: "증명서 없음", cfs_unknown: "증명서 필요 여부를 모름",
  ws_vn: "베트남 내 보증 거점 있음", ws_contract: "보증 업체와 계약", ws_none: "보증 거점 없음", ws_single_use: "일회용 제품이라 보증 불필요", ws_unknown: "보증 요건을 모름",
  cu_hospital: "병원 공급", cu_clinic: "의원·치과 공급", cu_pharmacy: "약국·매장 판매", cu_home: "개인 고객 판매", cu_unsure: "판매처 미정",
  tn_needed_tech: "기술 교육 필요", tn_simple: "사용법이 간단함", tn_unknown: "교육 필요 여부를 모름",
};
const cfg = {
  noun: "의료기기 등록 번호",
  openObj: "판매를",
  openTopic: "판매는",
  dateWord: "판매 시작 날짜",
  openNow: "이미 판매를 하고 있습니다.",
  fitout: "창고와 제품 준비가 끝나는 날에 맞춰",
  conflictWho: "제조사, 업체, 지인이",
  operatingD: "판매를 이미 시작했는데 등록이 아직 확인되지 않았습니다.",
  docsR: [
    "서류가 갖춰졌으니 제품명과 모델명이 서류마다 같은지만 확인하고 접수하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 등급 분류 결과와 기술 자료가 빠졌는지부터 확인하세요.",
    "위험 등급에 따라 신고와 등록 절차가 다르니 등급 분류부터 받으세요.",
    "제품의 위험 등급을 먼저 정하면 필요한 서류와 절차가 정해집니다.",
  ],
};
const tlR = [
    "한 달은 해외 서류 인증까지 빠듯하니 위임장과 증명서를 바로 요청하세요.",
    "제품이 들어오는 날을 기준으로 신고·등록 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 등급 분류부터 받아 서류를 하나씩 완성하세요.",
    "판매 시작 시점을 정해야 수입과 신고 일정을 맞출 수 있습니다.",
    "신고나 등록 없이 판매 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요.",
];
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 의료기기를 어떻게 다루시려고 하고, 지금 가장 막막한 점은 무엇인가요?", f: [`${p}_stage`, `${p}_class`], choices: [
    C("**거즈나 붕대 같은 소모품을 수입해서** 팔려고 합니다.", "위험이 가장 낮은 제품인데도 등록이 필요한지 모르겠습니다.", ["st_import","cl_a"], { card: "가장 낮은 등급 의료기기를 수입하려는 상황입니다" }),
    C("**혈압계 같은 일반 기기를 베트남에서 만들어** 팔려고 합니다.", "위험이 낮은 기기인데 어떤 절차를 밟아야 하는지 감이 안 잡힙니다.", ["st_local_make","cl_b"], { card: "낮은 등급의 국내 생산 기기를 팔려는 상황입니다" }),
    C("**초음파 진단기 같은 장비를 다른 회사에서 받아 유통만** 하려고 합니다.", "위험이 중간 이상인 장비라 절차가 더 복잡할까 걱정입니다.", ["st_trade","cl_c"], { card: "중간 이상 등급 장비를 유통하려는 상황입니다" }),
    C("**임플란트처럼 몸속에 넣는 제품을 이미 등록했는데** 내용을 바꿔야 합니다.", "가장 위험한 등급이라 등록 내용을 어떻게 바꿔야 하는지 모르겠습니다.", ["st_change","cl_d"], { card: "가장 높은 등급 장비의 등록 내용을 바꾸는 상황입니다" }),
    C("**어떤 절차가 필요한지조차** 모르겠습니다.", "우리 제품이 어느 위험 등급인지도 확인하지 못했습니다.", ["st_unsure","cl_unknown"], { card: "필요한 절차와 위험 등급부터 확인할 상황입니다" }),
  ] },
  V.registration(p, "Q2", cfg),
  { code: "Q3", stage: 1, prompt: "제품을 보관할 창고는 마련하셨고, 보관할 때 온도 같은 조건은 어떻게 관리하고 계신가요?", f: [`${p}_warehouse`, `${p}_storage`], choices: [
    C("**자체 보관 창고가 있습니다.**", "온도와 습도를 매일 기록하며 관리하고 있는데 이 기록을 등록 때 내야 하는지 궁금합니다.", ["wh_own","wc_controlled"], { card: "자체 창고에서 온도·습도를 관리하는 상황입니다" }),
    C("**물류 회사 창고에 맡기고 있습니다.**", "일반 상온 창고에서 다른 화물과 나누어 보관하는데 의료기기 기준에 맞는지 모르겠습니다.", ["wh_3pl","wc_basic"], { card: "물류 위탁 창고에 일반 보관하는 상황입니다" }),
    C("**창고를 곧 계약할 예정입니다.**", "냉장 보관이 필요한 제품이 있어 냉장 설비가 있는 창고를 찾고 있습니다.", ["wh_planned","wc_cold"], { card: "창고 계약 전이고 냉장 보관이 필요한 상황입니다" }),
    C("**창고 없이 사무실에 두고** 있습니다.", "의료기기를 어떤 조건으로 보관해야 하는지 모르겠습니다.", ["wh_none","wc_unknown"], { card: "창고 없이 보관 조건을 확인해야 하는 상황입니다" }),
    C("**창고가 꼭 필요한지** 모르겠습니다.", "지금은 보관 조건을 따로 관리하지 않고 일반적으로 두고 있습니다.", ["wh_unknown","wc_basic"], { card: "보관 시설 필요 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "제조사의 품질 서류는 받으셨고, 판매를 맡긴다는 위임장도 받으셨나요?", f: [`${p}_qualityDocs`, `${p}_authorization`], choices: [
    C("**품질 경영 인증서를 받아 두었습니다.**", "제조사로부터 판매를 맡긴다는 위임장도 가지고 있습니다.", ["qd_iso","ma_loa"], { card: "품질 인증서와 위임장을 모두 갖춘 상황입니다" }),
    C("**품질 서류를 일부만 가지고 있습니다.**", "제조사에 위임장을 보내 달라고 요청해 둔 상태입니다.", ["qd_partial","ma_pending"], { card: "품질 서류가 일부만 있고 위임장을 기다리는 상황입니다" }),
    C("**제조사에 서류를 요청하고 있습니다.**", "위임장은 아직 받지 못했고 받을 수 있을지도 모릅니다.", ["qd_requested","ma_none"], { card: "품질 서류와 위임장을 모두 기다리는 상황입니다" }),
    C("**우리 회사가 직접 만든 제품입니다.**", "그래서 위임장은 필요 없지만 품질 경영 인증서는 아직 없습니다.", ["qd_none","ma_own"], { card: "자사 제품이지만 품질 서류가 없는 상황입니다" }),
    C("**어떤 서류가 필요한지** 모르겠습니다.", "제조사 위임장이 필요한지도 아직 확인하지 못했습니다.", ["qd_unknown","ma_unknown"], { card: "필요한 품질 서류와 위임장 여부를 확인할 상황입니다" }),
  ] },
  V.feeling(p, "Q5", cfg),
  V.docs(p, "Q6", cfg),
  { code: "Q7", stage: 2, prompt: "수입 제품이면 자유판매증명서가 필요하다는데, 증명서와 베트남 안의 보증·수리 거점은 어떻게 되어 있나요?", f: [`${p}_cfs`, `${p}_warranty`], choices: [
    C("**증명서를 받아 영사 인증까지 마쳤습니다.**", "베트남 안에 제품 보증과 수리를 맡을 거점도 있습니다.", ["cfs_legalized","ws_vn"], { r: "증명서 유효 기간과 보증 거점 서류를 함께 준비하면 신청이 빨라집니다." }),
    C("**증명서는 받았지만 인증은 아직입니다.**", "보증과 수리는 베트남의 전문 업체와 계약했습니다.", ["cfs_issued","ws_contract"], { r: "영사 인증에 시간이 걸리니 바로 신청하고, 보증 계약서도 함께 준비하세요." }),
    C("**증명서를 제조사에 요청해 두었습니다.**", "베트남 안에 보증이나 수리 거점이 아직 없어서 걱정입니다.", ["cfs_requested","ws_none"], { r: "보증 거점이 없으면 신청이 어려울 수 있으니 보증 업체와 계약부터 검토하세요." }),
    C("**증명서가 없습니다.**", "한 번 쓰고 버리는 제품이라 보증이 필요 없다고 들었는데 맞는지 모르겠습니다.", ["cfs_none","ws_single_use"], { r: "수입 제품은 생산국 판매 증명이 필요한 경우가 많으니 제조사에 먼저 요청하세요." }),
    C("**증명서가 필요한지** 모르겠습니다.", "보증이나 수리 거점에 어떤 요건이 있는지도 모릅니다.", ["cfs_unknown","ws_unknown"], { r: "수입 여부와 제품 종류에 따라 요건이 정해지니 그 기준부터 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "제품은 주로 어디에 공급하실 예정이고, 쓰는 사람에게 사용법을 따로 가르쳐야 하는 제품인가요?", f: [`${p}_customer`, `${p}_training`], choices: [
    C("**병원에 공급**하려고 합니다.", "의료진이 사용법을 따로 교육받아야 하는 전문 장비입니다.", ["cu_hospital","tn_needed_tech"], { r: "병원 공급은 입찰 서류와 교육 계획을 함께 요구받는 경우가 많으니 미리 준비하세요." }),
    C("**의원이나 치과에 공급**하려고 합니다.", "사용법이 간단해서 따로 교육은 필요 없다고 생각합니다.", ["cu_clinic","tn_simple"], { r: "의원·치과 공급도 제품 등록 번호를 확인하니 판매 전에 등록을 마치세요." }),
    C("**약국이나 매장에서** 팔려고 합니다.", "누구나 쓰기 쉬운 가정용 제품 위주로 판매합니다.", ["cu_pharmacy","tn_simple"], { r: "매장 판매 제품은 베트남어 사용 설명과 표시가 필요하니 문안을 먼저 준비하세요." }),
    C("**개인 고객에게 직접** 팔려고 합니다.", "사용자 교육이 필요한지 아직 확인하지 못했습니다.", ["cu_home","tn_unknown"], { r: "개인 판매는 광고와 표시 기준이 중요하니 판매 문구를 먼저 점검하세요." }),
    C("**공급처를 아직** 정하지 못했습니다.", "의료진이 사용법을 배워야 하는 장비도 일부 있습니다.", ["cu_unsure","tn_needed_tech"], { r: "공급처가 정해지면 필요한 서류가 정해지니 판매 계획부터 세우세요." }),
  ] },
  V.timeline(p, "Q9", cfg, tlR),
  V.asked(p, "Q10"),
  V.submit(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "등록할 제품은 어디까지이고, 그 제품에서 사고가 나면 누가 어떻게 보고하는지 정해 두셨나요?", f: [`${p}_models`, `${p}_incident`], choices: [
    C("**모델 한두 개만** 등록하려고 합니다.", "이 모델에서 사고가 나면 바로 보고할 담당자를 정해 두었습니다.", ["mo_few","ir_ready"], { r: "모델이 적으면 서류를 한 번에 완성할 수 있고, 사고 보고 담당자를 서류에 적어 두세요." }),
    C("**모델 여러 개를 함께** 등록하려고 합니다.", "모델별 사고 보고는 제조사의 방식을 따르려고 합니다.", ["mo_several","ir_maker"], { r: "모델이 여러 개면 모델별 기술 자료를 정리하고, 베트남 보고 기준도 함께 확인하세요." }),
    C("**제품군 전체를** 들여오려고 합니다.", "제품군에서 사고가 나면 어떻게 보고해야 하는지 모르겠습니다.", ["mo_family","ir_unknown"], { r: "제품군 단위로 묶을 수 있는지 확인하고, 사고 보고 의무와 기한을 먼저 알아보세요." }),
    C("**부속품까지 함께** 등록해야 합니다.", "부속품을 포함한 제품의 사고 보고 담당자는 곧 정할 예정입니다.", ["mo_accessories","ir_planned"], { r: "부속품도 따로 등록이 필요한지 확인하고, 담당자를 정해 연락처를 남겨 두세요." }),
    C("**몇 개를 등록할지** 아직 모르겠습니다.", "등록한 뒤 사고 보고가 의무인지도 확인하지 못했습니다.", ["mo_unsure","ir_unknown"], { r: "판매할 모델 목록이 정해져야 등록 범위와 비용을 정할 수 있습니다." }),
  ] },
  V.area(p, "Q13", "낮은 등급은 지역 보건 담당 기관, 높은 등급은 보건부가 받는 경우가 많으니 등급부터 확인하세요."),
];
export const cardTitles = { Q1: "절차와 위험 등급", Q2: "사업자 등록", Q3: "창고와 보관 조건", Q4: "품질 서류와 위임장" };
export const summaries = V.summaries(p, [
  "의료기기는 위험 등급에 따라 낮은 등급은 기준 적용 신고, 높은 등급은 판매 등록이 필요하며, 품질 인증서, 위임장, 기술 자료, 수입 제품의 자유판매증명서가 기본입니다.",
  "낮은 등급 신고는 비교적 빠르지만 높은 등급 등록은 심사에 시간이 걸리고, 해외 서류 인증이 일정에 큰 영향을 줍니다. 등급과 인증부터 시작하세요.",
  "의료기기 해당 여부와 등급은 제품 용도와 위험도에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "의료기기 신고·등록 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다.",
  "의료기기 신고·등록 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 제품명과 모델명이 서류마다 같은지 확인하세요", rules: [
  ...V.riskRules(p),
  { id: "class", clauses: [[`${p}_class`, ["cl_c", "cl_d", "cl_unknown"]]], sentence: "위험 등급이 높거나 모르면 등록 심사가 길어질 수 있어 등급 분류부터 받아야 합니다" },
  { id: "warehouse", clauses: [[`${p}_warehouse`, ["wh_planned", "wh_none"]]], sentence: "보관 시설이 확보되지 않으면 판매 조건을 갖추기 어려워 창고부터 정해야 합니다" },
  { id: "auth", clauses: [[`${p}_authorization`, ["ma_none", "ma_unknown"]]], sentence: "제조사 위임장이 없으면 수입 의료기기를 신고할 수 없어 위임장부터 받아야 합니다" },
  { id: "warranty", clauses: [[`${p}_warranty`, ["ws_none", "ws_unknown"]]], sentence: "베트남 안의 보증 거점이 없으면 신청이 어려울 수 있어 보증 업체 계약을 검토하세요" },
] };
export const phase2Titles = { Q6: "신청 서류", Q7: "판매 증명과 보증 거점", Q8: "공급처와 사용자 교육", Q9: "일정과 판매 시작", Q10: "지금까지 받은 안내", Q11: "제출 방식", Q12: "등록 모델과 사고 보고", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "법인설립 확인", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다.", path: "/verify/company" },
  V.connectionPro(p, "높은 등급 제품이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요."),
];
export const afterResultGuide = ["위험 등급 분류", "품질 서류와 위임장", "판매 증명서 인증", "보관·보증 조건 확인", "신고·등록 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "의료기기 관리 시행령 (제98/2021/NĐ-CP호): 위험 등급별 기준 적용 신고와 판매 등록, 신청 조건(보증 거점 등)", publisher: "베트남 정부", kind: "보도 기준", urls: ["https://luatvietan.vn/luu-hanh-trang-thiet-bi-y-te-loai-ab.html"], note: "등급별 처리 기간과 조문 번호는 공식 원문 대조 필요" },
  { id: "2", name: "의료기기 관리 시행령 개정 (제07/2023/NĐ-CP호, 제04/2025/NĐ-CP호)", publisher: "베트남 정부", kind: "보도 기준", urls: ["https://vbpl.moj.gov.vn/TW/Lists/vbpq/Attachments/160120/07_2023_ND-CP_557403.doc", "https://caselaw.vn/van-ban-phap-luat/411561-nghi-dinh-so-04-2025-nd-cp-ngay-01-01-2025-cua-chinh-phu-sua-doi-nghi-dinh-98-2021-nd-cp-ve-quan-ly-thiet-bi-y-te-da-duoc-sua-doi-theo-nghi-dinh-07-2023-nd-cp"], note: "제07/2023호와 제04/2025호(2025.1.1 시행)로 개정된 사실은 확인함(이차 자료 기준). 2025년 개정 세부 내용은 원문 대조 필요" },
] } };
export const tierRules = V.tier(p);
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { wh_own: "secured", wh_3pl: "secured", wh_planned: "unsecured", wh_none: "unsecured", wh_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_warehouse` };
export const pageRule = { file: "src/app/register/medical-device/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
