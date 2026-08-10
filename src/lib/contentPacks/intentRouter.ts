import type { ArticleIntentId } from "@/lib/contentPacks/types";
import {
  TRC_DOCUMENTS_ARTICLE,
  TRC_GUIDE_ARTICLE,
} from "@/lib/contentPacks/trcArticles";

const TRC_DOCUMENT_INTENT_RE =
  /서류|준비물|필요.*(뭐|무엇)|뭐.*필요|목록|체크리스트|document|서류목록|제출.*서류/i;

const TRC_CONFUSION_RE =
  /힘들|막막|헷갈|혼란|말이.?다르|제각각|여기서는|저기서는|어떻게.*해야|어떻게.*하나|어떻게.*해요/i;

/** TRC 질문을 canonical intent(글 1개)로 라우팅한다. */
export function resolveTrcArticleIntent(question: string): ArticleIntentId {
  const q = question.trim();
  if (TRC_DOCUMENT_INTENT_RE.test(q) && !TRC_CONFUSION_RE.test(q)) {
    return "trc-documents";
  }
  return "trc-guide";
}

export function getTrcArticleByIntent(intentId: ArticleIntentId) {
  return intentId === "trc-documents" ? TRC_DOCUMENTS_ARTICLE : TRC_GUIDE_ARTICLE;
}

export function isTrcService(serviceType: string): boolean {
  return serviceType === "trc";
}
