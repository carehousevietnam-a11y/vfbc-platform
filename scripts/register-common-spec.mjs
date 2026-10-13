// 직접 인허가 받기 7종(식당·위생·소방·화장품·환경·의료기기·프랜차이즈) 공통 질문 틀.
// 업종별 스펙은 이 파일의 함수로 공통 질문(등록 상태, 걱정·도움, 서류, 일정, 견적, 제출, 지역)을 만들고 업종 질문만 채운다.
export const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });

export const commonLabels = {
  reg_company_done: "법인 등록 완료", reg_household_done: "개인사업자 등록 완료", reg_in_progress: "사업자 등록 진행 중", reg_not_started: "사업자 등록 전", reg_unsure: "등록 상태를 모름",
  own_fdi: "외국인 투자 법인", own_local: "베트남 현지 법인", own_household: "개인사업자", own_partner: "현지인 명의로 운영", own_undecided: "운영 주체 미정",
  concern_docs: "필요 서류 걱정", concern_time: "허가 일정 걱정", concern_eligibility: "허가 대상 여부 걱정", concern_language: "담당 기관과의 베트남어 소통 걱정", concern_rejection: "서류 반려 걱정",
  help_guide: "서류 작성 위임을 원함", help_accompany: "서류 작성과 제출 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "기본 서류 모두 준비", docs_most: "기본 서류 대부분 준비", docs_half: "기본 서류 절반 준비", docs_little: "기본 서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  lr_self: "베트남어를 직접 읽음", lr_interp: "통역사·베트남어 하는 지인이 통역", lr_local: "한국어 하는 베트남 직원이 설명", lr_machine: "인공지능 번역기로 대략 이해", lr_none: "베트남어를 몰라 내용을 알 수 없음",
  tl_urgent: "한 달 안에 허가 필요", tl_2_3m: "두세 달 안에 허가", tl_flexible: "급하지 않음", tl_unsure: "필요 시점 미정", tl_already: "이미 영업 중",
  op_date: "영업 시작일 정해짐", op_after_fitout: "공사 후 영업", op_after_permit: "허가 후 영업", op_unsure: "영업 시작일 미정", op_running: "허가 없이 영업 중",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "정부 비용과 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  sub_self: "직접 제출", sub_staff: "직원이 제출", sub_agency: "대행사가 제출", sub_undecided: "제출 방식 미정", sub_self_lang: "직접 제출, 베트남어가 걱정됨",
  sn_account: "온라인 접수 계정·서명 준비", sn_proxy: "위임장·연락 방법 준비", sn_scope: "대행 범위·원본 보관 확인", sn_compare: "제출 방식 비교", sn_interpreter: "통역 필요 범위 확인",
  area_hanoi: "하노이", area_hcm: "호치민", area_danang: "다낭", area_other_city: "그 밖의 도시", area_ip: "산업단지",
  an_online: "담당 기관과 온라인 접수 확인", an_office: "접수 기관 확인", an_changed: "기관 통합으로 담당 확인", an_visit: "지방 접수 방식 확인", an_zone: "산업단지 관리 기관 확인",
};

export function registrationQuestion(p, code, prompt) {
  return { code, stage: 1, prompt, f: [`${p}_registration`, `${p}_owner`], choices: [
    C("**법인 등록을 이미** 마쳤습니다.", "외국인이 투자한 그 법인 이름으로 허가를 신청하려고 합니다.", ["reg_company_done", "own_fdi"], { card: "외국인 투자 법인 등록을 마친 상황입니다" }),
    C("**개인사업자 등록을** 마쳤습니다.", "개인사업자 본인 이름으로 허가를 신청하려고 합니다.", ["reg_household_done", "own_household"], { card: "개인사업자 등록을 마친 상황입니다" }),
    C("**사업자 등록을 진행하고** 있습니다.", "등록이 끝나면 그 베트남 현지 법인 이름으로 허가를 신청할 예정입니다.", ["reg_in_progress", "own_local"], { card: "현지 법인 등록이 진행 중인 상황입니다" }),
    C("**사업자 등록을 아직** 시작하지 않았습니다.", "누구 이름으로 등록할지 정해야 해서 현지인 명의로 운영하는 방법도 생각하고 있습니다.", ["reg_not_started", "own_partner"], { card: "사업자 등록 전이고 현지인 명의를 생각하는 상황입니다" }),
    C("**등록 상태를 정확히** 모르겠습니다.", "누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.", ["reg_unsure", "own_undecided"], { card: "등록 상태와 운영 주체부터 확인해야 하는 상황입니다" }),
  ] };
}

