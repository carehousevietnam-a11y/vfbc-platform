/**
 * P4b-1 ledger Excel export — local Supabase + local Next (node tests/accounting/p3c-local-next.mjs, port 3020).
 * Refuses non-local Supabase. No customer data; TEST org/users only.
 */
import { createHash } from "crypto";
import { inflateRawSync } from "zlib";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const base = process.env.P4B_BASE || "http://localhost:3020";
const EXPORT_API = `${base}/api/accounting/exports/ledger`;

function parseSupabaseStatusEnv(stdout) {
  const out = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^"|"$/g, "");
  }
  return out;
}

function localStatus() {
  const res = spawnSync("npx", ["supabase", "status", "-o", "env"], { cwd: repoRoot, encoding: "utf8", shell: true });
  if (res.status !== 0) throw new Error("local supabase status failed");
  const st = parseSupabaseStatusEnv(res.stdout || "");
  const host = new URL(st.API_URL).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") throw new Error("refusing non-local supabase");
  return st;
}

const results = { pass: 0, fail: 0, cases: [] };
function record(name, ok, detail) {
  results.cases.push({ name, ok: Boolean(ok), detail: ok ? undefined : detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
}

function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = new Map();
  for (let n = 0; n < count; n += 1) {
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    files.set(name, method === 8 ? inflateRawSync(raw) : raw);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function sheetInfo(xlsx) {
  const xml = readZip(xlsx).get("xl/worksheets/sheet1.xml")?.toString("utf8") ?? "";
  const texts = [...xml.matchAll(/<t xml:space="preserve">([^<]*)<\/t>/g)].map((m) =>
    m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
  );
  const firstRow = /<row r="1">(.*?)<\/row>/.exec(xml)?.[1] ?? "";
  const firstText = /<t xml:space="preserve">([^<]*)<\/t>/.exec(firstRow)?.[1] ?? "";
  const textCells = [...xml.matchAll(/<c [^>]*t="inlineStr"/g)].length;
  const allCells = [...xml.matchAll(/<c r=/g)].length;
  const numberCells = [...xml.matchAll(/<c r="[A-Z]+\d+"><v>/g)].length;
  return { xml, texts, firstText, hasFormula: /<f[ >]/.test(xml), textCells, allCells, numberCells };
}

async function main() {
  const st = localStatus();
  const { ACCOUNTING_UI } = await import("../../src/lib/accounting/uiCatalog.ts");
  const { seedTestPostingRule } = await import("./testPostingFixture.mjs");
  const { applyTransactionCommand } = await import("../../src/lib/accounting/transactionEntry.ts");
  const G3 = ACCOUNTING_UI.vi["accounting.export.banner.g3"];
  const UNTRANS = ACCOUNTING_UI.vi["accounting.export.flag.untranslated"];

  const ping = await fetch(`${base}/`, { method: "HEAD" }).catch(() => null);
  if (!ping) throw new Error(`local next not reachable at ${base} — run: node tests/accounting/p3c-local-next.mjs`);

  const service = createClient(st.API_URL, st.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const tag = `p4b-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  async function makeUser(label) {
    const email = `${tag}-${label}@test.vfbcai.local`;
    const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(`createUser ${label}`);
    await service.from("users").upsert({ id: data.user.id, member_type: "company" }, { onConflict: "id" });
    await service.from("accounting_profiles").upsert({ user_id: data.user.id, locale: "ko" }, { onConflict: "user_id" });
    const boot = createClient(st.API_URL, st.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: sess, error: signErr } = await boot.auth.signInWithPassword({ email, password });
    if (signErr || !sess.session) throw new Error(`signIn ${label}`);
    const token = sess.session.access_token;
    const client = createClient(st.API_URL, st.ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return { id: data.user.id, token, client };
  }

  async function makeOrg(label, members) {
    const { data: org, error } = await service
      .from("accounting_organizations")
      .insert({ name_official: `P4b ${label} ${tag}`, approval_status: "approved" })
      .select("id")
      .single();
    if (error) throw new Error("org create");
    await service.from("accounting_org_members").insert(members.map((m) => ({ org_id: org.id, user_id: m.user.id, role: m.role })));
    return org.id;
  }

  const ownerA = await makeUser("owner-a");
  const expertA = await makeUser("expert-a");
  const memberA = await makeUser("member-a");
  const ownerB = await makeUser("owner-b");
  const orgA = await makeOrg("A", [
    { user: ownerA, role: "company_owner" },
    { user: expertA, role: "vnk_expert" },
    { user: memberA, role: "company_member" },
  ]);
  const orgB = await makeOrg("B", [{ user: ownerB, role: "company_owner" }]);
  await seedTestPostingRule(service, "sale");

  async function confirmSale(owner, invoiceNo, counterparty) {
    const res = await applyTransactionCommand(
      owner.client,
      owner.token,
      {
        action: "confirm",
        type: "sale",
        txnDate: "2026-10-16",
        invoiceSeries: "1C26T",
        invoiceNo,
        invoiceDate: "2026-10-16",
        currency: "VND",
        amountNet: 1000000,
        vatRate: 0,
        vatAmount: 0,
        newCounterpartyName: counterparty,
      },
      null
    );
    if (!res.ok) throw new Error(`confirm failed ${invoiceNo}`);
    return res.id;
  }

  async function addText(org, owner, txnId, lang, text, status, version = 1) {
    const { error } = await service.from("accounting_i18n_texts").insert({
      org_id: org,
      entity_type: "transaction",
      entity_id: txnId,
      field: "memo",
      lang,
      text,
      status,
      version,
      created_by: owner.id,
    });
    if (error) throw new Error("i18n insert");
  }

  const a1 = await confirmSale(ownerA, "0004001", "P4b Cp A1");
  const a2 = await confirmSale(ownerA, "0004002", "P4b Cp A2");
  await addText(orgA, ownerA, a1, "ko", "사무실 비품 구매", "original");
  await addText(orgA, ownerA, a1, "vi", "Mua van phong pham", "machine");
  await addText(orgA, ownerA, a2, "ko", "임대료 지급", "original");

  const b1 = await confirmSale(ownerB, "0005001", "=1+1");
  const b2 = await confirmSale(ownerB, "0005002", "+SUM(A1)");
  await addText(orgB, ownerB, b1, "ko", "수식 시험", "original");
  await addText(orgB, ownerB, b1, "vi", "=1+1", "human_verified");
  await addText(orgB, ownerB, b2, "vi", "@cmd", "original");

  const post = (owner, body) =>
    fetch(EXPORT_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${owner.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // ③ machine / missing vi → warnings, version list, banner
  const previewA = await (await post(ownerA, { preview: true })).json();
  const warnReasons = (previewA.warnings ?? []).map((w) => w.reason).sort();
  record(
    "warn_machine_and_missing_vi",
    previewA.ok === true &&
      warnReasons.join(",") === "machine,missing_vi" &&
      previewA.warnings.every((w) => typeof w.versionId === "string" && !("text" in w)),
    JSON.stringify(warnReasons)
  );

  const createA = await post(ownerA, { period: "2026-10" });
  const bodyA = await createA.json();
  record("export_create_a", createA.status === 200 && Boolean(bodyA.url) && Boolean(bodyA.id), `status=${createA.status}`);

  const { data: rowA } = await service.from("accounting_exports").select("*").eq("id", bodyA.id).maybeSingle();
  const versionsA = Array.isArray(rowA?.i18n_version_list) ? rowA.i18n_version_list : [];
  record(
    "i18n_version_list_recorded",
    versionsA.length > 0 && versionsA.some((v) => v.warning === "machine") && versionsA.some((v) => v.warning === "missing_vi"),
    JSON.stringify(versionsA.length)
  );
  record(
    "export_row_fields",
    rowA?.kind === "ledger_excel" &&
      rowA?.period_key === "2026-10" &&
      rowA?.form_version_id === null &&
      rowA?.file_path?.startsWith(`${orgA}/`) &&
      rowA?.created_by === ownerA.id,
    JSON.stringify({ kind: rowA?.kind, period: rowA?.period_key, fv: rowA?.form_version_id })
  );

  // ② downloaded file sha256 = exports.sha256 (signed URL only)
  const fileResA = await fetch(bodyA.url);
  const fileA = Buffer.from(await fileResA.arrayBuffer());
  const shaA = createHash("sha256").update(fileA).digest("hex");
  record("sha256_matches_download", fileResA.status === 200 && shaA === rowA?.sha256 && shaA === bodyA.sha256, `status=${fileResA.status}`);

  const infoA = sheetInfo(fileA);
  record(
    "marked_untranslated_and_g3_first_row",
    infoA.firstText.includes(G3) && infoA.firstText.includes(UNTRANS),
    infoA.firstText.slice(0, 80)
  );

  const { count: auditCount } = await service
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity", "accounting_exports")
    .eq("entity_id", bodyA.id);
  record("export_audit_logged", (auditCount ?? 0) === 1, `count=${auditCount}`);

  const upd = await ownerA.client.from("accounting_exports").update({ sha256: "x" }).eq("id", bodyA.id).select("id");
  const del = await ownerA.client.from("accounting_exports").delete().eq("id", bodyA.id).select("id");
  const { data: stillA } = await service.from("accounting_exports").select("sha256").eq("id", bodyA.id).single();
  record(
    "exports_insert_only",
    (Boolean(upd.error) || (upd.data ?? []).length === 0) && (Boolean(del.error) || (del.data ?? []).length === 0) && stillA.sha256 === shaA,
    "mutated"
  );

  // ④ no machine / no missing vi → no warning, no untranslated mark
  const previewB = await (await post(ownerB, { preview: true })).json();
  const createB = await post(ownerB, { dateFrom: "2026-10-01", dateTo: "2026-10-31" });
  const bodyB = await createB.json();
  const fileB = Buffer.from(await (await fetch(bodyB.url)).arrayBuffer());
  const infoB = sheetInfo(fileB);
  const { data: rowB } = await service.from("accounting_exports").select("period_key").eq("id", bodyB.id).maybeSingle();
  record(
    "no_warning_when_verified_vi",
    previewB.ok === true &&
      (previewB.warnings ?? []).length === 0 &&
      (bodyB.warnings ?? []).length === 0 &&
      infoB.firstText.includes(G3) &&
      !infoB.firstText.includes(UNTRANS) &&
      rowB?.period_key === "2026-10-01..2026-10-31",
    JSON.stringify(previewB.warnings)
  );

  // ⑤ formula injection
  const startsBad = infoB.texts.filter((t) => /^[=+\-@\t\r]/.test(t));
  record(
    "formula_injection_not_stored_as_formula",
    !infoB.hasFormula &&
      startsBad.length === 0 &&
      infoB.texts.includes("'=1+1") &&
      infoB.texts.includes("'+SUM(A1)") &&
      infoB.texts.includes("'@cmd") &&
      infoB.textCells + infoB.numberCells === infoB.allCells,
    JSON.stringify({ hasFormula: infoB.hasFormula, startsBad })
  );

  // ① isolation
  const crossRows = await ownerB.client.from("accounting_exports").select("id").eq("id", bodyA.id);
  const crossRowsAll = await ownerB.client.from("accounting_exports").select("id").eq("org_id", orgA);
  const crossApi = await fetch(`${EXPORT_API}?id=${bodyA.id}`, { headers: { Authorization: `Bearer ${ownerB.token}` } });
  const crossList = await ownerB.client.storage.from("accounting_exports").list(`${orgA}/ledger`);
  const crossDownload = await ownerB.client.storage.from("accounting_exports").download(rowA.file_path);
  const crossSign = await ownerB.client.storage.from("accounting_exports").createSignedUrl(rowA.file_path, 60);
  record(
    "isolation_other_org_blocked",
    (crossRows.data ?? []).length === 0 &&
      (crossRowsAll.data ?? []).length === 0 &&
      crossApi.status === 404 &&
      (crossList.data ?? []).length === 0 &&
      (!crossDownload.data || Boolean(crossDownload.error)) &&
      Boolean(crossSign.error || !crossSign.data?.signedUrl),
    JSON.stringify({
      rows: (crossRows.data ?? []).length,
      api: crossApi.status,
      list: (crossList.data ?? []).length,
      dl: Boolean(crossDownload.data),
    })
  );

  const ownOk = await fetch(`${EXPORT_API}?id=${bodyA.id}`, { headers: { Authorization: `Bearer ${ownerA.token}` } });
  const ownBody = await ownOk.json().catch(() => ({}));
  const ownFile = ownBody.url ? Buffer.from(await (await fetch(ownBody.url)).arrayBuffer()) : Buffer.alloc(0);
  record("own_org_resigned_url_ok", ownOk.status === 200 && createHash("sha256").update(ownFile).digest("hex") === shaA, `status=${ownOk.status}`);

  const getAs = (u) => fetch(`${EXPORT_API}?id=${bodyA.id}`, { headers: { Authorization: `Bearer ${u.token}` } });
  const getExpert = await getAs(expertA);
  const getExpertBody = await getExpert.json().catch(() => ({}));
  const getMember = await getAs(memberA);
  const getMemberBody = await getMember.json().catch(() => ({}));
  const getOwner = await getAs(ownerA);
  const getOther = await getAs(ownerB);
  record(
    "get_resign_role_check",
    getExpert.status === 403 &&
      !getExpertBody.url &&
      getMember.status === 200 &&
      Boolean(getMemberBody.url) &&
      getOwner.status === 200 &&
      getOther.status === 404,
    `expert=${getExpert.status} member=${getMember.status} owner=${getOwner.status} other=${getOther.status}`
  );

  const noAuth = await fetch(EXPORT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  const expert = await post(expertA, {});
  record("auth_and_role_enforced", noAuth.status === 401 && expert.status === 403, `noauth=${noAuth.status} expert=${expert.status}`);

  const noMime = await service.storage
    .from("accounting_exports")
    .upload(`${orgA}/ledger/${tag}.txt`, Buffer.from("x"), { contentType: "text/plain" });
  record("bucket_mime_restricted", Boolean(noMime.error), "text/plain accepted");

  console.log(JSON.stringify(results, null, 2));
  if (results.fail > 0) process.exit(2);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : "p4b failed");
  process.exit(1);
});
