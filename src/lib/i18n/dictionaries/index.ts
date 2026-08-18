import type { Locale } from "../locales";
import { ko } from "./ko";
import { en } from "./en";
import { zh } from "./zh";
import { vi } from "./vi";

export const dictionaries: Record<Locale, Record<string, string>> = {
  ko,
  en,
  zh,
  vi,
};
