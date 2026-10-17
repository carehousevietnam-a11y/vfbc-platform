"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  accountingMessage,
  type AccountingLocale,
  type AccountingMessageKey,
} from "@/lib/accounting/uiCatalog";
import type { VatFieldMapEntry } from "@/lib/accounting/vatDeclarationEntry";

const STEPS = [1, 2, 3, 4, 5, 6] as const;
const LEVEL_CLASS = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mid: "border-amber-200 bg-amber-50 text-amber-700",
  warn: "border-red-200 bg-red-50 text-red-700",
};

const STEP_FIELDS: Record<number, string[]> = {
  2: ["26", "29", "30", "31", "32", "33", "32a", "32b", "34a", "27", "28", "34"],
  3: ["23", "24", "25"],
  4: ["22", "35", "36", "37", "38", "40a", "40", "41", "42", "43"],
};

type ComputedFields = Record<string, { value?: string; source?: string; txn_ids?: string[] }>;

function uiLocale(locale: string): AccountingLocale {
  return locale === "vi" ? "vi" : "ko";
}

function formatAmount(locale: AccountingLocale, raw: string | undefined): string {
  const n = Number(raw ?? "0");
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "ko-KR", {
    maximumFractionDigits: 0,
  }).format(n);
}

function labelFor(field: VatFieldMapEntry | undefined, locale: AccountingLocale): string {
  if (!field) return "—";
  const name = locale === "vi" ? field.label_vi : field.label_ko;
  return `[${field.code}] ${name}`;
}

function bilingualLabel(field: VatFieldMapEntry): string {
  return `${field.label_ko} · [${field.code}] ${field.label_vi}`;
}

function sourceLabel(
  t: (key: AccountingMessageKey) => string,
  source: string | undefined
): string {
  if (source === "calc") return t("accounting.vat.source.calc");
  if (source === "expert") return t("accounting.vat.source.expert");
  if (source === "input") return t("accounting.vat.source.input");
  return t("accounting.vat.preview.empty");
}

function displayValue(
  field: VatFieldMapEntry,
  computed: ComputedFields,
  ctx: { periodKey: string; orgName: string; taxCode: string; filingKind: string },
  t: (key: AccountingMessageKey) => string,
  lang: AccountingLocale
): string {
  const cell = computed[field.code];
  if (cell?.value !== undefined && field.column !== "F") {
    return formatAmount(lang, cell.value);
  }
  if (field.code === "01b") return ctx.periodKey || t("accounting.vat.preview.empty");
  if (field.code === "04") return ctx.orgName || t("accounting.vat.preview.empty");
  if (field.code === "05") return ctx.taxCode || t("accounting.vat.preview.empty");
  if (field.code === "01a") return t("accounting.vat.preview.empty");
  if (field.column === "F") return t("accounting.vat.preview.empty");
  return formatAmount(lang, cell?.value);
}

