// src/lib/checkDiagnosis.ts
//
// "직접확인하기" (TRC / WP / 땀주 / 운전면허) + "직접허가받기"(PERMIT) 공용 AI 진단 엔진.
// verifyDiagnosis.ts와 동일한 원칙: 이 파일의 함수를 통해서만 진단 결과를 만든다.
// 지금은 정적 규칙 기반이지만, 나중에 규칙엔진+법령DB로 내부만 교체해도
// 페이지 코드는 손댈 필요 없도록 인터페이스를 고정해둔다.
//
// 구현 범위: WP(노동허가) / TRC(거주증) / 땀주(임시거주등록) / 운전면허 완성.
// PERMIT(직접허가받기)은 법인설립(company) 1개 파일럿 구현.
//   나머지 6개(식당/소방/위생/환경/화장품/의료기기) 업종허가는
//   "법인(ERC) 보유 여부" 공통 게이트만 우선 적용, 세부 로직은 추후 확장 예정.
//
// [2026.7 업데이트] WP(노동허가) 경력요건 법령 최신화
// 시행령 219/2025/ND-CP(2025.8.7 발효, Decree 152/2020 + 70/2023 대체) 반영.
// 전문가(chuyên gia) 경력 요건: 일반분야 3년 → 2년으로 완화, 우선분야(기술/혁신/
// 디지털전환)는 1년으로 더 완화. Linda 대표 검수 완료 후 반영.
// 참고: 우선분야 세부 업종 리스트까지는 확정 못했음 — 사용자가 스스로 판단해서
// 답하는 질문으로 처리하고, 최종 확정은 전문가 상담 단계에서 이뤄지도록 안내함.

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
// [2026.7] 경력 구간을 3년 기준 → 2년 기준으로 재편성 (219/2025/ND-CP 반영)
export type WpExperience = "over2" | "one-to-two" | "under1" | null;
export type WpJob = "expert" | "technical" | "unskilled" | null;
// [2026.7 신규] 우선분야(기술·혁신·디지털전환) 종사 여부 — "예"면 경력 기준 1년 적용
export type WpPriorityField = "yes" | "no" | null;

export function computeWpResultTone(
  edu: WpEducation,
  exp: WpExperience,
  job: WpJob,
  priorityField: WpPriorityField
): ResultTone | null {
  if (!edu || !exp || !job || !priorityField) return null;
  if (job === "unskilled") return "impossible";

  // 우선분야면 1년, 아니면 2년 기준 (219/2025/ND-CP)
  const meetsThreshold =
    priorityField === "yes" ? exp !== "under1" : exp === "over2";

  // [버그 수정] 기존 로직은 edu === "university"면 경력 체크 없이 무조건 possible을
  // 반환했음 — 구법(3년)·신법(2년) 어느 기준으로도 원래 틀린 로직이었음.
  // 대졸이어도 경력 기준을 충족해야 possible.
  if (edu === "university" && meetsThreshold) return "possible";
  if (edu === "university" && !meetsThreshold) return "conditional";
  if (edu === "college" && meetsThreshold) return "possible";
  if (job === "technical" && meetsThreshold) return "conditional";
  if (edu === "college") return "conditional";
  if (meetsThreshold) return "conditional";
  return "impossible";
}

