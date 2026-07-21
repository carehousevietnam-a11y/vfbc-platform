// src/lib/aiGateway.ts
//
// STEP9: AI Gateway(Classifier). 고객 질문을 OpenAI를 부르기 전에 먼저
// 5가지로 분류하고, 그중 "AI 분석"만 실제로 OpenAI를 호출한다. 나머지
// 4가지(진행상황/시스템 기능/법률 판단/플랫폼 외 질문)는 이 파일의 규칙
// 기반 로직만으로 답을 만들어 OpenAI 호출 자체를 하지 않는다 — 비용 절감과
// 응답 속도뿐 아니라, OPENAI_API_KEY가 아직 없는 지금(Ace가 결제 전) 상태
// 에서도 진행상황 확인·플랫폼 안내·법률 상담 연결이 전부 정상 작동하게
// 만드는 것이 이 STEP의 핵심 목적이다.
//
// 분류는 LLM이 아니라 순수 규칙(키워드 매칭)으로만 한다 — 분류 자체가
// OpenAI를 호출하면 "OpenAI 호출 금지" 카테고리들의 의미가 없어진다.
// 키워드 목록은 완벽한 NLU가 아니라 실용적 휴리스틱이며, 애매하면 항상
// "ai_analysis"(기존 AI 흐름)로 폴백한다 — 기존 시스템 프롬프트가 이미
// 안전 경계(전문가 내부 데이터 미노출, 법률 확정 판단 금지, 범위 밖 질문
// 처리)를 갖추고 있으므로 오분류의 위험이 낮은 방향으로 기본값을 둔다.
//
// 우선순위: legal > off_platform > progress > system > ai_analysis(기본값)
// legal을 최우선으로 두는 이유: "전문가와 상담하고 싶습니다" 같은 문구가
// 다른 카테고리 키워드와 겹치더라도 항상 전문가 연결이 이겨야 한다.

import type { CaseContext } from "@/lib/aiCaseContext";
import { matchesEscalationKeyword } from "@/lib/aiCaseContext";

export type MessageCategory = "legal" | "off_platform" | "progress" | "system" | "ai_analysis";

// ── 진행상황 문의 키워드 ──
const PROGRESS_KEYWORDS = [
  "어디까지",
  "진행상황",
  "진행 상황",
  "진행이 어떻게",
  "얼마나 걸리",
  "소요 시간",
  "소요시간",
  "언제 끝",
  "언제쯤",
  "언제 나오",
  "정부 제출",
  "제출됐",
  "제출되었",
  "허가 완료",
  "허가났",
  "허가 났",
  "결과 나왔",
  "지금 단계",
  "몇 단계",
  "다음 단계",
  "허가증",
  "다운로드",
  "다운받",
];

// ── 플랫폼 사용법(시스템 기능) 문의 키워드 ──
const SYSTEM_KEYWORDS = [
  "이 채팅",
  "이 상담",
  "챗봇",
  "ai가 맞",
  "몇 시까지",
  "운영시간",
  "운영 시간",
  "카카오톡으로",
  "잘로로",
  "zalo",
  "연락처가",
  "전화번호가",
  "다른 신청",
  "로그인이 안",
  "비밀번호",
  "요금이 얼마",
  "비용이 얼마",
  "가격이 얼마",
  "수수료",
  "환불",
];

// ── 명백히 서비스와 무관한 화제(플랫폼 외 질문) 키워드 ──
// 오탐(false positive)을 줄이기 위해 사건 관련 맥락과 겹칠 가능성이 낮은
// 표현만 골랐다 — 애매한 문장은 여기 걸리지 않고 ai_analysis로 간다.
const OFF_PLATFORM_KEYWORDS = [
  "오늘 날씨",
  "내일 날씨",
  "환율이 얼마",
  "주식 시장",
  "축구 경기",
  "야구 경기",
  "영화 추천",
  "드라마 추천",
  "노래 추천",
  "레시피",
  "요리법",
  "여행지 추천",
  "맛집 추천",
  "코드 짜줘",
  "코딩해줘",
  "프로그램 짜줘",
  "파이썬",
  "자바스크립트",
  "대통령",
  "주가가",
];

function normalize(content: string): string {
  return content.toLowerCase();
}

function matchesAny(content: string, keywords: string[]): boolean {
  const normalized = normalize(content);
  return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
}

