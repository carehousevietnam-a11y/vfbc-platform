/**
 * Company member signup — shared constants and validation (client + server safe).
 * P2 scope: classification + org hook only; no ledger UI.
 */

export const COMPANY_SIGNUP_CHANNEL = "vfbc_company_member_v1";

export const COMPANY_SIGNUP_PATH = "/signup/company";

/** 예비 창업자 안내 — env 미설정 시 법인설립 REGISTER 경로(임의 URL 생성 금지). */
export function accountingProspectiveGuidePath(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ACCOUNTING_PROSPECTIVE_GUIDE_PATH?.trim();
  return fromEnv || "/register/company";
}

export function accountingFunnelSignupHref(returnPath = "/company/accounting/company"): string {
  const q = new URLSearchParams({ next: returnPath });
  return `${COMPANY_SIGNUP_PATH}?${q.toString()}`;
}

export type CompanyCategory = "operating" | "prospective" | "branch" | "other";
export type JobPosition = "ceo" | "executive" | "finance" | "staff" | "other";

export const COMPANY_CATEGORY_OPTIONS: { value: CompanyCategory; label: string }[] = [
  { value: "operating", label: "법인 운영 중" },
  { value: "prospective", label: "예비 창업자(설립 준비 중)" },
  { value: "branch", label: "지사·사무소" },
  { value: "other", label: "기타(직접 입력)" },
];

export const JOB_POSITION_OPTIONS: { value: JobPosition; label: string }[] = [
  { value: "ceo", label: "대표" },
  { value: "executive", label: "임원" },
  { value: "finance", label: "경리·재무 담당" },
  { value: "staff", label: "직원" },
  { value: "other", label: "기타(직접 입력)" },
];

export type CompanySignupProfileFields = {
  companyCategory: CompanyCategory;
  companyCategoryOther?: string | null;
  companyName: string;
  jobPosition: JobPosition;
  jobPositionOther?: string | null;
};

export type CompanySignupFieldKey =
  | "companyCategory"
  | "companyCategoryOther"
  | "companyName"
  | "jobPosition"
  | "jobPositionOther"
  | "password"
  | "passwordConfirm";

export type CompanySignupFieldErrors = Partial<Record<CompanySignupFieldKey, string>>;

const CATEGORY_SET = new Set<string>(COMPANY_CATEGORY_OPTIONS.map((o) => o.value));
const POSITION_SET = new Set<string>(JOB_POSITION_OPTIONS.map((o) => o.value));

const MIN_PASSWORD_LENGTH = 8;

export function shouldCreateAccountingOrg(category: CompanyCategory): boolean {
  return category !== "prospective";
}

/** lead-submit API — client channel/member_type 조작과 무관하게 항상 personal */
export const LEAD_SUBMIT_MEMBER_TYPE = "personal" as const;

export function parseCompanySignupProfile(
  body: Record<string, unknown>
): { ok: true; profile: CompanySignupProfileFields } | { ok: false; errors: CompanySignupFieldErrors } {
  const errors: CompanySignupFieldErrors = {};
  const rawCategory = typeof body.companyCategory === "string" ? body.companyCategory.trim() : "";
  const rawPosition = typeof body.jobPosition === "string" ? body.jobPosition.trim() : "";
  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const companyCategoryOther =
    typeof body.companyCategoryOther === "string" ? body.companyCategoryOther.trim() : "";
  const jobPositionOther =
    typeof body.jobPositionOther === "string" ? body.jobPositionOther.trim() : "";

  if (!CATEGORY_SET.has(rawCategory)) {
    errors.companyCategory = "회원 유형을 선택해주세요.";
  }
  const isProspective = rawCategory === "prospective";
  const resolvedCompanyName =
    isProspective && (!companyName || companyName === "미정") ? "미정" : companyName;
  if (!resolvedCompanyName) {
    errors.companyName = "회사명을 입력해주세요.";
  }
  if (!POSITION_SET.has(rawPosition)) {
    errors.jobPosition = "직위를 선택해주세요.";
  }
  if (rawCategory === "other" && !companyCategoryOther) {
    errors.companyCategoryOther = "기타 유형을 입력해주세요.";
  }
  if (rawPosition === "other" && !jobPositionOther) {
    errors.jobPositionOther = "기타 직위를 입력해주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    profile: {
      companyCategory: rawCategory as CompanyCategory,
      companyCategoryOther: rawCategory === "other" ? companyCategoryOther : null,
      companyName: resolvedCompanyName,
      jobPosition: rawPosition as JobPosition,
      jobPositionOther: rawPosition === "other" ? jobPositionOther : null,
    },
  };
}

export function validateCompanySignupPassword(
  password: string,
  passwordConfirm: string
): CompanySignupFieldErrors {
  const errors: CompanySignupFieldErrors = {};
  if (!password) {
    errors.password = "비밀번호를 입력해주세요.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`;
  }
  if (!passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
  } else if (password !== passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }
  return errors;
}
