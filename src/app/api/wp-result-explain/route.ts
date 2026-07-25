// src/app/api/wp-result-explain/route.ts
//
// OpenAI 연동 1단계: CHECK-WP 결과를 고객이 이해하기 쉽게 "설명"만 하는
// API Route. 점수·톤·체크리스트는 이미 checkDiagnosis.ts(computeWpResultTone
// + getCheckDiagnosis)가 계산을 끝낸 결과이며, 이 라우트는 그 결과를 새로
// 계산하거나 수정하지 않는다 — OpenAI에게는 "이미 나온 결과를 쉬운 말로
// 풀어서 설명해달라"는 역할만 맡긴다.
//
// 개인정보(이름/전화번호/주소/이메일 등)는 절대 전달하지 않는다. 전달하는
// 필드는 WP 진단에 쓰인 값과 결과값뿐이다:
//   feasibilityScore, resultTone, checklist, estimatedDays,
//   education, experience, priorityField, job,
//   previousRejection, rejectionReason
//
// OpenAI 호출은 lib/aiGateway.ts의 callOpenAiAnalysis()를 재사용한다
// (fetch/오류처리/로깅 로직을 새로 만들지 않음 — 기존 /api/ai-chat과 동일한
// 저수준 호출 함수를 공유). JSON 전용 응답을 받기 위해 callOpenAiAnalysis에
// responseFormat: "json_object" 옵션만 추가로 전달한다(기존 호출부는 영향 없음).
//
// 이번 단계 범위: OpenAI가 정상적으로 JSON을 반환하는 것까지만. 결과 화면
// UI, 버튼, DB, CRM, Email은 이 작업에서 전혀 건드리지 않는다.

import { NextRequest, NextResponse } from "next/server";
import { callOpenAiAnalysis, type OpenAiChatMessage } from "@/lib/aiGateway";
import type {
  WpEducation,
  WpExperience,
  WpJob,
  WpPriorityField,
} from "@/lib/checkDiagnosis";

type ChecklistItem = { label: string; passed: boolean };
type EstimatedDays = { min: number; max: number } | null;

type WpResultExplainRequest = {
  feasibilityScore?: number;
  resultTone?: "possible" | "conditional" | "impossible";
  checklist?: ChecklistItem[];
  estimatedDays?: EstimatedDays;
  education?: WpEducation;
  experience?: WpExperience;
  priorityField?: WpPriorityField;
  job?: WpJob;
  previousRejection?: boolean | null;
  rejectionReason?: string | null;
};

// 반환 스키마 — 지시받은 5개 필드 고정.
type WpResultExplainResponse = {
  summary: string;
  riskFactors: string;
  documentGuidance: string;
  processingTimeComment: string;
  aiOpinion: string;
};

function buildSystemPrompt(): string {
  return `당신은 VFBCAI의 베트남 노동허가(Work Permit, WP) 결과 설명 도우미입니다.

역할과 제약사항을 반드시 지키세요:
- 아래 사용자 메시지로 전달되는 진단 결과(feasibilityScore, resultTone, checklist,
  estimatedDays 등)는 이미 규칙 기반 로직으로 계산이 끝난 최종 결과입니다.
- 당신은 점수나 발급 가능 여부를 새로 계산하거나 판정을 바꾸지 않습니다.
  오직 주어진 결과를 고객이 이해하기 쉬운 한국어로 "설명"하는 역할만 합니다.
- 확정적인 법률 자문이나 100% 보장하는 표현을 쓰지 마세요("반드시 승인됩니다" 등 금지).
- 실제 발급 여부는 서류 검토와 전문가 상담을 통해 확정된다는 점을 aiOpinion에
  자연스럽게 포함하세요.
- 반드시 아래 JSON 형식으로만 응답하세요. 코드블록, 마크다운, 설명 문구 없이
  순수한 JSON 객체 하나만 출력하세요.

{
  "summary": "전체 결과를 2~3문장으로 쉽게 설명",
  "riskFactors": "체크리스트에서 충족되지 않은 항목이 있다면 무엇이 문제인지 쉽게 설명. 없으면 특별한 위험요인이 없다고 안내",
  "documentGuidance": "현재 조건에서 준비하면 좋은 서류 방향에 대한 일반적인 안내",
  "processingTimeComment": "예상 처리기간에 대한 설명",
  "aiOpinion": "AI로서의 종합 의견과 다음 행동 권장(전문가 상담 권유 포함)"
}`;
}

function buildUserPrompt(data: WpResultExplainRequest): string {
  const payload = {
    feasibilityScore: data.feasibilityScore ?? null,
    resultTone: data.resultTone ?? null,
    checklist: data.checklist ?? [],
    estimatedDays: data.estimatedDays ?? null,
    education: data.education ?? null,
    experience: data.experience ?? null,
    priorityField: data.priorityField ?? null,
    job: data.job ?? null,
    previousRejection: data.previousRejection ?? null,
    rejectionReason: data.rejectionReason ?? null,
  };

  return `다음은 노동허가(WP) 진단 결과 데이터입니다. 이 데이터를 기준으로만 설명해주세요. 새로운 점수나 판정을 만들지 마세요.\n\n${JSON.stringify(
    payload,
    null,
    2
  )}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WpResultExplainRequest;

    if (
      typeof body.feasibilityScore !== "number" ||
      !body.resultTone ||
      !Array.isArray(body.checklist)
    ) {
      return NextResponse.json(
        { error: "필수 진단 결과 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("wp-result-explain: OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "AI 설명 기능을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }
    const model = process.env.OPENAI_MODEL;
    if (!model) {
      console.error("wp-result-explain: OPENAI_MODEL 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "AI 설명 설정을 확인 중입니다." },
        { status: 503 }
      );
    }

    const openaiMessages: OpenAiChatMessage[] = [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(body) },
    ];

    const result = await callOpenAiAnalysis({
      apiKey,
      model,
      openaiMessages,
      responseFormat: "json_object",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "AI 설명 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: result.status }
      );
    }

    let parsed: WpResultExplainResponse;
    try {
      parsed = JSON.parse(result.rawReply);
    } catch (parseErr) {
      console.error("wp-result-explain: JSON 파싱 실패, rawReply =", result.rawReply);
      return NextResponse.json(
        { error: "AI 응답 형식을 처리하지 못했습니다." },
        { status: 502 }
      );
    }

    const {
      summary,
      riskFactors,
      documentGuidance,
      processingTimeComment,
      aiOpinion,
    } = parsed;

    if (
      typeof summary !== "string" ||
      typeof riskFactors !== "string" ||
      typeof documentGuidance !== "string" ||
      typeof processingTimeComment !== "string" ||
      typeof aiOpinion !== "string"
    ) {
      console.error("wp-result-explain: 응답 필드 누락, parsed =", parsed);
      return NextResponse.json(
        { error: "AI 응답 필드가 올바르지 않습니다." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      summary,
      riskFactors,
      documentGuidance,
      processingTimeComment,
      aiOpinion,
    });
  } catch (err) {
    console.error("wp-result-explain route error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
