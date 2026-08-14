const NEEDS_EXPERT_MARKER = "[NEEDS_EXPERT]";

/** 내부 마커([NEEDS_EXPERT] 등)를 사용자 응답에서 제거한다. */
export function sanitizeAssistantReply(text: string): {
  reply: string;
  needsExpertFromMarker: boolean;
} {
  const needsExpertFromMarker = text.includes(NEEDS_EXPERT_MARKER);
  const reply = text.split(NEEDS_EXPERT_MARKER).join("").replace(/\n{3,}/g, "\n\n").trim();
  return { reply, needsExpertFromMarker };
}
