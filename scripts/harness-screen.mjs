/**
 * Fraud and unclear question-screen rules. Reads content and the shared renderer.
 * Does not change product code.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFraudContentFinal } from "./parse-fraud-content-final.mjs";
import { parseUnclearContentFinal } from "./parse-unclear-content-final.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function checkPack(name, pack) {
  if (!pack.directNotice || !pack.directNotice.trim()) fail(`${name} direct notice missing`);
  const questions = [pack.entry, ...pack.questions];
  for (const question of questions) {
    if (Object.keys(question.directFields ?? {}).length !== 2) {
      fail(`${name} ${question.code ?? question.id} direct fields`);
    }
    const titles = new Set();
    for (const choice of question.choices) {
      if (Object.keys(choice.fields ?? {}).length !== 2) {
        fail(`${name} ${question.code ?? question.id} fields`);
      }
      const customer = `${choice.label ?? ""}\n${choice.description ?? ""}`;
      if (/[A-Za-z]/.test(customer)) fail(`${name} ${question.code ?? question.id} latin choice`);
      if (/[A-Za-z]{2,}_[A-Za-z0-9_]+/.test(customer)) fail(`${name} ${question.code ?? question.id} code choice`);
      if (titles.has(choice.label)) fail(`${name} ${question.code ?? question.id} duplicate title`);
      titles.add(choice.label);
    }
  }
}

checkPack("fraud", parseFraudContentFinal(read("docs/master/content/FRAUD_CONTENT_V2.md")));
checkPack("unclear", parseUnclearContentFinal(read("docs/master/content/UNCLEAR_CONTENT_V2.md")));

const report = read("src/components/cost-check/MasterReviewQuotationReport.tsx");
const fnStart = report.indexOf("function renderAdminClassifiedChoiceQuestion");
const fnEnd = report.indexOf('question.id === "re_entry"', fnStart);
const fn = fnStart >= 0 && fnEnd > fnStart ? report.slice(fnStart, fnEnd) : "";
if (!fn.includes('title={question.label}')) fail("question title is not the customer label");
if (fn.includes("question.code")) fail("question code is rendered");
if (!fn.includes('String(index + 1).padStart(2, "0")')) fail("numbered cards missing");
if (fn.includes('type="radio"') || fn.includes("role=\"radio\"")) fail("radio in numbered card renderer");

const gateStart = report.indexOf('question.id === "fraud_entry"');
const gateEnd = report.indexOf("question.kind === \"choice\" && question.id === ADMIN_CASE_ENTRY_Q1_KEY", gateStart);
const gate = gateStart >= 0 && gateEnd > gateStart ? report.slice(gateStart, gateEnd) : "";
if (!gate.includes('question.id.startsWith("fraud_")')) fail("fraud card gate missing");
if (!gate.includes('question.id.startsWith("unclear_")')) fail("unclear card gate missing");
if (!gate.includes("선택지에 없는 내용이 있다면")) fail("entry direct notice missing");
if (!gate.includes("선택지로 설명하기 어려운 상황이라면 직접 알려주세요.")) fail("question direct notice missing");

for (const rel of [
  "src/lib/contentPacks/fraud/fraudPack.ts",
  "src/lib/contentPacks/unclear/unclearPack.ts",
]) {
  const source = read(rel);
  if (!source.includes("ADMIN_DIRECT_EXPLAIN_CHOICE")) fail(`${rel} direct choice missing`);
}

if (failures.length) {
  process.stderr.write(failures.join("\n") + "\n");
  process.exit(1);
}
process.stdout.write("PASS harness-screen\n");
