import { NextRequest, NextResponse } from "next/server";
import { accountingClientFromRequest } from "@/lib/accounting/requestUser";
import { saveVatWizard } from "@/lib/accounting/vatWizardEntry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = accountingClientFromRequest(req);
  if (!session) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "VALIDATION" }, { status: 422 });
  }

  const declarationId = typeof body.declarationId === "string" ? body.declarationId : undefined;
  const periodKey = typeof body.periodKey === "string" ? body.periodKey : undefined;
  if (!declarationId && !periodKey) return NextResponse.json({ error: "VALIDATION" }, { status: 422 });

  const step = Number(body.step);
  const filingKind = body.filingKind === "amended" ? "amended" : body.filingKind === "regular" ? "regular" : undefined;
  const stepMemo = typeof body.stepMemo === "string" ? body.stepMemo : undefined;
  const stepMemoLang = body.stepMemoLang === "vi" ? "vi" : body.stepMemoLang === "ko" ? "ko" : undefined;
  const expectedUpdatedAt =
    typeof body.expectedUpdatedAt === "string" ? body.expectedUpdatedAt : body.expectedUpdatedAt === null ? null : undefined;
  const expectedRevision =
    body.expectedRevision === null || body.expectedRevision === undefined
      ? undefined
      : Number(body.expectedRevision);

  const result = await saveVatWizard(session.client, session.token, {
    declarationId: declarationId ?? "",
    step,
    filingKind,
    periodKey,
    stepMemo,
    stepMemoLang,
    expectedUpdatedAt,
    expectedRevision: Number.isFinite(expectedRevision) ? expectedRevision : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, server: result.server ?? undefined },
      { status: result.status }
    );
  }
  return NextResponse.json(result);
}
