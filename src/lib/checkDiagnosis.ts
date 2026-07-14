// src/lib/checkDiagnosis.ts
//
// "직접확인하기" (TRC / WP / 땀주) 공용 AI 진단 엔진.
// verifyDiagnosis.ts와 동일한 원칙: 이 파일의 함수를 통해서만 진단 결과를 만든다.
// 지금은 정적 규칙 기반이지만, 나중에 규칙엔진+법령DB로 내부만 교체해도
// 페이지 코드는 손댈 필요 없도록 인터페이스를 고정해둔다.
//
// 구현 범위: WP(노동허가) / TRC(거주증) / 땀주(임시거주등록) 모두 완성.

export type ResultTone = "possible" | "conditional" | "impossible";

export interface ChecklistItem {
  label: string;
  passed: boolean;
}

export interface ExpertChecklistItem extends ChecklistItem {
  reason: string;
}

export interface DiagnosisResult {
  // 고객 화면용 — "무엇이" 문제인지까지만. 절대 "왜"까지 노출하지 않는다.
  customerView: {
    feasibilityScore: number; // 0~100
    resultTone: ResultTone;
    estimatedDays: { min: number; max: number } | null; // impossible이면 null
    checklist: ChecklistItem[];
    note: string;
  };
  // 전문가 화면용 — crm_activities.meta에만 저장, 고객에게 절대 노출 금지
  expertBrief: {
    riskLevel: "low" | "medium" | "high";
    checkedItems: ExpertChecklistItem[];
    rejectionRisks: { rank: number; reason: string }[];
    similarCases: string[]; // 실제 사례 DB 연동 전까지는 빈 배열 유지 (허위 데이터 금지)
    recommendedSteps: string[];
  };
}

// ── WP (노동허가) ──────────────────────────────────────────────

export type WpEducation = "university" | "college" | "highschool" | null;
export type WpExperience = "over3" | "one-to-three" | "under1" | null;
export type WpJob = "expert" | "technical" | "unskilled" | null;

export function computeWpResultTone(
  edu: WpEducation,
  exp: WpExperience,
  job: WpJob
): ResultTone | null {
  if (!edu || !exp || !job) return null;
  if (job === "unskilled") return "impossible";
  if (edu === "university") return "possible";
  if (edu === "college" && exp === "over3") return "possible";
  if (job === "technical" && exp === "over3") return "conditional";
  if (edu === "college") return "conditional";
  if (exp === "over3") return "conditional";
  return "impossible";
}

function getWpDiagnosis(
  edu: WpEducation,
  exp: WpExperience,
  job: WpJob
): DiagnosisResult | null {
  const tone = computeWpResultTone(edu, exp, job);
  if (!tone) return null;

  const degreeOk = edu === "university" || edu === "college";
  const experienceOk = exp === "over3";
  // 번역공증·영사인증은 사실상 전원에게 필요한 절차라, 항상 "확인 필요"로 표시해
  // 무료 진단만으로는 완전히 끝나지 않는다는 걸 자연스럽게 안내한다.
  const translationOk = false;

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number } | null;
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = edu === "university" ? 88 : 78;
    estimatedDays = { min: 30, max: 45 };
    riskLevel = "low";
  } else if (tone === "conditional") {
    feasibilityScore =
      job === "technical" && exp === "over3"
        ? 58
        : edu === "college"
        ? 52
        : 48;
    estimatedDays = { min: 45, max: 60 };
    riskLevel = "medium";
  } else {
    feasibilityScore = job === "unskilled" ? 8 : 15;
    estimatedDays = null;
    riskLevel = "high";
  }

  const items: ExpertChecklistItem[] = [
    { label: "여권 확인", passed: true, reason: "제출 서류 기준 여권 유효성은 별도 확인 필요 없음" },
    {
      label: "학력 확인",
      passed: degreeOk,
      reason: degreeOk
        ? "전문대졸 이상으로 학력 요건 충족"
        : "고졸 이하로 학력만으로는 전문직 요건 미충족, 경력으로 보완 필요",
    },
    {
      label: "경력증명서 공증",
      passed: experienceOk,
      reason: experienceOk
        ? "3년 이상 경력으로 공증 절차상 무리 없음"
        : "경력 3년 미만 또는 미확인 — 전 직장 경력증명서 공증 절차 확인 필요",
    },
    {
      label: "번역·영사인증 서류",
      passed: translationOk,
      reason: "베트남은 아포스티유 미가입국이라 외교부 영사확인 절차가 필수 — 전원 해당",
    },
  ];

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!degreeOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "학력 요건 미충족" });
  if (!experienceOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "경력증명서 공증 미비" });
  rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "번역·영사인증 서류 누락" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note:
        tone === "possible"
          ? "번역·영사인증 등 준비 서류에 따라 처리기간이 달라질 수 있습니다."
          : tone === "conditional"
          ? "보완 서류에 따라 결과가 달라질 수 있습니다. 정확한 판단은 전문가 검토가 필요합니다."
          : "현재 조건으로는 진행이 어렵습니다. 직무 변경 등 다른 방법을 전문가와 상의해보세요.",
    },
    expertBrief: {
      riskLevel,
      checkedItems: items,
      rejectionRisks,
      similarCases: [], // TODO: 실제 사례 DB 연동 후 채울 것 (허위 데이터 금지)
      recommendedSteps: [
        "한국에서 준비: 범죄경력증명서·학위증명서 영사인증 진행",
        "베트남 현지에서 준비: 여권 공증·건강진단서·거주지 확인서 확보",
        "초청 법인에서 준비: 외국인 채용수요 승인서(최소 30일 전 신청 필요) 확보",
      ],
    },
  };
}

