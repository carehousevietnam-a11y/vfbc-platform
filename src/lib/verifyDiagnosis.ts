// src/lib/verifyDiagnosis.ts
//
// VFBC VERIFY 엔진의 진단 로직을 담당하는 단일 진입점.
//
// [v2 변경사항 — 2026.7.17]
// 기존: 카테고리별 완전 고정 체크리스트/expertBrief (하드코딩, 입력값 무관)
// 변경: 실제 사용 가능한 입력값(서류 첨부 여부, 서류 형식)에 따라
//       고객용 체크리스트와 전문가용 expertBrief가 달라지는 규칙 기반 진단으로 개선.
//
// VERIFY 페이지들은 아직 CHECK처럼 "학력/경력" 같은 진단 질문을 받지 않으므로,
// 현재 시점에서 유일하게 활용 가능한 실제 입력값은:
//   1) 서류 첨부 여부 (fileUrl 존재 여부)
//   2) 서류 형식 (이미지 vs PDF·Word 문서)
// 이 두 값을 기준으로 위험도·체크리스트·전문가 브리핑이 달라진다.
//
// [다음 단계] OpenAI/OCR 연동 시에는 이 함수 "내부"만 교체하면 됨.
// 호출부(각 verify 페이지)는 인터페이스(입력/출력 타입)에만 의존하므로
// 페이지 코드는 이번에도 수정하지 않는다.
//
// [필드명 주의] 각 verify 페이지의 handleExpertRequest()는
//   meta: { expert_brief: diagnosis.expertBrief }
// 형태로 저장한다 (스네이크케이스 expert_brief). CHECK 쪽 admin/cases는
// meta.expertBrief(카멜케이스)를 읽으므로 서로 다른 필드명이다 — VERIFY용
// 관리자 화면(admin/leads/[id])은 반드시 meta.expert_brief를 읽어야 한다.

export type DiagnosisCheckItem = {
  id: string;
  label: string;
  level: "info" | "warning" | "critical";
};

// 전문가(관리자)용 상세 리포트 항목 — 유저에게는 절대 노출하지 않음.
// CHECK 엔진(checkDiagnosis.ts)의 expertBrief 구조와 필드명을 동일하게
// 맞춰서, 향후 관리자 대시보드에서 CHECK/VERIFY를 통일된 형태로 다룰 수
// 있게 했다 (마스터문서 9장 "전문가용 결과 화면" 원칙).
export type ExpertCheckedItem = {
  id: string;
  label: string;
  passed: boolean; // VERIFY 맥락에서는 "확인 가능/불가능"의 의미로 사용
  reason: string;
};

export type ExpertRejectionRisk = {
  reason: string;
  rank: number;
};

export type ExpertBrief = {
  summary: string;
  riskLevel: "low" | "medium" | "high";
  checkedItems: ExpertCheckedItem[];
  rejectionRisks: ExpertRejectionRisk[];
  recommendedSteps: string[];
  // 실제 사례 데이터(case_records)가 쌓이기 전까지 항상 빈 배열.
  // 허위 성공사례 절대 금지 원칙(마스터문서 16장/23장 원칙 6·7).
  similarCases: string[];
};

export type DiagnosisResult = {
  headline: string;
  checklist: DiagnosisCheckItem[];
  note: string;
  expertBrief: ExpertBrief;
};

export type VerifyCategory =
  | "admin"
  | "real-estate"
  | "fraud"
  | "tax"
  | "unclear";

export type DiagnosisInput = {
  fileUrl: string | null;
  fileName: string | null;
};

const COMMON_NOTE =
  "위 항목은 일반적인 확인 포인트를 안내하는 1차 자가진단입니다. 실제 서류 내용과 상황에 따라 결과가 달라질 수 있어, 정확한 판단은 전문가 검토를 통해 확정됩니다. 간단한 내용은 무료 1차 상담으로도 확인 가능합니다.";

type FileKind = "none" | "image" | "document" | "other";

function getFileKind(fileName: string | null): FileKind {
  if (!fileName) return "none";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png"].includes(ext)) return "image";
  if (["pdf", "doc", "docx"].includes(ext)) return "document";
  return "other";
}

function bumpRisk(base: "low" | "medium" | "high"): "low" | "medium" | "high" {
  if (base === "low") return "medium";
  if (base === "medium") return "high";
  return "high";
}