export function concernQuestion(p, code, eligibilityLead) {
  return { code, stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어디까지 전문가에게 맡기고 싶으신가요?", f: [`${p}_mainConcern`, `${p}_helpWanted`], choices: [
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "필요한 서류를 전문가가 정리해서 대신 작성해 주면 좋겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 정리해 작성을 맡기려는 상황입니다" }),
    C("**허가가 언제 나올지** 걱정됩니다.", "접수 후 처리가 길어지지 않도록 서류 작성부터 제출하는 날 통역 동행까지 맡기고 싶습니다.", ["concern_time", "help_accompany"], { card: "일정 지연이 걱정되어 제출 동행까지 원하는 상황입니다" }),
    C(eligibilityLead, "대상인지 판단부터 서류 준비, 제출, 수령까지 모두 맡기고 싶습니다.", ["concern_eligibility", "help_full"], { card: "허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다" }),
    C("**담당 기관과 베트남어로 소통하는 것이** 걱정됩니다.", "담당 기관의 질문과 보완 요구를 대신 받아 처리해 줄 전문가가 있으면 좋겠습니다.", ["concern_language", "help_full"], { card: "담당 기관과의 소통이 걱정되어 전 과정을 맡기려는 상황입니다" }),
    C("**서류를 냈다가 되돌아올까** 걱정됩니다.", "접수 전에 전문가가 서류를 점검하고 제출하는 날에도 함께 가 주면 좋겠습니다.", ["concern_rejection", "help_accompany"], { card: "서류 반려가 걱정되어 점검과 제출 동행을 원하는 상황입니다" }),
  ] };
}

export function docsQuestion(p, code, allLead, r) {
  const tip = ["", "통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요.", "직원 설명은 서류 원문과 대조해 확인하세요.", "인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요.", "베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요."];
  const rr = (i) => (tip[i] ? `${r[i]} ${tip[i]}` : r[i]);
  return { code, stage: 2, prompt: "허가 신청 서류는 어디까지 준비되었고, 그 서류의 베트남어 내용은 어떻게 이해하고 계신가요?", f: [`${p}_docs`, `${p}_langRoute`], choices: [
    C(allLead, "베트남어를 직접 읽고 쓸 수 있어 서류 내용을 스스로 확인했습니다.", ["docs_all", "lr_self"], { r: rr(0) }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "베트남어를 하는 한국인 지인이나 통역사가 서류 내용을 읽어 주고 있습니다.", ["docs_most", "lr_interp"], { r: rr(1) }),
    C("**절반쯤 준비**했습니다.", "한국어를 하는 베트남 직원이 서류 내용을 설명해 주는데 원문과 맞는지는 확인하지 못했습니다.", ["docs_half", "lr_local"], { r: rr(2) }),
    C("**거의 준비하지 못했습니다.**", "인공지능 번역기로 읽어 보니 필요한 서류가 많아 보이는데 번역이 정확한지는 모릅니다.", ["docs_little", "lr_machine"], { r: rr(3) }),
    C("**무엇이 필요한지 아직 모릅니다.**", "베트남어를 전혀 몰라 서류에 무엇이 적혀 있는지 알 수 없고 도와줄 사람도 없습니다.", ["docs_unknown", "lr_none"], { r: rr(4) }),
  ] };
}

export function timelineQuestion(p, code, r) {
  return { code, stage: 2, prompt: "허가는 언제까지 필요하고, 실제 영업이나 판매는 언제 시작할 예정인가요?", f: [`${p}_timeline`, `${p}_openPlan`], choices: [
    C("**한 달 안에** 허가가 필요합니다.", "영업 시작일이 이미 정해져 있어서 미루기 어렵습니다.", ["tl_urgent", "op_date"], { r: r[0] }),
    C("**두세 달 안에** 받으면 됩니다.", "시설 공사를 모두 마친 뒤에 영업을 시작할 계획입니다.", ["tl_2_3m", "op_after_fitout"], { r: r[1] }),
    C("**급하지는 않습니다.**", "허가가 나온 것을 직접 확인한 뒤에 영업을 시작하려고 합니다.", ["tl_flexible", "op_after_permit"], { r: r[2] }),
    C("**필요한 시점을 아직** 정하지 못했습니다.", "영업이나 판매를 언제 시작할지도 정해지지 않았습니다.", ["tl_unsure", "op_unsure"], { r: r[3] }),
    C("**이미 영업을 하고** 있습니다.", "허가를 받지 못한 채 먼저 운영을 시작한 상태입니다.", ["tl_already", "op_running"], { r: r[4] }),
  ] };
}

export function quoteQuestion(p, code, scopeHint) {
  return { code, stage: 2, prompt: "받아 본 견적은 몇 건이고, 정부 비용과 대행 범위가 구분되어 있나요?", f: [`${p}_quoteStatus`, `${p}_quoteScope`], choices: [
    C("**견적을 받은 적이 없습니다.**", "비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.", ["quote_none", "qs_na"], { r: "견적을 받기 전에 정부 비용, 서류 준비비, 대행료를 나누어 요청하세요." }),
    C("**한 곳에서 서면 견적**을 받았습니다.", "정부 비용과 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.", ["quote_one", "qs_clear"], { r: scopeHint }),
    C("**여러 곳에서 견적**을 받았습니다.", "항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.", ["quote_several", "qs_mixed"], { r: "업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다." }),
    C("**말로만 금액**을 들었습니다.", "어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.", ["quote_verbal", "qs_unknown"], { r: "말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요." }),
    C("**광고에 나온 가격**만 보았습니다.", "추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.", ["quote_ad", "qs_unknown"], { r: "광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요." }),
  ] };
}

