/**
 * Re-invoke the current script under tsx so harnesses can import src .ts modules
 * (Next/tsconfig path aliases + extensionless TS imports).
 *
 * Usage: call before any static import from src TypeScript modules.
 *   import { ensureTsxRuntime } from "./_ensure-tsx-runtime.mjs";
 *   ensureTsxRuntime(import.meta.url);
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const RUNTIME_MARK = "VFBCAI_QA_TSX_RUNTIME";

/**
 * @param {string} entryMetaUrl import.meta.url of the harness entry file
 * @returns {void}
 */
export function ensureTsxRuntime(entryMetaUrl) {
  if (process.env[RUNTIME_MARK] === "1") {
    return;
  }

  const entry = fileURLToPath(entryMetaUrl);
  const args = ["tsx", entry, ...process.argv.slice(2)];
  const result = spawnSync("npx", args, {
    stdio: "inherit",
    env: { ...process.env, [RUNTIME_MARK]: "1" },
    cwd: process.cwd(),
    shell: true,
  });

  if (result.error) {
    console.error(
      `[ensureTsxRuntime] failed to spawn npx tsx: ${result.error.message ?? result.error}`,
    );
    process.exit(1);
  }

  const code = result.status ?? (result.signal ? 1 : 0);
  process.exit(code);
}