// ── TRC (거주증) ──────────────────────────────────────────────

export type TrcNationality = "korea" | "china" | "japan" | "other" | null;
export type TrcVisa = "invest" | "work" | "tourist" | "other" | null;
export type TrcRole = "legal-rep" | "manager" | "staff" | null;
export type TrcCompany = "fdi" | "local" | "unregistered" | null;

export function computeTrcResultTone(
  visa: TrcVisa,
  role: TrcRole,
  company: TrcCompany
): ResultTone | null {
  if (!visa || !role || !company) return null;
  if (company === "unregistered") return "impossible";
  if (visa === "tourist" && role !== "legal-rep") return "conditional";
  if (visa === "invest" || visa === "work") return "possible";
  if (visa === "other") return "conditional";
  return null;
}

function getTrcDiagnosis(
  visa: TrcVisa,
  role: TrcRole,
  company: TrcCompany
): DiagnosisResult | null {
  const tone = computeTrcResultTone(visa, role, company);
  if (!tone) return null;

  const visaOk = visa === "invest" || visa === "work";
  const roleOk = role === "legal-rep" || role === "manager";
  const companyOk = company !== "unregistered";

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number } | null;
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = role === "legal-rep" ? 92 : visa === "invest" ? 85 : 80;
    estimatedDays = { min: 15, max: 25 };
    riskLevel = "low";
  } else if (tone === "conditional") {
    feasibilityScore = visa === "other" ? 55 : 45;
    estimatedDays = { min: 30, max: 45 };
    riskLevel = "medium";
  } else {
    feasibilityScore = 8;
    estimatedDays = null;
    riskLevel = "high";
  }

  const items: ExpertChecklistItem[] = [
    { label: "여권 확인", passed: true, reason: "제출 서류 기준 여권 유효성은 별도 확인 필요 없음" },
    {
      label: "비자 요건 확인",
      passed: visaOk,
      reason: visaOk
        ? "투자비자(DT) 또는 노동허가부 비자(LD)로 거주증 신청 요건 충족"
        : "관광·단기비자 등은 거주증 발급 요건상 비자 전환이 선행되어야 함",
    },
    {
      label: "직책·재직 요건 확인",
      passed: roleOk,
      reason: roleOk
        ? "법정대표자·관리직으로 재직 요건 충족"
        : "일반 직원은 재직증명서·노동계약서로 별도 소명이 필요할 수 있음",
    },
    {
      label: "법인 등록 상태 확인",
      passed: companyOk,
      reason: companyOk
        ? "법인이 등록되어 있어 초청 주체 요건 충족"
        : "법인이 아직 미등록 상태로 거주증 신청 자체가 불가능",
    },
  ];

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!companyOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "법인 미등록으로 초청 주체 요건 미충족" });
  if (!visaOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "비자 유형이 거주증 신청 요건에 부합하지 않음" });
  if (!roleOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "직책상 재직 요건 소명 서류 미비 가능성" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note:
        tone === "possible"
          ? "재직증명서·사업자등록증 등 준비 서류에 따라 처리기간이 달라질 수 있습니다."
          : tone === "conditional"
          ? "비자 전환 여부에 따라 결과가 달라질 수 있습니다. 정확한 판단은 전문가 검토가 필요합니다."
          : "법인 등록이 선행되어야 합니다. 법인설립 절차를 먼저 진행해보세요.",
    },
    expertBrief: {
      riskLevel,
      checkedItems: items,
      rejectionRisks,
      similarCases: [], // TODO: 실제 사례 DB 연동 후 채울 것 (허위 데이터 금지)
      recommendedSteps: [
        "여권 사본 및 현재 비자 사본 확보",
        "재직증명서 또는 노동계약서 준비",
        "회사 사업자등록증(ERC) 사본 확보",
        !visaOk ? "비자 전환(관광→투자/노동) 가능 여부 우선 확인" : "",
      ].filter(Boolean),
    },
  };
}