// 카테고리별 정적 베이스 데이터 — 서류 첨부 여부와 무관하게 항상 확인해야
// 하는 항목들. 실제 판단이 필요한 부분(위험도, 확인가능 여부, 안내문구)은
// buildDiagnosis()에서 입력값에 따라 동적으로 조합한다.
type CategoryBase = {
  headline: string;
  hookLabel: string;
  baseRisk: "low" | "medium" | "high";
  checklistTemplate: DiagnosisCheckItem[];
  summaryNoFile: string;
  summaryWithFile: string;
  rejectionRisksTemplate: string[]; // 순서대로 rank 부여 (서류 없으면 1순위 앞에 삽입)
  recommendedStepsWithFile: string[];
  recommendedStepsNoFile: string[];
};

const CATEGORY_BASE: Record<VerifyCategory, CategoryBase> = {
  admin: {
    headline: "행정문서, 이 부분들을 함께 확인해보세요",
    hookLabel: "잘못 제출하면 반려·재접수",
    baseRisk: "medium",
    checklistTemplate: [
      { id: "expiry", label: "서류 유효기간이 지나지 않았는지", level: "warning" },
      { id: "identity", label: "인적사항(성명·여권번호 등)이 실제 서류와 정확히 일치하는지", level: "critical" },
      { id: "attachments", label: "필수 첨부서류(공증본 등)가 누락되지 않았는지", level: "warning" },
      { id: "deadline", label: "제출·처리 기한이 임박하지 않았는지", level: "critical" },
    ],
    summaryNoFile: "행정문서 검토 요청(서류 미첨부). 유효기간·인적사항 일치·첨부서류·제출기한을 우선 확인할 것 — 서류 확보 전까지는 일반 안내 수준만 가능.",
    summaryWithFile: "행정문서 검토 요청(서류 첨부됨). 유효기간·인적사항 일치 여부·필수 첨부서류·제출기한을 원문 기준으로 확인할 것.",
    rejectionRisksTemplate: [
      "인적사항 불일치(여권 정보와 서류 정보 상이)",
      "처리기한 초과로 인한 반려·가산 불이익",
      "공증본 등 필수 첨부서류 누락",
    ],
    recommendedStepsWithFile: [
      "원문에서 인적사항·유효기간·기한을 우선 대조",
      "불일치 또는 기한 임박 확인 시 우선순위 상담으로 전환",
    ],
    recommendedStepsNoFile: [
      "서류 사진/PDF 확보 요청 (카카오톡/잘로 안내)",
      "서류 확보 전까지는 일반적 주의사항만 안내",
    ],
  },
  "real-estate": {
    headline: "계약서, 이 부분들을 함께 확인해보세요",
    hookLabel: "보증금 미반환 주의",
    baseRisk: "medium",
    checklistTemplate: [
      { id: "deposit", label: "보증금 반환 조항이 명확히 명시되어 있는지", level: "critical" },
      { id: "penalty", label: "위약금·중도해지 조항이 과도하게 불리하지 않은지", level: "warning" },
      { id: "owner", label: "임대인이 실제 소유자(또는 적법한 대리인)가 맞는지", level: "critical" },
      { id: "notarize", label: "계약서 공증 여부", level: "info" },
    ],
    summaryNoFile: "임대·매매 계약서 검토 요청(서류 미첨부). 계약서 원문 없이는 보증금 반환 조항·소유권 확인이 불가능 — 서류 확보가 최우선.",
    summaryWithFile: "임대·매매 계약서 검토 요청(서류 첨부됨). 보증금 반환 조항, 소유권 증빙, 불리한 특약 여부를 원문 기준으로 확인할 것.",
    rejectionRisksTemplate: [
      "임대인이 실제 소유자·적법 대리인이 아닐 가능성",
      "보증금 반환 조항 누락 또는 모호한 문구",
      "일방에게 불리한 위약금·중도해지 조항",
    ],
    recommendedStepsWithFile: [
      "등기부·소유증명과 계약 당사자 일치 여부 우선 확인",
      "임대인 자격 또는 보증금 조항에 문제 발견 시 계약 전 상담 전환",
    ],
    recommendedStepsNoFile: [
      "계약서 서명 전, 계약서 사진/PDF 확보 요청",
      "서명 완료된 경우 사본이라도 즉시 확보 요청",
    ],
  },
  fraud: {
    headline: "이 제안서, 이 부분들을 먼저 확인해보세요",
    hookLabel: "투자사기 사전탐지",
    baseRisk: "high",
    checklistTemplate: [
      { id: "issuer", label: "발신처(회사명·기관명)가 실제로 존재하고 등록된 곳인지", level: "critical" },
      { id: "returns", label: "수익률·조건이 비정상적으로 좋게 제시되지 않았는지", level: "critical" },
      { id: "account", label: "송금 계좌 명의가 서류상 회사명과 일치하는지", level: "critical" },
      { id: "liability", label: "법적 책임 소재가 불분명한 조항이 없는지", level: "warning" },
    ],
    summaryNoFile: "투자·거래 제안서 검토 요청(서류 미첨부). 송금 임박 가능성이 있는 카테고리이므로, 서류 없이도 즉시 연락해 상황부터 파악할 것.",
    summaryWithFile: "투자·거래 제안서 검토 요청(서류 첨부됨). 발신처 실재 여부, 비정상 수익률, 계좌 명의 불일치를 최우선 확인 — 송금 임박 가능성 고려.",
    rejectionRisksTemplate: [
      "송금 계좌 명의와 서류상 회사명·담당자명 불일치",
      "발신처(회사명·사업자등록번호) 실재 여부 불확실",
      "시장 대비 비정상적으로 높은 수익률 제시",
    ],
    recommendedStepsWithFile: [
      "critical 항목 1개 이상 해당 시 최우선 순위로 즉시 상담 배정",
      "송금 여부·송금 예정일부터 먼저 확인",
    ],
    recommendedStepsNoFile: [
      "서류 유무와 무관하게 최우선 순위로 즉시 연락",
      "아직 송금 전인지부터 먼저 확인 (송금 임박 시 최우선 대응)",
    ],
  },
  tax: {
    headline: "세무 서류, 이 부분들을 함께 확인해보세요",
    hookLabel: "계좌동결 위험",
    baseRisk: "medium",
    checklistTemplate: [
      { id: "basis", label: "고지 금액과 근거 법령이 명시되어 있는지", level: "warning" },
      { id: "deadline", label: "납부·이의신청 기한이 언제까지인지", level: "critical" },
      { id: "identity", label: "사업자등록번호·명의가 정확히 일치하는지", level: "warning" },
      { id: "penalty", label: "가산세 발생 가능성이 있는지", level: "critical" },
    ],
    summaryNoFile: "세무 통지서·신고서류 검토 요청(서류 미첨부). 기한 관련 위험이 큰 카테고리이므로, 서류가 없더라도 수령 날짜와 기한부터 먼저 확인할 것.",
    summaryWithFile: "세무 통지서·신고서류 검토 요청(서류 첨부됨). 근거 법령, 납부기한, 사업자 명의 일치 여부를 원문 기준으로 확인할 것.",
    rejectionRisksTemplate: [
      "납부·이의신청 기한 임박 또는 경과",
      "가산세·계좌동결 등 후속 조치 가능성",
      "사업자등록번호·명의 불일치",
    ],
    recommendedStepsWithFile: [
      "기한 임박 또는 경과 확인 시 최우선 상담 배정",
      "고지 근거 법령·세목 명시 여부 확인",
    ],
    recommendedStepsNoFile: [
      "서류를 받은 날짜와 명시된 기한부터 먼저 확인",
      "서류 사진/PDF 확보 요청",
    ],
  },
  unclear: {
    headline: "이 서류, 이 부분부터 확인해보세요",
    hookLabel: "기한 놓치면 위험",
    baseRisk: "high",
    checklistTemplate: [
      { id: "issuer-type", label: "발신 기관이 정부·공공기관인지 민간인지 구분", level: "warning" },
      { id: "action-required", label: "납부·제출·출석 등 요구되는 조치가 있는지", level: "critical" },
      { id: "deadline", label: "응답·제출 기한이 있는지", level: "critical" },
      { id: "consequence", label: "무시했을 때 불이익 가능성이 있는지", level: "warning" },
    ],
    summaryNoFile: "출처 불명 서류 검토 요청(서류 미첨부). 서류 원문 없이는 발신기관 성격조차 판단 불가 — 서류 확보가 최우선.",
    summaryWithFile: "출처 불명 서류 검토 요청(서류 첨부됨). 발신기관 성격, 요구 조치, 응답기한을 파악해 카테고리 재분류할 것.",
    rejectionRisksTemplate: [
      "정부기관 서류를 민간 서류로 오인해 기한을 놓칠 가능성",
      "요구되는 조치(납부/제출/출석)를 파악하지 못해 불이익 발생",
    ],
    recommendedStepsWithFile: [
      "발신기관·조치내용 파악 후 적절한 카테고리(행정/세무/부동산 등)로 재라우팅",
      "기한이 확인되면 즉시 우선순위 조정",
    ],
    recommendedStepsNoFile: [
      "서류 사진/PDF 확보가 최우선 — 확보 전까지 카테고리 판단 불가",
      "서류를 어디서 받았는지(우편/방문/이메일 등) 확인",
    ],
  },
};

