/**
 * Run harness checks in order.
 * Stdout is one summary line. Detail goes to tests/qa/_output/verify-last.log.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { policyViolations } from "./harness-policy.mjs";
import {
  duplicateParagraphHits,
  internalTermHits,
  questionCountHardcodeHits,
  questionRangeHits,
  questionStandardHits,
  taxQuestionStandardHits,
} from "./harness-recurrence.mjs";
import { sharedDeletionFiles } from "./harness-shared-diff.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "tests/qa/_output/verify-last.log");
fs.mkdirSync(path.dirname(logPath), { recursive: true });
const log = fs.createWriteStream(logPath, { flags: "w" });

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    log.write(`\n$ ${command} ${args.join(" ")}\n`);
    let child;
    try {
      child = spawn(command, args, {
        cwd: root,
        windowsHide: true,
        shell: options.shell ?? false,
      });
    } catch (error) {
      log.write(`${error.message}\n`);
      resolve(1);
      return;
    }
    child.stdout.on("data", (chunk) => log.write(chunk));
    child.stderr.on("data", (chunk) => log.write(chunk));
    child.on("error", (error) => {
      log.write(`${error.message}\n`);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

const node = process.execPath;
const blocking = [
  ["tsc", node, [path.join(root, "node_modules/typescript/bin/tsc"), "--noEmit"]],
  ["standards-lock", node, [path.join(root, "scripts/harness-standards.mjs")]],
  ["tax-content-final", node, [path.join(root, "tests/qa/tax-content-final.mjs")]],
  ["fraud-content-final", node, [path.join(root, "tests/qa/fraud-content-final.mjs")]],
  ["unclear-content-final", node, [path.join(root, "tests/qa/unclear-content-final.mjs")]],
  ["trc-content-final", node, [path.join(root, "tests/qa/trc-content-final.mjs")]],
  ["wp-content-final", node, [path.join(root, "tests/qa/wp-content-final.mjs")]],
  ["tamtru-content-final", node, [path.join(root, "tests/qa/tamtru-content-final.mjs")]],
  ["license-content-final", node, [path.join(root, "tests/qa/license-content-final.mjs")]],
  ["fraud-unclear-screen", node, [path.join(root, "scripts/harness-screen.mjs")]],
  ["report-layout", node, [path.join(root, "scripts/harness-report-layout.mjs")]],
  ["pdf-baseline", node, [path.join(root, "scripts/harness-pdf-baseline.mjs")]],
];

let pass = 0;
let fail = 0;
let known = 0;

for (const [name, command, args] of blocking) {
  const code = await run(command, args);
  log.write(`${name} ${code}\n`);
  if (code === 0) pass += 1;
  else fail += 1;
}

try {
  const blocked = sharedDeletionFiles("head");
  if (blocked.length) {
    log.write(`shared-diff BLOCK ${blocked.join(",")}\n`);
    fail += 1;
  } else {
    log.write("shared-diff 0\n");
    pass += 1;
  }
} catch (error) {
  log.write(`shared-diff ${error.message}\n`);
  fail += 1;
}

const policy = policyViolations(root);
if (policy.length) {
  log.write(`policy ${policy.join(" | ")}\n`);
  fail += 1;
} else {
  log.write("policy 0\n");
  pass += 1;
}

const recurrence = [
  ["internal-terms", internalTermHits],
  ["pdf-duplicate", duplicateParagraphHits],
  ["question-count-hardcode", questionCountHardcodeHits],
  ["question-range", questionRangeHits],
  ["question-standard", questionStandardHits],
];
for (const [name, check] of recurrence) {
  try {
    const hits = check();
    if (hits.length) {
      log.write(`${name} ${hits.join(" | ")}\n`);
      fail += 1;
    } else {
      log.write(`${name} 0\n`);
      pass += 1;
    }
  } catch (error) {
    log.write(`${name} ${error.message}\n`);
    fail += 1;
  }
}

try {
  const taxHits = taxQuestionStandardHits();
  if (taxHits.length) {
    log.write(`tax-question-standard ${taxHits.length} ${taxHits[0]}\n`);
    known += 1;
  } else {
    log.write("tax-question-standard 0\n");
    pass += 1;
  }
} catch (error) {
  log.write(`tax-question-standard ${error.message}\n`);
  known += 1;
}

const knownChecks = [
  ["lint", "npm", ["run", "lint"], { shell: true }],
  ["g4-golden", node, [path.join(root, "scripts/harness-known-g4.mjs")], {}],
];
for (const [name, command, args, options] of knownChecks) {
  const code = await run(command, args, options);
  log.write(`${name} ${code}\n`);
  if (code === 0) pass += 1;
  else known += 1;
}

log.end();
process.stdout.write(`통과 ${pass} / 실패 ${fail} / 알려진 기존 실패 ${known}\n`);
process.exit(fail > 0 ? 1 : 0);
