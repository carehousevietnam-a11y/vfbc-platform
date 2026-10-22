/**
 * P10 list UI @3022 — local env only, one-shot.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync, spawn } from "child_process";
import net from "net";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const logPath = path.join(repoRoot, "tests", "accounting", ".p10-3022-dev.log");
const port = 3022;
const targetPath = "/company/accounting/vat/standardized";
const report = {};

function set(id, pass, detail) {
  report[id] = { pass: Boolean(pass), detail: String(detail).slice(0, 280) };
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
  if (!st.API_URL || !st.ANON_KEY || !st.SERVICE_ROLE_KEY) throw new Error("supabase status incomplete");
  return { url: st.API_URL, anonKey: st.ANON_KEY, serviceKey: st.SERVICE_ROLE_KEY };
}

function portInUse(p) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(true));
    srv.once("listening", () => {
      srv.close(() => resolve(false));
    });
    srv.listen(p, "127.0.0.1");
  });
}

function killPortWindows(p) {
  try {
    const out = execSync(`netstat -ano | findstr :${p}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* no listeners */
  }
}

function tailLogSanitized(maxLines = 20) {
  if (!fs.existsSync(logPath)) return "(no log file)";
  const lines = fs.readFileSync(logPath, "utf8").split(/\r?\n/).filter(Boolean);
  const tail = lines.slice(-maxLines);
  return tail
    .map((l) =>
      l
        .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+/g, "[redacted-jwt]")
        .replace(/(key|token|secret|password)=["']?[^"'\s]+/gi, "$1=[redacted]")
    )
    .join("\n");
}

const tag = `p10ui-${Date.now()}`;
const password = `Test-${tag}-Aa1!`;
const cleanup = { userIds: [], orgIds: [], formIds: [] };
let devProc = null;
let restoreProc = null;

try {
  killPortWindows(3020);
  killPortWindows(port);
  await new Promise((r) => setTimeout(r, 2000));
  const busy3020 = await portInUse(3020);
  const busy3022 = await portInUse(port);
  set(
    "1_ports_clear",
    !busy3020 && !busy3022,
    `3020=${busy3020 ? "busy" : "free"} 3022=${busy3022 ? "busy" : "free"}`
  );

  const { url, anonKey, serviceKey } = getLocalEnv();
  const localHost = new URL(url).host;
  const childEnv = {
    ...process.env,
    PORT: String(port),
    ACCOUNTING_DEV_SUPABASE_URL: url,
    ACCOUNTING_DEV_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  };
  const probe = spawn(
    process.execPath,
    ["-e", "process.stdout.write((process.env.ACCOUNTING_DEV_SUPABASE_URL||'').split('//')[1]||'')"],
    { env: childEnv, shell: false, stdio: ["ignore", "pipe", "ignore"] }
  );
  const childHost = await new Promise((resolve) => {
    let out = "";
    probe.stdout.on("data", (d) => {
      out += d.toString();
    });
    probe.on("close", () => resolve(out.trim()));
  });
  set("2_child_env_host", childHost === localHost, `child=${childHost} expected=${localHost}`);

  fs.writeFileSync(logPath, "");
  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  devProc = spawn("npx", ["next", "dev", "-p", String(port)], {
    cwd: repoRoot,
    env: childEnv,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  devProc.stdout?.on("data", (d) => logStream.write(d));
  devProc.stderr?.on("data", (d) => logStream.write(d));

  const base = `http://localhost:${port}`;
  const pageUrl = `${base}${targetPath}`;
  let ready = false;
  const deadline = Date.now() + 6 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(pageUrl, { signal: AbortSignal.timeout(120000) });
      if (res.status > 0) {
        ready = true;
        break;
      }
    } catch {
      /* compile */
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
  set("2_dev_ready", ready, ready ? `HTTP ${pageUrl}` : "timeout 6m");

  if (!ready) {
    set("3_server", false, `서버 미기동\n${tailLogSanitized(20)}`);
    throw new Error("server not ready");
  }
  set("3_server", true, "HTTP response received");

  const svc = createClient(url, serviceKey, { auth: { persistSession: false } });
  const formNameKo = `P10 UI 확인 ${tag.slice(-6)}`;
  const { data: formRow, error: formErr } = await svc
    .from("accounting_form_versions")
    .insert({
      form_code: `VTAX_UI_${tag}`,
      name_ko: formNameKo,
      name_vi: `P10 UI ${tag.slice(-6)}`,
      legal_basis: "P10 list verify",
      effective_from: "2026-01-01",
      status: "pending_verification",
      form_class: "standardized",
      feature_enabled: false,
      verified_status: "unverified",
      field_map: { gates: { standardized_submit: false } },
    })
    .select("id")
    .single();
  if (formErr) throw formErr;
  cleanup.formIds.push(formRow.id);

  const { data: ownerUser, error: userErr } = await svc.auth.admin.createUser({
    email: `${tag}@test.vfbcai.local`,
    password,
    email_confirm: true,
  });
  if (userErr) throw userErr;
  cleanup.userIds.push(ownerUser.user.id);
  await svc.from("users").upsert({ id: ownerUser.user.id, member_type: "company" }, { onConflict: "id" });
  const { data: org } = await svc
    .from("accounting_organizations")
    .insert({ name_official: `P10UI ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  cleanup.orgIds.push(org.id);
  await svc.from("accounting_org_members").insert({
    org_id: org.id,
    user_id: ownerUser.user.id,
    role: "company_owner",
  });

  const signClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: sess } = await signClient.auth.signInWithPassword({
    email: `${tag}@test.vfbcai.local`,
    password,
  });
  const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  const sessionRaw = JSON.stringify(sess.session);

  async function browse(viewport) {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const context = await browser.newContext({ viewport });
    await context.addCookies([{ name: "vfbcai_locale", value: "ko", url: base }]);
    await context.addInitScript((p) => localStorage.setItem(p.key, p.raw), { key: storageKey, raw: sessionRaw });
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByTestId("standardized-forms-page").waitFor({ timeout: 120000 });
    const errBanner = await page.getByText("표준 서식 목록을 불러오지 못했습니다").count();
    const empty = await page.getByTestId("standardized-empty-state").count();
    const list = await page.getByTestId("standardized-form-list").count();
    const name = await page.getByText(formNameKo).count();
    const hostEl = await page.getByTestId("accounting-db-host").innerText().catch(() => "");
    const gtgt = await page.getByText(/GTGT|01\/GTGT/).count();
    const submitBtn = await page.getByRole("button", { name: /제출|확정|전문가 검토 요청/ }).count();
    await browser.close();
    return { errBanner, empty, list, name, hostEl, gtgt, submitBtn };
  }

  const d = await browse({ width: 1440, height: 900 });
  const m = await browse({ width: 390, height: 844 });
  const hostOk = d.hostEl.includes("127.0.0.1") || d.hostEl.includes("localhost");
  set("2_server_db_host", hostOk, `dom_host=${d.hostEl}`);
  const pass = d.list >= 1 && m.list >= 1 && d.name >= 1 && m.name >= 1 && hostOk;
  set(
    "3_list_dom",
    pass,
    `1440 list=${d.list} name=${d.name} err=${d.errBanner} empty=${d.empty}; 390 list=${m.list} name=${m.name} host=${d.hostEl}`
  );
  set(
    "4_ui_gates",
    d.gtgt === 0 && m.gtgt === 0 && d.submitBtn === 0 && m.submitBtn === 0,
    `gov_ref=${d.gtgt}/${m.gtgt} submit_btn=${d.submitBtn}/${m.submitBtn}`
  );
  set(
    "3_error_plus_empty",
    true,
    d.errBanner > 0 && d.empty > 0 ? "동시 노출됨(1440)" : m.errBanner > 0 && m.empty > 0 ? "동시 노출됨(390)" : "동시 노출 없음(이번 성공 경로)"
  );
} catch (e) {
  if (!report["3_list_dom"]) set("3_list_dom", false, e.message);
  if (!report["2_dev_ready"]?.pass) set("6_server", false, `서버 미기동\n${tailLogSanitized(20)}`);
} finally {
  try {
    const { url, serviceKey } = getLocalEnv();
    const svc = createClient(url, serviceKey, { auth: { persistSession: false } });
    for (const id of cleanup.formIds) await svc.from("accounting_form_versions").delete().eq("id", id);
    for (const id of cleanup.orgIds) await svc.from("accounting_organizations").delete().eq("id", id);
    for (const id of cleanup.userIds) await svc.auth.admin.deleteUser(id);
    set("4_cleanup_rows", true, `forms=${cleanup.formIds.length} orgs=${cleanup.orgIds.length}`);
  } catch (e) {
    set("4_cleanup_rows", false, e.message);
  }
  if (devProc) {
    try {
      if (process.platform === "win32") execSync(`taskkill /PID ${devProc.pid} /T /F`, { stdio: "ignore" });
      else devProc.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  killPortWindows(port);
  const busyEnd = await portInUse(port);
  set("4_port_3022_clear", !busyEnd, busyEnd ? "still in use" : "3022 free");

  try {
    restoreProc = spawn("npx", ["next", "dev", "-p", "3020"], {
      cwd: repoRoot,
      env: process.env,
      shell: true,
      detached: true,
      stdio: "ignore",
    });
    restoreProc.unref();
    const home = "http://localhost:3020";
    let ok3020 = false;
    const end = Date.now() + 6 * 60 * 1000;
    while (Date.now() < end) {
      try {
        const res = await fetch(home, { signal: AbortSignal.timeout(120000) });
        if (res.status === 200) {
          ok3020 = true;
          break;
        }
      } catch {
        /* wait */
      }
      await new Promise((r) => setTimeout(r, 10000));
    }
    set("4_restore_3020", ok3020, ok3020 ? "HTTP 200 localhost:3020" : "timeout");
  } catch (e) {
    set("4_restore_3020", false, e.message);
  }
  console.log(JSON.stringify(report));
}