function buildDiagnosis(category: VerifyCategory, input: DiagnosisInput): DiagnosisResult {
  const base = CATEGORY_BASE[category];
  const fileKind = getFileKind(input.fileName);
  const hasFile = !!input.fileUrl && fileKind !== "none";

  // --- 고객용 체크리스트 (기존 항목 유지 + 입력값 기반 항목 추가) ---
  const checklist: DiagnosisCheckItem[] = [...base.checklistTemplate];

  if (!hasFile) {
    checklist.unshift({
      id: "document-missing",
      label: "서류가 아직 첨부되지 않았습니다 — 첨부 시 더 정확한 확인이 가능합니다",
      level: "critical",
    });
  } else if (fileKind === "image") {
    checklist.push({
      id: "image-quality",
      label: "사진으로 첨부된 경우 글자가 잘리거나 흐리면 판독이 어려울 수 있습니다",
      level: "info",
    });
  } else if (fileKind === "document") {
    checklist.push({
      id: "document-ready",
      label: "문서 파일로 접수되어 전문가가 원문을 바로 확인할 수 있습니다",
      level: "info",
    });
  }

  // --- 위험도 계산 ---
  const riskLevel = hasFile ? base.baseRisk : bumpRisk(base.baseRisk);

  // --- 전문가용 확인 항목 (checkedItems) ---
  const checkedItems: ExpertCheckedItem[] = base.checklistTemplate.map((item) => ({
    id: item.id,
    label: item.label,
    passed: hasFile, // 서류가 있어야 실제 확인이 가능하다는 의미
    reason: hasFile
      ? "첨부된 서류 원문 기준으로 확인 필요 (자동판독 아님, 전문가 육안 확인)"
      : "서류 미첨부로 확인 불가 — 고객에게 서류 요청 필요",
  }));

  // --- 반려/위험 요인 (rejectionRisks) ---
  const rejectionRisks: ExpertRejectionRisk[] = [];
  let rank = 1;
  if (!hasFile) {
    rejectionRisks.push({ reason: "서류 미첨부로 정확한 진단 자체가 불가능한 상태", rank: rank++ });
  }
  base.rejectionRisksTemplate.forEach((reason) => {
    rejectionRisks.push({ reason, rank: rank++ });
  });

  // --- 권장 조치 ---
  const recommendedSteps = hasFile ? base.recommendedStepsWithFile : base.recommendedStepsNoFile;

  const expertBrief: ExpertBrief = {
    summary: hasFile ? base.summaryWithFile : base.summaryNoFile,
    riskLevel,
    checkedItems,
    rejectionRisks,
    recommendedSteps,
    similarCases: [], // 실제 사례 데이터(case_records) 없이는 항상 빈 배열
  };

  return {
    headline: base.headline,
    checklist,
    note: COMMON_NOTE,
    expertBrief,
  };
}

const DEFAULT_DIAGNOSIS: DiagnosisResult = {
  headline: "제출하신 내용을 확인했습니다",
  checklist: [],
  note: COMMON_NOTE,
  expertBrief: {
    summary: "카테고리 미확인 진단 요청.",
    riskLevel: "medium",
    checkedItems: [],
    rejectionRisks: [],
    recommendedSteps: ["담당자가 직접 서류를 확인 후 적절한 카테고리로 분류 필요."],
    similarCases: [],
  },
};

export async function getDiagnosis(
  category: VerifyCategory,
  input: { fileUrl: string | null; fileName: string | null }
): Promise<DiagnosisResult> {
  // TODO(다음 단계): input.fileUrl을 실제로 분석(OCR/비전 모델)하고,
  // VFBC 규칙엔진 + Supabase 법령·행정자료 테이블 조회 결과를 반영해
  // 서류 내용 자체에 근거한 맞춤 진단으로 확장. 현재는 서류 첨부
  // 여부·형식이라는 실제 입력값 기반의 규칙 진단 단계.
  if (!CATEGORY_BASE[category]) return DEFAULT_DIAGNOSIS;
  return buildDiagnosis(category, input);
}
