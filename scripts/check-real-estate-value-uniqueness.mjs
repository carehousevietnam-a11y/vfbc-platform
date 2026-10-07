import fs from "fs";
import path from "path";

const packPath = path.resolve("src/lib/contentPacks/realEstate/generated/pack.ts");
const src = fs.readFileSync(packPath, "utf8");
const owners = new Map();
const dups = [];
const re = /"value":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(src))) {
  const v = m[1];
  if (owners.has(v)) dups.push({ value: v, first: owners.get(v), again: m.index });
  else owners.set(v, m.index);
}
if (dups.length) {
  console.error("Duplicate option values:", dups.slice(0, 20));
  process.exit(1);
}
console.log("OK unique values", owners.size);
