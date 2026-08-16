const SECTION_HEADER_RE = /^【(.+?)】$/;
const DISCLAIMER_PREFIX = "이 내용은 AI가";
const MYPAGE_CTA_PREFIX = "무료 회원가입 후";

export function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
}

function isSkippableParagraph(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith(DISCLAIMER_PREFIX)) return true;
  if (trimmed.startsWith(MYPAGE_CTA_PREFIX)) return true;
  if (SECTION_HEADER_RE.test(trimmed)) return true;
  if (trimmed.startsWith("---")) return true;
  if (trimmed.startsWith("최종 업데이트:")) return true;
  return false;
}

/** reply 본문에서 직접 답변(1~2문장)과 나머지 상세 본문을 분리한다. */
export function extractDirectAnswer(content: string): {
  directAnswer: string;
  remainder: string;
} {
  const trimmed = content.trim();
  if (!trimmed) return { directAnswer: "", remainder: "" };

  const paragraphs = trimmed.split(/\n\n+/);
  let leadIndex = -1;

  for (let i = 0; i < paragraphs.length; i++) {
    if (!isSkippableParagraph(paragraphs[i])) {
      leadIndex = i;
      break;
    }
  }

  if (leadIndex < 0) {
    return { directAnswer: "", remainder: trimmed };
  }

  const leadRaw = paragraphs[leadIndex].trim();
  const leadFlat = stripMarkdownBold(leadRaw.replace(/\n/g, " "));

  const sentenceParts = leadFlat.match(/[^.!?。…]+[.!?。…]?/g) ?? [leadFlat];
  const directAnswer = sentenceParts
    .slice(0, 2)
    .join("")
    .trim();

  const remainder = [...paragraphs.slice(0, leadIndex), ...paragraphs.slice(leadIndex + 1)]
    .join("\n\n")
    .trim();

  return { directAnswer, remainder };
}

export function formatRequestedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${d} ${h}:${min} 기준`;
}
