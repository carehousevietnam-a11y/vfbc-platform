// TAMTRU(임시 거주 신고) 콘텐츠: scripts/tamtru-content-spec.mjs 가 원본이다. 이 스크립트가 설계서(md)와 팩 데이터를 함께 만든다.
// 실행: node scripts/build-tamtru-content-final.mjs --write   (--check 는 파일이 원본과 같은지만 확인)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as S from "./tamtru-content-spec.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MD = path.join(root, "docs/master/content/TAMTRU_CONTENT_V3.md");
const DATA = path.join(root, "src/lib/contentPacks/tamtru/tamtruContentFinal.data.ts");
const CIRC = ["①", "②", "③", "④", "⑤"];
const pairKey = (f, v) => `${f[0]}=${v[0]}|${f[1]}=${v[1]}`;
const clause = ([field, values]) => ({ field, values });
const condText = (cl) => cl.map(([f, v]) => `\`${f}\` ∈ {${v.join(", ")}}`).join(" 또는 ");

function splitLead(lead) {
  const plain = lead.replace(/\*\*/g, "");
  const m = plain.match(/^([\s\S]+?[.?!。])\s*$/);
  return m ? m[1] : plain;
}

export function buildData() {
  const questions = S.questions.map((q) => ({
    code: q.code,
    id: `tamtru_${q.code.toLowerCase()}`,
    route: "M",
    phase: q.stage,
    prompt: q.prompt,
    choices: q.choices.map((c, i) => ({
      value: `o${i + 1}`,
      label: splitLead(c.lead),
      description: c.d,
      fields: { [q.f[0]]: c.v[0], [q.f[1]]: c.v[1] },
    })),
    directFields: { [q.f[0]]: "direct_input", [q.f[1]]: "direct_input_detail" },
  }));
  const cards = ["Q1", "Q2", "Q3", "Q4"].map((code) => {
    const q = S.questions.find((x) => x.code === code);
    return { questionCode: code, title: S.cardTitles[code], sentences: Object.fromEntries(q.choices.map((c) => [pairKey(q.f, c.v), c.card])) };
  });
  const phase2Result = S.questions.filter((q) => q.stage === 2).map((q) => ({
    questionCode: q.code,
    title: S.phase2Titles[q.code],
    sentences: Object.fromEntries(q.choices.map((c) => [pairKey(q.f, c.v), c.r])),
  }));
  const used = new Set();
  S.questions.forEach((q) => q.choices.forEach((c) => c.v.forEach((v) => used.add(v))));
  const labels = Object.fromEntries([...used].sort().map((v) => [v, S.labels[v]]));
  return {
    questions,
    firstResult: {
      cards,
      verdictQuestionCode: "Q5",
      verdicts: S.summaries,
      risks: { rules: S.risks.rules.map((r) => ({ id: r.id, sentence: r.sentence, clauses: r.clauses.map(clause) })), fallback: S.risks.fallback, max: S.risks.max },
    },
    phase2Result,
    labels,
    connections: S.connections.map((c) => ({ name: c.name, condition: condText(c.clauses), sentence: c.sentence, mode: "or", clauses: c.clauses.map(clause), ...(c.path ? { path: c.path } : {}) })),
    afterResultGuide: [...S.afterResultGuide],
    directNotice: S.directNotice,
    reportFixed: S.reportFixed,
    reportGuide: S.reportGuide,
    tier: {
      rules: S.tierRules.map((r) => ({ tier: r.tier, label: r.label, clauses: r.clauses.map(clause) })),
      fallback: S.tierDefault,
    },
    diagnosisMap: S.diagnosisMap,
    diagnosisFields: S.diagnosisFields,
  };
}

