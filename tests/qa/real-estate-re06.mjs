import { getQ1Options } from "../../src/lib/contentPacks/runner.ts";
import { routeRe06DirectInput } from "../../src/lib/contentPacks/realEstate/re06.ts";
import { getNode } from "../../src/lib/contentPacks/runner.ts";

const samples = [
  { text: "보증금을 돌려받지 못했습니다", expect: "RE02" },
  { text: "계약 전 서명 전 집을 빌리려 합니다", expect: "RE01" },
  { text: "해지 통보를 받았습니다", expect: "RE03" },
  { text: "수리를 거부합니다", expect: "RE04" },
  { text: "핑크북 명의 이전이 안 됩니다", expect: "RE05" },
  { text: "소송이 필요합니다", expect: null, expert: true },
];

let ok = 0;
for (const s of samples) {
  const r = routeRe06DirectInput(s.text);
  const pass =
    r.caseId === s.expect && Boolean(r.expertHandoff) === Boolean(s.expert);
  if (pass) ok++;
  console.log(s.text.slice(0, 24), "→", r.caseId, r.expertHandoff, pass ? "OK" : "FAIL");
}

const q1 = getQ1Options();
const directQ1 = q1.find((o) => o.value === "other");
console.log("Q1 direct option", directQ1 ? "present" : "MISSING");

let caseDirect = 0;
for (const caseId of ["RE01", "RE02", "RE03", "RE04", "RE05"]) {
  const nodes = ["re01_contract_type", "re02_role", "re03_my_role", "re04_issue_type", "re05_stage"];
  const id = nodes[["RE01", "RE02", "RE03", "RE04", "RE05"].indexOf(caseId)];
  const node = getNode(caseId, id);
  const hasDirect = node?.options?.some((o) => o.value === "other");
  if (hasDirect) caseDirect++;
}
console.log("CASE phase1 direct-input nodes", caseDirect, "/ 5");
console.log("re06 samples", ok, "/", samples.length);
if (ok !== samples.length) process.exit(1);
