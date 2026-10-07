export type AnswerMap = Record<string, string | string[]>;

export type ContentPackOption = {
  value: string;
  label: string;
  meaning: string;
};

export type ContentPackNode = {
  id: string;
  phase: number;
  kind: "single" | "multi" | "text";
  showIf: string;
  profileFields: string[];
  question: string;
  placeholder: string;
  options: ContentPackOption[];
};

export type Q1Option = {
  value: string;
  label: string;
  caseId: string;
};

export type CaseRiskTables = {
  expert: { trigger: string; line: string }[];
  caution: { trigger: string; line: string }[];
  check: { trigger: string; line: string }[];
  special: { trigger: string; line: string }[];
};

export type FPathRow = { pathId: string; condition: string; label: string; chain: string[]; priority?: number };

export type SituationProfile = {
  fields: Record<string, string | string[]>;
  facts: string[];
  caseId: string;
};

export type ContentPackBundle = {
  q1: Q1Option[];
  nodes: Record<string, ContentPackNode[]>;
  phase1Order: Record<string, string[]>;
  risks: Record<string, CaseRiskTables>;
  fPaths: Record<string, FPathRow[]>;
  pathAliases: Record<string, Record<string, string>>;
  goalAdjustDocRaw?: string;
};
