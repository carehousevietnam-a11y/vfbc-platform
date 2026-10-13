// 고객 목소리 공통 질문 틀(식당 파일럿에서 승인된 문장). 서비스 말만 cfg로 바꿔 쓴다.
// cfg: { noun: "식당 허가", openObj: "영업을", openTopic: "영업은", dateWord: "오픈 날짜", operatingD: "…", agencyHint: "…", docsR: [5문장] }
// 설계 원칙: docs/master/DECISIONS.md 2026-10-14 (고객 목소리, 비용·호객 질문 금지).
import { C } from "./register-common-spec.mjs";
// 받침 유무로 을/를을 고른다(예: 소방 승인을, 환경 허가를).
const eulReul = (w) => { const c = w.trim().slice(-1).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0 ? "을" : "를"; };

export const voiceLabels = {
  sub_agency: "대행사 제출을 고민 중",
  fl_lost: "어디서 시작할지 막막함", fl_anxious: "진행 상황을 몰라 불안함", fl_confused: "사람마다 말이 달라 혼란스러움", fl_afraid: "담당 기관 연락이 겁남", fl_tired: "한 번 막혀서 지침",
  sit_search_vn: "베트남어 자료를 이해하지 못함", sit_unknown_progress: "맡긴 일의 진행 정도를 모름", sit_conflicting: "주변 사람들의 말이 서로 다름", sit_operating: "허가 확인 전에 영업 시작", sit_rejected: "서류 보완 요구를 받은 적 있음",
  ask_agency_kr: "한국인 대행사에 문의", ask_local: "베트남 현지 업체에 문의", ask_acquaint: "지인·경험자에게 문의", ask_authority: "담당 기관에 직접 문의", ask_nobody: "아직 아무에게도 문의 못 함",
  ans_unsure_trust: "설명을 어디까지 믿을지 모름", ans_not_understood: "말이 통하지 않아 이해 못 함", ans_not_fit: "경험담이 내 경우에 맞는지 모름", ans_not_clear_vn: "기관 안내를 베트남어라 이해 못 함", ans_unknown_who: "누구에게 물어볼지 모름",
};

export function registration(p, code, cfg) {
  return { code, stage: 1, prompt: `사업자 등록은 지금 어떤 상황이고, 누구 이름으로 ${cfg.noun}${eulReul(cfg.noun)} 받을 생각이신가요?`, f: [`${p}_registration`, `${p}_owner`], choices: [
    C("**법인 등록은 끝났습니다.**", `투자한 우리 법인 이름으로 ${cfg.noun}${eulReul(cfg.noun)} 받으려고 합니다.`, ["reg_company_done", "own_fdi"], { card: "외국인 투자 법인 등록을 마친 상황입니다" }),
    C("**개인사업자로 등록했습니다.**", `제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 ${cfg.noun}${eulReul(cfg.noun)} 받으려고 합니다.`, ["reg_household_done", "own_household"], { card: "개인사업자 등록을 마친 상황입니다" }),
    C("**등록 절차가 아직 진행 중입니다.**", `끝나는 대로 베트남 현지 법인 이름으로 ${cfg.noun}${eulReul(cfg.noun)} 받을 예정입니다.`, ["reg_in_progress", "own_local"], { card: "현지 법인 등록이 진행 중인 상황입니다" }),
    C("**등록은 아직 시작도 못 했습니다.**", "어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.", ["reg_not_started", "own_partner"], { card: "사업자 등록 전이고 현지인 명의를 생각하는 상황입니다" }),
    C("**지금 어떤 상태인지** 저도 잘 모르겠습니다.", `누구 이름으로 ${cfg.noun}${eulReul(cfg.noun)} 받아야 하는지도 정하지 못했습니다.`, ["reg_unsure", "own_undecided"], { card: "등록 상태와 운영 주체부터 확인해야 하는 상황입니다" }),
  ] };
}

export function feeling(p, code, cfg) {
  return { code, stage: 1, prompt: "이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?", f: [`${p}_feeling`, `${p}_situation`], choices: [
    C("**어디서부터 시작해야 할지** 막막합니다.", "검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.", ["fl_lost", "sit_search_vn"], { card: "어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다" }),
    C("**일이 제대로 되고 있는지** 불안합니다.", "베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.", ["fl_anxious", "sit_unknown_progress"], { card: "맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다" }),
    C("**사람마다 말이 달라** 혼란스럽습니다.", `${cfg.conflictWho ?? "건물주, 업체, 지인이"} 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.`, ["fl_confused", "sit_conflicting"], { card: "사람마다 말이 달라 혼란스러운 상황입니다" }),
    C("**담당 기관에서 연락이 올까** 겁이 납니다.", cfg.operatingD, ["fl_afraid", "sit_operating"], { card: "허가 확인 전에 시작해 불안한 상황입니다" }),
    C("**이미 한 번 막혀서** 지쳤습니다.", "서류를 냈다가 보완하라고 돌려받은 적이 있습니다.", ["fl_tired", "sit_rejected"], { card: "서류가 한 번 되돌아와 지친 상황입니다" }),
  ] };
}

