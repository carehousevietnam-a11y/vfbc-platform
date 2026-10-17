import { NextRequest, NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import {
  getDevAccountingLoginConfig,
  isDevAccountingLoginEnabled,
  resolveDevAccountingEmail,
} from "@/lib/accounting/devLocalLogin";

export async function POST(req: NextRequest) {
  if (!isDevAccountingLoginEnabled()) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const account = typeof body?.account === "string" ? body.account.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const cfg = getDevAccountingLoginConfig();
  const email = resolveDevAccountingEmail(account);
  const expected = cfg?.password;

  if (!email || !expected || !password || password !== expected) {
    return NextResponse.json({ error: "로그인 정보를 확인해주세요." }, { status: 401 });
  }

  const supabase = await createAdminRouteClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: "로그인 정보를 확인해주세요." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    email,
    account,
    redirect: "/company/accounting/transactions",
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
}
