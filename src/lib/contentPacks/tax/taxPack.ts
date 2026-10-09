import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import { getAdminChoiceNoteKey, isAdminDirectExplainOption } from "@/lib/adminVerifyProfiling";
import { ADMIN_DIRECT_EXPLAIN_CHOICE } from "@/lib/adminVerifyProfiling";
import type { AdminVerifyProfilePhase } from "@/lib/adminVerifyProfiling";
import {
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";
import {
  isAdminPhase2DocumentsUploadComplete,
  type CrmActivityLike,
} from "@/lib/adminVerifyMypageFields";
import type { VerifyMasterContentSlots } from "@/lib/verifyMasterContentSlots";
import type { PackReviewQuestion, VerifyMasterPackBridge } from "@/lib/verifyMasterPackBridge";
import { TAX_CONTENT_FINAL } from "./taxContentFinal.data";

export { TAX_CONTENT_FINAL };

/** 화면 문구와 저장 값은 분리한다. 저장 키는 콘텐츠 파일의 필드명 그대로다. */
export function taxStorageKey(field: string): string {
  return field;
}

type RouteId = "P" | "V" | "C";

type TaxChoice = {
  value: string;
  label: string;
  description?: string;
  fields: Record<string, string>;
};

type TaxQuestion = {
  code: string;
  id: string;
  route: string;
  phase: number;
  prompt: string;
  subtitle?: string;
  choices: readonly TaxChoice[];
  directFields: Record<string, string>;
};

const ENTRY = TAX_CONTENT_FINAL.entry as TaxQuestion;
const QUESTIONS = TAX_CONTENT_FINAL.questions as readonly TaxQuestion[];
const DIRECT_NOTICE = TAX_CONTENT_FINAL.directNotice;
const CONNECTIONS = TAX_CONTENT_FINAL.connections;

const NOTICE_FIELD: Record<RouteId, string> = {
  P: "notice_source",
  V: "vat_notice_source",
  C: "corporate_notice_source",
};
const BLOCK_FIELD: Record<RouteId, string> = {
  P: "blocking_reason",
  V: "vat_blocking_reason",
  C: "corporate_blocking_reason",
};
const TRIGGER_FIELD: Record<RouteId, string> = {
  P: "tax_issue_trigger",
  V: "vat_issue_trigger",
  C: "corporate_issue_trigger",
};
const DEADLINE_FIELD: Record<RouteId, string> = {
  P: "deadline_timing",
  V: "vat_deadline_timing",
  C: "corporate_deadline_timing",
};
const SUPPORT_FIELD: Record<RouteId, string> = {
  P: "support_scope",
  V: "vat_support_scope",
  C: "corporate_support_scope",
};

const TAX_IDENTITY = {
  serviceId: "tax" as const,
  serviceDisplayName: "세금",
  breadcrumb: {
    service: "세금 VERIFY",
    phase: "세금 검토",
    pageMetaLabel: "세금 VERIFY",
    pageMetaSuffix: "세금 검토",
  },
  sectionLabels: {
    section01: "01 현재 상황",
    section01Meta: "확인된 세금 상황",
    section02: "02 핵심 확인 결과",
    section05: "05 다음 확인",
    section05Title: "이어서 확인할 방법",
    personalizedIntroSubtitle: "1차 확인과 추가 답변을 반영한 세금 검토입니다.",
  },
  nextStepCard: {
    sectionLabel: "다음 확인",
    headline: "추가 확인 또는 VFBCAI 전문가팀 검토로 이어갈 수 있습니다",
    subcopy: "확인된 답변과 자료를 기준으로 다음 검토를 선택합니다.",
    reportTitle: "AI 리포트 요청하기",
    reportDescription: "확인된 세금 답변과 자료를 바탕으로 상세 검토를 정리합니다.",
  },
};

export type TaxProfile = Record<string, string>;

function pairKey(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function connectionSentence(namePrefix: string): string {
  const row = CONNECTIONS.find((item) => item.name.startsWith(namePrefix));
  return row?.sentence ?? "";
}

const FRAUD_SENTENCE = connectionSentence("사기");
const ADMIN_DOC_SENTENCE = connectionSentence("행정문서");
const EXPERT_SENTENCE = connectionSentence("전문가");

function questionsFor(route: RouteId, phase: 1 | 2): TaxQuestion[] {
  return QUESTIONS.filter((question) => question.route === route && question.phase === phase);
}

export function selectedTaxRoute(answers: Record<string, string>): RouteId | null {
  const raw = answers[ENTRY.id]?.trim() ?? "";
  if (!raw) return null;
  if (raw === "other") return "P";
  const choice = ENTRY.choices.find((item) => item.value === raw);
  const route = choice?.fields.tax_route;
  if (route === "vat_einvoice") return "V";
  if (route === "corporate_tax") return "C";
  if (route === "personal_income_tax" || route === "unsure_default_personal") return "P";
  return null;
}

function answered(answers: Record<string, string>, id: string): boolean {
  return Boolean(answers[id]?.trim());
}

function applyQuestion(
  profile: TaxProfile,
  question: TaxQuestion,
  answers: Record<string, string>,
): void {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return;
  if (value === "other") {
    Object.assign(profile, question.directFields);
    const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
    if (!note) return;
    for (const [field, stored] of Object.entries(question.directFields)) {
      if (stored === "direct_input" || stored === "direct_input_detail") {
        profile[`${field}_detail`] = note;
      }
    }
    return;
  }
  const choice = question.choices.find((item) => item.value === value);
  if (!choice) return;
  Object.assign(profile, choice.fields);
}

export function buildTaxProfile(answers: Record<string, string>): TaxProfile {
  const profile: TaxProfile = {};
  applyQuestion(profile, ENTRY, answers);
  const route = selectedTaxRoute(answers);
  if (!route) return profile;
  for (const question of [...questionsFor(route, 1), ...questionsFor(route, 2)]) {
    applyQuestion(profile, question, answers);
  }
  return profile;
}

export function taxField(profile: TaxProfile, field: string): string {
  return profile[field] ?? "";
}

export function taxLabel(_field: string, value: string): string {
  if (!value) return "";
  return TAX_CONTENT_FINAL.labels[value as keyof typeof TAX_CONTENT_FINAL.labels] ?? "";
}

function choiceOf(question: TaxQuestion, answers: Record<string, string>): TaxChoice | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value || value === "other") return null;
  return question.choices.find((item) => item.value === value) ?? null;
}