export function docs(p, code, cfg, allLead = "**서류는 다 모았습니다.**") {
  const tip = ["", "통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요.", "직원 설명은 서류 원문과 대조해 확인하세요.", "인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요.", "베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요."];
  const r = (i) => (tip[i] ? `${cfg.docsR[i]} ${tip[i]}` : cfg.docsR[i]);
  return { code, stage: 2, prompt: "허가 서류는 얼마나 모으셨고, 그 서류에 뭐라고 적혀 있는지는 어떻게 알고 계신가요?", f: [`${p}_docs`, `${p}_langRoute`], choices: [
    C(allLead, "베트남어를 직접 읽을 수 있어서 내용도 제가 확인했습니다.", ["docs_all", "lr_self"], { r: r(0) }),
    C("**거의 모았고 몇 개 남았습니다.**", "베트남어를 하는 지인이나 통역해 주는 분이 서류 내용을 읽어 줍니다.", ["docs_most", "lr_interp"], { r: r(1) }),
    C("**절반쯤 모았습니다.**", "한국어를 하는 베트남 직원이 설명해 주는데 서류 원문과 맞는지는 확인하지 못했습니다.", ["docs_half", "lr_local"], { r: r(2) }),
    C("**거의 모으지 못했습니다.**", "번역기로 읽어 보니 필요한 서류가 많아 보이는데 번역이 맞는지 모르겠습니다.", ["docs_little", "lr_machine"], { r: r(3) }),
    C("**뭐가 필요한지도** 모릅니다.", "베트남어를 전혀 몰라서 서류에 뭐가 적혀 있는지 알 수 없고 물어볼 사람도 없습니다.", ["docs_unknown", "lr_none"], { r: r(4) }),
  ] };
}

export function timeline(p, code, cfg, r) {
  return { code, stage: 2, prompt: `허가는 언제까지 받아야 마음이 놓이고, ${cfg.openTopic} 언제쯤 시작하고 싶으신가요?`, f: [`${p}_timeline`, `${p}_openPlan`], choices: [
    C("**한 달 안에는** 받아야 합니다.", `${cfg.dateWord}${eulReul(cfg.dateWord)} 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.`, ["tl_urgent", "op_date"], { r: r[0] }),
    C("**두세 달 안에** 받으면 됩니다.", `${cfg.fitout ?? "공사가 끝나는 날에 맞춰"} ${cfg.openObj} 시작하려고 합니다.`, ["tl_2_3m", "op_after_fitout"], { r: r[1] }),
    C("**급하진 않습니다.**", `서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 ${cfg.openObj} 시작하고 싶습니다.`, ["tl_flexible", "op_after_permit"], { r: r[2] }),
    C("**언제까지인지** 모르겠습니다.", `허가가 언제까지 필요한지, ${cfg.openObj} 언제 시작할지도 아직 정하지 못했습니다.`, ["tl_unsure", "op_unsure"], { r: r[3] }),
    C(`**${cfg.openNow}**`, "허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.", ["tl_already", "op_running"], { r: r[4] }),
  ] };
}

export function asked(p, code, officeHint = "먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요.") {
  return { code, stage: 2, prompt: "지금까지 이 일로 누구에게 물어봤고, 그 대답은 어땠나요?", f: [`${p}_askedWho`, `${p}_answerFeel`], choices: [
    C("**한국 사람이 하는 대행사에** 물어봤습니다.", "설명은 들었는데 어디까지 믿어도 되는지 판단이 안 섭니다.", ["ask_agency_kr", "ans_unsure_trust"], { r: "여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요." }),
    C("**베트남 현지 업체에** 물어봤습니다.", "말이 잘 통하지 않아서 제대로 이해했는지 모르겠습니다.", ["ask_local", "ans_not_understood"], { r: "현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요." }),
    C("**지인이나 먼저 해 본 분께** 물어봤습니다.", "경험담은 들었는데 제 경우에도 맞는지 모르겠습니다.", ["ask_acquaint", "ans_not_fit"], { r: "경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요." }),
    C("**담당 기관에 직접 문의**해 봤습니다.", "안내는 받았지만 베트남어라 확실히 이해하지 못했습니다.", ["ask_authority", "ans_not_clear_vn"], { r: "기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요." }),
    C("**아직 아무에게도** 못 물어봤습니다.", "누구에게 물어봐야 하는지, 어디에 물어봐야 하는지부터 모르겠습니다.", ["ask_nobody", "ans_unknown_who"], { r: officeHint }),
  ] };
}

