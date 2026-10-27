import { NextResponse } from "next/server";
import { createAdminRouteClient } from "@/lib/adminAuth/routeClient";
import { isDevAccountingLoginEnabled } from "@/lib/accounting/devLocalLogin";

/** Dev-only: read HttpOnly cookie session set by Server Action login; client mirrors it via setSession. */
export async function GET() {
  if (!isDevAccountingLoginEnabled()) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const supabase = await createAdminRouteClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token || !data.session.refresh_token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
