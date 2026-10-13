/**
 * FIRE(소방 허가) 콘텐츠 팩 점검.
 * Run: node tests/qa/fire-content-final.mjs
 */
import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

ensureTsxRuntime(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const fail = (message) => failures.push(message);

// 1. 원본(spec)에서 만든 파일과 같은가
const check = spawnSync(process.execPath, [path.join(repoRoot, "scripts/build-fire-content-final.mjs"), "--check"], { encoding: "utf8" });
if (check.status !== 0) fail(`fire content files out of date: ${check.stderr.trim()}`);

const pack = await import("../../src/lib/contentPacks/fire/firePack.ts");
const diag = await import("../../src/lib/checkDiagnosis.ts");
const { FIRE_CONTENT_FINAL: data } = pack;
const bridge = pack.createFireVerifyMasterPackBridge();

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
const walk = (v) => { if (typeof v === "string") texts.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => { if (!["id", "field", "condition", "path", "tier", "values", "questionCode", "mode", "urls", "diagnosisMap", "verdictQuestionCode"].includes(k) && !/^fire_/.test(k)) walk(x); }); };
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

// 4. 기존 판정 보존: 화면 파일의 판정 줄이 그대로인지, 팩의 규칙이 같은 결과를 내는지 확인한다.
const spec = await import("../../scripts/fire-content-spec.mjs");
const pageSource = fs.readFileSync(path.join(repoRoot, spec.pageRule.file), "utf8");
if (!pageSource.includes(spec.pageRule.line)) fail("page diagnosis rule changed; re-check the register rule mirror");
const base = answersAt(0);
const qReg = data.questions.find((q) => Object.keys(q.choices[0].fields).includes(data.diagnosisFields.registration));
const qKey = data.questions.find((q) => Object.keys(q.choices[0].fields).includes(data.diagnosisFields.key));
const withReg = (a, v) => ({ ...a, [qReg.id]: qReg.choices.find((c) => c.fields[data.diagnosisFields.registration] === v).value });
const withKey = (a, v) => ({ ...a, [qKey.id]: qKey.choices.find((c) => c.fields[data.diagnosisFields.key] === v).value });
for (const [regValue, reg] of Object.entries(data.diagnosisMap.registration)) {
  for (const [keyValue, key] of Object.entries(data.diagnosisMap.key)) {
    const expected = !reg || !key ? null : reg === "confirmed" && key === "secured" ? "possible" : "conditional";
    const got = pack.fireResultTone(withKey(withReg(base, regValue), keyValue));
    if (got !== expected) fail(`tone ${regValue} ${keyValue} expected ${expected} got ${got}`);
  }
}

// 5. 직접 입력과 서비스 단계 추천
const direct = { ...phase1Only(base), [data.questions[0].id]: "other" };
const dResult = bridge.buildFirstResult(direct);
if (!dResult) fail("direct input should still produce a result");
const tierBase = pack.fireTierRecommendation(answersAt(1));
if (!["write", "accompany", "full"].includes(tierBase.tier)) fail("tier unexpected");
const q9 = data.questions.find((q) => q.code === "Q9");
const fullAnswers = { ...base, [q9.id]: q9.choices.find((c) => c.fields.fs_timeline === "tl_already").value };
if (pack.fireTierRecommendation(fullAnswers).tier !== "full") fail("already operating should recommend full service");

// 6. 저장·복원
const meta = pack.buildFirePhase2PersistMeta(base, 2);
const restored = pack.restoreFireAnswersFromVerifyMeta(meta);
if (JSON.stringify(restored) !== JSON.stringify(base)) fail("meta restore mismatch");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS fire-content-final");