export function submit(p, code) {
  return { code, stage: 2, prompt: "서류를 담당 기관에 내는 일은 누가 하게 될 것 같고, 그때 가장 걱정되는 건 뭔가요?", f: [`${p}_submitter`, `${p}_submitNeed`], choices: [
    C("**제가 직접** 낼 생각입니다.", "온라인 접수는 어떻게 하고 서명은 어떻게 하는지 모르겠습니다.", ["sub_self", "sn_account"], { r: "직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요." }),
    C("**베트남 직원이** 대신 내기로 했습니다.", "위임장은 어떻게 하고, 낸 뒤 연락은 누가 받는지 걱정됩니다.", ["sub_staff", "sn_proxy"], { r: "직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요." }),
    C("**대행사에 맡길지** 고민 중입니다.", "어디까지 맡기는 건지, 서류 원본은 누가 보관하는지 불안합니다.", ["sub_agency", "sn_scope"], { r: "대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요." }),
    C("**누가 낼지** 아직 못 정했습니다.", "직접 하는 것과 직원, 대행사 중 어느 쪽이 나은지 모르겠습니다.", ["sub_undecided", "sn_compare"], { r: "제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요." }),
    C("**직접 접수하러 가야 하는데** 베트남어가 걱정입니다.", "담당 기관 직원이 뭐라고 물어볼지, 통역이 필요한지 막막합니다.", ["sub_self_lang", "sn_interpreter"], { r: "직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요." }),
  ] };
}

export function area(p, code, hint) {
  return { code, stage: 2, prompt: "사업장이 있는 곳은 어디이고, 서류를 어느 기관에 내야 하는지는 알아보셨나요?", f: [`${p}_area`, `${p}_agencyNeed`], choices: [
    C("**하노이**입니다.", "어느 기관에 내야 하는지, 온라인으로도 낼 수 있는지 알아보고 있습니다.", ["area_hanoi", "an_online"], { r: "온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요." }),
    C("**호치민**입니다.", "어느 기관에 내야 하는지 몰라서 그것부터 알고 싶고 온라인 접수가 되는지도 궁금합니다.", ["area_hcm", "an_office"], { r: hint }),
    C("**다낭**입니다.", "최근 기관이 합쳐졌다는 말을 들었는데 지금은 어디에 내야 하는지 모르겠습니다.", ["area_danang", "an_changed"], { r: "기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요." }),
    C("**그 밖의 도시**입니다.", "지방은 방식이 다르다고 해서 직접 가서 내야 하는지 궁금합니다.", ["area_other_city", "an_visit"], { r: "지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요." }),
    C("**산업단지 안**입니다.", "단지 관리 기관에 내는지 아니면 다른 곳에 내는지 아는 사람이 없어서 모르겠습니다.", ["area_ip", "an_zone"], { r: "산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요." }),
  ] };
}

export const riskRules = (p) => [
  { id: "registration", clauses: [[`${p}_registration`, ["reg_not_started", "reg_unsure"]]], sentence: "사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다" },
  { id: "nominee", clauses: [[`${p}_owner`, ["own_partner"]]], sentence: "현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다" },
  { id: "running", clauses: [[`${p}_timeline`, ["tl_already"]]], sentence: "허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다" },
  { id: "language", clauses: [[`${p}_langRoute`, ["lr_local", "lr_machine", "lr_none"]]], sentence: "베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다" },
  { id: "answer", clauses: [[`${p}_answerFeel`, ["ans_not_understood", "ans_not_clear_vn"]]], sentence: "받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다" },
];

export const tier = (p) => [
  { tier: "full", label: "전 과정 대행", clauses: [[`${p}_timeline`, ["tl_urgent", "tl_already"]], [`${p}_registration`, ["reg_not_started"]], [`${p}_situation`, ["sit_operating"]]] },
  { tier: "accompany", label: "작성과 제출 동행", clauses: [[`${p}_submitter`, ["sub_undecided"]], [`${p}_agencyNeed`, ["an_office", "an_changed", "an_zone"]], [`${p}_situation`, ["sit_rejected"]], [`${p}_langRoute`, ["lr_none"]]] },
];

export const connectionPro = (p, sentence) => ({ name: "전문가 진행", clauses: [[`${p}_timeline`, ["tl_already", "tl_urgent"]], [`${p}_situation`, ["sit_operating"]]], sentence });

// bodies: [시작 막막, 진행 불안, 말이 다름 혼란, 허가 전 시작 겁, 서류 반려 지침] 순서의 본문 5개
export function summaries(p, bodies) {
  const keys = [["fl_lost", "sit_search_vn"], ["fl_anxious", "sit_unknown_progress"], ["fl_confused", "sit_conflicting"], ["fl_afraid", "sit_operating"], ["fl_tired", "sit_rejected"]];
  const heads = ["어디서부터 시작해야 할지 몰라 막막한 상황입니다", "맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다", "사람마다 말이 달라 혼란스러운 상황입니다", "허가 확인 전에 시작해 불안한 상황입니다", "서류가 한 번 되돌아와 지친 상황입니다"];
  return Object.fromEntries(keys.map(([a, b], i) => [`${p}_feeling=${a}|${p}_situation=${b}`, { headline: heads[i], body: bodies[i] }]));
}
