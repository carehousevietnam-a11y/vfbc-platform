import { NextResponse } from "next/server";

/** P6-2: resolved 처리는 company_owner만 (`/api/accounting/review-comments/resolve`). */
export async function POST() {
  return NextResponse.json({ error: "EXPERT_CANNOT_RESOLVE" }, { status: 403 });
}
