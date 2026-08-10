import type { PublishedArticle } from "@/lib/contentPacks/types";
import { ANONYMOUS_GUIDE_DISCLAIMER } from "@/lib/anonymousLegalGuide";
import type { NavigatorAction } from "@/lib/aiGateway";

const MYPAGE_CTA =
  "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다.";

const CONFUSION_RE =
  /힘들|막막|헷갈|혼란|말이.?다르|제각각|여기서는|저기서는/i;

function formatUpdatedLine(updatedAt: string): string {
  return `최종 업데이트: ${updatedAt}`;
}

function chatIntro(question: string, article: PublishedArticle): string {
  if (article.intentId === "trc-documents") {
    return `**${article.serviceLabel}** 필요 서류를 정리한 안내 글이 있습니다.\n\n아래에서 한눈에 확인하실 수 있습니다.`;
  }

  if (CONFUSION_RE.test(question)) {
    return `여러 곳에서 말이 다르면 헷갈리시는 게 당연해요.\n\n**${article.serviceLabel}** 진행 방법을 1분짜리 안내 글로 정리해 두었습니다.`;
  }

  return `**${article.serviceLabel}** 신청·진행 방법을 안내 글로 정리해 두었습니다.`;
}

/** 반복 질문에도 동일 canonical 글을 가리키는 짧은 채팅 답변. */
export function buildArticleChatReply(
  question: string,
  article: PublishedArticle
): { reply: string; actions: NavigatorAction[] } {
  const articleHref = `/answers/${article.slug}`;

  const reply = [
    chatIntro(question, article),
    "",
    formatUpdatedLine(article.updatedAt),
    "",
    ANONYMOUS_GUIDE_DISCLAIMER,
    "",
    MYPAGE_CTA,
  ].join("\n");

  const actions: NavigatorAction[] = [
    { label: "글 읽기", href: articleHref },
    { label: article.funnelCtaLabel, href: article.funnelHref },
  ];

  return { reply, actions };
}

/** 발행 글 본문에 법령 문단을 주입한다 (법령 섹션 또는 말미). */
export function injectLegalBasisIntoArticle(
  article: PublishedArticle,
  legalBasisLine: string
): PublishedArticle {
  const sections = [...article.sections];
  const lawHeadingIndex = sections.findIndex(
    (section) => section.type === "h2" && /관련 법령|법령/.test(section.text)
  );

  if (lawHeadingIndex >= 0) {
    const next = sections[lawHeadingIndex + 1];
    if (next?.type === "p") {
      sections[lawHeadingIndex + 1] = { type: "p", text: legalBasisLine };
      return { ...article, sections };
    }
    sections.splice(lawHeadingIndex + 1, 0, { type: "p", text: legalBasisLine });
    return { ...article, sections };
  }

  sections.push({ type: "h2", text: "관련 법령 (참고)" });
  sections.push({ type: "p", text: legalBasisLine });
  return { ...article, sections };
}
