/**
 * Next dev bound to local Supabase only. Does not edit .env.local.
 * Usage: node tests/accounting/p3c-local-next.mjs
 */
import { spawn, spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const port = process.env.P3C_PORT || "3020";

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

const status = spawnSync("npx", ["supabase", "status", "-o", "env"], {
  cwd: repoRoot,
  encoding: "utf8",
  shell: true,
});
if (status.status !== 0) {
  console.error("local supabase status failed");
  process.exit(1);
}
const st = parseSupabaseStatusEnv(status.stdout || "");
const host = new URL(st.API_URL).hostname;
if (host !== "127.0.0.1" && host !== "localhost") {
  console.error("refusing non-local supabase");
  process.exit(1);
}

const child = spawn("npx", ["next", "dev", "--webpack", "-p", port], {
  cwd: repoRoot,
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: st.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: st.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: st.SERVICE_ROLE_KEY,
  },
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
