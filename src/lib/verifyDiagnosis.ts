// src/lib/verifyDiagnosis.ts
//
// VFBC VERIFY 엔진의 진단 로직을 담당하는 단일 진입점.
//
// [현재 단계] 카테고리별 정적 체크리스트를 반환합니다 (하드코딩).
// [다음 단계] 아래 getDiagnosis() 함수 "내부"만 교체하면 됩니다:
//   사용자 입력/첨부파일 → VFBC 규칙엔진 → Supabase 법령·행정자료 조회
//   → AI가 조회된 근거를 바탕으로 최종 설명 작성 → DiagnosisResult 형태로 반환
//
// 호출하는 쪽(각 verify 페이지)은 이 함수의 인터페이스(입력/출력 타입)에만
// 의존하므로, 내부 구현이 규칙엔진 기반으로 바뀌어도 페이지 코드는
// 수정할 필요가 없습니다. async 함수로 미리 설계된 것도 이 때문입니다
// (실제 DB 조회·AI 호출이 들어가도 호출부는 동일).

export type DiagnosisCheckItem = {
  id: string;
  label: string;
  level: "info" | "warning" | "critical";
};

// 전문가(관리자)용 상세 리포트 항목.
// 유저에게는 절대 노출하지 않으며, crm_activities.meta에 저장되어
// 전문가가 서류를 열어보기 전에 먼저 참고하는 "1차 정밀분석 초안" 용도.
// 지금은 카테고리별 정적 문구지만, 나중에 규칙엔진+AI로 교체되면
// 서류별로 실제 근거 조문·판단이유가 채워짐.
// [향후 확장] 이 리포트 자체를 "정밀 검토" 유료 상품으로 유저에게
// 직접 오픈하는 것도 가능 — 그때는 이 타입을 그대로 화면에 노출하면 됨.
export type ExpertFinding = {
  id: string;
  label: string;
  detail: string;
  level: "info" | "warning" | "critical";
};

