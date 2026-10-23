/**
 * Pre-signup documents 30-day retention purge — local Supabase only.
 * Run: node tests/security/pre-signup-document-purge.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const harness = path.join(repoRoot, "tests/security/pre-signup-document-purge.harness.ts");

const result = spawnSync("npx", ["tsx", harness], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status === 0 ? 0 : 1);
