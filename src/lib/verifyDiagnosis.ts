// src/lib/verifyDiagnosis.ts
//
// VFBCAI VERIFY 엔진의 진단 로직을 담당하는 단일 진입점.
//
// [v3 변경사항 — 이번 세션]
// 목적: VERIFY 표준 확장(사건유형 + 사건설명 입력 반영, 고객용 리포트 11항목 구조 추가)
//
// 원칙(지시서 기준):
// 1) OpenAI 등 실제 생성형 AI를 새로 연동하지 않는다 — 여전히 규칙 기반 진단.
// 2) incidentDescription(사건설명 자유 텍스트)은 "표시 용도"로만 사용한다.
//    - 리포트의 사건요약에 원문 그대로 인용
//    - expertBrief(expert_brief)에 원문 보존
//    - crm_activities.meta 저장용 데이터로 전달
//    - 내용을 키워드 분석하거나 법률적으로 판단하는 데 사용하지 않는다
// 3) 법 조항 번호·판례·행정기관 실무를 구체적으로 임의 생성하지 않는다.
//    항상 "가능성이 있습니다 / 추가 확인이 필요합니다" 톤을 유지한다.
// 4) 기존 필드(headline/checklist/note/expertBrief)는 삭제·개명하지 않고 그대로 유지한다.
//    새 필드는 모두 optional로 추가해 기존 5개 VERIFY 페이지(아직 미수정 상태)의
//    getDiagnosis() 호출이 깨지지 않도록 한다.
// 5) [v3.1] "적용 가능성이 있는 법률 분야"와 "법률 적용 가능성 설명"은
//    서로 다른 항목(4번/5번)이므로 legalAreas와 legalApplicabilityNote로 분리한다.
//    legalAreas에 설명 문구를 섞지 않는다.
//
// [v2 변경사항 — 2026.7.17]
// 기존: 카테고리별 완전 고정 체크리스트/expertBrief (하드코딩, 입력값 무관)
// 변경: 실제 사용 가능한 입력값(서류 첨부 여부, 서류 형식)에 따라
//       고객용 체크리스트와 전문가용 expertBrief가 달라지는 규칙 기반 진단으로 개선.
//
// [필드명 주의] 각 verify 페이지의 handleExpertRequest()는
//   meta: { expert_brief: diagnosis.expertBrief }
// 형태로 저장한다 (스네이크케이스 expert_brief). CHECK 쪽 admin/cases는
// meta.expertBrief(카멜케이스)를 읽으므로 서로 다른 필드명이다 — 이번에도
// 이 규칙을 그대로 유지한다 (통합/개명하지 않음).

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
  // --- v3 추가 (optional, 기존 필드 삭제/개명 없음) ---
  // 고객이 STEP1에서 입력한 원문 정보를 전문가 화면에서도 그대로 확인할 수 있도록 보존.
  incidentType?: string;
  incidentDescription?: string;
};

// v3 추가: "적용 가능성이 있는 법률 분야" 항목 — 조항 번호 없이 분야명 + 짧은 안내문만 제공.
// 여기에는 "적용 가능성 설명"(항목 5)을 섞지 않는다 — 그건 legalApplicabilityNote로 분리.
export type LegalAreaNote = {
  area: string; // 예: "민법", "기업법", "투자법" 등 분야명만 (조항 번호 금지)
  note: string; // 해당 분야가 왜 관련될 수 있는지에 대한 짧은 맥락 (역시 단정 금지)
};

// v3 추가: 위험요인 분류 카드용 타입 — [치명적 위험]/[높은 위험]/[주의] 3단계.
export type RiskFactor = {
  level: "critical" | "high" | "caution";
  label: string;
};

