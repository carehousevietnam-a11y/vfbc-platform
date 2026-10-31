import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  PRE_SIGNUP_PURGE_MAX_BATCH,
  runPreSignupDocumentPurge,
} from "@/lib/security/preSignupDocumentRetention";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function cronSecretConfigured(): string | null {
  const secret = process.env.CRON_SECRET?.trim();
  return secret ? secret : null;
}

function bearerTokenMatches(authHeader: string | null, secret: string): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length);
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(secret, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const secret = cronSecretConfigured();
  if (!secret) {
    return unauthorized();
  }

  const auth = req.headers.get("authorization");
  if (!bearerTokenMatches(auth, secret)) {
    return unauthorized();
  }

  try {
    const result = await runPreSignupDocumentPurge({ maxItems: PRE_SIGNUP_PURGE_MAX_BATCH });
    console.log(
      `[purge-pre-signup-documents] job=${result.jobId} deleted=${result.deletedCount} failed=${result.failedCount}`,
    );
    return NextResponse.json({
      ok: true,
      jobId: result.jobId,
      deleted: result.deletedCount,
      failed: result.failedCount,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "purge_failed" }, { status: 500 });
  }
}
