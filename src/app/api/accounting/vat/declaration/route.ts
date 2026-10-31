import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { draftVatDeclaration, getVatDeclaration } from "@/lib/accounting/vatDeclarationEntry";

export async function GET(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const periodKey = req.nextUrl.searchParams.get("periodKey") ?? "";
  if (!periodKey) return NextResponse.json({ error: "PERIOD_REQUIRED" }, { status: 400 });
  const result = await getVatDeclaration(session.client, session.token, periodKey);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  const body = (await req.json()) as { periodKey?: string };
  const periodKey = body.periodKey ?? "";
  if (!periodKey) return NextResponse.json({ error: "PERIOD_REQUIRED" }, { status: 400 });
  const result = await draftVatDeclaration(session.client, session.token, periodKey);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, messageKey: result.messageKey },
      { status: result.status }
    );
  }
  return NextResponse.json(result);
}
