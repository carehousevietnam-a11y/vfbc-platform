"use client";

import { useState } from "react";
import { confirmAccountingViI18nTextAction } from "./confirmViI18nTextAction";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";

export type ViTextSlot = {
  text: string;
  status: "original" | "machine" | "human_verified" | string;
  version?: number;
};

type Props = {
  locale: AccountingLocale;
  displayLang: "ko" | "vi";
  body: { ko?: string; vi?: string };
  viSlot?: ViTextSlot | null;
  translationPending?: boolean;
  entityType: "transaction" | "review_comment";
  entityId: string;
  field: string;
  showConfirm: boolean;
  onConfirmed?: () => void;
};

function badgeKey(status: string): AccountingMessageKey {
  if (status === "human_verified") return "accounting.vi.verified";
  if (status === "machine") return "accounting.vi.machine";
  return "accounting.vi.original";
}

export function AccountingViTextDisplay({
  locale,
  displayLang,
  body,
  viSlot,
  translationPending,
  entityType,
  entityId,
  field,
  showConfirm,
  onConfirmed,
}: Props) {
  const t = (key: AccountingMessageKey) => accountingMessage(locale, key);
  const [busy, setBusy] = useState(false);
  const text =
    displayLang === "vi"
      ? body.vi ?? body.ko ?? "—"
      : body.ko ?? body.vi ?? "—";
  const pending = translationPending ?? (displayLang === "vi" ? !body.vi && !!body.ko : !body.ko && !!body.vi);
  const viStatus = viSlot?.status ?? (body.vi ? "machine" : "original");
  const showViBadge = displayLang === "vi" && !!body.vi;

  async function confirm() {
    setBusy(true);
    const res = await confirmAccountingViI18nTextAction({ entityType, entityId, field });
    setBusy(false);
    if (res.ok) onConfirmed?.();
  }

  const canConfirm =
    showConfirm &&
    displayLang === "vi" &&
    viSlot &&
    viSlot.status !== "human_verified" &&
    viSlot.text;

  return (
    <div className="text-sm text-[#071A33]">
      <p className="whitespace-pre-wrap">{text}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {pending ? (
          <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#92400E]">
            {t("accounting.ledger.badge.translation_pending")}
          </span>
        ) : null}
        {showViBadge ? (
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
              viStatus === "human_verified"
                ? "bg-[#E8F5EE] text-[#0F6B3E]"
                : viStatus === "machine"
                  ? "bg-[#FEF3C7] text-[#92400E]"
                  : "bg-[#E8EEF8] text-[#3D4B63]"
            }`}
            data-testid="accounting-vi-status-badge"
          >
            {t(badgeKey(viStatus))}
            {viSlot?.version ? ` · v${viSlot.version}` : ""}
          </span>
        ) : null}
      </div>
      {canConfirm ? (
        <button
          type="button"
          disabled={busy}
          className="mt-2 min-h-11 rounded-lg bg-[#071A33] px-4 text-xs font-semibold text-white disabled:opacity-50"
          data-testid="accounting-vi-confirm"
          onClick={() => void confirm()}
        >
          {t("accounting.vi.confirm")}
        </button>
      ) : null}
    </div>
  );
}
