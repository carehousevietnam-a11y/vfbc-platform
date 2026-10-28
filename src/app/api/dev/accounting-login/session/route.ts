import { NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { isDevAccountingLoginEnabled } from "@/lib/accounting/devLocalLogin";

/** Dev-only: read HttpOnly cookie session set by Server Action login; client mirrors it via setSession. */
export async function GET() {
  if (!isDevAccountingLoginEnabled()) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const supabase = await createAdminRouteClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  let session = (await supabase.auth.getSession()).data.session;
  if (!session?.access_token || !session.refresh_token) {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
    if (!refreshErr && refreshed.session) session = refreshed.session;
  }

  if (!session?.access_token || !session.refresh_token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  return NextResponse.json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}
