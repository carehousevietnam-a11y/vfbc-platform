/**
 * 법인설립 랜딩 「내 상황」 3단계 질문(질문 3개 × 선택지 5개 + 직접 입력).
 * 랜딩(src/app/company)과 퍼널 입구 안내(src/app/verify/company)가 같은 문구를 쓰도록 한 곳에 둔다.
 * 구조: 질문 1 = 무엇이 막막한가, 질문 2 = 어떤 사업인가, 질문 3 = 지금까지 어떻게 진행했는가.
 * 선택지(2층): lead = 1층(상황, 굵은 글씨), detail = 2층(막막한 점). 둘 다 "~합니다"로 끝난다. 비용 선택지는 넣지 않는다.
 * URL 에는 코드(q1,q2,q3)만 싣는다. 직접 입력 글은 URL 에 싣지 않고 sessionStorage 로만 넘긴다.
 */
export type EntryChoice = { code: string; lead: string; detail: string };
export type EntryQuestion = { key: "q1" | "q2" | "q3"; title: string; summaryLabel: string; choices: ReadonlyArray<EntryChoice> };

export const COMPANY_ENTRY_QUESTIONS: ReadonlyArray<EntryQuestion> = [
  {
    key: "q1",
    title: "베트남에 법인을 세우시려는데, 지금 어떤 상황이고 가장 막막한 부분은 어디입니까?",
    summaryLabel: "막막한 부분",
    choices: [
      {
        code: "ownership",
        lead: "외국인 투자 법인으로 할지, 베트남 사람 명의로 할지 정하지 못했습니다.",
        detail: "베트남 내국인 명의로 해도 지분을 몇%나 가질 수 있는지, 그리고 내국인 명의가 문제가 없는지 모르겠습니다.",
      },
      { code: "capital", lead: "자본금을 정하고 있습니다.", detail: "얼마로 정해야 하는지, 언제까지 어떻게 넣어야 하는지 모르겠습니다." },
      { code: "period", lead: "이제 설립을 시작하려고 합니다.", detail: "어떤 순서로 얼마나 걸리는지 전체 흐름을 모르겠습니다." },
      { code: "remote", lead: "베트남에 상주하기 어렵습니다.", detail: "가지 않고도 설립이 되는지, 비자와 노동허가는 어떻게 되는지 모르겠습니다." },
      { code: "after", lead: "설립을 했거나 곧 하려고 합니다.", detail: "그 뒤 매달 세무·회계 신고를 어떻게 해야 할지 막막합니다." },
    ],
  },
  {
    key: "q2",
    title: "어떤 사업을 하시려고 합니까?",
    summaryLabel: "사업",
    choices: [
      { code: "food", lead: "식당이나 카페를 하려고 합니다.", detail: "법인 외에 위생·소방 허가까지 함께 해야 하는지 모르겠습니다." },
      { code: "trade", lead: "무역이나 유통을 하려고 합니다.", detail: "수출입과 소매에 따로 필요한 허가가 있는지 모르겠습니다." },
      { code: "factory", lead: "공장을 짓거나 임대해서 제조를 하려고 합니다.", detail: "부지와 환경 허가가 설립 절차에 어떻게 들어가는지 모르겠습니다." },
      { code: "consumer", lead: "의류나 화장품 같은 소비재를 팔려고 합니다.", detail: "품목별로 필요한 등록과 허가가 다른지 모르겠습니다." },
      { code: "service", lead: "서비스, 컨설팅, IT 사업을 하려고 합니다.", detail: "외국인 지분이나 업종 제한이 있는지 모르겠습니다." },
    ],
  },
  {
    key: "q3",
    title: "지금까지 어떻게 진행해 오셨습니까?",
    summaryLabel: "지금까지",
    choices: [
      { code: "first", lead: "처음 알아보는 중입니다.", detail: "어디서부터 시작해야 하는지 모르겠습니다." },
      { code: "compared", lead: "여러 곳에 알아봤습니다.", detail: "안내가 서로 달라 어느 말이 맞는지 판단하기 어렵습니다." },
      { code: "rejected", lead: "신청했다가 반려되었습니다.", detail: "무엇이 문제였는지, 다시 하면 되는지 모르겠습니다." },
      { code: "victim", lead: "대행을 맡겼다가 피해를 입었습니다.", detail: "맡긴 서류와 돈이 어떻게 되었는지, 지금 무엇을 해야 하는지 모르겠습니다." },
      { code: "entrusted", lead: "이미 한 곳에 맡겨 진행 중입니다.", detail: "제대로 되고 있는지 확인할 방법이 없어 불안합니다." },
    ],
  },
];

export const COMPANY_ENTRY_CUSTOM_LABEL = "직접 입력";
export const COMPANY_ENTRY_CUSTOM_PLACEHOLDER = "상황을 직접 적어 주세요";
export const COMPANY_ENTRY_CUSTOM_MAX = 200;
export const COMPANY_ENTRY_STORAGE_KEY = "vfbcai.companyEntry.custom";
export const COMPANY_ENTRY_CUSTOM_CODE = "custom";

/** 코드로 선택지 문장(굵은 글 + 설명)을 찾는다. 모르는 코드면 null. */
export function companyEntryChoice(qKey: EntryQuestion["key"], code: string | null | undefined): EntryChoice | null {
  const q = COMPANY_ENTRY_QUESTIONS.find((x) => x.key === qKey);
  return q?.choices.find((c) => c.code === code) ?? null;
}
