"use client";

import { useCallback, useEffect, useState } from "react";
import { accountingMessage, type AccountingLocale, type AccountingMessageKey } from "./uiCatalog";
import { formBasisMessageKey, type FormBasisKind, type FormBasisPayload } from "./accountingFormBasis";

function applyVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template
  );
}

type Props = {
  kind: FormBasisKind;
  locale: AccountingLocale;
  token: string;
};

export function AccountingFormBasisFooter({ kind, locale, token }: Props) {
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(locale, key), [locale]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/accounting/form-basis?kind=${kind}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || cancelled) return;
      const json = (await res.json()) as { basis: FormBasisPayload };
      const { key, vars } = formBasisMessageKey(json.basis);
      setText(applyVars(t(key), vars));
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, t, token]);

  if (!text) return null;
  return (
    <p className="text-[12px] leading-relaxed text-[#6B7A94]" data-testid="accounting-form-basis-footer">
      {text}
    </p>
  );
}
