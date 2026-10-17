/**
 * P9-6b wizard save — revision concurrent detection (invoked from isolation.mjs).
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8" })
);

const payload = JSON.parse(process.env.P96B_WIZARD_PAYLOAD ?? "{}");
const { orgId, password, periodKey } = payload;

const anon = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false } });
const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
  email: payload.email,
  password,
});
if (signErr || !signIn.session) {
  console.log(JSON.stringify({ ok: false, error: "sign_in", detail: signErr?.message ?? "" }));
  process.exit(0);
}

const { data: decl } = await service
  .from("accounting_declarations")
  .insert({
    org_id: orgId,
    form_code: "01/GTGT",
    period_key: periodKey,
    status: "drafting",
    computed: {
      _wizard: {
        revision: 1,
        step: 1,
        filingKind: "regular",
        periodKey,
        steps: {},
      },
    },
  })
  .select("id")
  .single();

const { saveVatWizard } = await import("../../src/lib/accounting/vatWizardEntry.ts");

const conflict = await saveVatWizard(anon, signIn.session.access_token, {
  declarationId: decl.id,
  step: 2,
  filingKind: "regular",
  periodKey,
  stepMemo: "stale",
  stepMemoLang: "ko",
  expectedRevision: 0,
});

await service.from("accounting_i18n_texts").delete().eq("entity_id", decl.id);
await service.from("accounting_declarations").delete().eq("id", decl.id);

console.log(
  JSON.stringify({
    ok: !conflict.ok && conflict.error === "CONCURRENT_SAVE",
    detail: conflict.ok ? "unexpected_ok" : conflict.error,
  })
);
