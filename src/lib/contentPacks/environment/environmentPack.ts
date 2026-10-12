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
import { type ResultTone } from "@/lib/checkDiagnosis";
import { registerRuleTone, type RegisterKeyStatus, type RegisterStatus } from "@/lib/contentPacks/registerRule";
import type { VerifyMasterContentSlots } from "@/lib/verifyMasterContentSlots";
import type { PackReviewQuestion, VerifyMasterPackBridge } from "@/lib/verifyMasterPackBridge";
import { ENVIRONMENT_CONTENT_FINAL } from "./environmentContentFinal.data";

export { ENVIRONMENT_CONTENT_FINAL };

type EnvironmentChoice = {
  value: string;
  label: string;
  description: string;
  fields: Record<string, string>;
};

type EnvironmentQuestion = {
  code: string;
  id: string;
  route: string;
  phase: number;
  prompt: string;
  choices: readonly EnvironmentChoice[];
  directFields: Record<string, string>;
};

type Clause = { field: string; values: readonly string[] };

const QUESTIONS = ENVIRONMENT_CONTENT_FINAL.questions as unknown as readonly EnvironmentQuestion[];
const DIRECT_NOTICE = ENVIRONMENT_CONTENT_FINAL.directNotice;

const ENVIRONMENT_IDENTITY = {
  serviceDisplayName: "환경 허가 직접 확인",
  breadcrumb: {
    service: "환경 허가 CHECK",
    phase: "환경 허가 확인",
    pageMetaLabel: "환경 허가 CHECK",
    pageMetaSuffix: "환경 허가 확인",
  },
  sectionLabels: {
    section01: "01 현재 상황",
    section01Meta: "확인된 상황",
    section02: "02 확인할 점",
    section05: "05 다음 확인",
    section05Title: "이어서 확인할 방법",
    personalizedIntroSubtitle: "1차 확인과 추가 답변을 반영한 환경 허가 확인입니다.",
  },
  nextStepCard: {
    sectionLabel: "다음 확인",
    headline: "추가 확인 또는 VFBCAI 전문가팀 검토로 이어갈 수 있습니다",
    subcopy: "확인된 답변과 자료를 기준으로 다음 검토를 선택합니다.",
    reportTitle: "AI 리포트 요청하기",
    reportDescription: "확인된 답변을 바탕으로 개인화된 검토를 정리합니다.",
  },
};

export type EnvironmentProfile = Record<string, string>;

function pairKey(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function questionsFor(phase: 1 | 2): EnvironmentQuestion[] {
  return QUESTIONS.filter((question) => question.phase === phase);
}

function answered(answers: Record<string, string>, id: string): boolean {
  return Boolean(answers[id]?.trim());
}

function applyQuestion(profile: EnvironmentProfile, question: EnvironmentQuestion, answers: Record<string, string>): void {
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

export function buildEnvironmentProfile(answers: Record<string, string>): EnvironmentProfile {
  const profile: EnvironmentProfile = {};
  for (const question of [...questionsFor(1), ...questionsFor(2)]) applyQuestion(profile, question, answers);
  return profile;
}

export function environmentLabel(value: string): string {
  if (!value) return "";
  return (ENVIRONMENT_CONTENT_FINAL.labels as Record<string, string>)[value] ?? "";
}

function choiceOf(question: EnvironmentQuestion, answers: Record<string, string>): EnvironmentChoice | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value || value === "other") return null;
  return question.choices.find((item) => item.value === value) ?? null;
}

function isDirect(question: EnvironmentQuestion, answers: Record<string, string>): boolean {
  return answers[question.id] === "other";
}

