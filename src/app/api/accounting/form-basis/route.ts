import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { loadFormBasis } from "@/lib/accounting/formBasisEntry";
import type { FormBasisKind } from "@/lib/accounting/accountingFormBasis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") ?? "";
  if (kind !== "vat_gtgt" && kind !== "ledger_tt99") {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
  }

  const basis = await loadFormBasis(session.client, kind as FormBasisKind);
  return NextResponse.json({ basis });
}