export function classifyMessage(content: string): MessageCategory {
  if (matchesEscalationKeyword(content)) return "legal";
  if (matchesAny(content, OFF_PLATFORM_KEYWORDS)) return "off_platform";
  if (matchesAny(content, PROGRESS_KEYWORDS)) return "progress";
  if (matchesAny(content, SYSTEM_KEYWORDS)) return "system";
  return "ai_analysis";
}

// ────────────────────────────────────────────────────────────────
// 진행상황 → 기존 DB 조회(aiCaseContext.buildCaseContext) 결과만으로 답변.
// OpenAI를 호출하지 않는다.
// ────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function buildProgressAnswer(context: CaseContext): string {
  const lines: string[] = [];
  lines.push(
    `현재 ${context.serviceLabel} 진행 단계는 "${context.currentStepLabel}"이며, 전체 진행률은 ${context.progressPercent}%입니다.`
  );

  if (context.governmentSubmittedAt) {
    lines.push(`정부 제출은 ${formatDate(context.governmentSubmittedAt)}에 완료되었습니다.`);
  }

  if (context.permitCompletedAt) {
    lines.push(
      `허가는 ${formatDate(context.permitCompletedAt)}에 완료되었습니다.` +
        (context.hasPermitFile
          ? " 허가증(결과파일)은 마이페이지에서 바로 다운로드하실 수 있습니다."
          : " 결과파일은 준비되는 대로 마이페이지에 안내됩니다.")
    );
  } else {
    lines.push(
      `다음 단계는 "${context.nextStepLabel}"입니다. 일반적인 예상 소요기간은 ${context.estimatedDays} 정도이며, 실제 완료 시점은 기관·사안에 따라 달라질 수 있습니다.`
    );
  }

  lines.push(context.confidenceMessage);

  if (context.publicNotes.length > 0) {
    const latest = context.publicNotes[context.publicNotes.length - 1];
    lines.push(`담당자 안내: ${latest.memo}`);
  }

  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────
// 시스템 기능 → 규칙 답변. OpenAI를 호출하지 않는다.
// ────────────────────────────────────────────────────────────────
export function buildSystemAnswer(content: string): string {
  const normalized = normalize(content);

  if (/요금|비용|가격|수수료/.test(normalized)) {
    return "정확한 비용은 담당자가 서류를 확인한 뒤 카카오톡 또는 잘로(Zalo)로 안내드립니다. 이 화면에서는 비용 정보를 안내해드리지 않는 점 양해 부탁드립니다.";
  }
  if (/카카오톡|잘로|zalo|연락처|전화번호/.test(normalized)) {
    return "담당자와의 연락은 접수하신 카카오톡 또는 잘로(Zalo)로 이루어집니다. 별도 연락이 필요하시면 아래 \"전문가 상담 요청\"으로 문의를 남겨주세요.";
  }
  if (/다른 신청/.test(normalized)) {
    return "다른 신청 건은 마이페이지에서 확인하실 수 있습니다. 이 채팅은 현재 선택하신 신청 건 전용 Case Room입니다.";
  }
  if (/운영시간|운영 시간|몇 시까지/.test(normalized)) {
    return "AI Case Manager는 24시간 이용하실 수 있습니다. 전문가 상담 답변은 담당자 확인 후 순차적으로 등록됩니다.";
  }
  if (/로그인|비밀번호/.test(normalized)) {
    return "이 Case Room은 마이페이지의 결과 확인 링크로 로그인하신 뒤 이용하실 수 있습니다. 접속에 문제가 있으시면 처음 받으신 안내 메일의 링크로 다시 접속해주세요.";
  }
  if (/챗봇|ai가 맞|이 채팅|이 상담/.test(normalized)) {
    return "이 화면은 고객님의 신청 정보를 바탕으로 안내해드리는 AI Case Manager입니다. 법률 판단이나 확정적인 답변이 필요한 문의는 전문가 상담으로 연결해드립니다.";
  }
  return "죄송합니다, 해당 문의에 대한 안내 정보를 찾지 못했습니다. 아래 \"전문가 상담 요청\"으로 남겨주시면 담당자가 확인 후 안내드리겠습니다.";
}

// ────────────────────────────────────────────────────────────────
// STEP9-UI: leadId 없이(비로그인 공개 채팅, /ai) 진행상황을 물었을 때 —
// DB에 조회할 신청 건 자체가 없으므로 로그인 안내만 한다. OpenAI를
// 호출하지 않는다.
// ────────────────────────────────────────────────────────────────
export const ANONYMOUS_PROGRESS_NOTICE =
  "신청하신 건의 진행상황은 마이페이지에 로그인하신 뒤 확인하실 수 있습니다. 서비스 종류나 절차에 대한 일반적인 질문은 편하게 남겨주세요.";

