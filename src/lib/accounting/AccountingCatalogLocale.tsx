"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { accountingAuthFetch } from "./authFetch";
import type { AccountingLocale } from "./uiCatalog";

type Ctx = {
  locale: AccountingLocale;
  setLocale: (next: AccountingLocale) => Promise<void>;
  ready: boolean;
};

const AccountingCatalogLocaleContext = createContext<Ctx | null>(null);

export function AccountingCatalogLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AccountingLocale>("ko");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await accountingAuthFetch("/api/accounting/profile-locale");
      if (cancelled) return;
      if (res.ok) {
        const json = (await res.json()) as { locale?: string };
        setLocaleState(json.locale === "vi" ? "vi" : "ko");
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (next: AccountingLocale) => {
    setLocaleState(next);
    await accountingAuthFetch("/api/accounting/profile-locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
  }, []);

  return (
    <AccountingCatalogLocaleContext.Provider value={{ locale, setLocale, ready }}>
      {children}
    </AccountingCatalogLocaleContext.Provider>
  );
}

export function useAccountingCatalogLocale(): Ctx {
  const ctx = useContext(AccountingCatalogLocaleContext);
  if (!ctx) throw new Error("useAccountingCatalogLocale requires AccountingCatalogLocaleProvider");
  return ctx;
}
