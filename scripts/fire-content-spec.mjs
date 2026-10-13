// FIRE(소방 허가) content spec. 근거: 소방·구조법(55/2024/QH15), 시행령 105/2025/NĐ-CP, 정부 결의 66.18/2026(2026.7.1 준공 검사 절차 폐지 보도).
// 기존 판정(src/app/register/fire-safety/page.tsx): 등록 확정 + 소방시설 확보 → 가능, 아니면 조건부. 판정은 바꾸지 않는다.
import * as K from "./register-common-spec.mjs";
import * as V from "./register-voice-spec.mjs";
const { C } = K;
const p = "fs";
export const labels = {
  ...K.commonLabels,
  ...V.voiceLabels,
  uf_customer: "손님이 오가는 매장의 소방 절차 확인", uf_fitout: "임대 공간 내부 공사 기준 확인", uf_inspection: "소방 점검 대비 확인", uf_change_use: "용도 변경 소방 절차 확인", uf_which: "필요한 소방 절차 종류 확인",
  bt_restaurant: "식당·카페", bt_office: "사무실", bt_factory: "공장·창고", bt_hotel: "숙박 시설", bt_retail: "매장·쇼룸",
  fire_installed: "소방시설 설치 완료", fire_building_has: "건물 공용 소방시설만 있음", fire_partial: "일부 소방시설만 설치", fire_none: "소방시설 설치 전", fire_unknown: "필요한 소방시설을 모름",
  ds_appraised: "소방 설계 검토 받음", ds_designing: "설계 진행 중", ds_not_needed: "설계 검토 대상 아님", ds_none: "설계 검토 안 받음", ds_unknown: "설계 검토 필요 여부를 모름",
  mg_appointed: "소방 안전 담당자 지정", mg_planned: "담당자 지정 예정", mg_none: "담당자 없음", mg_unknown: "담당자 필요 여부를 모름",
  pl_ready: "소방 계획서·대피 계획 준비", pl_draft: "계획서 초안만 있음", pl_none: "계획서 없음", pl_unknown: "계획서 필요 여부를 모름", pl_building: "건물 관리 회사 계획서 사용",
  tr_done: "직원 소방 교육 완료", tr_planned: "소방 교육 예정", tr_none: "소방 교육 안 함", tr_unknown: "교육 필요 여부를 모름",
  dr_done: "대피 훈련 실시", dr_planned: "대피 훈련 예정", dr_none: "대피 훈련 안 함", dr_unknown: "훈련 필요 여부를 모름",
  ck_recent: "최근 소방 점검 받음", ck_never: "점검 받은 적 없음", ck_failed: "점검에서 지적받음", ck_unknown: "점검 이력을 모름", ck_building: "건물 전체 점검에 포함", fx_none: "지적 사항 없음", fx_open: "지적 사항 미조치", fx_unknown: "우리 공간 지적 여부 미확인", fx_prepare: "첫 점검 준비 확인", fx_ask: "이전 점검 기록 확인",
  ow_landlord: "건물주가 소방 담당", ow_tenant: "임차인이 소방 담당", ow_shared: "건물주와 나누어 담당", ow_unknown: "담당 구분을 모름",
};
const cfg = {
  noun: "소방 승인",
  openObj: "운영을",
  openTopic: "운영은",
  dateWord: "오픈 날짜",
  openNow: "이미 운영을 하고 있습니다.",
  operatingD: "운영을 이미 시작했는데 소방 확인을 아직 받지 못했습니다.",
  docsR: [
    "서류가 갖춰졌으니 도면의 소방시설 위치와 실제 설치 위치가 같은지만 확인하세요.",
    "남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요.",
    "준비한 서류 목록을 만든 뒤 소방시설 목록과 설계 서류가 빠졌는지부터 확인하세요.",
    "건물 용도와 규모별로 필요한 소방 서류가 다르니 그 기준의 목록부터 받으세요.",
    "건물 용도와 면적, 층수를 먼저 정리하면 필요한 소방 서류가 정해집니다.",
  ],
};
const tlR = [
    "한 달은 공사와 점검까지 빠듯하니 소방시설 설치와 서류를 바로 시작하세요.",
    "공사가 끝나는 날을 기준으로 소방 점검과 서류 일정을 거꾸로 계산해 두세요.",
    "시간 여유가 있으니 설계 단계에서 소방 기준을 먼저 확인하고 공사를 진행하세요.",
    "운영 시작 시점을 정해야 공사와 소방 일정을 맞출 수 있습니다.",
    "소방 요건을 갖추지 않고 운영 중이라면 운영 중지 위험이 있으니 바로 점검하세요.",
];
export const questions = [
  { code: "Q1", stage: 1, prompt: "소방을 준비하는 건물은 어떤 용도로 쓰이고, 가장 막막한 부분은 어디인가요?", f: [`${p}_buildingUse`, `${p}_useFocus`], choices: [
    C("**식당이나 카페를** 열려는 건물입니다.", "손님이 오가는 곳이라 소방시설과 절차를 뭘 해야 하는지 감이 안 잡힙니다.", ["bt_restaurant","uf_customer"], { card: "식당·카페에 필요한 소방시설과 절차를 확인하려는 상황입니다" }),
    C("**사무실로 빌린 공간입니다.**", "내부 공사를 하면서 건물 소방시설과 어디까지 맞춰야 하는지 모르겠습니다.", ["bt_office","uf_fitout"], { card: "사무실 내부 공사의 소방 기준을 확인하려는 상황입니다" }),
    C("**공장이나 창고입니다.**", "물건을 만들고 보관하는 곳이라 소방 점검이 나오면 뭘 준비해야 하는지 몰라서 불안합니다.", ["bt_factory","uf_inspection"], { card: "공장·창고의 소방 점검 대비를 확인하려는 상황입니다" }),
    C("**다른 용도의 건물을 숙박 시설로** 바꾸려고 합니다.", "용도가 바뀌면 소방 절차도 달라진다는데 어떻게 달라지는지 모르겠습니다.", ["bt_hotel","uf_change_use"], { card: "숙박 시설로 바꿀 때의 소방 절차를 확인하려는 상황입니다" }),
    C("**제품을 파는 매장이나 쇼룸입니다.**", "진열해 파는 공간에 어떤 소방 절차가 필요한지부터 모르겠습니다.", ["bt_retail","uf_which"], { card: "매장·쇼룸에 필요한 소방 절차의 종류를 확인하려는 상황입니다" }),
  ] },
  V.registration(p, "Q2", cfg),
  { code: "Q3", stage: 1, prompt: "소화기나 경보 같은 소방시설은 어디까지 갖추셨고, 공사 전에 소방 도면 검토는 받으셨나요?", f: [`${p}_facility`, `${p}_design`], choices: [
    C("**소방시설은 다 설치했습니다.**", "공사 전에 소방 도면 검토를 받아 확인서를 가지고 있습니다.", ["fire_installed","ds_appraised"], { card: "소방시설을 설치했고 설계 검토를 받은 상황입니다" }),
    C("**건물 공용 소방시설만 있습니다.**", "우리 공간만의 소방 도면은 지금 만드는 중인데 이대로 되는지 불안합니다.", ["fire_building_has","ds_designing"], { card: "공용 소방시설만 있고 설계가 진행 중인 상황입니다" }),
    C("**일부만 설치했습니다.**", "규모가 작아서 도면 검토는 안 받아도 된다고 들었는데 맞는지 모르겠습니다.", ["fire_partial","ds_not_needed"], { card: "일부 시설만 있고 설계 검토 대상이 아닌 상황입니다" }),
    C("**아직 설치하지 못했습니다.**", "도면 검토도 받지 않은 채 공사를 시작해서 문제가 되지 않을지 걱정됩니다.", ["fire_none","ds_none"], { card: "소방시설과 설계 검토가 모두 남은 상황입니다" }),
    C("**뭐가 필요한지** 모르겠습니다.", "소방 도면 검토를 받아야 하는 건물인지도 아무도 알려 주지 않았습니다.", ["fire_unknown","ds_unknown"], { card: "필요한 시설과 설계 검토 대상 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "소방을 책임질 담당자는 정하셨고, 불이 났을 때의 대피 계획 같은 건 준비하셨나요?", f: [`${p}_manager`, `${p}_plan`], choices: [
    C("**소방 담당자를 정했습니다.**", "그분이 소방 계획서와 대피 계획도 함께 만들어 두었습니다.", ["mg_appointed","pl_ready"], { card: "담당자를 정하고 소방 계획서를 갖춘 상황입니다" }),
    C("**담당자를 곧 정할 예정입니다.**", "소방 계획서는 초안만 만들어 두었고 담당자가 정해지면 확정하려고 합니다.", ["mg_planned","pl_draft"], { card: "담당자 지정 전이고 계획서 초안만 있는 상황입니다" }),
    C("**소방 담당자가 따로 없습니다.**", "그래서 소방 계획서나 대피 계획은 만들어 본 적이 없습니다.", ["mg_none","pl_none"], { card: "담당자와 소방 계획서가 모두 없는 상황입니다" }),
    C("**담당자가 꼭 필요한지** 모르겠습니다.", "건물 관리 회사가 만든 소방 계획서가 있는데 우리 공간에도 써도 되는지 궁금합니다.", ["mg_unknown","pl_building"], { card: "담당자 필요 여부와 건물 계획서의 적용 범위를 확인할 상황입니다" }),
    C("**담당자는 정했는데 교육은 못 받았습니다.**", "교육 전이라 소방 계획서가 꼭 필요한지도 아직 확인하지 못했습니다.", ["mg_untrained","pl_unknown"], { card: "담당자는 있지만 교육과 계획서가 남은 상황입니다" }),
  ] },
  V.feeling(p, "Q5", cfg),
  V.docs(p, "Q6", cfg),
  { code: "Q7", stage: 2, prompt: "직원들은 소방 교육을 받았고, 불이 났을 때의 대피 훈련은 해 보셨나요?", f: [`${p}_training`, `${p}_drill`], choices: [
    C("**직원 소방 교육은 마쳤습니다.**", "대피 훈련도 실제로 한 번 해 보고 기록을 남겼습니다.", ["tr_done","dr_done"], { r: "교육과 훈련 기록을 날짜별로 보관해 두면 점검 때 바로 보여 줄 수 있습니다." }),
    C("**소방 교육은 받을 예정입니다.**", "대피 훈련은 교육이 끝난 뒤에 직원들과 함께 해 볼 계획인데 일정은 못 잡았습니다.", ["tr_planned","dr_planned"], { r: "교육과 훈련 날짜를 정해 두고, 끝나면 참석자 기록을 남기세요." }),
    C("**소방 교육은 받은 적이 없습니다.**", "대피 훈련도 아직 한 번도 해 보지 않았습니다.", ["tr_none","dr_none"], { r: "직원이 많거나 손님이 오가는 시설은 교육과 훈련이 필요할 수 있으니 먼저 확인하세요." }),
    C("**교육이 필요한지** 몰랐습니다.", "대피 훈련을 해야 하는 시설인지도 확인하지 못했습니다.", ["tr_unknown","dr_unknown"], { r: "시설 용도와 인원에 따라 교육·훈련 대상이 정해지니 그 기준부터 확인하세요." }),
    C("**일부 직원만 교육을 받았습니다.**", "건물 전체 대피 훈련에 참여해 본 적은 있습니다.", ["tr_partial","dr_done"], { r: "남은 직원의 교육 일정을 잡고, 건물 훈련 참여 기록을 함께 보관하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "최근에 소방 점검을 받아 보셨고, 점검에서 고치라고 한 부분은 어떻게 되었나요?", f: [`${p}_inspection`, `${p}_fixStatus`], choices: [
    C("**최근에 소방 점검을 받았습니다.**", "지적받은 내용이 없어서 고칠 점은 없었는데 다음 점검 때 서류가 더 필요한지 궁금합니다.", ["ck_recent","fx_none"], { r: "점검 결과서와 기록을 보관해 두면 다음 점검과 서류 제출 때 바로 쓸 수 있습니다." }),
    C("**점검에서 지적을 받았습니다.**", "아직 고치지 못했는데 다시 점검받기 전에 어떻게 해야 할지 막막합니다.", ["ck_failed","fx_open"], { r: "지적 사항을 먼저 고치고 고친 기록을 남긴 뒤 다시 점검을 받을 수 있는지 확인하세요." }),
    C("**건물 전체 점검 때 같이 받았습니다.**", "우리 공간만 따로 지적받은 내용이 있는지는 확인하지 못했습니다.", ["ck_building","fx_unknown"], { r: "건물 점검 결과서에 우리 공간 내용이 있는지 건물주에게 받아 확인하세요." }),
    C("**점검을 받은 적이 없습니다.**", "처음 받기 전에 어떤 시설과 서류를 맞춰야 하는지 알고 싶습니다.", ["ck_never","fx_prepare"], { r: "첫 점검 전에 소방시설 작동과 계획서, 교육 기록을 먼저 맞추세요." }),
    C("**점검 이력을 모르겠습니다.**", "예전 점검 기록이 남아 있는지 건물주에게 물어봐야 하는 상황입니다.", ["ck_unknown","fx_ask"], { r: "건물주나 관리 회사에 이전 점검 기록이 있는지 먼저 물어보세요." }),
  ] },
  V.timeline(p, "Q9", cfg, tlR),
  V.asked(p, "Q10"),
  V.submit(p, "Q11"),
  { code: "Q12", stage: 2, prompt: "소방 책임은 건물주와 어떻게 나누기로 했고, 그 내용이 임대 계약서에 있는지 확인해 보셨나요?", f: [`${p}_duty`, `${p}_leaseTerms`], choices: [
    C("**건물주가 소방을 다 맡기로 했습니다.**", "계약서에도 그렇게 적혀 있는 걸 확인했습니다.", ["ow_landlord","ct_written"], { r: "건물주 담당이라도 우리 공간 안의 시설과 교육은 직접 챙겨야 하는지 확인하세요." }),
    C("**우리가 소방을 맡기로 했습니다.**", "계약서를 보니 소방 책임에 대한 내용이 따로 없어서 불안합니다.", ["ow_tenant","ct_missing"], { r: "말로 정한 책임은 나중에 다툼이 생길 수 있으니 계약서에 소방 책임을 적어 두세요." }),
    C("**건물주와 나누어 맡기로 했습니다.**", "어느 부분을 누가 맡는지 문서로 정리해 두었습니다.", ["ow_shared","ct_written"], { r: "나누어 맡는 부분을 도면에 표시해 두면 점검 때 설명하기 쉽습니다." }),
    C("**누가 맡는지 정하지 않았습니다.**", "계약서가 베트남어라 소방 책임이 어떻게 적혀 있는지 제가 확인하지 못했습니다.", ["ow_unknown","ct_unknown"], { r: "계약 전에 소방 책임을 정하지 않으면 비용이 늘 수 있으니 건물주와 먼저 정하세요." }),
    C("**제가 소유한 건물이라** 직접 맡습니다.", "남에게 빌린 건물이 아니라서 따로 계약서가 필요하지 않습니다.", ["ow_self","ct_na"], { r: "소유 건물이면 소방 책임이 모두 소유자에게 있으니 시설과 서류를 직접 관리하세요." }),
  ] },
  V.area(p, "Q13", "소방 업무는 지역 공안의 소방 담당 부서가 맡는 경우가 많으니 그곳부터 확인하세요."),
];
export const cardTitles = { Q1: "건물 용도와 확인할 점", Q2: "사업자 등록", Q3: "소방시설과 설계 검토", Q4: "담당자와 소방 계획" };
export const summaries = V.summaries(p, [
  "소방 서류는 건물 용도와 면적, 층수에 따라 달라지며, 소방시설 목록과 도면, 소방 계획서가 기본입니다. 2026.7.1부터 일부 절차가 바뀌었다는 보도가 있어 시점 기준 확인이 필요합니다.",
  "설계 검토 대상이라면 공사 전에 검토를 받아야 하고, 공사가 끝난 뒤 시설 점검이 이어집니다. 공사 일정과 소방 일정을 함께 맞추세요.",
  "소방 절차 대상은 건물 용도와 규모, 손님 수에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  "소방 절차 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다.",
  "소방 절차 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다.",
]);
export const risks = { max: 4, fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 운영 전에 소방시설 작동과 서류를 한 번 더 확인하세요", rules: [
  ...V.riskRules(p),
  { id: "facility", clauses: [[`${p}_facility`, ["fire_partial", "fire_none", "fire_unknown"]]], sentence: "소방시설이 갖춰지지 않으면 점검에서 운영 중지 요구를 받을 수 있어 시설부터 갖춰야 합니다" },
  { id: "design", clauses: [[`${p}_design`, ["ds_none", "ds_unknown"]]], sentence: "설계 검토 대상인데 검토 없이 공사하면 다시 고쳐야 할 수 있어 대상 여부부터 확인하세요" },
  { id: "plan", clauses: [[`${p}_plan`, ["pl_none", "pl_unknown"]]], sentence: "소방 계획서와 대피 계획이 없으면 점검에서 지적받을 수 있어 먼저 만들어 두세요" },
  { id: "failed", clauses: [[`${p}_inspection`, ["ck_failed"]]], sentence: "이전 점검에서 지적받은 사항은 고친 기록이 있어야 하니 먼저 정리하세요" },
] };
export const phase2Titles = { Q6: "신청 서류", Q7: "소방 교육과 대피 훈련", Q8: "소방 점검과 지적 사항", Q9: "일정과 운영 시작", Q10: "지금까지 받은 안내", Q11: "제출 방식", Q12: "건물주와 책임 구분", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "식당 허가 확인", clauses: [[`${p}_buildingUse`, ["bt_restaurant"]]], sentence: "식당·카페라면 식당 허가 직접 인허가 받기에서 위생 준비도 함께 점검해 보실 수 있습니다.", path: "/verify/restaurant" },
  V.connectionPro(p, "점검에서 지적받았거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요."),
];
export const afterResultGuide = ["건물 용도·규모 확인", "설계 검토 대상 확인", "소방시설 설치 점검", "소방 계획서와 교육", "점검 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = { ...K.reportBase, sources: { confirmedOn: "2026.10.12", rows: [
  { id: "1", name: "소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호)", publisher: "베트남 국회 / 정부", kind: "보도 기준", urls: ["https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html"], note: "건물 용도·규모별 대상은 원문 대조 필요" },
  { id: "2", name: "행정 절차 축소 정부 결의 (제66.18/2026/NQ-CP호): 2026.7.1부터 2027.2.28까지 한시 적용, 소방 준공 검사 등 3개 절차 폐지 보도", publisher: "베트남 변호사협회 신문", kind: "참고", urls: ["https://lsvn.vn/bo-thu-tuc-nghiem-thu-phong-chay-chua-chay-tu-01-7-2026-a173592.html"], note: "설계 심사는 폐지 대상이 아니며 대체 절차는 없고 건물주 책임으로 바뀐다는 보도임. 결의 발행일은 한 곳의 보도로만 확인했으므로 원문 대조 필요" },
  { id: "3", name: "소방 시행령 개정 (제347/2026/NĐ-CP호, 2026.9.8 공포, 2026.9.15 시행): 투자자는 건물을 사용하기 전에 소방 데이터베이스에 신고, 소방 설계 심사 의무는 유지", publisher: "베트남 정부", kind: "보도 기준", urls: ["https://lsvn.vn/chu-dau-tu-phai-khai-bao-du-lieu-phong-chay-chua-chay-truoc-khi-dua-cong-trinh-vao-hoat-dong-a178875.html", "https://dhtaxlaw.com.vn/nghi-dinh-347-2026-nd-cp-sua-doi-quy-dinh-pccc-khoa-hoc-va-an-ninh"], note: "관할기관 완공검사 폐지 여부(시행령 105 제10조)는 확인 못함, 원문 대조 필요" },
] } };
export const tierRules = V.tier(p);
export const tierDefault = { tier: "write", label: "서류 작성" };
export const diagnosisMap = {
  registration: K.registrationMap,
  key: { fire_installed: "secured", fire_building_has: null, fire_partial: "unsecured", fire_none: "unsecured", fire_unknown: null },
};
export const diagnosisFields = { registration: `${p}_registration`, key: `${p}_facility` };
export const pageRule = { file: "src/app/register/fire-safety/page.tsx", line: 'registrationStatus === "confirmed" && facilityStatus === "secured" ? "possible" : "conditional";' };