// ────────────────────────────────────────────────────────────────
// 플랫폼 외 질문 → 안내문 출력. OpenAI를 호출하지 않는다.
// ────────────────────────────────────────────────────────────────
export const OFF_PLATFORM_NOTICE =
  "죄송합니다. 이 채팅은 VFBCAI 서비스(비자·거주증·사업자 등록 등 베트남 행정 절차) 관련 문의만 답변해드릴 수 있습니다. 신청 건과 관련된 질문을 남겨주시면 안내해드리겠습니다.";

// ────────────────────────────────────────────────────────────────
// 법률 판단 → 전문가 상담 연결. OpenAI를 호출하지 않고 즉시 전문가 상담
// 요청 버튼을 띄운다(needsExpert: true는 호출부에서 설정).
// ────────────────────────────────────────────────────────────────
export function buildLegalConsultNotice(context: CaseContext | null): string {
  const team = context?.expertTeamLabel ?? "VFBCAI 담당 전문가";
  return `해당 문의는 법률적 판단이 필요한 내용으로, AI가 확정적으로 답변드리기 어렵습니다. 아래 "전문가 상담 요청" 버튼으로 문의 내용을 남겨주시면 ${team}가 확인 후 답변드리겠습니다.`;
}

// ────────────────────────────────────────────────────────────────
// AI 분석 → 기존 OpenAI 호출 로직을 그대로 유지하되, api/ai-chat/route.ts
// 에서 분리해 별도 함수로 둔다("OpenAI 함수 분리"). 프롬프트 조립
// (buildSystemPrompt/buildGreetingPrompt)은 기존대로 aiCaseContext.ts가
// 담당하고, 이 함수는 "완성된 messages 배열을 받아 OpenAI를 호출하고
// 원문 응답 문자열만 돌려주는" 책임만 진다.
// ────────────────────────────────────────────────────────────────
export type OpenAiChatMessage = { role: string; content: string };

export type OpenAiCallResult = { ok: true; rawReply: string } | { ok: false; status: number };

export async function callOpenAiAnalysis(params: {
  apiKey: string;
  model: string;
  openaiMessages: OpenAiChatMessage[];
}): Promise<OpenAiCallResult> {
  const { apiKey, model, openaiMessages } = params;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        max_completion_tokens: 600,
      }),
    });

    // ── 디버깅 로그 1: OpenAI 응답 status ──
    console.error("aiGateway.callOpenAiAnalysis: OpenAI 응답 status =", openaiRes.status);

    if (!openaiRes.ok) {
      // 응답 본문에 OpenAI 원문 오류가 담길 수 있어 고객에게는 절대 그대로
      // 노출하지 않고 서버 로그에만 남긴다.
      const errText = await openaiRes.text().catch(() => "(본문을 읽을 수 없음)");
      // ── 디버깅 로그 2: OpenAI 응답 body(오류 원문) ──
      console.error("aiGateway.callOpenAiAnalysis: OpenAI 응답 body =", errText);
      return { ok: false, status: 502 };
    }

    const rawBodyText = await openaiRes.text();
    // ── 디버깅 로그 2: OpenAI 응답 body(정상 응답 원문) ──
    console.error("aiGateway.callOpenAiAnalysis: OpenAI 응답 body =", rawBodyText);

    const data = JSON.parse(rawBodyText);
    const rawReply: string = data?.choices?.[0]?.message?.content ?? "";

    if (!rawReply.trim()) {
      console.error(
        "aiGateway.callOpenAiAnalysis: OpenAI 응답에 내용이 없습니다. data =",
        data
      );
      return { ok: false, status: 502 };
    }

    return { ok: true, rawReply };
  } catch (err) {
    // ── 디버깅 로그 3/4: catch(error) 전체와 console.error ──
    console.error("aiGateway.callOpenAiAnalysis: catch(error) =", err);
    if (err instanceof Error) {
      console.error("aiGateway.callOpenAiAnalysis: error.message =", err.message);
      console.error("aiGateway.callOpenAiAnalysis: error.stack =", err.stack);
    }
    return { ok: false, status: 502 };
  }
}
