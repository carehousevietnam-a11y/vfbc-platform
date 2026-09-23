import fs from "fs";
const p =
  "C:/Users/ace kang/.cursor/projects/c-vfbcai-platform/agent-transcripts/8b7fbb40-8fb3-4590-bea1-2ac2d1020625/8b7fbb40-8fb3-4590-bea1-2ac2d1020625.jsonl";
for (const line of fs.readFileSync(p, "utf8").split("\n")) {
  if (!line.includes("QUESTION DESIGN v1")) continue;
  const obj = JSON.parse(line);
  const text = obj.message?.content?.find((c) => c.type === "text")?.text ?? "";
  const idx = text.indexOf("## CASE_05");
  if (idx >= 0) console.log(text.slice(idx, idx + 12000));
}
