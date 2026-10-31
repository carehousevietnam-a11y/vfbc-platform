"use client";

import { useEffect } from "react";
import { ensureAccountingClientSession } from "./devClientSessionBootstrap";

/** Dev: mirror Server Action cookie session into browser Supabase client before accounting UI fetches. */
export function AccountingDevSessionBootstrap() {
  useEffect(() => {
    void ensureAccountingClientSession();
  }, []);
  return null;
}