function isDirect(question: TaxQuestion, answers: Record<string, string>): boolean {
  return answers[question.id] === "other";
}

function readString(map: object, key: string): string | null {
  const value = (map as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function cardSentence(route: RouteId, question: TaxQuestion, answers: Record<string, string>): string | null {
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return DIRECT_NOTICE;
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const card = TAX_CONTENT_FINAL.firstResult[route].cards.find(
    (item) => item.questionCode === question.code,
  );
  if (!card) return null;
  return readString(card.sentences, pairKey(choice.fields));
}

function verdictOf(
  route: RouteId,
  question: TaxQuestion,
  answers: Record<string, string>,
): { headline: string; body: string } | null {
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return { headline: DIRECT_NOTICE, body: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const verdict = (TAX_CONTENT_FINAL.firstResult[route].verdicts as Record<string, unknown>)[
    pairKey(choice.fields)
  ];
  if (!verdict || typeof verdict !== "object") return null;
  const row = verdict as { headline?: string; body?: string };
  if (!row.headline?.trim() || !row.body?.trim()) return null;
  return { headline: row.headline, body: row.body };
}

function phase2Sentence(
  route: RouteId,
  question: TaxQuestion,
  answers: Record<string, string>,
): { title: string; sentence: string } | null {
  if (!answered(answers, question.id)) return null;
  const block = TAX_CONTENT_FINAL.phase2Result[route].find(
    (item) => item.questionCode === question.code,
  );
  if (!block) return null;
  if (isDirect(question, answers)) return { title: block.title, sentence: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const sentence = readString(block.sentences, pairKey(choice.fields));
  if (!sentence) return null;
  return { title: block.title, sentence };
}

function authorityRequested(route: RouteId, profile: TaxProfile): boolean {
  if (route === "P") return profile.tax_issue_trigger === "notice_or_document_received";
  if (route === "V") return profile.vat_issue_trigger === "authority_or_counterparty_notice";
  return (
    profile.corporate_issue_trigger === "authority_request" ||
    profile.corporate_tax_stage === "authority_review_or_request"
  );
}

export function taxConnectionFlags(answers: Record<string, string>): {
  fraud: boolean;
  adminDoc: boolean;
  expert: boolean;
} {
  const route = selectedTaxRoute(answers);
  if (!route) return { fraud: false, adminDoc: false, expert: false };
  const profile = buildTaxProfile(answers);
  const notice = profile[NOTICE_FIELD[route]] ?? "";
  const block = profile[BLOCK_FIELD[route]] ?? "";
  const trigger = profile[TRIGGER_FIELD[route]] ?? "";
  const deadline = profile[DEADLINE_FIELD[route]] ?? "";
  const support = profile[SUPPORT_FIELD[route]] ?? "";
  return {
    fraud: notice === "claimed_tax_authority" || notice === "third_party_or_online",
    adminDoc:
      block === "document_understanding" ||
      (route === "V" && block === "invoice_understanding") ||
      trigger === "language_barrier",
    expert:
      deadline === "passed_or_imminent" ||
      deadline === "possibly_passed_or_near" ||
      support === "expert_led_followthrough" ||
      authorityRequested(route, profile),
  };
}

function matchingRisks(route: RouteId, profile: TaxProfile): { lines: string[]; fallback: boolean } {
  const spec = TAX_CONTENT_FINAL.firstResult[route].risks;
  const lines: string[] = [];
  for (const rule of spec.rules) {
    const hit = rule.clauses.some((clause) =>
      (clause.values as readonly string[]).includes(profile[clause.field] ?? ""),
    );
    if (!hit) continue;
    lines.push(rule.sentence);
    if (lines.length === 4) break;
  }
  if (lines.length === 0) return { lines: [spec.fallback], fallback: true };
  return { lines, fallback: false };
}

/** 두 문장 이상이면 첫 문장과 나머지를 나누고, 글자는 그대로 둔다. */
function splitChoiceSentences(label: string): { label: string; description?: string } {
  const match = label.match(/^([\s\S]+?[.?!。])\s+(\S[\s\S]*)$/);
  if (!match) return { label };
  return { label: match[1], description: match[2] };
}

function toReview(question: TaxQuestion): PackReviewQuestion {
  const options = question.choices.map((choice) => {
    if (choice.description) {
      return { value: choice.value, label: choice.label, description: choice.description };
    }
    const split = splitChoiceSentences(choice.label);
    return split.description
      ? { value: choice.value, label: split.label, description: split.description }
      : { value: choice.value, label: split.label };
  });
  const withDirect = options.some(isAdminDirectExplainOption)
    ? options
    : [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];
  return {
    id: question.id,
    kind: "choice",
    label: question.prompt,
    ...(question.subtitle ? { description: question.subtitle } : {}),
    options: withDirect,
  };
}

function phase1Questions(answers: Record<string, string>): TaxQuestion[] {
  const route = selectedTaxRoute(answers);
  if (!route) return [ENTRY];
  return [ENTRY, ...questionsFor(route, 1)];
}

function phase2Questions(answers: Record<string, string>): TaxQuestion[] {
  const route = selectedTaxRoute(answers);
  if (!route) return [];
  return questionsFor(route, 2);
}

/**
 * Admin MASTER와 같이 지금 단계의 질문 목록 길이를 총개수로 쓴다.
 * 진입은 1차 목록에 포함되고, 2차는 2차 목록만으로 1부터 다시 센다.
 */
export function taxStitchProgress(
  answers: Record<string, string>,
  profilePhase: 1 | 2,
  activeIndex: number,
): { current: number; total: number } {
  const route = selectedTaxRoute(answers);
  const index = activeIndex >= 0 ? activeIndex : 0;
  if (profilePhase === 2 && route) {
    return { current: index + 1, total: questionsFor(route, 2).length };
  }
  if (!route) return { current: 1, total: 1 };
  return { current: index + 1, total: 1 + questionsFor(route, 1).length };
}

export function isTaxPhase1Complete(answers: Record<string, string>): boolean {
  const route = selectedTaxRoute(answers);
  if (!route || !answered(answers, ENTRY.id)) return false;
  return questionsFor(route, 1).every((question) => answered(answers, question.id));
}

export function isTaxPhase2Complete(answers: Record<string, string>): boolean {
  const route = selectedTaxRoute(answers);
  if (!route) return false;
  return questionsFor(route, 2).every((question) => answered(answers, question.id));
}

function questionByCode(route: RouteId, code: string): TaxQuestion {
  const question = QUESTIONS.find((item) => item.route === route && item.code === code);
  if (!question) throw new Error(`missing tax question ${code}`);
  return question;
}

function buildResult(
  answers: Record<string, string>,
  phase2: boolean,
): AdminVerifyFirstResultData | null {
  const route = selectedTaxRoute(answers);
  if (!route || !isTaxPhase1Complete(answers)) return null;
  const profile = buildTaxProfile(answers);
  const verdict = verdictOf(route, questionByCode(route, `Q4-${route}`), answers);
  if (!verdict) return null;
  const cardCodes = [`Q1-${route}`, `Q2-${route}`, `Q3-${route}`] as const;
  const keyMetrics = cardCodes.flatMap((code) => {
    const question = questionByCode(route, code);
    const sentence = cardSentence(route, question, answers);
    if (!sentence) return [];
    const card = TAX_CONTENT_FINAL.firstResult[route].cards.find((item) => item.questionCode === code);
    return [
      {
        label: card?.title ?? "확인",
        title: sentence,
        footnote: sentence,
        status: "ok" as const,
      },
    ];
  });
  const risks = matchingRisks(route, profile);
  const phase2Blocks = phase2
    ? questionsFor(route, 2)
        .map((question) => phase2Sentence(route, question, answers))
        .filter((block): block is { title: string; sentence: string } => Boolean(block))
    : [];
  const routeLabel = taxLabel("tax_route", profile.tax_route) || "세금 검토";
  return {
    stageLabel: phase2 ? "2차 검토" : "1차 검토",
    statusHeadline: verdict.headline,
    statusTone: risks.fallback ? "ok" : "caution",
    situationSummary: verdict.body,
    gradeFilled: risks.fallback ? 1 : Math.min(5, risks.lines.length),
    gradeLabel: "답변 기준",
    keyMetrics: phase2
      ? phase2Blocks.map((block) => ({
          label: block.title,
          title: block.sentence,
          footnote: block.sentence,
          status: "ok" as const,
        }))
      : keyMetrics,
    cautions: risks.lines,
    unconfirmed: [],
    actions: [],
    referenceDateLabel: "이번 답변 기준",
    caseClassificationLabel: routeLabel,
    personalizedContext: phase2
      ? {
          integratedSituation: `${verdict.headline} ${verdict.body}`.trim(),
          phase1Facts: [verdict.body],
          phase2Additions: phase2Blocks.map((block) => `${block.title}: ${block.sentence}`),
          documentsNeededNote: "",
        }
      : undefined,
  };
}

export function taxFirstResultCustomerLength(answers: Record<string, string>): number {
  const data = buildResult(answers, false);
  if (!data) return 0;
  const parts = [
    data.statusHeadline,
    data.situationSummary,
    ...data.keyMetrics.map((metric) => metric.footnote),
    ...data.cautions,
  ];
  return parts.join("\n").length;
}

function contentSlotsFor(answers: Record<string, string>): VerifyMasterContentSlots["firstResult"] {
  const flags = taxConnectionFlags(answers);
  const links: { label: string; targetServiceEntryPath: string }[] = [];
  if (flags.fraud && FRAUD_SENTENCE) {
    links.push({ label: FRAUD_SENTENCE, targetServiceEntryPath: "/verify/fraud" });
  }
  if (flags.adminDoc && ADMIN_DOC_SENTENCE) {
    links.push({ label: ADMIN_DOC_SENTENCE, targetServiceEntryPath: "/verify/admin" });
  }
  const expertLine = flags.expert ? EXPERT_SENTENCE : TAX_IDENTITY.nextStepCard.subcopy;
  return {
    firstResultTitle: "세금 1차 종합 결과",
    firstResultIntro: "입력하신 답변을 바탕으로 정리한 1차 세금 검토입니다.",
    personalizedResultTitle: "세금 2차 개인화 결과",
    personalizedResultIntro: "1차 확인과 추가 답변을 반영한 세금 검토입니다.",
    paidDetailReviewDescription: "내 상황과 자료를 바탕으로 세금 신고·납부 기록을 더 확인합니다.",
    firstResultCautionsSectionSubtitle: "| 이어서 확인할 포인트",
    serviceLinks: links,
    identity: {
      ...TAX_IDENTITY,
      nextStepCard: {
        ...TAX_IDENTITY.nextStepCard,
        subcopy: expertLine,
      },
    },
  };
}

const BASE_SLOTS: VerifyMasterContentSlots = {
  identity: TAX_IDENTITY,
  evidence: {
    exampleTags: ["급여명세서", "소득 자료", "전자 인보이스", "법인세 신고 자료", "세무기관 연락"],
    identity: TAX_IDENTITY,
  },
  firstResult: contentSlotsFor({}),
};

export function createTaxVerifyMasterPackBridge(): VerifyMasterPackBridge {
  return {
    buildReviewQuestions(answers, profilePhase: AdminVerifyProfilePhase) {
      const source = profilePhase === 1 ? phase1Questions(answers) : phase2Questions(answers);
      return source.map(toReview);
    },
    isPhase1Complete: isTaxPhase1Complete,
    isPhase2QuestionSetComplete: isTaxPhase2Complete,
    buildFirstResult(answers) {
      return buildResult(answers, false);
    },
    buildPersonalizedResult(answers) {
      if (!isTaxPhase2Complete(answers)) return null;
      return buildResult(answers, true);
    },
    resolveFirstResultTransition(answers) {
      const flags = taxConnectionFlags(answers);
      return {
        hookHeadline: "이어서 자료를 대조할 수 있습니다",
        hookWhy: "답변만으로 세액이나 납부의무를 정하지 않기 위해 자료 확인이 이어집니다.",
        hookWho: "신고·납부 기록이나 세무기관 연락을 가진 경우에 이어서 확인할 수 있습니다.",
        hookWhatMore: flags.expert ? EXPERT_SENTENCE : TAX_IDENTITY.nextStepCard.subcopy,
        trustLine: "확인된 사실과 고객이 가진 자료를 기준으로 정리합니다.",
      };
    },
    getContentSlots: () => BASE_SLOTS,
    getFirstResultContentSlots(answers) {
      return contentSlotsFor(answers);
    },
    stitchProgress: taxStitchProgress,
    getSignupRiskLevel(answers) {
      const flags = taxConnectionFlags(answers);
      if (flags.fraud || flags.expert) return "high";
      const route = selectedTaxRoute(answers);
      if (!route) return "medium";
      const risks = matchingRisks(route, buildTaxProfile(answers));
      return risks.fallback ? "low" : "medium";
    },
  };
}

export function buildTaxMemberVerifyMeta(
  answers: Record<string, string>,
  file?: { storagePath: string; file_name: string } | null,
): Record<string, unknown> {
  const profile = buildTaxProfile(answers);
  const first = buildResult(answers, false);
  return {
    tax_pack_v1: true,
    ...answers,
    ...profile,
    tax_expert_summary: first?.situationSummary ?? "",
    ...(file
      ? {
          storagePath: file.storagePath,
          file_name: file.file_name,
          submitted_document: { storagePath: file.storagePath, file_name: file.file_name },
        }
      : {}),
  };
}

const TAX_PACK_CASE_META_KEY = "tax_pack_case_id";
const TAX_PACK_V1_FLAG = "tax_pack_v1";
const TAX_PACK_GRADE2_META_KEY = "tax_pack_grade2";
const TAX_PACK_PHASE2_SUMMARY_META_KEY = "tax_pack_phase2_summary";
const TAX_PACK_CAUTION_COUNT_META_KEY = "tax_pack_caution_count";
const TAX_PACK_HEADLINE_META_KEY = "tax_pack_headline";

export function resolveTaxCaseFromAnswers(answers: Record<string, string>): string {
  const route = selectedTaxRoute(answers);
  if (!route) return "unknown";
  const profile = buildTaxProfile(answers);
  return profile.tax_route || "unknown";
}

function assertTaxPackCaseIdConsistent(answers: Record<string, string>): string {
  const caseId = resolveTaxCaseFromAnswers(answers);
  const fromMeta = answers[TAX_PACK_CASE_META_KEY];
  if (fromMeta && String(fromMeta).trim() && String(fromMeta) !== caseId) {
    throw new Error(
      `pack case_id mismatch: tax_route→${caseId} vs ${TAX_PACK_CASE_META_KEY}=${fromMeta}`,
    );
  }
  return caseId;
}

function serializeTaxPackAnswers(answers: Record<string, string>): string {
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(answers)) {
    if (val == null) continue;
    const text = String(val).trim();
    if (text) payload[key] = text;
  }
  return JSON.stringify(payload);
}

export function buildTaxPhase2PersistMeta(
  answers: Record<string, string>,
  profilePhase: 1 | 2,
): Record<string, string> {
  const caseId = assertTaxPackCaseIdConsistent(answers);
  const meta: Record<string, string> = {
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: serializeTaxPackAnswers(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
    [TAX_PACK_V1_FLAG]: "true",
    [TAX_PACK_CASE_META_KEY]: caseId,
  };
  if (profilePhase === 2) {
    const personalized = buildResult(answers, true);
    if (personalized) {
      meta[TAX_PACK_GRADE2_META_KEY] = String(personalized.gradeFilled);
      const e2 = (personalized.personalizedContext?.phase2Additions ?? [])
        .map((line) => line.trim())
        .filter(Boolean);
      meta[TAX_PACK_PHASE2_SUMMARY_META_KEY] = e2.join("\n");
      meta[TAX_PACK_CAUTION_COUNT_META_KEY] = String(personalized.cautions?.length ?? 0);
      const headline = personalized.statusHeadline?.trim() || "";
      if (headline) meta[TAX_PACK_HEADLINE_META_KEY] = headline;
    }
  }
  return meta;
}

export function restoreTaxAnswersFromVerifyMeta(
  meta: Record<string, unknown>,
): Record<string, string> | null {
  const raw = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function latestTaxMetaString(activities: CrmActivityLike[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = (meta as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

function splitTaxSummaryLines(summary: string): string[] {
  const trimmed = summary.trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(/(?<=[.!?…])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 2) return parts;
  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

export function buildTaxVerifyMypagePackExtras(activities: CrmActivityLike[]): {
  phase2Complete: boolean;
  phase2SummaryLines: string[];
  phase1SummaryLines?: string[];
} {
  const phase2Complete = isAdminPhase2DocumentsUploadComplete(activities);
  const lines = splitTaxSummaryLines(
    latestTaxMetaString(activities, TAX_PACK_PHASE2_SUMMARY_META_KEY) ?? "",
  );
  return {
    phase2Complete,
    phase2SummaryLines: lines,
    ...(phase2Complete ? { phase1SummaryLines: lines.slice(0, 2) } : {}),
  };
}

export function buildTaxExpertHandoffMeta(answers: Record<string, string>): Record<string, string> {
  const profile = buildTaxProfile(answers);
  const first = buildResult(answers, isTaxPhase2Complete(answers));
  return {
    tax_pack_v1: "true",
    tax_expert_summary: first?.situationSummary ?? "",
    ...profile,
  };
}

/** K. 리포트 고정 문구. 콘텐츠 파일 문장을 그대로 읽는다. */
export const TAX_PDF_MISSING_FILE_NOTICE = TAX_CONTENT_FINAL.reportFixed.missingFileNotice;

function customerChoiceText(
  question: TaxQuestion,
  answers: Record<string, string>,
  firstSentenceOnly: boolean,
): string | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return null;
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
    return note || DIRECT_NOTICE;
  }
  const choice = question.choices.find((item) => item.value === value);
  if (!choice) return null;
  if (!firstSentenceOnly) {
    return choice.description ? `${choice.label} ${choice.description}` : choice.label;
  }
  if (choice.description) return choice.label;
  return splitChoiceSentences(choice.label).label;
}

function pushLabeledLines(target: string[], label: string, lines: string[]): void {
  if (lines.length === 0) return;
  target.push(`${label}: ${lines[0]}`);
  for (const line of lines.slice(1)) target.push(line);
}

function taxAnswersFromActivities(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const restored = restoreTaxAnswersFromVerifyMeta(meta as Record<string, unknown>);
    if (restored && Object.keys(restored).length > 0) return restored;
  }
  return {};
}

function taxAttachedFileNames(activities: CrmActivityLike[]): string[] {
  const names: string[] = [];
  for (const activity of activities) {
    const meta = activity?.meta;
    if (!meta || typeof meta !== "object") continue;
    const record = meta as Record<string, unknown>;
    for (const key of ["fileName", "file_name"] as const) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) names.push(value.trim());
    }
    const submitted = record.submitted_document;
    if (submitted && typeof submitted === "object") {
      const fileName =
        (submitted as Record<string, unknown>).file_name ??
        (submitted as Record<string, unknown>).fileName;
      if (typeof fileName === "string" && fileName.trim()) names.push(fileName.trim());
    }
  }
  return [...new Set(names)];
}

export function buildTaxVerifyAiReportContentFromActivities(activities: CrmActivityLike[]): {
  execSummary: string[];
  keyFindings: string[];
  keyRisks: string[];
  recommendedAction: string[];
  riskCount: number;
  reviewedCount: number;
  satisfiedCount: number;
  mandatoryDocumentLines: string[];
  executiveHeadline: string;
  executiveBody: string;
  hideScoreMetrics: true;
} {
  const answers = taxAnswersFromActivities(activities);
  const route = selectedTaxRoute(answers);
  const first = route ? buildResult(answers, false) : null;
  const files = taxAttachedFileNames(activities);
  const entryText = customerChoiceText(ENTRY, answers, true);
  const situation = route
    ? questionsFor(route, 1)
        .map((question) => customerChoiceText(question, answers, true))
        .filter((line): line is string => Boolean(line))
    : [];
  const stage = route
    ? questionsFor(route, 2)
        .map((question) => customerChoiceText(question, answers, true))
        .filter((line): line is string => Boolean(line))
    : [];
  const storedSummary = latestTaxMetaString(activities, TAX_PACK_PHASE2_SUMMARY_META_KEY) ?? "";
  const verdictBody = first?.situationSummary?.trim() ?? "";
  const execSummary: string[] = [];
  if (entryText) execSummary.push(`선택하신 사건유형: ${entryText}`);
  pushLabeledLines(execSummary, "상황", situation);
  for (const line of storedSummary.split("\n").map((item) => item.trim()).filter(Boolean)) {
    if (line === verdictBody || line === first?.statusHeadline || execSummary.includes(line)) continue;
    execSummary.push(line);
  }
  pushLabeledLines(execSummary, "진행 단계", stage);
  const flags = route ? taxConnectionFlags(answers) : { fraud: false, adminDoc: false, expert: false };
  const recommendedAction: string[] = [];
  if (flags.fraud && FRAUD_SENTENCE) recommendedAction.push(FRAUD_SENTENCE);
  if (flags.adminDoc && ADMIN_DOC_SENTENCE) recommendedAction.push(ADMIN_DOC_SENTENCE);
  if (flags.expert && EXPERT_SENTENCE) recommendedAction.push(EXPERT_SENTENCE);
  if (recommendedAction.length === 0 && verdictBody) recommendedAction.push(verdictBody);
  return {
    execSummary,
    keyFindings: (first?.keyMetrics ?? []).map((metric) => metric.title).filter(Boolean).slice(0, 3),
    keyRisks: (first?.cautions ?? []).filter(Boolean).slice(0, 4),
    recommendedAction,
    riskCount: 0,
    reviewedCount: 0,
    satisfiedCount: 0,
    mandatoryDocumentLines: files.length > 0 ? files : [TAX_PDF_MISSING_FILE_NOTICE],
    executiveHeadline: first?.statusHeadline?.trim() ?? "",
    executiveBody: verdictBody,
    hideScoreMetrics: true,
  };
}
