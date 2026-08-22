export type ArticleSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "bullets"; title?: string; items: string[] }
  | { type: "numbered"; items: string[] };

export type ArticleIntentId = "trc-documents" | "trc-guide" | "wp-guide";

export type CaseQa = { q: string; a: string };

export type CaseRelatedQuestion = { question: string; href: string };

export type CaseSource = { label: string; detail?: string };

export type CaseExample = { title: string; body: string };

export type CaseComparison = { label: string; text: string };

/** 질문 1개 = 사례형 랜딩 1페이지. 없는 사실·조항·금액을 채우지 않는다. */
export type CaseLanding = {
  question: string;
  /** 한 문장 직접 답변 */
  directAnswer: string;
  /** 왜 그런지 설명 */
  why: string;
  /** 관련 법령 번호만. 서류 목록의 근거처럼 쓰지 않는다. */
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
  /** false면 서류 목록 블록을 넣지 않는다. 기본 true. */
  showDocuments?: boolean;
  /** true일 때만 기존 costCheck 수수료를 표시하고 Circular를 비용에만 연결한다. */
  showOfficialCost?: boolean;
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