export type ExpertBrief = {
  summary: string;
  findings: ExpertFinding[];
  recommendedAction: string;
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

const COMMON_NOTE =
  "위 항목은 일반적인 확인 포인트를 안내하는 1차 자가진단입니다. 실제 서류 내용과 상황에 따라 결과가 달라질 수 있어, 정확한 판단은 전문가 검토를 통해 확정됩니다. 간단한 내용은 무료 1차 상담으로도 확인 가능합니다.";

const STATIC_DIAGNOSES: Record<VerifyCategory, DiagnosisResult> = {
  admin: {
    headline: "행정문서, 이 부분들을 함께 확인해보세요",
    checklist: [
      { id: "expiry", label: "서류 유효기간이 지나지 않았는지", level: "warning" },
      { id: "identity", label: "인적사항(성명·여권번호 등)이 실제 서류와 정확히 일치하는지", level: "critical" },
      { id: "attachments", label: "필수 첨부서류(공증본 등)가 누락되지 않았는지", level: "warning" },
      { id: "deadline", label: "제출·처리 기한이 임박하지 않았는지", level: "critical" },
    ],
    note: COMMON_NOTE,
    expertBrief: {
      summary:
        "행정문서 검토 요청. 유효기간·인적사항 일치 여부·필수 첨부서류·제출기한을 우선 확인할 것.",
      findings: [
        {
          id: "expiry",
          label: "유효기간",
          detail: "서류 발급일 기준 유효기간 경과 여부 확인 필요. 경과 시 재발급 절차 안내 우선.",
          level: "warning",
        },
        {
          id: "identity",
          label: "인적사항 일치",
          detail: "여권 인적사항 페이지와 서류상 성명·번호·생년월일 대조 필요.",
          level: "critical",
        },
        {
          id: "attachments",
          label: "첨부서류 완결성",
          detail: "공증본·번역본 등 부속서류 누락 여부, 관할기관 요구 목록과 대조 필요.",
          level: "warning",
        },
        {
          id: "deadline",
          label: "처리기한",
          detail: "기한 초과 시 위반 리스크 고지 및 긴급 처리 트랙으로 안내할지 판단 필요.",
          level: "critical",
        },
      ],
      recommendedAction:
        "인적사항 불일치 또는 기한 초과 확인 시 우선순위 상담으로 전환. 그 외에는 일반 검토 큐로 진행.",
    },
  },
  "real-estate": {
    headline: "계약서, 이 부분들을 함께 확인해보세요",
    checklist: [
      { id: "deposit", label: "보증금 반환 조항이 명확히 명시되어 있는지", level: "critical" },
      { id: "penalty", label: "위약금·중도해지 조항이 과도하게 불리하지 않은지", level: "warning" },
      { id: "owner", label: "임대인이 실제 소유자(또는 적법한 대리인)가 맞는지", level: "critical" },
      { id: "notarize", label: "계약서 공증 여부", level: "info" },
    ],
    note: COMMON_NOTE,
    expertBrief: {
      summary:
        "임대·매매 계약서 검토 요청. 보증금 반환 조항, 소유권 증빙, 불리한 특약 여부를 우선 확인할 것.",
      findings: [
        {
          id: "deposit",
          label: "보증금 반환 조항",
          detail: "반환 시기·조건·공제 사유가 구체적으로 명시되어 있는지, 모호한 문구 여부 확인.",
          level: "critical",
        },
        {
          id: "penalty",
          label: "위약금·중도해지",
          detail: "일방에게만 불리한 위약금 배율, 중도해지 시 통지기간 등 형평성 검토.",
          level: "warning",
        },
        {
          id: "owner",
          label: "임대인 자격",
          detail: "부동산 등기부·소유증명과 계약 당사자 일치 여부, 대리인인 경우 위임장 확인.",
          level: "critical",
        },
        {
          id: "notarize",
          label: "공증 여부",
          detail: "공증 미완료 시 법적 효력 관련 안내 필요 여부 판단.",
          level: "info",
        },
      ],
      recommendedAction:
        "임대인 자격 또는 보증금 반환 조항에 문제 소지 발견 시 계약 전 우선 상담으로 전환.",
    },
  },
  fraud: {
    headline: "이 제안서, 이 부분들을 먼저 확인해보세요",
    checklist: [
      { id: "issuer", label: "발신처(회사명·기관명)가 실제로 존재하고 등록된 곳인지", level: "critical" },
      { id: "returns", label: "수익률·조건이 비정상적으로 좋게 제시되지 않았는지", level: "critical" },
      { id: "account", label: "송금 계좌 명의가 서류상 회사명과 일치하는지", level: "critical" },
      { id: "liability", label: "법적 책임 소재가 불분명한 조항이 없는지", level: "warning" },
    ],
    note: COMMON_NOTE,
    expertBrief: {
      summary:
        "투자·거래 제안서 검토 요청. 발신처 실재 여부, 비정상 수익률, 계좌 명의 불일치를 최우선 확인할 것 — 송금 임박 가능성 고려.",
      findings: [
        {
          id: "issuer",
          label: "발신처 실재 여부",
          detail: "회사명·사업자등록번호 실재 여부 및 등록 상태 확인 필요.",
          level: "critical",
        },
        {
          id: "returns",
          label: "수익률 비정상성",
          detail: "제시된 수익률·조건이 시장 대비 비정상적으로 높은지 판단.",
          level: "critical",
        },
        {
          id: "account",
          label: "계좌 명의 불일치",
          detail: "송금 요청 계좌 명의와 서류상 회사명·담당자명 불일치 여부 확인.",
          level: "critical",
        },
        {
          id: "liability",
          label: "책임소재 불명확",
          detail: "분쟁 시 책임 소재를 회피하는 조항 여부 검토.",
          level: "warning",
        },
      ],
      recommendedAction:
        "critical 항목 1개 이상 해당 시 최우선 순위로 즉시 상담 배정. 송금 여부 확인이 시급하므로 빠른 연락 필요.",
    },
  },
  tax: {
    headline: "세무 서류, 이 부분들을 함께 확인해보세요",
    checklist: [
      { id: "basis", label: "고지 금액과 근거 법령이 명시되어 있는지", level: "warning" },
      { id: "deadline", label: "납부·이의신청 기한이 언제까지인지", level: "critical" },
      { id: "identity", label: "사업자등록번호·명의가 정확히 일치하는지", level: "warning" },
      { id: "penalty", label: "가산세 발생 가능성이 있는지", level: "critical" },
    ],
    note: COMMON_NOTE,
    expertBrief: {
      summary:
        "세무 통지서·신고서류 검토 요청. 근거 법령, 납부기한, 사업자 명의 일치 여부를 우선 확인할 것.",
      findings: [
        {
          id: "basis",
          label: "고지 근거",
          detail: "고지 금액 산출 근거 법령·세목이 명확히 기재되어 있는지 확인.",
          level: "warning",
        },
        {
          id: "deadline",
          label: "납부·이의신청 기한",
          detail: "기한 임박 또는 경과 여부, 가산세 기산일 확인 필요.",
          level: "critical",
        },
        {
          id: "identity",
          label: "명의 일치",
          detail: "사업자등록번호·상호와 고지서 기재 내용 일치 여부 확인.",
          level: "warning",
        },
        {
          id: "penalty",
          label: "가산세 리스크",
          detail: "미대응 시 가산세·계좌동결 등 후속 조치 가능성 판단.",
          level: "critical",
        },
      ],
      recommendedAction:
        "기한 임박 또는 경과 확인 시 최우선 상담 배정. 그 외에는 일반 검토 큐로 진행.",
    },
  },
  unclear: {
    headline: "이 서류, 이 부분부터 확인해보세요",
    checklist: [
      { id: "issuer-type", label: "발신 기관이 정부·공공기관인지 민간인지 구분", level: "warning" },
      { id: "action-required", label: "납부·제출·출석 등 요구되는 조치가 있는지", level: "critical" },
      { id: "deadline", label: "응답·제출 기한이 있는지", level: "critical" },
      { id: "consequence", label: "무시했을 때 불이익 가능성이 있는지", level: "warning" },
    ],
    note: COMMON_NOTE,
    expertBrief: {
      summary:
        "출처 불명 서류 검토 요청. 발신기관 성격, 요구 조치, 응답기한을 우선 파악해 카테고리 재분류할 것.",
      findings: [
        {
          id: "issuer-type",
          label: "발신기관 성격",
          detail: "정부·공공기관 여부 판별 — 확인되면 행정/세무 등 해당 카테고리로 재분류 검토.",
          level: "warning",
        },
        {
          id: "action-required",
          label: "요구 조치",
          detail: "납부·제출·출석 등 구체적으로 요구되는 조치 파악.",
          level: "critical",
        },
        {
          id: "deadline",
          label: "응답기한",
          detail: "명시된 기한 유무 및 임박 여부 확인.",
          level: "critical",
        },
        {
          id: "consequence",
          label: "불이익 가능성",
          detail: "미대응 시 발생 가능한 불이익 수준 판단.",
          level: "warning",
        },
      ],
      recommendedAction:
        "발신기관·조치내용 파악 후 적절한 카테고리(행정/세무/부동산 등)로 재라우팅하거나 직접 상담 배정.",
    },
  },
};

const DEFAULT_DIAGNOSIS: DiagnosisResult = {
  headline: "제출하신 내용을 확인했습니다",
  checklist: [],
  note: COMMON_NOTE,
  expertBrief: {
    summary: "카테고리 미확인 진단 요청.",
    findings: [],
    recommendedAction: "담당자가 직접 서류를 확인 후 적절한 카테고리로 분류 필요.",
  },
};

export async function getDiagnosis(
  category: VerifyCategory,
  _input: { fileUrl: string | null; fileName: string | null }
): Promise<DiagnosisResult> {
  // TODO(다음 단계): _input.fileUrl을 실제로 분석(OCR/비전 모델)하고,
  // VFBC 규칙엔진 + Supabase 법령·행정자료 테이블 조회 결과를 반영해
  // 카테고리 고정 체크리스트가 아닌, 서류별 맞춤 진단을 반환하도록 교체.
  return STATIC_DIAGNOSES[category] ?? DEFAULT_DIAGNOSIS;
}
