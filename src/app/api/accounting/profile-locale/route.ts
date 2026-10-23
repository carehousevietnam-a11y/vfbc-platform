import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const { data: userData, error: userError } = await session.client.auth.getUser(session.token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { data: profile } = await session.client
    .from("accounting_profiles")
    .select("locale")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  const locale = profile?.locale === "vi" ? "vi" : "ko";
  return NextResponse.json({ locale });
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { locale?: string } | null;
  const locale = body?.locale === "vi" ? "vi" : body?.locale === "ko" ? "ko" : null;
  if (!locale) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  const { data: userData, error: userError } = await session.client.auth.getUser(session.token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const { error } = await session.client.from("accounting_profiles").upsert(
    { user_id: userData.user.id, locale },
    { onConflict: "user_id" }
  );
  if (error) return NextResponse.json({ error: "SAVE_FAILED" }, { status: 400 });
  return NextResponse.json({ ok: true, locale });
}
