import type { AccountingEntryContentPack, AccountingPackShowIfClause } from "./types";

export type Stage1AnswerMap = Record<string, string>;

function showIfMatches(showIf: AccountingPackShowIfClause | undefined, answers: Stage1AnswerMap): boolean {
  if (!showIf) return true;
  const answer = answers[showIf.question_id];
  if (answer == null) return false;
  return showIf.choice_ids.includes(answer);
}

export function visibleStage2ForAnswers(
  pack: AccountingEntryContentPack,
  answers: Stage1AnswerMap,
): string[] {
  return pack.stage2
    .filter((q) => showIfMatches(q.show_if, answers))
    .map((q) => q.id);
}

function cartesianStage1Answers(pack: AccountingEntryContentPack): Stage1AnswerMap[] {
  if (pack.stage1.length === 0) return [{}];
  const out: Stage1AnswerMap[] = [];
  function walk(index: number, acc: Stage1AnswerMap) {
    if (index >= pack.stage1.length) {
      out.push({ ...acc });
      return;
    }
    const q = pack.stage1[index];
    for (const choice of q.choices) {
      acc[q.id] = choice.id;
      walk(index + 1, acc);
    }
  }
  walk(0, {});
  return out;
}

export type EntryPathStage2Stats = {
  pathCount: number;
  minVisibleStage2: number;
  maxVisibleStage2: number;
};

export function analyzeEntryPathStage2(pack: AccountingEntryContentPack): EntryPathStage2Stats {
  const paths = cartesianStage1Answers(pack);
  if (paths.length === 0) {
    return { pathCount: 0, minVisibleStage2: 0, maxVisibleStage2: 0 };
  }
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const answers of paths) {
    const count = visibleStage2ForAnswers(pack, answers).length;
    min = Math.min(min, count);
    max = Math.max(max, count);
  }
  return {
    pathCount: paths.length,
    minVisibleStage2: min === Number.POSITIVE_INFINITY ? 0 : min,
    maxVisibleStage2: max,
  };
}
