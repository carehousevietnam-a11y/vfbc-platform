/**
 * P6a expert queue, comments, filing — local Supabase.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const results = { pass: 0, fail: 0, cases: [] };

function record(name, ok, detail = "") {
  results.cases.push({ name, ok, detail });
  if (ok) results.pass += 1;
  else results.fail += 1;
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

function getLocalSupabaseEnv() {
  const raw = execSync("npx supabase status -o env", {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const st = parseSupabaseStatusEnv(raw);
  return { url: st.API_URL, anonKey: st.ANON_KEY, serviceKey: st.SERVICE_ROLE_KEY };
}

async function createAuthUser(service, email, password) {
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function signIn(url, anonKey, email, password) {
  const boot = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await boot.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
    auth: { persistSession: false },
  });
}

async function main() {
  const { url, anonKey, serviceKey } = getLocalSupabaseEnv();
  const service = createClient(url, serviceKey, { auth: { persistSession: false } });
  const tag = `p6a-${Date.now()}`;
  const password = `Test-${tag}-Aa1!`;

  const ownerA = await createAuthUser(service, `a-${tag}@t.local`, password);
  const ownerB = await createAuthUser(service, `b-${tag}@t.local`, password);
  const expertA = await createAuthUser(service, `ea-${tag}@t.local`, password);
  const expertUnassigned = await createAuthUser(service, `eu-${tag}@t.local`, password);
  const member = await createAuthUser(service, `m-${tag}@t.local`, password);
  const admin = await createAuthUser(service, `ad-${tag}@t.local`, password);

  const { data: orgA } = await service
    .from("accounting_organizations")
    .insert({ name_official: `A ${tag}`, approval_status: "approved" })
    .select("id")
    .single();
  const { data: orgB } = await service
    .from("accounting_organizations")
    .insert({ name_official: `B ${tag}`, approval_status: "approved" })
    .select("id")
    .single();

  for (const [uid, orgId, role] of [
    [ownerA.id, orgA.id, "company_owner"],
    [ownerB.id, orgB.id, "company_owner"],
    [expertA.id, orgA.id, "vnk_expert"],
    [expertUnassigned.id, orgA.id, "vnk_expert"],
    [member.id, orgA.id, "company_member"],
    [admin.id, orgA.id, "vnk_admin"],
  ]) {
    await service.from("accounting_org_members").insert({ org_id: orgId, user_id: uid, role });
  }

  await service.from("users").upsert(
    [ownerA, ownerB, expertA, expertUnassigned, member, admin].map((u) => ({
      id: u.id,
      member_type: "company",
    }))
  );

  await service.from("accounting_expert_assignments").insert({
    expert_user_id: expertA.id,
    org_id: orgA.id,
    assigned_by: admin.id,
  });

  const { data: declA } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgA.id,
      form_code: "01/GTGT",
      period_key: "2026-11",
      status: "expert_review",
      computed: { warnings: ["w1"], fields: {} },
    })
    .select("id")
    .single();
  const { data: declB } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgB.id,
      form_code: "01/GTGT",
      period_key: "2026-11",
      status: "expert_review",
      computed: {},
    })
    .select("id")
    .single();

  const clientExpertA = await signIn(url, anonKey, `ea-${tag}@t.local`, password);
  const clientExpertU = await signIn(url, anonKey, `eu-${tag}@t.local`, password);
  const clientMember = await signIn(url, anonKey, `m-${tag}@t.local`, password);

  const queueAssigned = await clientExpertA
    .from("accounting_declarations")
    .select("id")
    .eq("status", "expert_review")
    .eq("org_id", orgA.id);
  record("assigned_expert_sees_queue", (queueAssigned.data ?? []).length === 1);

  const queueUnassigned = await clientExpertU
    .from("accounting_declarations")
    .select("id")
    .eq("org_id", orgA.id);
  record("unassigned_expert_no_org_data", (queueUnassigned.data ?? []).length === 0);

  const crossDecl = await clientExpertA.from("accounting_declarations").select("id").eq("id", declB.id);
  record("expert_cross_org_decl_blocked", (crossDecl.data ?? []).length === 0);

  const memberDecl = await clientMember.from("accounting_declarations").select("id").eq("id", declA.id);
  record("member_sees_own_org_decl", (memberDecl.data ?? []).length === 1);

  const memberComment = await clientMember.from("accounting_review_comments").insert({
    org_id: orgA.id,
    target_type: "declaration",
    target_id: declA.id,
    author_id: member.id,
    kind: "comment",
    status: "open",
  });
  record("member_comment_blocked", !!memberComment.error);

  const memberFiling = await clientMember
    .from("accounting_declarations")
    .update({ status: "filed_manual", filed_at: new Date().toISOString() })
    .eq("id", declA.id);
  record("member_filing_blocked", !!memberFiling.error);

  const noBasis = await clientExpertA
    .from("accounting_declarations")
    .update({
      status: "filed_manual",
      filed_at: new Date().toISOString(),
      filing_receipt_path: "filing/x.pdf",
    })
    .eq("id", declA.id);
  record("filing_no_portal_basis_blocked", !!noBasis.error);

  const { data: declFiled, error: declFiledErr } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgA.id,
      form_code: "01/GTGT",
      period_key: "2026-08",
      status: "filed_manual",
      computed: { fields: { "43": { value: "1" } } },
    })
    .select("id")
    .single();
  if (declFiledErr) throw declFiledErr;

  const { data: filedDraftTxn, error: filedDraftErr } = await clientMember
    .from("accounting_transactions")
    .insert({
      org_id: orgA.id,
      type: "expense",
      status: "draft",
      txn_date: "2026-08-05",
      period_key: "2026-08",
      amount_vnd: 1,
    })
    .select("id")
    .single();
  record("filed_period_draft_insert_allowed", !filedDraftErr && !!filedDraftTxn?.id);

  const clientOwnerA = await signIn(url, anonKey, `a-${tag}@t.local`, password);
  const { error: filedConfirmErr } = await clientOwnerA.rpc("accounting_confirm_transaction", {
    p_txn_id: filedDraftTxn?.id,
  });
  record(
    "filed_period_confirm_blocked",
    !!filedConfirmErr && /filed_manual locked/i.test(filedConfirmErr.message ?? "")
  );

  const { error: filedLedgerErr } = await clientOwnerA.from("accounting_ledger_entries").insert({
    org_id: orgA.id,
    txn_id: filedDraftTxn?.id,
    period_key: "2026-08",
    entry_date: "2026-08-05",
    account_code: "TEST-P6A-LEDGER",
    debit: 1,
    credit: 0,
  });
  record(
    "filed_period_ledger_insert_blocked",
    !!filedLedgerErr && /filed_manual locked/i.test(filedLedgerErr.message ?? "")
  );

  const computedBlocked = await service
    .from("accounting_declarations")
    .update({ computed: { fields: { "43": { value: "2" } } } })
    .eq("id", declFiled.id);
  record("filed_period_computed_blocked", !!computedBlocked.error);

  const { data: assignAudit } = await service
    .from("accounting_audit_log")
    .select("id")
    .eq("entity", "accounting_expert_assignments")
    .limit(1);
  record("audit_assignment_present", (assignAudit ?? []).length >= 1);

  const { data: commentRow } = await clientExpertA
    .from("accounting_review_comments")
    .insert({
      org_id: orgA.id,
      target_type: "declaration",
      target_id: declA.id,
      author_id: expertA.id,
      kind: "comment",
      status: "open",
    })
    .select("id")
    .single();
  const { count: commentAudit } = await service
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity", "accounting_review_comments")
    .eq("entity_id", commentRow?.id);
  record("audit_comment", (commentAudit ?? 0) >= 1);

  const { data: declReview } = await service
    .from("accounting_declarations")
    .insert({
      org_id: orgA.id,
      form_code: "01/GTGT",
      period_key: "2026-12",
      status: "expert_review",
      computed: {},
    })
    .select("id")
    .single();

  const filingOk = await clientExpertA
    .from("accounting_declarations")
    .update({
      status: "filed_manual",
      portal_form_basis: "TT89",
      filed_at: new Date().toISOString(),
      filing_receipt_path: "filing/ok.pdf",
    })
    .eq("id", declReview.id);
  record("expert_filing_ok", !filingOk.error);

  const { count: filingAudit } = await service
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity", "accounting_declarations")
    .eq("entity_id", declReview.id)
    .eq("action", "UPDATE");
  record("audit_filing", (filingAudit ?? 0) >= 1);

  console.log(JSON.stringify(results, null, 2));
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