// v3 추가: 고객 화면에 표시할 확장 리포트. 지시서 기준 11개 항목을 각각
// 별도 필드로 대응시킨다 (섞어서 합치지 않음).
//   1. 사건 요약               -> incidentSummary
//   2. 주요 발견사항           -> keyFindings
//   3. AI 분석 의견            -> analysisOpinion
//   4. 적용 가능성 있는 법률 분야 -> legalAreas
//   5. 법률 적용 가능성 설명    -> legalApplicabilityNote
//   6. 최신 법령 확인 필요 여부 -> legalUpdateNotice
//   7. 실무 행정 관행 안내     -> practiceNotes
//   8. 위험요인                -> riskFactors
//   9. 권장조치                -> recommendedActions
//   10. 전문가 검토 권장       -> expertReviewRecommendation
//   11. AI 한계 고지           -> aiLimitationNotice
// 5개 VERIFY 페이지가 전부 이 필드를 사용하도록 전환되기 전까지는 optional로 둔다.
export type CustomerReport = {
  incidentSummary: string;
  keyFindings: DiagnosisCheckItem[];
  analysisOpinion: string;
  legalAreas: LegalAreaNote[];
  legalApplicabilityNote: string;
  legalUpdateNotice: string;
  practiceNotes: string;
  riskFactors: RiskFactor[];
  recommendedActions: string[];
  expertReviewRecommendation: string;
  aiLimitationNotice: string;
};

export type DiagnosisResult = {
  headline: string;
  checklist: DiagnosisCheckItem[];
  note: string;
  expertBrief: ExpertBrief;
  // v3 추가 — optional. admin/page.tsx 등 신규 페이지에서만 사용,
  // 기존 페이지는 이 필드를 몰라도 정상 동작한다.
  report?: CustomerReport;
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
  // v3 추가 — optional. 기존 4개 페이지(아직 미전환)는 이 필드 없이 호출해도
  // 타입 에러가 나지 않는다.
  incidentType?: string;
  incidentDescription?: string;
};

const COMMON_NOTE =
  "위 항목은 일반적인 확인 포인트를 안내하는 1차 자가진단입니다. 실제 서류 내용과 상황에 따라 결과가 달라질 수 있어, 정확한 판단은 전문가 검토를 통해 확정됩니다. 간단한 내용은 무료 1차 상담으로도 확인 가능합니다.";

// v3 추가: AI 한계 고지 — 지시서 원문 톤을 그대로 반영한 고정 문구.
// 모든 카테고리 공통이며, 카테고리별로 달라지지 않는다.
const AI_LIMITATION_NOTICE =
  "본 결과는 고객이 입력한 내용, 제출한 자료 및 현재 확인 가능한 공개 법령·행정정보를 바탕으로 생성된 VFBCAI 1차 검토 결과입니다. 이 결과는 사건의 승패, 위법 여부, 형사책임 또는 최종 법률 결과를 확정적으로 판단하지 않습니다. 실제 사건은 계약서 원본, 추가 증거, 상대방 재산 상태, 내부 행정기록, 수사 및 재판 진행 상황 등에 따라 결과가 달라질 수 있습니다. 제출된 자료와 공개적으로 확인 가능한 정보만 검토할 수 있으며, 비공개 정보나 숨겨진 사실관계는 확인할 수 없습니다. 또한 동일한 사건이라도 담당 전문가의 경험, 증거 확보 능력, 대응 전략에 따라 결과가 크게 달라질 수 있습니다. 따라서 본 검토만으로 계약 체결, 지급, 신고, 소송 또는 기타 법적 조치를 결정하지 마시고, 반드시 전문가의 최종 검토를 받은 후 진행하시기 바랍니다.";

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

function riskLevelToFactorLevel(
  level: "low" | "medium" | "high"
): "critical" | "high" | "caution" {
  if (level === "high") return "critical";
  if (level === "medium") return "high";
  return "caution";
}

