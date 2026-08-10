export type ArticleSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "bullets"; title?: string; items: string[] }
  | { type: "numbered"; items: string[] };

export type ArticleIntentId = "trc-documents" | "trc-guide";

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
  relatedSlug?: string;
  funnelHref: string;
  funnelCtaLabel: string;
};

export type ServiceIntentRoute = {
  intentId: ArticleIntentId;
  article: PublishedArticle;
  documentKeywords: RegExp;
};
