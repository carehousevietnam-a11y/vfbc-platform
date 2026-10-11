/**
 * Block a commit when a shared file loses a line.
 *   node scripts/harness-shared-diff.mjs --cached
 *   node scripts/harness-shared-diff.mjs --head
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function repoRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
}

function sharedFiles(root) {
  const text = fs.readFileSync(path.join(root, "tests/baseline/shared-files.txt"), "utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

export function sharedDeletionFiles(mode) {
  const root = repoRoot();
  const files = sharedFiles(root);
  const args = ["diff", "--unified=0", "--no-color"];
  if (mode === "cached") args.push("--cached");
  else args.push("HEAD");
  args.push("--", ...files);
  let diff = "";
  try {
    diff = execFileSync("git", args, { cwd: root, encoding: "utf8" });
  } catch (error) {
    const status = error.status ?? 1;
    if (status > 1) throw error;
    diff = error.stdout?.toString() ?? "";
  }
  let file = "";
  const blocked = new Set();
  for (const line of diff.split(/\n/)) {
    if (line.startsWith("diff --git ")) {
      const match = line.match(/ b\/(.+)$/);
      file = match ? match[1].trim() : "";
      continue;
    }
    if (
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("@@") ||
      line.startsWith("index ") ||
      line.startsWith("\\")
    ) {
      continue;
    }
    if (line.startsWith("-")) blocked.add(file || "(shared)");
  }
  return [...blocked];
}

if (path.resolve(process.argv[1] ?? "").toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  const mode = process.argv.includes("--cached") ? "cached" : "head";
  const blocked = sharedDeletionFiles(mode);
  if (blocked.length) {
    for (const file of blocked) process.stderr.write(`BLOCK shared deletion: ${file}\n`);
    process.exit(1);
  }
  process.exit(0);
}
