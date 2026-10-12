// 직접 인허가 받기 7종(식당·위생·소방·화장품·환경·의료기기·프랜차이즈) 공통 질문 틀.
// 업종별 스펙은 이 파일의 함수로 공통 질문(등록 상태, 걱정·도움, 서류, 일정, 견적, 제출, 지역)을 만들고 업종 질문만 채운다.
export const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });

export const commonLabels = {
  reg_company_done: "법인 등록 완료", reg_household_done: "개인사업자 등록 완료", reg_in_progress: "사업자 등록 진행 중", reg_not_started: "사업자 등록 전", reg_unsure: "등록 상태를 모름",
  own_fdi: "외국인 투자 법인", own_local: "베트남 현지 법인", own_household: "개인사업자", own_partner: "현지인 명의로 운영", own_undecided: "운영 주체 미정",
  concern_cost: "총비용 걱정", concern_docs: "필요 서류 걱정", concern_time: "허가 일정 걱정", concern_eligibility: "허가 대상 여부 걱정", concern_quote: "받은 견적의 적정성 걱정",
  help_guide: "서류 작성 안내를 원함", help_accompany: "서류 작성과 제출 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "기본 서류 모두 준비", docs_most: "기본 서류 대부분 준비", docs_half: "기본 서류 절반 준비", docs_little: "기본 서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  tn_none: "번역 필요 없음", tn_needed: "번역·인증 필요함", tn_unsure: "번역 필요 여부 모름",
  tl_urgent: "한 달 안에 허가 필요", tl_2_3m: "두세 달 안에 허가", tl_flexible: "급하지 않음", tl_unsure: "필요 시점 미정", tl_already: "이미 영업 중",
  op_date: "영업 시작일 정해짐", op_after_fitout: "공사 후 영업", op_after_permit: "허가 후 영업", op_unsure: "영업 시작일 미정", op_running: "허가 없이 영업 중",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "정부 비용과 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  nat_korea: "대한민국 국적", nat_china: "중국 국적", nat_japan: "일본 국적", nat_other_asia: "그 밖의 아시아 국적", nat_other: "그 밖의 지역 국적",
  sub_self: "직접 제출", sub_staff: "직원이 제출", sub_agency: "대행사가 제출", sub_undecided: "제출 방식 미정",
  area_hanoi: "하노이", area_hcm: "호치민", area_danang: "다낭", area_other_city: "그 밖의 도시", area_ip: "산업단지",
  ag_known: "담당 기관을 알고 있음", ag_unknown: "담당 기관을 모름", ag_changed: "기관 통합으로 담당이 불확실함",
};

export function registrationQuestion(p, code, prompt) {
  return { code, stage: 1, prompt, f: [`${p}_registration`, `${p}_owner`], choices: [
    C("**법인 등록을 이미** 마쳤습니다.", "외국인이 투자한 법인 이름으로 허가를 받으려고 합니다.", ["reg_company_done", "own_fdi"], { card: "외국인 투자 법인 등록을 마친 상황입니다" }),
    C("**개인사업자 등록을** 마쳤습니다.", "규모가 작아서 개인사업자로 허가를 받으려고 합니다.", ["reg_household_done", "own_household"], { card: "개인사업자 등록을 마친 상황입니다" }),
    C("**사업자 등록을 진행하고** 있습니다.", "베트남 현지 법인 이름으로 허가를 받을 예정입니다.", ["reg_in_progress", "own_local"], { card: "현지 법인 등록이 진행 중인 상황입니다" }),
    C("**사업자 등록을 아직** 시작하지 않았습니다.", "베트남 사람 이름으로 등록해서 운영하려고 생각하고 있습니다.", ["reg_not_started", "own_partner"], { card: "사업자 등록 전이고 현지인 명의를 생각하는 상황입니다" }),
    C("**등록 상태를 정확히** 모르겠습니다.", "누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.", ["reg_unsure", "own_undecided"], { card: "등록 상태와 운영 주체부터 확인해야 하는 상황입니다" }),
  ] };
}

export function concernQuestion(p, code, eligibilityLead) {
  return { code, stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?", f: [`${p}_mainConcern`, `${p}_helpWanted`], choices: [
    C("**총비용이 얼마인지** 걱정됩니다.", "필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.", ["concern_cost", "help_guide"], { card: "총비용을 알고 직접 서류를 준비하려는 상황입니다" }),
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 알고 싶은 상황입니다" }),
    C("**허가가 언제 나올지** 걱정됩니다.", "제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.", ["concern_time", "help_accompany"], { card: "허가 일정이 걱정되어 제출 동행을 원하는 상황입니다" }),
    C(eligibilityLead, "서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.", ["concern_eligibility", "help_full"], { card: "허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다" }),
    C("**받은 견적이 적정한지** 모르겠습니다.", "서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.", ["concern_quote", "help_accompany"], { card: "받은 견적이 적정한지 확인하려는 상황입니다" }),
  ] };
}

