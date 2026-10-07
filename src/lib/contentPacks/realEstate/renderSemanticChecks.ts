import type { AnswerMap, RealEstateCaseId } from "./types";
import { realEstatePackBundle } from "./packBundle";
import { isRe01ViewingOriginalMatchSemanticFail } from "./m45Engine";

export type SemanticRule = {
  caseId: RealEstateCaseId;
  field: string;
  /** 선택 라벨에서 추출한 긍/부 서술이 결과 문장에 같은 방향으로 있어야 함 */
  expectInText: (choiceLabel: string, rendered: string) => boolean | "skip";
};

const bundle = realEstatePackBundle();

function choiceLabel(caseId: RealEstateCaseId, field: string, value: unknown): string {
  const node = bundle.nodes[caseId]?.find((n) => n.id === field);
  const v = String(value ?? "");
  const opt = node?.options?.find((o) => o.value === v);
  return opt?.label?.trim() ?? "";
}

function labelImplies(label: string, positive: RegExp, negative: RegExp): "pos" | "neg" | "skip" {
  if (positive.test(label)) return "pos";
  if (negative.test(label)) return "neg";
  return "skip";
}

const FIELD_RULES: SemanticRule[] = [
  {
    caseId: "RE01",
    field: "re01_progress_stage",
    expectInText(label, text) {
      const pol = labelImplies(label, /못 받|아직.*못|받지 못/, /받은|이미 받|서명|송금|보냈/);
      if (pol === "skip") return "skip";
      if (pol === "pos") return /받지 못|못 받|아직.*못/.test(text);
      return !/받지 못한 단계만|아직 서류를 받지 못한 단계라, 소유자/.test(text) || /이미|서명|송금|보냈/.test(text);
    },
  },
  {
    caseId: "RE01",
    field: "re01_owner_doc_check",
    expectInText(label, text) {
      if (/원본.*직접|직접.*원본/.test(label) && /일치|같음/.test(label)) {
        return /원본|직접/.test(text) && /일치/.test(text) && !/설명만/.test(text);
      }
      if (/사본만/.test(label)) return /사본/.test(text);
      if (/미뤄|거부|없고/.test(label)) return /미뤄|거부|없/.test(text);
      return "skip";
    },
  },
  {
    caseId: "RE03",
    field: "re03_response_status",
    expectInText(label, text) {
      if (/답하지 않/.test(label)) return /답하지 않|아직/.test(text);
      if (/이유를 물어/.test(label)) return /물어|문/.test(text);
      if (/사실과 다르/.test(label)) return /다르|부인|반박/.test(text);
      return "skip";
    },
  },
];

export const SEMANTIC_RULE_SKIP_FIELDS: { caseId: RealEstateCaseId; field: string; reason: string }[] = [
  { caseId: "RE01", field: "re01_confirm_goal", reason: "목표형 선택 — 결과는 확인 대상 서술" },
  { caseId: "RE01", field: "re01_contract_type", reason: "계약 유형 — 상황 문장에 축약 반영" },
  { caseId: "RE02", field: "re02_dispute_type", reason: "분쟁 유형 — 복합 lookup 문장" },
  { caseId: "RE02", field: "re02_role", reason: "역할 라벨 — 문장 주어 축약" },
  { caseId: "RE04", field: "re04_issue_type", reason: "이슈 유형 — 장문 lookup" },
  { caseId: "RE05", field: "re05_stage", reason: "단계 요약 — 복합 3필드 문장" },
];

export function checkChoiceMeaningViolations(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  metricLines: string[],
): string[] {
  const rendered = metricLines.join("\n");
  const hits: string[] = [];

  if (caseId === "RE01") {
    const m2 = metricLines[1] ?? "";
    if (isRe01ViewingOriginalMatchSemanticFail(answers, m2)) {
      hits.push("RE01:viewing×original_match semantic");
    }
  }

  for (const rule of FIELD_RULES.filter((r) => r.caseId === caseId)) {
    const val = answers[rule.field];
    if (val == null || val === "") continue;
    const label = choiceLabel(caseId, rule.field, val);
    if (!label) continue;
    const ok = rule.expectInText(label, rendered);
    if (ok === "skip") continue;
    if (!ok) hits.push(`${caseId}:${rule.field}`);
  }
  return hits;
}