// ── 땀주 (임시거주등록) ──────────────────────────────────────

export type TamtruTiming = "within12" | "within24" | "over24" | null;

export function computeTamtruResultTone(timing: TamtruTiming): ResultTone | null {
  if (!timing) return null;
  return timing === "over24" ? "conditional" : "possible";
}

function getTamtruDiagnosis(timing: TamtruTiming): DiagnosisResult | null {
  const tone = computeTamtruResultTone(timing);
  if (!tone) return null;

  const timingOk = timing !== "over24";

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number };
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = timing === "within12" ? 95 : 85;
    estimatedDays = { min: 0, max: 1 };
    riskLevel = "low";
  } else {
    feasibilityScore = 50;
    estimatedDays = { min: 1, max: 3 };
    riskLevel = "medium";
  }

  const items: ExpertChecklistItem[] = [
    {
      label: "신고 기한 준수 여부",
      passed: timingOk,
      reason: timingOk
        ? "12~24시간 이내 신고로 기한 요건 충족"
        : "신고 기한(12~24시간)을 초과하여 과태료 부과 대상이 될 수 있음",
    },
    {
      label: "집주인 협조 여부",
      passed: true,
      reason: "집주인의 등록 거부·금전 요구가 확인되지 않음",
    },
    {
      label: "임대차 계약서·거주확인서 준비",
      passed: false,
      reason: "신고 시 임대차 계약서 또는 집주인 확인서 원본 제출이 필요 — 사전 준비 여부는 별도 확인 필요",
    },
  ];

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!timingOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "신고기한 초과로 인한 과태료 부과 위험" });
  rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "임대차 계약서·거주확인서 미비 시 신고 반려 가능성" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note: timingOk
        ? "임대차 계약서 등 준비 서류에 따라 신고 소요시간이 달라질 수 있습니다."
        : "기한 초과 시 과태료가 부과될 수 있어, 신고와 함께 소명 준비가 필요합니다.",
    },
    expertBrief: {
      riskLevel,
      checkedItems: items,
      rejectionRisks,
      similarCases: [], // TODO: 실제 사례 DB 연동 후 채울 것 (허위 데이터 금지)
      recommendedSteps: [
        "여권 원본 및 사본 지참",
        "임대차 계약서 또는 집주인 확인서 준비",
        "관할 phường(동) 공안 온라인 신고 사이트에서 신고 진행",
        !timingOk ? "기한 초과 사유 소명서 준비 (과태료 대응)" : "",
      ].filter(Boolean),
    },
  };
}

// ── 공용 진입점 ────────────────────────────────────────────────

export type CheckDiagnosisInput =
  | { service: "wp"; education: WpEducation; experience: WpExperience; job: WpJob }
  | { service: "trc"; visa: TrcVisa; role: TrcRole; company: TrcCompany }
  | { service: "tamtru"; timing: TamtruTiming };

export async function getCheckDiagnosis(
  input: CheckDiagnosisInput
): Promise<DiagnosisResult | null> {
  switch (input.service) {
    case "wp":
      return getWpDiagnosis(input.education, input.experience, input.job);
    case "trc":
      return getTrcDiagnosis(input.visa, input.role, input.company);
    case "tamtru":
      return getTamtruDiagnosis(input.timing);
    default:
      return null;
  }
}
