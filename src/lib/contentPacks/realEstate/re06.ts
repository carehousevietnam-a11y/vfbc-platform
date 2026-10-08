const RE06_KEYWORDS: { pattern: RegExp; caseId: string }[] = [
  { pattern: /계약\s*전|서명\s*전|빌리|사기\s*전|임대차|분양/i, caseId: "RE01" },
  { pattern: /보증금|계약금|돌려받|반환|공제|몰수/i, caseId: "RE02" },
  { pattern: /해지|퇴거|위반\s*통보|시정\s*요구/i, caseId: "RE03" },
  { pattern: /수리|하자|관리비|이웃|거주\s*중/i, caseId: "RE04" },
  { pattern: /명의\s*이전|핑크북|토지사용권|권리\s*서류/i, caseId: "RE05" },
];

const EXPERT_KEYWORDS =
  /소송|형사|공안\s*신고|연락\s*두절|다수\s*당사자|여러\s*호실|여러\s*건물|회사\s*명의\s*매수/i;

export type Re06Route = {
  caseId: string | null;
  expertHandoff: boolean;
};

export function routeRe06DirectInput(text: string): Re06Route {
  const t = text.trim();
  if (!t) return { caseId: null, expertHandoff: true };
  if (EXPERT_KEYWORDS.test(t)) return { caseId: null, expertHandoff: true };
  for (const row of RE06_KEYWORDS) {
    if (row.pattern.test(t)) return { caseId: row.caseId, expertHandoff: false };
  }
  return { caseId: null, expertHandoff: true };
}
