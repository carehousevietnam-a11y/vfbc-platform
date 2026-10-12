// 12개 서비스의 근거·출처 성격(등급)이 확정·보도 기준·참고 중 하나인지, 안내문에 주의 문구가 있는지 검사한다. (STANDARDS A17)
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SERVICES = ["company", "cosmetics", "environment", "fire", "franchise", "hygiene", "license", "medical", "restaurant", "tamtru", "trc", "wp"];
const GRADES = new Set(["확정", "보도 기준", "참고"]);
const problems = [];
for (const s of SERVICES) {
  const spec = await import(pathToFileURL(path.join(root, "scripts", `${s}-content-spec.mjs`)).href);
  const guide = spec.reportGuide;
  const rows = guide?.sources?.rows ?? [];
  if (rows.length === 0) problems.push(`${s}: 출처 행이 없음`);
  for (const r of rows) {
    if (!GRADES.has(r.kind)) problems.push(`${s} 출처 ${r.id}: 성격이 확정·보도 기준·참고가 아님 (${r.kind})`);
    if (/~/.test(`${r.name}${r.note}`)) problems.push(`${s} 출처 ${r.id}: 물결표 사용`);
  }
  if (!String(guide?.disclaimer ?? "").includes("성격이 보도 기준 또는 참고인 자료")) problems.push(`${s}: 안내문에 등급 주의 문구가 없음`);
}
if (problems.length) {
  console.error("FAIL source-grade");
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
console.log("PASS source-grade");
