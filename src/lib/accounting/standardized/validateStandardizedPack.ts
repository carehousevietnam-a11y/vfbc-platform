import { isPackI18nEmpty } from "../funnel/packI18n";
import type { AccountingPackQuestion } from "../funnel/types";

const MAX_CHOICES = 5;

export function validateStandardizedQuestionSkeleton(question: AccountingPackQuestion): string[] {
  const errors: string[] = [];
  const prefix = question.id;
  if (typeof question.allow_direct_input !== "boolean") {
    errors.push(`${prefix}: allow_direct_input missing`);
  }
  if (!Array.isArray(question.sources)) {
    errors.push(`${prefix}: sources must be array`);
  }
  if (question.choices.length > MAX_CHOICES) {
    errors.push(`${prefix}: more than ${MAX_CHOICES} choices`);
  }
  for (const choice of question.choices) {
    if (!choice.label || typeof choice.label.ko !== "string" || typeof choice.label.vi !== "string") {
      errors.push(`${prefix}: choice ${choice.id} label must include ko and vi`);
    }
  }
  const textFilled = question.text && !isPackI18nEmpty(question.text);
  const anyChoiceFilled = question.choices.some((c) => c.label && !isPackI18nEmpty(c.label));
  if (textFilled || anyChoiceFilled) {
    if (!question.text || typeof question.text.ko !== "string" || typeof question.text.vi !== "string") {
      errors.push(`${prefix}: question text must include ko and vi when filled`);
    }
  }
  return errors;
}

export function validateG9StandardizedPack(questions: AccountingPackQuestion[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const q of questions) {
    errors.push(...validateStandardizedQuestionSkeleton(q));
  }
  return { ok: errors.length === 0, errors };
}