function checklistLevelToFactorLevel(
  level: "info" | "warning" | "critical"
): "critical" | "high" | "caution" {
  if (level === "critical") return "critical";
  if (level === "warning") return "high";
  return "caution";
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
  // v3 추가
  incidentTypes: string[];
  legalAreasTemplate: LegalAreaNote[];
  practiceNotesTemplate: string;
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
    incidentTypes: ["행정문서", "계약서", "법인·투자", "노동·고용", "인허가", "세무", "기타"],
    legalAreasTemplate: [
      { area: "행정법", note: "행정기관의 처리 절차 및 기한과 관련된 분야입니다." },
      { area: "기업법", note: "법인·인허가 관련 사항일 경우 함께 관련될 수 있는 분야입니다." },
    ],
    practiceNotesTemplate:
      "행정기관·지역(하노이·호치민 등)에 따라 요구서류나 처리 절차에 차이가 있을 수 있어, 정확한 실무 기준은 담당 지역 전문가 확인이 필요합니다.",
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
    incidentTypes: ["매매", "임대", "계약금", "소유권", "인허가", "분쟁", "기타"],
    legalAreasTemplate: [
      { area: "민법", note: "계약 성립·보증금 반환 관련 사항과 관련될 수 있는 분야입니다." },
      { area: "토지법·주택법", note: "소유권·부동산 인허가 관련 사항일 경우 함께 관련될 수 있는 분야입니다." },
    ],
    practiceNotesTemplate:
      "지역(하노이·호치민 등)이나 부동산 유형에 따라 계약·등기 실무 관행에 차이가 있을 수 있어, 정확한 실무 기준은 담당 지역 전문가 확인이 필요합니다.",
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
    incidentTypes: ["투자사기", "대출사기", "온라인거래사기", "결혼·연애사기", "사업제휴사기", "기타"],
    legalAreasTemplate: [
      { area: "형법", note: "사기 관련 사항일 경우 관련될 수 있는 분야입니다." },
      { area: "민법", note: "금전 반환·손해배상 관련 사항일 경우 관련될 수 있는 분야입니다." },
    ],
    practiceNotesTemplate:
      "사기 의심 사안은 신고·수사기관 협조 여부에 따라 대응 절차와 소요 기간이 크게 달라질 수 있어, 정확한 대응 방향은 전문가 확인이 필요합니다.",
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
    incidentTypes: ["세금고지서", "신고서류", "계좌동결통지", "가산세통지", "세무조사", "기타"],
    legalAreasTemplate: [
      { area: "세법", note: "고지·신고 관련 사항과 관련될 수 있는 분야입니다." },
      { area: "기업법", note: "사업자 명의·법인 관련 사항일 경우 함께 관련될 수 있는 분야입니다." },
    ],
    practiceNotesTemplate:
      "관할 세무기관이나 지역에 따라 처리 절차와 기한 계산 방식에 차이가 있을 수 있어, 정확한 실무 기준은 담당 지역 전문가 확인이 필요합니다.",
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
    incidentTypes: ["정부기관서류", "법원서류", "경찰서류", "회사서류", "개인간서류", "출처불명", "기타"],
    legalAreasTemplate: [
      { area: "행정법", note: "발신기관이 공공기관으로 확인될 경우 관련될 수 있는 분야입니다." },
      { area: "민법", note: "발신기관이 사인(私人)·민간기관으로 확인될 경우 관련될 수 있는 분야입니다." },
    ],
    practiceNotesTemplate:
      "서류의 발신기관과 성격이 확인되기 전까지는 실무 관행을 특정하기 어려우며, 확인 후 해당 분야 전문가 안내가 필요합니다.",
  },
};

function buildLegalUpdateNotice(): string {
  return "관련 법령 및 절차는 수시로 개정될 수 있습니다. 정확한 최신 기준은 전문가 확인을 통해 다시 한번 검토하시길 권장합니다.";
}

// 항목 5: "법률 적용 가능성 설명" — legalAreas(항목 4, 분야명+짧은 맥락)와는
// 별도로, "제출 정보 기준 / 가능성 있음 / 추가 확인 필요" 원칙 문장을 만든다.
// 법 조항 번호나 위반 여부를 단정하지 않는다.
function buildLegalApplicabilityNote(base: CategoryBase): string {
  const areaNames = base.legalAreasTemplate.map((a) => a.area).join(", ");
  return `제출된 사건유형과 자료를 기준으로 볼 때 ${areaNames} 등 관련 분야 법령이 검토 대상이 될 가능성이 있습니다. 정확한 적용 여부는 원본 자료와 최신 법령을 추가로 확인해야 하며, 최종 판단은 전문가 검토를 통해 이루어집니다.`;
}