function readString(map: object, key: string): string | null {
  const value = (map as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function questionByCode(code: string): EnvironmentQuestion {
  const question = QUESTIONS.find((item) => item.code === code);
  if (!question) throw new Error(`missing environment question ${code}`);
  return question;
}

function cardSentence(code: string, answers: Record<string, string>): string | null {
  const question = questionByCode(code);
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return DIRECT_NOTICE;
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const card = ENVIRONMENT_CONTENT_FINAL.firstResult.cards.find((item) => item.questionCode === code);
  if (!card) return null;
  return readString(card.sentences, pairKey(choice.fields));
}

function summaryOf(answers: Record<string, string>): { headline: string; body: string } | null {
  const question = questionByCode(ENVIRONMENT_CONTENT_FINAL.firstResult.verdictQuestionCode);
  if (!answered(answers, question.id)) return null;
  if (isDirect(question, answers)) return { headline: DIRECT_NOTICE, body: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const row = (ENVIRONMENT_CONTENT_FINAL.firstResult.verdicts as Record<string, { headline?: string; body?: string }>)[pairKey(choice.fields)];
  if (!row?.headline?.trim() || !row.body?.trim()) return null;
  return { headline: row.headline, body: row.body };
}

function phase2Sentence(question: EnvironmentQuestion, answers: Record<string, string>) {
  if (!answered(answers, question.id)) return null;
  const block = ENVIRONMENT_CONTENT_FINAL.phase2Result.find((item) => item.questionCode === question.code);
  if (!block) return null;
  if (isDirect(question, answers)) return { title: block.title, sentence: DIRECT_NOTICE };
  const choice = choiceOf(question, answers);
  if (!choice) return null;
  const sentence = readString(block.sentences, pairKey(choice.fields));
  if (!sentence) return null;
  return { title: block.title, sentence };
}

function clauseHit(profile: EnvironmentProfile, clause: Clause): boolean {
  return clause.values.includes(profile[clause.field] ?? "");
}

export function environmentConnectionMatches(answers: Record<string, string>) {
  const profile = buildEnvironmentProfile(answers);
  return ENVIRONMENT_CONTENT_FINAL.connections.filter((row) =>
    (row.clauses as unknown as readonly Clause[]).some((clause) => clauseHit(profile, clause)),
  );
}

function matchingRisks(profile: EnvironmentProfile): { lines: string[]; fallback: boolean } {
  const spec = ENVIRONMENT_CONTENT_FINAL.firstResult.risks;
  const lines: string[] = [];
  for (const rule of spec.rules) {
    if (!(rule.clauses as unknown as readonly Clause[]).some((clause) => clauseHit(profile, clause))) continue;
    lines.push(rule.sentence);
    if (lines.length === spec.max) break;
  }
  if (lines.length === 0) return { lines: [spec.fallback], fallback: true };
  return { lines, fallback: false };
}

export function environmentRiskSentences(answers: Record<string, string>): string[] {
  return matchingRisks(buildEnvironmentProfile(answers)).lines;
}

/** 기존 판정(src/app/register/environment/page.tsx의 진단 함수)과 같은 규칙에 넣을 입력. 화면 파일의 판정은 바꾸지 않는다. */
export function environmentDiagnosisInput(answers: Record<string, string>): { registration: RegisterStatus; key: RegisterKeyStatus } {
  const profile = buildEnvironmentProfile(answers);
  const map = ENVIRONMENT_CONTENT_FINAL.diagnosisMap as unknown as Record<"registration" | "key", Record<string, string | null>>;
  const fields = ENVIRONMENT_CONTENT_FINAL.diagnosisFields;
  return {
    registration: (map.registration[profile[fields.registration] ?? ""] ?? null) as RegisterStatus,
    key: (map.key[profile[fields.key] ?? ""] ?? null) as RegisterKeyStatus,
  };
}

export function environmentResultTone(answers: Record<string, string>): ResultTone | null {
  const input = environmentDiagnosisInput(answers);
  return registerRuleTone(input.registration, input.key);
}

const TONE_HEADLINE: Record<ResultTone | "unknown", string> = {
  possible: "현재 답변 기준으로 허가 신청을 진행할 수 있는 상태에 가깝습니다",
  conditional: "현재 답변 기준으로 보완이 필요한 조건이 있습니다",
  impossible: "현재 답변 기준으로는 신청 전에 해결할 문제가 있습니다",
  unknown: "현재 답변만으로는 판단하기 어려워 추가 확인이 필요합니다",
};

export function environmentTierRecommendation(answers: Record<string, string>): { tier: string; label: string } {
  const profile = buildEnvironmentProfile(answers);
  for (const rule of ENVIRONMENT_CONTENT_FINAL.tier.rules) {
    if ((rule.clauses as unknown as readonly Clause[]).some((clause) => clauseHit(profile, clause))) {
      return { tier: rule.tier, label: rule.label };
    }
  }
  return { ...ENVIRONMENT_CONTENT_FINAL.tier.fallback };
}

const REPORT_PHASE2_MAX_LINES = 5;

function toReview(question: EnvironmentQuestion): PackReviewQuestion {
  const options = question.choices.map((choice) => ({ value: choice.value, label: choice.label, description: choice.description }));
  const withDirect = options.some(isAdminDirectExplainOption) ? options : [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];
  return { id: question.id, kind: "choice", label: question.prompt, options: withDirect };
}

export function environmentStitchProgress(_answers: Record<string, string>, profilePhase: 1 | 2, activeIndex: number) {
  const index = activeIndex >= 0 ? activeIndex : 0;
  return { current: index + 1, total: questionsFor(profilePhase).length };
}

export function isEnvironmentPhase1Complete(answers: Record<string, string>): boolean {
  return questionsFor(1).every((question) => answered(answers, question.id));
}

export function isEnvironmentPhase2Complete(answers: Record<string, string>): boolean {
  return questionsFor(2).every((question) => answered(answers, question.id));
}

function buildResult(answers: Record<string, string>, phase2: boolean): AdminVerifyFirstResultData | null {
  if (!isEnvironmentPhase1Complete(answers)) return null;
  const summary = summaryOf(answers);
  if (!summary) return null;
  const profile = buildEnvironmentProfile(answers);
  const risks = matchingRisks(profile);
  const keyMetrics = ENVIRONMENT_CONTENT_FINAL.firstResult.cards.flatMap((card) => {
    const sentence = cardSentence(card.questionCode, answers);
    if (!sentence) return [];
    return [{ label: card.title, title: sentence, footnote: sentence, status: "ok" as const }];
  });
  const phase2Blocks = phase2
    ? questionsFor(2)
        .map((question) => phase2Sentence(question, answers))
        .filter((block) => block != null)
    : [];
  // 판정과 서비스 단계 추천은 유료 개인화(2차) 결과에서만 표시한다.
  const tone = phase2 ? (environmentResultTone(answers) ?? "unknown") : null;
  const tier = phase2 ? environmentTierRecommendation(answers) : null;
  const guide = [...ENVIRONMENT_CONTENT_FINAL.afterResultGuide];
  const headline = tone ? TONE_HEADLINE[tone] : summary.headline;
  return {
    stageLabel: phase2 ? "2차 검토" : "1차 검토",
    statusHeadline: headline,
    statusTone: phase2 ? (tone === "possible" ? "ok" : "caution") : risks.fallback ? "ok" : "caution",
    situationSummary: phase2 ? `${summary.headline}. ${summary.body}` : summary.body,
    gradeFilled: risks.fallback ? 1 : Math.min(5, risks.lines.length),
    gradeLabel: "답변 기준",
    keyMetrics: phase2
      ? phase2Blocks.map((block) => ({ label: block.title, title: block.sentence, footnote: block.sentence, status: "ok" as const }))
      : keyMetrics,
    cautions: risks.lines,
    unconfirmed: [],
    actions: tier ? [`추천 서비스 단계(참고) · ${tier.label}`, ...guide] : guide,
    referenceDateLabel: "이번 답변 기준",
    caseClassificationLabel: "환경 허가 확인",
    ...(phase2 ? {} : { neutralFirstResult: true }),
    personalizedContext: phase2
      ? {
          integratedSituation: `${headline} ${summary.body}`.trim(),
          phase1Facts: [summary.body],
          phase2Additions: phase2Blocks.map((block) => `${block.title}: ${block.sentence}`),
          documentsNeededNote: "",
        }
      : undefined,
  };
}

export function environmentFirstResultCustomerLength(answers: Record<string, string>): number {
  const data = buildResult(answers, false);
  if (!data) return 0;
  return [data.statusHeadline, data.situationSummary, ...data.keyMetrics.map((metric) => metric.footnote), ...data.cautions]
    .join("\n").length;
}

const LINK_BY_NAME: Record<string, string> = Object.fromEntries(
  ENVIRONMENT_CONTENT_FINAL.connections.flatMap((row) => ("path" in row && row.path ? [[row.name, row.path as string]] : [])),
);

function contentSlotsFor(answers: Record<string, string>): VerifyMasterContentSlots["firstResult"] {
  const matches = environmentConnectionMatches(answers);
  const links = matches.flatMap((row) => {
    const path = LINK_BY_NAME[row.name];
    if (!path || !row.sentence) return [];
    return [{ label: row.sentence, targetServiceEntryPath: path }];
  });
  const expert = matches.find((row) => row.name.startsWith("전문가"));
  return {
    firstResultTitle: "환경 허가 확인 1차 종합 결과",
    firstResultIntro: "입력하신 답변을 바탕으로 정리한 1차 확인입니다.",
    personalizedResultTitle: "환경 허가 확인 2차 결과",
    personalizedResultIntro: "1차 확인과 추가 답변을 반영한 확인입니다.",
    paidDetailReviewDescription: "내 상황과 서류를 바탕으로 신청 가능성과 준비 순서를 더 확인합니다.",
    firstResultCautionsSectionSubtitle: "| 이어서 확인할 포인트",
    serviceLinks: links,
    identity: {
      ...ENVIRONMENT_IDENTITY,
      nextStepCard: { ...ENVIRONMENT_IDENTITY.nextStepCard, subcopy: expert?.sentence || ENVIRONMENT_IDENTITY.nextStepCard.subcopy },
    },
  };
}

const BASE_SLOTS: VerifyMasterContentSlots = {
  identity: ENVIRONMENT_IDENTITY,
  evidence: { exampleTags: ["여권", "비자", "환경 허가서", "회사 서류", "견적서"], identity: ENVIRONMENT_IDENTITY },
  firstResult: contentSlotsFor({}),
};

export function createEnvironmentVerifyMasterPackBridge(): VerifyMasterPackBridge {
  return {
    buildReviewQuestions(_answers, profilePhase: AdminVerifyProfilePhase) {
      return questionsFor(profilePhase === 1 ? 1 : 2).map(toReview);
    },
    isPhase1Complete: isEnvironmentPhase1Complete,
    isPhase2QuestionSetComplete: isEnvironmentPhase2Complete,
    buildFirstResult(answers) {
      return buildResult(answers, false);
    },
    buildPersonalizedResult(answers) {
      if (!isEnvironmentPhase2Complete(answers)) return null;
      return buildResult(answers, true);
    },
    resolveFirstResultTransition() {
      return {
        hookHeadline: "이어서 내 상황에 맞춰 더 확인할 수 있습니다",
        hookWhy: "1차 답변만으로는 발급 가능 여부를 정하지 않기 때문에 추가 확인이 이어집니다.",
        hookWho: "비자와 회사 서류, 거주 신고 상태를 더 자세히 확인하고 싶은 경우에 이어서 확인할 수 있습니다.",
        hookWhatMore: ENVIRONMENT_IDENTITY.nextStepCard.subcopy,
        trustLine: "확인된 사실과 고객이 가진 서류를 기준으로 정리합니다.",
      };
    },
    getContentSlots: () => BASE_SLOTS,
    getFirstResultContentSlots(answers) {
      return contentSlotsFor(answers);
    },
    stitchProgress: environmentStitchProgress,
    getSignupRiskLevel(answers) {
      return matchingRisks(buildEnvironmentProfile(answers)).fallback ? "low" : "medium";
    },
  };
}

const ENVIRONMENT_PACK_V1_FLAG = "environment_pack_v1";
const ENVIRONMENT_PACK_CASE_META_KEY = "environment_pack_case_id";
const ENVIRONMENT_PACK_PHASE2_SUMMARY_META_KEY = "environment_pack_phase2_summary";
const ENVIRONMENT_PACK_HEADLINE_META_KEY = "environment_pack_headline";

export function resolveEnvironmentCaseFromAnswers(_answers: Record<string, string>): string {
  return "environment";
}

function serializeAnswers(answers: Record<string, string>): string {
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(answers)) {
    const text = String(val ?? "").trim();
    if (text) payload[key] = text;
  }
  return JSON.stringify(payload);
}

export function buildEnvironmentMemberVerifyMeta(
  answers: Record<string, string>,
  file?: { storagePath: string; file_name: string } | null,
): Record<string, unknown> {
  const profile = buildEnvironmentProfile(answers);
  const first = buildResult(answers, false);
  return {
    [ENVIRONMENT_PACK_V1_FLAG]: true,
    ...answers,
    ...profile,
    environment_expert_summary: first?.situationSummary ?? "",
    ...(file
      ? {
          storagePath: file.storagePath,
          file_name: file.file_name,
          submitted_document: { storagePath: file.storagePath, file_name: file.file_name },
        }
      : {}),
  };
}

export function buildEnvironmentPhase2PersistMeta(answers: Record<string, string>, profilePhase: 1 | 2): Record<string, string> {
  const meta: Record<string, string> = {
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: serializeAnswers(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
    [ENVIRONMENT_PACK_V1_FLAG]: "true",
    [ENVIRONMENT_PACK_CASE_META_KEY]: resolveEnvironmentCaseFromAnswers(answers),
  };
  if (profilePhase === 2) {
    const personalized = buildResult(answers, true);
    if (personalized) {
      const lines = (personalized.personalizedContext?.phase2Additions ?? []).map((line) => line.trim()).filter(Boolean);
      meta[ENVIRONMENT_PACK_PHASE2_SUMMARY_META_KEY] = lines.join("\n");
      const headline = personalized.statusHeadline?.trim() || "";
      if (headline) meta[ENVIRONMENT_PACK_HEADLINE_META_KEY] = headline;
    }
  }
  return meta;
}

export function restoreEnvironmentAnswersFromVerifyMeta(meta: Record<string, unknown>): Record<string, string> | null {
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

export function buildEnvironmentVerifyMypagePackExtras(activities: CrmActivityLike[]) {
  const phase2Complete = isAdminPhase2DocumentsUploadComplete(activities);
  const summary = latestMetaString(activities, ENVIRONMENT_PACK_PHASE2_SUMMARY_META_KEY) ?? "";
  const lines = summary.split("\n").map((line) => line.trim()).filter(Boolean);
  return { phase2Complete, phase2SummaryLines: lines, ...(phase2Complete ? { phase1SummaryLines: lines.slice(0, 2) } : {}) };
}

export function buildEnvironmentExpertHandoffMeta(answers: Record<string, string>): Record<string, string> {
  const first = buildResult(answers, isEnvironmentPhase2Complete(answers));
  return { [ENVIRONMENT_PACK_V1_FLAG]: "true", environment_expert_summary: first?.situationSummary ?? "", ...buildEnvironmentProfile(answers) };
}

export const ENVIRONMENT_PDF_MISSING_FILE_NOTICE = ENVIRONMENT_CONTENT_FINAL.reportFixed.missingFileNotice;

/** 보고서용: 선택지의 굵은 요점(첫 문장)만 쓴다. */
function customerChoiceLead(question: EnvironmentQuestion, answers: Record<string, string>): string | null {
  const value = answers[question.id]?.trim() ?? "";
  if (!value) return null;
  if (value === "other") return answers[getAdminChoiceNoteKey(question.id)]?.trim() || DIRECT_NOTICE;
  return question.choices.find((item) => item.value === value)?.label ?? null;
}

function answersFromActivities(activities: CrmActivityLike[]): Record<string, string> {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const restored = restoreEnvironmentAnswersFromVerifyMeta(meta as Record<string, unknown>);
    if (restored && Object.keys(restored).length > 0) return restored;
  }
  return {};
}

export function environmentAttachedFileNames(activities: CrmActivityLike[]): string[] {
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

export function buildEnvironmentVerifyAiReportContentFromActivities(activities: CrmActivityLike[]) {
  const answers = answersFromActivities(activities);
  const phase1Done = isEnvironmentPhase1Complete(answers);
  const paid = isVerifyAdminPaidAiReportPdfActivities(activities);
  const first = phase1Done ? buildResult(answers, false) : null;
  const personalized = paid && isEnvironmentPhase2Complete(answers) ? buildResult(answers, true) : null;
  const files = environmentAttachedFileNames(activities);
  const basis = paid ? "1차·2차 답변" : "1차 답변";
  const keyFindings: string[] = ["■ 1차 확인 사항"];
  const seen = new Set<string>();
  const add = (text: string) => {
    const line = text.trim();
    if (!line || seen.has(line)) return;
    seen.add(line);
    keyFindings.push(line.startsWith("■") || line.startsWith("✓") ? line : `✓ ${line}`);
  };
  for (const question of questionsFor(1)) {
    const lead = customerChoiceLead(question, answers);
    if (lead) add(lead);
  }
  if (paid) {
    keyFindings.push("■ 2차 확인");
    let lines = 0;
    for (const question of questionsFor(2)) {
      const block = phase2Sentence(question, answers);
      if (!block || lines >= REPORT_PHASE2_MAX_LINES) continue;
      add(`${block.title} · ${block.sentence}`);
      lines += 1;
    }
  }
  const tier = paid && personalized ? environmentTierRecommendation(answers) : null;
  const guideLines = [...ENVIRONMENT_CONTENT_FINAL.afterResultGuide];
  return {
    execSummary: [`결론 · ${basis}을 기준으로 정리한 환경 허가 확인이며, 발급 가능 여부를 확정하지 않습니다.`],
    keyFindings,
    keyRisks: (first?.cautions ?? []).filter(Boolean).slice(0, 4),
    recommendedAction: (() => {
      const lines = environmentConnectionMatches(answers).map((row) => row.sentence).filter(Boolean);
      const out: string[] = [];
      if (first?.situationSummary) out.push(`즉시 · ${first.situationSummary}`);
      if (tier) out.push(`추천 · 서비스 단계(참고) ${tier.label}`);
      else if (lines[0]) out.push(`다음 · ${lines[0]}`);
      return out;
    })(),
    riskCount: 0,
    reviewedCount: 0,
    satisfiedCount: 0,
    mandatoryDocumentLines: guideLines.length > 0 ? guideLines.slice(0, 2) : files.length > 0 ? files : [ENVIRONMENT_PDF_MISSING_FILE_NOTICE],
    docsCardText: files.length > 0 ? `${files.length}건` : "미정",
    executiveHeadline: (personalized ?? first)?.statusHeadline?.trim() ?? "",
    executiveBody: (personalized ?? first)?.situationSummary?.trim() ?? "",
    hideScoreMetrics: true as const,
  };
}
