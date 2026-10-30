"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { accountingSupabase as supabase } from "@/lib/accounting/accountingSupabaseClient";
import { useAccountingCatalogLocale } from "@/lib/accounting/AccountingCatalogLocale";
import { AccountingViTextDisplay } from "@/lib/accounting/AccountingViTextDisplay";
import {
  accountingMessage,
  type AccountingLocale,
  type AccountingMessageKey,
} from "@/lib/accounting/uiCatalog";
import { isPeriodBeforeGtgt01Tt89, type VatCalendarPeriod } from "@/lib/accounting/gtgt01FormPeriod";
import type { VatFieldMapEntry } from "@/lib/accounting/vatDeclarationEntry";
import { AccountingFormBasisFooter } from "@/lib/accounting/AccountingFormBasisFooter";
import { AccountingFormViewBar } from "@/lib/accounting/AccountingFormViewBar";
import {
  loadFormViewMode,
  saveFieldViewMode,
  type AccountingFormViewMode,
} from "@/lib/accounting/accountingFormViewMode";
import { vatFieldLabel } from "@/lib/accounting/accountingFieldLabels";
import { AccountingI18nField } from "@/lib/accounting/AccountingI18nField";
import type { I18nLang } from "@/lib/accounting/accountingI18nTexts";
import { accountingAuthFetch } from "@/lib/accounting/authFetch";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import {
  isRawUserIdAuthorLabel,
  vatAuthorRoleMessageKey,
  VAT_AUTHOR_ROLE_CODES,
  VAT_DECLARATION_STATUS_CODES,
  vatDeclarationStatusMessageKey,
  vatPrecheckNeedsNoTxnWarning,
} from "@/lib/accounting/vatPrecheckUi";
import { stepMemoField, type VatWizardState } from "@/lib/accounting/vatWizard";
import type { AccountingFieldViewMode } from "@/lib/accounting/accountingFormViewMode";
import { AccountingTaxSubnav } from "@/lib/accounting/AccountingTaxSubnav";

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
  const { locale } = useAccountingCatalogLocale();
  const lang = uiLocale(locale);
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);

  const [phase, setPhase] = useState<"loading" | "signed_out" | "denied" | "ready">("loading");
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1);
  const urlPeriodKey = searchParams.get("periodKey") ?? searchParams.get("period") ?? "";
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
  const [vatPeriod, setVatPeriod] = useState<VatCalendarPeriod>("month");
  const [periodGuardBlocked, setPeriodGuardBlocked] = useState(false);
  const [notice, setNotice] = useState<AccountingMessageKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [precheck, setPrecheck] = useState<
    { level: keyof typeof LEVEL_CLASS; messageKey: AccountingMessageKey; txnIds?: string[] }[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<AccountingFormViewMode>("bilingual");
  const [declUpdatedAt, setDeclUpdatedAt] = useState<string | null>(null);
  const [wizardLocked, setWizardLocked] = useState(false);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [displayRoles, setDisplayRoles] = useState<Record<string, string>>({});
  const [precheckNoTxnWarning, setPrecheckNoTxnWarning] = useState(false);
  const [serverStepMemos, setServerStepMemos] = useState<Record<string, { ko?: string; vi?: string }>>({});
  const [memoDrafts, setMemoDrafts] = useState<Record<number, string>>({});
  const [memoLangs, setMemoLangs] = useState<Record<number, I18nLang>>({});
  const [memoFieldViews, setMemoFieldViews] = useState<Record<number, AccountingFieldViewMode>>({});
  const [reviewComments, setReviewComments] = useState<
    {
      id: string;
      kind: string;
      status: string;
      body: { ko?: string; vi?: string };
      translationPending?: { ko: boolean; vi: boolean };
      viStatus?: string;
      viVersion?: number;
    }[]
  >([]);

  const [conflictSnapshot, setConflictSnapshot] = useState<{
    step: number;
    periodKey: string;
    filingKind: string;
    memo: string;
  } | null>(null);
  const [wizardMeta, setWizardMeta] = useState<VatWizardState | null>(null);

  const periodBlockedUi = useMemo(() => {
    if (!periodKey) return periodGuardBlocked;
    return periodGuardBlocked || isPeriodBeforeGtgt01Tt89(periodKey, vatPeriod);
  }, [periodGuardBlocked, periodKey, vatPeriod]);

  const mapByCode = useMemo(() => {
    const m = new Map<string, VatFieldMapEntry>();
    for (const f of fieldMap) m.set(f.code, f);
    return m;
  }, [fieldMap]);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const wizardReadOnly = wizardLocked || declStatus === "expert_review" || declStatus === "filed_manual";

  function applyDeclarationPayload(json: {
    declaration?: {
      id?: string;
      status?: string;
      computed?: { fields?: ComputedFields; warnings?: string[] };
      updated_at?: string;
    } | null;
    wizard?: VatWizardState | null;
    stepMemos?: Record<string, { ko?: string; vi?: string }>;
    displayNames?: Record<string, string>;
    displayRoles?: Record<string, string>;
    wizardLocked?: boolean;
  }) {
    if (json.declaration) {
      setDeclarationId(json.declaration.id ?? null);
      setDeclStatus(json.declaration.status ?? "");
      const comp = json.declaration.computed as { fields?: ComputedFields; warnings?: string[] } | undefined;
      setComputed(comp?.fields ?? {});
      setWarnings(comp?.warnings ?? []);
      setDeclUpdatedAt(json.declaration.updated_at ?? null);
    }
    setWizardLocked(Boolean(json.wizardLocked));
    setDisplayNames(json.displayNames ?? {});
    setDisplayRoles(json.displayRoles ?? {});
    setServerStepMemos(json.stepMemos ?? {});
    if (json.wizard) {
      setWizardMeta(json.wizard);
      setStep(json.wizard.step);
      setFilingKind(json.wizard.filingKind);
      if (json.wizard.periodKey) setPeriodKeyDraft(json.wizard.periodKey);
    }
    const memos = json.stepMemos ?? {};
    setMemoDrafts((prev) => {
      const next = { ...prev };
      for (let s = 1; s <= 6; s += 1) {
        const pack = memos[stepMemoField(s)];
        const text = pack?.ko ?? pack?.vi ?? "";
        if (!next[s] && text) next[s] = text;
      }
      return next;
    });
  }

  function formatWizardTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    if (lang === "vi") {
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function formatDeclStatus(status: string): string {
    if (!status) return "—";
    if ((VAT_DECLARATION_STATUS_CODES as readonly string[]).includes(status)) {
      return t(vatDeclarationStatusMessageKey(status) as AccountingMessageKey);
    }
    return status;
  }

  function resolveAuthorLabel(savedBy: string): string {
    const profileName = displayNames[savedBy]?.trim();
    if (profileName && !isRawUserIdAuthorLabel(profileName)) return profileName;
    const role = displayRoles[savedBy];
    if (role && (VAT_AUTHOR_ROLE_CODES as readonly string[]).includes(role)) {
      return t(vatAuthorRoleMessageKey(role) as AccountingMessageKey);
    }
    return t("accounting.vat.author.unknown");
  }

  function renderStepMeta(stepNo: number) {
    const meta = wizardMeta?.steps[String(stepNo)];
    if (!meta) return null;
    const name = resolveAuthorLabel(meta.savedBy);
    const langLabel =
      meta.lang === "vi" ? t("accounting.input_lang.vi") : t("accounting.input_lang.ko");
    const line = t("accounting.vat.wizard.last_saved")
      .replace("{name}", name)
      .replace("{lang}", langLabel)
      .replace("{time}", formatWizardTime(meta.savedAt));
    return <p className="text-xs text-[#6B7A94]">{line}</p>;
  }

  function renderStepMemo(stepNo: number) {
    const fieldId = `vat.step_memo.${stepNo}`;
    const saved = serverStepMemos[stepMemoField(stepNo)];
    const inputLang = memoLangs[stepNo] ?? lang;
    const fieldView = memoFieldViews[stepNo] ?? "follow";
    return (
      <AccountingI18nField
        fieldId={fieldId}
        labelKey="accounting.vat.wizard.memo"
        locale={lang}
        userId={userId}
        inputLang={inputLang}
        onInputLangChange={(l) => setMemoLangs((m) => ({ ...m, [stepNo]: l }))}
        fieldView={fieldView}
        onFieldViewChange={(mode) => {
          setMemoFieldViews((m) => ({ ...m, [stepNo]: mode }));
          if (userId) saveFieldViewMode(userId, fieldId, mode);
        }}
        value={memoDrafts[stepNo] ?? ""}
        onChange={(v) => setMemoDrafts((m) => ({ ...m, [stepNo]: v }))}
        readOnly={wizardReadOnly}
        saved={saved}
        rows={2}
      />
    );
  }

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
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      setUserId(uid);
      setViewMode(loadFormViewMode(uid));
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
    setVatPeriod(json.org?.vat_period === "quarter" ? "quarter" : "month");
    setPeriodGuardBlocked(Boolean(json.periodGuard?.blocked));
    setFieldMap(json.form?.fields ?? []);
    setFormStatus(json.form?.status ?? "");
    applyDeclarationPayload(json);
  }, [authHeaders, periodKey, token]);

  const persistWizard = useCallback(
    async (stepToSave: number, opts?: { nextStep?: number }) => {
      if (!token || wizardReadOnly || !periodKey) return true;
      const res = await fetch("/api/accounting/vat/wizard", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          declarationId: declarationId ?? undefined,
          periodKey,
          step: stepToSave,
          filingKind,
          stepMemo: memoDrafts[stepToSave] ?? "",
          stepMemoLang: memoLangs[stepToSave] ?? lang,
          expectedUpdatedAt: declUpdatedAt,
          expectedRevision: wizardMeta?.revision ?? 0,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        server?: { wizard: VatWizardState | null; updatedAt: string | null };
        declarationId?: string;
        updatedAt?: string;
        wizard?: VatWizardState;
      };
      if (!res.ok) {
        if (json.error === "CONCURRENT_SAVE") {
          setNotice("accounting.vat.error.wizard_conflict");
          setConflictSnapshot({
            step: stepToSave,
            periodKey,
            filingKind,
            memo: memoDrafts[stepToSave] ?? "",
          });
          if (json.server?.wizard) {
            setWizardMeta(json.server.wizard);
            setFilingKind(json.server.wizard.filingKind);
            if (json.server.wizard.periodKey) setPeriodKeyDraft(json.server.wizard.periodKey);
          }
          if (json.server?.updatedAt) setDeclUpdatedAt(json.server.updatedAt);
          await loadContext();
          return false;
        }
        if (json.error === "WIZARD_LOCKED") setNotice("accounting.vat.error.wizard_locked");
        return false;
      }
      setConflictSnapshot(null);
      if (json.declarationId) setDeclarationId(json.declarationId);
      if (json.updatedAt) setDeclUpdatedAt(json.updatedAt);
      if (json.wizard) setWizardMeta(json.wizard);
      if (opts?.nextStep) setStep(opts.nextStep);
      await loadContext();
      return true;
    },
    [
      authHeaders,
      declarationId,
      declUpdatedAt,
      filingKind,
      lang,
      loadContext,
      memoDrafts,
      memoLangs,
      periodKey,
      token,
      wizardMeta?.revision,
      wizardReadOnly,
    ]
  );

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
      setVatPeriod(json.org?.vat_period === "quarter" ? "quarter" : "month");
      setPeriodGuardBlocked(Boolean(json.periodGuard?.blocked));
      setFieldMap(json.form.fields ?? []);
      setFormStatus(json.form.status ?? "");
      applyDeclarationPayload(json);
      if (!json.wizard) {
        const raw = localStorage.getItem("accounting.vat.draft");
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { periodKey?: string; filingKind?: string; step?: number };
            if (parsed.periodKey && !periodKeyDraft) setPeriodKeyDraft(parsed.periodKey);
            if (parsed.filingKind === "amended" || parsed.filingKind === "regular") setFilingKind(parsed.filingKind);
            if (parsed.step && parsed.step >= 1 && parsed.step <= 6) setStep(parsed.step);
          } catch {
            /* ignore */
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- local draft fallback only when server wizard absent
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
      } else if (json.error === "PERIOD_BEFORE_TT89") {
        setNotice("accounting.vat.error.period_before_tt89");
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
      setPrecheckNoTxnWarning(true);
      setPrecheck(items);
      return;
    }
    const { count: periodTxnCount } = await supabase
      .from("accounting_transactions")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("period_key", periodKey)
      .neq("status", "cancelled");
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
    setPrecheckNoTxnWarning(vatPrecheckNeedsNoTxnWarning(periodTxnCount ?? 0));
    setPrecheck(items);
  }, [computed, orgId, periodKey, token, warnings]);

  const goToStep = (n: number) => {
    if (wizardReadOnly) {
      setStep(n);
      if (n === 5) void buildPrecheck();
      return;
    }
    void (async () => {
      setBusy(true);
      const ok = await persistWizard(step, { nextStep: n });
      setBusy(false);
      if (ok) {
        setStep(n);
        if (n === 5) void buildPrecheck();
      }
    })();
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
    if (periodBlockedUi) {
      setNotice("accounting.vat.error.period_before_tt89");
      return;
    }
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

  const loadReviewComments = useCallback(async () => {
    if (!declarationId) return;
    const res = await accountingAuthFetch(
      `/api/accounting/review-comments?declarationId=${encodeURIComponent(declarationId)}`
    );
    if (!res.ok) return;
    const json = (await res.json()) as { comments?: typeof reviewComments };
    setReviewComments(json.comments ?? []);
  }, [declarationId]);

  useEffect(() => {
    if (!declarationId || (declStatus !== "expert_review" && declStatus !== "ready")) return;
    void loadReviewComments();
  }, [declarationId, declStatus, loadReviewComments]);

  const resolveReviewComment = async (commentId: string) => {
    if (role !== "company_owner") return;
    const res = await accountingAuthFetch("/api/accounting/review-comments/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (!res.ok) {
      setNotice("accounting.vat.error.generic");
      return;
    }
    await loadReviewComments();
  };

  const approveReady = async () => {
    if (!declarationId || role !== "company_owner") {
      setNotice("accounting.vat.error.owner_only");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/accounting/vat/expert-review", {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_ready", declarationId }),
    });
    setBusy(false);
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      if (body.error === "OPEN_COMMENTS") {
        setNotice("accounting.vat.error.open_comments");
        return;
      }
      setNotice("accounting.vat.error.generic");
      return;
    }
    setDeclStatus("ready");
    setNotice("accounting.vat.approve_ready_ok");
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
        <p className="font-semibold text-[#071A33]">{vatFieldLabel(field, viewMode, lang)}</p>
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

          <AccountingTaxSubnav />

          {token ? (
            <AccountingFormViewBar locale={lang} userId={userId} mode={viewMode} onChange={setViewMode} />
          ) : null}

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

          {conflictSnapshot ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-[#071A33]">
              <p className="font-semibold">{t("accounting.vat.wizard.conflict_local")}</p>
              <p className="mt-1 text-xs text-[#3D4B63]">
                step {conflictSnapshot.step} · {conflictSnapshot.periodKey} · {conflictSnapshot.filingKind}
              </p>
              {conflictSnapshot.memo ? (
                <p className="mt-1 whitespace-pre-wrap text-xs">{conflictSnapshot.memo}</p>
              ) : null}
            </div>
          ) : null}

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
                {renderStepMeta(1)}
                <p className="text-sm text-[#3D4B63]">
                  <span className="text-red-600">*</span> {t("accounting.vat.field.period")}
                </p>
                <input
                  className="w-full rounded-lg border border-[#E3E8F0] px-3 py-2"
                  value={periodKey}
                  disabled={wizardReadOnly}
                  onChange={(e) => setPeriodKeyDraft(e.target.value)}
                  placeholder={t("accounting.vat.period.placeholder")}
                />
                <p className="text-sm font-semibold text-[#071A33]">{orgName}</p>
                <p className="text-sm text-[#3D4B63]">{taxCode}</p>
                {periodBlockedUi && (
                  <div
                    data-testid="accounting-vat-period-guard"
                    className={`rounded-lg border px-4 py-3 text-sm ${LEVEL_CLASS.mid}`}
                  >
                    {t("accounting.vat.guard.period_before_tt89")}
                  </div>
                )}
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
                {renderStepMemo(1)}
              </div>
            )}
            {!showPreview && step >= 2 && step <= 4 && (
              <div className="space-y-3">
                {renderStepMeta(step)}
                {(STEP_FIELDS[step] ?? []).map(renderFieldRow)}
                {renderStepMemo(step)}
              </div>
            )}
            {!showPreview && step === 5 && (
              <div className="space-y-3">
                {renderStepMeta(5)}
              <ul className="space-y-2">
                {precheckNoTxnWarning && precheck.length === 0 && (
                  <li className={`rounded-lg border px-3 py-2 text-sm ${LEVEL_CLASS.mid}`}>
                    <p>{t("accounting.vat.check.no_txns")}</p>
                    <Link
                      href={ACCOUNTING_ROUTES.transactions}
                      className="mt-1 inline-block text-xs font-semibold underline"
                    >
                      {t("accounting.vat.link.transactions_hub")}
                    </Link>
                  </li>
                )}
                {!precheckNoTxnWarning && precheck.length === 0 && (
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
                {renderStepMemo(5)}
              </div>
            )}
            {!showPreview && step === 6 && (
              <div className="space-y-3">
                {renderStepMeta(6)}
                <p className="text-sm text-[#3D4B63]">{t("accounting.vat.step6.lead")}</p>
                <p className="text-sm font-semibold text-[#071A33]">
                  {t("accounting.vat.status")}: {formatDeclStatus(declStatus)}
                </p>
                {declStatus === "expert_review" && formStatus !== "pending_verification" ? (
                  <button
                    type="button"
                    disabled={busy || role !== "company_owner"}
                    onClick={approveReady}
                    className="min-h-11 rounded-lg bg-[#0F6B3E] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    data-testid="vat-approve-ready"
                  >
                    {t("accounting.vat.approve_ready")}
                  </button>
                ) : declStatus === "expert_review" ? null : (
                  <button
                    type="button"
                    disabled={busy || role !== "company_owner" || vatMethod === "direct" || periodBlockedUi}
                    onClick={requestReview}
                    className="min-h-11 rounded-lg bg-[#071A33] px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {t("accounting.vat.action.request_review")}
                  </button>
                )}
                {role !== "company_owner" && (
                  <p className="text-xs text-[#3D4B63]">{t("accounting.vat.error.owner_only")}</p>
                )}
                {(declStatus === "expert_review" || declStatus === "ready") && declarationId ? (
                  <section
                    className="mt-4 rounded-xl border border-[#E3E8F0] bg-[#F7F9FC] p-4"
                    data-testid="vat-review-comments"
                  >
                    <h3 className="text-sm font-extrabold text-[#071A33]">
                      {t("accounting.vat.review_comments.title")}
                    </h3>
                    {reviewComments.length === 0 ? (
                      <p className="mt-2 text-sm text-[#3D4B63]">{t("accounting.vat.review_comments.empty")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm">
                        {reviewComments.map((c) => (
                          <li key={c.id} className="rounded-lg bg-white p-3">
                            <p className="text-xs text-[#6B7A90]">{c.kind} · {c.status}</p>
                            <AccountingViTextDisplay
                              locale={lang}
                              displayLang={lang}
                              body={c.body}
                              viSlot={
                                c.body.vi
                                  ? { text: c.body.vi, status: c.viStatus ?? "machine", version: c.viVersion }
                                  : null
                              }
                              translationPending={c.translationPending?.[lang]}
                              entityType="review_comment"
                              entityId={c.id}
                              field="body"
                              showConfirm={role === "company_member" && lang === "vi"}
                              onConfirmed={() => void loadReviewComments()}
                            />
                            {role === "company_owner" && c.status === "open" ? (
                              <button
                                type="button"
                                className="mt-2 min-h-11 rounded-lg border border-[#E3E8F0] bg-white px-3 text-xs font-semibold"
                                onClick={() => void resolveReviewComment(c.id)}
                              >
                                {t("accounting.vat.review_comments.resolve")}
                              </button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ) : null}
                {renderStepMemo(6)}
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
              disabled={busy || !periodKey || vatMethod === "direct" || periodBlockedUi}
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
            disabled={step >= 6 || (step === 1 && periodBlockedUi)}
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
      {token ? (
        <div className="mx-auto max-w-6xl px-4 pb-6 lg:px-6">
          <AccountingFormBasisFooter kind="vat_gtgt" locale={lang} token={token} />
        </div>
      ) : null}
    </div>
  );
}
