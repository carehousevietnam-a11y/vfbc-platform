import fs from "fs";
import path from "path";

export type DevAccountingLoginAccount =
  | "org_a_owner"
  | "org_a_member"
  | "org_b_owner"
  | "vnk_expert";

export type DevAccountingLoginConfig = {
  password: string;
  accounts: Record<DevAccountingLoginAccount, string>;
  orgs: { a: { name_official: string; tax_code: string }; b: { name_official: string; tax_code: string } };
  mailOtpNote?: string;
};

let cached: DevAccountingLoginConfig | null | undefined;

export function isDevAccountingLoginEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  try {
    const host = new URL(raw).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

export function getDevAccountingLoginConfig(): DevAccountingLoginConfig | null {
  if (!isDevAccountingLoginEnabled()) return null;
  if (cached !== undefined) return cached;
  const filePath = path.join(process.cwd(), "src/lib/accounting/dev-local-login.config.json");
  if (!fs.existsSync(filePath)) {
    cached = null;
    return null;
  }
  try {
    cached = JSON.parse(fs.readFileSync(filePath, "utf8")) as DevAccountingLoginConfig;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function resolveDevAccountingEmail(account: string): string | null {
  const cfg = getDevAccountingLoginConfig();
  if (!cfg) return null;
  const key = account as DevAccountingLoginAccount;
  return cfg.accounts[key] ?? null;
}