function getWpDiagnosis(
  edu: WpEducation,
  exp: WpExperience,
  job: WpJob,
  priorityField: WpPriorityField
): DiagnosisResult | null {
  const tone = computeWpResultTone(edu, exp, job, priorityField);
  if (!tone) return null;

  const isPriority = priorityField === "yes";
  const thresholdLabel = isPriority ? "1년" : "2년";
  const meetsThreshold = isPriority ? exp !== "under1" : exp === "over2";
  const degreeOk = edu === "university" || edu === "college";
  // 번역공증·영사인증은 사실상 전원에게 필요한 절차라, 항상 "확인 필요"로 표시해
  // 무료 진단만으로는 완전히 끝나지 않는다는 걸 자연스럽게 안내한다.
  const translationOk = false;

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number } | null;
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = edu === "university" ? 90 : 80;
    estimatedDays = { min: 30, max: 45 };
    riskLevel = "low";
  } else if (tone === "conditional") {
    feasibilityScore =
      job === "technical" && meetsThreshold
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
      label: `경력증명서 공증 (${thresholdLabel} 이상${isPriority ? " · 우선분야 적용" : ""})`,
      passed: meetsThreshold,
      reason: meetsThreshold
        ? `${thresholdLabel} 이상 경력으로 공증 절차상 무리 없음 (시행령 219/2025/ND-CP 기준)`
        : `경력이 ${thresholdLabel} 미만 또는 미확인 — 전 직장 경력증명서 공증 절차 확인 필요`,
    },
    {
      label: "번역·영사인증 서류",
      passed: translationOk,
      reason: "베트남은 아포스티유 미가입국이라 외교부 영사확인 절차가 필수 — 전원 해당",
    },
  ];

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!degreeOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "학력 요건 미충족" });
  if (!meetsThreshold)
    rejectionRisks.push({
      rank: rejectionRisks.length + 1,
      reason: `경력증명서 공증 미비 (${thresholdLabel} 이상 필요)`,
    });
  rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "번역·영사인증 서류 누락" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note:
        tone === "possible"
          ? "번역·영사인증 등 준비 서류에 따라 처리기간이 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
          : tone === "conditional"
          ? "보완 서류에 따라 결과가 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 판단은 반드시 전문가와 상의하시기 바랍니다."
          : "현재 조건으로는 진행이 어렵습니다. 직무 변경 등 다른 방법을, 행정기관 통폐합과 법령 개정이 잦은 점을 감안해 반드시 전문가와 상의해보세요.",
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
        isPriority
          ? "우선분야(기술·혁신·디지털전환) 해당 여부를 증빙할 자료(직무기술서 등) 준비 권장 — 최종 해당 여부는 전문가 확인 필요"
          : "",
      ].filter(Boolean),
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
          ? "재직증명서·사업자등록증 등 준비 서류에 따라 처리기간이 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
          : tone === "conditional"
          ? "비자 전환 여부에 따라 결과가 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 판단은 반드시 전문가와 상의하시기 바랍니다."
          : "법인 등록이 선행되어야 합니다. 법인설립 절차를 먼저 진행해보세요. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다.",
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
        ? "임대차 계약서 등 준비 서류에 따라 신고 소요시간이 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
        : "기한 초과 시 과태료가 부과될 수 있어, 신고와 함께 소명 준비가 필요합니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다.",
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

// ── 운전면허 (전환) ────────────────────────────────────────────

export type LicenseTrc = "yes" | "no" | null;
export type LicenseHasLicense = "yes" | "no" | null;

export function computeLicenseResultTone(
  trc: LicenseTrc,
  license: LicenseHasLicense
): ResultTone | null {
  if (trc === "no") return "conditional";
  if (trc === "yes" && license === "yes") return "possible";
  if (trc === "yes" && license === "no") return "impossible";
  return null;
}

function getLicenseDiagnosis(
  trc: LicenseTrc,
  license: LicenseHasLicense
): DiagnosisResult | null {
  const tone = computeLicenseResultTone(trc, license);
  if (!tone) return null;

  const trcOk = trc === "yes";
  const licenseOk = license === "yes";

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number } | null;
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = 85;
    estimatedDays = { min: 7, max: 15 };
    riskLevel = "low";
  } else if (tone === "conditional") {
    feasibilityScore = 20;
    estimatedDays = null;
    riskLevel = "medium";
  } else {
    feasibilityScore = 10;
    estimatedDays = null;
    riskLevel = "high";
  }

  const items: ExpertChecklistItem[] = [
    { label: "여권 확인", passed: true, reason: "제출 서류 기준 여권 유효성은 별도 확인 필요 없음" },
    {
      label: "거주증(TRC) 보유 확인",
      passed: trcOk,
      reason: trcOk
        ? "거주증을 보유하고 있어 운전면허 전환 신청 자격 요건 충족"
        : "거주증 미보유로 운전면허 전환 신청 자체가 불가능, TRC 발급이 선행되어야 함",
    },
    {
      label: "본국 운전면허 보유 확인",
      passed: licenseOk,
      reason: licenseOk
        ? "본국 발급 운전면허 보유로 전환 절차 진행 가능"
        : "본국 면허가 없어 전환이 아닌 신규 취득 절차가 필요 (기간·난이도 대폭 증가)",
    },
    {
      label: "면허 베트남어 공증 번역본 준비",
      passed: false,
      reason: "국적별로 요구 서식이 달라 공증 번역본은 전원 별도 확인 필요",
    },
  ];

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!trcOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "거주증 미보유로 신청 자격 미충족" });
  if (!licenseOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "본국 면허 미보유로 전환 절차 진행 불가" });
  rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "공증 번역본 서식 오류로 인한 반려 가능성" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note:
        tone === "possible"
          ? "공증 번역본 등 준비 서류에 따라 처리기간이 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
          : tone === "conditional"
          ? "거주증(TRC) 발급이 먼저 필요합니다. TRC 가능성부터 확인해보세요. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
          : "본국 면허가 없어 전환이 아닌 신규 취득 절차를, 행정기관 통폐합과 법령 개정이 잦은 점을 감안해 반드시 전문가와 상의해보세요.",
    },
    expertBrief: {
      riskLevel,
      checkedItems: items,
      rejectionRisks,
      similarCases: [], // TODO: 실제 사례 DB 연동 후 채울 것 (허위 데이터 금지)
      recommendedSteps: [
        "여권 사본 및 거주증(TRC) 사본 확보",
        "본국 운전면허 원본 확보",
        "면허 베트남어 공증 번역본 준비 (국적별 서식 확인 필요)",
      ],
    },
  };
}

