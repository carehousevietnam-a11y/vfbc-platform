// src/lib/checkDiagnosis.ts
//
// "직접확인하기" (TRC / WP / 땀주) 공용 AI 진단 엔진.
// verifyDiagnosis.ts와 동일한 원칙: 이 파일의 함수를 통해서만 진단 결과를 만든다.
// 지금은 정적 규칙 기반이지만, 나중에 규칙엔진+법령DB로 내부만 교체해도
// 페이지 코드는 손댈 필요 없도록 인터페이스를 고정해둔다.
//
// 현재 구현 범위: WP(노동허가)만 완성. TRC/땀주는 인터페이스만 잡아두고
// 다음 세션에서 동일 패턴으로 채운다 (아래 TODO 참고).

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

// ── TRC (거주증) — TODO: 다음 세션에서 WP와 동일 패턴으로 구현 ──
// export function getTrcDiagnosis(...) { ... }

// ── 땀주 — TODO: 다음 세션에서 WP와 동일 패턴으로 구현 ──
// export function getTamtruDiagnosis(...) { ... }

export type CheckDiagnosisInput =
  | { service: "wp"; education: WpEducation; experience: WpExperience; job: WpJob };
// TODO: | { service: "trc"; ... } | { service: "tamtru"; ... }

export async function getCheckDiagnosis(
  input: CheckDiagnosisInput
): Promise<DiagnosisResult | null> {
  switch (input.service) {
    case "wp":
      return getWpDiagnosis(input.education, input.experience, input.job);
    default:
      return null;
  }
}