export function submitQuestion(p, code) {
  return { code, stage: 2, prompt: "신청서는 누가 담당 기관에 제출하게 될 예정이고, 그 방식에서 가장 필요한 준비는 무엇인가요?", f: [`${p}_submitter`, `${p}_submitNeed`], choices: [
    C("**제가 직접** 담당 기관에 제출하려고 합니다.", "온라인 접수 계정과 서명 방법을 어떻게 준비하는지 알고 싶습니다.", ["sub_self", "sn_account"], { r: "직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요." }),
    C("**베트남 직원이** 대신 제출해 주기로 했습니다.", "위임장과 제출 후 연락 방법을 어떻게 정하는지 알고 싶습니다.", ["sub_staff", "sn_proxy"], { r: "직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요." }),
    C("**대행사에** 서류 제출을 맡기려고 합니다.", "맡기는 업무 범위와 서류 원본 보관 방식을 어떻게 정하는지 알고 싶습니다.", ["sub_agency", "sn_scope"], { r: "대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요." }),
    C("**누가 제출할지** 아직 정하지 못했습니다.", "직접, 직원, 대행 세 가지 방식의 비용과 일정을 비교해 보고 싶습니다.", ["sub_undecided", "sn_compare"], { r: "제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요." }),
    C("**직접 제출하지만** 베트남어가 어려워 걱정입니다.", "제출하는 날 통역이 어디까지 필요한지 미리 알고 싶습니다.", ["sub_self_lang", "sn_interpreter"], { r: "직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요." }),
  ] };
}

export function areaQuestion(p, code, agencyHint) {
  return { code, stage: 2, prompt: "사업장이 있는 지역은 어디이고, 그 지역에서 허가 신청을 받는 담당 기관은 어떻게 확인하실 예정인가요?", f: [`${p}_area`, `${p}_agencyNeed`], choices: [
    C("**하노이**에 있습니다.", "신청을 받는 담당 기관이 어디인지, 온라인으로도 접수할 수 있는지 확인하고 싶습니다.", ["area_hanoi", "an_online"], { r: "온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요." }),
    C("**호치민**에 있습니다.", "어느 기관에 신청서를 내야 하는지 몰라서 그것부터 알고 싶습니다.", ["area_hcm", "an_office"], { r: agencyHint }),
    C("**다낭**에 있습니다.", "최근 기관이 통합되어 신청을 받는 담당 기관이 바뀌었는지 확인하고 싶습니다.", ["area_danang", "an_changed"], { r: "기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요." }),
    C("**그 밖의 도시**에 있습니다.", "지방은 접수 방식이 다를 수 있어 방문해서 내야 하는지 확인하고 싶습니다.", ["area_other_city", "an_visit"], { r: "지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요." }),
    C("**산업단지 안**에 있습니다.", "산업단지 관리 기관이 신청을 받는지 다른 곳이 받는지 확인하고 싶습니다.", ["area_ip", "an_zone"], { r: "산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요." }),
  ] };
}

export const commonRiskRules = (p) => [
  { id: "registration", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다" },
  { id: "nominee", clauses: [[`${p}_owner`, ["own_partner"]]], sentence: "현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다" },
  { id: "running", clauses: [[`${p}_timeline`, ["tl_already"]]], sentence: "허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다" },
  { id: "language", clauses: [[`${p}_langRoute`, ["lr_local", "lr_machine", "lr_none"]]], sentence: "베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다" },
];

export const commonTier = (p) => ({
  full: [[`${p}_helpWanted`, ["help_full"]], [`${p}_timeline`, ["tl_urgent", "tl_already"]], [`${p}_registration`, ["reg_not_started"]]],
  accompany: [[`${p}_helpWanted`, ["help_accompany"]], [`${p}_submitter`, ["sub_undecided"]], [`${p}_agencyNeed`, ["an_office", "an_changed", "an_zone"]]],
});

export const registrationMap = { reg_company_done: "confirmed", reg_household_done: "confirmed", reg_in_progress: "unconfirmed", reg_not_started: "unconfirmed", reg_unsure: null };

export function summariesFor(p, bodies) {
  const keys = [["concern_docs", "help_guide"], ["concern_time", "help_accompany"], ["concern_eligibility", "help_full"], ["concern_language", "help_full"], ["concern_rejection", "help_accompany"]];
  const heads = [
    "필요한 서류부터 정리해 작성을 맡기려는 상황입니다",
    "일정 지연이 걱정되어 제출 동행까지 원하는 상황입니다",
    "허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다",
    "담당 기관과의 소통이 걱정되어 전 과정을 맡기려는 상황입니다",
    "서류 반려가 걱정되어 점검과 제출 동행을 원하는 상황입니다",
  ];
  return Object.fromEntries(keys.map(([a, b], i) => [`${p}_mainConcern=${a}|${p}_helpWanted=${b}`, { headline: heads[i], body: bodies[i] }]));
}

export const reportBase = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 허가 가능 여부를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다. 성격이 보도 기준 또는 참고인 자료는 원문 확인 전 정보이므로 관할 기관에서 최종 확인해 주세요.",
};
