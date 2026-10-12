// LICENSE(운전면허 전환) content spec. Q1-Q5 = 1st stage (card), Q6-Q13 = 2nd stage (guide r).
// 근거: 공안부 운전면허 규정(35/2024/TT-BCA, 2025.1.1 시행), 호치민시 교통경찰 안내(2025.3). 판정 함수(computeLicenseResultTone)는 바꾸지 않는다.
export const labels = {
  first_convert: "외국 면허를 처음 전환", renew_vn: "베트남 면허 갱신", lost_reissue: "분실·훼손 재발급", intl_only: "국제면허로 운전 중", stage_unsure: "어떤 절차인지 모름",
  car: "승용차", motorbike: "오토바이", both: "승용차와 오토바이", van_truck: "승합·화물차", vehicle_unsure: "운전할 차량 미정",
  res_trc_long: "거주증 3개월 이상 남음", res_trc_short: "거주증 3개월 미만 남음", res_visa_only: "비자만 있음", res_applying: "거주증 신청 중", res_unsure: "체류 서류 상태를 모름",
  sp_over_1y: "1년 넘게 머물 예정", sp_months: "몇 달 머물 예정", sp_leaving: "곧 출국 예정", sp_frequent: "자주 오가며 머묾", sp_unsure: "체류 계획 미정",
  hl_valid_long: "본국 면허 유효(넉넉함)", hl_valid_short: "본국 면허 곧 만료", hl_intl_only: "국제면허만 있음", hl_expired: "본국 면허 만료", hl_unsure: "본국 면허 상태를 모름",
  le_over_2y: "면허 만료까지 2년 넘음", le_under_1y: "면허 만료까지 1년 미만", le_na: "본국 면허 없음", le_expired: "이미 만료", le_unknown: "만료일을 모름",
  tr_done: "번역 공증 완료", tr_partial: "번역만 함", tr_none: "번역 공증 안 함", tr_embassy: "대사관 번역 확인 예정", tr_unknown: "번역 공증 필요 여부를 모름",
  hc_done: "건강검진 완료", hc_booked: "건강검진 예약", hc_unknown: "건강검진 필요 여부를 모름", hc_exempt_check: "검진 면제 여부 확인 필요", hc_none: "건강검진 안 함",
  concern_cost: "총비용 걱정", concern_docs: "필요 서류 걱정", concern_time: "처리 기간 걱정", concern_eligibility: "전환 자격 걱정", concern_quote: "받은 견적의 적정성 걱정",
  help_guide: "서류 작성 안내를 원함", help_accompany: "서류 작성과 제출 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "필요 서류 모두 준비", docs_most: "필요 서류 대부분 준비", docs_half: "필요 서류 절반 준비", docs_little: "서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  nm_match: "여권과 면허 이름 일치", nm_spelling: "이름 철자가 다름", nm_changed: "이름을 바꾼 적 있음", nm_unknown: "이름 일치 여부를 모름",
  cl_known: "면허 종류를 알고 있음", cl_multi: "여러 종류 면허 보유", cl_moto_only: "오토바이 면허만 보유", cl_unknown: "면허 종류를 모름", cl_mismatch: "필요한 종류와 다름",
  cm_ok: "필요한 종류와 맞음", cm_check: "대응 종류 확인 필요", cm_upgrade: "더 큰 차량 면허 필요", cm_unknown: "대응 여부를 모름",
  tl_urgent: "2주 안에 필요", tl_month: "한 달 안에 필요", tl_flexible: "급하지 않음", tl_unsure: "필요 시점 미정", tl_unknown: "필요 시점을 모름",
  dn_not_driving: "지금은 운전하지 않음", dn_intl: "국제면허로 운전 중", dn_home_license: "본국 면허로 운전 중", dn_company_driver: "회사 기사가 운전", dn_unsure: "운전 가능 여부를 모름",
  of_ward: "동 공안 접수처", of_traffic: "교통경찰 사무실", of_online: "온라인 공공서비스", of_agency: "대행사가 접수", of_unknown: "접수 방법을 모름",
  sm_self: "직접 제출", sm_company: "회사 담당자가 제출", sm_agency: "대행사가 제출", sm_undecided: "제출 방식 미정",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "수수료와 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  nat_korea: "대한민국 국적", nat_china: "중국 국적", nat_japan: "일본 국적", nat_other_asia: "그 밖의 아시아 국적", nat_other: "그 밖의 지역 국적",
  lang_ok: "베트남어 소통 가능", lang_partner: "통역할 사람이 있음", lang_need: "통역이 꼭 필요함", lang_english: "영어로만 소통 가능",
  vs_own: "직접 산 차량", vs_rent: "빌린 차량", vs_company: "회사 차량", vs_none: "운전할 차량 없음", vs_unsure: "차량 마련 계획 미정",
  dp_commute: "출퇴근용", dp_work: "업무용", dp_family: "가족 이동용", dp_travel: "여행용", dp_unsure: "용도 미정",
  area_hanoi: "하노이", area_hcm: "호치민", area_danang: "다낭", area_other_city: "그 밖의 도시", area_unsure: "지역 미정",
  ok_known: "접수처를 알고 있음", ok_unknown: "접수처를 모름", ok_changed: "행정구역 변경으로 접수처가 불확실함",
};
const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });
export const questions = [
  { code: "Q1", stage: 1, prompt: "운전면허와 관련해 어떤 절차가 필요하고, 주로 어떤 차량을 운전하실 예정인가요?", f: ["lic_stage", "lic_vehicle"], choices: [
    C("**외국 면허를 베트남 면허로 처음** 바꾸려고 합니다.", "주로 승용차를 운전하며 출퇴근과 가족 이동에 쓸 예정입니다.", ["first_convert", "car"], { card: "외국 면허를 처음 바꾸고 승용차를 운전하려는 상황입니다" }),
    C("**이미 바꾼 베트남 면허를 갱신**하려고 합니다.", "오토바이를 주로 타고 다니며 출퇴근할 때 쓰고 있습니다.", ["renew_vn", "motorbike"], { card: "베트남 면허를 갱신하고 오토바이를 타는 상황입니다" }),
    C("**잃어버리거나 훼손된 면허를 다시** 받으려고 합니다.", "승용차와 오토바이를 모두 운전해야 하는 상황입니다.", ["lost_reissue", "both"], { card: "면허를 다시 받고 승용차와 오토바이를 모두 타는 상황입니다" }),
    C("**국제면허로 운전하고 있는데** 바꿔야 하는지 궁금합니다.", "회사 업무로 승합차나 화물차를 운전할 일이 있습니다.", ["intl_only", "van_truck"], { card: "국제면허로 운전하며 승합·화물차가 필요한 상황입니다" }),
    C("**어떤 절차가 필요한지** 모르겠습니다.", "어떤 차량을 운전하게 될지도 아직 정하지 못했습니다.", ["stage_unsure", "vehicle_unsure"], { card: "필요한 절차와 운전할 차량부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q2", stage: 1, prompt: "베트남 체류 서류는 어떤 상태이고, 앞으로 얼마나 더 머무를 예정인가요?", f: ["lic_residence", "lic_stayPlan"], choices: [
    C("**거주증이 있고 3개월 넘게** 남아 있습니다.", "베트남에는 1년 넘게 계속 머무를 예정입니다.", ["res_trc_long", "sp_over_1y"], { card: "거주증이 넉넉히 남아 있고 오래 머물 상황입니다" }),
    C("**거주증이 있지만 3개월이 안** 남았습니다.", "몇 달 더 머문 뒤 계획을 다시 정할 예정입니다.", ["res_trc_short", "sp_months"], { card: "거주증이 3개월 안에 끝나 일정 확인이 필요한 상황입니다" }),
    C("**거주증 없이 비자만** 가지고 있습니다.", "곧 출국할 예정이라 짧게만 운전하면 됩니다.", ["res_visa_only", "sp_leaving"], { card: "비자만 있고 곧 출국할 예정인 상황입니다" }),
    C("**거주증을 지금 신청하는** 중입니다.", "본국과 베트남을 자주 오가면서 지내고 있습니다.", ["res_applying", "sp_frequent"], { card: "거주증을 신청 중이고 자주 오가며 지내는 상황입니다" }),
    C("**체류 서류 상태를** 정확히 모르겠습니다.", "얼마나 더 머무를지도 아직 정해지지 않았습니다.", ["res_unsure", "sp_unsure"], { card: "체류 서류와 체류 계획을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q3", stage: 1, prompt: "본국에서 받은 운전면허는 어떤 상태이고, 만료일까지는 얼마나 남았나요?", f: ["lic_homeLicense", "lic_licenseExpiry"], choices: [
    C("**본국 면허가 유효**합니다.", "만료일까지 2년 넘게 남아 있어서 기간에는 여유가 있습니다.", ["hl_valid_long", "le_over_2y"], { card: "본국 면허가 유효하고 기간에 여유가 있는 상황입니다" }),
    C("**본국 면허가 곧 만료**됩니다.", "만료일까지 1년이 안 남아서 본국에서 먼저 갱신해야 할지 고민입니다.", ["hl_valid_short", "le_under_1y"], { card: "본국 면허 만료가 1년 안으로 다가온 상황입니다" }),
    C("**국제면허만** 가지고 있습니다.", "본국에서 받은 정식 면허증은 따로 가지고 오지 않았습니다.", ["hl_intl_only", "le_na"], { card: "국제면허만 있고 본국 면허증이 없는 상황입니다" }),
    C("**본국 면허가 이미 만료**되었습니다.", "만료된 지 얼마 되지 않았지만 갱신은 아직 하지 못했습니다.", ["hl_expired", "le_expired"], { card: "본국 면허가 만료되어 갱신부터 필요한 상황입니다" }),
    C("**본국 면허 상태를** 정확히 모르겠습니다.", "면허증의 만료일이 언제인지 확인해 보지 못했습니다.", ["hl_unsure", "le_unknown"], { card: "본국 면허 상태와 만료일을 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "면허증 번역과 공증은 준비했고, 건강검진은 받으셨나요?", f: ["lic_translation", "lic_health"], choices: [
    C("**번역과 공증을 모두** 마쳤습니다.", "지정 병원에서 운전용 건강검진도 받아서 결과서가 있습니다.", ["tr_done", "hc_done"], { card: "번역 공증과 건강검진을 모두 마친 상황입니다" }),
    C("**번역만 해 두었고** 공증은 아직입니다.", "건강검진은 예약해 두었고 곧 받을 예정입니다.", ["tr_partial", "hc_booked"], { card: "번역만 했고 건강검진을 앞둔 상황입니다" }),
    C("**번역과 공증을 아직** 하지 않았습니다.", "운전용 건강검진이 필요한지 잘 모르겠습니다.", ["tr_none", "hc_unknown"], { card: "번역 공증 전이고 검진 필요 여부를 모르는 상황입니다" }),
    C("**대사관에서 번역 확인을** 받으려고 합니다.", "체류 기간에 맞춘 면허라서 검진이 면제되는지 궁금합니다.", ["tr_embassy", "hc_exempt_check"], { card: "대사관 번역을 준비하고 검진 면제를 확인할 상황입니다" }),
    C("**번역과 공증이 필요한지** 모르겠습니다.", "건강검진도 아직 받지 않았고 어디서 받는지도 모릅니다.", ["tr_unknown", "hc_none"], { card: "번역 공증과 건강검진을 처음부터 확인할 상황입니다" }),
  ] },
  { code: "Q5", stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?", f: ["lic_mainConcern", "lic_helpWanted"], choices: [
    C("**총비용이 얼마인지** 걱정됩니다.", "필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.", ["concern_cost", "help_guide"], { card: "총비용을 알고 직접 서류를 준비하려는 상황입니다" }),
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 알고 싶은 상황입니다" }),
    C("**처리 기간이 얼마나 걸릴지** 걱정됩니다.", "제출하는 날 접수처에 통역과 함께 가고 싶습니다.", ["concern_time", "help_accompany"], { card: "처리 기간이 걱정되어 제출 동행을 원하는 상황입니다" }),
    C("**전환 자격이 되는지** 모르겠습니다.", "서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.", ["concern_eligibility", "help_full"], { card: "자격이 걱정되어 전 과정을 맡기고 싶은 상황입니다" }),
    C("**받은 견적이 적정한지** 모르겠습니다.", "서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.", ["concern_quote", "help_accompany"], { card: "받은 견적이 적정한지 확인하려는 상황입니다" }),
  ] },
  { code: "Q6", stage: 2, prompt: "신청 서류는 어디까지 준비되었고, 여권과 면허증의 이름 철자는 같은가요?", f: ["lic_docs", "lic_nameMatch"], choices: [
    C("**신청서, 번역본, 체류 서류 사본을 모두** 준비했습니다.", "여권과 면허증의 이름 철자가 똑같아서 문제가 없습니다.", ["docs_all", "nm_match"], { r: "서류가 갖춰졌으니 체류 서류 사본의 인증 여부만 확인하고 바로 접수하세요." }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "여권과 면허증의 영문 이름 철자가 조금 다릅니다.", ["docs_most", "nm_spelling"], { r: "이름 철자가 다르면 같은 사람임을 확인하는 서류가 필요할 수 있으니 미리 준비하세요." }),
    C("**절반쯤 준비**했습니다.", "결혼 등으로 이름을 바꾼 적이 있어서 서류마다 이름이 다릅니다.", ["docs_half", "nm_changed"], { r: "이름이 바뀐 경우 변경 사실을 보여 주는 서류와 그 번역본을 함께 준비하세요." }),
    C("**거의 준비하지 못했습니다.**", "여권과 면허증의 이름이 같은지 아직 비교해 보지 않았습니다.", ["docs_little", "nm_unknown"], { r: "서류를 모으기 전에 여권과 면허증의 이름을 먼저 맞춰 보면 보완 요구를 줄일 수 있습니다." }),
    C("**무엇이 필요한지 아직 모릅니다.**", "여권과 면허증의 이름 철자는 같은 것으로 알고 있습니다.", ["docs_unknown", "nm_match"], { r: "신청서, 면허 번역본, 체류 서류 사본, 건강검진서가 기본이니 이 네 가지부터 확인하세요." }),
  ] },
  { code: "Q7", stage: 2, prompt: "가진 면허는 어떤 종류이고, 베트남에서 필요한 면허 종류와 맞는다고 보시나요?", f: ["lic_class", "lic_classMatch"], choices: [
    C("**면허 종류를 정확히 알고** 있습니다.", "베트남에서 필요한 종류와 맞는 것으로 확인했습니다.", ["cl_known", "cm_ok"], { r: "면허 종류가 맞다면 바뀌는 종류 표기만 신청서에 정확히 적으면 됩니다." }),
    C("**여러 종류의 면허를** 가지고 있습니다.", "각각 베트남 어떤 종류로 바뀌는지 확인이 필요합니다.", ["cl_multi", "cm_check"], { r: "여러 종류를 한 번에 바꿀 수 있으니 각 종류가 어떻게 대응되는지 표로 정리해 두세요." }),
    C("**오토바이 면허만** 가지고 있습니다.", "베트남에서는 승용차도 운전하고 싶어서 더 큰 면허가 필요합니다.", ["cl_moto_only", "cm_upgrade"], { r: "가진 면허보다 큰 차량을 운전하려면 전환이 아닌 새 시험이 필요할 수 있으니 먼저 확인하세요." }),
    C("**면허 종류가 무엇인지** 모르겠습니다.", "베트남 면허 종류와 맞는지도 확인해 보지 못했습니다.", ["cl_unknown", "cm_unknown"], { r: "면허증 뒷면의 종류 표기를 사진으로 찍어 두면 대응 종류를 확인하기 쉽습니다." }),
    C("**필요한 종류와 다른 면허**를 가지고 있습니다.", "어떤 종류로 대응되는지 정확히 확인하고 싶습니다.", ["cl_mismatch", "cm_check"], { r: "다른 종류라면 전환으로 해결되는지 새로 따야 하는지부터 확인하세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "베트남 면허는 언제까지 필요하고, 지금은 어떤 방식으로 운전하고 계신가요?", f: ["lic_timeline", "lic_driveNow"], choices: [
    C("**2주 안에** 면허가 필요합니다.", "지금은 운전하지 않고 택시나 차량 호출 서비스를 이용합니다.", ["tl_urgent", "dn_not_driving"], { r: "처리 기간이 있으니 서류를 오늘부터 모아 가능한 빨리 접수하세요." }),
    C("**한 달 안에** 면허가 필요합니다.", "지금은 국제면허로 운전하고 있는데 계속 써도 되는지 궁금합니다.", ["tl_month", "dn_intl"], { r: "국제면허를 쓸 수 있는 조건과 기간을 확인하고, 전환 일정을 그에 맞춰 잡으세요." }),
    C("**급하지는 않습니다.**", "지금은 본국에서 받은 면허만 가지고 직접 운전을 하고 있습니다.", ["tl_flexible", "dn_home_license"], { r: "본국 면허만으로 운전하면 단속 대상이 될 수 있으니 전환 전까지는 운전을 줄이세요." }),
    C("**필요한 시점이 아직 정해지지** 않았습니다.", "회사에서 붙여 준 기사가 대신 운전해 주고 있습니다.", ["tl_unsure", "dn_company_driver"], { r: "직접 운전할 계획이 생기면 체류 서류 기간을 보고 전환 일정을 정하세요." }),
    C("**언제 필요할지** 잘 모르겠습니다.", "지금 가진 면허로 운전해도 되는지 확인하지 못했습니다.", ["tl_unknown", "dn_unsure"], { r: "운전 가능 여부부터 확인하고, 필요하면 전환을 서두르는 것이 안전합니다." }),
  ] },
  { code: "Q9", stage: 2, prompt: "신청서는 어디에 접수할 예정이고, 서류는 누가 제출하게 되나요?", f: ["lic_office", "lic_submitter"], choices: [
    C("**동 공안의 접수처**에 내려고 합니다.", "제가 직접 서류를 들고 가서 제출할 예정입니다.", ["of_ward", "sm_self"], { r: "접수처마다 받는 업무와 시간이 다를 수 있으니 방문 전에 면허 업무를 받는지 확인하세요." }),
    C("**교통경찰 사무실**에 내려고 합니다.", "회사 담당자가 서류를 대신 제출해 주기로 했습니다.", ["of_traffic", "sm_company"], { r: "회사 담당자가 제출하면 위임 서류와 결과 수령 방법을 미리 정해 두세요." }),
    C("**온라인 공공서비스**로 신청하려고 합니다.", "온라인 신청이 어려우면 대행사에 맡길 생각입니다.", ["of_online", "sm_agency"], { r: "온라인 신청은 서류 사본을 파일로 올려야 하니 선명한 스캔본을 먼저 준비하세요." }),
    C("**대행사가 알아서 접수**하기로 했습니다.", "어디에 접수하는지는 대행사에 맡기려고 합니다.", ["of_agency", "sm_agency"], { r: "대행사에 맡길 때는 접수처와 처리 기간, 원본 보관 방식을 문서로 받아 두세요." }),
    C("**어디에 접수하는지** 모르겠습니다.", "서류를 누가 제출할지도 아직 정하지 못한 상태입니다.", ["of_unknown", "sm_undecided"], { r: "사는 곳의 관할 접수처를 먼저 찾고, 직접·회사·대행 중 제출 방식을 정하세요." }),
  ] },
  { code: "Q10", stage: 2, prompt: "받아 본 견적은 몇 건이고, 정부 수수료와 대행 범위가 구분되어 있나요?", f: ["lic_quoteStatus", "lic_quoteScope"], choices: [
    C("**견적을 받은 적이 없습니다.**", "비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.", ["quote_none", "qs_na"], { r: "견적을 받기 전에 정부 수수료와 대행료, 번역·공증비, 건강검진비를 나누어 요청하세요." }),
    C("**한 곳에서 서면 견적**을 받았습니다.", "정부 수수료와 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.", ["quote_one", "qs_clear"], { r: "항목이 나뉘어 있으니 정부 수수료가 공식 금액과 같은지만 대조해 보세요." }),
    C("**여러 곳에서 견적**을 받았습니다.", "항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.", ["quote_several", "qs_mixed"], { r: "업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다." }),
    C("**말로만 금액**을 들었습니다.", "어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.", ["quote_verbal", "qs_unknown"], { r: "말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요." }),
    C("**광고에 나온 가격**만 보았습니다.", "추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.", ["quote_ad", "qs_unknown"], { r: "광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요." }),
  ] },
  { code: "Q11", stage: 2, prompt: "신청하시는 분의 국적은 어디이고, 접수할 때 베트남어 소통은 가능하신가요?", f: ["lic_nationality", "lic_language"], choices: [
    C("**대한민국** 국적입니다.", "베트남어를 전혀 몰라서 접수처에 갈 때 통역이 꼭 필요합니다.", ["nat_korea", "lang_need"], { r: "통역이 필요하면 방문 전에 통역 일정을 먼저 잡고 서류를 베트남어 목록으로 준비하세요." }),
    C("**중국** 국적입니다.", "베트남어를 할 수 있는 직원이나 가족이 함께 가 줄 수 있습니다.", ["nat_china", "lang_partner"], { r: "함께 가는 사람에게 서류 목록과 신청 내용을 미리 공유해 두면 접수가 빨라집니다." }),
    C("**일본** 국적입니다.", "영어로는 소통할 수 있지만 베트남어는 전혀 하지 못하는 상황입니다.", ["nat_japan", "lang_english"], { r: "접수처에서는 영어가 통하지 않을 수 있으니 통역이나 온라인 신청을 먼저 검토하세요." }),
    C("**그 밖의 아시아 국가** 국적입니다.", "베트남어로 간단한 소통은 할 수 있어서 혼자 가도 괜찮습니다.", ["nat_other_asia", "lang_ok"], { r: "혼자 방문하더라도 서류 원본과 사본을 나누어 챙기면 한 번에 끝낼 수 있습니다." }),
    C("**그 밖의 지역** 국적입니다.", "베트남어를 몰라서 신청할 때 통역이 꼭 필요한 상황입니다.", ["nat_other", "lang_need"], { r: "국적에 따라 면허 번역 확인 방법이 다를 수 있으니 번역 공증 방법을 먼저 확인하세요." }),
  ] },
  { code: "Q12", stage: 2, prompt: "운전할 차량은 어떻게 마련했고, 주로 어떤 용도로 운전하실 예정인가요?", f: ["lic_vehicleSource", "lic_drivePurpose"], choices: [
    C("**차량을 직접 구입**했습니다.", "주로 집과 회사를 오가는 출퇴근할 때 직접 운전하려고 합니다.", ["vs_own", "dp_commute"], { r: "직접 산 차량은 면허와 함께 차량 등록과 보험 서류도 챙겨 두어야 합니다." }),
    C("**차량을 빌려서** 쓰고 있습니다.", "회사 업무로 거래처를 다닐 때 제가 직접 운전하게 됩니다.", ["vs_rent", "dp_work"], { r: "빌린 차량은 계약서에 운전자 조건이 있을 수 있으니 면허 종류와 맞는지 확인하세요." }),
    C("**회사 차량을** 쓰게 됩니다.", "주말에는 가족과 함께 이동할 때도 제가 운전할 예정입니다.", ["vs_company", "dp_family"], { r: "회사 차량은 회사 보험의 운전자 범위에 들어가는지 확인해 두세요." }),
    C("**아직 운전할 차량이** 없습니다.", "여행할 때 차를 빌려서 다른 도시까지 직접 운전해 보고 싶습니다.", ["vs_none", "dp_travel"], { r: "여행용으로 빌릴 때도 베트남 면허가 있어야 하는 경우가 많으니 전환을 먼저 마치세요." }),
    C("**차량을 어떻게 마련할지** 정하지 못했습니다.", "운전할 용도도 아직 정해지지 않았습니다.", ["vs_unsure", "dp_unsure"], { r: "용도가 정해지면 필요한 면허 종류도 정해지니 운전 계획부터 정리해 보세요." }),
  ] },
  { code: "Q13", stage: 2, prompt: "서류를 접수할 지역은 어디이고, 담당 접수처를 알고 계신가요?", f: ["lic_area", "lic_officeKnown"], choices: [
    C("**하노이**에서 접수합니다.", "담당 접수처의 위치와 접수 시간을 이미 알고 있어서 가기만 하면 됩니다.", ["area_hanoi", "ok_known"], { r: "접수 시간과 예약 여부만 한 번 더 확인하면 헛걸음을 줄일 수 있습니다." }),
    C("**호치민**에서 접수합니다.", "담당 접수처가 어디인지 몰라서 어디로 가야 하는지 알고 싶습니다.", ["area_hcm", "ok_unknown"], { r: "사는 곳 기준으로 면허 업무를 받는 접수처를 먼저 찾아야 접수 시간을 알 수 있습니다." }),
    C("**다낭**에서 접수합니다.", "최근 행정구역이 바뀌어 담당 접수처가 달라졌는지 모르겠습니다.", ["area_danang", "ok_changed"], { r: "행정구역 개편으로 담당 기관이 바뀌었을 수 있으니 접수 전에 직접 확인하세요." }),
    C("**그 밖의 도시**에서 접수합니다.", "가 본 적이 있어서 접수처의 위치는 알고 있지만 시간은 모릅니다.", ["area_other_city", "ok_known"], { r: "지방은 접수 요일이 제한될 수 있으니 방문 전에 전화로 일정을 확인하세요." }),
    C("**접수할 지역이 아직** 정해지지 않았습니다.", "어느 접수처에 가야 하는지도 확인하지 못했습니다.", ["area_unsure", "ok_unknown"], { r: "사는 곳 주소를 기준으로 접수 지역이 정해지는 경우가 많으니 주소부터 확인하세요." }),
  ] },
];

export const cardTitles = { Q1: "절차와 차량", Q2: "체류 서류와 계획", Q3: "본국 면허", Q4: "번역과 건강검진" };
export const summaries = {
  "lic_mainConcern=concern_cost|lic_helpWanted=help_guide": {
    headline: "총비용을 확인하고 서류는 직접 준비하려는 상황입니다",
    body: "면허 전환 수수료는 정해져 있고, 면허 번역 공증과 건강검진 비용이 따로 듭니다. 서류 목록을 받아 번역 공증부터 준비하세요.",
  },
  "lic_mainConcern=concern_docs|lic_helpWanted=help_guide": {
    headline: "필요한 서류부터 확인해 직접 준비하려는 상황입니다",
    body: "면허 전환에는 신청서, 면허 번역 공증본, 3개월 넘게 남은 체류 서류 사본, 건강검진서가 기본으로 필요합니다. 체류 서류 기간을 먼저 확인하세요.",
  },
  "lic_mainConcern=concern_time|lic_helpWanted=help_accompany": {
    headline: "처리 기간이 걱정되어 제출 동행을 원하는 상황입니다",
    body: "서류가 갖춰진 뒤 접수하면 며칠 안에 결과가 나오는 편이지만, 번역 공증과 검진에 시간이 걸립니다. 그 준비 기간을 먼저 계산하세요.",
  },
  "lic_mainConcern=concern_eligibility|lic_helpWanted=help_full": {
    headline: "전환 자격이 걱정되어 전 과정을 맡기려는 상황입니다",
    body: "면허 전환은 체류 서류의 남은 기간과 본국 면허의 유효 여부에 따라 가능 여부가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  },
  "lic_mainConcern=concern_quote|lic_helpWanted=help_accompany": {
    headline: "받은 견적을 확인하고 제출은 함께 하려는 상황입니다",
    body: "견적은 정부 수수료, 번역 공증, 건강검진, 대행료가 나뉘어 있는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 어디서 생기는지 알 수 있습니다.",
  },
};
export const risks = {
  max: 4,
  fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 체류 서류 기간과 번역 공증본을 한 번 더 확인하세요",
  rules: [
    { id: "residence", clauses: [["lic_residence", ["res_trc_short", "res_visa_only", "res_applying", "res_unsure"]]], sentence: "체류 서류가 3개월 넘게 남아 있어야 전환할 수 있어 체류 서류부터 정리해야 합니다" },
    { id: "home", clauses: [["lic_homeLicense", ["hl_intl_only", "hl_expired", "hl_unsure"]]], sentence: "국제면허나 만료된 면허로는 전환할 수 없어 본국 면허 상태부터 확인해야 합니다" },
    { id: "expiry", clauses: [["lic_licenseExpiry", ["le_under_1y"]]], sentence: "본국 면허 만료가 가까우면 전환된 면허 기간도 짧아질 수 있어 갱신 여부를 먼저 정하세요" },
    { id: "translation", clauses: [["lic_translation", ["tr_none", "tr_unknown", "tr_partial"]]], sentence: "면허 번역본은 공증까지 끝나야 접수할 수 있으니 번역 공증을 먼저 마치세요" },
    { id: "name", clauses: [["lic_nameMatch", ["nm_spelling", "nm_changed"]]], sentence: "여권과 면허의 이름이 다르면 같은 사람임을 보여 주는 서류가 추가로 필요할 수 있습니다" },
    { id: "drive", clauses: [["lic_driveNow", ["dn_home_license", "dn_unsure"]]], sentence: "본국 면허만으로 운전하면 단속 대상이 될 수 있어 전환 전에는 운전을 삼가는 것이 안전합니다" },
    { id: "class", clauses: [["lic_classMatch", ["cm_upgrade"]]], sentence: "가진 면허보다 큰 차량을 운전하려면 전환이 아니라 새로 시험을 봐야 할 수 있습니다" },
  ],
};
export const phase2Titles = { Q6: "신청 서류와 이름", Q7: "면허 종류", Q8: "필요 시점과 지금 운전", Q9: "접수처와 제출", Q10: "견적과 비용", Q11: "국적과 소통", Q12: "차량과 용도", Q13: "지역과 접수처" };
export const connections = [
  { name: "거주증 확인", clauses: [["lic_residence", ["res_trc_short", "res_visa_only", "res_applying"]]], sentence: "체류 서류 기간이 부족하다면 거주증 직접 확인에서 먼저 점검해 보실 수 있습니다.", path: "/verify/trc" },
  { name: "임시 거주 신고 확인", clauses: [["lic_stayPlan", ["sp_over_1y"]]], sentence: "오래 머무르신다면 임시 거주 신고가 맞게 되어 있는지 함께 점검해 보실 수 있습니다.", path: "/verify/tamtru" },
  { name: "전문가 진행", clauses: [["lic_homeLicense", ["hl_expired"]], ["lic_timeline", ["tl_urgent"]], ["lic_helpWanted", ["help_full"]]], sentence: "본국 면허가 만료되었거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["체류 서류 기간 확인", "본국 면허 상태 확인", "번역 공증 준비", "건강검진 확인", "접수처 확인"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 전환 가능 여부를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.",
  sources: { confirmedOn: "2026.10.12", rows: [
    { id: "1", name: "외국인 운전면허 전환 안내 (호치민시 공안 교통경찰과, 2025.3): 3개월 넘게 남은 체류 서류와 유효한 본국 면허 필요, 국제면허·만료 면허는 전환 불가, 접수 후 5일 안에 결과, 수수료 13만5천 동", publisher: "호치민시 공안 / 사이공 해방 신문", kind: "공식 기관 안내(언론 보도)", urls: ["https://www.sggp.org.vn/huong-dan-doi-giay-phep-lai-xe-cua-nguoi-nuoc-ngoai-post785467.html"], note: "지역별 접수처는 시행 시점에 다시 확인" },
    { id: "2", name: "외국 운전면허 교환에 관한 공안부 통달 (제12/2025/TT-BCA호, 2025.3.1 시행)와 운전 교육·시험·발급에 관한 교통운수부 통달 (제35/2024/TT-BGTVT호, 2025.1.1 시행)", publisher: "베트남 공안부 / 교통운수부", kind: "법령(이차 자료로 확인)", urls: [], note: "외국 면허 교환은 공안부 통달 제24조 기준으로 확인함. 이전에 공안부 제35/2024로 적은 번호는 교통운수부 통달이 맞아 바로잡음" },
  ] },
};
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: [["lic_helpWanted", ["help_full"]], ["lic_homeLicense", ["hl_expired"]], ["lic_timeline", ["tl_urgent"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: [["lic_helpWanted", ["help_accompany"]], ["lic_submitter", ["sm_undecided"]], ["lic_officeKnown", ["ok_unknown", "ok_changed"]]] },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
// 기존 판정 함수 computeLicenseResultTone(trc, license)에 넣을 값. null 은 "추가 확인 필요".
export const diagnosisMap = {
  trc: { res_trc_long: "yes", res_trc_short: "no", res_visa_only: "no", res_applying: null, res_unsure: null },
  license: { hl_valid_long: "yes", hl_valid_short: "yes", hl_intl_only: "no", hl_expired: "no", hl_unsure: null },
};
export const diagnosisFields = { trc: "lic_residence", license: "lic_homeLicense" };
