/**
 * Verify dev-local-login seed accounts can sign in (local Supabase only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "src/lib/accounting/dev-local-login.config.json"), "utf8")
);

function parseEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

execSync("node tests/accounting/dev-local-login-seed.mjs", { cwd: repoRoot, encoding: "utf8", stdio: "inherit" });

const st = parseEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail) {
  results.cases.push({ name, ok: Boolean(ok), detail: detail ?? "" });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

for (const [key, email] of Object.entries(config.accounts)) {
  const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: config.password });
  record(`sign_in_${key}`, !error && Boolean(data.session?.access_token), error?.message ?? "");
}

console.log(JSON.stringify(results, null, 2));
if (results.fail > 0) process.exit(2);
