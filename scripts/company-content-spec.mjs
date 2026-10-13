// COMPANY(법인설립) content spec. Q1-Q5 = 1st stage (card), Q6-Q13 = 2nd stage (guide r).
// 근거: 투자법(61/2020/QH14), 기업법(59/2020/QH14). 판정 함수(computePermitCompanyResultTone)는 바꾸지 않는다.
export const labels = {
  inv_corporate: "본사 법인이 투자", inv_individual: "개인이 투자", inv_partner: "현지 동업자와 공동 투자", inv_rep_office: "대표사무소에서 법인으로 전환", inv_unsure: "투자자 형태 미정",
  bl_trade: "무역·유통", bl_manufacturing: "제조", bl_service: "서비스·컨설팅", bl_food: "식당·카페", bl_undecided: "사업 분야 미정",
  cap_ready: "자본금 확정, 잔고 증명 준비", cap_pending_proof: "자본금 확정, 잔고 증명 전", cap_rough: "자본금을 대략만 정함", cap_unknown_min: "업종별 기준을 몰라 미정", cap_undecided: "자본금 미정",
  cp_bank_letter: "은행 잔고 증명서 보유", cp_parent_fs: "본사 재무제표 보유", cp_none: "증빙 자료 없음", cp_unknown: "필요한 증빙을 모름",
  off_signed: "사무실 임대 계약 완료", off_provisional: "사무실 가계약·약정서", off_candidate: "후보 사무실만 있음", off_residential: "주거용 집 주소를 쓰려 함", off_undecided: "사무실 미정",
  lt_commercial: "상업용 건물", lt_shared: "공유 오피스", lt_apartment: "주거용 아파트", lt_factory: "공장·창고", lt_unknown: "건물 용도를 모름",
  rep_resident: "대표가 베트남에 상주", rep_visiting: "대표가 오가며 관리", rep_local: "현지인을 대표로 선임", rep_undecided: "대표 미정", rep_unknown: "대표 상주 필요 여부를 모름",
  fd_legalized: "본사·개인 서류 인증 완료", fd_in_progress: "서류 인증 진행 중", fd_not_started: "서류 인증 시작 전", fd_na: "인증할 해외 서류 없음", fd_unknown: "인증 필요 여부를 모름",
  concern_cost: "총비용 걱정", concern_docs: "필요 서류 걱정", concern_time: "설립 일정 걱정", concern_eligibility: "투자 가능 업종 걱정", concern_quote: "받은 견적의 적정성 걱정",
  help_guide: "서류 작성 안내를 원함", help_accompany: "서류 작성과 제출 동행을 원함", help_full: "전 과정 대행을 원함",
  docs_all: "기본 서류 모두 준비", docs_most: "기본 서류 대부분 준비", docs_half: "기본 서류 절반 준비", docs_little: "기본 서류 거의 미준비", docs_unknown: "필요 서류를 모름",
  tn_none: "번역 필요 없음", tn_needed: "번역 필요함", tn_unsure: "번역 필요 여부 모름",
  ba_opened: "투자 자본 계좌 개설", ba_bank_chosen: "은행만 정함", ba_not_yet: "계좌 개설 전", ba_unknown: "계좌 필요 여부를 모름", ba_not_yet_after: "설립 후 계좌 개설 예정",
  ct_planned: "기한 안 송금 계획", ct_partial: "나누어 송금 예정", ct_unsure_deadline: "송금 기한을 모름", ct_delay: "송금이 늦어질 수 있음",
  sl_none: "추가 허가 불필요", sl_food: "식품 위생·소방 허가 필요", sl_trade: "수출입·유통 허가 필요", sl_env: "환경 허가 필요", sl_unknown: "추가 허가 필요 여부를 모름",
  sc_known: "추가 허가 순서를 알고 있음", sc_after: "설립 후 진행 예정", sc_unknown: "추가 허가 순서를 모름",
  tl_urgent: "한 달 안에 설립 필요", tl_2_3m: "두세 달 안에 설립", tl_flexible: "급하지 않음", tl_unsure: "설립 시점 미정", tl_asap: "가능한 빨리 설립",
  op_date: "영업 시작일 정해짐", op_lease_start: "임대 시작에 맞춰 영업", op_after_staff: "직원 채용 후 영업", op_unsure: "영업 시작일 미정",
  quote_none: "받은 견적 없음", quote_one: "서면 견적 1건", quote_several: "여러 곳의 견적", quote_verbal: "말로만 들은 금액", quote_ad: "광고 가격만 봄",
  qs_clear: "정부 비용과 대행료가 구분됨", qs_mixed: "항목이 섞여 비교 어려움", qs_unknown: "포함 범위를 모름", qs_na: "비교할 견적 없음",
  nat_korea: "대한민국 국적", nat_china: "중국 국적", nat_japan: "일본 국적", nat_other_asia: "그 밖의 아시아 국적", nat_other: "그 밖의 지역 국적",
  sub_self: "직접 제출", sub_staff: "직원이 제출", sub_agency: "대행사가 제출", sub_undecided: "제출 방식 미정",
  ps_tax: "세무·회계 신고 준비", ps_hiring: "외국인 직원 채용", ps_visa: "대표 비자·거주증 준비", ps_bank: "회사 운영 계좌·인보이스 준비", ps_unknown: "설립 후 할 일을 모름",
  pf_ready: "설립 후 할 일을 정리함", pf_partial: "일부만 정리함", pf_none: "아직 생각하지 않음",
  area_hanoi: "하노이", area_hcm: "호치민", area_danang: "다낭", area_other_city: "그 밖의 도시", area_ip: "산업단지",
  ag_known: "담당 기관을 알고 있음", ag_unknown: "담당 기관을 모름", ag_changed: "기관 통합으로 담당이 불확실함",
  if_hq_docs: "본사 서류 인증과 투자 등록 절차 확인", if_individual_scope: "개인 투자 가능 업종과 자본금 기준 확인", if_partner_share: "지분 구조와 외국인 지분 제한 확인", if_rep_convert: "대표사무소 정리와 법인 전환 절차 확인", if_compare: "투자 형태 비교",
  sub_self_lang: "직접 제출, 베트남어가 걱정됨", sn_account: "온라인 접수 계정·서명 준비", sn_proxy: "위임장·연락 방법 준비", sn_scope: "대행 범위·원본 보관 확인", sn_compare: "제출 방식 비교", sn_interpreter: "통역 필요 범위 확인",
  an_online: "담당 기관과 온라인 접수 확인", an_office: "접수 기관 확인", an_changed: "기관 통합으로 담당 확인", an_visit: "지방 접수 방식 확인", an_zone: "산업단지 관리 기관 확인",
};
const C = (lead, d, v, extra) => ({ lead, d, v, ...extra });
export const questions = [
  { code: "Q1", stage: 1, prompt: "베트남 법인은 누가 투자해서 세우는지, 그 투자 방식에서 가장 확인하고 싶은 점은 무엇인가요?", f: ["pc_investor", "pc_investorFocus"], choices: [
    C("**한국 본사 법인이 투자**해서 세웁니다.", "본사 서류에 어떤 인증이 필요하고 투자 등록이 어떻게 진행되는지 확인하고 싶습니다.", ["inv_corporate", "if_hq_docs"], { card: "본사 법인이 투자하며 본사 서류와 투자 등록 절차를 확인하려는 상황입니다" }),
    C("**제가 개인으로 투자**해서 세웁니다.", "개인 투자자가 설립할 수 있는 업종과 필요한 자본금 기준을 확인하고 싶습니다.", ["inv_individual", "if_individual_scope"], { card: "개인 투자로 설립 가능한 업종과 자본금 기준을 확인하려는 상황입니다" }),
    C("**현지 동업자와 함께** 투자합니다.", "지분을 어떻게 나누는지, 외국인 지분에 제한이 있는 업종인지 확인하고 싶습니다.", ["inv_partner", "if_partner_share"], { card: "현지 동업자와 공동 투자하며 지분 구조를 확인하려는 상황입니다" }),
    C("**대표사무소를 법인으로** 바꾸려고 합니다.", "기존 대표사무소를 어떻게 정리하고 법인으로 옮기는지 확인하고 싶습니다.", ["inv_rep_office", "if_rep_convert"], { card: "대표사무소를 법인으로 전환하는 절차를 확인하려는 상황입니다" }),
    C("**누가 투자할지** 아직 정하지 못했습니다.", "어떤 투자 형태가 우리 상황에 맞는지 비교해서 알고 싶습니다.", ["inv_unsure", "if_compare"], { card: "투자 형태부터 비교해 정해야 하는 상황입니다" }),
  ] },
  { code: "Q2", stage: 1, prompt: "자본금은 얼마로 정했고, 그 돈이 있다는 것을 어떤 자료로 증명할 수 있나요?", f: ["pc_capital", "pc_capitalProof"], choices: [
    C("**자본금을 정했고** 증빙도 준비했습니다.", "은행에서 발급한 잔고 증명서를 가지고 있습니다.", ["cap_ready", "cp_bank_letter"], { card: "자본금을 정했고 은행 잔고 증명이 있는 상황입니다" }),
    C("**자본금은 정했지만** 증빙은 아직입니다.", "본사의 최근 재무제표로 증명하려고 준비하고 있습니다.", ["cap_pending_proof", "cp_parent_fs"], { card: "자본금은 정했고 재무제표로 증빙하려는 상황입니다" }),
    C("**자본금을 대략만** 정했습니다.", "자금을 증명할 자료는 아직 따로 준비하지 못한 상태입니다.", ["cap_rough", "cp_none"], { card: "자본금을 대략만 정해 증빙이 필요한 상황입니다" }),
    C("**업종별 기준을 몰라** 자본금을 못 정했습니다.", "어떤 자료로 자금을 증명해야 하는지도 모르겠습니다.", ["cap_unknown_min", "cp_unknown"], { card: "업종별 자본금 기준부터 확인해야 하는 상황입니다" }),
    C("**자본금을 아직** 정하지 않았습니다.", "투자 규모가 정해지면 은행 잔고 증명서를 받을 생각입니다.", ["cap_undecided", "cp_bank_letter"], { card: "투자 규모와 자본금을 정해야 하는 상황입니다" }),
  ] },
  { code: "Q3", stage: 1, prompt: "본사 주소로 쓸 사무실은 정해졌고, 그 건물은 어떤 용도의 건물인가요?", f: ["pc_office", "pc_leaseType"], choices: [
    C("**사무실 임대 계약을 마쳤습니다.**", "상업용 사무실 건물이라 회사 주소로 쓰는 데 문제가 없어 보입니다.", ["off_signed", "lt_commercial"], { card: "상업용 건물에 사무실 계약을 마친 상황입니다" }),
    C("**가계약이나 임대 약정서**만 있습니다.", "공유 오피스의 자리를 빌려 회사 주소로 쓰려고 합니다.", ["off_provisional", "lt_shared"], { card: "공유 오피스와 가계약 상태인 상황입니다" }),
    C("**후보 사무실만** 알아본 상태입니다.", "후보 중에 공장이나 창고를 함께 쓰는 건물도 있어 용도 확인이 필요합니다.", ["off_candidate", "lt_factory"], { card: "공장·창고 후보만 있고 계약 전인 상황입니다" }),
    C("**지금 사는 집 주소**를 쓰려고 합니다.", "주거용 아파트라 회사 주소로 쓸 수 있는지 모르겠습니다.", ["off_residential", "lt_apartment"], { card: "주거용 아파트 주소를 쓰려는 상황입니다" }),
    C("**사무실을 아직** 정하지 못했습니다.", "어떤 용도의 건물이어야 하는지도 잘 모르겠습니다.", ["off_undecided", "lt_unknown"], { card: "사무실과 건물 용도부터 확인해야 하는 상황입니다" }),
  ] },
  { code: "Q4", stage: 1, prompt: "법인 대표는 베트남에 상주하나요, 그리고 해외 서류의 인증은 어디까지 했나요?", f: ["pc_representative", "pc_foreignDocs"], choices: [
    C("**대표가 베트남에 상주**하며 일합니다.", "본사 서류와 여권 공증·영사 인증을 이미 마쳤습니다.", ["rep_resident", "fd_legalized"], { card: "대표가 상주하고 해외 서류 인증을 마친 상황입니다" }),
    C("**대표가 오가며** 관리할 예정입니다.", "본사 서류의 영사 인증을 지금 진행하고 있습니다.", ["rep_visiting", "fd_in_progress"], { card: "대표가 오가며 관리하고 서류 인증이 진행 중인 상황입니다" }),
    C("**현지인을 대표로** 선임하려고 합니다.", "투자하는 본사나 개인의 해외 서류 인증은 아직 시작하지 않았습니다.", ["rep_local", "fd_not_started"], { card: "현지인 대표를 두고 서류 인증 전인 상황입니다" }),
    C("**대표를 누구로 할지** 아직 정하지 않았습니다.", "대표가 정해져야 서류를 준비할 수 있어 해외 서류 인증도 시작하지 못했습니다.", ["rep_undecided", "fd_not_started"], { card: "대표를 정해야 하고 해외 서류 인증도 시작 전인 상황입니다" }),
    C("**대표가 상주해야 하는지** 모르겠습니다.", "해외 서류에 인증이 필요한지도 확인하지 못했습니다.", ["rep_unknown", "fd_unknown"], { card: "대표 상주와 서류 인증 필요 여부를 확인할 상황입니다" }),
  ] },
  { code: "Q5", stage: 1, prompt: "지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?", f: ["pc_mainConcern", "pc_helpWanted"], choices: [
    C("**총비용이 얼마인지** 걱정됩니다.", "필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.", ["concern_cost", "help_guide"], { card: "총비용을 알고 직접 서류를 준비하려는 상황입니다" }),
    C("**필요한 서류가 무엇인지** 모르겠습니다.", "서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.", ["concern_docs", "help_guide"], { card: "필요한 서류부터 알고 싶은 상황입니다" }),
    C("**설립이 언제 끝날지** 걱정됩니다.", "제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.", ["concern_time", "help_accompany"], { card: "설립 일정이 걱정되어 제출 동행을 원하는 상황입니다" }),
    C("**외국인이 할 수 있는 업종인지** 모르겠습니다.", "서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.", ["concern_eligibility", "help_full"], { card: "업종 가능 여부가 걱정되어 전 과정을 맡기려는 상황입니다" }),
    C("**받은 견적이 적정한지** 모르겠습니다.", "서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.", ["concern_quote", "help_accompany"], { card: "받은 견적이 적정한지 확인하려는 상황입니다" }),
  ] },
  { code: "Q6", stage: 2, prompt: "설립 신청 서류는 어디까지 준비되었고, 베트남어 번역이 필요한 서류가 있나요?", f: ["pc_docs", "pc_translation"], choices: [
    C("**신청서, 여권, 자금 증빙, 사무실 계약서를 모두** 준비했습니다.", "모든 서류의 베트남어 번역도 이미 끝냈습니다.", ["docs_all", "tn_none"], { r: "서류가 갖춰졌으니 서류마다 이름·주소·자본금 숫자가 서로 맞는지만 확인하고 접수하세요." }),
    C("**대부분 준비**했고 몇 가지만 남았습니다.", "해외에서 받은 서류는 번역과 공증이 필요합니다.", ["docs_most", "tn_needed"], { r: "남은 서류와 번역·공증이 필요한 서류를 나누어 적고 인증 기간을 먼저 확인하세요." }),
    C("**절반쯤 준비**했습니다.", "베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.", ["docs_half", "tn_unsure"], { r: "준비한 서류 목록을 만든 뒤 해외 발급 서류를 골라내면 번역 대상이 분명해집니다." }),
    C("**거의 준비하지 못했습니다.**", "번역과 공증을 어디서 어떻게 하는지도 함께 알고 싶습니다.", ["docs_little", "tn_needed"], { r: "투자자 형태(법인·개인)에 따라 서류가 달라지니 그 기준의 목록부터 받으세요." }),
    C("**무엇이 필요한지 아직 모릅니다.**", "준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.", ["docs_unknown", "tn_none"], { r: "서류를 모으기 전에 투자 등록과 기업 등록 두 단계에 필요한 서류를 먼저 확인하세요." }),
  ] },
  { code: "Q7", stage: 2, prompt: "투자 자본을 넣을 은행 계좌는 열었고, 자본금은 언제까지 송금할 계획인가요?", f: ["pc_bankAccount", "pc_capitalTransfer"], choices: [
    C("**투자 자본 계좌를 이미** 열었습니다.", "정해진 기한 안에 자본금을 한 번에 송금할 계획입니다.", ["ba_opened", "ct_planned"], { r: "송금할 때 송금 목적을 자본금 납입으로 적어야 나중에 증빙이 쉬워집니다." }),
    C("**은행만 정해** 두었습니다.", "자본금은 본사 사정에 맞춰 몇 번에 나누어 송금하려고 합니다.", ["ba_bank_chosen", "ct_partial"], { r: "나누어 송금해도 기한 안에 전액을 넣어야 하니 송금 일정을 표로 정리해 두세요." }),
    C("**계좌를 아직** 열지 않았습니다.", "자본금을 설립 후 언제까지 넣어야 하는지 잘 모르겠습니다.", ["ba_not_yet", "ct_unsure_deadline"], { r: "자본금은 설립 후 정해진 기간 안에 넣어야 하니 계좌 개설과 송금 일정을 함께 잡으세요." }),
    C("**투자 자본 계좌가 필요한지** 모르겠습니다.", "본국 송금 절차 때문에 송금이 늦어질 수 있어 걱정입니다.", ["ba_unknown", "ct_delay"], { r: "외국인 투자금은 전용 계좌로 들어와야 하니 계좌부터 열고 송금 지연 사유를 미리 확인하세요." }),
    C("**계좌는 법인 설립 후** 열 예정입니다.", "설립 직후 계좌를 열고 정해진 기한 안에 자본금을 한 번에 보낼 계획입니다.", ["ba_not_yet_after", "ct_planned"], { r: "설립 직후 계좌를 열 수 있도록 은행이 요구하는 서류를 미리 알아 두세요." }),
  ] },
  { code: "Q8", stage: 2, prompt: "어떤 분야의 사업을 하실 예정이고, 그 분야에서 법인 설립 외에 추가로 필요한 허가를 알고 계신가요?", f: ["pc_businessLine", "pc_subLicense"], choices: [
    C("**무역·유통 사업**을 하려고 합니다.", "수출입이나 유통 허가가 추가로 필요한지는 아직 확인하지 못했습니다.", ["bl_trade", "sl_trade"], { r: "외국인 투자 유통은 별도 허가가 필요할 수 있으니 투자 등록 단계에서 함께 확인하세요." }),
    C("**서비스나 컨설팅 사업**을 하려고 합니다.", "법인 등록 외에 따로 받을 허가는 없다고 알고 있습니다.", ["bl_service", "sl_none"], { r: "추가 허가가 없더라도 업종 코드가 실제 사업과 맞는지 등록 전에 확인하세요." }),
    C("**식당이나 카페**를 하려고 합니다.", "법인 설립을 마친 뒤에 식품 위생과 소방 허가를 따로 받아야 한다고 알고 있습니다.", ["bl_food", "sl_food"], { r: "식당·카페는 설립 후 위생·소방 허가가 필요하니 매장 공사 일정과 함께 준비하세요." }),
    C("**공장을 세워 제품을 만드는 제조업**을 하려고 합니다.", "공장을 가동하기 전에 환경 허가를 받아야 한다고 알고 있습니다.", ["bl_manufacturing", "sl_env"], { r: "제조업은 환경 허가가 공장 설계와 함께 가야 하니 설립과 동시에 준비를 시작하세요." }),
    C("**사업 분야를 아직** 정하지 못했습니다.", "분야가 정해지면 어떤 허가가 더 필요한지도 함께 알아보고 싶습니다.", ["bl_undecided", "sl_unknown"], { r: "사업 분야를 정하면 추가 허가가 정해지니 업종 코드부터 확정하세요." }),
  ] },
  { code: "Q9", stage: 2, prompt: "법인 설립은 언제까지 마쳐야 하고, 실제 영업은 언제 시작할 예정인가요?", f: ["pc_timeline", "pc_openPlan"], choices: [
    C("**한 달 안에** 설립을 마쳐야 합니다.", "영업 시작일이 이미 정해져 있어서 미루기 어렵습니다.", ["tl_urgent", "op_date"], { r: "투자 등록과 기업 등록에 각각 시간이 걸리니 서류 인증부터 바로 시작해야 합니다." }),
    C("**두세 달 안에** 마치면 됩니다.", "사무실 임대가 시작되는 날에 맞춰 영업하려고 합니다.", ["tl_2_3m", "op_lease_start"], { r: "임대 시작일 전에 설립이 끝나도록 서류 인증 기간을 거꾸로 계산해 보세요." }),
    C("**급하지는 않습니다.**", "직원을 먼저 뽑고 교육을 마친 뒤에 영업을 시작할 계획입니다.", ["tl_flexible", "op_after_staff"], { r: "시간 여유가 있으니 외국인 직원 노동허가 일정까지 함께 계획하세요." }),
    C("**설립 시점을 아직** 정하지 못했습니다.", "영업을 언제 시작할지도 아직 정하지 않았습니다.", ["tl_unsure", "op_unsure"], { r: "설립 시점이 정해져야 사무실 계약과 송금 일정을 맞출 수 있습니다." }),
    C("**가능한 빨리** 마치고 싶습니다.", "영업 시작을 앞당기고 싶지만 정확한 시작일은 아직 정하지 못했습니다.", ["tl_asap", "op_unsure"], { r: "빨리 끝내려면 서류 인증과 번역을 동시에 진행하고 보완 요구를 줄이는 것이 가장 중요합니다." }),
  ] },
  { code: "Q10", stage: 2, prompt: "받아 본 견적은 몇 건이고, 정부 비용과 대행 범위가 구분되어 있나요?", f: ["pc_quoteStatus", "pc_quoteScope"], choices: [
    C("**견적을 받은 적이 없습니다.**", "비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.", ["quote_none", "qs_na"], { r: "견적을 받기 전에 정부 비용, 인증·번역비, 대행료를 나누어 요청하세요." }),
    C("**한 곳에서 서면 견적**을 받았습니다.", "정부 비용과 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.", ["quote_one", "qs_clear"], { r: "항목이 나뉘어 있으니 투자 등록과 기업 등록, 인장·계좌 개설까지 포함되는지 확인하세요." }),
    C("**여러 곳에서 견적**을 받았습니다.", "항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.", ["quote_several", "qs_mixed"], { r: "업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다." }),
    C("**말로만 금액**을 들었습니다.", "어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.", ["quote_verbal", "qs_unknown"], { r: "말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요." }),
    C("**광고에 나온 가격**만 보았습니다.", "추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.", ["quote_ad", "qs_unknown"], { r: "광고 가격은 기본 구성인 경우가 많으니 내 업종에서 더해지는 허가 비용을 직접 물어보세요." }),
  ] },
  { code: "Q11", stage: 2, prompt: "신청서는 누가 담당 기관에 제출하게 될 예정이고, 그 방식에서 가장 필요한 준비는 무엇인가요?", f: ["pc_submitter", "pc_submitNeed"], choices: [
    C("**제가 직접** 담당 기관에 제출하려고 합니다.", "온라인 접수 계정과 서명 방법을 어떻게 준비하는지 알고 싶습니다.", ["sub_self", "sn_account"], { r: "직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요." }),
    C("**베트남 직원이** 대신 제출해 주기로 했습니다.", "위임장과 제출 후 연락 방법을 어떻게 정하는지 알고 싶습니다.", ["sub_staff", "sn_proxy"], { r: "직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요." }),
    C("**대행사에** 서류 제출을 맡기려고 합니다.", "맡기는 업무 범위와 서류 원본 보관 방식을 어떻게 정하는지 알고 싶습니다.", ["sub_agency", "sn_scope"], { r: "대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요." }),
    C("**누가 제출할지** 아직 정하지 못했습니다.", "직접, 직원, 대행 세 가지 방식의 비용과 일정을 비교해 보고 싶습니다.", ["sub_undecided", "sn_compare"], { r: "제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요." }),
    C("**직접 제출하지만** 베트남어가 어려워 걱정입니다.", "제출하는 날 통역이 어디까지 필요한지 미리 알고 싶습니다.", ["sub_self_lang", "sn_interpreter"], { r: "직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요." }),
  ] },
  { code: "Q12", stage: 2, prompt: "법인을 세운 뒤에 가장 먼저 할 일은 무엇이고, 그 준비는 어디까지 정리했나요?", f: ["pc_postSetup", "pc_postPlan"], choices: [
    C("**세무와 회계 신고**를 먼저 준비하려고 합니다.", "설립 후에 할 일을 이미 순서대로 정리해 두었습니다.", ["ps_tax", "pf_ready"], { r: "설립 직후 세무 신고 기한이 바로 시작되니 회계 담당을 미리 정해 두세요." }),
    C("**외국인 직원을 채용**하려고 합니다.", "채용에 필요한 절차는 일부만 알아본 상태입니다.", ["ps_hiring", "pf_partial"], { r: "외국인 직원은 노동허가가 필요하니 설립 일정과 함께 노동허가 일정도 잡아 두세요." }),
    C("**대표의 비자와 거주증**을 준비하려고 합니다.", "설립 후 할 일은 아직 생각해 보지 않았습니다.", ["ps_visa", "pf_none"], { r: "대표가 상주한다면 법인 설립 후 노동허가와 거주증을 이어서 준비해야 합니다." }),
    C("**회사 계좌와 인보이스**를 먼저 준비하려고 합니다.", "설립 후에 해야 할 일을 일부만 정리해 두었습니다.", ["ps_bank", "pf_partial"], { r: "운영 계좌와 전자 인보이스는 영업 시작 전에 갖춰야 하니 설립 직후 바로 진행하세요." }),
    C("**설립 후에 무엇을 해야 하는지** 모르겠습니다.", "그 다음 단계는 아직 생각해 보지 않았습니다.", ["ps_unknown", "pf_none"], { r: "설립 후 첫 달에 할 일(세무 등록, 계좌, 직원 서류)을 목록으로 받아 두세요." }),
  ] },
  { code: "Q13", stage: 2, prompt: "법인을 세울 지역은 어디이고, 그 지역에서 신청서를 받는 담당 기관은 어떻게 확인하실 예정인가요?", f: ["pc_area", "pc_agencyNeed"], choices: [
    C("**하노이**에 세웁니다.", "신청을 받는 담당 기관이 어디인지, 온라인으로도 접수할 수 있는지 확인하고 싶습니다.", ["area_hanoi", "an_online"], { r: "온라인 접수 후 원본 제출이 필요한지만 한 번 더 확인하세요." }),
    C("**호치민**에 세웁니다.", "어느 기관에 신청서를 내야 하는지 몰라서 그것부터 알고 싶습니다.", ["area_hcm", "an_office"], { r: "지역 담당 기관을 먼저 확인해야 접수 방법과 처리 기간을 알 수 있습니다." }),
    C("**다낭**에 세웁니다.", "최근 기관이 통합되어 신청을 받는 담당 기관이 바뀌었는지 확인하고 싶습니다.", ["area_danang", "an_changed"], { r: "기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요." }),
    C("**그 밖의 도시**에 세웁니다.", "지방은 접수 방식이 다를 수 있어 방문해서 내야 하는지 확인하고 싶습니다.", ["area_other_city", "an_visit"], { r: "지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요." }),
    C("**산업단지 안**에 세웁니다.", "산업단지 관리 기관이 신청을 받는지 다른 곳이 받는지 확인하고 싶습니다.", ["area_ip", "an_zone"], { r: "산업단지 안이라면 산업단지 관리 기관이 담당하는 경우가 많으니 그곳에 먼저 문의하세요." }),
  ] },
];

