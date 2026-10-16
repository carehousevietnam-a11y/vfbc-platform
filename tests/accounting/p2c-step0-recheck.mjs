/**
 * P2c isolation recheck (step 0) — no product code changes.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repoRoot, "tests/qa/_output/p2c-evidence-filter");
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

const st = parseSupabaseStatusEnv(
  execSync("npx supabase status -o env", { cwd: repoRoot, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
);

async function storageCall(method, token, objectPath, body) {
  const encoded = objectPath.split("/").map(encodeURIComponent).join("/");
  const target =
    method === "SIGN"
      ? `${st.API_URL}/storage/v1/object/sign/accounting_evidence/${encoded}`
      : method === "UPLOAD"
        ? `${st.API_URL}/storage/v1/object/accounting_evidence/${encoded}`
        : method === "DELETE"
          ? `${st.API_URL}/storage/v1/object/accounting_evidence/${encoded}`
          : `${st.API_URL}/storage/v1/object/accounting_evidence/${encoded}`;
  const res = await fetch(target, {
    method: method === "DOWNLOAD" ? "GET" : method === "UPLOAD" ? "POST" : method === "DELETE" ? "DELETE" : "POST",
    headers: {
      apikey: st.ANON_KEY,
      Authorization: `Bearer ${token}`,
      ...(method === "UPLOAD" ? { "Content-Type": "image/png", "x-upsert": "true" } : { "Content-Type": "application/json" }),
    },
    body:
      method === "DOWNLOAD" || method === "DELETE"
        ? undefined
        : method === "UPLOAD"
          ? tinyPng
          : JSON.stringify(body),
  });
  return res.status;
}

async function main() {
  const report = JSON.parse(fs.readFileSync(path.join(outDir, "seed-report.json"), "utf8"));
  const sessionA = JSON.parse(fs.readFileSync(path.join(outDir, "session-a.json"), "utf8"));
  const sessionB = JSON.parse(fs.readFileSync(path.join(outDir, "session-b.json"), "utf8"));
  let memberToken = null;
  if (fs.existsSync(path.join(outDir, "session-member-a.json"))) {
    memberToken = JSON.parse(fs.readFileSync(path.join(outDir, "session-member-a.json"), "utf8")).access_token;
  } else {
    const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const email = `p2c-step0-member-${Date.now()}@test.vfbcai.local`;
    const password = `Test-step0-${Date.now()}-Aa1!`;
    const { data: userData } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (userData?.user) {
      await service.from("users").upsert({ id: userData.user.id, member_type: "company" }, { onConflict: "id" });
      await service.from("accounting_org_members").insert({
        org_id: report.orgA,
        user_id: userData.user.id,
        role: "company_member",
      });
      const bootstrap = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data: sess } = await bootstrap.auth.signInWithPassword({ email, password });
      memberToken = sess?.session?.access_token ?? null;
    }
  }

  const folder = `${report.orgA}/${report.ids.aLinkedSale}`;
  const objectPath = `${folder}/p2c-step0-probe.png`;

  const rows = [];
  const a_uploadB = await storageCall("UPLOAD", sessionB.access_token, objectPath, null);
  rows.push({ case: "a) B upload to A folder", pass: a_uploadB === 400 || a_uploadB === 403 || a_uploadB === 404, detail: `status=${a_uploadB}` });

  const b_delete = await storageCall("DELETE", sessionB.access_token, objectPath, null);
  const b_overwrite = await storageCall("UPLOAD", sessionB.access_token, objectPath, null);
  rows.push({
    case: "b) B delete/overwrite A object",
    pass:
      (b_delete === 400 || b_delete === 403 || b_delete === 404) &&
      (b_overwrite === 400 || b_overwrite === 403 || b_overwrite === 404),
    detail: `delete=${b_delete} overwrite=${b_overwrite}`,
  });

  const existingObject = `${folder}/proof.png`;
  const anonDl = await storageCall("DOWNLOAD", st.ANON_KEY, existingObject, null);
  const memberSign = memberToken
    ? await storageCall("SIGN", memberToken, existingObject, { expiresIn: 60 })
    : null;
  const memberDl = memberToken ? await storageCall("DOWNLOAD", memberToken, existingObject, null) : null;
  rows.push({
    case: "c) anon download A object",
    pass: anonDl === 400 || anonDl === 401 || anonDl === 403,
    detail: `status=${anonDl}`,
  });
  rows.push({
    case: "c) member A sign/download (same org)",
    pass: Boolean(memberToken) && memberSign === 200 && memberDl === 200,
    detail: memberToken ? `sign=${memberSign} download=${memberDl}` : "member bootstrap failed",
  });

  const { listTransactions } = await import("../../src/lib/accounting/transactionEntry.ts");
  const clientA = createClient(st.API_URL, st.ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const linked = await listTransactions(clientA, sessionA.access_token, { evidence: "linked" });
  const missing = await listTransactions(clientA, sessionA.access_token, { evidence: "missing" });
  rows.push({
    case: "d) evidence filter total vs count (linked)",
    pass: linked.ok && linked.total === linked.items.length,
    detail: linked.ok ? `total=${linked.total} count=${linked.items.length}` : linked.error,
  });
  rows.push({
    case: "d) evidence filter total vs count (missing)",
    pass: missing.ok && missing.total === missing.items.length,
    detail: missing.ok ? `total=${missing.total} count=${missing.items.length}` : missing.error,
  });

  console.log(JSON.stringify({ rows, allPass: rows.every((r) => r.pass) }, null, 2));
  if (!rows.every((r) => r.pass)) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
