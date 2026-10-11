import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import {
  ADMIN_DIRECT_EXPLAIN_CHOICE,
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
  getAdminChoiceNoteKey,
  isAdminDirectExplainOption,
  type AdminVerifyProfilePhase,
} from "@/lib/adminVerifyProfiling";
import {
  isAdminPhase2DocumentsUploadComplete,
  isVerifyAdminPaidAiReportPdfActivities,
  type CrmActivityLike,
} from "@/lib/adminVerifyMypageFields";
import type { VerifyMasterContentSlots } from "@/lib/verifyMasterContentSlots";
import type { PackReviewQuestion, VerifyMasterPackBridge } from "@/lib/verifyMasterPackBridge";
import { UNCLEAR_CONTENT_FINAL } from "./unclearContentFinal.data";

export { UNCLEAR_CONTENT_FINAL };

type RouteId = "M" | "D" | "N";

type UnclearChoice = {
  value: string;
  label: string;
  description?: string;
  fields: Record<string, string>;
  route?: string;
};

type UnclearQuestion = {
  code: string;
  id: string;
  route: string;
  phase: number;
  prompt: string;
  subtitle?: string;
  choices: readonly UnclearChoice[];
  directFields: Record<string, string>;
  directRoute?: string;
};

const ENTRY = UNCLEAR_CONTENT_FINAL.entry as UnclearQuestion;
const QUESTIONS = UNCLEAR_CONTENT_FINAL.questions as readonly UnclearQuestion[];
const DIRECT_NOTICE = UNCLEAR_CONTENT_FINAL.directNotice;

const UNCLEAR_IDENTITY = {
  serviceDisplayName: "불확실한 문서 검토",
  breadcrumb: {
    service: "불확실한 문서 VERIFY",
    phase: "불확실한 문서 검토",
    pageMetaLabel: "불확실한 문서 VERIFY",
    pageMetaSuffix: "불확실한 문서 검토",
  },
  sectionLabels: {
    section01: "01 현재 상황",
    section01Meta: "확인된 상황",
    section02: "02 핵심 확인 결과",
    section05: "05 다음 확인",
    section05Title: "이어서 확인할 방법",
    personalizedIntroSubtitle: "1차 확인과 추가 답변을 반영한 불확실한 문서 검토입니다.",
  },
  nextStepCard: {
    sectionLabel: "다음 확인",
    headline: "추가 확인 또는 VFBCAI 전문가팀 검토로 이어갈 수 있습니다",
    subcopy: "확인된 답변과 자료를 기준으로 다음 검토를 선택합니다.",
    reportTitle: "AI 리포트 요청하기",
    reportDescription: "확인된 답변과 자료를 바탕으로 상세 검토를 정리합니다.",
  },
};

export type UnclearProfile = Record<string, string>;

const LINK_BY_NAME: Record<string, string> = {
  세금: "/verify/tax",
  행정문서: "/verify/admin",
  부동산: "/verify/real-estate",
  사기: "/verify/fraud",
};
const LINK_PRIORITY = ["사기", "세금", "행정문서", "부동산", "전문가"];

function pairKey(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function questionsFor(route: RouteId, phase: 1 | 2): UnclearQuestion[] {
  return QUESTIONS.filter((question) => question.route === route && question.phase === phase);
}

export function selectedUnclearRoute(answers: Record<string, string>): RouteId | null {
  const raw = answers[ENTRY.id]?.trim() ?? "";
  if (!raw) return null;
  if (raw === "other") return (ENTRY.directRoute as RouteId) || "N";
  const choice = ENTRY.choices.find((item) => item.value === raw);
  if (choice?.route === "M" || choice?.route === "D" || choice?.route === "N") return choice.route;
  return null;
}

function answered(answers: Record<string, string>, id: string): boolean {
  return Boolean(answers[id]?.trim());
}

function applyQuestion(profile: UnclearProfile, question: UnclearQuestion, answers: Record<string, string>): void {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return;
  if (value === "other") {
    Object.assign(profile, question.directFields);
    const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
    if (!note) return;
    for (const [field, stored] of Object.entries(question.directFields)) {
      if (stored === "direct_input" || stored === "direct_input_detail") profile[`${field}_detail`] = note;
    }
    return;
  }
  const choice = question.choices.find((item) => item.value === value);
  if (!choice) return;
  Object.assign(profile, choice.fields);
}

export function buildUnclearProfile(answers: Record<string, string>): UnclearProfile {
  const profile: UnclearProfile = {};
  applyQuestion(profile, ENTRY, answers);
  const route = selectedUnclearRoute(answers);
  if (!route) return profile;
  for (const question of [...questionsFor(route, 1), ...questionsFor(route, 2)]) {
    applyQuestion(profile, question, answers);
  }
  return profile;
}

export function unclearLabel(value: string): string {
  if (!value) return "";
  return UNCLEAR_CONTENT_FINAL.labels[value as keyof typeof UNCLEAR_CONTENT_FINAL.labels] ?? "";
}

function choiceOf(question: UnclearQuestion, answers: Record<string, string>): UnclearChoice | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value || value === "other") return null;
  return question.choices.find((item) => item.value === value) ?? null;
}