export function buildMd() {
  const o = [];
  o.push(`# 임시 거주 신고(땀주) 직접 확인하기 콘텐츠 설계서

이 문서는 scripts/tamtru-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

## 0. 구조 요약

| 항목 | 값 |
|---|---|
| 1차 질문 | 5개 |
| 2차 질문 | 8개 (2차 비율 61.5%, 기준 60% 이상) |
| 선택지 | 질문마다 5개 + 직접 입력(개수에서 제외) |
| 저장 필드 | 선택지마다 2개(첫째 정보, 별개의 둘째 정보), 질문 13개의 필드 26개가 모두 다름 |
| 경로 | 1개 |

## 1. 기존 판정 엔진 연결 (판정 함수는 바꾸지 않는다)

| 새 저장값 | 기존 판정 입력 |
|---|---|
${Object.entries(S.diagnosisMap).flatMap(([k, m]) => Object.entries(m).map(([v, t]) => `| ${v} | ${k}: ${t ?? "비어 있음(추가 확인 필요)"} |`)).join("\n")}

## 2. 무료·유료 경계

| 구분 | 무료 1차 | 유료 개인화 |
|---|---|---|
| 상황 정리 | 1차 답에서 만든 카드 문장과 상황 정리 | 1차·2차 답을 합친 요약 |
| 안내 | 확인할 점, 다음 확인 | 2차 답에서 고른 안내, 서류·일정 |
| 신고 기한·과태료 | 일반 참고로 표시 | 내 상황 기준 안내 |
| 판정(가능·조건부·불가) | 표시하지 않음 | 표시(기존 판정 엔진) |
| 점수 | 표시하지 않음 | 표시하지 않음 |
| 서비스 단계 추천 | 표시하지 않음 | 표시 |

## 3. 서비스 단계 추천 규칙 (유료에서만)

${S.tierRules.map((r, i) => `${i + 1}. ${r.label}: ${condText(r.clauses)}`).join("\n")}
${S.tierRules.length + 1}. ${S.tierDefault.label}: 위에 해당하지 않을 때

## 4. 질문과 선택지
`);
  for (const q of S.questions) {
    o.push(`### ${q.stage === 1 ? "1차" : "2차"} ${q.code.slice(1)}번 — ${q.code}\n\n**${q.prompt}**\n`);
    q.choices.forEach((c, i) => o.push(`${CIRC[i]} ${c.lead} ${c.d}  `));
    o.push(`⑥ **직접 입력**\n\n| 선택 | 저장 필드 | ${q.stage === 1 ? "카드 문장" : "안내 문장"} |\n|---|---|---|`);
    q.choices.forEach((c, i) => o.push(`| ${CIRC[i]} | \`${q.f[0]}=${c.v[0]}\`, \`${q.f[1]}=${c.v[1]}\` | ${c.card ?? c.r} |`));
    o.push("");
  }
  o.push(`## 5. 1차 상황 정리 (1차 5번 선택별)\n\n| 저장 필드 | 제목 | 안내 |\n|---|---|---|`);
  for (const [k, v] of Object.entries(S.summaries)) o.push(`| \`${k.split("|").join("`, `")}\` | ${v.headline} | ${v.body} |`);
  o.push(`\n## 6. 확인할 점 규칙 (최대 ${S.risks.max}개, 없으면 기본 문장)\n\n| 번호 | 조건 | 문장 |\n|---|---|---|`);
  S.risks.rules.forEach((r, i) => o.push(`| ${i + 1} (${r.id}) | ${condText(r.clauses)} | ${r.sentence} |`));
  o.push(`\n기본 문장: ${S.risks.fallback}\n\n## 7. 다른 검토 연결\n\n| 연결 | 조건 | 문장 |\n|---|---|---|`);
  S.connections.forEach((c) => o.push(`| ${c.name} | ${condText(c.clauses)} | ${c.sentence} |`));
  o.push(`\n## 8. 값 → 고객 표시 문구\n\n| 내부 값 | 고객 화면 표시 |\n|---|---|`);
  const d = buildData();
  Object.entries(d.labels).forEach(([k, v]) => o.push(`| \`${k}\` | ${v} |`));
  o.push(`\n## 9. 근거·출처 (확인일 ${S.reportGuide.sources.confirmedOn})\n\n| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |\n|---|---|---|---|---|---|`);
  S.reportGuide.sources.rows.forEach((r) => o.push(`| ${r.id} | ${r.name} | ${r.publisher} | ${r.kind} | ${r.urls.join(" , ") || "원문 링크 확인 중"} | ${r.note} |`));
  o.push("");
  return o.join("\n");
}

export function buildDataTs() {
  return `// Generated by scripts/build-tamtru-content-final.mjs from scripts/tamtru-content-spec.mjs. Do not edit.\nexport const TAMTRU_CONTENT_FINAL = ${JSON.stringify(buildData(), null, 2)} as const;\n`;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const md = buildMd(), ts = buildDataTs();
  if (process.argv.includes("--write")) {
    fs.writeFileSync(MD, md); fs.writeFileSync(DATA, ts); console.log("wrote", MD, DATA);
  } else if (process.argv.includes("--check")) {
    const ok = fs.readFileSync(MD, "utf8") === md && fs.readFileSync(DATA, "utf8") === ts;
    if (!ok) { console.error("TAMTRU content files are out of date. Run: node scripts/build-tamtru-content-final.mjs --write"); process.exit(1); }
    console.log("PASS tamtru content up to date");
  } else console.log("usage: --write | --check");
}