export default function VatDeclarationClient() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const lang = uiLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const urlPeriodKey = searchParams.get("periodKey") ?? "";
  const [periodKeyDraft, setPeriodKeyDraft] = useState("");
  const periodKey = periodKeyDraft || urlPeriodKey;
  const [filingKind, setFilingKind] = useState<"regular" | "amended">("regular");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [helpOpen, setHelpOpen] = useState(false);
  const [fieldMap, setFieldMap] = useState<VatFieldMapEntry[]>([]);
  const [formStatus, setFormStatus] = useState("");
  const [declarationId, setDeclarationId] = useState<string | null>(null);
  const [declStatus, setDeclStatus] = useState("");
  const [computed, setComputed] = useState<ComputedFields>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [vatMethod, setVatMethod] = useState<string | null>(null);
  const [notice, setNotice] = useState<AccountingMessageKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [precheck, setPrecheck] = useState<
    { level: keyof typeof LEVEL_CLASS; messageKey: AccountingMessageKey; txnIds?: string[] }[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);

  const mapByCode = useMemo(() => {
    const m = new Map<string, VatFieldMapEntry>();
    for (const f of fieldMap) m.set(f.code, f);
    return m;
  }, [fieldMap]);

  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fontClass =
    fontSize === "sm" ? "text-[13px]" : fontSize === "lg" ? "text-[17px]" : "text-[15px]";

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access = data.session?.access_token;
      if (!access) {
        setPhase("signed_out");
        return;
      }
      setToken(access);
      setPhase("ready");
    })();
  }, []);

  const loadContext = useCallback(async () => {
    if (!token || !periodKey) return;
    const res = await fetch(`/api/accounting/vat/declaration?periodKey=${encodeURIComponent(periodKey)}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      setPhase("denied");
      return;
    }
    const json = await res.json();
    setRole(json.role);
    setOrgId(json.orgId ?? "");
    setOrgName(json.org?.name_official ?? "");
    setTaxCode(json.org?.tax_code ?? "");
    setVatMethod(json.org?.vat_method ?? null);
    setFieldMap(json.form.fields ?? []);
    setFormStatus(json.form.status ?? "");
    if (json.declaration) {
      setDeclarationId(json.declaration.id);
      setDeclStatus(json.declaration.status);
      const comp = json.declaration.computed as { fields?: ComputedFields; warnings?: string[] };
      setComputed(comp?.fields ?? {});
      setWarnings(comp?.warnings ?? []);
    }
  }, [authHeaders, periodKey, token]);

  useEffect(() => {
    if (phase !== "ready" || !periodKey || !token) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/accounting/vat/declaration?periodKey=${encodeURIComponent(periodKey)}`, {
        headers: authHeaders(),
      });
      if (cancelled) return;
      if (!res.ok) {
        setPhase("denied");
        return;
      }
      const json = await res.json();
      setRole(json.role);
      setOrgId(json.orgId ?? "");
      setOrgName(json.org?.name_official ?? "");
      setTaxCode(json.org?.tax_code ?? "");
      setVatMethod(json.org?.vat_method ?? null);
      setFieldMap(json.form.fields ?? []);
      setFormStatus(json.form.status ?? "");
      if (json.declaration) {
        setDeclarationId(json.declaration.id);
        setDeclStatus(json.declaration.status);
        const comp = json.declaration.computed as { fields?: ComputedFields; warnings?: string[] };
        setComputed(comp?.fields ?? {});
        setWarnings(comp?.warnings ?? []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, periodKey, token, authHeaders]);

  const runDraft = useCallback(async () => {
    if (!token || !periodKey) return null;
    setBusy(true);
    setNotice(null);
    const res = await fetch("/api/accounting/vat/declaration", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ periodKey }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      if (json.error === "VAT_DIRECT_METHOD_CONTACT_EXPERT") {
        setNotice("accounting.vat.error.direct_method");
      } else if (json.error === "PERIOD_FILED_LOCKED") {
        setNotice("accounting.vat.error.filed_locked");
      } else {
        setNotice("accounting.vat.error.generic");
      }
      return null;
    }
    setDeclarationId(json.declarationId);
    const fields = (json.computed as { fields?: ComputedFields; warnings?: string[] }).fields ?? {};
    const w = (json.computed as { warnings?: string[] }).warnings ?? [];
    setComputed(fields);
    setWarnings(w);
    await loadContext();
    return json.computed;
  }, [authHeaders, loadContext, periodKey, token]);

  const buildPrecheck = useCallback(async () => {
    const items: { level: keyof typeof LEVEL_CLASS; messageKey: AccountingMessageKey; txnIds?: string[] }[] =
      [];
    for (const w of warnings) {
      const key = w as AccountingMessageKey;
      items.push({
        level: w.includes("error") ? "warn" : "mid",
        messageKey: key,
      });
    }
    const f40 = BigInt(computed["40"]?.value ?? "0");
    const f41 = BigInt(computed["41"]?.value ?? "0");
    if (f40 > BigInt(0) && f41 > BigInt(0)) {
      items.push({ level: "warn", messageKey: "accounting.vat.check.both_40_41" });
    }
    if (!token || !periodKey || !orgId) {
      setPrecheck(items);
      return;
    }
    const { data: txns } = await supabase
      .from("accounting_transactions")
      .select("id, status, amount_vnd")
      .eq("org_id", orgId)
      .eq("period_key", periodKey)
      .neq("status", "confirmed");
    const draftIds = (txns ?? []).filter((t) => t.status !== "cancelled").map((t) => t.id as string);
    if (draftIds.length) {
      items.push({ level: "mid", messageKey: "accounting.vat.check.unconfirmed_txn", txnIds: draftIds });
    }
    const { data: confirmed } = await supabase
      .from("accounting_transactions")
      .select("id, amount_vnd")
      .eq("org_id", orgId)
      .eq("period_key", periodKey)
      .eq("status", "confirmed");
    const bigIds: string[] = [];
    for (const row of confirmed ?? []) {
      if (Number(row.amount_vnd) >= 5_000_000) bigIds.push(row.id as string);
    }
    if (bigIds.length) {
      items.push({
        level: "mid",
        messageKey: "accounting.vat.check.noncash_review",
        txnIds: bigIds,
      });
    }
    setPrecheck(items);
  }, [computed, orgId, periodKey, token, warnings]);

  const goToStep = (n: number) => {
    setStep(n);
    if (n === 5) void buildPrecheck();
  };

  const saveLocalDraft = () => {
    localStorage.setItem(
      "accounting.vat.draft",
      JSON.stringify({ periodKey, filingKind, step })
    );
    setNotice("accounting.vat.saved_local");
  };

  const loadLocalDraft = () => {
    const raw = localStorage.getItem("accounting.vat.draft");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { periodKey?: string; filingKind?: string; step?: number };
      if (parsed.periodKey) setPeriodKeyDraft(parsed.periodKey);
      if (parsed.filingKind === "amended" || parsed.filingKind === "regular") {
        setFilingKind(parsed.filingKind);
      }
      if (parsed.step && parsed.step >= 1 && parsed.step <= 6) goToStep(parsed.step);
      setNotice("accounting.vat.loaded_local");
    } catch {
      setNotice("accounting.vat.error.generic");
    }
  };

  const requestReview = async () => {
    if (!declarationId || role !== "company_owner") {
      setNotice("accounting.vat.error.owner_only");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/accounting/vat/expert-review", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "expert_review", declarationId }),
    });
    setBusy(false);
    if (!res.ok) {
      setNotice("accounting.vat.error.generic");
      return;
    }
    setDeclStatus("expert_review");
    setNotice("accounting.vat.review_requested");
  };

  const renderFieldRow = (code: string) => {
    const field = mapByCode.get(code);
    const cell = computed[code];
    const expertOnly = field?.kind === "exp";
    return (
      <div
        key={code}
        className="flex flex-col gap-1 border-b border-[#E3E8F0] py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="font-semibold text-[#071A33]">{labelFor(field, lang)}</p>
        <div className="text-right">
          <p className="font-mono font-semibold tabular-nums text-[#071A33]">
            {formatAmount(lang, cell?.value)}{" "}
            <span className="text-xs font-normal text-[#3D4B63]">{t("accounting.txn.unit.vnd")}</span>
          </p>
          {expertOnly && (
            <p className="text-xs text-[#3D4B63]">{t("accounting.vat.expert_readonly")}</p>
          )}
          {cell?.txn_ids?.length ? (
            <div className="mt-1 flex flex-wrap justify-end gap-2">
              {cell.txn_ids.map((id) => (
                <Link
                  key={id}
                  href={`/company/accounting/transactions/${id}`}
                  className="text-xs font-semibold text-[#071A33] underline"
                >
                  {t("accounting.vat.link.txn")}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (phase === "loading") {
    return <p className="p-6 text-[#3D4B63]">{t("accounting.vat.loading")}</p>;
  }

  if (phase === "signed_out") {
    return <p className="p-6 text-[#3D4B63]">{t("accounting.vat.sign_in")}</p>;
  }

  return (
    <div className={`${fontClass}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 lg:flex-row lg:px-6">
        <main className="min-w-0 flex-1 space-y-4">
          <header className="rounded-xl border border-[#E3E8F0] bg-white p-4">
            <h1 className="text-lg font-extrabold text-[#071A33]">{t("accounting.vat.title")}</h1>
            <p className="mt-1 text-sm text-[#3D4B63]">{t("accounting.vat.lead")}</p>
          </header>

          {formStatus === "pending_verification" && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${LEVEL_CLASS.mid}`}>
              {t("accounting.vat.banner.pending_form")}
            </div>
          )}

          {vatMethod === "direct" && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${LEVEL_CLASS.warn}`}>
              {t("accounting.vat.error.direct_method")}
            </div>
          )}

          <nav className="flex flex-wrap gap-2" aria-label={t("accounting.vat.steps.label")}>
            {STEPS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goToStep(n)}
                className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
                  step === n ? "bg-[#071A33] text-white" : "bg-white text-[#3D4B63] border border-[#E3E8F0]"
                }`}
              >
                {t(`accounting.vat.step.${n}` as AccountingMessageKey)}
              </button>
            ))}
          </nav>

          {notice && (
            <p className="rounded-lg border border-[#E3E8F0] bg-white px-3 py-2 text-sm text-[#071A33]">
              {t(notice)}
            </p>
          )}

          <section className="rounded-xl border border-[#E3E8F0] bg-white p-4">
            {showPreview ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-[#071A33]">{t("accounting.vat.preview.title")}</h2>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
                    onClick={() => setShowPreview(false)}
                  >
                    {t("accounting.vat.preview.close")}
                  </button>
                </div>
                <ul className="divide-y divide-[#E3E8F0]">
                  {fieldMap.map((field) => {
                    const cell = computed[field.code];
                    const isAmount = field.column === "V" || field.column === "T";
                    return (
                      <li key={field.code} className="py-3">
                        <p className="font-semibold text-[#071A33]">{bilingualLabel(field)}</p>
                        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-right font-mono tabular-nums text-[#071A33] sm:text-left">
                            {isAmount
                              ? `${displayValue(field, computed, { periodKey, orgName, taxCode, filingKind }, t, lang)} ${t("accounting.txn.unit.vnd")}`
                              : displayValue(field, computed, { periodKey, orgName, taxCode, filingKind }, t, lang)}
                          </p>
                          <p className="text-xs text-[#3D4B63]">
                            {t("accounting.vat.preview.source")}: {sourceLabel(t, cell?.source)}
                          </p>
                        </div>
                        {cell?.txn_ids?.length ? (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {cell.txn_ids.map((id) => (
                              <Link
                                key={id}
                                href={`/company/accounting/transactions/${id}`}
                                className="text-xs font-semibold text-[#071A33] underline"
                              >
                                {t("accounting.vat.link.txn")}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {formStatus === "pending_verification" && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${LEVEL_CLASS.mid}`}>
                    {t("accounting.vat.banner.pending_form")}
                  </div>
                )}
              </div>
            ) : null}
            {!showPreview && step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[#3D4B63]">
                  <span className="text-red-600">*</span> {t("accounting.vat.field.period")}
                </p>
                <input
                  className="w-full rounded-lg border border-[#E3E8F0] px-3 py-2"
                  value={periodKey}
                  onChange={(e) => setPeriodKeyDraft(e.target.value)}
                  placeholder={t("accounting.vat.period.placeholder")}
                />
                <p className="text-sm font-semibold text-[#071A33]">{orgName}</p>
                <p className="text-sm text-[#3D4B63]">{taxCode}</p>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold">{t("accounting.vat.filing.kind")}</legend>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={filingKind === "regular"}
                      onChange={() => setFilingKind("regular")}
                    />
                    {t("accounting.vat.filing.regular")}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={filingKind === "amended"}
                      onChange={() => setFilingKind("amended")}
                    />
                    {t("accounting.vat.filing.amended")}
                  </label>
                </fieldset>
              </div>
            )}
            {!showPreview && step >= 2 && step <= 4 && (STEP_FIELDS[step] ?? []).map(renderFieldRow)}
            {!showPreview && step === 5 && (
              <ul className="space-y-2">
                {precheck.length === 0 && (
                  <li className={`rounded-lg border px-3 py-2 text-sm ${LEVEL_CLASS.ok}`}>
                    {t("accounting.vat.check.none")}
                  </li>
                )}
                {precheck.map((item, idx) => (
                  <li key={idx} className={`rounded-lg border px-3 py-2 text-sm ${LEVEL_CLASS[item.level]}`}>
                    <p>{t(item.messageKey)}</p>
                    {item.txnIds?.map((id) => (
                      <Link
                        key={id}
                        href={`/company/accounting/transactions/${id}`}
                        className="mt-1 inline-block text-xs font-semibold underline"
                      >
                        {t("accounting.vat.link.txn")}
                      </Link>
                    ))}
                  </li>
                ))}
              </ul>
            )}
            {!showPreview && step === 6 && (
              <div className="space-y-3">
                <p className="text-sm text-[#3D4B63]">{t("accounting.vat.step6.lead")}</p>
                <p className="text-sm font-semibold text-[#071A33]">
                  {t("accounting.vat.status")}: {declStatus || "—"}
                </p>
                <button
                  type="button"
                  disabled={busy || role !== "company_owner" || vatMethod === "direct"}
                  onClick={requestReview}
                  className="min-h-11 rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {t("accounting.vat.action.request_review")}
                </button>
                {role !== "company_owner" && (
                  <p className="text-xs text-[#3D4B63]">{t("accounting.vat.error.owner_only")}</p>
                )}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
              onClick={saveLocalDraft}
            >
              {t("accounting.vat.action.save_local")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
              onClick={loadLocalDraft}
            >
              {t("accounting.vat.action.load_local")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
              onClick={() => runDraft()}
              disabled={busy || !periodKey || vatMethod === "direct"}
            >
              {t("accounting.vat.action.draft")}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-4 text-sm font-semibold"
              onClick={async () => {
                if (!Object.keys(computed).length && periodKey) await runDraft();
                setShowPreview(true);
              }}
              disabled={!periodKey || fieldMap.length === 0}
            >
              {t("accounting.vat.action.preview")}
            </button>
          </div>
        </main>

        <aside className="w-full lg:w-80">
          <button
            type="button"
            className="mb-2 w-full rounded-lg border border-[#E3E8F0] bg-white px-3 py-2 text-left text-sm font-semibold lg:hidden"
            onClick={() => setHelpOpen((v) => !v)}
          >
            {t("accounting.vat.help.toggle")}
          </button>
          <div className={`rounded-xl border border-[#E3E8F0] bg-white p-4 ${helpOpen ? "block" : "hidden lg:block"}`}>
            <h2 className="font-bold text-[#071A33]">{t("accounting.vat.help.title")}</h2>
            <p className="mt-2 text-sm text-[#3D4B63]">{t(`accounting.vat.help.step${step}` as AccountingMessageKey)}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-[#3D4B63]">
              <li>{t("accounting.vat.help.ref1")}</li>
              <li>{t("accounting.vat.help.ref2")}</li>
              <li>{t("accounting.vat.help.ref3")}</li>
            </ol>
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#071A33]">{t("accounting.ledger.font_size")}</p>
              <div className="mt-2 flex gap-2">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      fontSize === size ? "bg-[#071A33] text-white" : "bg-[#F7F9FC] text-[#3D4B63]"
                    }`}
                  >
                    {t(`accounting.ledger.font.${size}` as AccountingMessageKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="sticky bottom-0 border-t border-[#E3E8F0] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl justify-between gap-3">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-lg border border-[#E3E8F0] bg-white text-sm font-semibold"
            disabled={step <= 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            {t("accounting.vat.action.prev")}
          </button>
          <button
            type="button"
            className="min-h-11 flex-1 rounded-lg bg-[#071A33] text-sm font-semibold text-white"
            disabled={step >= 6}
            onClick={async () => {
              if (step === 3) await runDraft();
              const next = Math.min(6, step + 1);
              goToStep(next);
            }}
          >
            {t("accounting.vat.action.next")}
          </button>
        </div>
      </footer>
    </div>
  );
}
