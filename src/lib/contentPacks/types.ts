export type ArticleSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "bullets"; title?: string; items: string[] }
  | { type: "numbered"; items: string[] };

export type ArticleIntentId = "trc-documents" | "trc-guide";

export type CaseQa = { q: string; a: string };

export type CaseRelatedQuestion = { question: string; href: string };

export type CaseSource = { label: string; detail?: string };

export type CaseExample = { title: string; body: string };

export type CaseComparison = { label: string; text: string };

/** 질문 1개 = 사례형 랜딩 1페이지. 비용은 기존 공식 데이터만 연결한다. */
export type CaseLanding = {
  question: string;
  /** 한 문장 직접 답변 */
  directAnswer: string;
  /** 왜 그런지 설명 */
  why: string;
  officialBasis: string[];
  costNote: string;
  /** 처리 일수처럼 코드에 없는 숫자는 넣지 않는다. */
  durationNote: string;
  process: string[];
  conditions: string[];
  cases: CaseExample[];
  comparison: CaseComparison[];
  /** 자주 하는 실수. 실명 고객 사례가 아니다. */
  cautions: string[];
  qa: CaseQa[];
  relatedQuestions: CaseRelatedQuestion[];
  sources: CaseSource[];
};

export type PublishedArticle = {
  slug: string;
  intentId: ArticleIntentId;
  serviceType: string;
  serviceLabel: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  updatedAt: string;
  articleType: "info" | "story";
  sections: ArticleSection[];
  caseLanding: CaseLanding;
  relatedSlug?: string;
  funnelHref: string;
  funnelCtaLabel: string;
};

export type ServiceIntentRoute = {
  intentId: ArticleIntentId;
  article: PublishedArticle;
  documentKeywords: RegExp;
};
