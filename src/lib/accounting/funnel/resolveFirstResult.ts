import type {
  AccountingEntryContentPack,
  AccountingEntryResultPack,
  AccountingFunnelLanguageNoteKey,
  AccountingResultVariant,
} from "./types";
import type { Stage1AnswerMap } from "./pathAnalysis";

const LANGUAGE_NOTE_KEYS: AccountingFunnelLanguageNoteKey[] = [
  "fluent",
  "interpreter",
  "translator",
  "none",
];

export function stage1LanguageQuestionId(pack: AccountingEntryContentPack): string | null {
  const q = pack.stage1.find((item) => item.id.endsWith("_s1_q3"));
  return q?.id ?? null;
}

export function resolveResultVariant(
  resultPack: AccountingEntryResultPack,
  stage1Answers: Stage1AnswerMap,
): AccountingResultVariant | null {
  for (const variant of resultPack.variants) {
    if (stage1Answers[variant.when.question_id] === variant.when.choice_id) {
      return variant;
    }
  }
  return null;
}

export function resolveLanguageNoteSentence(
  resultPack: AccountingEntryResultPack,
  questionPack: AccountingEntryContentPack,
  stage1Answers: Stage1AnswerMap,
): string | null {
  const langQId = stage1LanguageQuestionId(questionPack);
  if (!langQId) return null;
  const choice = stage1Answers[langQId];
  if (!choice || !LANGUAGE_NOTE_KEYS.includes(choice as AccountingFunnelLanguageNoteKey)) {
    return null;
  }
  return resultPack.language_notes[choice as AccountingFunnelLanguageNoteKey] ?? null;
}