// ── PERMIT · 법인설립 (직접허가받기 파일럿) ─────────────────────
//
// 실제 필요서류 기준(투자자 유형별 분기)으로 구성.
// 나머지 6개 업종허가(식당/소방/위생/환경/화장품/의료기기)는
// "법인(ERC) 보유 여부" 공통 게이트만 이 함수의 companyOk 판단 로직을
// 재사용해서 그대로 붙이면 된다. 세부 업종 요건은 추후 Linda 대표 확인 후 확장.

export type PermitInvestorType = "corporate" | "individual" | null; // 법인(한국 본사) 투자 / 개인 투자
export type PermitCapital = "confirmed" | "unconfirmed" | null;
export type PermitOffice = "secured" | "unsecured" | null;
export type PermitResidentRep = "yes" | "no" | null; // 대표자(법인장)가 베트남에 상주하며 근무할 예정인지

export function computePermitCompanyResultTone(
  capital: PermitCapital,
  office: PermitOffice
): ResultTone | null {
  if (!capital || !office) return null;
  if (capital === "unconfirmed" || office === "unsecured") return "conditional";
  return "possible";
}

function getPermitCompanyDiagnosis(
  investorType: PermitInvestorType,
  capital: PermitCapital,
  office: PermitOffice,
  residentRep: PermitResidentRep
): DiagnosisResult | null {
  const tone = computePermitCompanyResultTone(capital, office);
  if (!tone || !investorType || !residentRep) return null;

  const isCorporate = investorType === "corporate";
  const capitalOk = capital === "confirmed";
  const officeOk = office === "secured";
  const willReside = residentRep === "yes";

  let feasibilityScore: number;
  let estimatedDays: { min: number; max: number };
  let riskLevel: "low" | "medium" | "high";

  if (tone === "possible") {
    feasibilityScore = 90;
    estimatedDays = { min: 20, max: 35 };
    riskLevel = "low";
  } else {
    feasibilityScore = capitalOk || officeOk ? 55 : 35;
    estimatedDays = { min: 35, max: 55 };
    riskLevel = "medium";
  }

  // 투자자 유형에 따라 체크리스트 자체가 완전히 갈라짐 (실제 필요서류 기준)
  const items: ExpertChecklistItem[] = isCorporate
    ? [
        {
          label: "사업자등록증명원 · 법인등기부등본",
          passed: true,
          reason: "국세청 발급(최근 3개월 이내) — 신청 즉시 발급 가능한 서류",
        },
        {
          label: "본사 정관 · 이사회결의서 · 위임장(POA)",
          passed: false,
          reason: "베트남 법인 설립·투자금액·대표자 임명 관련 이사회결의서는 별도 작성 필요",
        },
        {
          label: "재무 증빙 (감사보고서 또는 은행 잔고증명서)",
          passed: capitalOk,
          reason: capitalOk
            ? "최근 2개년 감사보고서 또는 은행 잔고증명서로 자본금 요건 소명 가능"
            : "설립 2년 미만 법인은 은행 잔고증명서로 대체 가능 — 현재 미확정 상태",
        },
        {
          label: "사무실 임대차 계약서(현지)",
          passed: officeOk,
          reason: officeOk
            ? "임대차 계약이 체결되어 있어 ERC 등록 주소 요건 충족"
            : "법인 등록 주소로 사용할 사무실 임대차 계약이 아직 체결되지 않음",
        },
      ]
    : [
        {
          label: "투자자 여권 공증본",
          passed: true,
          reason: "여권 공증(유효기간 2년 6개월 이상 권장)은 즉시 진행 가능한 서류",
        },
        {
          label: "위임장(POA)",
          passed: false,
          reason: "베트남 현지 설립 대행을 위한 위임장은 별도 작성 필요",
        },
        {
          label: "개인 은행 잔고증명서",
          passed: capitalOk,
          reason: capitalOk
            ? "투자할 자본금 이상의 영문 잔고증명서 확보"
            : "최근 1~2주 이내 발급본 기준 자본금 증빙이 아직 준비되지 않음",
        },
        {
          label: "사무실 임대차 계약서(현지)",
          passed: officeOk,
          reason: officeOk
            ? "임대차 계약이 체결되어 있어 ERC 등록 주소 요건 충족"
            : "법인 등록 주소로 사용할 사무실 임대차 계약이 아직 체결되지 않음",
        },
      ];

  if (willReside) {
    items.push({
      label: "대표자 상주 근무 사전서류 (학위 · 경력 · 범죄경력증명서)",
      passed: false,
      reason:
        "법인장이 베트남에 상주하며 근무할 예정이라 법인 설립 후 노동허가(WP)·거주증(TRC) 발급이 필요 — 학위증명서·경력증명서·범죄경력회보서(3개월 이내)를 미리 아포스티유 공증받아야 일정 지연을 피할 수 있음",
    });
  }

  const rejectionRisks: { rank: number; reason: string }[] = [];
  if (!capitalOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "자본금 증빙 미비로 IRC(투자등록증) 심사 지연 위험" });
  if (!officeOk) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "사무실 임대차 계약 미체결로 ERC 등록 주소 확보 지연" });
  rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "번역·공증·아포스티유(영사확인) 절차 누락 시 서류 반려 위험" });
  if (willReside) rejectionRisks.push({ rank: rejectionRisks.length + 1, reason: "대표자 노동허가·거주증 사전서류 미비 시 법인 설립 후 상주 일정 지연" });

  return {
    customerView: {
      feasibilityScore,
      resultTone: tone,
      estimatedDays,
      checklist: items.map(({ label, passed }) => ({ label, passed })),
      note:
        tone === "possible"
          ? "번역·공증·아포스티유 등 준비 서류에 따라 처리기간이 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 최신 요건은 반드시 전문가와 상의하시기 바랍니다."
          : "자본금·사무실 등 준비 상태에 따라 결과가 달라질 수 있습니다. 베트남은 행정기관 통폐합과 법령 개정이 잦은 편이라, 정확한 판단은 반드시 전문가와 상의하시기 바랍니다.",
    },
    expertBrief: {
      riskLevel,
      checkedItems: items,
      rejectionRisks,
      similarCases: [], // TODO: 실제 사례 DB 연동 후 채울 것 (허위 데이터 금지)
      recommendedSteps: isCorporate
        ? [
            "사업자등록증명원 · 법인등기부등본(3개월 이내) 발급",
            "본사 정관 · 이사회결의서 · 위임장(POA) 준비",
            !capitalOk ? "감사보고서 또는 은행 잔고증명서 확보 (설립 2년 미만 시 잔고증명서로 대체 가능)" : "",
            !officeOk ? "사무실/공장 임대차 계약 체결 및 임대인 법적 권리 증빙(Red Book 등) 확인" : "",
            "한국 서류는 번역·공증·외교부 아포스티유(영사확인)·베트남 현지 번역공증까지 완료",
            willReside
              ? "대표자 학위증명서 · 경력증명서 · 범죄경력회보서(3개월 이내) 아포스티유 공증 준비 — 노동허가·거주증 발급용"
              : "",
          ].filter(Boolean)
        : [
            "여권 공증본(유효기간 2년 6개월 이상) 준비",
            !capitalOk ? "개인 은행 잔고증명서(최근 1~2주 이내 발급본) 확보" : "",
            "위임장(POA) 작성",
            !officeOk ? "사무실/공장 임대차 계약 체결 및 임대인 법적 권리 증빙(Red Book 등) 확인" : "",
            willReside
              ? "대표자 학위증명서 · 경력증명서 · 범죄경력회보서(3개월 이내) 아포스티유 공증 준비 — 노동허가·거주증 발급용"
              : "",
          ].filter(Boolean),
    },
  };
}