export function docsQuestion(p, code, allLead, r) {
  return { code, stage: 2, prompt: "허가 신청 서류는 어디까지 준비되었고, 번역이나 인증이 필요한 서류가 있나요?", f: [`${p}_docs`, `${p}_translation`], choices: [
    C(allLead, "모든 서류의 베트남어 번역도 이미 끝냈습니다.", ["docs_all", "tn_none"], { r: r[0] }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "해외에서 받은 서류는 번역과 영사 인증이 필요합니다.", ["docs_most", "tn_needed"], { r: r[1] }),
    C("**절반쯤 준비**했습니다.", "베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.", ["docs_half", "tn_unsure"], { r: r[2] }),
    C("**거의 준비하지 못했습니다.**", "번역과 인증을 어디서 어떻게 하는지도 함께 알고 싶습니다.", ["docs_little", "tn_needed"], { r: r[3] }),
    C("**무엇이 필요한지 아직 모릅니다.**", "준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.", ["docs_unknown", "tn_none"], { r: r[4] }),
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
  return { code, stage: 2, prompt: "신청하시는 분의 국적은 어디이고, 신청서는 누가 제출하게 될 예정인가요?", f: [`${p}_nationality`, `${p}_submitter`], choices: [
    C("**대한민국** 국적입니다.", "제가 직접 담당 기관에 서류를 제출하려고 준비하고 있습니다.", ["nat_korea", "sub_self"], { r: "직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요." }),
    C("**중국** 국적입니다.", "베트남 직원이 담당 기관에 서류를 대신 제출해 주기로 했습니다.", ["nat_china", "sub_staff"], { r: "직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요." }),
    C("**일본** 국적입니다.", "대행사에 서류 제출을 맡기려고 어느 업체가 좋을지 알아보는 중입니다.", ["nat_japan", "sub_agency"], { r: "대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요." }),
    C("**그 밖의 아시아 국가** 국적입니다.", "누가 제출할지 아직 정하지 못해서 방법별로 비교해 보고 싶습니다.", ["nat_other_asia", "sub_undecided"], { r: "제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요." }),
    C("**그 밖의 지역** 국적입니다.", "직접 제출하지만 베트남어를 몰라서 통역이 꼭 필요한 상황입니다.", ["nat_other", "sub_self"], { r: "국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요." }),
  ] };
}

export function areaQuestion(p, code, agencyHint) {
  return { code, stage: 2, prompt: "사업장이 있는 지역은 어디이고, 허가 신청을 받는 담당 기관을 알고 계신가요?", f: [`${p}_area`, `${p}_agencyKnown`], choices: [
    C("**하노이**에 있습니다.", "신청을 받는 담당 기관의 위치와 온라인 접수 방법을 이미 알고 있습니다.", ["area_hanoi", "ag_known"], { r: "온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요." }),
    C("**호치민**에 있습니다.", "어느 기관에 신청서를 내야 하는지 몰라서 그것부터 알고 싶습니다.", ["area_hcm", "ag_unknown"], { r: agencyHint }),
    C("**다낭**에 있습니다.", "최근 기관이 통합되어 신청을 받는 담당 기관이 바뀌었는지 모르겠습니다.", ["area_danang", "ag_changed"], { r: "기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요." }),
    C("**그 밖의 도시**에 있습니다.", "담당 기관은 알고 있지만 온라인 접수 방법은 아직 모르는 상태입니다.", ["area_other_city", "ag_known"], { r: "지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요." }),
    C("**산업단지 안**에 있습니다.", "산업단지 관리 기관이 신청을 받는지 다른 곳이 받는지 모르겠습니다.", ["area_ip", "ag_unknown"], { r: "산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요." }),
  ] };
}

export const commonRiskRules = (p) => [
  { id: "registration", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다" },
  { id: "nominee", clauses: [[`${p}_owner`, ["own_partner"]]], sentence: "현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다" },
  { id: "running", clauses: [[`${p}_timeline`, ["tl_already"]]], sentence: "허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다" },
];

export const commonTier = (p) => ({
  full: [[`${p}_helpWanted`, ["help_full"]], [`${p}_timeline`, ["tl_urgent", "tl_already"]], [`${p}_registration`, ["reg_not_started"]]],
  accompany: [[`${p}_helpWanted`, ["help_accompany"]], [`${p}_submitter`, ["sub_undecided"]], [`${p}_agencyKnown`, ["ag_unknown", "ag_changed"]]],
});

export const registrationMap = { reg_company_done: "confirmed", reg_household_done: "confirmed", reg_in_progress: "unconfirmed", reg_not_started: "unconfirmed", reg_unsure: null };

export function summariesFor(p, bodies) {
  const keys = [["concern_cost", "help_guide"], ["concern_docs", "help_guide"], ["concern_time", "help_accompany"], ["concern_eligibility", "help_full"], ["concern_quote", "help_accompany"]];
  const heads = [
    "총비용을 확인하고 서류는 직접 준비하려는 상황입니다",
    "필요한 서류부터 확인해 직접 준비하려는 상황입니다",
    "허가 일정이 걱정되어 제출 동행을 원하는 상황입니다",
    "허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다",
    "받은 견적을 확인하고 제출은 함께 하려는 상황입니다",
  ];
  return Object.fromEntries(keys.map(([a, b], i) => [`${p}_mainConcern=${a}|${p}_helpWanted=${b}`, { headline: heads[i], body: bodies[i] }]));
}

export const reportBase = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 허가 가능 여부를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.",
};
