import type { AccountingEntryContentPack, AccountingEntryResultPack, AccountingFunnelEntryId } from "./types";

export type ResultPackAlignmentIssue = {
  entry_id: AccountingFunnelEntryId;
  question_id: string;
  choice_id: string;
  reason: "unknown_question" | "unknown_choice";
};

export function collectResultPackAlignmentIssues(
  questionPack: AccountingEntryContentPack,
  resultPack: AccountingEntryResultPack,
): ResultPackAlignmentIssue[] {
  const issues: ResultPackAlignmentIssue[] = [];
  const choiceByQuestion = new Map<string, Set<string>>();
  for (const q of [...questionPack.stage1, ...questionPack.stage2]) {
    choiceByQuestion.set(q.id, new Set(q.choices.map((c) => c.id)));
  }

  for (const variant of resultPack.variants) {
    const choices = choiceByQuestion.get(variant.when.question_id);
    if (!choices) {
      issues.push({
        entry_id: resultPack.entry_id,
        question_id: variant.when.question_id,
        choice_id: variant.when.choice_id,
        reason: "unknown_question",
      });
      continue;
    }
    if (!choices.has(variant.when.choice_id)) {
      issues.push({
        entry_id: resultPack.entry_id,
        question_id: variant.when.question_id,
        choice_id: variant.when.choice_id,
        reason: "unknown_choice",
      });
    }
  }

  return issues;
}