// ── 공용 진입점 ────────────────────────────────────────────────

export type CheckDiagnosisInput =
  | {
      service: "wp";
      education: WpEducation;
      experience: WpExperience;
      job: WpJob;
      priorityField: WpPriorityField;
    }
  | { service: "trc"; visa: TrcVisa; role: TrcRole; company: TrcCompany }
  | { service: "tamtru"; timing: TamtruTiming }
  | { service: "license"; trc: LicenseTrc; license: LicenseHasLicense }
  | {
      service: "permit_company";
      investorType: PermitInvestorType;
      capital: PermitCapital;
      office: PermitOffice;
      residentRep: PermitResidentRep;
    };

export async function getCheckDiagnosis(
  input: CheckDiagnosisInput
): Promise<DiagnosisResult | null> {
  switch (input.service) {
    case "wp":
      return getWpDiagnosis(
        input.education,
        input.experience,
        input.job,
        input.priorityField
      );
    case "trc":
      return getTrcDiagnosis(input.visa, input.role, input.company);
    case "tamtru":
      return getTamtruDiagnosis(input.timing);
    case "license":
      return getLicenseDiagnosis(input.trc, input.license);
    case "permit_company":
      return getPermitCompanyDiagnosis(
        input.investorType,
        input.capital,
        input.office,
        input.residentRep
      );
    default:
      return null;
  }
}
