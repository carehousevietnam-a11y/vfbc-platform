export type RealEstateCaseId = "RE01" | "RE02" | "RE03" | "RE04" | "RE05" | "RE06";

export type Q1Option = {
  value: string;
  label: string;
  caseId: string;
};

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

export type CaseRiskTables = {
  expert: { trigger: string; line: string }[];
  caution: { trigger: string; line: string }[];
  check: { trigger: string; line: string }[];
  special: { trigger: string; line: string }[];
};

export type SituationProfile = {
  fields: Record<string, string | string[]>;
  facts: string[];
  caseId: string;
};

export type AnswerMap = Record<string, string | string[]>;
