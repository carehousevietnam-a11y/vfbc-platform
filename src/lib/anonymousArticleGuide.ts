import type { PublishedArticle } from "@/lib/contentPacks/types";
import {
  ANONYMOUS_GUIDE_DISCLAIMER,
  getAnonymousDocumentList,
  getAnonymousProcessLine,
} from "@/lib/anonymousLegalGuide";
import type { NavigatorAction } from "@/lib/aiGateway";

const MYPAGE_CTA =
  "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다.";

const PROGRESS_QUESTION_RE =
  /힘들|막막|헷갈|혼란|말이.?다르|제각각|어떻게.*해야|어떻게.*하나|어떻게.*해요|진행|절차|순서/i;

function formatUpdatedLine(updatedAt: string): string {
  return `최종 업데이트: ${updatedAt}`;
}

function formatDocumentBullets(serviceType: string): string {
  return getAnonymousDocumentList(serviceType)
    .map((item) => `· ${item}`)
    .join("\n");
}

function openingLine(question: string, article: PublishedArticle): string {
  if (article.intentId === "trc-documents") {
    return `네, **${article.serviceLabel}** 신청에 일반적으로 준비하는 서류를 정리해 드릴게요.`;
  }

  if (PROGRESS_QUESTION_RE.test(question)) {
    return `**${article.serviceLabel}** 진행은 보통 아래 순서로 진행됩니다. 비자·고용 형태에 따라 추가 요청이 있을 수 있어요.`;
  }

  return `**${article.serviceLabel}** 신청·진행 방법을 정리해 드릴게요.`;
}

function buildBodyBlocks(
  question: string,
  article: PublishedArticle,
  legalBasisLine: string
): string[] {
  const docs = formatDocumentBullets(article.serviceType);
  const process = getAnonymousProcessLine(article.serviceType);
  const blocks: string[] = [];

  if (article.intentId === "trc-documents") {
    blocks.push("【필요 서류】", docs, "", "【진행 순서】", process);
  } else {
    blocks.push("【진행 순서】", process, "", "【필요 서류】", docs);
    if (PROGRESS_QUESTION_RE.test(question)) {
      blocks.push(
        "",
        "말이 제각각이어도 절차 자체는 같고, 준비물만 상황마다 달라지는 경우가 많습니다."
      );
    }
  }

  blocks.push("", legalBasisLine);
  return blocks;
}

/** 익명 TRC 채팅 — 가이드 페이지 없이도 완결된 답변. */
export function buildArticleChatReply(
  question: string,
  article: PublishedArticle,
  options?: { legalBasisLine?: string }
): { reply: string; actions: NavigatorAction[] } {
  const articleHref = `/answers/${article.slug}`;
  const legalLine =
    options?.legalBasisLine?.trim() ||
    "관련 법령: 04/2016/TT-BNG, 47/2014/QH13 (구체 조항은 전문가 확인 필요)";

  const reply = [
    openingLine(question, article),
    "",
    ...buildBodyBlocks(question, article, legalLine),
    "",
    formatUpdatedLine(article.updatedAt),
    "",
    ANONYMOUS_GUIDE_DISCLAIMER,
    "",
    MYPAGE_CTA,
  ].join("\n");

  const actions: NavigatorAction[] = [
    { label: article.funnelCtaLabel, href: article.funnelHref },
    { label: "더 자세히 보기", href: articleHref },
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
