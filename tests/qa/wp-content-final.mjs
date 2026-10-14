/**
 * WP(노동허가) 콘텐츠 팩 점검.
 * Run: node tests/qa/wp-content-final.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const fail = (message) => failures.push(message);

// 1. 원본(spec)에서 만든 파일과 같은가
const check = spawnSync(process.execPath, [path.join(repoRoot, "scripts/build-wp-content-final.mjs"), "--check"], { encoding: "utf8" });
if (check.status !== 0) fail(`wp content files out of date: ${check.stderr.trim()}`);

const pack = await import("../../src/lib/contentPacks/wp/wpPack.ts");
const diag = await import("../../src/lib/checkDiagnosis.ts");
const { WP_CONTENT_FINAL: data } = pack;
const bridge = pack.createWpVerifyMasterPackBridge();

// 2. 구조 기준
const latin = /[A-Za-z]/;
const banned = /반드시|무조건|100%/;
const phase1 = data.questions.filter((q) => q.phase === 1);
const phase2 = data.questions.filter((q) => q.phase === 2);
if (phase1.length < 1 || phase2.length < 1) fail("each phase needs questions");
if (phase2.length / data.questions.length < 0.6) fail("phase2 ratio below 60%");
const fieldSeen = new Set();
for (const q of data.questions) {
  if (!/[,，]/.test(q.prompt) || [...q.prompt].length < 30) fail(`${q.code} prompt`);
  if (q.choices.length < 4 || q.choices.length > 5) fail(`${q.code} choices ${q.choices.length}`);
  const descs = new Set();
  const share = {};
  const f1s = new Set();
  const labels = new Set();
  for (const c of q.choices) {
    const keys = Object.keys(c.fields);
    if (keys.length !== 2) fail(`${q.code} ${c.value} fields`);
    keys.forEach((k) => fieldSeen.add(`${k}|${q.code}`));
    const line = `${c.label} ${c.description}`;
    if ([...line].length < 45 || !line.includes(".")) fail(`${q.code} ${c.value} line`);
    if (latin.test(line) || banned.test(line)) fail(`${q.code} ${c.value} forbidden text`);
    if (descs.has(c.description)) fail(`${q.code} duplicate description`);
    descs.add(c.description);
    if (labels.has(c.label)) fail(`${q.code} duplicate label`);
    labels.add(c.label);
    if (f1s.has(c.fields[keys[0]])) fail(`${q.code} duplicate first value`);
    f1s.add(c.fields[keys[0]]);
    share[c.fields[keys[1]]] = (share[c.fields[keys[1]]] ?? 0) + 1;
  }
  if (Math.max(...Object.values(share)) > 3) fail(`${q.code} second field shared over 3`);
}
const allFields = data.questions.flatMap((q) => Object.keys(q.choices[0].fields));
if (new Set(allFields).size !== allFields.length) fail("fields overlap between questions");

// 고객에게 보이는 모든 문장에 영문·금지어가 없는지
const texts = [];
const walk = (v) => { if (typeof v === "string") texts.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => { if (!["id", "field", "condition", "path", "tier", "values", "questionCode", "mode", "urls", "diagnosisMap", "verdictQuestionCode"].includes(k) && !/^wp_/.test(k)) walk(x); }); };
[data.firstResult.cards, data.firstResult.risks, Object.values(data.firstResult.verdicts), data.phase2Result, data.connections.map((c) => c.sentence), data.afterResultGuide, data.directNotice, Object.values(data.labels)].forEach(walk);
for (const t of texts) {
  if (latin.test(t) && !/^https?:/.test(t)) fail(`latin in customer text: ${t.slice(0, 60)}`);
  if (banned.test(t)) fail(`banned phrase: ${t.slice(0, 60)}`);
}
for (const [value, label] of Object.entries(data.labels)) if (!label) fail(`empty label ${value}`);

// 3. 모든 질문·선택지로 흐름 점검 (무료 결과에는 판정·서비스 단계가 없어야 한다)
const answersAt = (pick) => Object.fromEntries(data.questions.map((q) => [q.id, q.choices[pick % q.choices.length].value]));
const phase1Only = (a) => Object.fromEntries(Object.entries(a).filter(([id]) => phase1.some((q) => q.id === id)));
for (let pick = 0; pick < 5; pick += 1) {
  const all = answersAt(pick);
  const p1 = phase1Only(all);
  if (!bridge.isPhase1Complete(p1)) fail(`phase1 incomplete pick ${pick}`);
  if (bridge.isPhase2QuestionSetComplete(p1)) fail("phase2 complete without answers");
  const free = bridge.buildFirstResult(p1);
  if (!free) { fail(`free result missing pick ${pick}`); continue; }
  const freeText = [free.statusHeadline, free.situationSummary, ...free.cautions, ...free.keyMetrics.map((m) => m.footnote), ...free.actions].join("\n");
  if (/가능성이 있|보완이 필요한 조건|해결할 문제|서비스 단계|추천 서비스|점수/.test(freeText)) fail(`free result shows verdict/tier pick ${pick}`);
  if (free.keyMetrics.length !== data.firstResult.cards.length) fail("free cards count");
  if (bridge.buildPersonalizedResult(p1) !== null) fail("personalized without phase2");
  const paid = bridge.buildPersonalizedResult(all);
  if (!paid) { fail(`paid result missing pick ${pick}`); continue; }
  if (paid.keyMetrics.length !== phase2.length) fail("paid cards count");
  if (!paid.actions[0].startsWith("추천 서비스 단계(참고)")) fail("paid result lacks tier line");
  if (!/답변 기준|확인이 필요/.test(paid.statusHeadline)) fail(`paid headline unexpected: ${paid.statusHeadline}`);
}

// 4. 기존 판정 엔진 보존: 새 답을 기존 입력으로 바꿔도 결과가 같아야 한다.
const base = answersAt(0); // 처음 발급·전문가 / 대졸 / 경력 2년 이상·일반 업종 / 외국인 투자 법인
const inp = pack.wpDiagnosisInput(base);
if (inp.edu !== "university" || inp.exp !== "over2" || inp.job !== "expert" || inp.priority !== "no") fail(`diagnosis input ${JSON.stringify(inp)}`);
if (pack.wpResultTone(base) !== diag.computeWpResultTone("university", "over2", "expert", "no")) fail("tone mismatch (expert)");
if (pack.wpResultTone(base) !== "possible") fail("university + 2y expert should be possible");
const q1 = data.questions.find((q) => q.code === "Q1");
const unskilled = { ...base, [q1.id]: q1.choices.find((c) => c.fields.wp_job === "job_unskilled").value };
if (pack.wpResultTone(unskilled) !== "impossible") fail("unskilled job should keep impossible tone");
const q3 = data.questions.find((q) => q.code === "Q3");
const priority = { ...base, [q3.id]: q3.choices.find((c) => c.fields.wp_experience === "exp_2_3y" && c.fields.wp_priorityField === "pri_yes").value };
if (pack.wpResultTone(priority) !== diag.computeWpResultTone("university", "over2", "expert", "yes")) fail("priority field tone mismatch");
const shortExp = { ...base, [q3.id]: q3.choices.find((c) => c.fields.wp_experience === "exp_under1").value };
if (pack.wpResultTone(shortExp) !== diag.computeWpResultTone("university", "under1", "expert", "no")) fail("short experience tone mismatch");
const manager = { ...base, [q1.id]: q1.choices.find((c) => c.fields.wp_job === "job_manager").value };
if (pack.wpResultTone(manager) !== null) fail("manager job should stay undetermined");

// 5. 직접 입력과 서비스 단계 추천
const direct = { ...phase1Only(base), [data.questions[0].id]: "other" };
const dResult = bridge.buildFirstResult(direct);
if (!dResult) fail("direct input should still produce a result");
const tierBase = pack.wpTierRecommendation(answersAt(1));
if (!["write", "accompany", "full"].includes(tierBase.tier)) fail("tier unexpected");
const q5 = data.questions.find((q) => q.code === "Q5");
const fullAnswers = { ...base, [q5.id]: q5.choices.find((c) => c.fields.wp_situation === "sit_working").value };
if (pack.wpTierRecommendation(fullAnswers).tier !== "full") fail("sit_working should recommend full service");

// 6. 저장·복원
const meta = pack.buildWpPhase2PersistMeta(base, 2);
const restored = pack.restoreWpAnswersFromVerifyMeta(meta);
if (JSON.stringify(restored) !== JSON.stringify(base)) fail("meta restore mismatch");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS wp-content-final");
