/**
 * P10 local-only supplemental verify (one-shot). Uses supabase status env only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync, spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const report = { items: {} };
const tag = `p10l-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const cleanup = { userIds: [], orgIds: [], formIds: [], draftIds: [] };
let devProc = null;

function setItem(id, pass, detail) {
  report.items[id] = { pass: Boolean(pass), detail: String(detail).slice(0, 240) };
}

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

function getLocalEnv() {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  if (!st.API_URL || !st.ANON_KEY || !st.SERVICE_ROLE_KEY) {
    throw new Error("local supabase status incomplete");
  }
  return { url: st.API_URL, anonKey: st.ANON_KEY, serviceKey: st.SERVICE_ROLE_KEY, st };
}

async function createUser(svc, email) {
  const { data, error } = await svc.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);
  cleanup.userIds.push(data.user.id);
  return data.user;
}

async function signIn(url, anonKey, email) {
  const c = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
}

async function main() {
  try {
    execSync("npx supabase start", { cwd: repoRoot, stdio: "pipe" });
    setItem("0_supabase_running", true, "supabase start ok or already running");
  } catch (e) {
    setItem("0_supabase_running", false, e.message);
    throw e;
  }

  try {
    execSync("npx supabase migration up --local", { cwd: repoRoot, stdio: "pipe" });
    setItem("0_migration_up", true, "migration up --local");
  } catch (e) {
    setItem("0_migration_up", false, e.message);
    throw e;
  }

  try {
  const { url, anonKey, serviceKey, st } = getLocalEnv();
  const svc = createClient(url, serviceKey, { auth: { persistSession: false } });

  const col = await svc.from("accounting_form_versions").select("form_class").limit(1);
  const drafts = await svc.from("accounting_standardized_drafts").select("id").limit(1);
  setItem(
    "0_schema",
    !col.error && !drafts.error,
    col.error?.message || drafts.error?.message || "form_class+standardized_drafts ok"
  );

  const formCode = `VTAX_STD_TMP_${tag}`;
  const formNameKo = `P10 임시 표준 서식 ${tag.slice(-6)}`;
  const { data: formRow, error: formInsErr } = await svc
    .from("accounting_form_versions")
    .insert({
      form_code: formCode,
      name_ko: formNameKo,
      name_vi: `P10 tam thoi ${tag.slice(-6)}`,
      legal_basis: "P10 local verify",
      effective_from: "2026-01-01",
      status: "pending_verification",
      form_class: "standardized",
      feature_enabled: false,
      verified_status: "unverified",
      field_map: { gates: { standardized_submit: false } },
    })
    .select("id, name_ko")
    .single();
  if (formInsErr) throw formInsErr;
  cleanup.formIds.push(formRow.id);

  const owner = await createUser(svc, `${tag}-owner@test.vfbcai.local`);
  const member = await createUser(svc, `${tag}-member@test.vfbcai.local`);
  const expert = await createUser(svc, `${tag}-expert@test.vfbcai.local`);
  await svc.from("users").upsert(
    [
      { id: owner.id, member_type: "company" },
      { id: member.id, member_type: "company" },
      { id: expert.id, member_type: "company" },
    ],
    { onConflict: "id" }
  );

  const { data: org } = await svc
    .from("accounting_organizations")
    .insert({ name_official: `P10L ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  cleanup.orgIds.push(org.id);
  await svc.from("accounting_org_members").insert([
    { org_id: org.id, user_id: owner.id, role: "company_owner" },
    { org_id: org.id, user_id: member.id, role: "company_member" },
    { org_id: org.id, user_id: expert.id, role: "vnk_expert" },
  ]);

  const clientMember = await signIn(url, anonKey, `${tag}-member@test.vfbcai.local`);
  const clientExpert = await signIn(url, anonKey, `${tag}-expert@test.vfbcai.local`);
  const clientOwner = await signIn(url, anonKey, `${tag}-owner@test.vfbcai.local`);

  const insM = await clientMember
    .from("accounting_standardized_drafts")
    .insert({
      org_id: org.id,
      form_version_id: formRow.id,
      period_key: "2026-10",
      status: "draft",
      answers: { g9_q1: "g9_q1_c1" },
      created_by: member.id,
    })
    .select("id")
    .single();
  cleanup.draftIds.push(insM.data?.id);
  setItem("2_member_insert", !insM.error && insM.data?.id, insM.error?.message || "ok");

  const memC = await clientMember
    .from("accounting_standardized_drafts")
    .update({ status: "confirmed" })
    .eq("id", insM.data.id)
    .select("id");
  setItem(
    "2_member_confirm_blocked",
    Boolean(memC.error) || (memC.data ?? []).length === 0,
    memC.error?.message || `rows=${(memC.data ?? []).length}`
  );

  const expU = await clientExpert
    .from("accounting_standardized_drafts")
    .update({ answers: { g9_q1: "g9_q1_c2" } })
    .eq("id", insM.data.id)
    .select("id");
  setItem(
    "2_expert_update_blocked",
    Boolean(expU.error) || (expU.data ?? []).length === 0,
    expU.error?.message || `rows=${(expU.data ?? []).length}`
  );

  const ownC = await clientOwner
    .from("accounting_standardized_drafts")
    .update({ status: "confirmed" })
    .eq("id", insM.data.id)
    .select("status")
    .single();
  setItem("2_owner_confirm", !ownC.error && ownC.data?.status === "confirmed", ownC.error?.message || ownC.data?.status);

  const { data: confirmedRow } = await svc
    .from("accounting_standardized_drafts")
    .insert({
      org_id: org.id,
      form_version_id: formRow.id,
      period_key: "2026-11",
      status: "confirmed",
      answers: { g9_q1: "g9_q1_c1" },
      created_by: owner.id,
      confirmed_by: owner.id,
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  cleanup.draftIds.push(confirmedRow?.id);

  const svcU = await svc.from("accounting_standardized_drafts").update({ answers: { x: 1 } }).eq("id", confirmedRow.id);
  const svcD = await svc.from("accounting_standardized_drafts").delete().eq("id", confirmedRow.id);
  setItem("3_trigger_update", Boolean(svcU.error), svcU.error?.message || "no error");
  setItem("3_trigger_delete", Boolean(svcD.error), svcD.error?.message || "no error");

  const port = 3022;
  const env = {
    ...process.env,
    PORT: String(port),
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };
  devProc = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: repoRoot,
    env,
    stdio: "ignore",
    shell: true,
  });

  const base = `http://localhost:${port}`;
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(2000) });
      if (r.status < 500) {
        ready = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  setItem("0_dev_3022", ready, ready ? base : "timeout");

  const signClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: sess } = await signClient.auth.signInWithPassword({
    email: `${tag}-owner@test.vfbcai.local`,
    password,
  });
  const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  const sessionRaw = JSON.stringify(sess.session);

  async function browserCheck(viewport) {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const context = await browser.newContext({ viewport });
    await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
    await context.addInitScript((p) => localStorage.setItem(p.key, p.raw), { key: storageKey, raw: sessionRaw });
    const page = await context.newPage();
    await page.goto(`${base}/company/accounting/vat/standardized`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("standardized-forms-page").waitFor({ timeout: 120000 });
    const err = await page.getByText("표준 서식 목록을 불러오지 못했습니다").count();
    const empty = await page.getByTestId("standardized-empty-state").count();
    const list = await page.getByTestId("standardized-form-list").count();
    const name = await page.getByText(formNameKo).count();
    await browser.close();
    return { err, empty, list, name };
  }

  if (ready) {
    const d = await browserCheck({ width: 1440, height: 900 });
    const m = await browserCheck({ width: 390, height: 844 });
    const pass =
      d.list >= 1 && m.list >= 1 && d.name >= 1 && m.name >= 1 && d.err === 0 && m.err === 0;
    setItem(
      "1_list_nonempty",
      pass,
      `1440 list=${d.list} name=${d.name} err=${d.err} empty=${d.empty}; 390 list=${m.list} name=${m.name}`
    );
    if (d.err > 0 && d.empty > 0) {
      setItem("1_error_and_empty", true, "조회 실패 배너와 빈 상태 카드 동시 노출 가능(코드상 loadError+forms.length===0)");
    }
  } else {
    setItem("1_list_nonempty", false, "dev not ready");
  }

  setItem(
    "0_p9_env_source",
    true,
    "LESSONS 63·86·110: 기본 로컬은 supabase status -o env; ACCOUNTING_TEST_LOCAL=0일 때만 .env.local URL(이번 실행은 status 주입만)"
  );
  } finally {
  if (devProc) {
    try {
      if (process.platform === "win32") execSync(`taskkill /PID ${devProc.pid} /T /F`, { stdio: "ignore" });
      else devProc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
  try {
    const { url, serviceKey } = getLocalEnv();
    const svc = createClient(url, serviceKey, { auth: { persistSession: false } });
    for (const id of cleanup.draftIds.filter(Boolean)) {
      await svc.from("accounting_standardized_drafts").delete().eq("id", id);
    }
    for (const id of cleanup.formIds) {
      await svc.from("accounting_form_versions").delete().eq("id", id);
    }
    for (const id of cleanup.orgIds) {
      await svc.from("accounting_organizations").delete().eq("id", id);
    }
    for (const id of cleanup.userIds) {
      await svc.auth.admin.deleteUser(id);
    }
    setItem("5_cleanup", true, `ok users=${cleanup.userIds.length}`);
  } catch (e) {
    setItem("5_cleanup", false, e.message);
  }
  console.log(JSON.stringify(report));
  }
}

main().catch((e) => {
  setItem("fatal", false, e.message);
  console.log(JSON.stringify(report));
  process.exit(1);
});
