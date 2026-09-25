import type { MasterCaseId } from "@/lib/adminVerifyProfiling";

export type KeyMetricSlot = { label: string; title: string };

/** Layer D — CASE별 4칸 카드 제목 (1차·2차 결과 공통). */
export const ADMIN_VERIFY_KEY_METRIC_MANIFEST: Partial<Record<MasterCaseId, KeyMetricSlot[]>> = {
  CASE_01: [
    { label: "01. 통지·상황", title: "통지 내용과 실제 상황" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 대응·자료", title: "대응 이력과 보유 자료" },
    { label: "04. 기한·사실관계", title: "기한·날짜·장소 정리" },
  ],
  CASE_02: [
    { label: "01. 납부 안내", title: "납부 요구 내용" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 납부·대응", title: "납부·기관 대응" },
    { label: "04. 기한·상황", title: "기한·상황 일치" },
  ],
  CASE_03: [
    { label: "01. 출석·소명", title: "기관 요구 내용" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 대응·자료", title: "대응 이력·자료" },
    { label: "04. 기한·사실", title: "기한·사실 관계" },
  ],
  CASE_04: [
    { label: "01. 보완 요구", title: "보완 요구 유형" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 제출·대응", title: "제출·대응 상태" },
    { label: "04. 기한·관계", title: "기한·제출 관계" },
  ],
  CASE_05: [
    { label: "01. 처분·통지", title: "처분·통지 유형" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 대응·자료", title: "대응·보유 자료" },
    { label: "04. 기한·사실", title: "기한·사실 관계" },
  ],
  CASE_06: [
    { label: "01. 문서 성격", title: "문서·안내 성격" },
    { label: "02. 확인 목표", title: "우선 확인 목표" },
    { label: "03. 요구·대응", title: "요구 조치·대응" },
    { label: "04. 기한·금액", title: "기한·금액 정리" },
  ],
};

/** keyMetrics footnote — 긴 choice label 축약 (Layer B). */
export function shortenKeyMetricFootnote(text: string, maxLen = 48): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1).trimEnd();
  return `${cut}…`;
}
