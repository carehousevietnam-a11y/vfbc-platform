import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountingMessage } from "./uiCatalog";
import { listLedgerEntries, type LedgerListQuery, type LedgerRow } from "./ledgerEntry";
import { resolveAccountingActor } from "./transactionEntry";
import { buildXlsx, XLSX_MIME, type XlsxRow } from "./xlsxWriter";

export const EXPORT_BUCKET = "accounting_exports";
export const EXPORT_KIND_LEDGER = "ledger_excel";
export const EXPORT_MAX_BYTES = 10 * 1024 * 1024;
export const EXPORT_MAX_ROWS = 5000;
const EXPORT_PAGE_SIZE = 100;
const SIGNED_URL_SECONDS = 60;
const ID_CHUNK = 100;

export type ExportWarning = {
  txnId: string;
  field: string;
  reason: "machine" | "missing_vi";
  versionId: string;
};

type I18nVersionEntry = {
  id: string;
  entityId: string;
  field: string;
  lang: string;
  version: number;
  status: string;
  warning: ExportWarning["reason"] | null;
};

export type LedgerExportFilters = Pick<
  LedgerListQuery,
  "period" | "dateFrom" | "dateTo" | "accountCode" | "counterpartyId" | "q"
>;

export type LedgerExportResult =
  | {
      ok: true;
      preview: boolean;
      rowCount: number;
      warnings: ExportWarning[];
      id?: string;
      sha256?: string;
      url?: string;
      untranslatedFlag?: boolean;
    }
  | { ok: false; status: number; error: string };

type TextRow = {
  id: string;
  entity_id: string;
  field: string;
  lang: "ko" | "vi";
  text: string;
  status: string;
  version: number;
};

/** Single definition of who may create or re-download exports (POST and GET share it). */
function exportRoleAllowed(role: string): boolean {
  return role === "company_owner" || role === "company_member";
}

function periodKeyFor(filters: LedgerExportFilters): string {
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) return filters.period;
  const from = filters.dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(filters.dateFrom) ? filters.dateFrom : "";
  const to = filters.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(filters.dateTo) ? filters.dateTo : "";
  if (from || to) return `${from}..${to}`;
  return "all";
}

async function collectRows(
  client: SupabaseClient,
  token: string,
  filters: LedgerExportFilters
): Promise<{ ok: true; rows: LedgerRow[] } | { ok: false; status: number; error: string }> {
  const rows: LedgerRow[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listLedgerEntries(client, token, "vi", { ...filters, page, pageSize: EXPORT_PAGE_SIZE });
    if (!result.ok) return { ok: false, status: result.status, error: result.error };
    if (result.total > EXPORT_MAX_ROWS) return { ok: false, status: 422, error: "TOO_LARGE" };
    rows.push(...result.items);
    if (result.items.length < EXPORT_PAGE_SIZE || rows.length >= result.total) break;
  }
  return { ok: true, rows };
}

async function reviewTranslations(
  client: SupabaseClient,
  orgId: string,
  txnIds: string[]
): Promise<{ warnings: ExportWarning[]; versions: I18nVersionEntry[] }> {
  const warnings: ExportWarning[] = [];
  const versions: I18nVersionEntry[] = [];
  for (let i = 0; i < txnIds.length; i += ID_CHUNK) {
    const chunk = txnIds.slice(i, i + ID_CHUNK);
    const { data } = await client
      .from("accounting_i18n_texts")
      .select("id, entity_id, field, lang, text, status, version")
      .eq("org_id", orgId)
      .eq("entity_type", "transaction")
      .in("entity_id", chunk)
      .in("field", ["memo", "description"])
      .order("version", { ascending: false });
    const current = new Map<string, TextRow>();
    for (const row of (data ?? []) as TextRow[]) {
      const key = `${row.entity_id}|${row.field}|${row.lang}`;
      if (!current.has(key)) current.set(key, row);
    }
    const slots = new Set<string>();
    for (const row of current.values()) slots.add(`${row.entity_id}|${row.field}`);
    for (const slot of slots) {
      const [entityId, field] = slot.split("|");
      const vi = current.get(`${slot}|vi`);
      const ko = current.get(`${slot}|ko`);
      const viUsable = vi && vi.text.trim().length > 0 ? vi : undefined;
      const koUsable = ko && ko.text.trim().length > 0 ? ko : undefined;
      const used = viUsable ?? koUsable;
      if (!used) continue;
      let reason: ExportWarning["reason"] | null = null;
      if (!viUsable) reason = "missing_vi";
      else if (viUsable.status === "machine") reason = "machine";
      if (reason) warnings.push({ txnId: entityId, field, reason, versionId: used.id });
      versions.push({
        id: used.id,
        entityId,
        field,
        lang: used.lang,
        version: used.version,
        status: used.status,
        warning: reason,
      });
    }
  }
  return { warnings, versions };
}

function viText(key: Parameters<typeof accountingMessage>[1]): string {
  return accountingMessage("vi", key);
}

function koText(key: Parameters<typeof accountingMessage>[1]): string {
  return accountingMessage("ko", key);
}

function viDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

