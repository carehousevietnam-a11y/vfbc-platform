import { NextRequest, NextResponse } from "next/server";
import { verifyOwnedLead } from "@/lib/aiCaseContext";
import {
  reviewLegalCase,
  type LegalRagAudience,
  type LegalRagServiceGroup,
} from "@/lib/legal-rag-client";

const SERVICE_GROUPS = new Set<LegalRagServiceGroup>(["check", "verify", "register"]);
const AUDIENCES = new Set<LegalRagAudience>(["all", "customer", "expert"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const accessToken = body.accessToken;
    const question = body.question;
    const language = body.language;
    const limit = body.limit;
    const audience = body.audience ?? "all";
    const context = body.context;

    if (!isNonEmptyString(question)) {
      return NextResponse.json({ ok: false, error: "question이 필요합니다." }, { status: 400 });
    }
    if (!isNonEmptyString(language)) {
      return NextResponse.json({ ok: false, error: "language가 필요합니다." }, { status: 400 });
    }
    if (!context || typeof context !== "object" || Array.isArray(context)) {
      return NextResponse.json({ ok: false, error: "context가 필요합니다." }, { status: 400 });
    }

    const rawContext = context as Record<string, unknown>;
    const leadId = rawContext.lead_id;
    const serviceType = rawContext.service_type;
    const serviceGroup = rawContext.service_group;
    const requestId = rawContext.request_id;

    if (!isNonEmptyString(leadId)) {
      return NextResponse.json({ ok: false, error: "context.lead_id가 필요합니다." }, { status: 400 });
    }
    if (!isNonEmptyString(serviceType)) {
      return NextResponse.json(
        { ok: false, error: "context.service_type이 필요합니다." },
        { status: 400 }
      );
    }
    if (!isNonEmptyString(serviceGroup) || !SERVICE_GROUPS.has(serviceGroup as LegalRagServiceGroup)) {
      return NextResponse.json(
        { ok: false, error: "context.service_group 값이 올바르지 않습니다." },
        { status: 400 }
      );
    }
    if (requestId !== undefined && !isNonEmptyString(requestId)) {
      return NextResponse.json(
        { ok: false, error: "context.request_id 값이 올바르지 않습니다." },
        { status: 400 }
      );
    }
    if (limit !== undefined && (!Number.isInteger(limit) || (limit as number) < 1 || (limit as number) > 100)) {
      return NextResponse.json({ ok: false, error: "limit은 1~100의 정수여야 합니다." }, { status: 400 });
    }
    if (!isNonEmptyString(audience) || !AUDIENCES.has(audience as LegalRagAudience)) {
      return NextResponse.json({ ok: false, error: "audience 값이 올바르지 않습니다." }, { status: 400 });
    }

    const ownership = await verifyOwnedLead(
      isNonEmptyString(accessToken) ? accessToken : undefined,
      leadId
    );
    if (!ownership.ok) {
      return NextResponse.json(
        { ok: false, error: ownership.error },
        { status: ownership.status }
      );
    }

    const result = await reviewLegalCase({
      question: question.trim(),
      language: language.trim(),
      ...(limit === undefined ? {} : { limit: limit as number }),
      audience: audience as LegalRagAudience,
      context: {
        lead_id: leadId.trim(),
        service_type: serviceType.trim(),
        service_group: serviceGroup as LegalRagServiceGroup,
        ...(isNonEmptyString(requestId) ? { request_id: requestId.trim() } : {}),
      },
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Legal RAG 요청을 처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
