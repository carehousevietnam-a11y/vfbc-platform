import fs from "fs";

const text = fs.readFileSync("src/lib/adminVerifyProfiling.ts", "utf8");
const prefixes = ["CASE03", "CASE04", "CASE05", "CASE06"];

for (const pre of prefixes) {
  const re = new RegExp(`const (${pre}_[A-Z0-9_]+_OPTIONS) = \\[([\\s\\S]*?)\\n\\];`, "g");
  const rows = [];
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const body = m[2];
    const values = [...body.matchAll(/value:\s*([^,\n]+)/g)].map((x) => x[1].trim());
    const hasDi = body.includes("ADMIN_DIRECT_EXPLAIN_CHOICE");
    rows.push({ name, countNoDi: values.length - (hasDi ? 1 : 0), values: values.length });
  }
  console.log(pre, JSON.stringify(rows, null, 2));
}

// field id -> array name
for (const pre of prefixes) {
  const mapRe = new RegExp(`const ${pre}_FIELD_OPTION_MAP[\\s\\S]*?\\};`, "m");
  const block = text.match(mapRe)?.[0] ?? "";
  const pairs = [...block.matchAll(/(case0[3-6]_[a-zA-Z0-9_]+|profile[A-Za-z]+):\s*(CASE0[3-6]_[A-Z0-9_]+)/g)];
  console.log(
    `\n${pre}_FIELD_MAP`,
    pairs.map((p) => `${p[1]} -> ${p[2]}`).join("\n"),
  );
}
