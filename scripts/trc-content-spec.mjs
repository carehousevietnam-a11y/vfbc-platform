// TRC pilot content spec. Q1-Q5 = 1st stage (card), Q6-Q13 = 2nd stage (guide r).
export const labels = {
  new_issue: "처음 발급", renewal: "기존 거주증 갱신", after_visa_change: "비자 종류를 바꾼 뒤 발급", lost_reissue: "분실·훼손 재발급", stage_unsure: "어떤 절차인지 모름",
  stay_valid: "유효한 비자로 체류 중", stay_expiring: "만료일이 가까움", stay_outside: "현재 해외에 있음", stay_unsure: "체류 기간을 정확히 모름",
  visa_invest: "투자 비자", visa_work: "노동허가 비자", visa_tourist: "관광·단기 비자", visa_other: "그 밖의 비자", visa_unsure: "비자 종류를 모름",
  role_legal_rep: "법인장·법정대표자", role_manager: "관리직", role_staff: "일반 직원", role_none: "직위 없음·미정",
  company_fdi: "외국인 투자 법인", company_local: "베트남 현지 법인", company_unregistered: "등록 전·준비 중인 회사", company_family: "회사가 아닌 가족 초청", company_unsure: "초청 주체 미정",
  pp_over_2y: "여권 2년 넘게 남음", pp_1_2y: "여권 1년에서 2년 남음", pp_under_1y: "여권 1년 미만 남음", pp_unknown: "여권 남은 기간 미확인",
  rej_none: "반려된 적 없음", rej_docs: "서류 보완 요구 이력", rej_sponsor: "회사·보증 문제 반려 이력", rej_stay: "체류 자격 문제 반려 이력", rej_unknown: "반려 사유를 모름",
  ph_self: "직접 신청", ph_agency: "대행사에 맡김", ph_company: "회사 담당자가 진행", ph_none: "신청 경험 없음",
  concern_cost: "총비용 걱정", concern_docs: "필요 서류 걱정", concern_time: "일정 지연 걱정", concern_eligibility: "발급 자격 걱정", concern_quote: "받은 견적의 적정성 걱정",
  help_guide: "서류 작성 안내를 원함", help_accompany: "서류 작성과 제출 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "기본 서류 모두 준비", docs_most: "기본 서류 대부분 준비", docs_half: "기본 서류 절반 준비", docs_little: "기본 서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  tn_none: "번역·공증 필요 없음", tn_needed: "번역·공증 필요함", tn_unsure: "번역·공증 필요 여부 모름",
  tamtru_done: "임시 거주 신고 유효", tamtru_expired: "임시 거주 신고 기간 지남", tamtru_changed: "이사 후 재신고 안 함", tamtru_not_yet: "임시 거주 신고 안 함", tamtru_unsure: "신고 상태를 모름",
  rp_lease: "임대차 계약서 있음", rp_hotel: "숙소 확인서만 있음", rp_family_owned: "가족·지인 소유 주택", rp_none: "거주지 증빙 없음",
  host_current: "회사 서류가 최신", host_changes: "회사 정보 변경 진행 중", host_inactive: "회사 휴업·정리 중", host_personal: "회사가 아닌 가족 신청", host_unknown: "회사 서류 상태를 모름",
  wp_have: "노동허가 보유", wp_in_progress: "노동허가 신청 전·진행 중", wp_exempt: "노동허가 면제 확인", wp_na: "노동허가 불필요", wp_unsure: "노동허가 필요 여부 모름",
  exp_under_2w: "2주 안에 만료", exp_2w_1m: "만료까지 2주에서 1개월", exp_1m_3m: "만료까지 1개월에서 3개월", exp_over_3m: "만료까지 3개월 넘게 남음", exp_expired: "이미 만료",
  cp_up_2y: "2년 이하 카드", cp_2_5y: "2년 초과 5년 이하 카드", cp_5_10y: "5년 초과 10년 이하 카드", cp_unsure: "카드 기간 미정",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "정부 수수료와 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  nat_korea: "대한민국 국적", nat_china: "중국 국적", nat_japan: "일본 국적", nat_other_asia: "그 밖의 아시아 국적", nat_other: "그 밖의 지역 국적",
  sub_self: "직접 제출", sub_hr: "회사 담당자가 제출", sub_agency: "대행사가 제출", sub_undecided: "제출 방식 미정",
  ap_self_only: "본인만 신청", ap_spouse: "배우자와 함께 신청", ap_child: "자녀와 함께 신청", ap_spouse_children: "배우자·자녀와 함께 신청", ap_parents: "부모와 함께 신청",
  fd_ready: "가족 관계 서류 준비·인증 완료", fd_apostille: "가족 관계 서류는 있으나 인증 필요", fd_missing: "가족 관계 서류 미준비", fd_na: "가족 서류 불필요",
  area_hanoi: "하노이 제출", area_hcm: "호치민 제출", area_danang: "다낭 제출", area_other_city: "그 밖의 도시 제출", area_unsure: "제출 지역 미정",
  of_known: "담당 사무소를 알고 있음", of_unknown: "담당 사무소를 모름", of_changed: "행정구역 변경으로 담당 사무소 불확실",
};
const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });
export const questions = [
  { code: "Q1", stage: 1, prompt: "거주증이 필요한 상황은 어떤 단계이고, 지금 베트남에서의 체류 상태는 어떤가요?", f: ["trc_stage", "trc_stayStatus"], choices: [
    C("**처음 발급**받으려고 합니다.", "지금 유효한 비자로 베트남에 머무르고 있어 체류에는 문제가 없습니다.", ["new_issue", "stay_valid"], { card: "처음 거주증을 발급받으려는 상황입니다" }),
    C("**기존 거주증을 갱신**하려고 합니다.", "거주증 만료일이 가까워 서둘러 준비하고 싶습니다.", ["renewal", "stay_expiring"], { card: "만료가 가까워 거주증을 갱신하려는 상황입니다" }),
    C("**비자 종류를 바꾼 뒤** 새로 받으려고 합니다.", "바뀐 비자는 유효하지만 거주증은 아직 없는 상태입니다.", ["after_visa_change", "stay_valid"], { card: "비자를 바꾼 뒤 거주증을 새로 받으려는 상황입니다" }),
    C("**분실이나 훼손으로 다시 발급**받으려고 합니다.", "지금은 해외에 있고 곧 베트남으로 돌아올 예정입니다.", ["lost_reissue", "stay_outside"], { card: "거주증을 잃어버려 다시 발급받으려는 상황입니다" }),
    C("**어떤 절차가 맞는지 모르겠습니다.**", "체류 기간이 얼마나 남았는지도 정확히 모릅니다.", ["stage_unsure", "stay_unsure"], { card: "필요한 절차와 체류 기간부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q2", stage: 1, prompt: "가지고 계신 비자는 어떤 종류이고, 회사에서 맡은 직위는 무엇인가요?", f: ["trc_visaStatus", "trc_role"], choices: [
    C("**투자 비자**를 가지고 있습니다.", "법인의 대표나 법정대표자로 일하고 있어 회사 서류도 직접 챙깁니다.", ["visa_invest", "role_legal_rep"], { card: "투자 비자로 법인 대표를 맡고 있는 상황입니다" }),
    C("**노동허가를 받은 비자**를 가지고 있습니다.", "팀이나 부서를 이끄는 관리직으로 일하고 있습니다.", ["visa_work", "role_manager"], { card: "노동허가 비자로 관리직을 맡고 있는 상황입니다" }),
    C("**관광이나 단기 비자**로 들어왔습니다.", "아직 정식 직위는 없고 일할 곳을 알아보는 중입니다.", ["visa_tourist", "role_none"], { card: "단기 비자로 들어와 체류 자격을 알아보는 상황입니다" }),
    C("**그 밖의 비자**를 가지고 있습니다.", "일반 직원으로 맡은 실무를 하고 있고 회사 서류는 담당자가 챙깁니다.", ["visa_other", "role_staff"], { card: "그 밖의 비자로 일반 직원 업무를 하는 상황입니다" }),
    C("**비자 종류를 정확히 모릅니다.**", "회사에서 맡을 직위도 아직 정해지지 않아 함께 확인하고 싶습니다.", ["visa_unsure", "role_none"], { card: "비자 종류와 직위부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q3", stage: 1, prompt: "초청하는 회사는 어떤 상태이고, 여권은 유효기간이 얼마나 남아 있나요?", f: ["trc_companyStatus", "trc_passportRemain"], choices: [
    C("**외국인 투자 법인**이 초청합니다.", "여권 유효기간이 2년 넘게 남아 있어 카드 기간 선택에 여유가 있습니다.", ["company_fdi", "pp_over_2y"], { card: "외국인 투자 법인이 초청하고 여권 기간이 넉넉한 상황입니다" }),
    C("**베트남 현지 법인**이 초청합니다.", "여권 유효기간이 1년에서 2년 사이로 남아 있습니다.", ["company_local", "pp_1_2y"], { card: "현지 법인이 초청하고 여권 기간이 1년에서 2년 남은 상황입니다" }),
    C("**아직 등록이 끝나지 않은 회사**입니다.", "여권 유효기간이 1년도 남지 않아 카드 기간이 짧아질까 걱정됩니다.", ["company_unregistered", "pp_under_1y"], { card: "회사 등록 전이고 여권 기간이 1년 미만인 상황입니다" }),
    C("**회사가 아닌 가족**이 초청합니다.", "여권 유효기간이 2년 넘게 남아서 걱정이 없습니다.", ["company_family", "pp_over_2y"], { card: "가족 초청으로 신청하고 여권 기간이 넉넉한 상황입니다" }),
    C("**초청할 주체가 아직 정해지지 않았습니다.**", "여권 남은 기간을 아직 확인해 보지 못했습니다.", ["company_unsure", "pp_unknown"], { card: "초청 주체와 여권 기간을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "이전에 반려나 거절을 받은 적이 있고, 그때는 누가 신청을 진행했나요?", f: ["trc_rejection", "trc_priorHandling"], choices: [
    C("**반려된 적이 없습니다.**", "이번이 첫 신청이라 직접 진행해 본 경험도 없고 절차도 낯섭니다.", ["rej_none", "ph_none"], { card: "반려 이력이 없는 첫 신청 상황입니다" }),
    C("**서류 보완 요구**를 받은 적이 있습니다.", "제가 직접 출입국 사무소에 가서 신청했습니다.", ["rej_docs", "ph_self"], { card: "직접 신청했다가 서류 보완 요구를 받은 상황입니다" }),
    C("**회사나 보증 문제**로 반려된 적이 있습니다.", "대행사에 맡겨서 신청을 진행했고 반려 사유는 전달받았습니다.", ["rej_sponsor", "ph_agency"], { card: "대행 신청이 회사 문제로 반려된 적이 있는 상황입니다" }),
    C("**체류 자격 문제**로 반려된 적이 있습니다.", "회사의 인사 담당자가 대신 신청해 주었습니다.", ["rej_stay", "ph_company"], { card: "회사 담당자의 신청이 체류 자격 문제로 반려된 상황입니다" }),
    C("**반려되었지만 이유를 모릅니다.**", "직접 신청했는데 반려 사유에 대한 자세한 안내를 받지 못했습니다.", ["rej_unknown", "ph_self"], { card: "반려 사유를 모르는 채 다시 준비하는 상황입니다" }),
  ] },
  { code: "Q5", stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?", f: ["trc_mainConcern", "trc_helpWanted"], choices: [
    C("**총비용이 얼마인지** 걱정됩니다.", "필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.", ["concern_cost", "help_guide"], { card: "총비용을 알고 직접 서류를 준비하려는 상황입니다" }),
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 알고 싶은 상황입니다" }),
    C("**일정이 늦어질까** 걱정됩니다.", "제출하는 날 출입국 사무소에 통역과 함께 가고 싶습니다.", ["concern_time", "help_accompany"], { card: "일정이 걱정되어 제출 동행을 원하는 상황입니다" }),
    C("**발급 자격이 되는지** 모르겠습니다.", "서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.", ["concern_eligibility", "help_full"], { card: "자격이 걱정되어 전 과정을 맡기고 싶은 상황입니다" }),
    C("**받은 견적이 적정한지** 모르겠습니다.", "서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.", ["concern_quote", "help_accompany"], { card: "받은 견적이 적정한지 확인하려는 상황입니다" }),
  ] },
  { code: "Q6", stage: 2, prompt: "기본 서류는 어디까지 준비되어 있고, 번역이나 공증이 필요한 서류가 있나요?", f: ["trc_docsReady", "trc_translationNeed"], choices: [
    C("**여권과 사진, 신청서가 모두** 준비되었습니다.", "베트남어로 번역하거나 공증할 서류는 없습니다.", ["docs_all", "tn_none"], { r: "기본 서류가 갖춰져 있으니 서류 이름과 사본 수를 한 번 더 맞춰 보고 제출 일정부터 잡으세요." }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "외국에서 발급받은 서류는 번역과 공증이 필요합니다.", ["docs_most", "tn_needed"], { r: "남은 서류와 번역·공증이 필요한 서류를 나누어 적고 공증 소요 기간을 먼저 확인하세요." }),
    C("**절반쯤 준비**했습니다.", "번역이나 공증이 필요한 서류가 있는지 몰라서 확인이 필요합니다.", ["docs_half", "tn_unsure"], { r: "준비한 서류 목록을 만든 뒤 외국 발급 서류가 있는지 골라내면 번역 대상이 분명해집니다." }),
    C("**거의 준비하지 못했습니다.**", "번역과 공증을 어디서 어떻게 하는지도 함께 알고 싶습니다.", ["docs_little", "tn_needed"], { r: "처음부터 서류 목록을 받아 준비 순서를 정하고 번역·공증 업체를 함께 알아보세요." }),
    C("**무엇이 필요한지 아직 모릅니다.**", "준비한 서류가 하나도 없어서 번역할 서류도 아직 없는 상태입니다.", ["docs_unknown", "tn_none"], { r: "서류를 모으기 전에 신청 유형별 필요 서류를 먼저 확인하는 것이 순서입니다." }),
  ] },
  { code: "Q7", stage: 2, prompt: "임시 거주 신고(땀주)는 되어 있고, 지금 사는 곳을 증명할 서류가 있나요?", f: ["trc_tamtruStatus", "trc_residenceProof"], choices: [
    C("**신고가 되어 있고 기간이 남아** 있습니다.", "거주지를 증명할 임대차 계약서를 가지고 있고 계약 기간도 남았습니다.", ["tamtru_done", "rp_lease"], { r: "신고 확인서와 임대차 계약서의 주소가 같은지 맞춰 보면 제출 서류가 정리됩니다." }),
    C("**신고 기간이 지났습니다.**", "호텔이나 숙소에서 받은 투숙 확인서만 있고 계약서는 따로 없습니다.", ["tamtru_expired", "rp_hotel"], { r: "기간이 지난 신고는 다시 해야 하므로 거주 신고부터 마치고 거주증 신청 일정을 잡으세요." }),
    C("**이사했는데 새 주소로 신고하지 않았습니다.**", "새 집의 임대차 계약서는 가지고 있습니다.", ["tamtru_changed", "rp_lease"], { r: "새 주소로 신고를 먼저 하고, 그 확인서와 새 계약서를 함께 준비하세요." }),
    C("**아직 신고한 적이 없습니다.**", "가족이나 지인의 집에 살아서 증빙 서류가 따로 없습니다.", ["tamtru_not_yet", "rp_family_owned"], { r: "집주인의 확인과 주택 소유 서류가 필요할 수 있으니 필요한 것부터 집주인과 상의하세요." }),
    C("**신고 상태를 정확히 모릅니다.**", "지금 사는 곳을 증명할 서류가 하나도 없어서 마련할 방법이 궁금합니다.", ["tamtru_unsure", "rp_none"], { r: "관할 파출소 확인이나 신고 내역 조회로 신고 상태를 알아낸 뒤 증빙을 마련하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "초청하는 회사의 서류는 최신 상태이고, 노동허가와는 어떻게 연결되어 있나요?", f: ["trc_hostDocs", "trc_permitLink"], choices: [
    C("**회사 서류가 최신 상태**입니다.", "노동허가를 이미 받아 두었고 허가서 유효기간도 아직 남아 있습니다.", ["host_current", "wp_have"], { r: "회사 서류와 노동허가의 기간이 거주증 기간을 감당하는지 날짜만 맞춰 보면 됩니다." }),
    C("**대표자나 주소 변경을 진행** 중입니다.", "노동허가 갱신도 함께 진행하고 있어서 두 절차의 순서가 고민입니다.", ["host_changes", "wp_in_progress"], { r: "변경이 끝나기 전에 제출하면 서류가 어긋날 수 있으니 변경 완료 시점을 기준으로 일정을 잡으세요." }),
    C("**회사가 휴업 중이거나 정리** 중입니다.", "투자자 자격으로 노동허가 면제 확인을 받아 두었습니다.", ["host_inactive", "wp_exempt"], { r: "휴업 중인 회사는 초청 자격이 달라질 수 있으니 회사 상태부터 확인해야 합니다." }),
    C("**회사가 아니라 가족 관계**로 신청합니다.", "노동허가가 필요하지 않은 신분이라 회사 서류는 해당되지 않습니다.", ["host_personal", "wp_na"], { r: "가족 초청은 회사 서류 대신 관계 증명 서류가 중심이 되므로 그 서류를 먼저 확인하세요." }),
    C("**회사 서류가 어떤 상태인지 모릅니다.**", "노동허가가 필요한 경우인지 확인하지 못했습니다.", ["host_unknown", "wp_unsure"], { r: "회사 담당자에게 사업자등록 상태와 노동허가 필요 여부를 먼저 물어 확인하세요." }),
  ] },
  { code: "Q9", stage: 2, prompt: "지금 비자나 거주증은 만료까지 얼마나 남았고, 몇 년짜리 카드를 원하시나요?", f: ["trc_expiryRemain", "trc_cardPeriod"], choices: [
    C("**2주 안에 만료**됩니다.", "2년 이하의 짧은 카드면 충분하고 수수료는 가장 낮은 구간을 원합니다.", ["exp_under_2w", "cp_up_2y"], { r: "만료가 매우 가깝다면 서류를 완성하는 날부터 접수까지 걸리는 시간을 가장 먼저 줄여야 합니다." }),
    C("**2주에서 1개월 사이**로 남았습니다.", "2년을 넘고 5년 이하인 카드를 원하며 그에 맞는 수수료가 궁금합니다.", ["exp_2w_1m", "cp_2_5y"], { r: "2년에서 5년 카드의 공식 수수료는 155달러이며, 만료 전에 접수하도록 일정을 역산하세요." }),
    C("**1개월에서 3개월 사이**로 남았습니다.", "5년을 넘는 장기 카드를 원하고 여권 기간이 충분한지도 알고 싶습니다.", ["exp_1m_3m", "cp_5_10y"], { r: "장기 카드는 수수료가 165달러이고 여권 유효기간이 충분해야 하니 여권 기간부터 확인하세요." }),
    C("**3개월 넘게 남아** 있습니다.", "몇 년짜리 카드가 내 상황에 맞는지 아직 몰라서 비교해 보고 싶습니다.", ["exp_over_3m", "cp_unsure"], { r: "시간 여유가 있으니 카드 기간별 수수료(145·155·165달러)를 비교해 기간을 정하세요." }),
    C("**이미 만료**되었습니다.", "2년 이하의 짧은 카드로 우선 정리하고 나중에 다시 연장하고 싶습니다.", ["exp_expired", "cp_up_2y"], { r: "만료 후 체류 상태에 따라 절차가 달라질 수 있으니 체류 상태 확인을 가장 먼저 하세요." }),
  ] },
  { code: "Q10", stage: 2, prompt: "받아 본 견적은 몇 건이고, 정부 수수료와 대행 범위가 구분되어 있나요?", f: ["trc_quoteStatus", "trc_quoteScope"], choices: [
    C("**견적을 받은 적이 없습니다.**", "비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.", ["quote_none", "qs_na"], { r: "견적을 받기 전에 정부 수수료와 대행료, 번역·공증비를 나누어 요청하세요." }),
    C("**한 곳에서 서면 견적**을 받았습니다.", "정부 수수료와 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.", ["quote_one", "qs_clear"], { r: "항목이 나뉘어 있으니 정부 수수료가 공식 금액과 같은지만 대조해 보세요." }),
    C("**여러 곳에서 견적**을 받았습니다.", "항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.", ["quote_several", "qs_mixed"], { r: "업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다." }),
    C("**말로만 금액**을 들었습니다.", "어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.", ["quote_verbal", "qs_unknown"], { r: "말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요." }),
    C("**광고에 나온 가격**만 보았습니다.", "추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.", ["quote_ad", "qs_unknown"], { r: "광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요." }),
  ] },
  { code: "Q11", stage: 2, prompt: "신청하시는 분의 국적은 어디이고, 신청서는 누가 제출하게 될 예정인가요?", f: ["trc_nationality", "trc_submitter"], choices: [
    C("**대한민국** 국적입니다.", "제가 직접 출입국 사무소에 가서 서류를 제출하려고 준비하고 있습니다.", ["nat_korea", "sub_self"], { r: "직접 제출한다면 접수 시간과 원본·사본 구분, 통역 필요 여부를 미리 확인하세요." }),
    C("**중국** 국적입니다.", "회사 담당자가 서류를 대신 제출해 주기로 이야기가 되어 있습니다.", ["nat_china", "sub_hr"], { r: "회사 담당자가 제출하면 위임 서류와 제출 후 진행 상황을 받는 방법을 정해 두세요." }),
    C("**일본** 국적입니다.", "대행사에 서류 제출을 맡기려고 하고 어느 업체가 좋을지 알아보는 중입니다.", ["nat_japan", "sub_agency"], { r: "대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요." }),
    C("**그 밖의 아시아 국가** 국적입니다.", "누가 제출할지 아직 정하지 못해서 방법별로 비교해 보고 싶습니다.", ["nat_other_asia", "sub_undecided"], { r: "제출 방식을 정하려면 직접·회사·대행 세 가지의 비용과 일정을 비교해 보세요." }),
    C("**그 밖의 지역** 국적입니다.", "직접 제출하지만 베트남어를 몰라서 통역이 꼭 필요한 상황입니다.", ["nat_other", "sub_self"], { r: "국적에 따라 필요한 인증 서류가 다를 수 있으니 본국 서류의 인증 절차를 확인하세요." }),
  ] },
  { code: "Q12", stage: 2, prompt: "함께 신청하는 가족이 있고, 가족 관계를 증명할 서류는 준비되어 있나요?", f: ["trc_applicants", "trc_familyDocs"], choices: [
    C("**저 혼자** 신청합니다.", "가족 관계를 증명할 서류는 필요하지 않아 제 서류만 준비하면 됩니다.", ["ap_self_only", "fd_na"], { r: "혼자 신청하는 경우라 본인 서류만 정리하면 되고, 가족 서류는 준비하지 않아도 됩니다." }),
    C("**배우자와 함께** 신청합니다.", "결혼증명서를 준비했고 영사 인증도 이미 받아 두었습니다.", ["ap_spouse", "fd_ready"], { r: "인증이 끝난 결혼증명서는 번역본을 함께 준비해 부부 서류를 같은 날 접수하세요." }),
    C("**자녀와 함께** 신청합니다.", "출생증명서는 가지고 있지만 영사 인증은 아직 받지 못했습니다.", ["ap_child", "fd_apostille"], { r: "출생증명서는 인증과 번역이 필요할 수 있으니 인증 소요 기간을 먼저 확인하세요." }),
    C("**배우자와 자녀 모두** 함께 신청합니다.", "가족 관계 증명서를 아직 준비하지 못했습니다.", ["ap_spouse_children", "fd_missing"], { r: "가족이 여럿이면 서류가 늘어나므로 사람별 필요 서류 표를 만들어 하나씩 채우세요." }),
    C("**부모님과 함께** 신청합니다.", "부모님 관계를 증명하는 데 어떤 서류가 필요한지 아직 모르겠습니다.", ["ap_parents", "fd_missing"], { r: "부모 동반은 체류 자격 기준이 달라질 수 있으니 가능한 신분인지 먼저 확인하세요." }),
  ] },
  { code: "Q13", stage: 2, prompt: "서류를 제출할 지역은 어디이고, 담당 출입국 사무소를 알고 계신가요?", f: ["trc_filingArea", "trc_officeKnown"], choices: [
    C("**하노이**에서 제출합니다.", "담당 사무소의 위치와 접수 시간을 이미 알고 있어서 방문만 하면 됩니다.", ["area_hanoi", "of_known"], { r: "접수 시간과 예약 여부만 한 번 더 확인하면 헛걸음을 줄일 수 있습니다." }),
    C("**호치민**에서 제출합니다.", "담당 사무소가 어디인지 몰라서 어느 곳으로 가야 하는지 알고 싶습니다.", ["area_hcm", "of_unknown"], { r: "거주 지역에 맞는 담당 사무소를 먼저 찾아야 접수 가능 시간과 필요 서류를 알 수 있습니다." }),
    C("**다낭**에서 제출합니다.", "최근 행정구역이 바뀌어서 담당 사무소가 달라졌는지 모르겠습니다.", ["area_danang", "of_changed"], { r: "행정구역 개편으로 담당 기관이 바뀔 수 있으니 접수 전에 해당 기관에 직접 확인하세요." }),
    C("**그 밖의 도시**에서 제출합니다.", "이전에 가 본 적이 있어서 사무소 위치는 알고 있지만 접수 시간은 모릅니다.", ["area_other_city", "of_known"], { r: "지방은 접수 요일이 제한될 수 있으니 방문 전에 전화로 일정을 확인하세요." }),
    C("**제출 지역이 아직 정해지지 않았습니다.**", "어느 사무소로 가야 하는지도 모르고 접수 방법도 확인하지 못했습니다.", ["area_unsure", "of_unknown"], { r: "거주지와 회사 소재지 중 어느 쪽 관할인지 확인해 제출 지역을 정하세요." }),
  ] },
];

// ── 1차 결과: 카드(Q1~Q4) 제목, 상황 정리(Q5 선택별 제목+안내). 판정·점수·가격은 넣지 않는다.
export const cardTitles = { Q1: "신청 단계", Q2: "비자와 직위", Q3: "회사와 여권", Q4: "이전 이력" };
export const summaries = {
  "trc_mainConcern=concern_cost|trc_helpWanted=help_guide": {
    headline: "총비용을 확인하고 서류는 직접 준비하려는 상황입니다",
    body: "공식 수수료는 카드 기간에 따라 145·155·165달러로 정해져 있고, 번역·공증과 대행료는 별도로 확인해야 합니다. 서류 목록을 받아 직접 준비하는 순서로 정리하세요.",
  },
  "trc_mainConcern=concern_docs|trc_helpWanted=help_guide": {
    headline: "필요한 서류부터 확인해 직접 준비하려는 상황입니다",
    body: "거주증 신청에는 신청서, 여권과 사진, 비자, 거주지와 초청 회사 서류가 기본으로 필요합니다. 신청 유형에 따라 달라지므로 서류 목록을 단계별로 확인하세요.",
  },
  "trc_mainConcern=concern_time|trc_helpWanted=help_accompany": {
    headline: "일정 지연이 걱정되어 제출 동행을 원하는 상황입니다",
    body: "서류가 갖춰진 뒤에 접수해야 처리 기간이 시작되고, 보완 요구가 생기면 늘어날 수 있습니다. 제출 전에 서류를 한 번 더 점검하면 보완 요구를 줄일 수 있습니다.",
  },
  "trc_mainConcern=concern_eligibility|trc_helpWanted=help_full": {
    headline: "발급 자격이 걱정되어 전 과정을 맡기려는 상황입니다",
    body: "거주증은 비자 종류와 초청 주체, 체류 상태에 따라 가능 여부가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  },
  "trc_mainConcern=concern_quote|trc_helpWanted=help_accompany": {
    headline: "받은 견적을 확인하고 제출은 함께 하려는 상황입니다",
    body: "견적은 정부 수수료, 번역·공증, 대행료가 나뉘어 있는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 어디서 생기는지 알 수 있습니다.",
  },
};
export const risks = {
  max: 4,
  fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 서류 목록과 수수료를 한 번 더 확인하세요",
  rules: [
    { id: "stay", clauses: [["trc_stayStatus", ["stay_expiring", "stay_unsure", "stay_outside"]]], sentence: "체류 기간이 가깝거나 불분명하면 만료 전에 접수하도록 일정을 먼저 정리해야 합니다" },
    { id: "visa", clauses: [["trc_visaStatus", ["visa_tourist", "visa_unsure"]]], sentence: "관광·단기 비자이거나 비자 종류를 모르면 거주증 신청 대상인지 먼저 확인해야 합니다" },
    { id: "company", clauses: [["trc_companyStatus", ["company_unregistered", "company_unsure"]]], sentence: "초청 회사가 등록 전이거나 정해지지 않았다면 초청 서류를 만들 수 없어 회사 상태부터 확인해야 합니다" },
    { id: "passport", clauses: [["trc_passportRemain", ["pp_under_1y", "pp_unknown"]]], sentence: "여권 남은 기간이 짧으면 카드 기간이 짧아지거나 여권 갱신이 먼저 필요할 수 있습니다" },
    { id: "rejection", clauses: [["trc_rejection", ["rej_docs", "rej_sponsor", "rej_stay", "rej_unknown"]]], sentence: "이전 반려 사유를 확인하면 같은 문제를 피할 수 있으니 반려 통지나 안내를 먼저 찾아보세요" },
    { id: "quote", clauses: [["trc_mainConcern", ["concern_quote"]]], sentence: "받은 견적은 정부 수수료와 대행료가 나뉘어 있는지부터 확인하세요" },
    { id: "lost", clauses: [["trc_stage", ["lost_reissue"]]], sentence: "분실 재발급은 분실 사실을 확인하는 서류가 추가로 필요할 수 있습니다" },
    { id: "expiry", clauses: [["trc_expiryRemain", ["exp_under_2w", "exp_expired"]]], sentence: "만료가 2주 안이거나 이미 지났다면 접수 가능 여부와 체류 연장부터 바로 확인해야 합니다" },
    { id: "host", clauses: [["trc_hostDocs", ["host_changes", "host_inactive", "host_unknown"]]], sentence: "회사 서류가 바뀌는 중이거나 상태를 모르면 초청 서류가 반려될 수 있어 회사 서류부터 맞춰야 합니다" },
    { id: "tamtru", clauses: [["trc_tamtruStatus", ["tamtru_expired", "tamtru_changed", "tamtru_not_yet", "tamtru_unsure"]]], sentence: "임시 거주 신고가 지났거나 주소가 다르면 거주증 접수 전에 신고부터 바로잡아야 합니다" },
  ],
};
export const phase2Titles = { Q6: "기본 서류", Q7: "임시 거주 신고", Q8: "회사 서류와 노동허가", Q9: "만료 일정과 카드 기간", Q10: "견적과 비용", Q11: "제출 방식", Q12: "동반 가족", Q13: "제출 지역" };
export const connections = [
  { name: "임시 거주 신고 확인", clauses: [["trc_tamtruStatus", ["tamtru_expired", "tamtru_changed", "tamtru_not_yet", "tamtru_unsure"]]], sentence: "거주 신고가 정리되지 않았다면 임시 거주 신고 확인에서 먼저 점검해 보실 수 있습니다.", path: "/check/tamtru" },
  { name: "노동허가 확인", clauses: [["trc_permitLink", ["wp_in_progress", "wp_unsure"]]], sentence: "노동허가가 아직 정리되지 않았다면 노동허가 확인에서 함께 점검해 보실 수 있습니다.", path: "/check/wp" },
  { name: "전문가 진행", clauses: [["trc_expiryRemain", ["exp_under_2w", "exp_expired"]], ["trc_hostDocs", ["host_changes", "host_inactive"]], ["trc_helpWanted", ["help_full"]]], sentence: "만료가 가깝거나 회사 정보가 바뀌는 중이라면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["서류 목록 확인", "수수료 구간 확인", "번역·공증 준비", "거주 신고 확인", "접수 일정 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 발급 가능 여부를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다. 성격이 보도 기준 또는 참고인 자료는 원문 확인 전 정보이므로 관할 기관에서 최종 확인해 주세요.",
  sources: { confirmedOn: "2026.10.12", rows: [
    { id: "1", name: "출입국·체류 수수료 규정 (재무부 통달 28/2026/TT-BTC, 2026.4.1 시행): 거주증 2년 이하 145달러, 2년에서 5년 155달러, 5년에서 10년 165달러", publisher: "베트남 재무부 / 정부 전자신문", kind: "보도 기준", urls: ["https://baochinhphu.vn/quy-dinh-moi-ve-thu-phi-le-phi-xuat-nhap-canh-102260331184313162.htm"], note: "기존 화면이 인용한 자료와 구간 금액 일치" },
    { id: "2", name: "외국인의 입국·출국·통과·거주에 관한 법 (제47/2014/QH13호, 제51/2019/QH14호 개정)", publisher: "베트남 국회", kind: "보도 기준", urls: [], note: "임시 거주 카드 관련 규정은 제36조부터 제38조로 확인함(이차 자료 기준). 본문에는 조문 번호를 쓰지 않음" },
  ] },
};
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: [["trc_helpWanted", ["help_full"]], ["trc_expiryRemain", ["exp_under_2w", "exp_expired"]], ["trc_hostDocs", ["host_changes", "host_inactive"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: [["trc_helpWanted", ["help_accompany"]], ["trc_submitter", ["sub_undecided"]], ["trc_officeKnown", ["of_unknown", "of_changed"]]] },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
export const visaMap = { visa_invest: "invest", visa_work: "work", visa_tourist: "tourist", visa_other: "other", visa_unsure: "other" };
export const roleMap = { role_legal_rep: "legal-rep", role_manager: "manager", role_staff: "staff", role_none: null };
export const companyMap = { company_fdi: "fdi", company_local: "local", company_unregistered: "unregistered", company_family: null, company_unsure: null };
