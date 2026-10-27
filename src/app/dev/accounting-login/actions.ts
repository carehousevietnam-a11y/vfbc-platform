"use server";

import { redirect } from "next/navigation";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import {
  getDevAccountingLoginConfig,
  isDevAccountingLoginEnabled,
  resolveDevAccountingEmail,
} from "@/lib/accounting/devLocalLogin";

export async function submitDevAccountingLogin(formData: FormData) {
  if (!isDevAccountingLoginEnabled()) {
    redirect("/");
  }

  const account = String(formData.get("account") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const cfg = getDevAccountingLoginConfig();
  const email = resolveDevAccountingEmail(account);
  const expected = cfg?.password;

  if (!email || !expected || !password || password !== expected) {
    redirect("/dev/accounting-login?error=auth");
  }

  const supabase = await createAdminRouteClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/dev/accounting-login?error=auth");
  }

  redirect("/company/accounting/welcome");
}