function buildSheet(rows: LedgerRow[], untranslated: boolean): Buffer {
  const first = [
    `${viText("accounting.export.banner.g3")} / ${koText("accounting.export.banner.g3")}`,
    ...(untranslated
      ? [`${viText("accounting.export.flag.untranslated")} / ${koText("accounting.export.flag.untranslated")}`]
      : []),
  ].join(" · ");
  const head = (key: Parameters<typeof accountingMessage>[1]) => ({
    kind: "text" as const,
    value: viText(key),
    bold: true,
  });
  const sorted = [...rows].sort((a, b) => (a.entryDate === b.entryDate ? 0 : a.entryDate < b.entryDate ? -1 : 1));
  const sheetRows: XlsxRow[] = [
    [{ kind: "text", value: first, bold: true }],
    [
      head("accounting.ledger.col.date"),
      head("accounting.ledger.filter.account"),
      head("accounting.ledger.col.account"),
      head("accounting.ledger.col.debit"),
      head("accounting.ledger.col.credit"),
      head("accounting.ledger.col.memo"),
      head("accounting.ledger.col.counterparty"),
      head("accounting.txn.field.invoice_no"),
      head("accounting.ledger.col.txn"),
    ],
    ...sorted.map<XlsxRow>((row) => [
      { kind: "text", value: viDate(row.entryDate) },
      { kind: "text", value: row.accountCode },
      { kind: "text", value: row.accountName },
      { kind: "number", value: row.debit },
      { kind: "number", value: row.credit },
      { kind: "text", value: row.memo },
      { kind: "text", value: row.counterpartyName },
      { kind: "text", value: row.invoiceNo ?? "" },
      { kind: "text", value: row.txnId },
    ]),
    [
      { kind: "text", value: viText("accounting.ledger.totals"), bold: true },
      { kind: "text", value: "" },
      { kind: "text", value: "" },
      { kind: "number", value: sorted.reduce((s, r) => s + r.debit, 0) },
      { kind: "number", value: sorted.reduce((s, r) => s + r.credit, 0) },
    ],
  ];
  return buildXlsx(viText("accounting.nav.ledger"), sheetRows, [14, 16, 32, 16, 16, 40, 28, 16, 38]);
}

export async function exportLedgerExcel(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  filters: LedgerExportFilters,
  preview: boolean
): Promise<LedgerExportResult> {
  const actor = await resolveAccountingActor(userClient, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };
  if (!exportRoleAllowed(actor.role)) return { ok: false, status: 403, error: "ROLE_FORBIDDEN" };

  const collected = await collectRows(userClient, accessToken, filters);
  if (!collected.ok) return collected;
  if (collected.rows.length === 0) return { ok: false, status: 422, error: "EMPTY" };

  const txnIds = [...new Set(collected.rows.map((row) => row.txnId))];
  const { warnings, versions } = await reviewTranslations(userClient, actor.orgId, txnIds);
  if (preview) return { ok: true, preview: true, rowCount: collected.rows.length, warnings };

  const untranslated = warnings.length > 0;
  const body = buildSheet(collected.rows, untranslated);
  if (body.length > EXPORT_MAX_BYTES) return { ok: false, status: 413, error: "FILE_TOO_LARGE" };

  const exportId = randomUUID();
  const filePath = `${actor.orgId}/ledger/${exportId}.xlsx`;
  const sha256 = createHash("sha256").update(body).digest("hex");

  const { error: storageError } = await adminClient.storage
    .from(EXPORT_BUCKET)
    .upload(filePath, body, { contentType: XLSX_MIME, upsert: false });
  if (storageError) return { ok: false, status: 400, error: "STORAGE_FAILED" };

  const { error: insertError } = await userClient.from("accounting_exports").insert({
    id: exportId,
    org_id: actor.orgId,
    kind: EXPORT_KIND_LEDGER,
    form_version_id: null,
    period_key: periodKeyFor(filters),
    file_path: filePath,
    sha256,
    i18n_version_list: versions,
    created_by: actor.userId,
  });
  if (insertError) {
    await adminClient.storage.from(EXPORT_BUCKET).remove([filePath]);
    return { ok: false, status: 400, error: "INSERT_FAILED" };
  }

  const { count } = await userClient
    .from("accounting_audit_log")
    .select("id", { count: "exact", head: true })
    .eq("entity_id", exportId)
    .eq("entity", "accounting_exports");
  if ((count ?? 0) < 1) return { ok: false, status: 500, error: "AUDIT_MISSING" };

  const { data: signed, error: signError } = await adminClient.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_SECONDS, { download: "ledger.xlsx" });
  if (signError || !signed?.signedUrl) return { ok: false, status: 400, error: "SIGN_FAILED" };

  return {
    ok: true,
    preview: false,
    rowCount: collected.rows.length,
    warnings,
    id: exportId,
    sha256,
    url: signed.signedUrl,
    untranslatedFlag: untranslated,
  };
}

export async function signLedgerExportUrl(
  userClient: SupabaseClient,
  adminClient: SupabaseClient,
  accessToken: string,
  exportId: string
): Promise<{ ok: true; url: string } | { ok: false; status: number; error: string }> {
  const actor = await resolveAccountingActor(userClient, accessToken);
  if (!actor.ok) return { ok: false, status: actor.status, error: actor.error };
  if (!exportRoleAllowed(actor.role)) return { ok: false, status: 403, error: "ROLE_FORBIDDEN" };
  const { data: row, error } = await userClient
    .from("accounting_exports")
    .select("file_path")
    .eq("id", exportId)
    .eq("org_id", actor.orgId)
    .eq("kind", EXPORT_KIND_LEDGER)
    .maybeSingle();
  if (error || !row) return { ok: false, status: 404, error: "NOT_FOUND" };
  const { data: signed, error: signError } = await adminClient.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(row.file_path as string, SIGNED_URL_SECONDS, { download: "ledger.xlsx" });
  if (signError || !signed?.signedUrl) return { ok: false, status: 400, error: "SIGN_FAILED" };
  return { ok: true, url: signed.signedUrl };
}
