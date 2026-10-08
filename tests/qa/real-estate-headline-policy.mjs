import fs from "fs";
import path from "path";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { isFalseOkVerdict } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";

const DISPUTE_VALUES = {
  RE02: ["dt_not_returned", "dt_deposit_forfeited", "dt_contact_avoided", "hd_forfeit_dispute", "hd_double_demand"],
  RE03: ["r3_dm_terminate", "r3_dm_money_claim", "r3_dm_vacate_date"],
  RE04: ["it_repair_refused", "it_prior_defect_blamed", "sw_over_month"],
};

const OUT = path.join("docs/content-packs/proposals/RE_HEADLINE_POLICY_PROPOSAL.md");

const report = { RE02: { count: 0, samples: [] }, RE03: { count: 0, samples: [] }, RE04: { count: 0, samples: [] } };

for (const [caseId, values] of Object.entries(DISPUTE_VALUES)) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    const selected = new Set(Object.values(answers).map(String));
    if (!values.some((v) => selected.has(v))) continue;
    const data = buildFirstResultData(caseId, answers);
    if (!isFalseOkVerdict(data)) continue;
    report[caseId].count++;
    if (report[caseId].samples.length < 5) {
      report[caseId].samples.push({
        answers: Object.fromEntries(Object.entries(answers).filter(([, v]) => values.includes(String(v)))),
        headline: data.statusHeadline,
        grade: data.gradeLabel,
      });
    }
  }
}

const body = `# RE02~RE04 분쟁 중 선택 + 양호 헤드라인 (정책 제안 — C1.18)

Pack 판정 규칙은 변경하지 않음. 아래는 **현재 Pack 합산 결과**에서 「큰 문제가 보이지 않습니다」+「양호 (1단계)」가 나온 조합 건수(정책 검토용).

| 유형 | 건수(분쟁 value 포함·양호 헤드라인) |
|---|---|
| RE02 | ${report.RE02.count} |
| RE03 | ${report.RE03.count} |
| RE04 | ${report.RE04.count} |

## 조합 예시 (각 유형 최대 5)

${["RE02", "RE03", "RE04"]
  .map(
    (c) =>
      `### ${c}\n${report[c].samples.map((s, i) => `${i + 1}. ${JSON.stringify(s)}`).join("\n") || "(없음)"}`,
  )
  .join("\n\n")}

## 정책 질문

분쟁 진행·미반환·통보 수신 등 phase1 선택만으로 1차 헤드라인을 주의 이상으로 올릴지, Pack § 위험 신호·합산만 유지할지 Ace 판단 필요.
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body, "utf8");
console.log(JSON.stringify(report, null, 2));