function isDirect(question: UnclearQuestion, answers: Record<string, string>): boolean {
  return answers[question.id] === "other";
}

function readString(map: object, key: string): string | null {
  const value = (map as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function questionByCode(route: RouteId, code: string): UnclearQuestion {
  const question = QUESTIONS.find((item) => item.route === route && item.code === code);
  if (!question) throw new Error(`missing unclear question ${code}`);
  return question;
}

function cardSentence(route: RouteId, question: UnclearQuestion, answers: Record<string, string>): string | null {
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return DIRECT_NOTICE;
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const card = UNCLEAR_CONTENT_FINAL.firstResult[route].cards.find((item) => item.questionCode === question.code);
  if (!card) return null;
  return readString(card.sentences, pairKey(choice.fields));
}

function verdictOf(route: RouteId, answers: Record<string, string>): { headline: string; body: string } | null {
  const code = UNCLEAR_CONTENT_FINAL.firstResult[route].verdictQuestionCode;
  const question = questionByCode(route, code);
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return { headline: DIRECT_NOTICE, body: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const verdict = (UNCLEAR_CONTENT_FINAL.firstResult[route].verdicts as Record<string, unknown>)[pairKey(choice.fields)];
  if (!verdict || typeof verdict !== "object") return null;
  const row = verdict as { headline?: string; body?: string };
  if (!row.headline?.trim() || !row.body?.trim()) return null;
  return { headline: row.headline, body: row.body };
}

function phase2Sentence(route: RouteId, question: UnclearQuestion, answers: Record<string, string>) {
  if (!answered(answers, question.id)) return null;
  const block = UNCLEAR_CONTENT_FINAL.phase2Result[route].find((item) => item.questionCode === question.code);
  if (!block) return null;
  if (isDirect(question, answers)) return { title: block.title, sentence: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const sentence = readString(block.sentences, pairKey(choice.fields));
  if (!sentence) return null;
  return { title: block.title, sentence };
}

function clauseHit(profile: UnclearProfile, clause: { field: string; values: readonly string[] }): boolean {
  return clause.values.includes(profile[clause.field] ?? "");
}

export function unclearConnectionMatches(answers: Record<string, string>) {
  const profile = buildUnclearProfile(answers);
  return UNCLEAR_CONTENT_FINAL.connections.filter((row) => {
    const mode = row.mode as string;
    const clauses = ("clauses" in row ? row.clauses : []) as readonly { field: string; values: readonly string[] }[];
    if (mode === "always") return true;
    return mode === "and"
      ? clauses.every((clause) => clauseHit(profile, clause))
      : clauses.some((clause) => clauseHit(profile, clause));
  });
}

function visibleConnections(answers: Record<string, string>) {
  const matched = unclearConnectionMatches(answers);
  const always = matched.filter((row) => row.mode === "always");
  const ranked = LINK_PRIORITY.flatMap((name) => matched.filter((row) => row.mode !== "always" && row.name.startsWith(name)));
  return [...ranked.slice(0, 2), ...always];
}

function matchingRisks(route: RouteId, profile: UnclearProfile): { lines: string[]; fallback: boolean } {
  const spec = UNCLEAR_CONTENT_FINAL.firstResult[route].risks;
  const lines: string[] = [];
  for (const rule of spec.rules) {
    if (!rule.clauses.some((clause) => clauseHit(profile, clause))) continue;
    lines.push(rule.sentence);
    if (lines.length === spec.max) break;
  }
  if (lines.length === 0) return { lines: [spec.fallback], fallback: true };
  return { lines, fallback: false };
}

export function unclearRiskSentences(answers: Record<string, string>): string[] {
  const route = selectedUnclearRoute(answers);
  if (!route) return [];
  return matchingRisks(route, buildUnclearProfile(answers)).lines;
}

// A14 information density: keep 2nd-stage report lines few and drop filler lines.
const REPORT_PHASE2_MAX_LINES = 5;
const REPORT_FILLER_PATTERN = /직접 적어 주신|원본이 있으면|전문가가 함께/;

function splitChoiceSentences(label: string): { label: string; description?: string } {
  const match = label.match(/^([\s\S]+?[.?!。])\s+(\S[\s\S]*)$/);
  if (!match) return { label };
  return { label: match[1], description: match[2] };
}

function toReview(question: UnclearQuestion): PackReviewQuestion {
  const options = question.choices.map((choice) => {
    if (choice.description) return { value: choice.value, label: choice.label, description: choice.description };
    const split = splitChoiceSentences(choice.label);
    return split.description
      ? { value: choice.value, label: split.label, description: split.description }
      : { value: choice.value, label: split.label };
  });
  const withDirect = options.some(isAdminDirectExplainOption) ? options : [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];
  return {
    id: question.id,
    kind: "choice",
    label: question.prompt,
    ...(question.subtitle ? { description: question.subtitle } : {}),
    options: withDirect,
  };
}

function phase1Questions(answers: Record<string, string>): UnclearQuestion[] {
  const route = selectedUnclearRoute(answers);
  if (!route) return [ENTRY];
  return [ENTRY, ...questionsFor(route, 1)];
}

function phase2Questions(answers: Record<string, string>): UnclearQuestion[] {
  const route = selectedUnclearRoute(answers);
  if (!route) return [];
  return questionsFor(route, 2);
}

export function unclearStitchProgress(answers: Record<string, string>, profilePhase: 1 | 2, activeIndex: number) {
  const route = selectedUnclearRoute(answers);
  const index = activeIndex >= 0 ? activeIndex : 0;
  if (profilePhase === 2 && route) return { current: index + 1, total: questionsFor(route, 2).length };
  if (!route) return { current: 1, total: 1 };
  return { current: index + 1, total: 1 + questionsFor(route, 1).length };
}

export function isUnclearPhase1Complete(answers: Record<string, string>): boolean {
  const route = selectedUnclearRoute(answers);
  if (!route || !answered(answers, ENTRY.id)) return false;
  return questionsFor(route, 1).every((question) => answered(answers, question.id));
}

export function isUnclearPhase2Complete(answers: Record<string, string>): boolean {
  const route = selectedUnclearRoute(answers);
  if (!route) return false;
  return questionsFor(route, 2).every((question) => answered(answers, question.id));
}

function afterResultLines(profile: UnclearProfile): string[] {
  const stage = profile.unclear_reviewStage;
  if (stage === "post") return [...UNCLEAR_CONTENT_FINAL.afterResultGuide.post];
  if (stage === "pre") return [...UNCLEAR_CONTENT_FINAL.afterResultGuide.pre];
  return [];
}

function buildResult(answers: Record<string, string>, phase2: boolean): AdminVerifyFirstResultData | null {
  const route = selectedUnclearRoute(answers);
  if (!route || !isUnclearPhase1Complete(answers)) return null;
  const profile = buildUnclearProfile(answers);
  const verdict = verdictOf(route, answers);
  if (!verdict) return null;
  const keyMetrics = UNCLEAR_CONTENT_FINAL.firstResult[route].cards.flatMap((card) => {
    const question = questionByCode(route, card.questionCode);
    const sentence = cardSentence(route, question, answers);
    if (!sentence) return [];
    return [{ label: card.title, title: sentence, footnote: sentence, status: "ok" as const }];
  });
  const risks = matchingRisks(route, profile);
  const phase2Blocks = phase2
    ? questionsFor(route, 2)
        .map((question) => phase2Sentence(route, question, answers))
        .filter((block) => block != null)
    : [];
  const routeLabel =
    route === "M" ? "돈을 내라는 서류" : route === "D" ? "서류 제출·출석 서류" : "내용을 모르는 서류";
  const guide = afterResultLines(profile);
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
    actions: guide,
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

export function unclearFirstResultCustomerLength(answers: Record<string, string>): number {
  const data = buildResult(answers, false);
  if (!data) return 0;
  return [data.statusHeadline, data.situationSummary, ...data.keyMetrics.map((metric) => metric.footnote), ...data.cautions]
    .join("\n").length;
}

function contentSlotsFor(answers: Record<string, string>): VerifyMasterContentSlots["firstResult"] {
  const links = visibleConnections(answers).flatMap((row) => {
    const path = Object.entries(LINK_BY_NAME).find(([name]) => row.name.startsWith(name))?.[1];
    if (!path || !row.sentence) return [];
    return [{ label: row.sentence, targetServiceEntryPath: path }];
  });
  const expert = visibleConnections(answers).find((row) => row.name.startsWith("전문가"));
  return {
    firstResultTitle: "불확실한 문서 검토 1차 종합 결과",
    firstResultIntro: "입력하신 답변을 바탕으로 정리한 1차 검토입니다.",
    personalizedResultTitle: "불확실한 문서 검토 2차 결과",
    personalizedResultIntro: "1차 확인과 추가 답변을 반영한 검토입니다.",
    paidDetailReviewDescription: "내 상황과 자료를 바탕으로 서류가 무엇을 요구하는지 더 확인합니다.",
    firstResultCautionsSectionSubtitle: "| 이어서 확인할 포인트",
    serviceLinks: links,
    identity: {
      ...UNCLEAR_IDENTITY,
      nextStepCard: {
        ...UNCLEAR_IDENTITY.nextStepCard,
        subcopy: expert?.sentence || UNCLEAR_IDENTITY.nextStepCard.subcopy,
      },
    },
  };
}

const BASE_SLOTS: VerifyMasterContentSlots = {
  identity: UNCLEAR_IDENTITY,
  evidence: {
    exampleTags: ["받은 서류", "캡처", "발신처 기록", "기한 표시", "관련 안내"],
    identity: UNCLEAR_IDENTITY,
  },
  firstResult: contentSlotsFor({}),
};

export function createUnclearVerifyMasterPackBridge(): VerifyMasterPackBridge {
  return {
    buildReviewQuestions(answers, profilePhase: AdminVerifyProfilePhase) {
      const source = profilePhase === 1 ? phase1Questions(answers) : phase2Questions(answers);
      return source.map(toReview);
    },
    isPhase1Complete: isUnclearPhase1Complete,
    isPhase2QuestionSetComplete: isUnclearPhase2Complete,
    buildFirstResult(answers) {
      return buildResult(answers, false);
    },
    buildPersonalizedResult(answers) {
      if (!isUnclearPhase2Complete(answers)) return null;
      return buildResult(answers, true);
    },
    resolveFirstResultTransition() {
      return {
        hookHeadline: "이어서 자료를 대조할 수 있습니다",
        hookWhy: "답변만으로 서류의 진위나 법적 효력을 정하지 않기 위해 자료 확인이 이어집니다.",
        hookWho: "받은 서류나 캡처를 가진 경우에 이어서 확인할 수 있습니다.",
        hookWhatMore: UNCLEAR_IDENTITY.nextStepCard.subcopy,
        trustLine: "확인된 사실과 고객이 가진 자료를 기준으로 정리합니다.",
      };
    },
    getContentSlots: () => BASE_SLOTS,
    getFirstResultContentSlots(answers) {
      return contentSlotsFor(answers);
    },
    stitchProgress: unclearStitchProgress,
    getSignupRiskLevel(answers) {
      const route = selectedUnclearRoute(answers);
      if (!route) return "medium";
      const risks = matchingRisks(route, buildUnclearProfile(answers));
      return risks.fallback ? "low" : "medium";
    },
  };
}

export function buildUnclearMemberVerifyMeta(
  answers: Record<string, string>,
  file?: { storagePath: string; file_name: string } | null,
): Record<string, unknown> {
  const profile = buildUnclearProfile(answers);
  const first = buildResult(answers, false);
  return {
    unclear_pack_v1: true,
    ...answers,
    ...profile,
    unclear_expert_summary: first?.situationSummary ?? "",
    ...(file
      ? {
          storagePath: file.storagePath,
          file_name: file.file_name,
          submitted_document: { storagePath: file.storagePath, file_name: file.file_name },
        }
      : {}),
  };
}

const UNCLEAR_PACK_CASE_META_KEY = "unclear_pack_case_id";
const UNCLEAR_PACK_V1_FLAG = "unclear_pack_v1";
const UNCLEAR_PACK_PHASE2_SUMMARY_META_KEY = "unclear_pack_phase2_summary";
const UNCLEAR_PACK_HEADLINE_META_KEY = "unclear_pack_headline";

export function resolveUnclearCaseFromAnswers(answers: Record<string, string>): string {
  return selectedUnclearRoute(answers) ?? "unknown";
}

function serializeAnswers(answers: Record<string, string>): string {
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(answers)) {
    const text = String(val ?? "").trim();
    if (text) payload[key] = text;
  }
  return JSON.stringify(payload);
}

export function buildUnclearPhase2PersistMeta(answers: Record<string, string>, profilePhase: 1 | 2): Record<string, string> {
  const meta: Record<string, string> = {
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: serializeAnswers(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
    [UNCLEAR_PACK_V1_FLAG]: "true",
    [UNCLEAR_PACK_CASE_META_KEY]: resolveUnclearCaseFromAnswers(answers),
  };
  if (profilePhase === 2) {
    const personalized = buildResult(answers, true);
    if (personalized) {
      const lines = (personalized.personalizedContext?.phase2Additions ?? []).map((line) => line.trim()).filter(Boolean);
      meta[UNCLEAR_PACK_PHASE2_SUMMARY_META_KEY] = lines.join("\n");
      const headline = personalized.statusHeadline?.trim() || "";
      if (headline) meta[UNCLEAR_PACK_HEADLINE_META_KEY] = headline;
    }
  }
  return meta;
}

export function restoreUnclearAnswersFromVerifyMeta(meta: Record<string, unknown>): Record<string, string> | null {
  const raw = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function latestMetaString(activities: CrmActivityLike[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = (meta as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

export function buildUnclearVerifyMypagePackExtras(activities: CrmActivityLike[]) {
  const phase2Complete = isAdminPhase2DocumentsUploadComplete(activities);
  const summary = latestMetaString(activities, UNCLEAR_PACK_PHASE2_SUMMARY_META_KEY) ?? "";
  const lines = summary.split("\n").map((line) => line.trim()).filter(Boolean);
  return { phase2Complete, phase2SummaryLines: lines, ...(phase2Complete ? { phase1SummaryLines: lines.slice(0, 2) } : {}) };
}

export function buildUnclearExpertHandoffMeta(answers: Record<string, string>): Record<string, string> {
  const first = buildResult(answers, isUnclearPhase2Complete(answers));
  return { unclear_pack_v1: "true", unclear_expert_summary: first?.situationSummary ?? "", ...buildUnclearProfile(answers) };
}

export const UNCLEAR_PDF_MISSING_FILE_NOTICE = UNCLEAR_CONTENT_FINAL.reportFixed.missingFileNotice;

function customerChoiceText(question: UnclearQuestion, answers: Record<string, string>): string | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return null;
  if (value === "other") return answers[getAdminChoiceNoteKey(question.id)]?.trim() || DIRECT_NOTICE;
  const choice = question.choices.find((item) => item.value === value);
  if (!choice) return null;
  return choice.description ? `${choice.label} ${choice.description}` : choice.label;
}

/** 보고서용: 선택지의 굵은 요점만 쓴다. 요점이 없으면 첫 문장을 쓴다. */
function customerChoiceLead(question: UnclearQuestion, answers: Record<string, string>): string | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return null;
  if (value === "other") return answers[getAdminChoiceNoteKey(question.id)]?.trim() || DIRECT_NOTICE;
  const choice = question.choices.find((item) => item.value === value);
  if (!choice) return null;
  return choice.description ? choice.label : splitChoiceSentences(choice.label).label;
}

function answersFromActivities(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const restored = restoreUnclearAnswersFromVerifyMeta(meta as Record<string, unknown>);
    if (restored && Object.keys(restored).length > 0) return restored;
  }
  return {};
}

export function unclearAttachedFileNames(activities: CrmActivityLike[]): string[] {
  const names: string[] = [];
  for (const activity of activities) {
    const meta = activity?.meta;
    if (!meta || typeof meta !== "object") continue;
    const record = meta as Record<string, unknown>;
    for (const key of ["fileName", "file_name"] as const) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) names.push(value.trim());
    }
  }
  return [...new Set(names)];
}

export function buildUnclearVerifyAiReportContentFromActivities(activities: CrmActivityLike[]) {
  const answers = answersFromActivities(activities);
  const route = selectedUnclearRoute(answers);
  const first = route ? buildResult(answers, false) : null;
  const files = unclearAttachedFileNames(activities);
  const paid = isVerifyAdminPaidAiReportPdfActivities(activities);
  const entryText = customerChoiceLead(ENTRY, answers) || "불확실한 문서 검토";
  const basis = paid ? "1차·2차 답변" : "1차 답변";
  const keyFindings: string[] = ["■ 1차 확인 사항"];
  const seen = new Set<string>();
  const add = (text: string) => {
    const line = text.trim();
    if (!line || seen.has(line)) return;
    seen.add(line);
    keyFindings.push(line.startsWith("■") || line.startsWith("✓") ? line : `✓ ${line}`);
  };
  if (route) {
    for (const question of questionsFor(route, 1)) {
      const lead = customerChoiceLead(question, answers);
      if (lead) add(lead);
    }
  }
  if (paid && route) {
    keyFindings.push("■ 2차 확인");
    let phase2Lines = 0;
    for (const question of questionsFor(route, 2)) {
      const block = phase2Sentence(route, question, answers);
      if (!block || phase2Lines >= REPORT_PHASE2_MAX_LINES) continue;
      const line = `${block.title} · ${splitChoiceSentences(block.sentence).label}`;
      if (REPORT_FILLER_PATTERN.test(line)) continue;
      add(line);
      phase2Lines += 1;
    }
  }
  const guideKey = route ?? "N";
  const priorityNames = UNCLEAR_CONTENT_FINAL.reportGuide.routes[guideKey].checklist.rows
    .slice(0, 2)
    .map((row) => row.name.trim())
    .filter(Boolean);
  return {
    execSummary: [`결론 · 선택하신 검토 방향은 “${entryText}”입니다. ${basis}을 기준으로 정리한 결과이며, 서류의 진위나 법적 효력은 판단하지 않습니다.`],
    keyFindings,
    keyRisks: (first?.cautions ?? []).filter(Boolean).slice(0, 4),
    recommendedAction: (() => {
      const lines = visibleConnections(answers).map((row) => row.sentence).filter(Boolean);
      const body = first?.situationSummary?.trim() ?? "";
      const now = splitChoiceSentences(body).description ?? body;
      const out: string[] = [];
      if (now) out.push(`즉시 · ${now}`);
      if (lines[0]) out.push(`다음 · ${lines[0]}`);
      return out;
    })(),
    riskCount: 0,
    reviewedCount: 0,
    satisfiedCount: 0,
    mandatoryDocumentLines: priorityNames.length > 0 ? priorityNames : files.length > 0 ? files : [UNCLEAR_PDF_MISSING_FILE_NOTICE],
    docsCardText: files.length > 0 ? `${files.length}건` : "미정",
    executiveHeadline: first?.statusHeadline?.trim() ?? "",
    executiveBody: first?.situationSummary?.trim() ?? "",
    hideScoreMetrics: true as const,
  };
}
