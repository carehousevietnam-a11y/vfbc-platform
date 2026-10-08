import fs from "fs";
import path from "path";
import { enumerateCoveringPhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { metricEchoesOptionLabel } from "../../src/lib/contentPacks/realEstate/echoChecks.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bundle = realEstatePackBundle();
const rows = [];

for (const caseId of CASES) {
  const seen = new Set();
  for (const answers of enumerateCoveringPhase1Combinations(caseId)) {
    const data = buildFirstResultData(caseId, answers);
    for (let i = 1; i <= 2; i++) {
      const line = data.keyMetrics[i]?.footnote ?? "";
      if (!line || !metricEchoesOptionLabel(caseId, answers, line, i)) continue;
      const fieldIds = bundle.phase1Order?.[caseId] ?? [];
      for (const qid of fieldIds) {
        const v = answers[qid];
        if (v == null) continue;
        const node = bundle.nodes[caseId]?.find((n) => n.id === qid);
        const opt = node?.options?.find((o) => o.value === String(v));
        if (!opt) continue;
        const key = `${caseId}|${qid}|${v}|m${i + 1}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
          caseId,
          field: qid,
          value: String(v),
          metric: `m${i + 1}`,
          currentOutput: line,
          neededResultSentence: "",
        });
      }
    }
  }
}

const OUT = path.join("docs/content-packs/proposals/RE_ECHO_PROPOSAL.md");
const body = `# RE 선택 라벨 echo — Pack §3 결과 문장 필요 (C1.19)

| 유형 | 필드 | 값 | metric | 현재 출력(선택 라벨 복사) | 필요한 결과 문장 |
|---|---|---|---|---|---|
${rows.map((r) => `| ${r.caseId} | ${r.field} | ${r.value} | ${r.metric} | ${r.currentOutput.replace(/\|/g, "\\|")} | |`).join("\n")}

임의 작문 금지. Pack §3에 문장 추가 후 파서 반영.
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body, "utf8");
console.log("echo rows", rows.length);