function buildIncidentSummary(
  incidentType: string | undefined,
  incidentDescription: string | undefined
): string {
  const typeLine = incidentType
    ? `선택하신 사건유형: ${incidentType}`
    : "선택하신 사건유형: 미선택";
  const descLine = incidentDescription
    ? `입력하신 사건 설명:\n"${incidentDescription}"`
    : "입력하신 사건 설명이 없습니다.";
  return `${typeLine}\n\n${descLine}\n\n위 내용을 기준으로 한 VFBCAI 1차 검토 결과입니다. (해당 문구는 입력하신 내용을 그대로 표시한 것이며, AI가 내용을 해석·판단하지 않았습니다.)`;
}

function buildAnalysisOpinion(hasFile: boolean, hasDescription: boolean): string {
  const fileNote = hasFile
    ? "제출하신 자료를 함께 참고하여"
    : "아직 자료가 첨부되지 않은 상태로";
  const descNote = hasDescription
    ? "입력하신 사건유형과 설명을 기준으로 검토할 때,"
    : "입력하신 사건유형을 기준으로 검토할 때,";
  return `${descNote} ${fileNote} 관련 절차 및 서류에 대한 추가 확인이 필요할 가능성이 있습니다. 구체적인 판단은 원본 자료와 추가 정보 확인 후 전문가 검토를 통해 이루어집니다.`;
}

function buildDiagnosis(category: VerifyCategory, input: DiagnosisInput): DiagnosisResult {
  const base = CATEGORY_BASE[category];
  const fileKind = getFileKind(input.fileName);
  const hasFile = !!input.fileUrl && fileKind !== "none";
  const incidentType = input.incidentType?.trim() || undefined;
  const incidentDescription = input.incidentDescription?.trim() || undefined;

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
    incidentType,
    incidentDescription,
  };

  // --- v3: 고객용 확장 리포트 (11개 항목, 각각 별도 필드) ---
  const riskFactors: RiskFactor[] = checklist.map((item) => ({
    level: checklistLevelToFactorLevel(item.level),
    label: item.label,
  }));

  const report: CustomerReport = {
    incidentSummary: buildIncidentSummary(incidentType, incidentDescription), // 1
    keyFindings: checklist, // 2
    analysisOpinion: buildAnalysisOpinion(hasFile, !!incidentDescription), // 3
    legalAreas: base.legalAreasTemplate, // 4
    legalApplicabilityNote: buildLegalApplicabilityNote(base), // 5
    legalUpdateNotice: buildLegalUpdateNotice(), // 6
    practiceNotes: base.practiceNotesTemplate, // 7
    riskFactors, // 8
    recommendedActions: recommendedSteps, // 9
    expertReviewRecommendation: // 10
      riskLevelToFactorLevel(riskLevel) === "critical"
        ? "위험도가 높게 분류되어 전문가 검토를 우선 권장드립니다."
        : "간단한 내용은 무료 1차 상담으로도 확인 가능하며, 정확한 판단을 위해 전문가 검토를 권장드립니다.",
    aiLimitationNotice: AI_LIMITATION_NOTICE, // 11
  };

  return {
    headline: base.headline,
    checklist,
    note: COMMON_NOTE,
    expertBrief,
    report,
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

// v3 추가: 각 VERIFY 페이지에서 카테고리별 사건유형 옵션을 가져오기 위한 헬퍼.
// CATEGORY_BASE를 직접 export하지 않고 이 함수를 통해서만 노출한다
// (기존 CATEGORY_BASE 내부 구조를 페이지에서 직접 참조하지 않도록 캡슐화).
export function getIncidentTypes(category: VerifyCategory): string[] {
  return CATEGORY_BASE[category]?.incidentTypes ?? [];
}

export async function getDiagnosis(
  category: VerifyCategory,
  input: DiagnosisInput
): Promise<DiagnosisResult> {
  // TODO(다음 단계): input.fileUrl을 실제로 분석(OCR/비전 모델)하고,
  // VFBCAI 규칙엔진 + Supabase 법령·행정자료 테이블 조회 결과를 반영해
  // 서류 내용 자체에 근거한 맞춤 진단으로 확장. 현재는 서류 첨부
  // 여부·형식·사건유형·사건설명(표시 용도)이라는 실제 입력값 기반의
  // 규칙 진단 단계이며, 실제 생성형 AI 호출은 아직 연동하지 않는다.
  if (!CATEGORY_BASE[category]) return DEFAULT_DIAGNOSIS;
  return buildDiagnosis(category, input);
}