export const cardTitles = { Q1: "투자 주체와 확인할 점", Q2: "자본금과 증빙", Q3: "사무실", Q4: "대표와 서류 인증" };
export const summaries = {
  "pc_mainConcern=concern_cost|pc_helpWanted=help_guide": {
    headline: "총비용을 확인하고 서류는 직접 준비하려는 상황입니다",
    body: "법인 설립 비용은 정부 비용 외에 서류 인증·번역, 사무실 임대, 대행료로 나뉩니다. 투자자 형태별 서류 목록을 받아 인증이 오래 걸리는 서류부터 준비하세요.",
  },
  "pc_mainConcern=concern_docs|pc_helpWanted=help_guide": {
    headline: "필요한 서류부터 확인해 직접 준비하려는 상황입니다",
    body: "외국인 법인 설립은 투자 등록과 기업 등록 두 단계로 진행되고, 투자자 신분 서류, 자금 증빙, 사무실 계약서가 기본입니다. 투자자 형태에 따라 서류가 달라집니다.",
  },
  "pc_mainConcern=concern_time|pc_helpWanted=help_accompany": {
    headline: "설립 일정이 걱정되어 제출 동행을 원하는 상황입니다",
    body: "서류가 갖춰진 뒤 투자 등록과 기업 등록에 각각 처리 기간이 걸리고, 해외 서류 인증에 시간이 가장 많이 듭니다. 인증부터 시작하면 일정을 줄일 수 있습니다.",
  },
  "pc_mainConcern=concern_eligibility|pc_helpWanted=help_full": {
    headline: "업종 가능 여부가 걱정되어 전 과정을 맡기려는 상황입니다",
    body: "외국인 투자는 업종에 따라 조건이 붙거나 제한될 수 있습니다. 2차 답변으로 사업 분야와 추가 허가를 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다.",
  },
  "pc_mainConcern=concern_quote|pc_helpWanted=help_accompany": {
    headline: "받은 견적을 확인하고 제출은 함께 하려는 상황입니다",
    body: "견적은 투자 등록, 기업 등록, 인장·계좌 개설, 인증·번역이 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다.",
  },
};
export const risks = {
  max: 4,
  fallback: "입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 서류의 이름·주소·자본금 숫자가 서로 맞는지 확인하세요",
  rules: [
    { id: "capital", clauses: [["pc_capital", ["cap_rough", "cap_unknown_min", "cap_undecided"]]], sentence: "자본금이 정해지지 않으면 투자 등록을 신청할 수 없어 업종 기준에 맞춰 자본금부터 정해야 합니다" },
    { id: "proof", clauses: [["pc_capitalProof", ["cp_none", "cp_unknown"]]], sentence: "자금을 증명할 자료가 없으면 보완 요구를 받을 수 있어 은행 잔고 증명이나 재무제표를 준비하세요" },
    { id: "office", clauses: [["pc_office", ["off_candidate", "off_residential", "off_undecided"]]], sentence: "회사 주소로 쓸 사무실이 확정되지 않으면 신청이 어려워 계약 가능한 사무실부터 정해야 합니다" },
    { id: "apartment", clauses: [["pc_leaseType", ["lt_apartment"]]], sentence: "주거용 아파트는 회사 주소로 인정되지 않을 수 있어 건물 용도를 먼저 확인해야 합니다" },
    { id: "legal", clauses: [["pc_foreignDocs", ["fd_not_started", "fd_unknown"]]], sentence: "해외 서류는 영사 인증과 번역에 시간이 걸리니 가장 먼저 인증을 시작하세요" },
    { id: "transfer", clauses: [["pc_capitalTransfer", ["ct_unsure_deadline", "ct_delay"]]], sentence: "자본금은 설립 후 정해진 기간 안에 송금해야 하니 송금 일정과 계좌를 미리 정해야 합니다" },
    { id: "sublicense", clauses: [["pc_subLicense", ["sl_trade", "sl_unknown"]]], sentence: "업종에 따라 별도 허가가 필요할 수 있어 투자 등록 단계에서 함께 확인해야 합니다" },
  ],
};
export const phase2Titles = { Q6: "신청 서류", Q7: "투자 자본 계좌와 송금", Q8: "사업 분야와 추가 허가", Q9: "설립 일정과 영업 시작", Q10: "견적과 비용", Q11: "제출 방식", Q12: "설립 후 할 일", Q13: "지역과 담당 기관" };
export const connections = [
  { name: "노동허가 확인", clauses: [["pc_postSetup", ["ps_hiring", "ps_visa"]], ["pc_representative", ["rep_resident"]]], sentence: "대표나 외국인 직원이 일하게 된다면 노동허가 직접 확인에서 이어서 점검해 보실 수 있습니다.", path: "/verify/wp" },
  { name: "식당 허가 확인", clauses: [["pc_businessLine", ["bl_food"]], ["pc_subLicense", ["sl_food"]]], sentence: "식당·카페를 여신다면 식당 허가 확인에서 위생·소방 준비를 함께 점검해 보실 수 있습니다.", path: "/verify/restaurant" },
  { name: "전문가 진행", clauses: [["pc_timeline", ["tl_urgent"]], ["pc_foreignDocs", ["fd_not_started"]], ["pc_helpWanted", ["help_full"]]], sentence: "일정이 급하거나 서류 인증을 시작하지 못했다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요." },
];
export const afterResultGuide = ["투자자 형태별 서류 확인", "해외 서류 인증", "자본금과 증빙 준비", "사무실 계약 확인", "설립 후 일정 정리"];
export const directNotice = "직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.";
export const reportFixed = { missingFileNotice: "서류를 첨부하면 더 정확히 확인할 수 있습니다" };
export const reportGuide = {
  title: "참고 사항",
  subtitle: "고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.",
  caption: "확인 기준일 2026.10.12 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.",
  disclaimer: "위 내용은 일반 참고 정보이며 개별 사안의 설립 가능 여부를 확정하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다. 성격이 보도 기준 또는 참고인 자료는 원문 확인 전 정보이므로 관할 기관에서 최종 확인해 주세요.",
  sources: { confirmedOn: "2026.10.12", rows: [
    { id: "1", name: "투자법 (제61/2020/QH14호): 외국인 투자자는 투자 등록 후 법인 설립", publisher: "베트남 국회 / 하이퐁시 재무국 안내", kind: "보도 기준", urls: ["https://sotc.haiphong.gov.vn/en/services/hoi-dap-dau-tu"], note: "처리 기간과 조문 번호는 공식 원문 대조 필요" },
    { id: "2", name: "기업법 (제59/2020/QH14호): 기업 등록과 자본금 납입 기한", publisher: "베트남 국회", kind: "보도 기준", urls: ["https://thuvienphapluat.vn/hoi-dap-phap-luat/phai-gop-von-du-cho-cong-ty-trong-vong-bao-nhieu-ngay-368437.html"], note: "자본금 납입 기한(90일)은 제47조 2항으로 확인함(이차 자료 기준). 그 외 조문 번호는 공식 원문 대조 필요" },
  ] },
};
export const tierRules = [
  { tier: "full", label: "전 과정 대행", clauses: [["pc_helpWanted", ["help_full"]], ["pc_timeline", ["tl_urgent", "tl_asap"]], ["pc_foreignDocs", ["fd_not_started"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: [["pc_helpWanted", ["help_accompany"]], ["pc_submitter", ["sub_undecided"]], ["pc_agencyNeed", ["an_office", "an_changed", "an_zone"]]] },
];
export const tierDefault = { tier: "write", label: "서류 작성" };
// 기존 판정 함수 computePermitCompanyResultTone(capital, office)에 넣을 값. null 은 "추가 확인 필요".
export const diagnosisMap = {
  capital: { cap_ready: "confirmed", cap_pending_proof: "confirmed", cap_rough: "unconfirmed", cap_unknown_min: "unconfirmed", cap_undecided: "unconfirmed" },
  office: { off_signed: "secured", off_provisional: null, off_candidate: "unsecured", off_residential: "unsecured", off_undecided: "unsecured" },
};
export const diagnosisFields = { capital: "pc_capital", office: "pc_office" };
