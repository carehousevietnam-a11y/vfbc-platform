// TAMTRU(임시 거주 신고) content spec. Q1-Q5 = 1st stage (card), Q6-Q13 = 2nd stage (guide r).
// 근거: 외국인 출입국·거주법(47/2014, 51/2019·23/2023 개정), 행정위반 처벌 시행령 144/2021. 판정 함수(computeTamtruResultTone)는 바꾸지 않는다.
export const labels = {
  first_arrival: "새로 들어와 처음 신고", moved: "이사 후 새 주소 신고", status_renewed: "비자·거주증 갱신 후 다시 신고", hotel_to_home: "숙소에서 집으로 옮김", stage_unsure: "어떤 신고인지 모름",
  stay_apartment: "임대 아파트·주택", stay_hotel: "호텔·서비스드 숙소", stay_family: "가족·지인 집", stay_dorm: "회사 숙소·기숙사", stay_undecided: "머물 곳 미정",
  tt_within12: "도착 후 12시간 이내", tt_within24: "외곽 지역, 24시간 이내", tt_over24: "하루 이상 지남", tt_before_arrival: "아직 도착 전", tt_unknown: "도착 후 지난 시간 모름",
  dc_landlord: "집주인이 신고", dc_self: "본인이 직접 신고", dc_company: "회사 담당자가 신고", dc_hotel: "숙소가 신고", dc_unknown: "누가 신고하는지 모름",
  ll_cooperative: "집주인이 협조적", ll_unreachable: "집주인 연락이 어려움", ll_refuses: "집주인이 신고를 꺼림", ll_company: "회사가 숙소 관리", ll_unsure: "집주인 협조 여부를 모름",
  lease_signed: "본인 명의 계약서 있음", lease_sublet: "다른 사람에게 다시 빌린 집", lease_none: "계약서 없음", lease_company: "회사 명의 계약", lease_unknown: "계약 상태를 모름",
  pv_valid: "여권·비자 유효", pv_expiring: "비자 만료가 가까움", pv_trc: "거주증 보유", pv_held: "비자 연장으로 여권을 맡김", pv_unsure: "여권·비자 상태를 모름",
  pr_has_record: "이전 신고 기록 있음", pr_none: "이전 신고 기록 없음", pr_old_address: "이전 주소 신고가 남아 있음", pr_lost: "이전 확인서 분실", pr_unknown: "이전 신고 여부를 모름",
  concern_fine: "과태료 걱정", concern_docs: "필요 서류 걱정", concern_late: "신고 시기가 늦었는지 걱정", concern_landlord: "집주인 협조 걱정", concern_quote: "받은 견적의 적정성 걱정",
  help_guide: "신고 방법 안내를 원함", help_accompany: "신고 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "필요 서류 모두 준비", docs_most: "필요 서류 대부분 준비", docs_passport_only: "여권만 준비", docs_little: "서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  od_ready: "집주인 소유 서류 준비", od_asking: "집주인에게 요청 중", od_refused: "집주인이 서류 제공 거부", od_na: "집주인 서류 불필요", od_unknown: "집주인 서류 필요 여부를 모름",
  m_online: "온라인 신고", m_police: "동 공안 방문 신고", m_hotel_system: "숙소 신고 시스템", m_company: "회사가 처리", m_unknown: "신고 방법을 모름",
  acc_have: "온라인 신고 계정 보유", acc_none: "온라인 신고 계정 없음", acc_landlord: "집주인 계정 사용", acc_company: "회사 계정 사용", acc_unknown: "계정 필요 여부를 모름",
  fm_alone: "혼자 거주", fm_spouse: "배우자와 거주", fm_child: "자녀와 거주", fm_family: "가족 모두 거주", fm_guest: "손님이 잠시 머묾",
  fd_ready: "가족 서류 준비", fd_partial: "가족 서류 일부 준비", fd_missing: "가족 서류 미준비", fd_na: "가족 서류 불필요", fd_unknown: "가족 서류 필요 여부를 모름",
  use_trc: "거주증 신청에 사용", use_wp: "노동허가에 사용", use_license: "운전면허 전환에 사용", use_bank: "은행·통신 개설에 사용", use_none: "특별한 사용 계획 없음",
  pf_certificate: "신고 확인서 필요", pf_screenshot: "신고 화면 캡처면 충분", pf_unknown: "필요한 증빙을 모름",
  mv_none: "1년 넘게 이사 계획 없음", mv_soon: "몇 달 안에 이사 예정", mv_travel: "출장이 잦음", mv_short: "짧은 체류 후 출국", mv_unsure: "체류 계획 미정",
  sl_over_1y: "1년 넘게 머묾", sl_3_12m: "3개월에서 1년 머묾", sl_under_3m: "3개월 미만 머묾", sl_unsure: "머무는 기간 미정",
  nat_korea: "대한민국 국적", nat_china: "중국 국적", nat_japan: "일본 국적", nat_other_asia: "그 밖의 아시아 국적", nat_other: "그 밖의 지역 국적",
  lang_ok: "베트남어 소통 가능", lang_partner: "통역할 사람이 있음", lang_need: "통역이 꼭 필요함", lang_english: "영어로만 소통 가능",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "수수료와 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  area_hanoi: "하노이", area_hcm: "호치민", area_danang: "다낭", area_other_city: "그 밖의 도시", area_unsure: "지역 미정",
  wk_known: "관할 동 공안을 알고 있음", wk_unknown: "관할 동 공안을 모름", wk_changed: "행정구역 변경으로 관할이 불확실함",
};
const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });
export const questions = [
  { code: "Q1", stage: 1, prompt: "어떤 일로 임시 거주 신고가 필요하고, 지금 머무는 곳은 어떤 형태인가요?", f: ["tt_stage", "tt_stayType"], choices: [
    C("**베트남에 새로 들어와** 처음 신고하려고 합니다.", "임대한 아파트나 주택에서 지내기 시작했습니다.", ["first_arrival", "stay_apartment"], { card: "새로 들어와 임대 주택에서 처음 신고하는 상황입니다" }),
    C("**이사를 해서** 새 주소로 신고해야 합니다.", "새로 옮긴 곳은 가족이나 지인의 집입니다.", ["moved", "stay_family"], { card: "이사 후 가족·지인 집 주소로 다시 신고하는 상황입니다" }),
    C("**비자나 거주증을 새로 받아** 다시 신고하려고 합니다.", "회사에서 마련해 준 숙소나 기숙사에서 지내고 있습니다.", ["status_renewed", "stay_dorm"], { card: "체류 자격이 바뀌어 회사 숙소 주소로 다시 신고하는 상황입니다" }),
    C("**호텔에서 지내다가 집으로** 옮기려고 합니다.", "지금은 호텔이나 서비스드 숙소에서 머물고 있습니다.", ["hotel_to_home", "stay_hotel"], { card: "숙소에서 집으로 옮기며 신고를 다시 하는 상황입니다" }),
    C("**어떤 신고를 해야 하는지** 모르겠습니다.", "앞으로 어디서 머물지도 아직 정하지 못했습니다.", ["stage_unsure", "stay_undecided"], { card: "필요한 신고와 머물 곳부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q2", stage: 1, prompt: "지금 머무는 곳에 도착한 지 얼마나 되었고, 신고는 누가 하기로 되어 있나요?", f: ["tt_timing", "tt_declarant"], choices: [
    C("**도착한 지 12시간이 안 됐습니다.**", "집주인이 신고를 해 주기로 이야기가 되어 있습니다.", ["tt_within12", "dc_landlord"], { card: "도착 직후이고 집주인이 신고하기로 한 상황입니다" }),
    C("**외곽 지역이라 도착한 지 하루가 안 됐습니다.**", "제가 직접 온라인으로 신고하려고 알아보고 있습니다.", ["tt_within24", "dc_self"], { card: "외곽 지역에 도착해 직접 신고하려는 상황입니다" }),
    C("**도착한 지 하루가 넘었습니다.**", "회사 담당자가 처리해 준다고 했는데 아직 되었는지 모릅니다.", ["tt_over24", "dc_company"], { card: "도착 후 하루가 지났고 회사가 신고하기로 한 상황입니다" }),
    C("**아직 도착하지 않았습니다.**", "머물 호텔이나 숙소에서 신고를 해 줄 것으로 알고 있습니다.", ["tt_before_arrival", "dc_hotel"], { card: "도착 전이고 숙소가 신고해 줄 것으로 아는 상황입니다" }),
    C("**도착한 지 얼마나 됐는지** 정확히 모르겠습니다.", "누가 신고를 해야 하는지도 아직 확인하지 못했습니다.", ["tt_unknown", "dc_unknown"], { card: "도착 시점과 신고할 사람부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q3", stage: 1, prompt: "집주인은 신고에 협조하고 있고, 집을 빌린 계약서는 어떤 상태인가요?", f: ["tt_landlord", "tt_lease"], choices: [
    C("**집주인이 협조적**입니다.", "제 이름으로 된 임대차 계약서를 가지고 있고 계약 기간도 남았습니다.", ["ll_cooperative", "lease_signed"], { card: "집주인이 협조하고 본인 명의 계약서가 있는 상황입니다" }),
    C("**집주인과 연락이 잘 안 됩니다.**", "다른 사람이 빌린 집을 제가 다시 빌려서 살고 있습니다.", ["ll_unreachable", "lease_sublet"], { card: "집주인 연락이 어렵고 다시 빌린 집에 사는 상황입니다" }),
    C("**집주인이 신고를 꺼립니다.**", "계약서를 따로 쓰지 않고 말로만 약속하고 들어왔습니다.", ["ll_refuses", "lease_none"], { card: "집주인이 신고를 꺼리고 계약서가 없는 상황입니다" }),
    C("**회사가 숙소를 관리**합니다.", "숙소 계약은 회사 이름으로 되어 있어서 제 계약서는 없습니다.", ["ll_company", "lease_company"], { card: "회사가 숙소를 관리하고 회사 명의로 계약된 상황입니다" }),
    C("**집주인이 협조할지** 아직 모르겠습니다.", "계약서를 어떻게 써야 하는지도 확인하지 못했습니다.", ["ll_unsure", "lease_unknown"], { card: "집주인 협조와 계약 상태를 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "여권과 비자는 지금 어떤 상태이고, 예전에 신고한 기록이 남아 있나요?", f: ["tt_passportVisa", "tt_priorRecord"], choices: [
    C("**여권과 비자 모두 유효**합니다.", "예전에 임시 거주 신고를 한 기록과 확인서를 가지고 있습니다.", ["pv_valid", "pr_has_record"], { card: "여권과 비자가 유효하고 이전 신고 기록이 있는 상황입니다" }),
    C("**비자 만료가 가까워** 걱정입니다.", "베트남에서 임시 거주 신고를 해 본 적이 한 번도 없습니다.", ["pv_expiring", "pr_none"], { card: "비자 만료가 가깝고 처음 신고하는 상황입니다" }),
    C("**거주증을 가지고** 있습니다.", "이사하기 전 주소로 한 신고가 아직 그대로 남아 있습니다.", ["pv_trc", "pr_old_address"], { card: "거주증이 있고 이전 주소 신고가 남아 있는 상황입니다" }),
    C("**비자 연장 때문에 여권을 맡겨** 두었습니다.", "예전에 받은 신고 확인서를 잃어버려서 찾을 수 없습니다.", ["pv_held", "pr_lost"], { card: "여권을 맡긴 상태이고 이전 확인서를 잃어버린 상황입니다" }),
    C("**여권과 비자 상태를** 정확히 모르겠습니다.", "예전에 신고가 되었는지도 확인해 보지 못했습니다.", ["pv_unsure", "pr_unknown"], { card: "여권·비자 상태와 이전 신고 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q5", stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?", f: ["tt_mainConcern", "tt_helpWanted"], choices: [
    C("**과태료를 내게 될까** 걱정됩니다.", "신고 방법만 알려 주면 제가 직접 처리하겠습니다.", ["concern_fine", "help_guide"], { card: "과태료가 걱정되어 직접 신고하려는 상황입니다" }),
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "서류를 하나씩 알려 주면 직접 챙겨서 신고하겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 알고 싶은 상황입니다" }),
    C("**신고 시기가 이미 늦었는지** 걱정됩니다.", "동 공안에 갈 때 통역과 함께 가고 싶습니다.", ["concern_late", "help_accompany"], { card: "신고가 늦었을까 걱정되어 동행을 원하는 상황입니다" }),
    C("**집주인이 협조하지 않을까** 걱정됩니다.", "집주인과의 연락부터 신고까지 모두 맡기고 싶습니다.", ["concern_landlord", "help_full"], { card: "집주인 문제가 걱정되어 전 과정을 맡기려는 상황입니다" }),
    C("**받은 견적이 적정한지** 모르겠습니다.", "서류는 제가 준비하고 신고할 때만 함께 가고 싶습니다.", ["concern_quote", "help_accompany"], { card: "받은 견적이 적정한지 확인하려는 상황입니다" }),
  ] },
  { code: "Q6", stage: 2, prompt: "신고에 필요한 서류는 어디까지 준비했고, 집주인 쪽 서류도 받을 수 있나요?", f: ["tt_docs", "tt_ownerDocs"], choices: [
    C("**여권, 비자, 계약서를 모두** 준비했습니다.", "집주인의 신분증과 주택 소유 서류 사본도 받아 두었습니다.", ["docs_all", "od_ready"], { r: "서류가 갖춰졌으니 신고할 주소와 계약서 주소가 같은지만 맞춰 보고 바로 신고하세요." }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "집주인에게 소유 서류 사본을 보내 달라고 요청해 둔 상태입니다.", ["docs_most", "od_asking"], { r: "집주인 서류가 오면 바로 신고할 수 있도록 나머지 서류를 먼저 정리해 두세요." }),
    C("**여권만 준비**되어 있습니다.", "집주인이 자기 서류를 보여 주기 싫다고 해서 받지 못했습니다.", ["docs_passport_only", "od_refused"], { r: "집주인 서류 없이 신고가 가능한지 관할 동 공안에 먼저 묻고, 안 되면 숙소 변경도 생각해 보세요." }),
    C("**거의 준비하지 못했습니다.**", "회사 숙소라서 집주인 서류는 필요 없는 것으로 알고 있습니다.", ["docs_little", "od_na"], { r: "회사 숙소라면 회사 담당자에게 숙소 서류를 받아 신고 서류를 한 번에 맞추세요." }),
    C("**무엇이 필요한지 아직 모릅니다.**", "집주인 쪽 서류가 필요한지도 아직 확인하지 못했습니다.", ["docs_unknown", "od_unknown"], { r: "여권, 비자 면, 계약서, 집주인 서류가 기본이니 이 네 가지부터 하나씩 확인하세요." }),
  ] },
  { code: "Q7", stage: 2, prompt: "신고는 어떤 방법으로 할 예정이고, 온라인 신고를 위한 계정은 있나요?", f: ["tt_method", "tt_account"], choices: [
    C("**온라인으로 신고**하려고 합니다.", "온라인 신고 계정을 이미 만들어 두었고 로그인도 해 보았습니다.", ["m_online", "acc_have"], { r: "온라인 신고 후 처리 결과 화면을 저장해 두면 나중에 증빙으로 쓰기 쉽습니다." }),
    C("**동 공안에 직접 가서** 신고하려고 합니다.", "온라인 신고 계정은 만들지 않았고 만들 생각도 없습니다.", ["m_police", "acc_none"], { r: "방문 신고는 접수 시간이 정해져 있으니 방문 전에 시간과 준비물을 확인하세요." }),
    C("**숙소의 신고 시스템**으로 처리됩니다.", "집주인이 자기 계정으로 신고해 주기로 했습니다.", ["m_hotel_system", "acc_landlord"], { r: "숙소나 집주인이 신고했다면 신고가 끝났다는 확인을 꼭 받아 두세요." }),
    C("**회사가 대신 처리**해 주기로 했습니다.", "회사가 가진 계정으로 신고한다고 들었습니다.", ["m_company", "acc_company"], { r: "회사가 신고하면 처리된 날짜와 확인 화면을 받아 두어야 나중에 쓸 수 있습니다." }),
    C("**어떤 방법이 맞는지** 모르겠습니다.", "온라인 신고에 계정이 필요한지도 잘 모르겠습니다.", ["m_unknown", "acc_unknown"], { r: "누가 신고하는지가 정해지면 방법도 정해지니, 집주인과 먼저 신고 담당을 정하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "함께 머무는 가족이 있고, 가족의 여권이나 관계 서류는 준비되어 있나요?", f: ["tt_family", "tt_familyDocs"], choices: [
    C("**혼자 머물고** 있습니다.", "함께 사는 가족이 없어서 제 서류만 준비하면 되는 상황입니다.", ["fm_alone", "fd_na"], { r: "혼자 머무는 경우라 본인 서류만 정리하면 됩니다." }),
    C("**배우자와 함께** 머물고 있습니다.", "배우자의 여권과 비자 사본을 모두 준비해 두었습니다.", ["fm_spouse", "fd_ready"], { r: "함께 머무는 사람마다 신고가 필요하니 배우자도 같은 주소로 함께 신고하세요." }),
    C("**자녀와 함께** 머물고 있습니다.", "자녀 서류는 일부만 준비했고 나머지를 챙기는 중입니다.", ["fm_child", "fd_partial"], { r: "자녀도 각각 신고 대상이니 자녀 여권과 비자 면을 빠짐없이 준비하세요." }),
    C("**가족 모두 함께** 머물고 있습니다.", "가족들의 서류를 아직 하나도 준비하지 못했습니다.", ["fm_family", "fd_missing"], { r: "가족이 여럿이면 사람별 서류 표를 만들어 한 번에 신고하면 빠뜨리지 않습니다." }),
    C("**손님이 잠시 머물다** 갈 예정입니다.", "손님도 신고해야 하는지, 어떤 서류가 필요한지 모릅니다.", ["fm_guest", "fd_unknown"], { r: "짧게 머무는 외국인 손님도 신고 대상이니 도착 전에 손님 여권 사본을 받아 두세요." }),
  ] },
  { code: "Q9", stage: 2, prompt: "신고 확인서는 어디에 쓸 예정이고, 어떤 형태의 증빙이 필요하신가요?", f: ["tt_use", "tt_proof"], choices: [
    C("**거주증을 신청**할 때 쓰려고 합니다.", "종이로 된 신고 확인서가 있어야 하는 것으로 알고 있습니다.", ["use_trc", "pf_certificate"], { r: "거주증 신청에는 신고 내용과 주소가 일치해야 하니 확인서 주소를 계약서와 맞춰 두세요." }),
    C("**노동허가 서류**에 쓰려고 합니다.", "온라인으로 신고한 화면을 캡처해 두면 충분한지 궁금합니다.", ["use_wp", "pf_screenshot"], { r: "노동허가에 쓰일 수 있으니 제출처가 원하는 증빙 형태를 미리 물어 두세요." }),
    C("**운전면허를 바꿀 때** 쓰려고 합니다.", "어떤 형태의 증빙이 필요한지 아직 알아보지 못했습니다.", ["use_license", "pf_unknown"], { r: "운전면허 전환에는 거주 증빙이 필요할 수 있으니 신고 확인서를 함께 준비하세요." }),
    C("**은행이나 통신 개설**에 쓰려고 합니다.", "종이로 된 신고 확인서를 따로 받아 두고 싶습니다.", ["use_bank", "pf_certificate"], { r: "은행이나 통신사는 요구 서류가 다르니 방문 전에 필요한 증빙을 확인하세요." }),
    C("**특별히 쓸 곳은 없습니다.**", "신고만 제대로 되어 있으면 증빙은 화면 캡처로 충분합니다.", ["use_none", "pf_screenshot"], { r: "쓸 곳이 없더라도 신고 완료 화면은 저장해 두면 나중에 확인할 때 편합니다." }),
  ] },
  { code: "Q10", stage: 2, prompt: "앞으로 이사할 계획이 있고, 베트남에는 얼마나 더 머무를 예정인가요?", f: ["tt_moving", "tt_stayLength"], choices: [
    C("**1년 넘게 이사할 계획이** 없습니다.", "베트남에는 1년 넘게 계속 머무를 예정입니다.", ["mv_none", "sl_over_1y"], { r: "오래 머무를 예정이라면 신고와 함께 거주증 준비도 이어서 생각해 보세요." }),
    C("**몇 달 안에 이사**할 예정입니다.", "베트남에는 3개월에서 1년 정도 더 머물 예정입니다.", ["mv_soon", "sl_3_12m"], { r: "이사하면 새 주소로 다시 신고해야 하니 이사 날짜에 맞춰 신고 일정을 잡아 두세요." }),
    C("**출장이 잦아서** 집을 자주 비웁니다.", "다른 지역에 가면 호텔에서 며칠씩 머무르게 됩니다.", ["mv_travel", "sl_over_1y"], { r: "다른 지역 숙소에서는 숙소가 신고하니, 숙소가 신고했는지 확인하는 습관을 들이세요." }),
    C("**짧게 머물다** 출국할 예정입니다.", "베트남에는 3개월이 안 되는 기간만 머물 예정입니다.", ["mv_short", "sl_under_3m"], { r: "짧은 체류여도 신고는 필요하니 도착하자마자 신고를 마치세요." }),
    C("**체류 계획이 아직** 정해지지 않았습니다.", "얼마나 더 머무를지 회사 일정에 따라 달라집니다.", ["mv_unsure", "sl_unsure"], { r: "계획이 바뀔 때마다 신고 주소가 맞는지 다시 확인하면 과태료를 피할 수 있습니다." }),
  ] },
  { code: "Q11", stage: 2, prompt: "신고하시는 분의 국적은 어디이고, 신고할 때 베트남어 소통은 가능하신가요?", f: ["tt_nationality", "tt_language"], choices: [
    C("**대한민국** 국적입니다.", "베트남어를 전혀 몰라서 동 공안에 갈 때 통역이 꼭 필요합니다.", ["nat_korea", "lang_need"], { r: "통역이 필요하면 방문 전에 통역 일정을 먼저 잡고 서류를 베트남어 목록으로 준비하세요." }),
    C("**중국** 국적입니다.", "베트남어를 할 수 있는 직원이나 가족이 함께 가 줄 수 있습니다.", ["nat_china", "lang_partner"], { r: "함께 가는 사람에게 서류 목록과 신고 주소를 미리 공유해 두면 접수가 빨라집니다." }),
    C("**일본** 국적입니다.", "영어로는 소통할 수 있지만 베트남어는 전혀 하지 못하는 상황입니다.", ["nat_japan", "lang_english"], { r: "동 공안에서는 영어가 통하지 않을 수 있으니 온라인 신고를 먼저 검토하세요." }),
    C("**그 밖의 아시아 국가** 국적입니다.", "베트남어로 간단한 소통은 할 수 있어서 혼자 가도 괜찮습니다.", ["nat_other_asia", "lang_ok"], { r: "혼자 방문하더라도 서류 원본과 사본을 나누어 챙기면 한 번에 끝낼 수 있습니다." }),
    C("**그 밖의 지역** 국적입니다.", "베트남어를 몰라서 신고할 때 통역이 꼭 필요한 상황입니다.", ["nat_other", "lang_need"], { r: "국적과 관계없이 신고 절차는 같으니 통역과 서류 목록만 미리 준비하세요." }),
  ] },
  { code: "Q12", stage: 2, prompt: "받아 본 견적은 몇 건이고, 신고 비용과 대행 범위가 구분되어 있나요?", f: ["tt_quoteStatus", "tt_quoteScope"], choices: [
    C("**견적을 받은 적이 없습니다.**", "비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.", ["quote_none", "qs_na"], { r: "임시 거주 신고 자체는 비용이 크지 않으니 대행을 맡길 때 무엇이 포함되는지 먼저 물어보세요." }),
    C("**한 곳에서 서면 견적**을 받았습니다.", "수수료와 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.", ["quote_one", "qs_clear"], { r: "항목이 나뉘어 있으니 대행 범위에 방문 동행과 확인서 수령이 들어 있는지 확인하세요." }),
    C("**여러 곳에서 견적**을 받았습니다.", "항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.", ["quote_several", "qs_mixed"], { r: "업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다." }),
    C("**말로만 금액**을 들었습니다.", "어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.", ["quote_verbal", "qs_unknown"], { r: "말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요." }),
    C("**광고에 나온 가격**만 보았습니다.", "추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.", ["quote_ad", "qs_unknown"], { r: "광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요." }),
  ] },
  { code: "Q13", stage: 2, prompt: "머무는 곳은 어느 지역이고, 신고를 받는 관할 동 공안을 알고 계신가요?", f: ["tt_area", "tt_wardKnown"], choices: [
    C("**하노이**에서 지내고 있습니다.", "관할 동 공안의 위치와 접수 시간을 이미 알고 있습니다.", ["area_hanoi", "wk_known"], { r: "접수 시간만 한 번 더 확인하면 헛걸음을 줄일 수 있습니다." }),
    C("**호치민**에서 지내고 있습니다.", "관할 동 공안이 어디인지 몰라서 어디로 가야 하는지 알고 싶습니다.", ["area_hcm", "wk_unknown"], { r: "집 주소 기준으로 관할 동 공안을 먼저 찾아야 신고 방법과 시간을 알 수 있습니다." }),
    C("**다낭**에서 지내고 있습니다.", "최근 행정구역이 바뀌어 관할 동 공안이 달라졌는지 모르겠습니다.", ["area_danang", "wk_changed"], { r: "행정구역 개편으로 관할이 바뀌었을 수 있으니 신고 전에 관할 기관을 확인하세요." }),
    C("**그 밖의 도시**에서 지내고 있습니다.", "가 본 적이 있어서 동 공안의 위치는 알고 있습니다.", ["area_other_city", "wk_known"], { r: "외곽 지역은 신고 기한이 조금 다를 수 있으니 관할 동 공안에 기한을 확인하세요." }),
    C("**머물 지역이 아직 정해지지** 않았습니다.", "어느 동 공안에 신고해야 하는지도 아직 모릅니다.", ["area_unsure", "wk_unknown"], { r: "머물 곳이 정해지면 그 주소의 관할 동 공안에 신고하게 되니 주소부터 정하세요." }),
  ] },
];

export const cardTitles = { Q1: "신고 사유와 숙소", Q2: "도착 시점과 신고자", Q3: "집주인과 계약", Q4: "여권·비자와 이전 기록" };
export const summaries = {
  "tt_mainConcern=concern_fine|tt_helpWanted=help_guide": {
    headline: "과태료가 걱정되어 직접 신고하려는 상황입니다",
    body: "임시 거주 신고는 숙소 운영자나 집주인이 도착 후 12시간(외곽 지역 24시간) 안에 하도록 정해져 있습니다. 누가 신고하는지부터 정하면 과태료 걱정을 줄일 수 있습니다.",
  },
  "tt_mainConcern=concern_docs|tt_helpWanted=help_guide": {
    headline: "필요한 서류부터 확인해 직접 신고하려는 상황입니다",
    body: "기본 서류는 여권, 비자 면, 임대차 계약서, 집주인 서류입니다. 온라인 신고와 동 공안 방문 신고 중 방법을 정하면 준비할 서류가 분명해집니다.",
  },
  "tt_mainConcern=concern_late|tt_helpWanted=help_accompany": {
    headline: "신고가 늦었을까 걱정되어 동행을 원하는 상황입니다",
    body: "기한이 지났다면 미루지 말고 바로 신고하는 것이 좋습니다. 늦어진 사정을 설명할 수 있도록 도착 날짜와 계약 날짜를 정리해 가세요.",
  },
  "tt_mainConcern=concern_landlord|tt_helpWanted=help_full": {
    headline: "집주인 문제가 걱정되어 전 과정을 맡기려는 상황입니다",
    body: "신고 의무는 숙소를 관리하는 쪽에 있어 집주인 협조가 중요합니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  },
  "tt_mainConcern=concern_quote|tt_helpWanted=help_accompany": {
    headline: "받은 견적을 확인하고 신고는 함께 하려는 상황입니다",
    body: "임시 거주 신고는 절차가 간단한 편이라, 견적에 방문 동행과 확인서 수령이 포함되는지 먼저 비교하세요. 같은 항목끼리 맞춰 보면 차이가 보입니다.",
  },
};
export const risks = {
  max: 4,
  fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신고가 끝난 뒤 확인 화면이나 확인서를 꼭 보관하세요",
  rules: [
    { id: "late", clauses: [["tt_timing", ["tt_over24", "tt_unknown"]]], sentence: "도착 후 하루가 지났거나 시점을 모르면 과태료 대상이 될 수 있어 바로 신고해야 합니다" },
    { id: "landlord", clauses: [["tt_landlord", ["ll_unreachable", "ll_refuses"]]], sentence: "집주인이 연락되지 않거나 신고를 꺼리면 신고 방법과 숙소 문제를 먼저 정리해야 합니다" },
    { id: "lease", clauses: [["tt_lease", ["lease_sublet", "lease_none"]]], sentence: "다시 빌린 집이거나 계약서가 없으면 거주를 증명하기 어려워 계약 관계부터 확인해야 합니다" },
    { id: "passport", clauses: [["tt_passportVisa", ["pv_expiring", "pv_held"]]], sentence: "비자 만료가 가깝거나 여권을 맡겨 두었다면 신고에 쓸 서류 사본과 일정을 먼저 맞춰야 합니다" },
    { id: "record", clauses: [["tt_priorRecord", ["pr_old_address"]]], sentence: "이전 주소 신고가 남아 있다면 새 주소로 다시 신고해야 서류 주소가 맞습니다" },
    { id: "declarant", clauses: [["tt_declarant", ["dc_unknown", "dc_company"]]], sentence: "누가 신고했는지 확인되지 않았다면 신고가 끝났는지부터 확인해야 합니다" },
    { id: "owner", clauses: [["tt_ownerDocs", ["od_refused"]]], sentence: "집주인이 서류를 주지 않으면 신고가 막힐 수 있어 관할 동 공안에 다른 방법을 물어봐야 합니다" },
  ],
};
export const phase2Titles = { Q6: "신고 서류", Q7: "신고 방법", Q8: "함께 머무는 가족", Q9: "확인서 사용처", Q10: "이사와 체류 계획", Q11: "국적과 소통", Q12: "견적과 비용", Q13: "지역과 관할" };
export const connections = [
  { name: "거주증 확인", clauses: [["tt_use", ["use_trc"]], ["tt_stayLength", ["sl_over_1y"]]], sentence: "오래 머무르시거나 거주증을 신청하신다면 거주증 직접 확인에서 이어서 점검해 보실 수 있습니다.", path: "/verify/trc" },
  { name: "노동허가 확인", clauses: [["tt_use", ["use_wp"]]], sentence: "노동허가를 준비 중이시라면 노동허가 직접 확인에서 함께 점검해 보실 수 있습니다.", path: "/verify/wp" },
  { name: "전문가 진행", clauses: [["tt_timing", ["tt_over24"]], ["tt_landlord", ["ll_refuses"]], ["tt_helpWanted", ["help_full"]]], sentence: "신고가 늦었거나 집주인이 협조하지 않는다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["신고할 사람 정하기", "여권·비자·계약서 준비", "집주인 서류 확인", "신고 방법 선택", "확인서 보관"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 처리 결과를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다. 성격이 보도 기준 또는 참고인 자료는 원문 확인 전 정보이므로 관할 기관에서 최종 확인해 주세요.",
  sources: { confirmedOn: "2026.10.12", rows: [
    { id: "1", name: "외국인의 입국·출국·통과·거주에 관한 법 (제47/2014/QH13호, 제51/2019/QH14호·2023년 개정): 숙소 운영자는 외국인 도착 후 12시간(외곽 지역 24시간) 안에 임시 거주를 신고", publisher: "베트남 국회", kind: "보도 기준", urls: ["https://thuviennhadat.vn/phap-luat/quy-dinh-ve-khai-bao-tam-tru-cho-nguoi-nuoc-ngoai-nhu-the-nao-605700.html"], note: "숙소 운영자의 신고 기한(12시간, 외곽 24시간)은 제33조 2항으로 확인함. 법 개정은 제51/2019호와 제23/2023호(2023.8.15 시행)로 확인함(이차 자료 기준). 본문에는 조문 번호를 쓰지 않음" },
    { id: "2", name: "치안·질서 분야 행정위반 처벌 시행령 (제144/2021/NĐ-CP호): 외국인 임시 거주 미신고 시 개인 400만에서 600만 동, 단체는 그 두 배", publisher: "베트남 정부", kind: "보도 기준", urls: ["https://thuviennhadat.vn/phap-luat/quy-dinh-ve-khai-bao-tam-tru-cho-nguoi-nuoc-ngoai-nhu-the-nao-605700.html"], note: "금액은 개정 여부를 시행 시점에 다시 확인" },
  ] },
};
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: [["tt_helpWanted", ["help_full"]], ["tt_timing", ["tt_over24"]], ["tt_landlord", ["ll_refuses"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: [["tt_helpWanted", ["help_accompany"]], ["tt_method", ["m_unknown"]], ["tt_wardKnown", ["wk_unknown", "wk_changed"]]] },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
// 기존 판정 함수 computeTamtruResultTone(timing)에 넣을 값. null 은 "추가 확인 필요".
export const diagnosisMap = {
  timing: { tt_within12: "within12", tt_within24: "within24", tt_over24: "over24", tt_before_arrival: null, tt_unknown: null },
};
export const diagnosisFields = { timing: "tt_timing" };
